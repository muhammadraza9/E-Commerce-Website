"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { CartContext } from "@/context/CartContext";
import CheckoutSkeleton from "@/components/skeletons/CheckoutSkeleton";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

const DEFAULT_SETTINGS = {
  shippingFee: 0,
  freeShippingLimit: 0,
  taxPercentage: 0,
  codEnabled: true,
  freeShippingEnabled: true,
};

const money = (value) => `Rs ${Number(value || 0).toLocaleString("en-PK")}`;
const stock = (item) => Number(item.stock || 0);

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, checkoutItems, removeCheckedOutItems } = useContext(CartContext);

  const items = checkoutItems.length ? checkoutItems : cart;

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "",
  });

  useEffect(() => {
    initCheckout();
  }, []);

  const initCheckout = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (!user || !token) {
        showErrorToast("Please sign in to place an order");
        router.push("/signin");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        name: user.username || user.name || "",
        email: user.email || "",
      }));

      const res = await api.get("/admin-settings");
      setSettings({ ...DEFAULT_SETTINGS, ...res.data });
    } catch {
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setCheckingAuth(false);
    }
  };

  const invalidItems = useMemo(() => {
    return items.filter(
      (item) => stock(item) <= 0 || Number(item.quantity || 1) > stock(item)
    );
  }, [items]);

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const shippingFee = Number(settings.shippingFee || 0);
  const freeShippingLimit = Number(settings.freeShippingLimit || 0);
  const taxPercentage = Number(settings.taxPercentage || 0);

  const isFreeShipping =
    settings.freeShippingEnabled &&
    freeShippingLimit > 0 &&
    subtotal >= freeShippingLimit;

  const finalShipping = isFreeShipping ? 0 : shippingFee;
  const taxableAmount = Math.max(subtotal - discountAmount, 0);
  const taxAmount = Math.round((taxableAmount * taxPercentage) / 100);
  const grandTotal = taxableAmount + finalShipping + taxAmount;

  const paymentMethods = [
    ...(settings.codEnabled ? [{ id: "COD", label: "Cash On Delivery" }] : []),
    { id: "JAZZCASH", label: "JazzCash" },
    { id: "EASYPAISA", label: "EasyPaisa" },
  ];

  const isFormComplete =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.phone.trim() &&
    formData.address.trim() &&
    formData.paymentMethod;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return showErrorToast("Please enter coupon code");

    try {
      setCouponLoading(true);

      const res = await api.post("/coupons/apply", {
        code: couponCode.trim().toUpperCase(),
        subtotal,
      });

      setAppliedCoupon(res.data.coupon);
      setDiscountAmount(Number(res.data.discountAmount || 0));
      showSuccessToast("Coupon applied successfully");
    } catch (error) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      showErrorToast(error?.response?.data?.message || "Invalid coupon code");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setDiscountAmount(0);
    showSuccessToast("Coupon removed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!localStorage.getItem("token")) {
      showErrorToast("Please sign in to place an order");
      router.push("/signin");
      return;
    }

    if (!items.length) return showErrorToast("Your cart is empty");
    if (invalidItems.length) return showErrorToast("Please fix stock issues first");
    if (!formData.paymentMethod) return showErrorToast("Please select payment method");

    try {
      setLoading(true);

      const orderData = {
        customer: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        paymentMethod: formData.paymentMethod,
        subtotal,
        discountAmount,
        couponCode: appliedCoupon?.code || null,
        shippingFee: finalShipping,
        taxAmount,
        taxPercentage,
        grandTotal,
        total: grandTotal,
        items: items.map((item) => ({
          productId: item.id,
          quantity: Number(item.quantity || 1),
          price: Number(item.price || 0),
        })),
      };

      const res = await api.post("/orders", orderData);

      localStorage.setItem("trackingId", res.data.trackingId);
      removeCheckedOutItems(items.map((item) => item.id));

      showSuccessToast("Order placed successfully");

      setTimeout(() => router.push("/order-success"), 1000);
    } catch (error) {
      showErrorToast(error?.response?.data?.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) return <CheckoutSkeleton />;

  return (
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url('https://wallpapers.com/images/hd/e-commerce-1920-x-1080-wallpaper-tb4uqckgoo0883zw.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div
        className="absolute inset-0 z-0"
        style={{ background: "rgba(10, 22, 40, 0.85)" }}
      />

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-12 min-h-screen">
        <h1 className="text-4xl font-bold mb-8 text-white">
          Check<span className="text-[#D4AF37]">out</span>
        </h1>

        <OrderSummary
          items={items}
          invalidItems={invalidItems}
          couponCode={couponCode}
          setCouponCode={setCouponCode}
          appliedCoupon={appliedCoupon}
          couponLoading={couponLoading}
          applyCoupon={applyCoupon}
          removeCoupon={removeCoupon}
          subtotal={subtotal}
          discountAmount={discountAmount}
          finalShipping={finalShipping}
          isFreeShipping={isFreeShipping}
          taxPercentage={taxPercentage}
          taxAmount={taxAmount}
          grandTotal={grandTotal}
        />

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl p-8 border"
          style={{
            backgroundColor: "rgba(13, 31, 56, 0.85)",
            borderColor: "rgba(212,175,55,0.25)",
          }}
        >
          <Input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
          <Input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          <Input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />

          <textarea
            name="address"
            placeholder="Shipping Address"
            rows="4"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full border text-white placeholder-gray-400 p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#D4AF37] resize-none"
            style={{
              backgroundColor: "rgba(10,22,40,0.8)",
              borderColor: "rgba(212,175,55,0.2)",
            }}
          />

          <div>
            <label className="block text-white mb-3 font-medium">
              Payment Method
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className="flex items-center gap-2 border rounded-xl p-4 cursor-pointer"
                  style={{
                    backgroundColor:
                      formData.paymentMethod === method.id
                        ? "rgba(212,175,55,0.15)"
                        : "rgba(10,22,40,0.8)",
                    borderColor:
                      formData.paymentMethod === method.id
                        ? "#D4AF37"
                        : "rgba(212,175,55,0.2)",
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={formData.paymentMethod === method.id}
                    onChange={handleChange}
                    className="accent-[#D4AF37] w-4 h-4"
                    required
                  />

                  <span className="text-white text-sm font-medium">
                    {method.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isFormComplete || invalidItems.length > 0}
            className="w-full py-3 rounded-xl font-semibold bg-[#D4AF37] text-[#0a1628] disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:scale-[1.02] transition"
          >
            {loading ? "Placing Order..." : `Place Order - ${money(grandTotal)}`}
          </button>
        </form>
      </main>
    </div>
  );
}

function OrderSummary({
  items,
  invalidItems,
  couponCode,
  setCouponCode,
  appliedCoupon,
  couponLoading,
  applyCoupon,
  removeCoupon,
  subtotal,
  discountAmount,
  finalShipping,
  isFreeShipping,
  taxPercentage,
  taxAmount,
  grandTotal,
}) {
  return (
    <div
      className="rounded-2xl p-6 mb-6 border"
      style={{
        backgroundColor: "rgba(13, 31, 56, 0.85)",
        borderColor: "rgba(212,175,55,0.25)",
      }}
    >
      <h2 className="text-lg font-semibold mb-4 text-white">
        {items.length} item{items.length !== 1 ? "s" : ""} in this order
      </h2>

      <div className="space-y-3">
        {items.map((item) => {
          const itemStock = stock(item);
          const qty = Number(item.quantity || 1);
          const remaining = Math.max(itemStock - qty, 0);
          const invalid = itemStock <= 0 || qty > itemStock;

          return (
            <div key={item.id} className="flex justify-between gap-3 text-sm">
              <div className="flex gap-3">
                <img
                  src={item.image || "/placeholder.png"}
                  alt={item.name}
                  className={`w-12 h-12 rounded-lg object-cover border border-[#D4AF37]/30 ${
                    invalid ? "opacity-60 grayscale" : ""
                  }`}
                />

                <div>
                  <p className="text-gray-300">
                    {item.name} × {qty}
                  </p>

                  <p
                    className={`text-xs ${
                      invalid ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {itemStock <= 0
                      ? "Out of stock"
                      : qty > itemStock
                      ? `Only ${itemStock} available`
                      : `${remaining} left after this order`}
                  </p>
                </div>
              </div>

              <span className="text-[#D4AF37] font-semibold">
                {money(Number(item.price || 0) * qty)}
              </span>
            </div>
          );
        })}
      </div>

      {invalidItems.length > 0 && (
        <p className="text-red-400 text-sm mt-4">
          Some items are out of stock or quantity exceeds available stock.
        </p>
      )}

      <div className="mt-5 pt-4 border-t border-[#D4AF37]/20">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            disabled={Boolean(appliedCoupon)}
            placeholder="Enter coupon code"
            className="flex-1 border text-white placeholder-gray-400 p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#D4AF37] disabled:opacity-60"
            style={{
              backgroundColor: "rgba(10,22,40,0.8)",
              borderColor: "rgba(212,175,55,0.2)",
            }}
          />

          <button
            type="button"
            onClick={appliedCoupon ? removeCoupon : applyCoupon}
            disabled={couponLoading}
            className={`px-5 py-3 rounded-lg font-semibold transition disabled:opacity-60 ${
              appliedCoupon
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-[#D4AF37] text-black hover:bg-yellow-400"
            }`}
          >
            {appliedCoupon
              ? "Remove"
              : couponLoading
              ? "Applying..."
              : "Apply"}
          </button>
        </div>

        {appliedCoupon && (
          <p className="text-green-400 text-sm mt-3">
            Coupon {appliedCoupon.code} applied successfully.
          </p>
        )}
      </div>

      <div className="mt-5 pt-4 space-y-3 border-t border-[#D4AF37]/20">
        <SummaryRow label="Subtotal" value={money(subtotal)} />

        {discountAmount > 0 && (
          <SummaryRow
            label={`Discount (${appliedCoupon?.code})`}
            value={`- ${money(discountAmount)}`}
            danger
          />
        )}

        <SummaryRow
          label="Shipping"
          value={isFreeShipping ? "Free" : money(finalShipping)}
          highlight={isFreeShipping}
        />

        <SummaryRow label={`Tax (${taxPercentage}%)`} value={money(taxAmount)} />

        <div className="pt-3 flex justify-between border-t border-slate-700 text-white font-bold text-lg">
          <span>Grand Total</span>
          <span className="text-[#D4AF37]">{money(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}

function Input({ name, value, onChange, placeholder, type = "text" }) {
  return (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      className="w-full border text-white placeholder-gray-400 p-3 rounded-lg outline-none focus:ring-2 focus:ring-[#D4AF37]"
      style={{
        backgroundColor: "rgba(10,22,40,0.8)",
        borderColor: "rgba(212,175,55,0.2)",
      }}
    />
  );
}

function SummaryRow({ label, value, highlight = false, danger = false }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-300">{label}</span>
      <span
        className={`font-semibold ${
          danger ? "text-red-400" : highlight ? "text-green-400" : "text-gray-200"
        }`}
      >
        {value}
      </span>
    </div>
  );
}