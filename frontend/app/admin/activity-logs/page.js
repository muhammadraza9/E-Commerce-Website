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

const redButtonClass =
  "flex shrink-0 items-center justify-center rounded-lg bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40";

const redButtonStyle = {
  width: "112px",
  minWidth: "112px",
  maxWidth: "112px",
  height: "42px",
  minHeight: "42px",
  maxHeight: "42px",
};

const paginationButtonClass =
  "flex h-10 min-w-10 items-center justify-center rounded-lg border border-[#D4AF37]/30 bg-[#0B1F33] px-4 text-sm font-semibold text-white transition hover:bg-[#102840] disabled:cursor-not-allowed disabled:opacity-40";

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
    const timer = setTimeout(() => {
      fetchLogs();
    }, 350);

    return () => clearTimeout(timer);
  }, [search, action, entity, page]);

  // ==========================
  // Fetch Activity Logs
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

      const res = await api.get(
        `/activity-logs?${params.toString()}`
      );

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
  // Delete Activity Log
  // ==========================

  const deleteLog = async (id) => {
    if (!confirm("Delete this activity log?")) return;

    try {
      await api.delete(`/activity-logs/${id}`);

      const remainingLogs = logs.filter((log) => log.id !== id);

      setLogs(remainingLogs);
      setTotalLogs((prev) => Math.max(prev - 1, 0));

      if (remainingLogs.length === 0 && page > 1) {
        setPage((prev) => prev - 1);
      }

      showSuccessToast("Activity log deleted");
    } catch {
      showErrorToast("Failed to delete activity log");
    }
  };

  // ==========================
  // Clear All Activity Logs
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
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-[#D4AF37]">
            Admin Panel
          </p>

          <h1 className="mt-2 text-4xl font-bold text-white">
            Activity <span className="text-[#D4AF37]">Logs</span>
          </h1>

          <p className="mt-2 text-gray-400">
            Total Logs: {totalLogs}
          </p>
        </div>

        <button
          type="button"
          onClick={clearLogs}
          disabled={!totalLogs}
          className={redButtonClass}
          style={redButtonStyle}
        >
          Clear All
        </button>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search email, message or ID..."
          className="rounded-xl border border-slate-700 bg-[#0d1117] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
        />

        <select
          value={action}
          onChange={(event) => setAction(event.target.value)}
          className="rounded-xl border border-slate-700 bg-[#0d1117] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
        >
          {actions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={entity}
          onChange={(event) => setEntity(event.target.value)}
          className="rounded-xl border border-slate-700 bg-[#0d1117] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
        >
          {entities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">
          Loading...
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-slate-700 bg-[#0d1117] p-12 text-center">
          <p className="mb-4 text-5xl">📝</p>

          <h2 className="text-xl font-bold text-white">
            No Activity Logs
          </h2>

          <p className="mt-2 text-gray-400">
            Admin actions will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="relative rounded-2xl border border-slate-700 bg-[#0d1117] p-5 transition hover:border-[#D4AF37]/50"
              >
                <div className="pr-0 lg:pr-36">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${
                        actionStyle[log.action] ||
                        "border-slate-600 bg-slate-700 text-gray-300"
                      }`}
                    >
                      {log.action}
                    </span>

                    <span className="rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-1 text-xs font-semibold text-[#D4AF37]">
                      {log.entity}
                    </span>
                  </div>

                  <p className="font-semibold text-white">
                    {log.message}
                  </p>

                  <div className="mt-3 space-y-1 text-sm">
                    <p className="text-gray-400">
                      <strong className="text-gray-300">
                        Admin:
                      </strong>{" "}
                      {log.adminEmail || "System"}
                    </p>

                    {log.entityId && (
                      <p className="text-gray-400">
                        <strong className="text-gray-300">
                          Entity ID:
                        </strong>{" "}
                        {log.entityId}
                      </p>
                    )}

                    <p className="text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleString("en-PK")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteLog(log.id)}
                  className={`${redButtonClass} absolute top-5 right-5`}
                  style={redButtonStyle}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={page === 1}
                className={paginationButtonClass}
              >
                Prev
              </button>

              {pageNumbers.map((pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`flex h-10 min-w-10 items-center justify-center rounded-lg border px-4 text-sm font-semibold transition ${
                    page === pageNumber
                      ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                      : "border-[#D4AF37]/30 bg-[#0B1F33] text-white hover:bg-[#102840]"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                onClick={() =>
                  setPage((prev) =>
                    Math.min(prev + 1, totalPages)
                  )
                }
                disabled={page === totalPages}
                className={paginationButtonClass}
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