"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import TrackOrderSkeleton from "@/components/skeletons/TrackOrderSkeleton";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

export default function TrackOrder() {
  const [trackingId, setTrackingId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const savedTrackingId = localStorage.getItem("trackingId");

      if (savedTrackingId) {
        setTrackingId(savedTrackingId);
      }

      setPageLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!trackingId.trim()) {
      showErrorToast("Please enter a Tracking Number");
      return;
    }

    try {
      setLoading(true);

      const res = await api.get(`/orders/${trackingId}`);

      if (!res.data) {
        showErrorToast("Order not found");
        setOrder(null);
        return;
      }

      setOrder(res.data);
      showSuccessToast("Order Found");
    } catch (error) {
      console.log(error);
      showErrorToast("Order not found");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <TrackOrderSkeleton />;
  }

  return (
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1600&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "brightness(1)",
        }}
      />

      <div
        className="absolute inset-0 z-0"
        style={{ background: "rgba(10, 22, 40, 0.85)" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-12">
        <h1 className="text-4xl font-bold text-white mb-8">
          Track <span className="text-[#D4AF37]">Order</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <input
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="Enter Tracking Number (TRK-XXXXXX)"
            className="w-full border text-white placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            style={{
              backgroundColor: "rgba(10,22,40,0.8)",
              borderColor: "#D4AF37",
              borderWidth: "1px",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-[#D4AF37] to-yellow-500 text-[#001F14] px-6 py-3 rounded-xl font-semibold hover:scale-105 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Searching..." : "Track Order"}
          </button>
        </form>

        {order && (
          <div
            className="rounded-2xl p-6 text-white shadow-xl border"
            style={{
              backgroundColor: "rgba(13, 31, 56, 0.85)",
              borderColor: "rgba(212,175,55,0.25)",
            }}
          >
            <h2 className="text-2xl font-bold mb-4">Order Details</h2>

            <div className="space-y-3">
              <p>
                <strong>Tracking Number:</strong>{" "}
                <span className="text-[#D4AF37] font-bold">
                  {order.trackingId}
                </span>
              </p>

              <p>
                <strong>Customer:</strong> {order.customer}
              </p>

              <p>
                <strong>Email:</strong> {order.email}
              </p>

              <p>
                <strong>Phone:</strong> {order.phone}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span className="text-green-400 font-semibold">
                  {order.status}
                </span>
              </p>

              <p>
                <strong>Payment Method:</strong>{" "}
                <span className="text-[#D4AF37] font-semibold">
                  {order.paymentMethod === "COD"
                    ? "Cash On Delivery"
                    : order.paymentMethod === "JAZZCASH"
                    ? "JazzCash"
                    : order.paymentMethod === "EASYPAISA"
                    ? "EasyPaisa"
                    : order.paymentMethod}
                </span>
              </p>

              <p>
                <strong>Payment Status:</strong>{" "}
                <span
                  className={
                    order.paymentStatus === "Paid"
                      ? "text-green-400 font-semibold"
                      : order.paymentStatus === "Failed"
                      ? "text-red-400 font-semibold"
                      : "text-yellow-400 font-semibold"
                  }
                >
                  {order.paymentStatus}
                </span>
              </p>

              <p>
                <strong>Total:</strong> Rs {order.total}
              </p>

              <p>
                <strong>Order Date:</strong>{" "}
                {new Date(order.createdAt).toLocaleDateString("en-PK")}
              </p>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">
              Ordered Products
            </h3>

            {order.items?.length > 0 ? (
              order.items.map((item) => (
                <div
                  key={item.id}
                  className="border border-slate-700 rounded-lg p-4 mb-3"
                >
                  <p>Quantity: {item.quantity}</p>
                  <p>Price: Rs {item.price}</p>
                  <p>Subtotal: Rs {item.price * item.quantity}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No products found in this order</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}