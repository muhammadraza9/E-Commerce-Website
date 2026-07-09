"use client";

import Link from "next/link";
import {
  FiGrid,
  FiShoppingBag,
  FiPackage,
  FiUsers,
  FiSettings,
  FiArrowLeftCircle,
  FiPercent,
} from "react-icons/fi";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 min-w-64 shrink-0 bg-slate-900 border-r border-slate-800 p-6 min-h-screen">
        <h1 className="text-2xl font-bold text-white mb-8">
          Admin <span className="text-[#D4AF37]">Panel</span>
        </h1>

        <div className="flex flex-col gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-3 bg-slate-800 text-white px-4 py-3 rounded-lg hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            <FiGrid size={20} />
            Dashboard
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-3 bg-slate-800 text-white px-4 py-3 rounded-lg hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            <FiShoppingBag size={20} />
            Products
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-3 bg-slate-800 text-white px-4 py-3 rounded-lg hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            <FiPackage size={20} />
            Orders
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center gap-3 bg-slate-800 text-white px-4 py-3 rounded-lg hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            <FiUsers size={20} />
            Users
          </Link>

          <Link
            href="/admin/coupons"
            className="flex items-center gap-3 bg-slate-800 text-white px-4 py-3 rounded-lg hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            <FiPercent size={20} />
            Coupons
          </Link>

          <Link
               href="/admin/notifications"
              className="flex items-center gap-3 bg-slate-800 text-white px-4 py-3 rounded-lg hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
              >
              🔔 Notifications
            </Link>

            <Link
              href="/admin/returns"
              className="flex items-center gap-3 bg-slate-800 text-white px-4 py-3 rounded-lg hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
              >
              📦 Returns
            </Link>

          <Link
            href="/admin/settings"
            className="flex items-center gap-3 bg-[#0B1F33] border border-[#D4AF37] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            <FiSettings
              size={20}
              className="animate-spin"
              style={{ animationDuration: "8s" }}
            />
            Settings
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 mt-8 bg-[#D4AF37] text-black px-6 py-3 rounded-lg font-bold hover:scale-105 transition-all duration-300"
          >
            <FiArrowLeftCircle size={20} />
            Back To Store
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-8">
        <div className="w-full max-w-full min-w-0">{children}</div>
      </main>
    </div>
  );
}