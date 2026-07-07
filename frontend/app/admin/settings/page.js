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

  storeLogoUrl: "",
  whatsappNumber: "",
  instagramUrl: "",
  facebookUrl: "",
  supportHours: "",
  taxPercentage: "",
  codEnabled: true,
  freeShippingEnabled: true,
  orderPrefix: "SA",
  lowStockAlertLimit: "",
  maintenanceMode: false,
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
        ...DEFAULT_SETTINGS,
        ...res.data,
      });
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to load admin settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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

      const payload = {
        ...settings,
        shippingFee: Number(settings.shippingFee || 0),
        freeShippingLimit: Number(settings.freeShippingLimit || 0),
        taxPercentage: Number(settings.taxPercentage || 0),
        lowStockAlertLimit: Number(settings.lowStockAlertLimit || 5),
      };

      const res = await api.put("/admin-settings", payload);

      setSettings({
        ...DEFAULT_SETTINGS,
        ...res.data.settings,
      });

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
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-[#D4AF37] text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2">
          Admin Panel
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Admin <span className="text-[#D4AF37]">Settings</span>
        </h1>

        <p className="text-gray-400 text-sm mt-2">
          Manage store identity, delivery, payment, social links and system
          settings.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-8"
      >
        {/* Store Information */}
        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-5">
            Store Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Store Name"
              name="storeName"
              value={settings.storeName}
              onChange={handleChange}
              required
            />

            <Input
              label="Store Email"
              name="storeEmail"
              type="email"
              value={settings.storeEmail}
              onChange={handleChange}
              required
            />

            <Input
              label="Phone Number"
              name="phoneNumber"
              value={settings.phoneNumber}
              onChange={handleChange}
              required
            />

            <Input
              label="WhatsApp Number"
              name="whatsappNumber"
              value={settings.whatsappNumber || ""}
              onChange={handleChange}
            />

            <div className="md:col-span-2">
              <Input
                label="Store Logo URL"
                name="storeLogoUrl"
                value={settings.storeLogoUrl || ""}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-white mb-2">Store Address</label>
              <textarea
                name="storeAddress"
                value={settings.storeAddress || ""}
                onChange={handleChange}
                rows={4}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37] resize-none"
              />
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-5">
            Social Links
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Instagram URL"
              name="instagramUrl"
              value={settings.instagramUrl || ""}
              onChange={handleChange}
            />

            <Input
              label="Facebook URL"
              name="facebookUrl"
              value={settings.facebookUrl || ""}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Shipping & Tax */}
        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-5">
            Shipping & Tax
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Currency"
              name="currency"
              value={settings.currency}
              onChange={handleChange}
            />

            <Input
              label="Shipping Fee"
              name="shippingFee"
              type="number"
              value={settings.shippingFee}
              onChange={handleChange}
            />

            <Input
              label="Free Shipping Limit"
              name="freeShippingLimit"
              type="number"
              value={settings.freeShippingLimit}
              onChange={handleChange}
            />

            <Input
              label="Tax Percentage"
              name="taxPercentage"
              type="number"
              value={settings.taxPercentage}
              onChange={handleChange}
            />

            <Toggle
              label="Free Shipping Enabled"
              name="freeShippingEnabled"
              checked={settings.freeShippingEnabled}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Orders & Payment */}
        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-5">
            Orders & Payment
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Order Prefix"
              name="orderPrefix"
              value={settings.orderPrefix || "SA"}
              onChange={handleChange}
            />

            <Input
              label="Low Stock Alert Limit"
              name="lowStockAlertLimit"
              type="number"
              value={settings.lowStockAlertLimit}
              onChange={handleChange}
            />

            <Toggle
              label="Cash On Delivery Enabled"
              name="codEnabled"
              checked={settings.codEnabled}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* System */}
        <section>
          <h2 className="text-xl font-bold text-[#D4AF37] mb-5">
            System Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Support Hours"
              name="supportHours"
              value={settings.supportHours || ""}
              onChange={handleChange}
            />

            <Toggle
              label="Maintenance Mode"
              name="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={handleChange}
              danger
            />
          </div>
        </section>

        <div className="flex justify-end pt-4 border-t border-slate-700">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#D4AF37] text-black px-8 py-3 rounded-xl font-bold hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Admin Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="block text-white mb-2">{label}</label>

      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
      />
    </div>
  );
}

function Toggle({ label, name, checked, onChange, danger = false }) {
  return (
    <label className="flex items-center justify-between gap-4 bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 cursor-pointer">
      <span className="text-white font-medium">{label}</span>

      <input
        type="checkbox"
        name={name}
        checked={Boolean(checked)}
        onChange={onChange}
        className={`w-5 h-5 ${
          danger ? "accent-red-500" : "accent-[#D4AF37]"
        }`}
      />
    </label>
  );
}