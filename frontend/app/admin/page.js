"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/orders/stats/dashboard");
        setStats(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="px-6 py-8">
      <h1 className="text-4xl font-bold text-white">
        Dash<span className="text-[#D4AF37]">board </span>
      </h1>

      <p className="text-gray-400 mt-2 mb-8">
        Welcome to Admin Panel
      </p>

      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
          <h3 className="text-gray-400">Total Orders</h3>
          <p className="text-4xl font-bold text-white mt-2">
            {stats.totalOrders}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
          <h3 className="text-gray-400">Total Revenue</h3>
          <p className="text-4xl font-bold text-green-400 mt-2">
            Rs {stats.revenue}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
          <h3 className="text-gray-400">Pending Orders</h3>
          <p className="text-4xl font-bold text-yellow-400 mt-2">
            {stats.pendingOrders}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
          <h3 className="text-gray-400">Processing Orders</h3>
          <p className="text-4xl font-bold text-cyan-400 mt-2">
            {stats.processingOrders}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
          <h3 className="text-gray-400">Shipped Orders</h3>
          <p className="text-4xl font-bold text-blue-400 mt-2">
            {stats.shippedOrders}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
          <h3 className="text-gray-400">Delivered Orders</h3>
          <p className="text-4xl font-bold text-green-500 mt-2">
            {stats.deliveredOrders}
          </p>
        </div>

      </div>
    </div>
  );
}