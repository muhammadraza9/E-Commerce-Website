"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import ProductCard from "@/components/ProductCard";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");

      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Fetch Products Error:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-12">
      <h1 className="text-4xl font-bold text-white mb-8">
        Prod<span className="text-[#D4AF37]">ucts</span>
      </h1>

      {loading ? (
        <div className="text-center text-gray-400 py-16 text-lg">
          Loading Products...
        </div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-400 py-16 text-lg">
          No Products Found
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-24">
          {products.map((product) => (
            <div key={product.id} className="h-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}