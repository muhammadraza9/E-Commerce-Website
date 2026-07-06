"use client";

import { useEffect, useMemo, useState } from "react";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { generateInvoicePDF } from "@/utils/invoiceGenerator";
import api from "@/services/api";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const statuses = [
    "All",
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data || []);
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });

      showSuccessToast("Order Status Updated");

      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, status } : order
        )
      );
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to update status");
    }
  };

  const handleDownloadInvoice = (order) => {
    generateInvoicePDF(order, "admin");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500";
      case "Processing":
        return "bg-blue-500";
      case "Shipped":
        return "bg-purple-500";
      case "Delivered":
        return "bg-green-500";
      case "Cancelled":
        return "bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        order.trackingId?.toLowerCase().includes(searchText) ||
        order.customer?.toLowerCase().includes(searchText) ||
        order.email?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  if (loading) {
    return (
      <div className="text-white text-center py-20">
        Loading Orders...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <p className="text-[#D4AF37] text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2">
          Admin Panel
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Manage <span className="text-[#D4AF37]">Orders</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
          <p className="text-gray-400 text-sm">Total Orders</p>
          <h2 className="text-2xl font-bold text-white mt-1">
            {orders.length}
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
          <p className="text-gray-400 text-sm">Pending</p>
          <h2 className="text-2xl font-bold text-yellow-400 mt-1">
            {pendingOrders}
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
          <p className="text-gray-400 text-sm">Delivered</p>
          <h2 className="text-2xl font-bold text-green-400 mt-1">
            {deliveredOrders}
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
          <p className="text-gray-400 text-sm">Revenue</p>
          <h2 className="text-2xl font-bold text-[#D4AF37] mt-1">
            Rs {totalRevenue}
          </h2>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search by tracking ID, customer or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">📭</p>
          <h2 className="text-white text-xl font-bold">No Orders Found</h2>
          <p className="text-gray-400 mt-2">
            Try changing search or filter.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-slate-900 rounded-2xl border border-slate-700">
          <table className="w-full min-w-[1050px]">
            <thead>
              <tr className="border-b border-slate-700 text-white">
                <th className="p-4 text-left">Tracking ID</th>
                <th className="p-4 text-left">Customer</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Total</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Update Status</th>
                <th className="p-4 text-left">Invoice</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-slate-800 text-white hover:bg-slate-800/50 transition"
                >
                  <td className="p-4 font-semibold text-[#D4AF37]">
                    {order.trackingId}
                  </td>

                  <td className="p-4">{order.customer}</td>

                  <td className="p-4 text-gray-300">{order.email}</td>

                  <td className="p-4 text-gray-300">
                    {new Date(order.createdAt).toLocaleDateString("en-PK")}
                  </td>

                  <td className="p-4 font-semibold">Rs {order.total}</td>

                  <td className="p-4">
                    <span
                      className={`${getStatusColor(
                        order.status
                      )} px-3 py-1 rounded-full text-sm text-white`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateStatus(order.id, e.target.value)
                      }
                      className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-[#D4AF37]"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => handleDownloadInvoice(order)}
                      className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition whitespace-nowrap"
                    >
                      📄 Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}