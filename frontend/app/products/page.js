"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import ProductCard from "@/components/ProductCard";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  useEffect(() => {
    // Jab bhi search/category/sort change ho, page 1 pe reset karo
    setCurrentPage(1);
  }, [search, category, sort]);

  useEffect(() => {
    fetchProducts();
  }, [search, category, sort, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/products?search=${search}&category=${category}&sort=${sort}&page=${currentPage}&limit=${limit}`
      );

      const data = res.data;

      if (data && Array.isArray(data.products)) {
        setProducts(data.products);
        setTotalPages(data.totalPages || 1);
      } else {
        setProducts([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.log(error);
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
            currentPage === i
              ? "bg-[#D4AF37] text-black border-[#D4AF37]"
              : "bg-[#1B1B1B] text-white border-gray-700 hover:border-[#D4AF37]"
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-12">

      <div className="flex flex-col lg:flex-row justify-between gap-4 mb-8">

        <h1 className="text-4xl font-bold text-white">
          Prod<span className="text-[#D4AF37]">ucts</span>
        </h1>

        <div className="flex flex-col sm:flex-row gap-3">

          <input
            type="text"
            placeholder="Search Product..."
            className="px-4 py-3 rounded-lg border border-gray-700 bg-[#1B1B1B] text-white w-64 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="px-4 py-3 rounded-lg border border-gray-700 bg-[#1B1B1B] text-white outline-none"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>All</option>
            <option>Clothing</option>
            <option>Shoes</option>
            <option>Electronics</option>
            <option>Accessories</option>
          </select>

          <select
            className="px-4 py-3 rounded-lg border border-gray-700 bg-[#1B1B1B] text-white outline-none"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

        </div>

      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-16">
          Loading Products...
        </div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          No Products Found
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 flex-wrap mb-24">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-700 bg-[#1B1B1B] text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#D4AF37]"
              >
                Prev
              </button>

              {renderPageNumbers()}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-700 bg-[#1B1B1B] text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#D4AF37]"
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