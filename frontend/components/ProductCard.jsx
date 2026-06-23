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
      </div>

      <div className="p-3 flex flex-col">
        <h3 className="text-white text-lg font-semibold truncate">
          {product.name}
        </h3>

        <div className="h-10 overflow-hidden mt-1">
          <p className="text-gray-400 text-sm">
            {product.description}
          </p>
        </div>

        <p className="text-[#D4AF37] text-xl font-bold mt-2">
          Rs {product.price}
        </p>

        <div className="mt-4 flex gap-2">
          <Link
            href={`/products/${product.id}`}
            className="
              flex-1
              border border-[#D4AF37]
              text-[#D4AF37]
              text-center
              py-2
              rounded-lg
              text-sm
              font-semibold
              transition-all
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
              text-white
              py-2
              rounded-lg
              text-sm
              font-semibold
              transition-all
              hover:bg-[#c9a227]
              hover:scale-105
              cursor-pointer
            "
          >
            Add To Cart
          </button>
        </div>
      </div>
    </div>
  );
}