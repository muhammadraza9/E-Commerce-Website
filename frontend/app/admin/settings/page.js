"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import AdminSettingsSkeleton from "@/components/skeletons/AdminSettingsSkeleton";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

const DEFAULT_SETTINGS = {
  storeName: "",
  storeEmail: "",
  phoneNumber: "",
  currency: "PKR",
  shippingFee: "",
  freeShippingLimit: "",
  storeAddress: "",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin-settings");

      setSettings({
        storeName: res.data.storeName || "",
        storeEmail: res.data.storeEmail || "",
        phoneNumber: res.data.phoneNumber || "",
        currency: res.data.currency || "PKR",
        shippingFee: res.data.shippingFee || "",
        freeShippingLimit: res.data.freeShippingLimit || "",
        storeAddress: res.data.storeAddress || "",
      });
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to load admin settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!settings.storeName.trim()) {
      showErrorToast("Store name is required");
      return;
    }

    if (!settings.storeEmail.trim()) {
      showErrorToast("Store email is required");
      return;
    }

    if (!settings.phoneNumber.trim()) {
      showErrorToast("Phone number is required");
      return;
    }

    try {
      setSaving(true);

      const res = await api.put("/admin-settings", settings);

      setSettings(res.data.settings);

      showSuccessToast("Admin settings saved successfully");
    } catch (error) {
      console.log(error);
      showErrorToast(
        error?.response?.data?.message || "Failed to save admin settings"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AdminSettingsSkeleton />;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-[#D4AF37] text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2">
          Admin Panel
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Admin <span className="text-[#D4AF37]">Settings</span>
        </h1>

        <p className="text-gray-400 text-sm mt-2">
          These settings are saved in database and available across all devices.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
          <p className="text-gray-400 text-sm">Store Name</p>
          <h2 className="text-xl font-bold text-white mt-1">
            {settings.storeName}
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
          <p className="text-gray-400 text-sm">Currency</p>
          <h2 className="text-xl font-bold text-[#D4AF37] mt-1">
            {settings.currency}
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
          <p className="text-gray-400 text-sm">Shipping Fee</p>
          <h2 className="text-xl font-bold text-green-400 mt-1">
            Rs {settings.shippingFee}
          </h2>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-white mb-2">Store Name</label>
            <input
              type="text"
              name="storeName"
              value={settings.storeName}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2">Store Email</label>
            <input
              type="email"
              name="storeEmail"
              value={settings.storeEmail}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={settings.phoneNumber}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2">Currency</label>
            <select
              name="currency"
              value={settings.currency}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
            >
              <option value="PKR">PKR</option>
              <option value="USD">USD</option>
              <option value="AED">AED</option>
              <option value="SAR">SAR</option>
            </select>
          </div>

          <div>
            <label className="block text-white mb-2">Shipping Fee</label>
            <input
              type="number"
              name="shippingFee"
              value={settings.shippingFee}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
              min="0"
            />
          </div>

          <div>
            <label className="block text-white mb-2">
              Free Shipping Limit
            </label>
            <input
              type="number"
              name="freeShippingLimit"
              value={settings.freeShippingLimit}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
              min="0"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-white mb-2">Store Address</label>
            <textarea
              name="storeAddress"
              value={settings.storeAddress}
              onChange={handleChange}
              rows={4}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37] resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-6 bg-[#D4AF37] text-black px-6 py-3 rounded-xl font-semibold hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Admin Settings"}
        </button>
      </form>
    </div>
  );
}