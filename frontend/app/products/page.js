"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import ProductCard from "@/components/ProductCard";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-12">
      <h1 className="text-4xl font-bold text-white mb-8">
        Prod<span className="text-[#D4AF37]">ucts</span>
      </h1>

      <div className="grid md:grid-cols-3 gap-6 mb-24">
        {products.map((product) => (
          <div key={product.id} className="h-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}