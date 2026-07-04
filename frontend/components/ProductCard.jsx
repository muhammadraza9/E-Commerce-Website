"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import api from "@/services/api";
import { CartContext } from "@/context/CartContext";
import { FavoritesContext } from "@/context/FavoritesContext";
import {
  showCartToast,
  showSuccessToast,
  showErrorToast,
} from "@/utils/toast";

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);

  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const favorite = isFavorite(product.id);

  useEffect(() => {
    fetchProductRating();
  }, [product.id]);

  const fetchProductRating = async () => {
    try {
      const res = await api.get(`/reviews/product/${product.id}`);

      setAverageRating(res.data.averageRating || 0);
      setTotalReviews(res.data.totalReviews || 0);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
    showCartToast(product);
  };

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();

    toggleFavorite(product);

    if (favorite) {
      showErrorToast("Removed from Favorites");
    } else {
      showSuccessToast("Added to Favorites");
    }
  };

  return (
    <div className="group h-full flex flex-col bg-[#0B1F33] border border-[#D4AF37]/20 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:border-[#D4AF37] hover:shadow-xl hover:shadow-[#D4AF37]/20">
      <div className="relative w-full h-64 overflow-hidden shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <button
          type="button"
          onClick={handleFavorite}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-xl hover:scale-110 transition z-10"
          title={favorite ? "Remove from Favorites" : "Add to Favorites"}
        >
          {favorite ? "❤️" : "🤍"}
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

        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="text-yellow-400">
            {averageRating > 0 ? "★" : "☆"}
          </span>

          <span className="text-gray-300">
            {averageRating > 0 ? averageRating : "No rating"}
          </span>

          <span className="text-gray-500">
            ({totalReviews} review{totalReviews !== 1 ? "s" : ""})
          </span>
        </div>

        <div className="h-12 overflow-hidden mt-2">
          <p className="text-gray-400 text-sm">{product.description}</p>
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
            type="button"
            onClick={handleAddToCart}
            className="flex-1 bg-[#D4AF37] text-black py-2 rounded-lg font-semibold transition hover:bg-yellow-400"
          >
            Add Cart
          </button>
        </div>
      </div>
    </div>
  );
}