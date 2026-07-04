"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/services/api";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/skeletons/ProductCardSkeleton";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [featured, setFeatured] = useState("All");
  const [sort, setSort] = useState("newest");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 12;
  const latestRequestId = useRef(0);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, featured, sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 400);

    return () => clearTimeout(timer);
  }, [search, category, featured, sort, currentPage]);

  const fetchProducts = async () => {
    const requestId = ++latestRequestId.current;

    try {
      setLoading(true);

      const params = new URLSearchParams({
        search,
        sort,
        page: currentPage,
        limit,
      });

      if (category !== "All") {
        params.append("category", category);
      }

      if (featured !== "All") {
        params.append("featured", featured);
      }

      const res = await api.get(`/products?${params.toString()}`);

      if (requestId !== latestRequestId.current) return;

      const data = res.data;

      if (Array.isArray(data)) {
        setProducts(data);
        setTotalPages(1);
      } else {
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      if (requestId !== latestRequestId.current) return;

      console.log(error);
      setProducts([]);
      setTotalPages(1);
    } finally {
      if (requestId === latestRequestId.current) {
        setLoading(false);
      }
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

  const renderPageNumbers = () => {
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-xl transition font-semibold cursor-pointer ${
            currentPage === i
              ? "bg-[#D4AF37] text-black"
              : "bg-[#0B1F33] text-white border border-[#D4AF37]/20 hover:border-[#D4AF37]"
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-10">
        <div>
          <h1 className="text-5xl font-bold text-white">
            Our <span className="text-[#D4AF37]">Products</span>
          </h1>

          <p className="text-gray-400 mt-2">Browse our latest collection.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
          <input
            type="text"
            placeholder="🔍 Search Products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full lg:w-72 px-5 py-3 rounded-xl bg-[#0B1F33] border border-[#D4AF37]/20 text-white placeholder:text-gray-500 outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-5 py-3 rounded-xl bg-[#0B1F33] border border-[#D4AF37]/20 text-white outline-none cursor-pointer transition hover:border-[#D4AF37] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
          >
            <option value="All">All</option>
            <option value="Clothing">Clothing</option>
            <option value="T-Shirts">T-Shirts</option>
            <option value="Hoodies">Hoodies</option>
            <option value="Shoes">Shoes</option>
            <option value="Accessories">Accessories</option>
          </select>

          <select
            value={featured}
            onChange={(e) => setFeatured(e.target.value)}
            className="px-5 py-3 rounded-xl bg-[#0B1F33] border border-[#D4AF37]/20 text-white outline-none cursor-pointer transition hover:border-[#D4AF37] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
          >
            <option value="All">All Products</option>
            <option value="true">Featured Only</option>
            <option value="false">Non Featured</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-5 py-3 rounded-xl bg-[#0B1F33] border border-[#D4AF37]/20 text-white outline-none cursor-pointer transition hover:border-[#D4AF37] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <ProductCardSkeleton />
      ) : products.length === 0 ? (
        <div className="text-center text-gray-400 py-20">
          No Products Found
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 flex-wrap mt-14">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-5 py-2 rounded-xl bg-[#0B1F33] border border-[#D4AF37]/20 text-white hover:border-[#D4AF37] disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>

              {renderPageNumbers()}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-5 py-2 rounded-xl bg-[#0B1F33] border border-[#D4AF37]/20 text-white hover:border-[#D4AF37] disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}