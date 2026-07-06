"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PaymentSuccessSkeleton from "@/components/skeletons/PaymentSuccessSkeleton";

export default function PaymentSuccess() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <PaymentSuccessSkeleton />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-10 text-center shadow-xl">
        <div className="text-6xl mb-5">✅</div>

        <h1 className="text-3xl font-bold text-green-500 mb-4">
          Payment Successful
        </h1>

        <p className="text-gray-400 mb-8">
          Your payment has been received successfully and your order has been confirmed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/profile/my-orders"
            className="bg-[#D4AF37] text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition"
          >
            My Orders
          </Link>

          <Link
            href="/products"
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}