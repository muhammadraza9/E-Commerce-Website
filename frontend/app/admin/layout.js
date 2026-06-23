"use client";

import Link from "next/link";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-slate-950">
      
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 p-6">
        <h1 className="text-2xl font-bold text-white mb-8">
          Admin Panel
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
            className="text-white bg-red-600 px-4 py-3 rounded-lg hover:bg-red-700 transition-colors mt-4"
          >
            Back To Store
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
}