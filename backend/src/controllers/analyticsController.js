const prisma = require("../config/db");

exports.getDashboardAnalytics = async (req, res) => {
  try {
    const [
      totalOrders,
      totalUsers,
      totalProducts,
      totalReviews,
      orders,
      recentOrders,
      latestUsers,
      latestReviews,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.user.count(),
      prisma.product.count(),
      prisma.review.count(),

      prisma.order.findMany(),

      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),

      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),

      prisma.review.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              username: true,
              email: true,
            },
          },
          product: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    const orderStatusSummary = {
      Pending: orders.filter((o) => o.status === "Pending").length,
      Processing: orders.filter((o) => o.status === "Processing").length,
      Shipped: orders.filter((o) => o.status === "Shipped").length,
      Delivered: orders.filter((o) => o.status === "Delivered").length,
      Cancelled: orders.filter((o) => o.status === "Cancelled").length,
    };

    res.json({
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      totalReviews,
      orderStatusSummary,
      recentOrders,
      latestUsers,
      latestReviews,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load analytics",
      error: error.message,
    });
  }
};