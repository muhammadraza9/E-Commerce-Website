"use client";

import { useContext, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { CartContext } from "@/context/CartContext";
import { showCartToast } from "@/utils/toast";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setNotFound(false);

      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch (error) {
      console.error(error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
    showCartToast(product);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-gray-400">Loading product...</p>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-gray-400 mb-4">Product not found.</p>

        <button
          onClick={() => router.push("/products")}
          className="inline-block mt-8 bg-[#D4AF37] text-white px-6 py-3 rounded-md font-semibold hover:scale-105 transition"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <button
        onClick={() => router.push("/products")}
        className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-[#D4AF37]/50 text-gray-300 hover:text-white mb-10 px-5 py-2.5 rounded-xl font-medium transition-all"
      >
        <span className="text-lg leading-none">←</span>
        Back to Products
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-xl">
        <div className="grid md:grid-cols-2 gap-10 md:gap-20 items-center">
          <div className="relative w-full aspect-[4/5] bg-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />

            {product.category && (
              <span className="absolute top-5 left-5 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full tracking-wide">
                {product.category}
              </span>
            )}
          </div>

          <div className="flex flex-col items-center text-center">
            {product.category && (
              <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-widest mb-3">
                {product.category}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-8">
              {product.name}
            </h1>

            <p className="text-gray-400 text-base leading-relaxed mb-10 max-w-md">
              {product.description}
            </p>

            <div className="h-px bg-slate-800 w-full mb-8" />

            <div className="mb-10">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">
                Price
              </p>

              <p className="text-[#D4AF37] font-bold text-4xl">
                Rs {product.price}
              </p>
            </div>

            <button
              onClick={handleAddToCart}
              className="min-w-[180px] bg-[#D4AF37] hover:bg-[#C9A227] text-white py-3 px-8 rounded-xl font-semibold whitespace-nowrap cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#D4AF37]/30 active:scale-95"
            >
              Add To Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}