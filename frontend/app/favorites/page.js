"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { CartContext } from "@/context/CartContext";
import { FavoritesContext } from "@/context/FavoritesContext";
import FavoritesSkeleton from "@/components/skeletons/FavoritesSkeleton";
import {
  showCartToast,
  showErrorToast,
  showSuccessToast,
} from "@/utils/toast";

export default function FavoritesPage() {
  const { addToCart } = useContext(CartContext);
  const { favorites, removeFromFavorites, clearFavorites } =
    useContext(FavoritesContext);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleMoveToCart = (product) => {
    addToCart(product);
    removeFromFavorites(product.id);
    showCartToast(product);
  };

  const handleRemove = (id) => {
    removeFromFavorites(id);
    showErrorToast("Removed from Favorites");
  };

  const handleClearFavorites = () => {
    if (!confirm("Clear all favorite products?")) return;

    clearFavorites();
    showSuccessToast("Favorites cleared");
  };

  if (loading) {
    return <FavoritesSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <p className="text-[#D4AF37] text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2">
            Style Avenue
          </p>

          <h1 className="text-4xl sm:text-5xl font-bold text-white">
            My <span className="text-[#D4AF37]">Favorites</span>
          </h1>

          <p className="text-gray-400 mt-2">
            {favorites.length} favorite product
            {favorites.length !== 1 ? "s" : ""}
          </p>
        </div>

        {favorites.length > 0 && (
          <button
            onClick={handleClearFavorites}
            className="px-5 py-3 rounded-xl border border-red-500/40 text-red-400 font-semibold hover:bg-red-500 hover:text-white transition"
          >
            Clear Favorites
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="border border-[#D4AF37]/20 bg-[#071827] rounded-2xl py-20 px-6 text-center">
          <p className="text-6xl mb-5">🤍</p>

          <h2 className="text-2xl font-bold text-white mb-2">
            No Favorite Products
          </h2>

          <p className="text-gray-400 mb-6">
            Save products you like and view them here later.
          </p>

          <Link
            href="/products"
            className="inline-block bg-[#D4AF37] text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {favorites.map((product) => (
            <div
              key={product.id}
              className="group h-full flex flex-col bg-[#0B1F33] border border-[#D4AF37]/20 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:border-[#D4AF37] hover:shadow-xl hover:shadow-[#D4AF37]/20"
            >
              <div className="relative w-full h-64 overflow-hidden shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <button
                  onClick={() => handleRemove(product.id)}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-xl hover:scale-110 transition"
                  title="Remove from Favorites"
                >
                  ❤️
                </button>

                {product.featured && (
                  <span className="absolute top-3 left-3 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    ⭐ Featured
                  </span>
                )}

                {product.category && (
                  <span className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
                    {product.category}
                  </span>
                )}
              </div>

              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-white text-lg font-semibold truncate">
                  {product.name}
                </h3>

                <div className="h-12 overflow-hidden mt-2">
                  <p className="text-gray-400 text-sm">
                    {product.description}
                  </p>
                </div>

                <p className="text-[#D4AF37] text-2xl font-bold mt-3">
                  Rs {product.price}
                </p>

                <div className="mt-auto pt-5 flex gap-2">
                  <Link
                    href={`/products/${product.id}`}
                    className="flex-1 border border-[#D4AF37] text-[#D4AF37] text-center py-2 rounded-lg font-semibold transition hover:bg-[#D4AF37] hover:text-black"
                  >
                    Details
                  </Link>

                  <button
                    onClick={() => handleMoveToCart(product)}
                    className="flex-1 bg-[#D4AF37] text-black py-2 rounded-lg font-semibold transition hover:bg-yellow-400"
                  >
                    Move Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}