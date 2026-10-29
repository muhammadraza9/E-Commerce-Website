"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  FiGrid,
  FiShoppingBag,
  FiPackage,
  FiUsers,
  FiSettings,
  FiArrowLeftCircle,
  FiPercent,
  FiActivity,
} from "react-icons/fi";

export default function AdminLayout({ children }) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (window.innerWidth < 768 && contentRef.current) {
      contentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [children]);

  const handleMobileNavigation = () => {
    if (window.innerWidth < 768) {
      setTimeout(() => {
        contentRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950">
      {/* Sidebar */}
      <aside className="w-full min-w-0 md:w-64 md:min-w-64 shrink-0 bg-slate-900 border-r border-slate-800 p-3 md:p-6 md:min-h-screen">
        <h1 className="text-2xl font-bold text-white mb-8">
          Admin <span className="text-[#D4AF37]">Panel</span>
        </h1>

        <div className="flex flex-col gap-3">
          <Link
            href="/admin"
            onClick={handleMobileNavigation}
            className="flex items-center gap-3 bg-slate-800 text-white px-4 py-3 rounded-lg hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            <FiGrid size={20} />
            Dashboard
          </Link>

          <Link
            href="/admin/products"
            onClick={handleMobileNavigation}
            className="flex items-center gap-3 bg-slate-800 text-white px-4 py-3 rounded-lg hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            <FiShoppingBag size={20} />
            Products
          </Link>

          <Link
            href="/admin/orders"
            onClick={handleMobileNavigation}
            className="flex items-center gap-3 bg-slate-800 text-white px-4 py-3 rounded-lg hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            <FiPackage size={20} />
            Orders
          </Link>

          <Link
            href="/admin/users"
            onClick={handleMobileNavigation}
            className="flex items-center gap-3 bg-slate-800 text-white px-4 py-3 rounded-lg hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            <FiUsers size={20} />
            Users
          </Link>

          <Link
            href="/admin/coupons"
            onClick={handleMobileNavigation}
            className="flex items-center gap-3 bg-slate-800 text-white px-4 py-3 rounded-lg hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            <FiPercent size={20} />
            Coupons
          </Link>

          <Link
            href="/admin/notifications"
            onClick={handleMobileNavigation}
            className="flex items-center gap-3 bg-slate-800 text-white px-4 py-3 rounded-lg hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            🔔 Notifications
          </Link>

          <Link
            href="/admin/returns"
            onClick={handleMobileNavigation}
            className="flex items-center gap-3 bg-slate-800 text-white px-4 py-3 rounded-lg hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            📦 Returns
          </Link>

          <Link
            href="/admin/activity-logs"
            onClick={handleMobileNavigation}
            className="flex items-center gap-3 bg-slate-800 text-white px-4 py-3 rounded-lg hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            <FiActivity size={20} />
            Activity Logs
          </Link>

          <Link
            href="/admin/settings"
            onClick={handleMobileNavigation}
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
      <main
        ref={contentRef}
        className="flex-1 w-full min-w-0 max-w-full overflow-x-auto p-4 sm:p-6 md:p-8 scroll-mt-4"
      >
        <div className="w-full max-w-full min-w-0">{children}</div>
      </main>
    </div>
  );
}