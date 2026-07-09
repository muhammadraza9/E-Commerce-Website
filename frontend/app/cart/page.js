"use client";

import Link from "next/link";
import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CartContext } from "@/context/CartContext";
import CartSkeleton from "@/components/skeletons/CartSkeleton";
import { showErrorToast } from "@/utils/toast";

const money = (value) => `Rs ${Number(value || 0).toLocaleString("en-PK")}`;
const stock = (item) => Number(item.stock || 0);

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
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const selectedItems = useMemo(
    () => cart.filter((item) => selectedIds.includes(item.id)),
    [cart, selectedIds]
  );

  const invalidSelectedItems = selectedItems.filter(
    (item) => stock(item) <= 0 || Number(item.quantity || 1) > stock(item)
  );

  const total = selectedItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const totalQuantity = selectedItems.reduce(
    (sum, item) => sum + Number(item.quantity || 1),
    0
  );

  const isAllSelected = cart.length > 0 && selectedIds.length === cart.length;

  const toggleSelected = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : cart.map((item) => item.id));
  };

  const removeItem = (id) => {
    removeFromCart(id);
    setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
  };

  const removeSelected = () => {
    removeSelectedFromCart(selectedIds);
    setSelectedIds([]);
  };

  const clearAll = () => {
    clearCart();
    setSelectedIds([]);
  };

  const checkout = () => {
    if (selectedItems.length === 0) return;

    if (invalidSelectedItems.length > 0) {
      showErrorToast("Please remove or update out-of-stock items");
      return;
    }

    const ok = startCheckout(selectedItems);
    if (ok) router.push("/checkout");
  };

  if (loading) return <CartSkeleton />;

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

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 min-h-screen">
        <Header />

        {cart.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2">
              <CartActions
                isAllSelected={isAllSelected}
                selectedCount={selectedIds.length}
                onSelectAll={toggleSelectAll}
                onRemoveSelected={removeSelected}
                onClearCart={clearAll}
              />

              {cart.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  selected={selectedIds.includes(item.id)}
                  onToggle={() => toggleSelected(item.id)}
                  onIncrease={() => increaseQuantity(item.id)}
                  onDecrease={() => decreaseQuantity(item.id)}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </section>

            <Summary
              selectedItems={selectedItems}
              cartCount={cart.length}
              total={total}
              totalQuantity={totalQuantity}
              hasInvalidItems={invalidSelectedItems.length > 0}
              onCheckout={checkout}
            />
          </div>
        )}

        <FooterText />
      </main>
    </div>
  );
}

function Header() {
  return (
    <div className="mb-8">
      <p className="text-[#D4AF37] text-sm font-semibold tracking-widest uppercase mb-2">
        Style Avenue
      </p>

      <h1 className="text-3xl sm:text-4xl font-bold text-white">
        Shopping <span className="text-[#D4AF37]">Cart</span>
      </h1>
    </div>
  );
}

