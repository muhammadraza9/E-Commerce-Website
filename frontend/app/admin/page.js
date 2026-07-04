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

export default function AdminPage() {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalReviews: 0,
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
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/analytics/dashboard");
      setAnalytics(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const monthlyRevenueData = useMemo(() => {
    if (analytics.monthlyRevenue?.length > 0) {
      return analytics.monthlyRevenue;
    }

    const months = [
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

    const grouped = {};

    analytics.recentOrders?.forEach((order) => {
      const date = new Date(order.createdAt);
      const month = months[date.getMonth()];

      grouped[month] = (grouped[month] || 0) + Number(order.total || 0);
    });

    return months.map((month) => ({
      month,
      revenue: grouped[month] || 0,
    }));
  }, [analytics]);

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

      <div className="grid lg:grid-cols-5 md:grid-cols-2 gap-5 mb-8">
        <Card
          title="Total Revenue"
          value={`Rs ${analytics.totalRevenue}`}
          color="text-[#D4AF37]"
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
              <div
                key={order.id}
                className="bg-[#071827] border border-[#D4AF37]/10 rounded-xl p-4"
              >
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
                    Rs {order.total}
                  </span>
                </div>

                <p className="text-gray-500 text-xs mt-2">
                  {new Date(order.createdAt).toLocaleDateString("en-PK")} •{" "}
                  {order.status}
                </p>
              </div>
            ))
          )}
        </Section>

        <Section title="Latest Users">
          {analytics.latestUsers?.length === 0 ? (
            <p className="text-gray-400">No users found.</p>
          ) : (
            analytics.latestUsers?.map((user) => (
              <div
                key={user.id}
                className="bg-[#071827] border border-[#D4AF37]/10 rounded-xl p-4 flex justify-between items-center gap-3"
              >
                <div>
                  <p className="text-white font-semibold">{user.username}</p>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                </div>

                <span className="text-xs px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37]">
                  {user.role}
                </span>
              </div>
            ))
          )}
        </Section>
      </div>

      <Section title="Latest Reviews">
        {analytics.latestReviews?.length === 0 ? (
          <p className="text-gray-400">No reviews found.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {analytics.latestReviews?.map((review) => (
              <div
                key={review.id}
                className="bg-[#071827] border border-[#D4AF37]/10 rounded-xl p-4"
              >
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
              </div>
            ))}
          </div>
        )}
      </Section>

      <div className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl p-6 mt-8 shadow-xl shadow-black/20">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">
            Sales Analytics
          </h2>

          <p className="text-gray-400 text-sm mt-1">
            Monthly revenue flow based on orders.
          </p>
        </div>

        <div className="h-80">
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
              />

              <Tooltip
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

function Section({ title, children }) {
  return (
    <div className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl p-6 shadow-xl shadow-black/20">
      <h2 className="text-xl font-bold text-white mb-5">{title}</h2>

      <div className="space-y-4">{children}</div>
    </div>
  );
}