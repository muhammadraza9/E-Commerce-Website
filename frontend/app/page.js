"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/services/api";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");

      // Show only first 8 products on home page
      setProducts(res.data.slice(0, 8));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className="min-h-screen">

      {/* Hero Section */}
      <section className="relative px-6 py-32 flex items-center overflow-hidden min-h-[420px]">
        {/* Background image layer — brightness filter applied here only,
            so it doesn't wash out the text on top */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(2)",
          }}
        />

        {/* Lighter overlay so text stays readable while the image looks brighter */}
        <div className="absolute inset-0 bg-black/25" />

        <div className="relative max-w-7xl mx-auto w-full">
          <h1 className="text-5xl font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
            Welcome To <span className="text-[#D4AF37]">Style Avenue !</span>
          </h1>

          <p className="mt-4 text-lg text-white font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            <span className="text-[#D4AF37]">Explore our latest collection </span> of fashion products.
          </p>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-4xl font-bold text-white">
            Featured Products
          </h2>

          <Link
            href="/products"
            className="text-[#D4AF37] font-semibold hover:underline"
          >
            View All
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            No Products Found
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}

        <Link
          href="/products"
          className="inline-block mt-8 bg-[#D4AF37] text-[#001F14] px-6 py-3 rounded-md font-semibold hover:scale-105 transition"
        >
          Shop Now
        </Link>
      </section>

      {/* Space Between Products And Footer */}
      <div className="h-32"></div>

    </main>
  );
}