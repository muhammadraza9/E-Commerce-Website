"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

const actions = [
  "All",
  "LOGIN",
  "CREATE",
  "UPDATE",
  "UPDATE_STATUS",
  "UPDATE_ROLE",
  "CANCEL",
  "DELETE",
];

const entities = [
  "All",
  "AUTH",
  "PRODUCT",
  "ORDER",
  "RETURN_REQUEST",
  "COUPON",
  "USER",
  "ADMIN_SETTINGS",
];

const actionStyle = {
  LOGIN: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  CREATE: "bg-green-500/20 text-green-400 border-green-500/30",
  UPDATE: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  UPDATE_STATUS: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  UPDATE_ROLE: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  CANCEL: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("All");
  const [entity, setEntity] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(true);

  const limit = 20;

  useEffect(() => {
    setPage(1);
  }, [search, action, entity]);

  useEffect(() => {
    const timer = setTimeout(fetchLogs, 350);
    return () => clearTimeout(timer);
  }, [search, action, entity, page]);

  // ==========================
  // Fetch Logs
  // ==========================

  const fetchLogs = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        search,
        action,
        entity,
        page: String(page),
        limit: String(limit),
      });

      const res = await api.get(`/activity-logs?${params}`);

      setLogs(res.data.logs || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalLogs(res.data.totalLogs || 0);
    } catch {
      showErrorToast("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // Delete Log
  // ==========================

  const deleteLog = async (id) => {
    if (!confirm("Delete this activity log?")) return;

    try {
      await api.delete(`/activity-logs/${id}`);
      setLogs((prev) => prev.filter((log) => log.id !== id));
      setTotalLogs((prev) => Math.max(prev - 1, 0));
      showSuccessToast("Activity log deleted");
    } catch {
      showErrorToast("Failed to delete activity log");
    }
  };

  // ==========================
  // Clear All Logs
  // ==========================

  const clearLogs = async () => {
    if (!confirm("Clear all activity logs?")) return;

    try {
      await api.delete("/activity-logs");
      setLogs([]);
      setTotalLogs(0);
      setTotalPages(1);
      setPage(1);
      showSuccessToast("All activity logs cleared");
    } catch {
      showErrorToast("Failed to clear activity logs");
    }
  };

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 mb-8">
        <div>
          <p className="text-[#D4AF37] text-sm font-semibold uppercase tracking-widest">
            Admin Panel
          </p>

          <h1 className="text-4xl font-bold text-white mt-2">
            Activity <span className="text-[#D4AF37]">Logs</span>
          </h1>

          <p className="text-gray-400 mt-2">Total Logs: {totalLogs}</p>
        </div>

        <button
          onClick={clearLogs}
          disabled={!totalLogs}
          className="self-start sm:self-auto inline-flex items-center justify-center rounded-full border border-red-500/40 px-5 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear All
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search email, message or ID..."
          className="bg-[#0d1117] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
        />

        <select
          value={action}
          onChange={(event) => setAction(event.target.value)}
          className="bg-[#0d1117] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
        >
          {actions.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>

        <select
          value={entity}
          onChange={(event) => setEntity(event.target.value)}
          className="bg-[#0d1117] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
        >
          {entities.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-20">Loading...</div>
      ) : logs.length === 0 ? (
        <div className="bg-[#0d1117] border border-slate-700 rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">📝</p>
          <h2 className="text-white text-xl font-bold">No Activity Logs</h2>
          <p className="text-gray-400 mt-2">
            Admin actions will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-[#0d1117] border border-slate-700 rounded-2xl p-5 hover:border-[#D4AF37]/50 transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          actionStyle[log.action] ||
                          "bg-slate-700 text-gray-300 border-slate-600"
                        }`}
                      >
                        {log.action}
                      </span>

                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
                        {log.entity}
                      </span>
                    </div>

                    <p className="text-white font-semibold">{log.message}</p>

                    <div className="mt-3 space-y-1 text-sm">
                      <p className="text-gray-400">
                        <strong className="text-gray-300">Admin:</strong>{" "}
                        {log.adminEmail || "System"}
                      </p>

                      {log.entityId && (
                        <p className="text-gray-400">
                          <strong className="text-gray-300">Entity ID:</strong>{" "}
                          {log.entityId}
                        </p>
                      )}

                      <p className="text-gray-500 text-xs">
                        {new Date(log.createdAt).toLocaleString("en-PK")}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteLog(log.id)}
                    className="self-start lg:ml-auto inline-flex items-center justify-center rounded-full border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-600 hover:text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 flex-wrap mt-10">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="rounded-full border border-slate-700 bg-[#0d1117] px-4 py-2 text-white transition hover:border-[#D4AF37] disabled:opacity-40"
              >
                Prev
              </button>

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`w-10 h-10 rounded-full border transition ${
                    page === pageNumber
                      ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                      : "bg-[#0d1117] text-white border-slate-700 hover:border-[#D4AF37]"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={page === totalPages}
                className="rounded-full border border-slate-700 bg-[#0d1117] px-4 py-2 text-white transition hover:border-[#D4AF37] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}