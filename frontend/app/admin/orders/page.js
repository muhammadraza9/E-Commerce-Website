"use client";

import { useEffect, useMemo, useState } from "react";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { generateInvoicePDF } from "@/utils/invoiceGenerator";
import AdminOrdersSkeleton from "@/components/skeletons/AdminOrdersSkeleton";
import api from "@/services/api";

const formatCurrency = (amount) => {
  return `Rs ${Number(amount || 0).toLocaleString("en-PK")}`;
};

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
        order.email?.toLowerCase().includes(searchText) ||
        order.couponCode?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.grandTotal || order.total || 0),
    0
  );

  const totalDiscount = orders.reduce(
    (sum, order) => sum + Number(order.discountAmount || 0),
    0
  );

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  if (loading) {
    return <AdminOrdersSkeleton />;
  }

  return (
    <div className="w-full max-w-full overflow-hidden px-4 sm:px-6 py-8">
      <div className="mb-8">
        <p className="text-[#D4AF37] text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2">
          Admin Panel
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Manage <span className="text-[#D4AF37]">Orders</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total Orders" value={orders.length} />
        <StatCard title="Pending" value={pendingOrders} color="text-yellow-400" />
        <StatCard title="Delivered" value={deliveredOrders} color="text-green-400" />
        <StatCard
          title="Discounts"
          value={formatCurrency(totalDiscount)}
          color="text-red-400"
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(totalRevenue)}
          color="text-[#D4AF37]"
        />
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search by tracking ID, customer, email or coupon..."
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
        <div className="w-full max-w-full rounded-2xl border border-slate-700 bg-slate-900 overflow-hidden">
          <div className="w-full overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[1320px]">
              <thead>
                <tr className="border-b border-slate-700 text-white">
                  <th className="p-4 text-left whitespace-nowrap">Tracking ID</th>
                  <th className="p-4 text-left whitespace-nowrap">Customer</th>
                  <th className="p-4 text-left whitespace-nowrap">Email</th>
                  <th className="p-4 text-left whitespace-nowrap">Date</th>
                  <th className="p-4 text-left whitespace-nowrap">Coupon</th>
                  <th className="p-4 text-left whitespace-nowrap">Subtotal</th>
                  <th className="p-4 text-left whitespace-nowrap">Discount</th>
                  <th className="p-4 text-left whitespace-nowrap">Shipping</th>
                  <th className="p-4 text-left whitespace-nowrap">Tax</th>
                  <th className="p-4 text-left whitespace-nowrap">Grand Total</th>
                  <th className="p-4 text-left whitespace-nowrap">Status</th>
                  <th className="p-4 text-left whitespace-nowrap">Update Status</th>
                  <th className="p-4 text-left whitespace-nowrap">Invoice</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-800 text-white hover:bg-slate-800/50 transition"
                  >
                    <td className="p-4 font-semibold text-[#D4AF37] whitespace-nowrap">
                      {order.trackingId}
                    </td>

                    <td className="p-4 whitespace-nowrap">{order.customer}</td>

                    <td className="p-4 text-gray-300 whitespace-nowrap">
                      {order.email}
                    </td>

                    <td className="p-4 text-gray-300 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-PK")}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      {order.couponCode ? (
                        <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold">
                          {order.couponCode}
                        </span>
                      ) : (
                        <span className="text-gray-500">No Coupon</span>
                      )}
                    </td>

                    <td className="p-4 text-gray-300 whitespace-nowrap">
                      {formatCurrency(order.subtotal)}
                    </td>

                    <td className="p-4 text-red-400 font-semibold whitespace-nowrap">
                      - {formatCurrency(order.discountAmount)}
                    </td>

                    <td className="p-4 text-gray-300 whitespace-nowrap">
                      {formatCurrency(order.shippingFee)}
                    </td>

                    <td className="p-4 text-gray-300 whitespace-nowrap">
                      {formatCurrency(order.taxAmount)}
                    </td>

                    <td className="p-4 font-bold text-[#D4AF37] whitespace-nowrap">
                      {formatCurrency(order.grandTotal || order.total)}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`${getStatusColor(
                          order.status
                        )} px-3 py-1 rounded-full text-sm text-white whitespace-nowrap`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="p-4 whitespace-nowrap">
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

                    <td className="p-4 whitespace-nowrap">
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
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, color = "text-white" }) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
      <p className="text-gray-400 text-sm">{title}</p>
      <h2 className={`text-2xl font-bold mt-1 ${color}`}>{value}</h2>
    </div>
  );
}