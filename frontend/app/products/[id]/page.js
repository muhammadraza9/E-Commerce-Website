"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import ProductCard from "@/components/ProductCard";
import ProductDetailSkeleton from "@/components/skeletons/ProductDetailSkeleton";
import { CartContext } from "@/context/CartContext";
import { FavoritesContext } from "@/context/FavoritesContext";
import {
  showCartToast,
  showSuccessToast,
  showErrorToast,
} from "@/utils/toast";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { addToCart, startCheckout } = useContext(CartContext);
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setNotFound(false);

      const res = await api.get(`/products/${id}`);

      setProduct(res.data);
      fetchRelatedProducts(res.data);
    } catch (error) {
      console.error(error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (currentProduct) => {
    try {
      const params = new URLSearchParams({
        category: currentProduct.category,
        limit: 5,
      });

      const res = await api.get(`/products?${params.toString()}`);

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.products || [];

      const filtered = data
        .filter((item) => item.id !== currentProduct.id)
        .slice(0, 4);

      setRelatedProducts(filtered);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/product/${id}`);

      setReviews(res.data.reviews || []);
      setAverageRating(res.data.averageRating || 0);
      setTotalReviews(res.data.totalReviews || 0);
    } catch (error) {
      console.error(error);
    }
  };

  const currentUser = useMemo(() => {
    if (typeof window === "undefined") return null;

    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, [reviews]);

  const reviewStats = useMemo(() => {
    const stats = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    reviews.forEach((review) => {
      stats[review.rating] = (stats[review.rating] || 0) + 1;
    });

    return stats;
  }, [reviews]);

  const handleAddToCart = () => {
    addToCart(product);
    showCartToast(product);
  };

  const handleBuyNow = () => {
    const checkoutProduct = {
      ...product,
      quantity: 1,
    };

    startCheckout([checkoutProduct]);
    router.push("/checkout");
  };

  const handleFavorite = () => {
    toggleFavorite(product);

    if (isFavorite(product.id)) {
      showErrorToast("Removed from Favorites");
    } else {
      showSuccessToast("Added to Favorites");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      showErrorToast("Please login to add review");
      router.push("/signin");
      return;
    }

    if (!comment.trim()) {
      showErrorToast("Please write a review");
      return;
    }

    try {
      setReviewLoading(true);

      await api.post("/reviews", {
        productId: Number(id),
        rating: Number(rating),
        comment: comment.trim(),
      });

      setComment("");
      setRating(5);

      showSuccessToast("Review saved successfully");
      fetchReviews();
    } catch (error) {
      console.error(error);
      showErrorToast(error?.response?.data?.message || "Failed to save review");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Delete this review?")) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      showSuccessToast("Review deleted successfully");
      fetchReviews();
    } catch (error) {
      console.error(error);
      showErrorToast(
        error?.response?.data?.message || "Failed to delete review"
      );
    }
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (notFound || !product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-3xl p-10 text-center shadow-xl shadow-black/20">
          <p className="text-6xl mb-5">📦</p>

          <h1 className="text-3xl font-bold text-white mb-3">
            Product Not Found
          </h1>

          <p className="text-gray-400 mb-6">
            The product you are looking for does not exist or has been removed.
          </p>

          <button
            onClick={() => router.push("/products")}
            className="inline-block bg-[#D4AF37] text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const favorite = isFavorite(product.id);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <button
        onClick={() => router.push("/products")}
        className="inline-flex items-center gap-2 bg-[#0B1F33] hover:bg-[#071827] border border-[#D4AF37]/20 hover:border-[#D4AF37] text-gray-300 hover:text-white mb-10 px-5 py-2.5 rounded-xl font-medium transition-all"
      >
        <span className="text-lg leading-none">←</span>
        Back to Products
      </button>

      <div className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-3xl p-6 md:p-10 shadow-xl shadow-black/20">
        <div className="grid md:grid-cols-2 gap-10 md:gap-20 items-center">
          <div className="relative w-full aspect-[4/5] bg-[#071827] rounded-2xl overflow-hidden shadow-lg border border-[#D4AF37]/10 group">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {product.category && (
              <span className="absolute top-5 left-5 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full tracking-wide">
                {product.category}
              </span>
            )}

            {product.featured && (
              <span className="absolute top-5 right-5 bg-[#D4AF37] text-black text-xs px-3 py-1.5 rounded-full font-bold">
                ⭐ Featured
              </span>
            )}
          </div>

          <div className="flex flex-col items-center text-center">
            {product.category && (
              <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-widest mb-3">
                {product.category}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
              {product.name}
            </h1>

            <div className="mb-6 text-sm text-gray-400">
              <span className="text-yellow-400 text-lg">★</span>{" "}
              {averageRating > 0 ? averageRating : "No rating yet"}{" "}
              <span>
                ({totalReviews} review{totalReviews !== 1 ? "s" : ""})
              </span>
            </div>

            <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-md">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-md mb-8">
              <div className="bg-[#071827] border border-[#D4AF37]/20 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-widest">
                  Stock
                </p>
                <p className="text-green-400 font-semibold mt-1">In Stock</p>
              </div>

              <div className="bg-[#071827] border border-[#D4AF37]/20 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-widest">
                  Delivery
                </p>
                <p className="text-[#D4AF37] font-semibold mt-1">2-4 Days</p>
              </div>
            </div>

            <div className="h-px bg-[#D4AF37]/20 w-full mb-8" />

            <div className="mb-8">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">
                Price
              </p>

              <p className="text-[#D4AF37] font-bold text-4xl">
                Rs {product.price}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#D4AF37] hover:bg-[#C9A227] text-black py-3 px-6 rounded-xl font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
              >
                Add To Cart
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-xl font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
              >
                Buy Now
              </button>

              <button
                onClick={handleFavorite}
                className="sm:w-14 bg-[#071827] border border-[#D4AF37]/30 hover:border-[#D4AF37] text-xl py-3 rounded-xl transition"
                title={favorite ? "Remove from Favorites" : "Add to Favorites"}
              >
                {favorite ? "❤️" : "🤍"}
              </button>
            </div>

            <div className="mt-6 bg-[#071827] border border-[#D4AF37]/20 rounded-xl p-4 w-full max-w-md text-left">
              <p className="text-white font-semibold mb-2">
                Delivery & Returns
              </p>
              <p className="text-gray-400 text-sm">
                Free exchange within 7 days. Cash on delivery available across
                Pakistan.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 grid lg:grid-cols-3 gap-8">
        <div className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-3xl p-6 shadow-xl shadow-black/20">
          <h2 className="text-2xl font-bold text-white mb-5">
            Rating Summary
          </h2>

          <div className="text-center mb-6">
            <p className="text-5xl font-bold text-[#D4AF37]">
              {averageRating || "0.0"}
            </p>
            <p className="text-yellow-400 text-xl mt-1">★★★★★</p>
            <p className="text-gray-400 text-sm mt-1">
              Based on {totalReviews} review{totalReviews !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviewStats[star] || 0;
              const percentage =
                totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm w-8">{star}★</span>

                  <div className="flex-1 h-2 bg-[#071827] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#D4AF37]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <span className="text-gray-500 text-xs w-6">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={handleSubmitReview}
          className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-3xl p-6 shadow-xl shadow-black/20"
        >
          <h2 className="text-2xl font-bold text-white mb-5">Add Review</h2>

          <label className="block text-gray-400 text-sm mb-2">Rating</label>

          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="w-full bg-[#071827] border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D4AF37] mb-5"
          >
            <option value="5">★★★★★ 5</option>
            <option value="4">★★★★ 4</option>
            <option value="3">★★★ 3</option>
            <option value="2">★★ 2</option>
            <option value="1">★ 1</option>
          </select>

          <label className="block text-gray-400 text-sm mb-2">Review</label>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="5"
            placeholder="Write your review..."
            className="w-full bg-[#071827] border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-white outline-none resize-none focus:border-[#D4AF37]"
          />

          <button
            type="submit"
            disabled={reviewLoading}
            className="w-full mt-5 bg-[#D4AF37] text-black py-3 rounded-xl font-semibold hover:bg-yellow-400 transition disabled:opacity-50"
          >
            {reviewLoading ? "Saving..." : "Submit Review"}
          </button>
        </form>

        <div className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-3xl p-6 shadow-xl shadow-black/20">
          <h2 className="text-2xl font-bold text-white mb-5">
            Product Highlights
          </h2>

          <div className="space-y-4">
            <p className="text-gray-300 text-sm">✅ Premium quality material</p>
            <p className="text-gray-300 text-sm">✅ Fast delivery available</p>
            <p className="text-gray-300 text-sm">✅ Secure checkout</p>
            <p className="text-gray-300 text-sm">✅ 7 days exchange policy</p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-[#0B1F33] border border-[#D4AF37]/20 rounded-3xl p-6 shadow-xl shadow-black/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Customer Reviews</h2>

          <span className="text-[#D4AF37] font-semibold">
            {averageRating > 0 ? `${averageRating}/5` : "0/5"}
          </span>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">⭐</p>
            <p className="text-gray-400">
              No reviews yet. Be the first to review this product.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border border-[#D4AF37]/20 bg-[#071827] rounded-2xl p-5"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold">
                        {review.user?.username || "User"}
                      </p>

                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                        Verified
                      </span>
                    </div>

                    <p className="text-gray-500 text-xs">
                      {new Date(review.createdAt).toLocaleDateString("en-PK")}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="text-yellow-400">
                      {"★".repeat(review.rating)}
                      <span className="text-gray-600">
                        {"★".repeat(5 - review.rating)}
                      </span>
                    </p>

                    {(currentUser?.id === review.userId ||
                      currentUser?.role === "ADMIN") && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-red-400 text-xs hover:text-red-300"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <div className="mb-8">
            <p className="text-[#D4AF37] text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2">
              Recommended
            </p>

            <h2 className="text-3xl font-bold text-white">
              You May Also <span className="text-[#D4AF37]">Like</span>
            </h2>

            <p className="text-gray-400 mt-2">
              More products from the same category.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}