"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import OrderSuccessSkeleton from "@/components/skeletons/OrderSuccessSkeleton";

export default function OrderSuccessPage() {
  const [trackingId, setTrackingId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const id = localStorage.getItem("trackingId");

      if (id) {
        setTrackingId(id);
      }

      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <OrderSuccessSkeleton />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="bg-slate-900 border border-slate-700 p-10 rounded-2xl text-center max-w-xl w-full shadow-2xl">
        <div className="text-6xl mb-4">✅</div>

        <h1 className="text-4xl font-bold text-white mb-4">
          Order Placed Successfully
        </h1>

        <p className="text-gray-300 mb-2">
          Thank you for your purchase.
        </p>

        <p className="text-gray-400 mb-2">
          Save your tracking number:
        </p>

        <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 mb-6">
          <p className="text-[#D4AF37] text-xl font-bold tracking-wider">
            {trackingId || "Tracking ID not found"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="bg-[#D4AF37] text-[#001F14] px-6 py-3 rounded-xl font-semibold hover:scale-105 transition"
          >
            Continue Shopping
          </Link>

          <Link
            href="/track-order"
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition"
          >
            Track Order
          </Link>
        </div>
      </div>
    </div>
  );
}