function EmptyCart() {
  return (
    <div
      className="text-center py-20 rounded-2xl border"
      style={{
        backgroundColor: "rgba(13, 31, 56, 0.85)",
        borderColor: "rgba(212,175,55,0.25)",
      }}
    >
      <div className="text-6xl mb-4">🛒</div>

      <h2 className="text-2xl font-semibold mb-2 text-white">
        Your Cart is Empty
      </h2>

      <p className="text-gray-400 mb-6 text-sm">
        Looks like you haven&apos;t added anything yet.
      </p>

      <Link
        href="/products"
        className="inline-block bg-[#D4AF37] text-black px-6 py-3 rounded-md font-semibold hover:scale-105 transition"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

function CartActions({
  isAllSelected,
  selectedCount,
  onSelectAll,
  onRemoveSelected,
  onClearCart,
}) {
  return (
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
          onChange={onSelectAll}
          className="w-5 h-5 accent-[#D4AF37]"
        />
        Select All
      </label>

      <div className="flex gap-2">
        <button
          onClick={onRemoveSelected}
          disabled={selectedCount === 0}
          className="px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50"
        >
          Remove Selected
        </button>

        <button
          onClick={onClearCart}
          className="px-3 py-2 rounded-lg border border-[#D4AF37]/40 text-[#D4AF37] text-sm font-semibold hover:bg-[#D4AF37]/10"
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
}

function CartItem({
  item,
  selected,
  onToggle,
  onIncrease,
  onDecrease,
  onRemove,
}) {
  const itemStock = stock(item);
  const quantity = Number(item.quantity || 1);
  const remainingStock = Math.max(itemStock - quantity, 0);

  const isOut = itemStock <= 0;
  const isMax = quantity >= itemStock;
  const isInvalid = isOut || quantity > itemStock;

  return (
    <div
      className="mb-4 p-4 rounded-xl border transition"
      style={{
        backgroundColor: "rgba(13, 31, 56, 0.85)",
        borderColor: selected ? "#D4AF37" : "rgba(212,175,55,0.2)",
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="w-5 h-5 accent-[#D4AF37]"
        />

        <img
          src={item.image || "/placeholder-product.png"}
          alt={item.name}
          className={`w-20 h-20 rounded-lg object-cover border border-[#D4AF37]/30 ${
            isOut ? "opacity-60 grayscale" : ""
          }`}
        />

        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold truncate">{item.name}</h3>

          <p
            className={`text-xs mt-1 ${
              isOut
                ? "text-red-400"
                : isMax
                ? "text-yellow-400"
                : "text-green-400"
            }`}
          >
            {isOut
              ? "Out of Stock"
              : isMax
              ? "Stock limit reached"
              : `${remainingStock} left in stock`}
          </p>

          {isInvalid && (
            <p className="text-red-400 text-xs mt-1">
              Please update or remove this item.
            </p>
          )}

          <p className="text-[#D4AF37] font-semibold mt-2">
            {money(Number(item.price || 0) * quantity)}
          </p>
        </div>

        <div className="flex items-center border border-[#D4AF37]/30 rounded-lg overflow-hidden">
          <button
            onClick={onDecrease}
            disabled={quantity <= 1}
            className="w-9 h-9 text-[#D4AF37] text-xl font-bold hover:bg-[#D4AF37]/10 disabled:opacity-40"
          >
            -
          </button>

          <span className="w-10 h-9 flex items-center justify-center text-white border-x border-[#D4AF37]/20">
            {quantity}
          </span>

          <button
            onClick={onIncrease}
            disabled={isOut || isMax}
            className="w-9 h-9 text-[#D4AF37] text-xl font-bold hover:bg-[#D4AF37]/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>

        <button
          onClick={onRemove}
          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function Summary({
  selectedItems,
  cartCount,
  total,
  totalQuantity,
  hasInvalidItems,
  onCheckout,
}) {
  const estimatedSavings = Math.round(total * 0.1);

  return (
    <aside
      className="h-fit rounded-2xl border p-6 sticky top-6"
      style={{
        backgroundColor: "rgba(13, 31, 56, 0.9)",
        borderColor: "rgba(212,175,55,0.3)",
      }}
    >
      <h2 className="text-2xl font-bold text-white mb-4">
        Cart <span className="text-[#D4AF37]">Summary</span>
      </h2>

      <div className="space-y-3">
        <Row label="Selected Items" value={selectedItems.length} />
        <Row label="Total Quantity" value={totalQuantity} />
        <Row
          label="Estimated Savings"
          value={money(estimatedSavings)}
          valueClass="text-green-400"
        />

        <div className="border-t border-[#D4AF37]/30 pt-4 flex justify-between text-white font-bold text-lg">
          <span>Total</span>
          <span className="text-[#D4AF37]">{money(total)}</span>
        </div>
      </div>

      {hasInvalidItems && (
        <p className="text-red-400 text-xs mt-4">
          Some selected items are out of stock or exceed available stock.
        </p>
      )}

      <button
        onClick={onCheckout}
        disabled={selectedItems.length === 0 || hasInvalidItems}
        className="w-full mt-6 bg-[#D4AF37] text-black px-8 py-3 rounded-lg font-semibold hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Proceed To Checkout
      </button>

      <p className="text-gray-400 text-xs mt-3 text-center">
        {selectedItems.length} of {cartCount} item
        {cartCount !== 1 ? "s" : ""} selected
      </p>
    </aside>
  );
}

function Row({ label, value, valueClass = "text-gray-300" }) {
  return (
    <div className="flex justify-between text-gray-300">
      <span>{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

function FooterText() {
  return (
    <div className="flex justify-center sm:justify-end mt-16 pb-4">
      <div className="text-center sm:text-right">
        <p className="text-white text-2xl font-bold leading-snug">
          Your <span className="text-[#D4AF37]">Style,</span>
          <br />
          Your Cart.
        </p>

        <p className="text-gray-400 text-sm mt-2">
          Select your items and proceed to checkout.
        </p>
      </div>
    </div>
  );
}