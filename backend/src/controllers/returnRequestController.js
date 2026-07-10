const prisma = require("../config/db");
const sendEmail = require("../utils/sendEmail");
const createNotification = require("../utils/createNotification");
const createActivityLog = require("../utils/createActivityLog");

const VALID_STATUSES = ["Pending", "Approved", "Rejected"];

const sendSafeEmail = async (options) => {
  try {
    await sendEmail(options);
  } catch (error) {
    console.error("Return email error:", error.message);
  }
};

const createLog = (req, data) =>
  createActivityLog({
    adminId: req.user?.id,
    adminEmail: req.user?.email,
    ...data,
  });

exports.createReturnRequest = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const orderId = Number(req.body.orderId);
    const reason = req.body.reason?.trim();
    const message = req.body.message?.trim() || null;

    if (!orderId || !reason) {
      return res.status(400).json({
        message: "Order ID and reason are required",
      });
    }

    const [user, order, existing] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { username: true, email: true },
      }),
      prisma.order.findUnique({
        where: { id: orderId },
      }),
      prisma.returnrequest.findUnique({
        where: { orderId },
      }),
    ]);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.email.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(403).json({
        message: "You cannot return this order",
      });
    }

    if (order.status !== "Delivered") {
      return res.status(400).json({
        message: "Only delivered orders can be returned",
      });
    }

    if (existing) {
      return res.status(400).json({
        message: "Return request already submitted for this order",
      });
    }

    const request = await prisma.returnrequest.create({
      data: {
        orderId,
        customer: user.username,
        email: user.email.toLowerCase(),
        reason,
        message,
      },
    });

    await createNotification({
      title: "New Return Request",
      message: `${user.username} submitted a return request for order #${orderId}.`,
      type: "RETURN",
    });

    if (process.env.ADMIN_EMAIL) {
      await sendSafeEmail({
        to: process.env.ADMIN_EMAIL,
        subject: "New Return Request",
        html: `
          <h2>New Return Request</h2>
          <p><strong>Order ID:</strong> #${orderId}</p>
          <p><strong>Customer:</strong> ${user.username}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p><strong>Message:</strong> ${message || "N/A"}</p>
        `,
      });
    }

    res.status(201).json({
      success: true,
      message: "Return request submitted",
      request,
    });
  } catch (error) {
    console.error("Create return request error:", error.message);

    res.status(500).json({
      message: "Failed to submit return request",
      error: error.message,
    });
  }
};

exports.getReturnRequests = async (req, res) => {
  try {
    const requests = await prisma.returnrequest.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load return requests",
      error: error.message,
    });
  }
};

exports.getMyReturnRequests = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
      select: { email: true },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const requests = await prisma.returnrequest.findMany({
      where: { email: user.email.toLowerCase() },
      orderBy: { createdAt: "desc" },
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load return requests",
      error: error.message,
    });
  }
};

exports.updateReturnRequestStatus = async (req, res) => {
  try {
    const requestId = Number(req.params.id);
    const { status } = req.body;

    if (!requestId || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid request or status",
      });
    }

    const existing = await prisma.returnrequest.findUnique({
      where: { id: requestId },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Return request not found",
      });
    }

    if (existing.status === status) {
      return res.json({
        success: true,
        message: `Return request is already ${status}`,
        request: existing,
      });
    }

    const request = await prisma.$transaction(async (tx) => {
      if (status === "Approved" && !existing.stockRestored) {
        const order = await tx.order.findUnique({
          where: { id: existing.orderId },
          include: { items: true },
        });

        if (!order) {
          throw new Error("Order not found");
        }

        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      return tx.returnrequest.update({
        where: { id: requestId },
        data: {
          status,
          stockRestored:
            status === "Approved" ? true : existing.stockRestored,
        },
      });
    });

    await Promise.all([
      createNotification({
        title: "Return Request Updated",
        message: `Return request for order #${request.orderId} was ${status}.`,
        type: "RETURN",
      }),

      createLog(req, {
        action: "UPDATE_STATUS",
        entity: "RETURN_REQUEST",
        entityId: request.id,
        message: `Changed return request #${request.id} from ${existing.status} to ${status}`,
      }),

      sendSafeEmail({
        to: request.email,
        subject: "Return Request Status Updated",
        html: `
          <h2>Return Request Update</h2>
          <p>Hello <strong>${request.customer}</strong>,</p>
          <p>Your return request for order <strong>#${request.orderId}</strong> has been updated.</p>
          <p><strong>Status:</strong> ${request.status}</p>
        `,
      }),
    ]);

    res.json({
      success: true,
      message:
        status === "Approved"
          ? "Return approved and stock restored"
          : "Return request updated",
      request,
    });
  } catch (error) {
    console.error("Update return request error:", error.message);

    res.status(500).json({
      message: "Failed to update return request",
      error: error.message,
    });
  }
};

exports.deleteReturnRequest = async (req, res) => {
  try {
    const requestId = Number(req.params.id);

    if (!requestId) {
      return res.status(400).json({
        message: "Invalid return request ID",
      });
    }

    const request = await prisma.returnrequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return res.status(404).json({
        message: "Return request not found",
      });
    }

    await prisma.returnrequest.delete({
      where: { id: requestId },
    });

    await createLog(req, {
      action: "DELETE",
      entity: "RETURN_REQUEST",
      entityId: request.id,
      message: `Deleted return request #${request.id} for order #${request.orderId}`,
    });

    res.json({
      success: true,
      message: "Return request deleted",
    });
  } catch (error) {
    console.error("Delete return request error:", error.message);

    res.status(500).json({
      message: "Failed to delete return request",
      error: error.message,
    });
  }
};