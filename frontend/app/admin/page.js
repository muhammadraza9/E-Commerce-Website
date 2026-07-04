"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";

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
        <div className="bg-[#0B1F33] p-6 rounded-2xl border border-[#D4AF37]/20 shadow-xl shadow-black/20">
          <p className="text-gray-400 text-sm">Total Revenue</p>
          <h2 className="text-2xl font-bold text-[#D4AF37] mt-2">
            Rs {analytics.totalRevenue}
          </h2>
        </div>

        <div className="bg-[#0B1F33] p-6 rounded-2xl border border-[#D4AF37]/20 shadow-xl shadow-black/20">
          <p className="text-gray-400 text-sm">Total Orders</p>
          <h2 className="text-3xl font-bold text-white mt-2">
            {analytics.totalOrders}
          </h2>
        </div>

        <div className="bg-[#0B1F33] p-6 rounded-2xl border border-[#D4AF37]/20 shadow-xl shadow-black/20">
          <p className="text-gray-400 text-sm">Total Users</p>
          <h2 className="text-3xl font-bold text-green-400 mt-2">
            {analytics.totalUsers}
          </h2>
        </div>

        <div className="bg-[#0B1F33] p-6 rounded-2xl border border-[#D4AF37]/20 shadow-xl shadow-black/20">
          <p className="text-gray-400 text-sm">Products</p>
          <h2 className="text-3xl font-bold text-blue-400 mt-2">
            {analytics.totalProducts}
          </h2>
        </div>

        <div className="bg-[#0B1F33] p-6 rounded-2xl border border-[#D4AF37]/20 shadow-xl shadow-black/20">
          <p className="text-gray-400 text-sm">Reviews</p>
          <h2 className="text-3xl font-bold text-yellow-400 mt-2">
            {analytics.totalReviews}
          </h2>
        </div>
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
        <div className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl p-6 shadow-xl shadow-black/20">
          <h2 className="text-xl font-bold text-white mb-5">
            Recent Orders
          </h2>

          {analytics.recentOrders?.length === 0 ? (
            <p className="text-gray-400">No recent orders found.</p>
          ) : (
            <div className="space-y-4">
              {analytics.recentOrders?.map((order) => (
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
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl p-6 shadow-xl shadow-black/20">
          <h2 className="text-xl font-bold text-white mb-5">
            Latest Users
          </h2>

          {analytics.latestUsers?.length === 0 ? (
            <p className="text-gray-400">No users found.</p>
          ) : (
            <div className="space-y-4">
              {analytics.latestUsers?.map((user) => (
                <div
                  key={user.id}
                  className="bg-[#071827] border border-[#D4AF37]/10 rounded-xl p-4 flex justify-between items-center gap-3"
                >
                  <div>
                    <p className="text-white font-semibold">
                      {user.username}
                    </p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>

                  <span className="text-xs px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37]">
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-2xl p-6 shadow-xl shadow-black/20">
        <h2 className="text-xl font-bold text-white mb-5">
          Latest Reviews
        </h2>

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
      </div>
    </div>
  );
}