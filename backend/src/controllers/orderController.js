const prisma = require("../config/db");
const sendEmail = require("../utils/sendEmail");
const createNotification = require("../utils/createNotification");
const createActivityLog = require("../utils/createActivityLog");

const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const orderInclude = {
  items: {
    include: {
      product: true,
    },
  },
};

const generateTrackingId = () =>
  `TRK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const sendOrderEmail = async (options) => {
  try {
    await sendEmail(options);
  } catch (error) {
    console.error("Order email error:", error.message);
  }
};

const createLog = (req, data) =>
  createActivityLog({
    adminId: req.user?.id,
    adminEmail: req.user?.email,
    ...data,
  });

const restoreStock = async (tx, items) => {
  for (const item of items) {
    await tx.product.update({
      where: { id: item.productId },
      data: {
        stock: {
          increment: item.quantity,
        },
      },
    });
  }
};

// ==========================
// Create Order
// ==========================

exports.createOrder = async (req, res) => {
  try {
    const {
      customer,
      phone,
      address,
      subtotal,
      discountAmount = 0,
      couponCode,
      shippingFee = 0,
      taxAmount = 0,
      taxPercentage = 0,
      grandTotal,
      paymentMethod = "COD",
      items,
    } = req.body;

    if (!customer?.trim() || !phone?.trim() || !address?.trim()) {
      return res.status(400).json({
        message: "Customer information is required",
      });
    }

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({
        message: "Order items are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const normalizedItems = items.map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0),
    }));

    const invalidItem = normalizedItems.some(
      (item) =>
        !item.productId ||
        item.quantity < 1 ||
        !Number.isFinite(item.price) ||
        item.price < 0
    );

    if (invalidItem) {
      return res.status(400).json({
        message: "Invalid order items",
      });
    }

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: normalizedItems.map((item) => item.productId),
        },
      },
      select: {
        id: true,
        name: true,
        stock: true,
      },
    });

    for (const item of normalizedItems) {
      const product = products.find(
        (productItem) => productItem.id === item.productId
      );

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.name} has only ${product.stock} item(s) left`,
        });
      }
    }

    const calculatedSubtotal = normalizedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const finalSubtotal = Number(subtotal) || calculatedSubtotal;
    const finalDiscount = Math.max(Number(discountAmount || 0), 0);
    const finalShipping = Math.max(Number(shippingFee || 0), 0);
    const finalTax = Math.max(Number(taxAmount || 0), 0);
    const finalTotal =
      Number(grandTotal) ||
      finalSubtotal - finalDiscount + finalShipping + finalTax;

    const trackingId = generateTrackingId();
    const normalizedCoupon = couponCode?.trim().toUpperCase() || null;
    const stockAlerts = [];

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          trackingId,
          userId: user.id,
          customer: customer.trim(),
          email: user.email.toLowerCase(),
          phone: phone.trim(),
          address: address.trim(),
          subtotal: finalSubtotal,
          discountAmount: finalDiscount,
          couponCode: normalizedCoupon,
          shippingFee: finalShipping,
          taxAmount: finalTax,
          taxPercentage: Math.max(Number(taxPercentage || 0), 0),
          grandTotal: finalTotal,
          total: finalTotal,
          paymentMethod,
          items: {
            create: normalizedItems,
          },
        },
        include: orderInclude,
      });

      for (const item of normalizedItems) {
        const product = await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (product.stock === 0) {
          stockAlerts.push({
            title: "Out Of Stock",
            message: `${product.name} is now out of stock.`,
            type: "OUT_OF_STOCK",
          });
        } else if (product.stock <= 5) {
          stockAlerts.push({
            title: "Low Stock Alert",
            message: `${product.name} has only ${product.stock} item(s) remaining.`,
            type: "LOW_STOCK",
          });
        }
      }

      if (normalizedCoupon) {
        await tx.coupon.update({
          where: { code: normalizedCoupon },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });
      }

      return createdOrder;
    });

    await Promise.all([
      createNotification({
        title: "New Order Received",
        message: `Order ${trackingId} received from ${customer}. Total: Rs ${finalTotal}`,
        type: "ORDER",
      }),
      ...stockAlerts.map((alert) => createNotification(alert)),
    ]);

    const orderDetails = `
      <p><strong>Tracking ID:</strong> ${trackingId}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod}</p>
      <p><strong>Subtotal:</strong> Rs ${finalSubtotal}</p>
      <p><strong>Discount:</strong> Rs ${finalDiscount}</p>
      <p><strong>Shipping:</strong> Rs ${finalShipping}</p>
      <p><strong>Tax:</strong> Rs ${finalTax}</p>
      <p><strong>Total:</strong> Rs ${finalTotal}</p>
    `;

    await Promise.all([
      sendOrderEmail({
        to: user.email,
        subject: "Order Confirmation",
        html: `
          <h2>Thank You For Your Order</h2>
          <p>Hello <strong>${customer}</strong>, your order has been placed.</p>
          ${orderDetails}
        `,
      }),
      process.env.ADMIN_EMAIL
        ? sendOrderEmail({
            to: process.env.ADMIN_EMAIL,
            subject: "New Order Received",
            html: `
              <h2>New Order Received</h2>
              <p><strong>Customer:</strong> ${customer}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Address:</strong> ${address}</p>
              ${orderDetails}
            `,
          })
        : Promise.resolve(),
    ]);

    res.status(201).json({
      success: true,
      trackingId,
      order,
    });
  } catch (error) {
    console.error("Create order error:", error.message);

    res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// ==========================
// Public Tracking
// ==========================

exports.getOrder = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: {
        trackingId: req.params.trackingId,
      },
      select: {
        trackingId: true,
        status: true,
        createdAt: true,
        paymentMethod: true,
        paymentStatus: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: "Failed to track order",
      error: error.message,
    });
  }
};

