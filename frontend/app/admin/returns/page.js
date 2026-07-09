"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

const statuses = ["Pending", "Approved", "Rejected"];

const statusClass = {
  Pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Approved: "bg-green-500/20 text-green-400 border-green-500/30",
  Rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function AdminReturnsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/return-requests");
      setRequests(res.data || []);
    } catch {
      showErrorToast("Failed to load return requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/return-requests/${id}/status`, { status });
      showSuccessToast("Return request updated");
      fetchRequests();
    } catch {
      showErrorToast("Failed to update request");
    }
  };

  const deleteRequest = async (id) => {
    if (!confirm("Delete this return request?")) return;

    try {
      await api.delete(`/return-requests/${id}`);
      showSuccessToast("Return request deleted");
      fetchRequests();
    } catch {
      showErrorToast("Failed to delete request");
    }
  };

  if (loading) {
    return <div className="text-gray-400 text-center py-20">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-[#D4AF37] text-sm font-semibold uppercase tracking-widest">
          Admin Panel
        </p>

        <h1 className="text-4xl font-bold text-white mt-2">
          Return <span className="text-[#D4AF37]">Requests</span>
        </h1>
      </div>

      {requests.length === 0 ? (
        <div className="bg-[#0d1117] border border-slate-700 rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">📦</p>
          <h2 className="text-white text-xl font-bold">No Return Requests</h2>
          <p className="text-gray-400 mt-2">
            Customer return requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {requests.map((item) => (
            <div
              key={item.id}
              className="bg-[#0d1117] border border-slate-700 rounded-2xl p-5 sm:p-6 hover:border-[#D4AF37]/50 transition"
            >
              <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-white font-bold text-lg">
                      Order #{item.orderId}
                    </h2>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        statusClass[item.status] || statusClass.Pending
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="text-gray-300">
                    <strong className="text-white">Customer:</strong>{" "}
                    {item.customer}
                  </p>

                  <p className="text-gray-300">
                    <strong className="text-white">Email:</strong> {item.email}
                  </p>

                  <p className="text-gray-300">
                    <strong className="text-white">Reason:</strong>{" "}
                    {item.reason}
                  </p>

                  {item.message && (
                    <p className="text-gray-400">
                      <strong className="text-white">Message:</strong>{" "}
                      {item.message}
                    </p>
                  )}

                  <p className="text-gray-500 text-xs">
                    {new Date(item.createdAt).toLocaleString("en-PK")}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
                  <select
                    value={item.status}
                    onChange={(e) => updateStatus(item.id, e.target.value)}
                    className="w-44 bg-[#071827] border border-[#D4AF37]/30 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4AF37]"
                  >
                    {statuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => deleteRequest(item.id)}
                    className="w-44 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}