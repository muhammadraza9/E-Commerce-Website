"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import Link from "next/link";

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        router.push("/signin");
        return;
      }

      const user = JSON.parse(storedUser);
      const res = await api.get(`/orders/user/${user.email}`);

      const foundOrder = res.data.find((o) => String(o.id) === String(id));
      setOrder(foundOrder || null);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmCancel) return;

    try {
      await api.put(`/orders/${order.id}/cancel`);
      setOrder((prev) => ({ ...prev, status: "Cancelled" }));
    } catch (error) {
      console.log(error);
      alert("Unable to cancel order");
    }
  };

  const handleDownloadInvoice = () => {
    window.print();
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

  const totalQuantity = useMemo(() => {
    return (
      order?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0
    );
  }, [order]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 text-center text-white">
        Loading...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 text-center text-white">
        <p className="text-5xl mb-4">📭</p>

        <h1 className="text-2xl font-bold mb-2">Order not found</h1>

        <button
          onClick={() => router.push("/profile/my-orders")}
          className="mt-4 inline-flex items-center gap-2 bg-[#D4AF37] text-black px-5 py-3 rounded-xl font-semibold hover:scale-105 transition"
        >
          ← Back to My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-6 print:hidden">
        <button
          onClick={() => router.push("/profile/my-orders")}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[#D4AF37]/40 text-[#D4AF37] font-semibold hover:bg-[#D4AF37]/10 hover:scale-105 transition"
        >
          <span className="text-lg">←</span>
          Back to My Orders
        </button>
      </div>

      <div className="bg-[#0d1117] border border-slate-700 rounded-2xl p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
          <div>
            <p className="text-[#D4AF37] text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2">
              Style Avenue
            </p>

            <h1 className="text-3xl font-bold text-white">Order Details</h1>

            <p className="text-gray-400 mt-2">
              Tracking ID: {order.trackingId}
            </p>
          </div>

          <span
            className={`${getStatusColor(
              order.status
            )} px-4 py-2 rounded-full text-white text-sm font-medium w-fit`}
          >
            {order.status}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="border border-slate-700 rounded-xl p-4">
            <h2 className="text-white font-bold mb-4">Customer Information</h2>

            <p className="text-gray-300">
              <strong className="text-white">Customer:</strong>{" "}
              {order.customer}
            </p>

            <p className="text-gray-300 mt-2">
              <strong className="text-white">Email:</strong> {order.email}
            </p>

            <p className="text-gray-300 mt-2">
              <strong className="text-white">Phone:</strong> {order.phone}
            </p>

            <p className="text-gray-300 mt-2">
              <strong className="text-white">Address:</strong>{" "}
              {order.address}
            </p>
          </div>

          <div className="border border-slate-700 rounded-xl p-4">
            <h2 className="text-white font-bold mb-4">Order Summary</h2>

            <p className="text-gray-300">
              <strong className="text-white">Order ID:</strong> #{order.id}
            </p>

            <p className="text-gray-300 mt-2">
              <strong className="text-white">Date:</strong>{" "}
              {new Date(order.createdAt).toLocaleDateString("en-PK")}
            </p>

            <p className="text-gray-300 mt-2">
              <strong className="text-white">Total Quantity:</strong>{" "}
              {totalQuantity}
            </p>

            <p className="text-[#D4AF37] font-bold text-lg mt-4">
              Total: Rs {order.total}
            </p>
          </div>
        </div>

        <div className="border border-slate-700 rounded-xl p-5 sm:p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-5">
            Ordered Products
          </h2>

          {order.items && order.items.length > 0 ? (
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="border border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <img
                    src={item.product?.image || "/placeholder-product.png"}
                    alt={item.product?.name || "Product"}
                    className="w-full sm:w-24 h-48 sm:h-24 rounded-lg object-cover border border-slate-700"
                  />

                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">
                      {item.product?.name || "Product"}
                    </h3>

                    <p className="text-gray-400 text-sm mt-1">
                      Quantity: {item.quantity}
                    </p>

                    <p className="text-gray-400 text-sm mt-1">
                      Unit Price: Rs {item.price}
                    </p>

                    <p className="text-[#D4AF37] font-semibold mt-2">
                      Subtotal: Rs {item.price * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No products found in this order</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 print:hidden">
          <button
            onClick={handleDownloadInvoice}
            className="px-5 py-3 rounded-lg bg-[#D4AF37] text-black font-semibold hover:scale-105 transition"
          >
            Download Invoice
          </button>

          {order.status !== "Delivered" && order.status !== "Cancelled" && (
            <button
              onClick={cancelOrder}
              className="px-5 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}