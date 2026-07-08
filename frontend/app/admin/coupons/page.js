"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

const emptyForm = {
  code: "",
  type: "PERCENTAGE",
  value: "",
  minimumOrder: "",
  expiryDate: "",
  usageLimit: "",
  isActive: true,
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get("/coupons");
      setCoupons(res.data || []);
    } catch (error) {
      showErrorToast("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      showErrorToast("Coupon code is required");
      return;
    }

    if (!formData.value || Number(formData.value) <= 0) {
      showErrorToast("Discount value is required");
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await api.put(`/coupons/${editingId}`, formData);
        showSuccessToast("Coupon updated");
      } else {
        await api.post("/coupons", formData);
        showSuccessToast("Coupon created");
      }

      resetForm();
      fetchCoupons();
    } catch (error) {
      showErrorToast(error?.response?.data?.message || "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (coupon) => {
    setEditingId(coupon.id);

    setFormData({
      code: coupon.code || "",
      type: coupon.type || "PERCENTAGE",
      value: coupon.value || "",
      minimumOrder: coupon.minimumOrder || "",
      expiryDate: coupon.expiryDate ? coupon.expiryDate.slice(0, 10) : "",
      usageLimit: coupon.usageLimit || "",
      isActive: coupon.isActive,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this coupon?")) return;

    try {
      await api.delete(`/coupons/${id}`);
      showSuccessToast("Coupon deleted");
      fetchCoupons();
    } catch (error) {
      showErrorToast("Failed to delete coupon");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <p className="text-[#D4AF37] text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2">
          Admin Panel
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Manage <span className="text-[#D4AF37]">Coupons</span>
        </h1>

        <p className="text-gray-400 text-sm mt-2">
          Create discount codes for your customers.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 mb-8"
      >
        <h2 className="text-xl font-bold text-[#D4AF37] mb-5">
          {editingId ? "Edit Coupon" : "Create Coupon"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Input
            label="Coupon Code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="WELCOME10"
          />

          <div>
            <label className="block text-white mb-2">Discount Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
            >
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED">Fixed Amount</option>
            </select>
          </div>

          <Input
            label="Discount Value"
            name="value"
            type="number"
            value={formData.value}
            onChange={handleChange}
            placeholder="10"
          />

          <Input
            label="Minimum Order"
            name="minimumOrder"
            type="number"
            value={formData.minimumOrder}
            onChange={handleChange}
            placeholder="5000"
          />

          <Input
            label="Expiry Date"
            name="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={handleChange}
          />

          <Input
            label="Usage Limit"
            name="usageLimit"
            type="number"
            value={formData.usageLimit}
            onChange={handleChange}
            placeholder="100"
          />

          <label className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-5 h-5 accent-[#D4AF37]"
            />
            <span className="text-white">Coupon Active</span>
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            disabled={saving}
            className="bg-[#D4AF37] text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : editingId ? "Update Coupon" : "Create Coupon"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="border border-slate-600 text-gray-300 px-6 py-3 rounded-xl font-semibold hover:border-[#D4AF37] hover:text-[#D4AF37] transition"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left">
          <thead>
            <tr className="border-b border-slate-700 text-gray-400 text-sm">
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Value</th>
              <th className="px-6 py-4">Min Order</th>
              <th className="px-6 py-4">Used</th>
              <th className="px-6 py-4">Expiry</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="px-6 py-10 text-center text-gray-400">
                  Loading coupons...
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-10 text-center text-gray-400">
                  No coupons found.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr
                  key={coupon.id}
                  className="border-b border-slate-800 hover:bg-slate-800/40"
                >
                  <td className="px-6 py-4 text-[#D4AF37] font-bold">
                    {coupon.code}
                  </td>

                  <td className="px-6 py-4 text-white">{coupon.type}</td>

                  <td className="px-6 py-4 text-gray-300">
                    {coupon.type === "PERCENTAGE"
                      ? `${coupon.value}%`
                      : `Rs ${coupon.value}`}
                  </td>

                  <td className="px-6 py-4 text-gray-300">
                    Rs {coupon.minimumOrder}
                  </td>

                  <td className="px-6 py-4 text-gray-300">
                    {coupon.usedCount}/{coupon.usageLimit || "∞"}
                  </td>

                  <td className="px-6 py-4 text-gray-300">
                    {coupon.expiryDate
                      ? new Date(coupon.expiryDate).toLocaleDateString("en-PK")
                      : "No Expiry"}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        coupon.isActive
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {coupon.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Input({ label, name, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div>
      <label className="block text-white mb-2">{label}</label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37] placeholder:text-gray-500"
      />
    </div>
  );
}