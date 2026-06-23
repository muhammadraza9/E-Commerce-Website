"use client";

import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { CartContext } from "@/context/CartContext";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

export default function CheckoutPage() {
  const router = useRouter();

  const { cart, checkoutItems, removeCheckedOutItems } = useContext(CartContext);

  const itemsToCheckout = checkoutItems.length > 0 ? checkoutItems : cart;

  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setFormData((prev) => ({
        ...prev,
        name: userData.username || userData.name || prev.name,
        email: userData.email || prev.email,
      }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      const total = itemsToCheckout.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const orderData = {
        customer: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        paymentMethod: formData.paymentMethod,
        total,
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
      }, 1500);

    } catch (error) {
      console.log(error);
      showErrorToast("Order failed");
    } finally {
      setLoading(false);
    }
  };

  const total = itemsToCheckout.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ── All fields must be filled before order can be placed ──
  const isFormComplete =
    formData.name.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.phone.trim() !== "" &&
    formData.address.trim() !== "" &&
    formData.paymentMethod !== "";

  return (
    <div className="min-h-screen relative">

      {/* ── Full Page Background Image ── */}
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
      {/* Navy blue overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{ background: "rgba(10, 22, 40, 0.85)" }}
      />

      {/* ── Page Content ── */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12 min-h-screen">

        <h1 className="text-4xl font-bold mb-8 text-white">
          Check<span className="text-[#D4AF37]">out</span>
        </h1>

        {/* Items — only show before order is placed */}
        {!orderPlaced && (
          <div
            className="rounded-2xl p-6 mb-6 border"
            style={{
              backgroundColor: "rgba(13, 31, 56, 0.85)",
              borderColor: "rgba(212,175,55,0.25)",
            }}
          >
            <h2 className="text-lg font-semibold mb-4 text-white">
              {itemsToCheckout.length} item{itemsToCheckout.length !== 1 ? "s" : ""} in this order
            </h2>
            <div className="space-y-3">
              {itemsToCheckout.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
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
            <div
              className="mt-4 pt-4 flex justify-between items-center"
              style={{ borderTop: "1px solid rgba(212,175,55,0.2)" }}
            >
              <span className="text-white font-semibold">Total</span>
              <span className="text-[#D4AF37] font-bold text-lg">Rs {total}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl p-8 border"
          style={{
            backgroundColor: "rgba(13, 31, 56, 0.85)",
            borderColor: "rgba(212,175,55,0.25)",
          }}
        >
          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            className="w-full border text-white placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            style={{ backgroundColor: "rgba(10,22,40,0.8)", borderColor: "rgba(212,175,55,0.2)" }}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            className="w-full border text-white placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            style={{ backgroundColor: "rgba(10,22,40,0.8)", borderColor: "rgba(212,175,55,0.2)" }}
            onChange={handleChange}
            required
          />

          <input
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            className="w-full border text-white placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            style={{ backgroundColor: "rgba(10,22,40,0.8)", borderColor: "rgba(212,175,55,0.2)" }}
            onChange={handleChange}
            required
          />

          <textarea
            name="address"
            placeholder="Shipping Address"
            rows="4"
            value={formData.address}
            className="w-full border text-white placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] resize-none"
            style={{ backgroundColor: "rgba(10,22,40,0.8)", borderColor: "rgba(212,175,55,0.2)" }}
            onChange={handleChange}
            required
          />

          {/* Payment Method */}
          <div>
            <label className="block text-white mb-3 font-medium">
              Payment Method
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: "COD", label: "Cash On Delivery" },
                { id: "JAZZCASH", label: "JazzCash" },
                { id: "EASYPAISA", label: "EasyPaisa" },
              ].map((method) => (
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
            className="w-full py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer
              bg-[#D4AF37] text-[#0a1628]
              disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100
              enabled:hover:scale-[1.02]"
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>

        </form>

      </div>
    </div>
  );
}