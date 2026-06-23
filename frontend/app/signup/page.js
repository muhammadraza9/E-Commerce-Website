"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import Link from "next/link";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

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

      await api.post("/auth/register", formData);

      showSuccessToast("Account Created Successfully");

      sessionStorage.setItem("prefillEmail", formData.email);

      router.push("/signin");
    } catch (error) {
      console.log(error);

      showErrorToast(
        error?.response?.data?.message || "Registration Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 pt-28 pb-10">

      {/* Background Image — welcome / new member theme */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1600&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Navy overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{ background: "rgba(10, 22, 40, 0.85)" }}
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
          Sign <span className="text-[#D4AF37]">Up</span>
        </h1>

        <div className="mb-5">
          <label className="block text-white mb-2">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
            className="w-full p-4 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            style={{ backgroundColor: "rgba(10,22,40,0.8)", borderColor: "#D4AF37", borderWidth: "1px" }}
            required
          />
        </div>

        <div className="mb-5">
          <label className="block text-white mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            className="w-full p-4 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            style={{ backgroundColor: "rgba(10,22,40,0.8)", borderColor: "#D4AF37", borderWidth: "1px" }}
            required
          />
        </div>

        <div className="mb-8">
          <label className="block text-white mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            className="w-full p-4 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            style={{ backgroundColor: "rgba(10,22,40,0.8)", borderColor: "#D4AF37", borderWidth: "1px" }}
            required
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-[#0B1F33] hover:bg-[#D4AF37] text-white border border-[#D4AF37] py-4 rounded-xl font-semibold text-lg transition-colors duration-200 disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="text-gray-400 text-center mt-6">
          Already have an account?{" "}
          <Link href="/signin" className="text-[#D4AF37] hover:text-white">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}