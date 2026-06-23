"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchOrders(userData.email);
    }
  }, []);

  const fetchOrders = async (email) => {
    try {
      const res = await api.get(`/orders/user/${email}`);
      setOrders(res.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const getInitials = (name) =>
    (name || "U")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500";
      case "Processing":
        return "bg-blue-500";
      case "Shipped":
        return "bg-purple-500";
      case "Delivered":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20 text-lg">
        Please Login
      </div>
    );
  }

  const latestTrackingId =
    orders.length > 0 ? orders[0]?.trackingId : "";

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">

      {/* USER INFO CARD */}
      <div className="border border-slate-700 rounded-2xl p-8 mb-6">
        <div className="flex flex-col items-center gap-4 text-center">

          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: "3px solid #D4AF37",
            }}
            className="bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold text-2xl"
          >
            {getInitials(user?.username || user?.name)}
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              {user?.username || user?.name}
            </h1>

            <p className="text-gray-400 text-sm mt-1">
              {user?.email}
            </p>

            <span className="inline-block mt-3 text-xs px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37]">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* QUICK LINKS */}
      <div className="grid grid-cols-2 gap-4 mb-6">

        {/* MY ORDERS */}
        <Link
          href="/profile/my-orders"
          className="
            border border-slate-700
            rounded-2xl
            p-5
            flex items-center gap-3
            hover:border-[#D4AF37]
            hover:bg-[#D4AF37]/10
            hover:scale-105
            transition-all duration-300
          "
        >
          <span className="text-2xl">📦</span>

          <div>
            <p className="font-semibold text-sm">
              My Orders
            </p>

            <p className="text-gray-400 text-xs mt-0.5">
              Total Orders: {orders.length}
            </p>
          </div>
        </Link>

        {/* TRACK ORDER */}
        <Link
          href={
            latestTrackingId
              ? `/track-order?trackingId=${latestTrackingId}`
              : "/track-order"
          }
          className="
            border border-slate-700
            rounded-2xl
            p-5
            flex items-center gap-3
            hover:border-[#D4AF37]
            hover:bg-[#D4AF37]/10
            hover:scale-105
            transition-all duration-300
          "
        >
          <span className="text-2xl">🚚</span>

          <div>
            <p className="font-semibold text-sm">
              Track Order
            </p>

            <p className="text-gray-400 text-xs mt-0.5">
              Track your delivery
            </p>
          </div>
        </Link>
      </div>

      {/* RECENT ORDERS */}
      <div className="border border-slate-700 rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-6">
          Recent Orders
        </h2>

        {orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-400">
              No Orders Found
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() =>
                  router.push(`/profile/my-orders/${order.id}`)
                }
                className="
                  border border-slate-700
                  rounded-xl
                  p-5
                  hover:border-[#D4AF37]
                  hover:bg-[#D4AF37]/5
                  transition-all duration-300
                  cursor-pointer
                "
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">
                      {order.trackingId}
                    </p>

                    <p className="text-gray-400 text-sm mt-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`${getStatusColor(
                      order.status
                    )} px-3 py-1 rounded-full text-white text-xs font-medium`}
                  >
                    {order.status}
                  </span>
                </div>

                <p className="text-[#D4AF37] mt-3 font-semibold">
                  Rs {order.total}
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  Click to view order details →
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}