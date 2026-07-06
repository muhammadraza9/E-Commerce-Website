"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PaymentFailedSkeleton from "@/components/skeletons/PaymentFailedSkeleton";

export default function PaymentFailed() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <PaymentFailedSkeleton />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-10 text-center shadow-xl">
        <div className="text-6xl mb-5">❌</div>

        <h1 className="text-3xl font-bold text-red-500 mb-4">
          Payment Failed
        </h1>

        <p className="text-gray-400 mb-8">
          Please try again or choose a different payment method.
        </p>

        <Link
          href="/checkout"
          className="inline-block bg-[#D4AF37] text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}