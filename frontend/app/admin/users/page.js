"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import AdminUsersSkeleton from "@/components/skeletons/AdminUsersSkeleton";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleUpdatingId, setRoleUpdatingId] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const [currentUserId, setCurrentUserId] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUserId(Number(parsedUser.id));
    }

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await api.get("/auth/users");

      setUsers(res.data || []);
    } catch (error) {
      console.log(error);
      showErrorToast(error?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, email) => {
    const userId = Number(id);

    if (userId === Number(currentUserId)) {
      showErrorToast("You cannot delete your own account");
      return;
    }

    if (!confirm(`Delete user "${email}"? This cannot be undone.`)) return;

    try {
      setDeleteLoadingId(userId);

      await api.delete(`/auth/users/${userId}`);

      showSuccessToast("User deleted successfully");

      setUsers((prev) => prev.filter((user) => Number(user.id) !== userId));
    } catch (error) {
      console.log(error);
      showErrorToast(error?.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleRoleChange = async (id, role) => {
    const userId = Number(id);

    if (userId === Number(currentUserId)) {
      showErrorToast("You cannot change your own role");
      return;
    }

    const previousUsers = [...users];

    try {
      setRoleUpdatingId(userId);

      const res = await api.patch(`/auth/users/${userId}/role`, { role });

      const updatedUser = res.data?.user || res.data;

      if (!updatedUser || !updatedUser.role) {
        throw new Error("Invalid server response");
      }

      setUsers((prev) =>
        prev.map((user) =>
          Number(user.id) === userId
            ? {
                ...user,
                ...updatedUser,
                role: updatedUser.role,
              }
            : user
        )
      );

      showSuccessToast(
        `${updatedUser.username || updatedUser.email || "User"} is now ${
          updatedUser.role
        }`
      );
    } catch (error) {
      console.log(error);

      setUsers(previousUsers);

      showErrorToast(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update user role"
      );
    } finally {
      setRoleUpdatingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        user.username?.toLowerCase().includes(searchText) ||
        user.email?.toLowerCase().includes(searchText);

      const matchesRole = roleFilter === "All" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalAdmins = users.filter((user) => user.role === "ADMIN").length;
  const totalCustomers = users.filter((user) => user.role === "USER").length;

  if (loading) {
    return <AdminUsersSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <p className="text-[#D4AF37] text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2">
          Admin Panel
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Manage <span className="text-[#D4AF37]">Users</span>
        </h1>

        <p className="text-gray-400 text-sm mt-2">
          {users.length} user{users.length !== 1 ? "s" : ""} registered
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0d1117] border border-slate-700 rounded-2xl p-5">
          <p className="text-gray-400 text-sm">Total Users</p>
          <h2 className="text-2xl font-bold text-white mt-1">
            {users.length}
          </h2>
        </div>

        <div className="bg-[#0d1117] border border-slate-700 rounded-2xl p-5">
          <p className="text-gray-400 text-sm">Admins</p>
          <h2 className="text-2xl font-bold text-[#D4AF37] mt-1">
            {totalAdmins}
          </h2>
        </div>

        <div className="bg-[#0d1117] border border-slate-700 rounded-2xl p-5">
          <p className="text-gray-400 text-sm">Customers</p>
          <h2 className="text-2xl font-bold text-green-400 mt-1">
            {totalCustomers}
          </h2>
        </div>
      </div>

      <div className="bg-[#0d1117] border border-slate-700 rounded-2xl p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
          >
            <option value="All">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="USER">USER</option>
          </select>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="bg-[#0d1117] border border-slate-700 rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">👤</p>

          <h2 className="text-xl font-bold text-white">No Users Found</h2>

          <p className="text-gray-400 mt-2">Try changing search or filter.</p>
        </div>
      ) : (
        <div className="bg-[#0d1117] border border-slate-700 rounded-2xl overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
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
              {filteredUsers.map((user) => {
                const isCurrentUser =
                  Number(user.id) === Number(currentUserId);

                const isRoleUpdating =
                  Number(roleUpdatingId) === Number(user.id);

                const isDeleting =
                  Number(deleteLoadingId) === Number(user.id);

                return (
                  <tr
                    key={user.id}
                    className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4 text-white text-sm font-semibold">
                      {user.username || "N/A"}
                    </td>

                    <td className="px-6 py-4 text-gray-300 text-sm">
                      {user.email}
                    </td>

                    <td className="px-6 py-4">
                      {isCurrentUser ? (
                        <span className="text-xs px-3 py-1 rounded-full font-medium bg-[#D4AF37]/20 text-[#D4AF37]">
                          {user.role}
                        </span>
                      ) : (
                        <select
                          value={user.role}
                          disabled={isRoleUpdating}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value)
                          }
                          className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      )}
                    </td>

                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(user.createdAt).toLocaleDateString("en-PK")}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {!isCurrentUser ? (
                        <button
                          onClick={() => handleDelete(user.id, user.email)}
                          disabled={isDeleting}
                          className="text-xs px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeleting ? "Deleting..." : "🗑️ Delete"}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500 italic">
                          Current User
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}