// ==========================
// Customer Orders
// ==========================

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: Number(req.user.id),
      },
      include: orderInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load your orders",
      error: error.message,
    });
  }
};

exports.getMyOrderById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: Number(req.user.id),
      },
      include: orderInclude,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load order",
      error: error.message,
    });
  }
};

exports.cancelMyOrder = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const existing = await prisma.order.findFirst({
      where: {
        id,
        userId: Number(req.user.id),
      },
      include: {
        items: true,
      },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (["Delivered", "Cancelled"].includes(existing.status)) {
      return res.status(400).json({
        message: "Delivered or cancelled orders cannot be cancelled",
      });
    }

    const order = await prisma.$transaction(async (tx) => {
      await restoreStock(tx, existing.items);

      return tx.order.update({
        where: { id },
        data: {
          status: "Cancelled",
        },
      });
    });

    await createNotification({
      title: "Order Cancelled",
      message: `Order ${order.trackingId} has been cancelled.`,
      type: "ORDER",
    });

    res.json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error.message);

    res.status(500).json({
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

// ==========================
// Admin Orders
// ==========================

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: orderInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load orders",
      error: error.message,
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!id || !ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid order ID or status",
      });
    }

    const existing = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (existing.status === status) {
      return res.json({
        success: true,
        message: `Order is already ${status}`,
        order: existing,
      });
    }

    if (existing.status === "Cancelled") {
      return res.status(400).json({
        message: "Cancelled order status cannot be changed",
      });
    }

    const order = await prisma.$transaction(async (tx) => {
      if (status === "Cancelled") {
        await restoreStock(tx, existing.items);
      }

      return tx.order.update({
        where: { id },
        data: { status },
      });
    });

    await Promise.all([
      createNotification({
        title: "Order Status Updated",
        message: `Order ${order.trackingId} status changed to ${status}.`,
        type: "ORDER",
      }),
      createLog(req, {
        action: "UPDATE_STATUS",
        entity: "ORDER",
        entityId: order.id,
        message: `Changed order ${order.trackingId} from ${existing.status} to ${status}`,
      }),
      sendOrderEmail({
        to: order.email,
        subject: "Order Status Updated",
        html: `
          <h2>Order Status Updated</h2>
          <p>Hello ${order.customer},</p>
          <p><strong>Tracking ID:</strong> ${order.trackingId}</p>
          <p><strong>Status:</strong> ${status}</p>
        `,
      }),
    ]);

    res.json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error.message);

    res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [
      totalOrders,
      revenue,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
      }),
      prisma.order.count({ where: { status: "Pending" } }),
      prisma.order.count({ where: { status: "Processing" } }),
      prisma.order.count({ where: { status: "Shipped" } }),
      prisma.order.count({ where: { status: "Delivered" } }),
    ]);

    res.json({
      totalOrders,
      revenue: revenue._sum.total || 0,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load order statistics",
      error: error.message,
    });
  }
};