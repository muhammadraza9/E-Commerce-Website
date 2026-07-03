"use client";

import { useContext } from "react";
import Link from "next/link";
import { CartContext } from "@/context/CartContext";
import { showCartToast } from "@/utils/toast";

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);

  const handleAddToCart = () => {
    addToCart(product);
    showCartToast(product);
  };

  return (
    <div
      className="
        group
        h-full
        flex
        flex-col
        bg-[#0B1F33]
        border border-[#D4AF37]/20
        rounded-xl
        overflow-hidden
        cursor-pointer
        transition-all duration-300
        hover:-translate-y-2
        hover:scale-105
        hover:border-[#D4AF37]
        hover:shadow-xl
        hover:shadow-[#D4AF37]/20
      "
    >
      {/* Image */}
      <div className="relative w-full h-64 overflow-hidden shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className="
            w-full
            h-full
            object-cover
            transition-transform
            duration-500
            group-hover:scale-110
          "
        />

        {/* Featured Badge */}
        {product.featured && (
          <span className="absolute top-3 left-3 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            ⭐ Featured
          </span>
        )}

        {/* Category Badge */}
        {product.category && (
          <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
            {product.category}
          </span>
        )}
      </div>

      {/* Content */}
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
            className="
              flex-1
              border
              border-[#D4AF37]
              text-[#D4AF37]
              text-center
              py-2
              rounded-lg
              font-semibold
              transition
              hover:bg-[#D4AF37]
              hover:text-black
            "
          >
            Details
          </Link>

          <button
            onClick={handleAddToCart}
            className="
              flex-1
              bg-[#D4AF37]
              text-black
              py-2
              rounded-lg
              font-semibold
              transition
              hover:bg-yellow-400
            "
          >
            Add Cart
          </button>

        </div>
      </div>
    </div>
  );
}