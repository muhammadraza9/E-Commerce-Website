"use client";

import Link from "next/link";
import { useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CartContext } from "@/context/CartContext";
import { FavoritesContext } from "@/context/FavoritesContext";
import { showSuccessToast } from "@/utils/toast";

export default function Navbar() {
  const { cart } = useContext(CartContext);
  const { favorites } = useContext(FavoritesContext);
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const menuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileButtonRef = useRef(null);

  const loadUser = () => {
    try {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    } catch {
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();

    window.addEventListener("authChange", loadUser);
    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("authChange", loadUser);
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        mobileButtonRef.current &&
        !mobileButtonRef.current.contains(event.target)
      ) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setShowProfileMenu(false);
    setShowMobileMenu(false);

    window.dispatchEvent(new Event("authChange"));
    showSuccessToast("Logout Successful");

    setTimeout(() => router.push("/signin"), 800);
  };

  const cartCount = cart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const favoritesCount = favorites.length;

  const getInitials = (name) =>
    (name || "U")
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const renderAvatar = (size, textSize = "text-sm") => (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        border: "2px solid #D4AF37",
      }}
      className={`bg-[#D4AF37]/20 overflow-hidden flex items-center justify-center text-[#D4AF37] font-bold ${textSize}`}
    >
      {user?.profileImage ? (
        <img
          src={user.profileImage}
          alt={user.username || user.name || "Profile"}
          className="w-full h-full object-cover"
        />
      ) : (
        getInitials(user?.username || user?.name)
      )}
    </div>
  );

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/products", label: "Products" },
    { href: "/favorites", label: "Favorites" },
    { href: "/cart", label: "Cart" },
    { href: "/checkout", label: "Checkout" },
    { href: "/track-order", label: "Track Order" },
  ];

  return (
    <header className="bg-[#102A43] text-[#F8F5F0] border-b border-[#D4AF37]/20 shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className="flex items-center justify-center rounded-md"
            style={{
              width: 40,
              height: 40,
              background: "linear-gradient(135deg, #E8C765, #D4AF37)",
              flexShrink: 0,
            }}
          >
            <span className="text-[#0B1F33] font-bold text-sm">SA</span>
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-xl font-bold text-white group-hover:text-[#D4AF37] transition-colors duration-200">
              Style Avenue
            </span>

            <span className="text-[10px] tracking-[0.2em] text-[#D4AF37]">
              PREMIUM FASHION
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex gap-6 items-center">
          <Link
            href="/"
            className="text-sm hover:text-[#D4AF37] transition-colors"
          >
            Home
          </Link>

          <Link
            href="/about"
            className="text-sm hover:text-[#D4AF37] transition-colors"
          >
            About
          </Link>

          <Link
            href="/contact"
            className="text-sm hover:text-[#D4AF37] transition-colors"
          >
            Contact
          </Link>

          <Link
            href="/products"
            className="text-sm hover:text-[#D4AF37] transition-colors"
          >
            Products
          </Link>

          <Link
            href="/favorites"
            className="relative text-sm hover:text-[#D4AF37] transition-colors"
          >
            Favorites <span className="text-lg">❤️</span>

            {favoritesCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-10px",
                  right: "-12px",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  backgroundColor: "red",
                  color: "white",
                  fontSize: 10,
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {favoritesCount}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            className="relative text-sm hover:text-[#D4AF37] transition-colors"
          >
            Cart <span className="text-lg">🛒</span>

            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-10px",
                  right: "-12px",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  backgroundColor: "red",
                  color: "white",
                  fontSize: 10,
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            href="/checkout"
            className="text-sm hover:text-[#D4AF37] transition-colors"
          >
            Checkout
          </Link>

          <Link
            href="/track-order"
            className="text-sm hover:text-[#D4AF37] transition-colors"
          >
            Track Order
          </Link>

          {!user ? (
            <>
              <Link
                href="/signin"
                className="bg-[#D4AF37] text-white px-4 py-2 rounded-md text-sm font-medium hover:scale-105 transition"
              >
                Sign In
              </Link>

              <Link
                href="/signup"
                className="bg-[#D4AF37] text-white px-4 py-2 rounded-md text-sm font-medium hover:scale-105 transition"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu((prev) => !prev)}
                className="rounded-full hover:scale-110 hover:shadow-[0_0_0_3px_rgba(212,175,55,0.4)] transition cursor-pointer"
                aria-label="Open profile menu"
              >
                {renderAvatar(40)}
              </button>

              {showProfileMenu && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-[#0d1117] border border-slate-700 rounded-xl shadow-2xl z-[9999] overflow-hidden">
                  <div className="px-4 py-5 border-b border-slate-700">
                    <div className="flex flex-col items-center gap-3 text-center">
                      {renderAvatar(64, "text-xl")}

                      <div className="w-full min-w-0">
                        <p className="text-white font-semibold text-sm">
                          {user.username || user.name}
                        </p>

                        <p className="text-gray-400 text-xs mt-0.5 truncate">
                          {user.email}
                        </p>

                        <span className="inline-block mt-2 text-xs px-3 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-medium">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="py-2 flex flex-col gap-1">
                    <Link
                      href="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-slate-800 hover:text-white transition rounded-lg mx-2"
                    >
                      <span>👤</span>
                      My Profile
                    </Link>

                    <Link
                      href="/profile/my-orders"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-slate-800 hover:text-white transition rounded-lg mx-2"
                    >
                      <span>📦</span>
                      My Orders
                    </Link>

                    <Link
                      href="/favorites"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-slate-800 hover:text-white transition rounded-lg mx-2"
                    >
                      <span>❤️</span>
                      Favorites
                    </Link>

                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-slate-800 hover:text-white transition rounded-lg mx-2"
                      >
                        <span>⚙️</span>
                        Admin Panel
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-slate-700 py-2">
                    <button
                      type="button"
                      onClick={logout}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 transition rounded-lg mx-2 w-[calc(100%-16px)] cursor-pointer"
                    >
                      <span>🚪</span>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="flex items-center gap-4 lg:hidden">
          <button
            ref={mobileButtonRef}
            type="button"
            onClick={() => setShowMobileMenu((prev) => !prev)}
            className="text-2xl text-[#D4AF37] cursor-pointer leading-none"
            aria-label="Toggle menu"
          >
            {showMobileMenu ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {showMobileMenu && (
        <div
          ref={mobileMenuRef}
          className="lg:hidden border-t border-[#D4AF37]/20 bg-[#0d1117] px-6 py-4 max-h-[80vh] overflow-y-auto"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setShowMobileMenu(false)}
                className="relative text-sm text-gray-300 hover:text-[#D4AF37] hover:bg-slate-800 transition px-3 py-3 rounded-lg flex items-center gap-1"
              >
                <span>{link.label}</span>

                {link.href === "/cart" && (
                  <>
                    <span className="text-lg">🛒</span>

                    {cartCount > 0 && (
                      <span className="ml-1 w-[18px] h-[18px] rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </>
                )}

                {link.href === "/favorites" && (
                  <>
                    <span className="text-lg">❤️</span>

                    {favoritesCount > 0 && (
                      <span className="ml-1 w-[18px] h-[18px] rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {favoritesCount}
                      </span>
                    )}
                  </>
                )}
              </Link>
            ))}

            {!user ? (
              <div className="flex flex-col gap-2 mt-3">
                <Link
                  href="/signin"
                  onClick={() => setShowMobileMenu(false)}
                  className="bg-[#D4AF37] text-white text-center px-4 py-3 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>

                <Link
                  href="/signup"
                  onClick={() => setShowMobileMenu(false)}
                  className="bg-[#D4AF37] text-white text-center px-4 py-3 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="mt-3 border-t border-slate-700 pt-3">
                <div className="flex items-center gap-3 px-3 py-2">
                  {renderAvatar(44)}

                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm">
                      {user.username || user.name}
                    </p>

                    <p className="text-gray-400 text-xs truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm text-gray-300 hover:bg-slate-800 hover:text-white transition rounded-lg"
                >
                  <span>👤</span>
                  My Profile
                </Link>

                <Link
                  href="/profile/my-orders"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm text-gray-300 hover:bg-slate-800 hover:text-white transition rounded-lg"
                >
                  <span>📦</span>
                  My Orders
                </Link>

                <Link
                  href="/favorites"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm text-gray-300 hover:bg-slate-800 hover:text-white transition rounded-lg"
                >
                  <span>❤️</span>
                  Favorites
                </Link>

                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-3 py-3 text-sm text-gray-300 hover:bg-slate-800 hover:text-white transition rounded-lg"
                  >
                    <span>⚙️</span>
                    Admin Panel
                  </Link>
                )}

                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-3 px-3 py-3 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 transition rounded-lg w-full cursor-pointer"
                >
                  <span>🚪</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}