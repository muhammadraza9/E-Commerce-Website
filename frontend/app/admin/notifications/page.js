"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

const getNotificationIcon = (type) => {
  switch (type) {
    case "ORDER":
      return "🛒";
    case "LOW_STOCK":
      return "⚠️";
    case "OUT_OF_STOCK":
      return "🚫";
    default:
      return "🔔";
  }
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const res = await api.get("/notifications");
      setNotifications(res.data || []);
    } catch (error) {
      showErrorToast("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      showErrorToast("Failed to update notification");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      showSuccessToast("All notifications marked as read");
      fetchNotifications();
    } catch (error) {
      showErrorToast("Failed to update notifications");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      showSuccessToast("Notification deleted");
      fetchNotifications();
    } catch (error) {
      showErrorToast("Failed to delete notification");
    }
  };

  const clearAll = async () => {
    if (!confirm("Clear all notifications?")) return;

    try {
      await api.delete("/notifications");
      showSuccessToast("All notifications cleared");
      fetchNotifications();
    } catch (error) {
      showErrorToast("Failed to clear notifications");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
        <div>
          <p className="text-[#D4AF37] text-sm font-semibold uppercase tracking-widest">
            Admin Panel
          </p>

          <h1 className="text-4xl font-bold text-white mt-2">
            Notifications
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={markAllAsRead}
            className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-400 transition"
          >
            Mark All Read
          </button>

          <button
            onClick={clearAll}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition"
          >
            Clear All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-20">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">🔔</p>

          <h2 className="text-white text-xl font-bold">No Notifications</h2>

          <p className="text-gray-400 mt-2">
            New alerts will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`border rounded-2xl p-5 transition ${
                item.isRead
                  ? "bg-slate-900 border-slate-700"
                  : "bg-[#0B1F33] border-[#D4AF37]/50"
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">
                      {getNotificationIcon(item.type)}
                    </span>

                    <h2 className="text-white font-bold text-lg">
                      {item.title}
                    </h2>

                    {!item.isRead && (
                      <span className="bg-[#D4AF37] text-black text-xs px-2 py-1 rounded-full font-bold">
                        New
                      </span>
                    )}
                  </div>

                  <p className="text-gray-400">{item.message}</p>

                  <p className="text-gray-500 text-xs mt-3">
                    {new Date(item.createdAt).toLocaleString("en-PK")}
                  </p>
                </div>

                <div className="flex items-start gap-2 shrink-0">
                  {!item.isRead && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-green-700 transition"
                    >
                      Read
                    </button>
                  )}

                  <button
                    onClick={() => deleteNotification(item.id)}
                    className="bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-red-700 transition"
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