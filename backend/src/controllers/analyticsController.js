const prisma = require("../config/db");

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

exports.getDashboardAnalytics = async (req, res) => {
  try {
    const [
      totalOrders,
      totalUsers,
      totalProducts,
      totalReviews,
      returnRequests,
      orders,
      recentOrders,
      latestUsers,
      latestReviews,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.user.count(),
      prisma.product.count(),
      prisma.review.count(),

      prisma.returnrequest.findMany({
        select: {
          status: true,
        },
      }),

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
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.user.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
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
        orderBy: {
          createdAt: "desc",
        },
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
      Pending: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };

    orders.forEach((order) => {
      if (orderStatusSummary[order.status] !== undefined) {
        orderStatusSummary[order.status] += 1;
      }
    });

    const returnSummary = {
      total: returnRequests.length,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    returnRequests.forEach((request) => {
      if (request.status === "Pending") returnSummary.pending += 1;
      if (request.status === "Approved") returnSummary.approved += 1;
      if (request.status === "Rejected") returnSummary.rejected += 1;
    });

    const monthlyRevenueMap = Object.fromEntries(
      MONTH_NAMES.map((month) => [month, 0])
    );

    orders.forEach((order) => {
      const month = MONTH_NAMES[new Date(order.createdAt).getMonth()];
      monthlyRevenueMap[month] += Number(order.total || 0);
    });

    const monthlyRevenue = MONTH_NAMES.map((month) => ({
      month,
      revenue: monthlyRevenueMap[month],
    }));

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    const getMonthRevenue = (month, year) =>
      orders
        .filter((order) => {
          const date = new Date(order.createdAt);

          return date.getMonth() === month && date.getFullYear() === year;
        })
        .reduce((sum, order) => sum + Number(order.total || 0), 0);

    const currentMonthRevenue = getMonthRevenue(currentMonth, currentYear);
    const lastMonthRevenue = getMonthRevenue(lastMonth, lastMonthYear);

    const revenueGrowth =
      lastMonthRevenue > 0
        ? Number(
            (
              ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) *
              100
            ).toFixed(1)
          )
        : currentMonthRevenue > 0
        ? 100
        : 0;

    const productSalesMap = {};

    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const productId = item.productId || item.product?.id;

        if (!productId) return;

        if (!productSalesMap[productId]) {
          productSalesMap[productId] = {
            productId,
            name: item.product?.name || `Product #${productId}`,
            image: item.product?.image || "",
            quantitySold: 0,
            revenue: 0,
          };
        }

        const quantity = Number(item.quantity || 0);

        productSalesMap[productId].quantitySold += quantity;
        productSalesMap[productId].revenue +=
          Number(item.price || 0) * quantity;
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
      returnSummary,
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
    console.error("Dashboard analytics error:", error.message);

    res.status(500).json({
      message: "Failed to load analytics",
      error: error.message,
    });
  }
};