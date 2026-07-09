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
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">📦</p>
          <h2 className="text-white text-xl font-bold">No Return Requests</h2>
          <p className="text-gray-400 mt-2">
            Customer return requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-5"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-white font-bold text-lg">
                      Order #{item.orderId}
                    </h2>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        statusClass[item.status]
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="text-gray-300">
                    <strong>Customer:</strong> {item.customer}
                  </p>

                  <p className="text-gray-300">
                    <strong>Email:</strong> {item.email}
                  </p>

                  <p className="text-gray-300">
                    <strong>Reason:</strong> {item.reason}
                  </p>

                  {item.message && (
                    <p className="text-gray-400">
                      <strong>Message:</strong> {item.message}
                    </p>
                  )}

                  <p className="text-gray-500 text-xs">
                    {new Date(item.createdAt).toLocaleString("en-PK")}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                  <select
                    value={item.status}
                    onChange={(e) => updateStatus(item.id, e.target.value)}
                    className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-[#D4AF37]"
                  >
                    {statuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => deleteRequest(item.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700"
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