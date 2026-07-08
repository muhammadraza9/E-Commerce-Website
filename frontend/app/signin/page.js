"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import Link from "next/link";
import SignInSkeleton from "@/components/skeletons/SignInSkeleton";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

export default function SigninPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const prefillEmail = sessionStorage.getItem("prefillEmail");

      if (prefillEmail) {
        setFormData((prev) => ({
          ...prev,
          email: prefillEmail,
        }));

        sessionStorage.removeItem("prefillEmail");
      }

      setPageLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await api.post("/auth/login", formData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      window.dispatchEvent(new Event("authChange"));

      showSuccessToast("Login Successful");

      setTimeout(() => {
        if (res.data.user.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }, 500);
    } catch (error) {
      console.log(error);
      showErrorToast(error?.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <SignInSkeleton />;
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div
        className="absolute inset-0 z-0"
        style={{
          background: "rgba(10, 22, 40, 0.85)",
        }}
      />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg rounded-2xl p-10 border"
        style={{
          backgroundColor: "rgba(13, 31, 56, 0.85)",
          borderColor: "rgba(212,175,55,0.25)",
        }}
      >
        <h1 className="text-4xl font-bold text-white mb-10 text-center">
          Sign <span className="text-[#D4AF37]">In</span>
        </h1>

        <div className="mb-5">
          <label className="block text-white mb-2">Email</label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            className="w-full p-4 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            style={{
              backgroundColor: "rgba(10,22,40,0.8)",
              borderColor: "#D4AF37",
              borderWidth: "1px",
            }}
            required
          />
        </div>

        <div className="mb-3">
          <label className="block text-white mb-2">Password</label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            className="w-full p-4 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            style={{
              backgroundColor: "rgba(10,22,40,0.8)",
              borderColor: "#D4AF37",
              borderWidth: "1px",
            }}
            required
          />
        </div>

        <div className="text-right mb-8">
          <Link
            href="/forgot-password"
            className="text-sm text-[#D4AF37] hover:text-white hover:underline transition"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          disabled={loading}
          className="w-full bg-[#0B1F33] hover:bg-[#D4AF37] text-white hover:text-black border border-[#D4AF37] py-4 rounded-xl font-semibold text-lg transition-colors duration-200 disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <p className="text-gray-400 text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#D4AF37] hover:text-white">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}