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

const generateTrackingId = () =>
  `TRK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const orderInclude = {
  items: {
    include: {
      product: true,
    },
  },
};

const createLog = (req, data) =>
  createActivityLog({
    adminId: req.user?.id,
    adminEmail: req.user?.email,
    ...data,
  });

const sendOrderEmail = async ({ to, subject, html }) => {
  try {
    await sendEmail({ to, subject, html });
  } catch (error) {
    console.error("Order email error:", error.message);
  }
};

const restoreOrderStock = async (tx, items) => {
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

exports.createOrder = async (req, res) => {
  try {
    const {
      customer,
      email,
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

    if (!customer || !email || !phone || !address) {
      return res.status(400).json({
        message: "Customer information is required",
      });
    }

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({
        message: "Order items are required",
      });
    }

    const normalizedItems = items.map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0),
    }));

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

      if (item.quantity < 1 || product.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.name} has only ${product.stock} item(s) left`,
        });
      }
    }

    const finalSubtotal =
      Number(subtotal) ||
      normalizedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

    const finalDiscount = Number(discountAmount || 0);
    const finalShipping = Number(shippingFee || 0);
    const finalTax = Number(taxAmount || 0);
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
          userId: req.user?.id || null,
          customer: customer.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          address: address.trim(),
          subtotal: finalSubtotal,
          discountAmount: finalDiscount,
          couponCode: normalizedCoupon,
          shippingFee: finalShipping,
          taxAmount: finalTax,
          taxPercentage: Number(taxPercentage || 0),
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
      ...stockAlerts.map(createNotification),
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
        to: email,
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
              <p><strong>Email:</strong> ${email}</p>
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

exports.getOrder = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: {
        trackingId: req.params.trackingId,
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

exports.getMyOrders = async (req, res) => {
  try {
    const email = req.params.email.trim().toLowerCase();

    const orders = await prisma.order.findMany({
      where: { email },
      include: orderInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load user orders",
      error: error.message,
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const order = await prisma.order.findUnique({
      where: { id },
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

exports.updateOrderStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
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

    const order = await prisma.$transaction(async (tx) => {
      if (status === "Cancelled" && existing.status !== "Cancelled") {
        await restoreOrderStock(tx, existing.items);
      }

      return tx.order.update({
        where: { id },
        data: { status },
      });
    });

    await createNotification({
      title: "Order Status Updated",
      message: `Order ${order.trackingId} status changed to ${status}.`,
      type: "ORDER",
    });

    await createLog(req, {
      action: "UPDATE_STATUS",
      entity: "ORDER",
      entityId: order.id,
      message: `Changed order ${order.trackingId} status from ${existing.status} to ${status}`,
    });

    await sendOrderEmail({
      to: order.email,
      subject: "Order Status Updated",
      html: `
        <h2>Order Status Updated</h2>
        <p>Hello ${order.customer},</p>
        <p><strong>Tracking ID:</strong> ${order.trackingId}</p>
        <p><strong>Status:</strong> ${status}</p>
      `,
    });

    res.json({
      success: true,
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

exports.cancelOrder = async (req, res) => {
  try {
    const id = Number(req.params.id);

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

    if (["Delivered", "Cancelled"].includes(existing.status)) {
      return res.status(400).json({
        message: "Delivered or cancelled orders cannot be cancelled",
      });
    }

    const order = await prisma.$transaction(async (tx) => {
      await restoreOrderStock(tx, existing.items);

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

    await createLog(req, {
      action: "CANCEL",
      entity: "ORDER",
      entityId: order.id,
      message: `Cancelled order ${order.trackingId}`,
    });

    res.json({
      success: true,
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