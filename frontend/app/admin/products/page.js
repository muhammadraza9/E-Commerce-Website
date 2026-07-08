"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import AdminProductsSkeleton from "@/components/skeletons/AdminProductsSkeleton";

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("en-PK");
};

const getStockStatus = (stock, lowStockLimit) => {
  const currentStock = Number(stock || 0);

  if (currentStock <= 0) {
    return {
      label: "Out of Stock",
      className: "bg-red-500/20 text-red-400 border border-red-500/30",
    };
  }

  if (currentStock <= lowStockLimit) {
    return {
      label: "Low Stock",
      className:
        "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    };
  }

  return {
    label: "In Stock",
    className: "bg-green-500/20 text-green-400 border border-green-500/30",
  };
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({
    lowStockAlertLimit: 5,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const limit = 12;
  const lowStockLimit = Number(settings.lowStockAlertLimit || 5);

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

      const [productsRes, settingsRes] = await Promise.all([
        api.get(`/products?${params.toString()}`),
        api.get("/admin-settings"),
      ]);

      setProducts(productsRes.data.products || []);
      setCurrentPage(productsRes.data.currentPage || 1);
      setTotalPages(productsRes.data.totalPages || 1);
      setTotalProducts(productsRes.data.totalProducts || 0);

      setSettings({
        lowStockAlertLimit: settingsRes.data?.lowStockAlertLimit || 5,
      });
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const inventorySummary = useMemo(() => {
    const totalStock = products.reduce(
      (sum, product) => sum + Number(product.stock || 0),
      0
    );

    const lowStock = products.filter((product) => {
      const stock = Number(product.stock || 0);
      return stock > 0 && stock <= lowStockLimit;
    }).length;

    const outOfStock = products.filter(
      (product) => Number(product.stock || 0) <= 0
    ).length;

    return {
      totalStock,
      lowStock,
      outOfStock,
    };
  }, [products, lowStockLimit]);

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

  const endProduct = Math.min(currentPage * limit, totalProducts);

  if (loading) {
    return <AdminProductsSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white">
          Admin <span className="text-[#D4AF37]">Products</span>
        </h1>

        <p className="text-gray-400 mt-2">Total Products : {totalProducts}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          title="Current Page Stock"
          value={formatNumber(inventorySummary.totalStock)}
          color="text-[#D4AF37]"
        />

        <SummaryCard
          title="Low Stock Limit"
          value={lowStockLimit}
          color="text-yellow-400"
        />

        <SummaryCard
          title="Low Stock"
          value={inventorySummary.lowStock}
          color="text-yellow-400"
        />

        <SummaryCard
          title="Out of Stock"
          value={inventorySummary.outOfStock}
          color="text-red-400"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-[#0d1117] border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-[#D4AF37] transition"
        />

        <Link
          href="/admin/products/add"
          className="md:w-56 flex items-center justify-center bg-[#D4AF37] hover:bg-[#c9a227] rounded-xl text-black font-bold transition py-4"
        >
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center text-gray-400 py-20">
          No products found.
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const stock = Number(product.stock || 0);
              const stockStatus = getStockStatus(stock, lowStockLimit);

              return (
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

                    <span
                      className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${stockStatus.className}`}
                    >
                      {stockStatus.label}
                    </span>
                  </div>

                  <div className="p-5">
                    <h2 className="text-white text-lg font-semibold line-clamp-1">
                      {product.name}
                    </h2>

                    <p className="text-gray-400 text-sm line-clamp-2 mt-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between gap-3 mt-4">
                      <p className="text-[#D4AF37] font-bold text-lg">
                        Rs {formatNumber(product.price)}
                      </p>

                      <div className="text-right">
                        <p className="text-gray-500 text-xs">Stock</p>
                        <p
                          className={`font-bold ${
                            stock <= 0
                              ? "text-red-400"
                              : stock <= lowStockLimit
                              ? "text-yellow-400"
                              : "text-green-400"
                          }`}
                        >
                          {stock} left
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
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

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${stockStatus.className}`}
                      >
                        {stockStatus.label}
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
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg text-white cursor-pointer transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-14">
              <div className="text-center text-gray-400 mb-6">
                Showing{" "}
                <span className="text-[#D4AF37] font-semibold">
                  {startProduct}
                </span>{" "}
                to{" "}
                <span className="text-[#D4AF37] font-semibold">
                  {endProduct}
                </span>{" "}
                of{" "}
                <span className="text-[#D4AF37] font-semibold">
                  {totalProducts}
                </span>{" "}
                Products
              </div>

              <div className="flex justify-center gap-2 flex-wrap">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-slate-700 bg-[#0d1117] text-white disabled:opacity-40 hover:border-[#D4AF37] transition cursor-pointer"
                >
                  Prev
                </button>

                {renderPages()}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
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

function SummaryCard({ title, value, color }) {
  return (
    <div className="bg-[#0d1117] border border-slate-800 rounded-2xl p-5">
      <p className="text-gray-400 text-sm">{title}</p>

      <h2 className={`text-2xl font-bold mt-2 ${color}`}>{value}</h2>
    </div>
  );
}