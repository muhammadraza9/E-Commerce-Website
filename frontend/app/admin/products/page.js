"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to load products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/products/${id}`);
      showSuccessToast("Product deleted");
      fetchProducts();
    } catch (error) {
      console.log(error);
      showErrorToast("Delete failed");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white">
          Admin <span className="text-[#D4AF37]">Products </span>
        </h1>
        <p className="text-gray-400 mt-2">
          Total Products: {products.length}
        </p>
      </div>

      {/* Search + Add Product */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-4 rounded-xl bg-[#0d1117] border border-slate-700 text-white focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
          />
        </div>

        <Link
          href="/admin/products/add"
          className="md:w-56 flex items-center justify-center bg-[#D4AF37] hover:bg-[#C9A227] py-4 rounded-xl text-white font-semibold transition-colors duration-200 whitespace-nowrap"
        >
          + Add Product
        </Link>
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="group h-full flex flex-col">
            <div className="relative w-full aspect-[4/5] bg-slate-800 rounded-2xl overflow-hidden shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {product.category && (
                <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                  {product.category}
                </span>
              )}
            </div>

            <div className="pt-4 px-1 flex flex-col flex-1">
              <h2 className="text-white text-lg font-semibold truncate">
                {product.name}
              </h2>

              <div className="h-10 overflow-hidden mt-1">
                <p className="text-gray-400 text-sm">
                  {product.description}
                </p>
              </div>

              <p className="text-[#D4AF37] font-bold text-lg mt-2">
                Rs {product.price}
              </p>

              <div className="flex gap-3 mt-auto pt-4">
                <Link
                  href={`/admin/products/edit/${product.id}`}
                  className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Edit
                </Link>

                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white hover:border-red-500 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center text-gray-400 mt-16 py-12">
          No products found.
        </div>
      )}
    </div>
  );
}