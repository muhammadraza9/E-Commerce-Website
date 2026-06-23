"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUserId(JSON.parse(storedUser).id);
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/auth/users");
      setUsers(res.data);
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, email) => {
    if (!confirm(`Delete user "${email}"? This cannot be undone.`)) return;

    try {
      await api.delete(`/auth/users/${id}`);
      showSuccessToast("User deleted successfully");
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.log(error);
      showErrorToast(
        error?.response?.data?.message || "Failed to delete user"
      );
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-white">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Manage Users</h1>
        <p className="text-gray-400 text-sm mt-1">
          {users.length} user{users.length !== 1 ? "s" : ""} registered
        </p>
      </div>

      <div className="bg-[#0d1117] border border-slate-700 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-700 text-gray-400 text-sm">
              <th className="px-6 py-4">Username</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors"
              >
                <td className="px-6 py-4 text-white text-sm">
                  {u.username}
                </td>
                <td className="px-6 py-4 text-gray-300 text-sm">
                  {u.email}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      u.role === "ADMIN"
                        ? "bg-[#D4AF37]/20 text-[#D4AF37]"
                        : "bg-slate-700 text-gray-300"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400 text-sm">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {u.id !== currentUserId ? (
                      <button
                        onClick={() => handleDelete(u.id, u.email)}
                        className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors font-medium cursor-pointer"
                      >
                        🗑️ Delete
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500 italic">
                        Current User
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}