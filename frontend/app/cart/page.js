"use client";

import Link from "next/link";
import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CartContext } from "@/context/CartContext";
import CartSkeleton from "@/components/skeletons/CartSkeleton";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    removeSelectedFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
    startCheckout,
  } = useContext(CartContext);

  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const isAllSelected = cart.length > 0 && selectedIds.length === cart.length;

  const toggleSelected = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : cart.map((item) => item.id));
  };

  const handleRemoveSelected = () => {
    removeSelectedFromCart(selectedIds);
    setSelectedIds([]);
  };

  const handleClearCart = () => {
    clearCart();
    setSelectedIds([]);
  };

  const selectedItems = useMemo(() => {
    return cart.filter((item) => selectedIds.includes(item.id));
  }, [cart, selectedIds]);

  const totalItems = selectedItems.length;

  const totalQuantity = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const total = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const estimatedSavings = Math.round(total * 0.1);

  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) return;

    startCheckout(selectedItems);
    router.push("/checkout");
  };

  if (loading) {
    return <CartSkeleton />;
  }

  return (
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div
        className="absolute inset-0 z-0"
        style={{ background: "rgba(10, 22, 40, 0.82)" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-screen flex flex-col">
        <div className="mb-6 sm:mb-8">
          <p className="text-[#D4AF37] text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2">
            Style Avenue
          </p>

          <h1 className="text-2xl sm:text-4xl font-bold text-white">
            Shopping <span className="text-[#D4AF37]">Cart</span>
          </h1>
        </div>

        <div className="flex-1">
          {cart.length === 0 ? (
            <div
              className="text-center py-16 sm:py-20 rounded-2xl border"
              style={{
                backgroundColor: "rgba(13, 31, 56, 0.85)",
                borderColor: "rgba(212,175,55,0.25)",
              }}
            >
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div
                  className="mb-4 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  style={{
                    backgroundColor: "rgba(13, 31, 56, 0.85)",
                    borderColor: "rgba(212,175,55,0.25)",
                  }}
                >
                  <label className="flex items-center gap-3 text-white font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="w-5 h-5 accent-[#D4AF37] cursor-pointer"
                    />
                    Select All
                  </label>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleRemoveSelected}
                      disabled={selectedIds.length === 0}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove Selected
                    </button>

                    <button
                      onClick={handleClearCart}
                      className="px-4 py-2 rounded-lg border border-[#D4AF37]/40 text-[#D4AF37] font-semibold hover:bg-[#D4AF37]/10 transition"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>

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

                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <span className="text-gray-400 text-xs sm:text-sm">
                            Quantity:
                          </span>

                          <div
                            className="flex items-center border rounded-lg overflow-hidden"
                            style={{
                              borderColor: "rgba(212,175,55,0.3)",
                            }}
                          >
                            <button
                              onClick={() => decreaseQuantity(item.id)}
                              disabled={item.quantity <= 1}
                              className="w-9 h-9 flex items-center justify-center text-[#D4AF37] text-xl font-bold hover:bg-[#D4AF37]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                              -
                            </button>

                            <span className="w-10 h-9 flex items-center justify-center text-white text-sm font-semibold select-none border-x border-[#D4AF37]/20">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() => increaseQuantity(item.id)}
                              className="w-9 h-9 flex items-center justify-center text-[#D4AF37] text-xl font-bold hover:bg-[#D4AF37]/10 transition-colors cursor-pointer"
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
                      onClick={() => {
                        removeFromCart(item.id);
                        setSelectedIds((prev) =>
                          prev.filter((id) => id !== item.id)
                        );
                      }}
                      className="bg-red-500 text-white px-4 sm:px-5 py-2 rounded-lg transition hover:bg-red-600 hover:scale-105 text-sm sm:text-base w-full sm:w-auto shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div
                className="h-fit rounded-2xl border p-5 sm:p-6 sticky top-6"
                style={{
                  backgroundColor: "rgba(13, 31, 56, 0.9)",
                  borderColor: "rgba(212,175,55,0.3)",
                }}
              >
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                  Cart <span className="text-[#D4AF37]">Summary</span>
                </h2>

                <div className="space-y-3 text-sm sm:text-base">
                  <div className="flex justify-between text-gray-300">
                    <span>Selected Items</span>
                    <span>{totalItems}</span>
                  </div>

                  <div className="flex justify-between text-gray-300">
                    <span>Total Quantity</span>
                    <span>{totalQuantity}</span>
                  </div>

                  <div className="flex justify-between text-gray-300">
                    <span>Estimated Savings</span>
                    <span className="text-green-400">
                      Rs {estimatedSavings}
                    </span>
                  </div>

                  <div className="border-t border-[#D4AF37]/30 pt-4 flex justify-between text-white font-bold text-lg">
                    <span>Total</span>
                    <span className="text-[#D4AF37]">Rs {total}</span>
                  </div>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  disabled={selectedItems.length === 0}
                  className="w-full text-center mt-6 bg-[#D4AF37] text-[#001F14] px-8 py-3 rounded-lg font-semibold transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Proceed To Checkout
                </button>

                <p className="text-gray-400 text-xs mt-3 text-center">
                  {selectedItems.length} of {cart.length} item
                  {cart.length !== 1 ? "s" : ""} selected
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center sm:justify-end mt-12 sm:mt-16 pb-4">
          <div className="text-center sm:text-right">
            <p className="text-white text-xl sm:text-2xl font-bold leading-snug">
              Your <span className="text-[#D4AF37]">Style,</span>
              <br />
              Your Cart.
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