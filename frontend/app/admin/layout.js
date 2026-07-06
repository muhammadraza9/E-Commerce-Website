"use client";

import Link from "next/link";

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
            className="text-white bg-slate-800 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Dashboard
          </Link>

          <Link
            href="/admin/products"
            className="text-white bg-slate-800 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Products
          </Link>

          <Link
            href="/admin/orders"
            className="text-white bg-slate-800 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Orders
          </Link>

          <Link
            href="/admin/users"
            className="text-white bg-slate-800 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Users
          </Link>

          <Link
            href="/"
            className="inline-block mt-8 bg-[#D4AF25] text-white text-center px-6 py-3 rounded-md font-semibold hover:scale-105 transition"
          >
            Back To Store
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-8">
        <div className="w-full max-w-full min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}