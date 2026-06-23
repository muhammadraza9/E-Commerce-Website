"use client";

import Link from "next/link";
import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { CartContext } from "@/context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, startCheckout } = useContext(CartContext);
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelected = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    );
  };

  const selectedItems = cart.filter((item) => selectedIds.includes(item.id));

  const total = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) return;
    startCheckout(selectedItems);
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen relative">

      {/* ── Full Page Background Image ── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Dark overlay — navy blue tint */}
      <div
        className="absolute inset-0 z-0"
        style={{ background: "rgba(10, 22, 40, 0.82)" }}
      />

      {/* ── Page Content ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-screen flex flex-col">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <p className="text-[#D4AF37] text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2">
            Style Avenue
          </p>
          <h1 className="text-2xl sm:text-4xl font-bold text-white">
            Shopping <span className="text-[#D4AF37]">Cart</span>
          </h1>
        </div>

        {/* Cart Items */}
        <div className="flex-1">
          {cart.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <div className="text-5xl sm:text-6xl mb-4">🛒</div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-white">
                Your Cart is Empty
              </h2>
              <p className="text-gray-400 mb-6 text-sm">
                Looks like you haven't added anything yet.
              </p>
              <Link
                href="/products"
                className="inline-block bg-[#D4AF37] text-[#001F14] px-6 py-3 rounded-md font-semibold hover:scale-105 transition"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-xl p-4 sm:p-5 mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 shadow-sm hover:shadow-lg transition w-full"
                  style={{
                    backgroundColor: "rgba(13, 31, 56, 0.85)",
                    borderColor: selectedIds.includes(item.id)
                      ? "#D4AF37"
                      : "rgba(212,175,55,0.2)",
                  }}
                >
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0 w-full sm:w-auto">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelected(item.id)}
                      className="w-5 h-5 accent-[#D4AF37] cursor-pointer shrink-0 mt-1"
                    />

                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-[#D4AF37]/30 shrink-0"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center text-gray-500 text-2xl border border-[#D4AF37]/20 shrink-0"
                        style={{ backgroundColor: "#0a1628" }}
                      >
                        📦
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-base sm:text-lg text-white truncate">
                        {item.name}
                      </h3>

                      {/* Quantity Selector */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                        <span className="text-gray-400 text-xs sm:text-sm">Quantity:</span>

                        <div
                          className="flex items-center border rounded-lg overflow-hidden"
                          style={{ borderColor: "rgba(212,175,55,0.3)" }}
                        >
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            className="px-3 py-1.5 sm:py-1 text-[#D4AF37] text-lg font-bold hover:bg-[#D4AF37]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer touch-manipulation"
                          >
                            -
                          </button>

                          <span className="px-3 sm:px-4 text-white text-sm font-semibold select-none">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="px-3 py-1.5 sm:py-1 text-[#D4AF37] text-lg font-bold hover:bg-[#D4AF37]/10 transition-colors cursor-pointer touch-manipulation"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <p className="font-semibold text-[#D4AF37] mt-2 text-sm sm:text-base">
                        Rs {item.price * item.quantity}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="bg-red-500 text-white px-4 sm:px-5 py-2 rounded-lg transition hover:bg-red-600 hover:scale-105 text-sm sm:text-base w-full sm:w-auto shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div className="mt-6 sm:mt-8 pt-6" style={{ borderTop: "1px solid rgba(212,175,55,0.3)" }}>
                <p className="text-gray-400 text-xs sm:text-sm mb-2">
                  {selectedItems.length} of {cart.length} item
                  {cart.length !== 1 ? "s" : ""} selected
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Total: <span className="text-[#D4AF37]">Rs {total}</span>
                </h2>
                <button
                  onClick={handleProceedToCheckout}
                  disabled={selectedItems.length === 0}
                  className="block sm:inline-block w-full sm:w-auto text-center mt-5 bg-[#D4AF37] text-[#001F14] px-8 py-3 rounded-lg font-semibold transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Proceed To Checkout
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Bottom Right Text ── */}
        <div className="flex justify-center sm:justify-end mt-12 sm:mt-16 pb-4">
          <div className="text-center sm:text-right">
            <p className="text-white text-xl sm:text-2xl font-bold leading-snug">
              Your <span className="text-[#D4AF37]">Style,</span><br />Your Cart.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Select your items and proceed to checkout.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}