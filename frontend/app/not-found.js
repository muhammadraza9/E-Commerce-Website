import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-90px)] flex items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full text-center bg-[#0B1F33] border border-[#D4AF37]/20 rounded-3xl p-10 shadow-xl shadow-black/20">
        <p className="text-7xl mb-5">🛍️</p>

        <p className="text-[#D4AF37] text-sm font-semibold tracking-widest uppercase mb-3">
          404 Error
        </p>

        <h1 className="text-5xl font-bold text-white mb-3">
          Page Not Found
        </h1>

        <p className="text-gray-400 mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/"
            className="bg-[#D4AF37] text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition"
          >
            Back to Home
          </Link>

          <Link
            href="/products"
            className="border border-[#D4AF37] text-[#D4AF37] px-6 py-3 rounded-xl font-semibold hover:bg-[#D4AF37]/10 transition"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}