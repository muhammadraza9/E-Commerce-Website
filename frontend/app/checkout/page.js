"use client";

import { useState, useContext, useEffect } from "react";
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

export default function CheckoutPage() {
  const router = useRouter();

  const { cart, checkoutItems, removeCheckedOutItems } =
    useContext(CartContext);

  const itemsToCheckout = checkoutItems.length > 0 ? checkoutItems : cart;

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "",
  });

  useEffect(() => {
    const initCheckout = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!storedUser || !token) {
          showErrorToast("Please sign in to place an order");
          router.push("/signin");
          return;
        }

        const userData = JSON.parse(storedUser);

        setFormData((prev) => ({
          ...prev,
          name: userData.username || userData.name || prev.name,
          email: userData.email || prev.email,
        }));

        const res = await api.get("/admin-settings");

        setSettings({
          ...DEFAULT_SETTINGS,
          ...res.data,
        });
      } catch (error) {
        console.log(error);
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setCheckingAuth(false);
      }
    };

    initCheckout();
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const subtotal = itemsToCheckout.reduce(
    (sum, item) => sum + item.price * item.quantity,
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
  const taxAmount = Math.round((subtotal * taxPercentage) / 100);
  const grandTotal = subtotal + finalShipping + taxAmount;

  const paymentMethods = [
    ...(settings.codEnabled
      ? [{ id: "COD", label: "Cash On Delivery" }]
      : []),
    { id: "JAZZCASH", label: "JazzCash" },
    { id: "EASYPAISA", label: "EasyPaisa" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      showErrorToast("Please sign in to place an order");
      router.push("/signin");
      return;
    }

    if (itemsToCheckout.length === 0) {
      showErrorToast("Your cart is empty");
      return;
    }

    if (!formData.paymentMethod) {
      showErrorToast("Please select a payment method");
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        customer: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        paymentMethod: formData.paymentMethod,
        total: grandTotal,
        items: itemsToCheckout.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const res = await api.post("/orders", orderData);

      localStorage.setItem("trackingId", res.data.trackingId);

      setOrderPlaced(true);

      showSuccessToast("Order placed successfully");

      removeCheckedOutItems(itemsToCheckout.map((item) => item.id));

      setTimeout(() => {
        router.push("/order-success");
      }, 1200);
    } catch (error) {
      console.log(error);

      if (error?.response?.status === 401) {
        showErrorToast("Please sign in to place an order");
        router.push("/signin");
      } else {
        showErrorToast("Order failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormComplete =
    formData.name.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.phone.trim() !== "" &&
    formData.address.trim() !== "" &&
    formData.paymentMethod !== "";

  if (checkingAuth) {
    return <CheckoutSkeleton />;
  }

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
          filter: "brightness(1)",
        }}
      />

      <div
        className="absolute inset-0 z-0"
        style={{ background: "rgba(10, 22, 40, 0.85)" }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12 min-h-screen">
        <h1 className="text-4xl font-bold mb-8 text-white">
          Check<span className="text-[#D4AF37]">out</span>
        </h1>

        {!orderPlaced && (
          <div
            className="rounded-2xl p-6 mb-6 border"
            style={{
              backgroundColor: "rgba(13, 31, 56, 0.85)",
              borderColor: "rgba(212,175,55,0.25)",
            }}
          >
            <h2 className="text-lg font-semibold mb-4 text-white">
              {itemsToCheckout.length} item
              {itemsToCheckout.length !== 1 ? "s" : ""} in this order
            </h2>

            <div className="space-y-3">
              {itemsToCheckout.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#D4AF37]/30 shrink-0">
                      <img
                        src={item.image || "/placeholder.png"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <span className="text-gray-300">
                      {item.name} × {item.quantity}
                    </span>
                  </div>

                  <span className="text-[#D4AF37] font-semibold">
                    Rs {item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 space-y-3 border-t border-[#D4AF37]/20">
              <SummaryRow label="Subtotal" value={`Rs ${subtotal}`} />

              <SummaryRow
                label="Shipping"
                value={isFreeShipping ? "Free" : `Rs ${finalShipping}`}
                highlight={isFreeShipping}
              />

              <SummaryRow
                label={`Tax (${taxPercentage}%)`}
                value={`Rs ${taxAmount}`}
              />

              <div className="pt-3 flex justify-between items-center border-t border-slate-700">
                <span className="text-white font-bold">Grand Total</span>
                <span className="text-[#D4AF37] font-bold text-xl">
                  Rs {grandTotal}
                </span>
              </div>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl p-8 border"
          style={{
            backgroundColor: "rgba(13, 31, 56, 0.85)",
            borderColor: "rgba(212,175,55,0.25)",
          }}
        >
          <Input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
          />

          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <Input
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
          />

          <textarea
            name="address"
            placeholder="Shipping Address"
            rows="4"
            value={formData.address}
            className="w-full border text-white placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] resize-none"
            style={{
              backgroundColor: "rgba(10,22,40,0.8)",
              borderColor: "rgba(212,175,55,0.2)",
            }}
            onChange={handleChange}
            required
          />

          <div>
            <label className="block text-white mb-3 font-medium">
              Payment Method
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className="flex items-center gap-2 border rounded-xl p-4 cursor-pointer transition-colors"
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
            disabled={loading || !isFormComplete}
            className="w-full py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer bg-[#D4AF37] text-[#0a1628] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 enabled:hover:scale-[1.02]"
          >
            {loading ? "Placing Order..." : `Place Order - Rs ${grandTotal}`}
          </button>
        </form>
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
      className="w-full border text-white placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
      style={{
        backgroundColor: "rgba(10,22,40,0.8)",
        borderColor: "rgba(212,175,55,0.2)",
      }}
      onChange={onChange}
      required
    />
  );
}

function SummaryRow({ label, value, highlight = false }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-300">{label}</span>
      <span
        className={`font-semibold ${
          highlight ? "text-green-400" : "text-gray-200"
        }`}
      >
        {value}
      </span>
    </div>
  );
}