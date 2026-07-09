const prisma = require("../config/db");
const sendEmail = require("../utils/sendEmail");
const createNotification = require("../utils/createNotification");

const generateTrackingId = () => {
  return "TRK-" + Math.random().toString(36).substring(2, 8).toUpperCase();
};

const sendOrderEmails = async ({
  customer,
  email,
  phone,
  address,
  trackingId,
  paymentMethod,
  couponCode,
  subtotal,
  discountAmount,
  shippingFee,
  taxAmount,
  grandTotal,
}) => {
  const couponHtml = couponCode
    ? `<p><strong>Coupon:</strong> ${couponCode}</p>`
    : "";

  const orderHtml = `
    <div>
      <h2>Thank You For Your Order 🎉</h2>
      <p>Hello <strong>${customer}</strong></p>
      <p>Your order has been placed successfully.</p>
      <p><strong>Tracking ID:</strong> ${trackingId}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod || "COD"}</p>
      ${couponHtml}
      <p><strong>Subtotal:</strong> Rs ${subtotal}</p>
      <p><strong>Discount:</strong> Rs ${discountAmount}</p>
      <p><strong>Shipping:</strong> Rs ${shippingFee}</p>
      <p><strong>Tax:</strong> Rs ${taxAmount}</p>
      <p><strong>Total:</strong> Rs ${grandTotal}</p>
    </div>
  `;

  const adminHtml = `
    <div>
      <h2>New Order Received 🛒</h2>
      <p><strong>Customer:</strong> ${customer}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>Tracking ID:</strong> ${trackingId}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod || "COD"}</p>
      ${couponHtml}
      <p><strong>Subtotal:</strong> Rs ${subtotal}</p>
      <p><strong>Discount:</strong> Rs ${discountAmount}</p>
      <p><strong>Shipping:</strong> Rs ${shippingFee}</p>
      <p><strong>Tax:</strong> Rs ${taxAmount}</p>
      <p><strong>Total:</strong> Rs ${grandTotal}</p>
    </div>
  `;

  try {
    await sendEmail({
      to: email,
      subject: "Order Confirmation",
      html: orderHtml,
    });
  } catch (err) {
    console.error("Customer Email Error:", err.message);
  }

  try {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "New Order Received",
      html: adminHtml,
    });
  } catch (err) {
    console.error("Admin Email Error:", err.message);
  }
};

