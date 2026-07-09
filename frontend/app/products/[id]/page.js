"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import ProductCard from "@/components/ProductCard";
import ProductDetailSkeleton from "@/components/skeletons/ProductDetailSkeleton";
import { CartContext } from "@/context/CartContext";
import { FavoritesContext } from "@/context/FavoritesContext";
import { showCartToast, showSuccessToast, showErrorToast } from "@/utils/toast";

const stockInfo = (stock) => {
  const value = Number(stock || 0);

  if (value <= 0) {
    return {
      label: "Out of Stock",
      color: "text-red-400",
      badge: "bg-red-500/20 text-red-400 border-red-500/30",
    };
  }

  if (value <= 5) {
    return {
      label: `Only ${value} left`,
      color: "text-yellow-400",
      badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    };
  }

  return {
    label: "In Stock",
    color: "text-green-400",
    badge: "bg-green-500/20 text-green-400 border-green-500/30",
  };
};

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

      const res = await api.get(`/products/${id}`);
      setProduct(res.data);

      const relatedRes = await api.get(
        `/products?category=${res.data.category}&limit=5`
      );

      const list = relatedRes.data.products || relatedRes.data || [];

      setRelatedProducts(
        list.filter((item) => item.id !== res.data.id).slice(0, 4)
      );
    } catch (error) {
      console.log(error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/product/${id}`);

      setReviews(res.data.reviews || []);
      setAverageRating(res.data.averageRating || 0);
      setTotalReviews(res.data.totalReviews || 0);
    } catch (error) {
      console.log(error);
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
    const stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach((review) => {
      stats[review.rating] = (stats[review.rating] || 0) + 1;
    });

    return stats;
  }, [reviews]);

  if (loading) return <ProductDetailSkeleton />;

  if (notFound || !product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-3xl p-10 text-center">
          <p className="text-6xl mb-5">📦</p>
          <h1 className="text-3xl font-bold text-white mb-3">
            Product Not Found
          </h1>
          <p className="text-gray-400 mb-6">
            The product does not exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/products")}
            className="bg-[#D4AF37] text-black px-6 py-3 rounded-xl font-semibold"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const stock = Number(product.stock || 0);
  const isOutOfStock = stock <= 0;
  const stockStatus = stockInfo(stock);
  const favorite = isFavorite(product.id);

  const handleAddToCart = () => {
    if (isOutOfStock) {
      showErrorToast("This product is out of stock");
      return;
    }

    addToCart(product);
    showCartToast(product);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      showErrorToast("This product is out of stock");
      return;
    }

    startCheckout([{ ...product, quantity: 1 }]);
    router.push("/checkout");
  };

  const handleFavorite = () => {
    toggleFavorite(product);
    favorite
      ? showErrorToast("Removed from Favorites")
      : showSuccessToast("Added to Favorites");
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

      setRating(5);
      setComment("");

      showSuccessToast("Review saved successfully");
      fetchReviews();
    } catch (error) {
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
      showErrorToast(
        error?.response?.data?.message || "Failed to delete review"
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <button
        onClick={() => router.push("/products")}
        className="mb-10 bg-[#0B1F33] border border-[#D4AF37]/20 text-gray-300 px-5 py-2.5 rounded-xl hover:border-[#D4AF37] hover:text-white"
      >
        ← Back to Products
      </button>

      <section className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-3xl p-6 md:p-10">
        <div className="grid md:grid-cols-2 gap-10 md:gap-20 items-center">
          <div className="relative aspect-[4/5] bg-[#071827] rounded-2xl overflow-hidden border border-[#D4AF37]/10">
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover ${
                isOutOfStock ? "opacity-60 grayscale" : ""
              }`}
            />

            {product.category && (
              <span className="absolute top-5 left-5 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
                {product.category}
              </span>
            )}

            {product.featured && (
              <span className="absolute top-5 right-5 bg-[#D4AF37] text-black text-xs px-3 py-1.5 rounded-full font-bold">
                ⭐ Featured
              </span>
            )}

            <span
              className={`absolute bottom-5 left-5 px-3 py-1.5 rounded-full text-xs font-bold border ${stockStatus.badge}`}
            >
              {stockStatus.label}
            </span>
          </div>

          <div className="text-center">
            <p className="text-[#D4AF37] text-xs font-semibold uppercase tracking-widest mb-3">
              {product.category}
            </p>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {product.name}
            </h1>

            <p className="text-gray-400 mb-6">
              <span className="text-yellow-400">★</span>{" "}
              {averageRating > 0 ? averageRating : "No rating yet"} (
              {totalReviews} review{totalReviews !== 1 ? "s" : ""})
            </p>

            <p className="text-gray-400 leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              <InfoBox
                title="Stock"
                value={stockStatus.label}
                sub={`${stock} item${stock !== 1 ? "s" : ""} available`}
                color={stockStatus.color}
              />

              <InfoBox
                title="Delivery"
                value="2-4 Days"
                sub="Cash on delivery"
                color="text-[#D4AF37]"
              />
            </div>

            <div className="border-t border-[#D4AF37]/20 pt-8 mb-8">
              <p className="text-gray-500 text-xs uppercase mb-1">Price</p>
              <p className="text-[#D4AF37] font-bold text-4xl">
                Rs {Number(product.price || 0).toLocaleString("en-PK")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <ActionButton
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                activeClass="bg-[#D4AF37] hover:bg-[#C9A227] text-black"
              >
                {isOutOfStock ? "Out of Stock" : "Add To Cart"}
              </ActionButton>

              <ActionButton
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                activeClass="bg-green-500 hover:bg-green-600 text-white"
              >
                {isOutOfStock ? "Unavailable" : "Buy Now"}
              </ActionButton>

              <button
                onClick={handleFavorite}
                className="sm:w-14 bg-[#071827] border border-[#D4AF37]/30 text-xl py-3 rounded-xl"
              >
                {favorite ? "❤️" : "🤍"}
              </button>
            </div>

            <div className="mt-6 bg-[#071827] border border-[#D4AF37]/20 rounded-xl p-4 text-left">
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
      </section>

      <section className="mt-12 grid lg:grid-cols-3 gap-8">
        <div className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-3xl p-6">
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

          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviewStats[star] || 0;
            const percentage = totalReviews ? (count / totalReviews) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-3 mb-3">
                <span className="text-gray-400 text-sm w-8">{star}★</span>
                <div className="flex-1 h-2 bg-[#071827] rounded-full">
                  <div
                    className="h-full bg-[#D4AF37] rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-gray-500 text-xs w-6">{count}</span>
              </div>
            );
          })}
        </div>

        <form
          onSubmit={handleSubmitReview}
          className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-3xl p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-5">Add Review</h2>

          <label className="block text-gray-400 text-sm mb-2">Rating</label>
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="w-full bg-[#071827] border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-white mb-5"
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
            className="w-full bg-[#071827] border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-white resize-none"
          />

          <button
            type="submit"
            disabled={reviewLoading}
            className="w-full mt-5 bg-[#D4AF37] text-black py-3 rounded-xl font-semibold hover:bg-yellow-400 disabled:opacity-50"
          >
            {reviewLoading ? "Saving..." : "Submit Review"}
          </button>
        </form>

        <div className="bg-[#0B1F33] border border-[#D4AF37]/20 rounded-3xl p-6">
          <h2 className="text-2xl font-bold text-white mb-5">
            Product Highlights
          </h2>

          <div className="space-y-4 text-gray-300 text-sm">
            <p>✅ Premium quality material</p>
            <p>✅ Fast delivery available</p>
            <p>✅ Secure checkout</p>
            <p>✅ 7 days exchange policy</p>
          </div>
        </div>
      </section>

      <section className="mt-8 bg-[#0B1F33] border border-[#D4AF37]/20 rounded-3xl p-6">
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
                className="bg-[#071827] border border-[#D4AF37]/20 rounded-2xl p-5"
              >
                <div className="flex justify-between gap-4 mb-3">
                  <div>
                    <p className="text-white font-semibold">
                      {review.user?.username || "User"}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(review.createdAt).toLocaleDateString("en-PK")}
                    </p>
                  </div>

                  <div className="flex gap-4">
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
                        className="text-red-400 text-xs"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-gray-300 text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {relatedProducts.length > 0 && (
        <section className="mt-12">
          <p className="text-[#D4AF37] text-sm font-semibold uppercase tracking-widest mb-2">
            Recommended
          </p>

          <h2 className="text-3xl font-bold text-white mb-2">
            You May Also <span className="text-[#D4AF37]">Like</span>
          </h2>

          <p className="text-gray-400 mb-8">
            More products from the same category.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function InfoBox({ title, value, sub, color }) {
  return (
    <div className="bg-[#071827] border border-[#D4AF37]/20 rounded-xl p-4">
      <p className="text-gray-500 text-xs uppercase tracking-widest">{title}</p>
      <p className={`${color} font-semibold mt-1`}>{value}</p>
      <p className="text-gray-500 text-xs mt-1">{sub}</p>
    </div>
  );
}

function ActionButton({ children, disabled, onClick, activeClass }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 py-3 px-6 rounded-xl font-semibold transition ${
        disabled
          ? "bg-slate-700 text-gray-400 cursor-not-allowed"
          : `${activeClass} cursor-pointer`
      }`}
    >
      {children}
    </button>
  );
}