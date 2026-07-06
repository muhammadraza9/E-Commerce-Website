"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/services/api";
import ProductCard from "@/components/ProductCard";
import HomeSkeleton from "@/components/skeletons/HomeSkeleton";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const res = await api.get("/products/featured");
      setProducts(res.data);
    } catch (error) {
      console.error(error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <main className="min-h-screen">

      {/* Hero */}

      <section className="relative px-6 py-32 flex items-center overflow-hidden min-h-[420px]">

        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(1.2)",
          }}
        />

        <div className="absolute inset-0 bg-black/30" />

        <div className="relative max-w-7xl mx-auto w-full">

          <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
            Welcome To
            <span className="text-[#D4AF37]"> Style Avenue</span>
          </h1>

          <p className="mt-6 text-lg text-gray-200 max-w-xl">
            Discover premium fashion, luxury clothing and accessories carefully
            selected for your style.
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              href="/products"
              className="bg-[#D4AF37] text-black px-7 py-3 rounded-xl font-semibold hover:scale-105 transition"
            >
              Shop Now
            </Link>

            <Link
              href="/about"
              className="border border-[#D4AF37] text-[#D4AF37] px-7 py-3 rounded-xl hover:bg-[#D4AF37]/10 transition"
            >
              Learn More
            </Link>
          </div>

        </div>

      </section>

      {/* Featured Products */}

      <section className="max-w-7xl mx-auto px-6 py-16">

        <div className="flex justify-between items-center mb-10">

          <div>

            <p className="text-[#D4AF37] uppercase tracking-widest text-sm">
              Collection
            </p>

            <h2 className="text-4xl font-bold text-white mt-2">
              Featured Products
            </h2>

          </div>

          <Link
            href="/products"
            className="text-[#D4AF37] hover:underline font-semibold"
          >
            View All →
          </Link>

        </div>

        {products.length === 0 ? (

          <div className="text-center text-gray-400 py-24">
            No Featured Products Available
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

        <div className="text-center mt-14">

          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#D4AF37] text-black px-8 py-3 rounded-xl font-semibold hover:scale-105 transition"
          >
            Explore All Products →
          </Link>

        </div>

      </section>

    </main>
  );
}