exports.createOrder = async (req, res) => {
  try {
    const {
      customer,
      email,
      phone,
      address,
      total,
      subtotal,
      discountAmount,
      couponCode,
      shippingFee,
      taxAmount,
      taxPercentage,
      grandTotal,
      paymentMethod,
      items,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    const userId = req.user?.id;
    const finalCouponCode = couponCode ? couponCode.trim().toUpperCase() : null;

    const finalSubtotal =
      Number(subtotal) ||
      items.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 1),
        0
      );

    const finalDiscountAmount = Number(discountAmount || 0);
    const finalShippingFee = Number(shippingFee || 0);
    const finalTaxAmount = Number(taxAmount || 0);
    const finalTaxPercentage = Number(taxPercentage || 0);

    const finalGrandTotal =
      Number(grandTotal) ||
      Number(total) ||
      finalSubtotal - finalDiscountAmount + finalShippingFee + finalTaxAmount;

    const productIds = items.map((item) => Number(item.productId));

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        stock: true,
      },
    });

    for (const item of items) {
      const product = products.find((p) => p.id === Number(item.productId));

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (Number(product.stock) < Number(item.quantity)) {
        return res.status(400).json({
          message: `${product.name} has only ${product.stock} item(s) left in stock`,
        });
      }
    }

    const trackingId = generateTrackingId();

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          trackingId,
          userId,
          customer,
          email,
          phone,
          address,
          subtotal: finalSubtotal,
          discountAmount: finalDiscountAmount,
          couponCode: finalCouponCode,
          shippingFee: finalShippingFee,
          taxAmount: finalTaxAmount,
          taxPercentage: finalTaxPercentage,
          grandTotal: finalGrandTotal,
          total: finalGrandTotal,
          paymentMethod: paymentMethod || "COD",
          items: {
            create: items.map((item) => ({
              productId: Number(item.productId),
              quantity: Number(item.quantity),
              price: Number(item.price),
            })),
          },
        },
        include: {
          items: true,
        },
      });

      for (const item of items) {
  const updatedProduct = await tx.product.update({
    where: {
      id: Number(item.productId),
    },
    data: {
      stock: {
        decrement: Number(item.quantity),
      },
    },
  });

  if (updatedProduct.stock === 0) {
    await createNotification({
      title: "Out Of Stock",
      message: `${updatedProduct.name} is now out of stock.`,
      type: "OUT_OF_STOCK",
    });
  } else if (updatedProduct.stock <= 5) {
    await createNotification({
      title: "Low Stock Alert",
      message: `${updatedProduct.name} has only ${updatedProduct.stock} item(s) remaining.`,
      type: "LOW_STOCK",
    });
  }
}

      if (finalCouponCode) {
        await tx.coupon.update({
          where: { code: finalCouponCode },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });
      }

      return createdOrder;
    });

    await createNotification({
      title: "New Order Received",
      message: `Order ${trackingId} received from ${customer}. Total: Rs ${finalGrandTotal}`,
      type: "ORDER",
    });

    await sendOrderEmails({
      customer,
      email,
      phone,
      address,
      trackingId,
      paymentMethod,
      couponCode: finalCouponCode,
      subtotal: finalSubtotal,
      discountAmount: finalDiscountAmount,
      shippingFee: finalShippingFee,
      taxAmount: finalTaxAmount,
      grandTotal: finalGrandTotal,
    });

    res.status(201).json({
      success: true,
      trackingId,
      order,
    });
  } catch (err) {
    console.error("Create Order Error:", err.message);

    res.status(500).json({
      error: err.message,
    });
  }
};

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
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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
    res.status(500).json({ error: err.message });
  }
};

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

    await createNotification({
      title: "Order Status Updated",
      message: `Order ${order.trackingId} status changed to ${status}.`,
      type: "ORDER",
    });

    try {
      await sendEmail({
        to: order.email,
        subject: "Order Status Updated",
        html: `
          <div>
            <h2>Order Status Updated</h2>
            <p>Hello ${order.customer}</p>
            <p>Your order status has been updated.</p>
            <p><strong>Tracking ID:</strong> ${order.trackingId}</p>
            <p><strong>Status:</strong> ${status}</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Status Update Email Error:", emailErr.message);
    }

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("Update Order Status Error:", err.message);

    res.status(500).json({
      error: err.message,
    });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalOrders = await prisma.order.count();

    const revenueData = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
    });

    const pendingOrders = await prisma.order.count({
      where: { status: "Pending" },
    });

    const processingOrders = await prisma.order.count({
      where: { status: "Processing" },
    });

    const shippedOrders = await prisma.order.count({
      where: { status: "Shipped" },
    });

    const deliveredOrders = await prisma.order.count({
      where: { status: "Delivered" },
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
    console.error("Stats Error:", err.message);

    res.status(500).json({
      error: err.message,
    });
  }
};

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
    console.error("Get My Orders Error:", err.message);

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
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error("Get Order By Id Error:", err.message);

    res.status(500).json({
      error: err.message,
    });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "Delivered" || order.status === "Cancelled") {
      return res.status(400).json({
        message: "Delivered or Cancelled orders cannot be cancelled",
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

    await createNotification({
      title: "Order Cancelled",
      message: `Order ${order.trackingId} has been cancelled.`,
      type: "ORDER",
    });

    res.json({
      success: true,
      order: updatedOrder,
    });
  } catch (err) {
    console.error("Cancel Order Error:", err.message);

    res.status(500).json({
      error: err.message,
    });
  }
};