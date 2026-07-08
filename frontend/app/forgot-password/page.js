"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/services/api";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
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

      setSent(true);
      showSuccessToast("Reset link sent to your email");
    } catch (error) {
      showErrorToast(
        error?.response?.data?.message || "Failed to send reset link"
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
          Forgot <span className="text-[#D4AF37]">Password</span>
        </h1>

        <p className="text-gray-400 text-sm leading-6 mb-6">
          Enter your registered email address. We will send you a secure reset
          link valid for 15 minutes.
        </p>

        {sent ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5">
            <p className="text-green-400 font-semibold mb-2">
              Reset link sent successfully.
            </p>
            <p className="text-gray-300 text-sm">
              Please check your email inbox and spam folder.
            </p>

            <Link
              href="/signin"
              className="inline-block mt-5 text-[#D4AF37] font-semibold hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-[#D4AF37]"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4AF37] text-black py-3 rounded-xl font-bold hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Reset Link"}
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