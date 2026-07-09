const prisma = require("../config/db");
const sendEmail = require("../utils/sendEmail");
const createNotification = require("../utils/createNotification");

exports.createReturnRequest = async (req, res) => {
  try {
    const { orderId, customer, email, reason, message } = req.body;

    if (!orderId || !customer || !email || !reason) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const existing = await prisma.returnrequest.findFirst({
      where: {
        orderId: Number(orderId),
        email,
      },
    });

    if (existing) {
      return res.status(400).json({
        message: "Return request already submitted for this order",
      });
    }

    const request = await prisma.returnrequest.create({
      data: {
        orderId: Number(orderId),
        customer,
        email,
        reason,
        message: message || null,
      },
    });

    await createNotification({
      title: "New Return Request",
      message: `${customer} submitted a return request for order #${orderId}.`,
      type: "RETURN",
    });

    if (process.env.ADMIN_EMAIL) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: "New Return Request",
        html: `
          <h2>New Return Request</h2>
          <p><strong>Order ID:</strong> #${orderId}</p>
          <p><strong>Customer:</strong> ${customer}</p>
          <p><strong>Email:</strong> ${email}</p>
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
  } catch (err) {
    res.status(500).json({
      message: "Failed to submit return request",
      error: err.message,
    });
  }
};

exports.getReturnRequests = async (req, res) => {
  try {
    const requests = await prisma.returnrequest.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(requests);
  } catch (err) {
    res.status(500).json({
      message: "Failed to load return requests",
      error: err.message,
    });
  }
};

exports.getUserReturnRequests = async (req, res) => {
  try {
    const { email } = req.params;

    const requests = await prisma.returnrequest.findMany({
      where: {
        email,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(requests);
  } catch (err) {
    res.status(500).json({
      message: "Failed to load user return requests",
      error: err.message,
    });
  }
};

exports.updateReturnRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await prisma.returnrequest.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        status,
      },
    });

    await createNotification({
      title: "Return Request Updated",
      message: `Return request for order #${request.orderId} was ${status}.`,
      type: "RETURN",
    });

    await sendEmail({
      to: request.email,
      subject: "Return Request Status Updated",
      html: `
        <h2>Return Request Update</h2>
        <p>Hello <strong>${request.customer}</strong>,</p>
        <p>Your return request for order <strong>#${request.orderId}</strong> has been updated.</p>
        <p><strong>Status:</strong> ${status}</p>
      `,
    });

    res.json({
      success: true,
      message: "Return request updated",
      request,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update return request",
      error: err.message,
    });
  }
};

exports.deleteReturnRequest = async (req, res) => {
  try {
    await prisma.returnrequest.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    res.json({
      message: "Return request deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete return request",
      error: err.message,
    });
  }
};