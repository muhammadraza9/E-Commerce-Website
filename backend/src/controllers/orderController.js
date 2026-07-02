const prisma = require("../config/db");
const sendEmail = require("../utils/sendEmail");

// Create Order

exports.createOrder = async (req, res) => {
  try {
    const {
      customer,
      email,
      phone,
      address,
      total,
      paymentMethod,
      items,
    } = req.body;

    // userId comes from the verified token, not from the request body
    const userId = req.user?.id;

    const trackingId =
      "TRK-" +
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    const order = await prisma.order.create({
      data: {
        trackingId,
        userId,
        customer,
        email,
        phone,
        address,
        total,
        paymentMethod: paymentMethod || "COD",

        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },

      include: {
        items: true,
      },
    });

    // Send email to customer (BEFORE sending response)
    try {
      await sendEmail({
        to: email,
        subject: "Order Confirmation",
        html: `
          <div>
            <h2>Thank You For Your Order 🎉</h2>

            <p>Hello <strong>${customer}</strong></p>

            <p>Your order has been placed successfully.</p>

            <p><strong>Tracking ID:</strong> ${trackingId}</p>

            <p><strong>Payment Method:</strong> ${
              paymentMethod || "COD"
            }</p>

            <p><strong>Total:</strong> Rs ${total}</p>
          </div>
        `,
      });
      console.log("✅ Customer email sent for order:", trackingId);
    } catch (err) {
      console.error("❌ Customer Email Error:", err.message);
    }

    // Send email to admin (BEFORE sending response)
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: "New Order Received",
        html: `
          <div>
            <h2>New Order Received 🛒</h2>

            <p><strong>Customer:</strong> ${customer}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Address:</strong> ${address}</p>

            <p><strong>Tracking ID:</strong> ${trackingId}</p>

            <p><strong>Payment Method:</strong> ${
              paymentMethod || "COD"
            }</p>

            <p><strong>Total:</strong> Rs ${total}</p>
          </div>
        `,
      });
      console.log("✅ Admin email sent for order:", trackingId);
    } catch (err) {
      console.error("❌ Admin Email Error:", err.message);
    }

    // Send response AFTER emails are done
    res.status(201).json({
      success: true,
      trackingId,
      order,
    });
  } catch (err) {
    console.error("❌ Create Order Error:", err.message);

    res.status(500).json({
      error: err.message,
    });
  }
};

// Track Order

exports.getOrder = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: {
        trackingId: req.params.trackingId,
      },

      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(order);

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// Get All Orders

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(orders);

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// Update Order Status

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await prisma.order.update({
      where: {
        id: Number(req.params.id),
      },

      data: {
        status,
      },
    });

    // Send email BEFORE response here too, for consistency
    try {
      await sendEmail({
        to: order.email,
        subject: "Order Status Updated",

        html: `
          <div>
            <h2>Order Status Updated</h2>

            <p>Hello ${order.customer}</p>

            <p>Your order status has been updated.</p>

            <p>
              <strong>Tracking ID:</strong>
              ${order.trackingId}
            </p>

            <p>
              <strong>Status:</strong>
              ${status}
            </p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("❌ Status Update Email Error:", emailErr.message);
    }

    res.json({
      success: true,
      order,
    });

  } catch (err) {
    console.error("❌ Update Order Status Error:", err.message);

    res.status(500).json({
      error: err.message,
    });
  }
};

// Dashboard Stats

exports.getStats = async (req, res) => {
  try {
    const totalOrders = await prisma.order.count();

    const revenueData = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
    });

    const pendingOrders = await prisma.order.count({
      where: {
        status: "Pending",
      },
    });

    const processingOrders = await prisma.order.count({
      where: {
        status: "Processing",
      },
    });

    const shippedOrders = await prisma.order.count({
      where: {
        status: "Shipped",
      },
    });

    const deliveredOrders = await prisma.order.count({
      where: {
        status: "Delivered",
      },
    });

    res.json({
      totalOrders,
      revenue: revenueData._sum.total || 0,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
    });

  } catch (err) {
    console.error("❌ Stats Error:", err.message);

    res.status(500).json({
      error: err.message,
    });
  }
};

// User Order History

exports.getMyOrders = async (req, res) => {
  try {
    const { email } = req.params;

    const orders = await prisma.order.findMany({
      where: {
        email,
      },

      include: {
        items: {
          include: {
            product: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Get My Orders Error:", err.message);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(order);
  } catch (err) {
    console.error("❌ Get Order By Id Error:", err.message);

    res.status(500).json({
      error: err.message,
    });
  }
};

// Cancel Order

exports.cancelOrder = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (
      order.status === "Delivered" ||
      order.status === "Cancelled"
    ) {
      return res.status(400).json({
        message:
          "Delivered or Cancelled orders cannot be cancelled",
      });
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        status: "Cancelled",
      },
    });

    res.json({
      success: true,
      order: updatedOrder,
    });
  } catch (err) {
    console.error("❌ Cancel Order Error:", err.message);

    res.status(500).json({
      error: err.message,
    });
  }
};