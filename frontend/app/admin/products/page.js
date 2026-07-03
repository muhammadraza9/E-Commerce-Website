"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/services/api";
import {
  showSuccessToast,
  showErrorToast,
} from "@/utils/toast";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const limit = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 400);

    return () => clearTimeout(timer);
  }, [search, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage,
        limit,
        search,
      });

      const res = await api.get(`/products?${params.toString()}`);

      setProducts(res.data.products);
      setCurrentPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
      setTotalProducts(res.data.totalProducts);
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

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

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const renderPages = () => {
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg border transition cursor-pointer ${
            currentPage === i
              ? "bg-[#D4AF37] text-black border-[#D4AF37]"
              : "bg-[#0d1117] text-white border-slate-700 hover:border-[#D4AF37]"
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  const startProduct =
    totalProducts === 0 ? 0 : (currentPage - 1) * limit + 1;

  const endProduct = Math.min(
    currentPage * limit,
    totalProducts
  );

  return (
    <div className="max-w-7xl mx-auto">

      {/* Header */}

      <div className="mb-10">

        <h1 className="text-4xl font-bold text-white">
          Admin{" "}
          <span className="text-[#D4AF37]">
            Products
          </span>
        </h1>

        <p className="text-gray-400 mt-2">
          Total Products : {totalProducts}
        </p>

      </div>

      {/* Search */}

      <div className="flex flex-col md:flex-row gap-4 mb-10">

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="flex-1 bg-[#0d1117] border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-[#D4AF37] transition"
        />

        <Link
          href="/admin/products/add"
          className="md:w-56 flex items-center justify-center bg-[#D4AF37] hover:bg-[#c9a227] rounded-xl text-white font-semibold transition"
        >
          + Add Product
        </Link>

      </div>

      {/* Loading */}

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          Loading Products...
        </div>
      ) : (
        <>
          {/* Products */}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {products.map((product) => (

              <div
                key={product.id}
                className="group bg-[#0d1117] border border-slate-800 rounded-2xl overflow-hidden hover:border-[#D4AF37] transition"
              >

                <div className="relative aspect-[4/5] overflow-hidden">

                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />

                  <span className="absolute top-3 left-3 bg-black/70 px-3 py-1 rounded-full text-xs text-white">
                    {product.category}
                  </span>

                  {product.featured && (
                    <span className="absolute top-3 right-3 bg-[#D4AF37] text-black px-3 py-1 rounded-full text-xs font-bold">
                      ⭐ Featured
                    </span>
                  )}

                </div>

                <div className="p-5">

                  <h2 className="text-white text-lg font-semibold">
                    {product.name}
                  </h2>

                  <p className="text-gray-400 text-sm line-clamp-2 mt-2">
                    {product.description}
                  </p>

                  <p className="text-[#D4AF37] font-bold text-lg mt-3">
                    Rs {product.price}
                  </p>

                  <div className="mt-3">

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.featured
                          ? "bg-green-600 text-white"
                          : "bg-slate-700 text-gray-300"
                      }`}
                    >
                      {product.featured
                        ? "Featured Product"
                        : "Normal Product"}
                    </span>

                  </div>

                  <div className="flex gap-3 mt-6">

                    <Link
                      href={`/admin/products/edit/${product.id}`}
                      className="flex-1 text-center bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-white transition"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() =>
                        handleDelete(product.id)
                      }
                      className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg text-white cursor-pointer transition"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

          {/* No Products */}

          {products.length === 0 && (
            <div className="text-center text-gray-400 py-20">
              No products found.
            </div>
          )}

          {/* Pagination */}

          {totalPages > 1 && (

            <div className="mt-14">

              <div className="text-center text-gray-400 mb-6">

                Showing{" "}
                <span className="text-[#D4AF37] font-semibold">
                  {startProduct}
                </span>

                {" "}to{" "}

                <span className="text-[#D4AF37] font-semibold">
                  {endProduct}
                </span>

                {" "}of{" "}

                <span className="text-[#D4AF37] font-semibold">
                  {totalProducts}
                </span>{" "}
                Products

              </div>

              <div className="flex justify-center gap-2 flex-wrap">

                <button
                  onClick={() =>
                    handlePageChange(currentPage - 1)
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-slate-700 bg-[#0d1117] text-white disabled:opacity-40 hover:border-[#D4AF37] transition cursor-pointer"
                >
                  Prev
                </button>

                {renderPages()}

                <button
                  onClick={() =>
                    handlePageChange(currentPage + 1)
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-slate-700 bg-[#0d1117] text-white disabled:opacity-40 hover:border-[#D4AF37] transition cursor-pointer"
                >
                  Next
                </button>

              </div>

            </div>

          )}
        </>
      )}
    </div>
  );
}