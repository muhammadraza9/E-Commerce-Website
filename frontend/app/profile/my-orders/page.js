"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import Link from "next/link";
import MyOrdersSkeleton from "@/components/skeletons/MyOrdersSkeleton";

export default function MyOrdersPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/signin");
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);
    fetchOrders(userData.email);
  }, [router]);

  const fetchOrders = async (email) => {
    try {
      const res = await api.get(`/orders/user/${email}`);
      setOrders(res.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (e, orderId) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmCancel) return;

    try {
      await api.put(`/orders/${orderId}/cancel`);

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: "Cancelled" } : order
        )
      );
    } catch (error) {
      console.log(error);
      alert("Unable to cancel order");
    }
  };

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
      case "Cancelled":
        return "bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  const getTotalQuantity = (items) =>
    items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  const filters = [
    "All",
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const filteredOrders = useMemo(() => {
    if (filter === "All") return orders;
    return orders.filter((order) => order.status === filter);
  }, [orders, filter]);

  const totalSpent = useMemo(() => {
    return orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  }, [orders]);

  const totalDelivered = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  const activeOrders = orders.filter(
    (order) => order.status !== "Delivered" && order.status !== "Cancelled"
  ).length;

  if (loading) {
    return <MyOrdersSkeleton />;
  }

  if (!user) {
    return (
      <div className="text-center py-20 text-white">
        Please Login to view your orders
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <p className="text-[#D4AF37] text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2">
          Style Avenue
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          My <span className="text-[#D4AF37]">Orders</span>
        </h1>

        <p className="text-gray-400 mt-2">
          {orders.length} order{orders.length !== 1 ? "s" : ""} placed
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="border border-slate-700 rounded-2xl p-5 bg-[#0d1117]">
          <p className="text-gray-400 text-sm">Total Orders</p>
          <h2 className="text-2xl font-bold text-white mt-1">
            {orders.length}
          </h2>
        </div>

        <div className="border border-slate-700 rounded-2xl p-5 bg-[#0d1117]">
          <p className="text-gray-400 text-sm">Active Orders</p>
          <h2 className="text-2xl font-bold text-[#D4AF37] mt-1">
            {activeOrders}
          </h2>
        </div>

        <div className="border border-slate-700 rounded-2xl p-5 bg-[#0d1117]">
          <p className="text-gray-400 text-sm">Total Spent</p>
          <h2 className="text-2xl font-bold text-green-400 mt-1">
            Rs {totalSpent}
          </h2>
          <p className="text-gray-500 text-xs mt-1">
            Delivered: {totalDelivered}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm transition cursor-pointer whitespace-nowrap ${
              filter === f
                ? "bg-[#D4AF37] text-black font-semibold"
                : "bg-[#0d1117] border border-slate-700 text-gray-300 hover:border-[#D4AF37]/50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="border border-slate-700 rounded-2xl p-12 text-center bg-[#0d1117]">
          <p className="text-5xl mb-4">📭</p>

          <h2 className="text-xl font-bold text-white mb-2">
            No Orders Found
          </h2>

          <p className="text-gray-400">
            You do not have any {filter !== "All" ? filter : ""} orders yet.
          </p>

          <Link
            href="/products"
            className="inline-block mt-6 bg-[#D4AF37] text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => {
            const totalQty = getTotalQuantity(order.items);

            return (
              <Link
                key={order.id}
                href={`/profile/my-orders/${order.id}`}
                className="block bg-[#0d1117] border border-slate-700 rounded-2xl p-5 sm:p-6 hover:border-[#D4AF37]/50 transition"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-5">
                  <div>
                    <p className="text-white font-semibold text-lg">
                      {order.trackingId}
                    </p>

                    <p className="text-gray-400 text-sm mt-1">
                      {new Date(order.createdAt).toLocaleDateString("en-PK")}
                    </p>
                  </div>

                  <span
                    className={`${getStatusColor(
                      order.status
                    )} px-3 py-1 rounded-full text-white text-xs w-fit`}
                  >
                    {order.status}
                  </span>
                </div>

                {order.items?.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700 shrink-0 bg-slate-900">
                          <img
                            src={item.product?.image || "/placeholder.png"}
                            alt={item.product?.name || "Product"}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <p className="text-gray-300 text-sm font-semibold truncate">
                          {item.product?.name || "Product"}
                          {item.quantity > 1 && (
                            <span className="text-gray-500 font-normal">
                              {" "}
                              × {item.quantity}
                            </span>
                          )}
                        </p>
                      </div>
                    ))}

                    {order.items.length > 3 && (
                      <p className="text-gray-400 text-xs">
                        +{order.items.length - 3} more item
                        {order.items.length - 3 !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                )}

                <div className="border-t border-slate-700 pt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">
                      {totalQty} item{totalQty !== 1 ? "s" : ""}
                    </p>

                    <p className="text-[#D4AF37] font-bold mt-1">
                      Rs {order.total}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <span className="px-4 py-2 rounded-lg border border-[#D4AF37]/40 text-[#D4AF37] text-sm text-center">
                      View Details
                    </span>

                    {order.status !== "Delivered" &&
                      order.status !== "Cancelled" && (
                        <button
                          onClick={(e) => cancelOrder(e, order.id)}
                          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white text-sm cursor-pointer"
                        >
                          Cancel Order
                        </button>
                      )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}