"use client";

export default function Error({ error, reset }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-xl text-center bg-[#0B1F33] border border-red-500/30 rounded-3xl p-10 shadow-xl shadow-black/20">
        <p className="text-7xl mb-5">⚠️</p>

        <h1 className="text-3xl font-bold text-white mb-3">
          Something went wrong
        </h1>

        <p className="text-gray-400 mb-8">
          {error?.message || "An unexpected error occurred."}
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