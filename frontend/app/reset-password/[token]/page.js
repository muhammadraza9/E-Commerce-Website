"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();

  const token = params?.token;

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.newPassword || !formData.confirmPassword) {
      showErrorToast("All fields are required");
      return;
    }

    if (formData.newPassword.length < 4 || formData.newPassword.length > 9) {
      showErrorToast("Password must be 4 to 9 characters");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showErrorToast("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/reset-password", {
        token,
        newPassword: formData.newPassword,
      });

      setSuccess(true);
      showSuccessToast("Password reset successfully");

      setTimeout(() => {
        router.push("/signin");
      }, 1200);
    } catch (error) {
      showErrorToast(
        error?.response?.data?.message || "Password reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-8">
        <p className="text-[#D4AF37] text-sm font-semibold tracking-widest uppercase mb-2">
          Style Avenue
        </p>

        <h1 className="text-3xl font-bold text-white mb-3">
          Reset <span className="text-[#D4AF37]">Password</span>
        </h1>

        <p className="text-gray-400 text-sm leading-6 mb-6">
          Create a new password for your account.
        </p>

        {success ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5">
            <p className="text-green-400 font-semibold mb-2">
              Password changed successfully.
            </p>
            <p className="text-gray-300 text-sm">
              Redirecting you to sign in...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="password"
              name="newPassword"
              placeholder="New password"
              value={formData.newPassword}
              onChange={handleChange}
              minLength={4}
              maxLength={9}
              autoComplete="new-password"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-[#D4AF37]"
              required
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength={4}
              maxLength={9}
              autoComplete="new-password"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-[#D4AF37]"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4AF37] text-black py-3 rounded-xl font-bold hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <div className="text-center">
              <Link
                href="/signin"
                className="text-gray-400 hover:text-[#D4AF37] text-sm transition"
              >
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}