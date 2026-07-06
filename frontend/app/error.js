"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-90px)] flex items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full text-center bg-[#0B1F33] border border-red-500/30 rounded-3xl p-10 shadow-xl shadow-black/20">
        <p className="text-7xl mb-5">⚠️</p>

        <p className="text-red-400 text-sm font-semibold tracking-widest uppercase mb-3">
          Application Error
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Something went wrong
        </h1>

        <p className="text-gray-400 mb-8 leading-relaxed">
          {error?.message || "An unexpected error occurred. Please try again."}
        </p>

        <button
          onClick={reset}
          className="bg-[#D4AF37] text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}