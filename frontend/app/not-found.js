import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-xl text-center bg-[#0B1F33] border border-[#D4AF37]/20 rounded-3xl p-10 shadow-xl shadow-black/20">
        <p className="text-7xl mb-5">🛍️</p>

        <h1 className="text-5xl font-bold text-white mb-3">
          404
        </h1>

        <h2 className="text-2xl font-bold text-[#D4AF37] mb-4">
          Page Not Found
        </h2>

        <p className="text-gray-400 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-block bg-[#D4AF37] text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}