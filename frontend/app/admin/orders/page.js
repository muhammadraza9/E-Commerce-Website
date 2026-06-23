"use client";

import { useEffect, useState } from "react";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import api from "@/services/api";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data);
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

      fetchOrders();
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to update status");
    }
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

      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="text-white text-center py-20">
        Loading Orders...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-white mb-8">
        Manage Orders
      </h1>

      <div className="overflow-x-auto bg-slate-900 rounded-2xl border border-slate-700">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 text-white">
              <th className="p-4 text-left">Tracking ID</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Total</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Update Status</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-slate-800 text-white"
              >
                <td className="p-4">{order.trackingId}</td>
                <td className="p-4">{order.customer}</td>
                <td className="p-4">{order.email}</td>
                <td className="p-4">Rs {order.total}</td>

                <td className="p-4">
                  <span
                    className={`${getStatusColor(
                      order.status
                    )} px-3 py-1 rounded-full text-sm`}
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
                    className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}