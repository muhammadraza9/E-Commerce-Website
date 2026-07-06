const prisma = require("../config/db");

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

      prisma.order.findMany({
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      }),

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

    const monthlyRevenueMap = {};
    MONTH_NAMES.forEach((month) => {
      monthlyRevenueMap[month] = 0;
    });

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const month = MONTH_NAMES[date.getMonth()];
      monthlyRevenueMap[month] += Number(order.total || 0);
    });

    const monthlyRevenue = MONTH_NAMES.map((month) => ({
      month,
      revenue: monthlyRevenueMap[month] || 0,
    }));

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    const currentMonthRevenue = orders
      .filter((order) => {
        const date = new Date(order.createdAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, order) => sum + Number(order.total || 0), 0);

    const lastMonthRevenue = orders
      .filter((order) => {
        const date = new Date(order.createdAt);
        return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
      })
      .reduce((sum, order) => sum + Number(order.total || 0), 0);

    const revenueGrowth =
      lastMonthRevenue > 0
        ? Number((((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1))
        : currentMonthRevenue > 0
        ? 100
        : 0;

    const productSalesMap = {};

    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const productId = item.productId || item.product?.id;
        const productName = item.product?.name || `Product #${productId}`;
        const quantity = Number(item.quantity || 0);
        const revenue = Number(item.price || 0) * quantity;

        if (!productId) return;

        if (!productSalesMap[productId]) {
          productSalesMap[productId] = {
            productId,
            name: productName,
            quantitySold: 0,
            revenue: 0,
          };
        }

        productSalesMap[productId].quantitySold += quantity;
        productSalesMap[productId].revenue += revenue;
      });
    });

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    const customerMap = {};

    orders.forEach((order) => {
      const key = order.email || order.customer || `customer-${order.id}`;

      if (!customerMap[key]) {
        customerMap[key] = {
          customer: order.customer || "Customer",
          email: order.email || "N/A",
          totalOrders: 0,
          totalSpent: 0,
        };
      }

      customerMap[key].totalOrders += 1;
      customerMap[key].totalSpent += Number(order.total || 0);
    });

    const topCustomers = Object.values(customerMap)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    const recentPayments = recentOrders.map((order) => ({
      id: order.id,
      trackingId: order.trackingId,
      customer: order.customer,
      total: order.total,
      paymentMethod: order.paymentMethod || "COD",
      paymentStatus: order.paymentStatus || "PENDING",
      createdAt: order.createdAt,
    }));

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
      monthlyRevenue,
      revenueGrowth,
      currentMonthRevenue,
      lastMonthRevenue,
      topSellingProducts,
      topCustomers,
      recentPayments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load analytics",
      error: error.message,
    });
  }
};