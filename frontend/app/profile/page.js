"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import api from "@/services/api";
import ProfilePhotoEditor from "@/components/ProfilePhotoEditor";
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton";
import {
  showSuccessToast,
  showErrorToast,
} from "@/utils/toast";

const statusColors = {
  Pending: "bg-yellow-500",
  Processing: "bg-blue-500",
  Shipped: "bg-purple-500",
  Delivered: "bg-green-500",
  Cancelled: "bg-red-600",
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [removeProfileImage, setRemoveProfileImage] =
    useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // ==========================
  // Load Profile
  // ==========================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
          router.replace("/signin");
          return;
        }

        const parsedUser = JSON.parse(storedUser);

        setUser(parsedUser);
        setUsername(
          parsedUser.username || parsedUser.name || ""
        );
        setEmail(parsedUser.email || "");
        setImagePreview(parsedUser.profileImage || "");

        try {
          const response = await api.get("/orders/my");

          setOrders(
            Array.isArray(response.data)
              ? response.data
              : []
          );
        } catch (error) {
          console.error("Orders load error:", error);
          setOrders([]);
        }
      } catch (error) {
        console.error("Profile load error:", error);

        localStorage.removeItem("user");
        localStorage.removeItem("token");

        router.replace("/signin");
      } finally {
        setPageLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  // ==========================
  // Open Edit Profile
  // ==========================

  const openEditProfile = () => {
    setUsername(user.username || user.name || "");
    setEmail(user.email || "");

    setImageFile(null);
    setImagePreview(user.profileImage || "");
    setRemoveProfileImage(false);

    setEditOpen((current) => !current);
    setPasswordOpen(false);
  };

  // ==========================
  // Update Profile
  // ==========================

  const handleUpdateProfile = async (event) => {
    event.preventDefault();

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanUsername || !cleanEmail) {
      showErrorToast(
        "Username and email are required"
      );
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("username", cleanUsername);
      formData.append("email", cleanEmail);

      if (imageFile) {
        formData.append(
          "profileImage",
          imageFile,
          imageFile.name || "profile-image.png"
        );
      }

      if (removeProfileImage) {
        formData.append(
          "removeProfileImage",
          "true"
        );
      }

      const response = await api.put(
        "/auth/profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedUser = response.data.user;

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      window.dispatchEvent(
        new Event("authChange")
      );

      setUser(updatedUser);
      setUsername(updatedUser.username || "");
      setEmail(updatedUser.email || "");
      setImagePreview(
        updatedUser.profileImage || ""
      );
      setImageFile(null);
      setRemoveProfileImage(false);
      setEditOpen(false);

      showSuccessToast(
        response.data.message ||
          "Profile updated successfully"
      );
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      showErrorToast(
        error?.response?.data?.message ||
          "Profile update failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // Change Password
  // ==========================

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (!oldPassword || !newPassword) {
      showErrorToast(
        "Please fill both password fields"
      );
      return;
    }

    if (
      newPassword.length < 4 ||
      newPassword.length > 9
    ) {
      showErrorToast(
        "New password must be 4 to 9 characters"
      );
      return;
    }

    if (oldPassword === newPassword) {
      showErrorToast(
        "New password must be different from old password"
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.put(
        "/auth/change-password",
        {
          oldPassword,
          newPassword,
        }
      );

      setOldPassword("");
      setNewPassword("");
      setPasswordOpen(false);

      showSuccessToast(
        response.data.message ||
          "Password changed successfully"
      );
    } catch (error) {
      showErrorToast(
        error?.response?.data?.message ||
          "Password change failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) =>
    (name || "U")
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const getStatusColor = (status) =>
    statusColors[status] || "bg-gray-500";

  if (pageLoading || !user) {
    return <ProfileSkeleton />;
  }

  const recentOrders = orders.slice(0, 3);
  const latestTrackingId =
    orders[0]?.trackingId || "";

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      {/* Profile Card */}

      <section className="border border-slate-700 rounded-2xl p-8 mb-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-[90px] h-[90px] rounded-full border-[3px] border-[#D4AF37] bg-[#D4AF37]/20 overflow-hidden flex items-center justify-center text-[#D4AF37] font-bold text-2xl">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.username || "Profile"}
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials(
                user.username || user.name
              )
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              {user.username || user.name}
            </h1>

            <p className="text-gray-400 text-sm mt-1">
              {user.email}
            </p>

            <span className="inline-block mt-3 text-xs px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37]">
              {user.role}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <button
              type="button"
              onClick={openEditProfile}
              className="px-5 py-2 rounded-lg bg-[#D4AF37] text-[#001F14] font-semibold hover:scale-105 transition"
            >
              Edit Profile
            </button>

            <button
              type="button"
              onClick={() => {
                setPasswordOpen(
                  (current) => !current
                );
                setEditOpen(false);
              }}
              className="px-5 py-2 rounded-lg border border-[#D4AF37]/40 text-[#D4AF37] font-semibold hover:bg-[#D4AF37]/10 transition"
            >
              Change Password
            </button>
          </div>
        </div>
      </section>

      {/* Edit Profile */}

      {editOpen && (
        <form
          onSubmit={handleUpdateProfile}
          className="border border-slate-700 rounded-2xl p-6 mb-6"
        >
          <h2 className="text-xl font-bold mb-6">
            Edit Profile
          </h2>

          <ProfilePhotoEditor
            currentImage={imagePreview}
            username={username}
            disabled={loading}
            onImageChange={({
              file,
              preview,
              remove,
            }) => {
              if (remove) {
                setImageFile(null);
                setImagePreview("");
                setRemoveProfileImage(true);
                return;
              }

              setImageFile(file || null);
              setImagePreview(preview || "");
              setRemoveProfileImage(false);
            }}
          />

          <label className="block text-sm text-gray-400 mb-2">
            Username
          </label>

          <input
            type="text"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
            className="w-full bg-transparent border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-[#D4AF37] mb-4"
            placeholder="Enter username"
            required
          />

          <label className="block text-sm text-gray-400 mb-2">
            Email Address
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            className="w-full bg-transparent border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-[#D4AF37]"
            placeholder="Enter email address"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-5 bg-[#D4AF37] text-[#001F14] px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Updating..."
              : "Update Profile"}
          </button>
        </form>
      )}

      {/* Change Password */}

      {passwordOpen && (
        <form
          onSubmit={handleChangePassword}
          className="border border-slate-700 rounded-2xl p-6 mb-6"
        >
          <h2 className="text-xl font-bold mb-4">
            Change Password
          </h2>

          <input
            type="password"
            value={oldPassword}
            onChange={(event) =>
              setOldPassword(event.target.value)
            }
            className="w-full bg-transparent border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-[#D4AF37] mb-4"
            placeholder="Enter old password"
            required
          />

          <input
            type="password"
            value={newPassword}
            onChange={(event) =>
              setNewPassword(event.target.value)
            }
            className="w-full bg-transparent border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-[#D4AF37]"
            placeholder="Enter new password"
            required
            minLength={4}
            maxLength={9}
          />

          <p className="text-gray-500 text-xs mt-2">
            Password must be 4 to 9 characters.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-[#D4AF37] text-[#001F14] px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading
              ? "Changing..."
              : "Change Password"}
          </button>
        </form>
      )}

      {/* Navigation Cards */}

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Link
          href="/profile/my-orders"
          className="border border-slate-700 rounded-2xl p-5 flex items-center gap-3 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition"
        >
          <span className="text-2xl">📦</span>

          <div>
            <p className="font-semibold text-sm">
              My Orders
            </p>

            <p className="text-gray-400 text-xs">
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
          className="border border-slate-700 rounded-2xl p-5 flex items-center gap-3 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition"
        >
          <span className="text-2xl">🚚</span>

          <div>
            <p className="font-semibold text-sm">
              Track Order
            </p>

            <p className="text-gray-400 text-xs">
              Track your delivery
            </p>
          </div>
        </Link>
      </section>

      {/* Recent Orders */}

      <section className="border border-slate-700 rounded-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            Recent Orders
          </h2>

          {orders.length > 3 && (
            <Link
              href="/profile/my-orders"
              className="text-[#D4AF37] text-sm font-semibold hover:underline"
            >
              View All
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-400">
              No Orders Found
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() =>
                  router.push(
                    `/profile/my-orders/${order.id}`
                  )
                }
                className="w-full text-left border border-slate-700 rounded-xl p-5 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition"
              >
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <p className="font-semibold">
                      {order.trackingId}
                    </p>

                    <p className="text-gray-400 text-sm mt-1">
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString(
                        "en-PK"
                      )}
                    </p>
                  </div>

                  <span
                    className={`${getStatusColor(
                      order.status
                    )} px-3 py-1 rounded-full text-white text-xs`}
                  >
                    {order.status}
                  </span>
                </div>

                <p className="text-[#D4AF37] mt-3 font-semibold">
                  Rs{" "}
                  {Number(
                    order.total || 0
                  ).toLocaleString("en-PK")}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}