"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import AddProductSkeleton from "@/components/skeletons/AddProductSkeleton";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

export default function AddProductPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    category: "Clothing",
    price: "",
    stock: "",
    featured: false,
  });

  const [imageMode, setImageMode] = useState("url");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const clearImagePreview = () => {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview("");
  };

  const handleImageModeSwitch = (mode) => {
    clearImagePreview();

    setImageMode(mode);
    setImageFile(null);

    setFormData((prev) => ({
      ...prev,
      image: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;

    setFormData((prev) => ({
      ...prev,
      image: url,
    }));

    setImagePreview(url.trim());
  };

  const validateImageFile = (file) => {
    if (!file) {
      showErrorToast("Please select an image.");
      return false;
    }

    if (!file.type.startsWith("image/")) {
      showErrorToast("Please select a valid image file.");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      showErrorToast("Image must be less than 5MB.");
      return false;
    }

    return true;
  };

  const setSelectedImageFile = (file) => {
    if (!validateImageFile(file)) {
      return;
    }

    clearImagePreview();

    const previewUrl = URL.createObjectURL(file);

    setImageFile(file);
    setImagePreview(previewUrl);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    setSelectedImageFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];

    setSelectedImageFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateForm = () => {
    const name = formData.name.trim();
    const description = formData.description.trim();
    const imageUrl = formData.image.trim();
    const price = Number(formData.price);
    const stock = Number(formData.stock);

    if (!name) {
      showErrorToast("Please enter product name.");
      return false;
    }

    if (!description) {
      showErrorToast("Please enter product description.");
      return false;
    }

    if (imageMode === "url" && !imageUrl) {
      showErrorToast("Please enter image URL.");
      return false;
    }

    if (imageMode === "file" && !imageFile) {
      showErrorToast("Please upload an image.");
      return false;
    }

    if (
      formData.price === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      showErrorToast("Please enter a valid product price.");
      return false;
    }

    if (
      formData.stock === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      showErrorToast("Please enter a valid stock quantity.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const productData = new FormData();

      productData.append("name", formData.name.trim());
      productData.append("description", formData.description.trim());
      productData.append("category", formData.category);
      productData.append("price", String(Number(formData.price)));
      productData.append("stock", String(Number(formData.stock)));
      productData.append("featured", String(formData.featured));

      if (imageMode === "file") {
        productData.append("image", imageFile);
      } else {
        productData.append("image", formData.image.trim());
      }

      await api.post("/products", productData);

      showSuccessToast("Product added successfully.");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Add product error:", error);

      showErrorToast(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to add product."
      );
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <AddProductSkeleton />;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-4xl font-bold text-white">
        Add New <span className="text-[#D4AF37]">Product</span>
      </h1>

      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="space-y-5 rounded-2xl border border-slate-700 bg-slate-900 p-6"
      >
        <Input
          label="Product Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter product name"
          required
        />

        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-white"
          >
            Description
          </label>

          <textarea
            id="description"
            rows={4}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description"
            className="w-full resize-none rounded-lg border border-slate-600 bg-slate-800 p-3 text-white outline-none transition focus:border-[#D4AF37]"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-white">
            Product Image
          </label>

          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => handleImageModeSwitch("url")}
              className={`flex-1 rounded-lg py-2 transition ${
                imageMode === "url"
                  ? "bg-[#D4AF37] font-semibold text-black"
                  : "bg-slate-700 text-gray-300 hover:bg-slate-600"
              }`}
            >
              Image URL
            </button>

            <button
              type="button"
              onClick={() => handleImageModeSwitch("file")}
              className={`flex-1 rounded-lg py-2 transition ${
                imageMode === "file"
                  ? "bg-[#D4AF37] font-semibold text-black"
                  : "bg-slate-700 text-gray-300 hover:bg-slate-600"
              }`}
            >
              Upload Image
            </button>
          </div>

          {imageMode === "url" ? (
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleUrlChange}
              placeholder="Paste product image URL..."
              className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-white outline-none transition focus:border-[#D4AF37]"
              required
            />
          ) : (
            <div
              role="button"
              tabIndex={0}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  fileInputRef.current?.click();
                }
              }}
              className="cursor-pointer rounded-xl border-2 border-dashed border-slate-600 p-8 text-center transition hover:border-[#D4AF37]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />

              <p className="font-semibold text-white">
                Upload Product Image
              </p>

              <p className="mt-2 text-sm text-gray-400">
                Drag and drop an image here or click to browse
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Maximum image size: 5MB
              </p>

              {imageFile && (
                <p className="mt-3 break-all text-sm text-[#D4AF37]">
                  {imageFile.name}
                </p>
              )}
            </div>
          )}

          {imagePreview && (
            <div className="mt-5">
              <p className="mb-2 text-sm text-gray-400">
                Image Preview
              </p>

              <img
                src={imagePreview}
                alt="Product preview"
                onError={() => {
                  if (imageMode === "url") {
                    setImagePreview("");
                    showErrorToast(
                      "Image preview could not be loaded from this URL."
                    );
                  }
                }}
                className="h-52 w-52 rounded-xl border border-slate-700 object-cover"
              />
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-white"
          >
            Category
          </label>

          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-white outline-none transition focus:border-[#D4AF37]"
          >
            <option value="Clothing">Clothing</option>
            <option value="Shoes">Shoes</option>
            <option value="Accessories">Accessories</option>
            <option value="Hoodies">Hoodies</option>
            <option value="T-Shirts">T-Shirts</option>
          </select>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Price"
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Enter price"
            min="0"
            step="0.01"
            required
          />

          <Input
            label="Stock Quantity"
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            placeholder="Enter stock quantity"
            min="0"
            step="1"
            required
          />
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 p-4">
          <input
            type="checkbox"
            id="featured"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
            className="h-5 w-5 accent-yellow-500"
          />

          <label
            htmlFor="featured"
            className="cursor-pointer text-white"
          >
            ⭐ Mark this product as Featured
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            disabled={loading}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#D4AF37] py-3 font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Adding Product..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  min,
  step,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-white"
      >
        {label}
      </label>

      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        step={step}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-white outline-none transition focus:border-[#D4AF37]"
        required={required}
      />
    </div>
  );
}