"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/services/api";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const sendOtp = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      showErrorToast("Email is required");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      setOtpSent(true);
      showSuccessToast("OTP sent to your email");
    } catch (error) {
      console.log(error);

      showErrorToast(
        error?.response?.data?.message || "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();

    if (
      !formData.otp ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      showErrorToast("All fields are required");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showErrorToast("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/reset-password", {
        email: email.trim().toLowerCase(),
        otp: formData.otp.trim(),
        newPassword: formData.newPassword,
      });

      // 👇 Sign In page par email auto fill hogi
      sessionStorage.setItem(
        "prefillEmail",
        email.trim().toLowerCase()
      );

      showSuccessToast("Password reset successfully");

      setTimeout(() => {
        window.location.href = "/signin";
      }, 1000);
    } catch (error) {
      console.log(error);

      showErrorToast(
        error?.response?.data?.message || "Password reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-8">

        <h1 className="text-3xl font-bold text-white mb-3">
          Forgot <span className="text-[#D4AF37]">Password</span>
        </h1>

        <p className="text-gray-400 mb-8">
          {otpSent
            ? "Enter the OTP received on your email and choose a new password."
            : "Enter your registered email address to receive a password reset OTP."}
        </p>

        {!otpSent ? (
          <form onSubmit={sendOtp} className="space-y-5">

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4AF37] text-black py-3 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

          </form>
        ) : (
          <form onSubmit={resetPassword} className="space-y-5">

            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={formData.otp}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  otp: e.target.value,
                })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
              required
            />

            <input
              type="password"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  newPassword: e.target.value,
                })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
              required
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  confirmPassword: e.target.value,
                })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4AF37] text-black py-3 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>

          </form>
        )}

        <div className="text-center mt-6">
          <Link
            href="/signin"
            className="text-[#D4AF37] hover:text-white transition"
          >
            ← Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}