"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/signin");
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);
    setUsername(userData.username || userData.name || "");
    fetchOrders(userData.email);
  }, [router]);

  const fetchOrders = async (email) => {
    try {
      const res = await api.get(`/orders/user/${email}`);
      setOrders(res.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const res = await api.put("/auth/profile", { username });

      const updatedUser = res.data.user;

      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("authChange"));

      setUser(updatedUser);
      setEditOpen(false);
      setMessage("Profile updated successfully");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      await api.put("/auth/change-password", {
        oldPassword,
        newPassword,
      });

      setOldPassword("");
      setNewPassword("");
      setPasswordOpen(false);
      setMessage("Password changed successfully");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Password change failed");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) =>
    (name || "U")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

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

  if (!user) {
    return <div className="text-center py-20 text-lg">Loading...</div>;
  }

  const latestTrackingId = orders.length > 0 ? orders[0]?.trackingId : "";
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {message && (
        <div className="mb-5 border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl px-5 py-3 text-sm">
          {message}
        </div>
      )}

      <div className="border border-slate-700 rounded-2xl p-8 mb-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              border: "3px solid #D4AF37",
            }}
            className="bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold text-2xl"
          >
            {getInitials(user?.username || user?.name)}
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              {user?.username || user?.name}
            </h1>

            <p className="text-gray-400 text-sm mt-1">{user?.email}</p>

            <span className="inline-block mt-3 text-xs px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37]">
              {user?.role}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <button
              onClick={() => {
                setEditOpen(!editOpen);
                setPasswordOpen(false);
              }}
              className="px-5 py-2 rounded-lg bg-[#D4AF37] text-[#001F14] font-semibold hover:scale-105 transition"
            >
              Edit Profile
            </button>

            <button
              onClick={() => {
                setPasswordOpen(!passwordOpen);
                setEditOpen(false);
              }}
              className="px-5 py-2 rounded-lg border border-[#D4AF37]/40 text-[#D4AF37] font-semibold hover:bg-[#D4AF37]/10 transition"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {editOpen && (
        <form
          onSubmit={handleUpdateProfile}
          className="border border-slate-700 rounded-2xl p-6 mb-6"
        >
          <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

          <label className="block text-sm text-gray-400 mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-transparent border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-[#D4AF37]"
            placeholder="Enter username"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-[#D4AF37] text-[#001F14] px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      )}

      {passwordOpen && (
        <form
          onSubmit={handleChangePassword}
          className="border border-slate-700 rounded-2xl p-6 mb-6"
        >
          <h2 className="text-xl font-bold mb-4">Change Password</h2>

          <label className="block text-sm text-gray-400 mb-2">
            Old Password
          </label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full bg-transparent border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-[#D4AF37] mb-4"
            placeholder="Enter old password"
          />

          <label className="block text-sm text-gray-400 mb-2">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-transparent border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-[#D4AF37]"
            placeholder="Enter new password"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-[#D4AF37] text-[#001F14] px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link
          href="/profile/my-orders"
          className="border border-slate-700 rounded-2xl p-5 flex items-center gap-3 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 hover:scale-105 transition-all duration-300"
        >
          <span className="text-2xl">📦</span>
          <div>
            <p className="font-semibold text-sm">My Orders</p>
            <p className="text-gray-400 text-xs mt-0.5">
              Total Orders: {orders.length}
            </p>
          </div>
        </Link>

        <Link
          href={
            latestTrackingId
              ? `/track-order?trackingId=${latestTrackingId}`
              : "/track-order"
          }
          className="border border-slate-700 rounded-2xl p-5 flex items-center gap-3 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 hover:scale-105 transition-all duration-300"
        >
          <span className="text-2xl">🚚</span>
          <div>
            <p className="font-semibold text-sm">Track Order</p>
            <p className="text-gray-400 text-xs mt-0.5">
              Track your delivery
            </p>
          </div>
        </Link>
      </div>

      <div className="border border-slate-700 rounded-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Recent Orders</h2>

          {orders.length > 3 && (
            <Link
              href="/profile/my-orders"
              className="text-[#D4AF37] text-sm font-semibold"
            >
              View All
            </Link>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-400">No Orders Found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => router.push(`/profile/my-orders/${order.id}`)}
                className="border border-slate-700 rounded-xl p-5 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all duration-300 cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{order.trackingId}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`${getStatusColor(
                      order.status
                    )} px-3 py-1 rounded-full text-white text-xs font-medium`}
                  >
                    {order.status}
                  </span>
                </div>

                <p className="text-[#D4AF37] mt-3 font-semibold">
                  Rs {order.total}
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  Click to view order details →
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}