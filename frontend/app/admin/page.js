"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const MONTHS = [
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

const formatCurrency = (value) => {
  return `Rs ${Number(value || 0).toLocaleString("en-PK")}`;
};

export default function AdminPage() {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalReviews: 0,
    revenueGrowth: 0,
    currentMonthRevenue: 0,
    lastMonthRevenue: 0,
    orderStatusSummary: {
      Pending: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    },
    recentOrders: [],
    latestUsers: [],
    latestReviews: [],
    monthlyRevenue: [],
    topSellingProducts: [],
    topCustomers: [],
    recentPayments: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/analytics/dashboard");

      setAnalytics((prev) => ({
        ...prev,
        ...res.data,
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const monthlyRevenueData = useMemo(() => {
    const backendData = analytics.monthlyRevenue || [];

    if (backendData.length > 0) {
      return MONTHS.map((month) => {
        const found = backendData.find((item) => item.month === month);

        return {
          month,
          revenue: Number(found?.revenue || 0),
        };
      });
    }

    return MONTHS.map((month) => ({
      month,
      revenue: 0,
    }));
  }, [analytics.monthlyRevenue]);

  const hasGraphData = monthlyRevenueData.some(
    (item) => Number(item.revenue) > 0
  );

  const statusCards = [
    {
      label: "Pending",
      value: analytics.orderStatusSummary?.Pending || 0,
      color: "text-yellow-400",
    },
    {
      label: "Processing",
      value: analytics.orderStatusSummary?.Processing || 0,
      color: "text-cyan-400",
    },
    {
      label: "Shipped",
      value: analytics.orderStatusSummary?.Shipped || 0,
      color: "text-blue-400",
    },
    {
      label: "Delivered",
      value: analytics.orderStatusSummary?.Delivered || 0,
      color: "text-green-400",
    },
    {
      label: "Cancelled",
      value: analytics.orderStatusSummary?.Cancelled || 0,
      color: "text-red-400",
    },
  ];

  if (loading) {
    return (
      <div className="px-6 py-20 text-center text-white">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <p className="text-[#D4AF37] text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2">
          Admin Panel
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Dash<span className="text-[#D4AF37]">board</span>
        </h1>

        <p className="text-gray-400 mt-2">
          Welcome to Style Avenue analytics center.
        </p>
      </div>

      <div className="grid lg:grid-cols-6 md:grid-cols-2 gap-5 mb-8">
        <Card
          title="Total Revenue"
          value={formatCurrency(analytics.totalRevenue)}
          color="text-[#D4AF37]"
        />

        <Card
          title="Revenue Growth"
          value={`${Number(analytics.revenueGrowth || 0)}%`}
          color={
            Number(analytics.revenueGrowth) >= 0
              ? "text-green-400"
              : "text-red-400"
          }
        />

        <Card
          title="Total Orders"
          value={analytics.totalOrders}
          color="text-white"
        />

        <Card
          title="Total Users"
          value={analytics.totalUsers}
          color="text-green-400"
        />

        <Card
          title="Products"
          value={analytics.totalProducts}
          color="text-blue-400"
        />

        <Card
          title="Reviews"
          value={analytics.totalReviews}
          color="text-yellow-400"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-8">
        <SmallCard
          title="Current Month Revenue"
          value={formatCurrency(analytics.currentMonthRevenue)}
          icon="📈"
        />

        <SmallCard
          title="Last Month Revenue"
          value={formatCurrency(analytics.lastMonthRevenue)}
          icon="📉"
        />
      </div>

      <div className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl p-6 mb-8 shadow-xl shadow-black/20">
        <h2 className="text-xl font-bold text-white mb-5">
          Order Status Summary
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statusCards.map((card) => (
            <div
              key={card.label}
              className="bg-[#071827] border border-[#D4AF37]/10 rounded-xl p-5"
            >
              <p className="text-gray-400 text-sm">{card.label}</p>

              <h3 className={`text-3xl font-bold mt-2 ${card.color}`}>
                {card.value}
              </h3>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <Section title="Recent Orders">
          {analytics.recentOrders?.length === 0 ? (
            <p className="text-gray-400">No recent orders found.</p>
          ) : (
            analytics.recentOrders?.map((order) => (
              <ListCard key={order.id}>
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="text-white font-semibold">
                      {order.trackingId}
                    </p>

                    <p className="text-gray-400 text-sm mt-1">
                      {order.customer}
                    </p>
                  </div>

                  <span className="text-[#D4AF37] font-bold">
                    {formatCurrency(order.total)}
                  </span>
                </div>

                <p className="text-gray-500 text-xs mt-2">
                  {new Date(order.createdAt).toLocaleDateString("en-PK")} •{" "}
                  {order.status}
                </p>
              </ListCard>
            ))
          )}
        </Section>

        <Section title="Latest Users">
          {analytics.latestUsers?.length === 0 ? (
            <p className="text-gray-400">No users found.</p>
          ) : (
            analytics.latestUsers?.map((user) => (
              <ListCard key={user.id}>
                <div className="flex justify-between items-center gap-3">
                  <div>
                    <p className="text-white font-semibold">{user.username}</p>

                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>

                  <span className="text-xs px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37]">
                    {user.role}
                  </span>
                </div>
              </ListCard>
            ))
          )}
        </Section>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <Section title="Top Selling Products">
          {analytics.topSellingProducts?.length === 0 ? (
            <p className="text-gray-400">
              No product sales yet. Place an order with products and this
              section will show data.
            </p>
          ) : (
            analytics.topSellingProducts?.map((product, index) => (
              <ListCard key={product.productId || index}>
                <div className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={product.image || "/placeholder-product.png"}
                      alt={product.name}
                      className="w-14 h-14 rounded-xl object-cover border border-[#D4AF37]/20 shrink-0"
                    />

                    <div className="min-w-0">
                      <p className="text-white font-semibold truncate">
                        #{index + 1} {product.name}
                      </p>

                      <p className="text-gray-400 text-sm">
                        Sold Quantity: {product.quantitySold}
                      </p>
                    </div>
                  </div>

                  <span className="text-[#D4AF37] font-bold whitespace-nowrap">
                    {formatCurrency(product.revenue)}
                  </span>
                </div>
              </ListCard>
            ))
          )}
        </Section>

        <Section title="Top Customers">
          {analytics.topCustomers?.length === 0 ? (
            <p className="text-gray-400">No customer data found.</p>
          ) : (
            analytics.topCustomers?.map((customer, index) => (
              <ListCard key={customer.email || index}>
                <div className="flex justify-between items-center gap-3">
                  <div>
                    <p className="text-white font-semibold">
                      👑 {customer.customer}
                    </p>

                    <p className="text-gray-400 text-sm">
                      {customer.email} • {customer.totalOrders} orders
                    </p>
                  </div>

                  <span className="text-green-400 font-bold">
                    {formatCurrency(customer.totalSpent)}
                  </span>
                </div>
              </ListCard>
            ))
          )}
        </Section>
      </div>

      <Section title="Recent Payments">
        {analytics.recentPayments?.length === 0 ? (
          <p className="text-gray-400">No payments found.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {analytics.recentPayments?.map((payment) => (
              <ListCard key={payment.id}>
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="text-white font-semibold">
                      {payment.trackingId}
                    </p>

                    <p className="text-gray-400 text-sm">
                      {payment.customer}
                    </p>

                    <p className="text-gray-500 text-xs mt-2">
                      {new Date(payment.createdAt).toLocaleDateString("en-PK")}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[#D4AF37] font-bold">
                      {formatCurrency(payment.total)}
                    </p>

                    <p className="text-gray-400 text-xs mt-1">
                      {payment.paymentMethod || "COD"}
                    </p>

                    <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37]">
                      {payment.paymentStatus || "PENDING"}
                    </span>
                  </div>
                </div>
              </ListCard>
            ))}
          </div>
        )}
      </Section>

      <div className="mt-8">
        <Section title="Latest Reviews">
          {analytics.latestReviews?.length === 0 ? (
            <p className="text-gray-400">No reviews found.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {analytics.latestReviews?.map((review) => (
                <ListCard key={review.id}>
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <div>
                      <p className="text-white font-semibold">
                        {review.user?.username || "User"}
                      </p>

                      <p className="text-gray-400 text-sm">
                        {review.product?.name || "Product"}
                      </p>
                    </div>

                    <p className="text-yellow-400">
                      {"★".repeat(review.rating)}
                      <span className="text-gray-600">
                        {"★".repeat(5 - review.rating)}
                      </span>
                    </p>
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">
                    {review.comment}
                  </p>

                  <p className="text-gray-500 text-xs mt-3">
                    {new Date(review.createdAt).toLocaleDateString("en-PK")}
                  </p>
                </ListCard>
              ))}
            </div>
          )}
        </Section>
      </div>

      <div className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl p-6 mt-8 shadow-xl shadow-black/20">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Sales Analytics</h2>

          <p className="text-gray-400 text-sm mt-1">
            Monthly revenue flow based on orders.
          </p>
        </div>

        <div className="h-80">
          {hasGraphData ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenueData}>
                <CartesianGrid stroke="rgba(212,175,55,0.12)" />

                <XAxis
                  dataKey="month"
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                />

                <YAxis
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  allowDecimals={false}
                />

                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "#071827",
                    border: "1px solid rgba(212,175,55,0.3)",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                  labelStyle={{
                    color: "#D4AF37",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#D4AF37"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                    fill: "#D4AF37",
                    stroke: "#071827",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 8,
                    fill: "#D4AF37",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <p className="text-5xl mb-3">📈</p>

                <p className="text-gray-400">
                  No revenue data yet. Complete an order to show the graph.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div className="bg-[#0B1F33] p-6 rounded-2xl border border-[#D4AF37]/20 shadow-xl shadow-black/20">
      <p className="text-gray-400 text-sm">{title}</p>

      <h2 className={`text-2xl sm:text-3xl font-bold mt-2 ${color}`}>
        {value}
      </h2>
    </div>
  );
}

function SmallCard({ title, value, icon }) {
  return (
    <div className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl p-5 shadow-xl shadow-black/20">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>

        <div>
          <p className="text-gray-400 text-sm">{title}</p>

          <h3 className="text-xl font-bold text-[#D4AF37] mt-1">{value}</h3>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl p-6 shadow-xl shadow-black/20">
      <h2 className="text-xl font-bold text-white mb-5">{title}</h2>

      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ListCard({ children }) {
  return (
    <div className="bg-[#071827] border border-[#D4AF37]/10 rounded-xl p-4">
      {children}
    </div>
  );
}