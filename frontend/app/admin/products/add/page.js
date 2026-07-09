"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import AddProductSkeleton from "@/components/skeletons/AddProductSkeleton";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageModeSwitch = (mode) => {
    setImageMode(mode);
    setImageFile(null);
    setImagePreview("");

    setFormData((prev) => ({
      ...prev,
      image: "",
    }));
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;

    setFormData((prev) => ({
      ...prev,
      image: url,
    }));

    setImagePreview(url);
  };

  const validateImageFile = (file) => {
    if (!file) return false;

    if (!file.type.startsWith("image/")) {
      showErrorToast("Please select an image.");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      showErrorToast("Image must be less than 5MB.");
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!validateImageFile(file)) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0];

    if (!validateImageFile(file)) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadToCloudinary = async (file) => {
    const data = new FormData();

    data.append("file", file);
    data.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );

    const cloudData = await cloudRes.json();

    if (!cloudData.secure_url) {
      throw new Error("Image upload failed");
    }

    return cloudData.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imageMode === "url" && !formData.image.trim()) {
      showErrorToast("Please enter image URL.");
      return;
    }

    if (imageMode === "file" && !imageFile) {
      showErrorToast("Please upload image.");
      return;
    }

    if (Number(formData.price) < 0) {
      showErrorToast("Price cannot be negative.");
      return;
    }

    if (Number(formData.stock) < 0) {
      showErrorToast("Stock cannot be negative.");
      return;
    }

    try {
      setLoading(true);

      let image = formData.image;

      if (imageMode === "file") {
        image = await uploadToCloudinary(imageFile);
      }

      await api.post("/products", {
        ...formData,
        image,
        price: Number(formData.price),
        stock: Number(formData.stock),
      });

      showSuccessToast("Product Added Successfully");
      router.push("/admin/products");
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <AddProductSkeleton />;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-white mb-8">
        Add New <span className="text-[#D4AF37]">Product</span>
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-5"
      >
        <Input
          label="Product Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <div>
          <label className="block text-white mb-2">Description</label>

          <textarea
            rows={4}
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-lg outline-none resize-none focus:border-[#D4AF37]"
            required
          />
        </div>

        <div>
          <label className="block text-white mb-2">Product Image</label>

          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => handleImageModeSwitch("url")}
              className={`flex-1 py-2 rounded-lg transition ${
                imageMode === "url"
                  ? "bg-[#D4AF37] text-black font-semibold"
                  : "bg-slate-700 text-gray-300"
              }`}
            >
              URL
            </button>

            <button
              type="button"
              onClick={() => handleImageModeSwitch("file")}
              className={`flex-1 py-2 rounded-lg transition ${
                imageMode === "file"
                  ? "bg-[#D4AF37] text-black font-semibold"
                  : "bg-slate-700 text-gray-300"
              }`}
            >
              Upload
            </button>
          </div>

          {imageMode === "url" ? (
            <input
              type="text"
              value={formData.image}
              onChange={handleUrlChange}
              placeholder="Paste image URL..."
              className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-lg outline-none focus:border-[#D4AF37]"
            />
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-[#D4AF37] transition"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />

              <p className="text-white font-semibold">Upload Image</p>

              <p className="text-gray-400 text-sm mt-2">
                Drag & drop image here or click to browse
              </p>
            </div>
          )}

          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-5 w-52 h-52 object-cover rounded-xl border border-slate-700"
            />
          )}
        </div>

        <div>
          <label className="block text-white mb-2">Category</label>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-lg outline-none focus:border-[#D4AF37]"
          >
            <option>Clothing</option>
            <option>Shoes</option>
            <option>Accessories</option>
            <option>Hoodies</option>
            <option>T-Shirts</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <Input
            label="Price"
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            required
          />

          <Input
            label="Stock Quantity"
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-lg p-4">
          <input
            type="checkbox"
            id="featured"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
            className="w-5 h-5 accent-yellow-500"
          />

          <label htmlFor="featured" className="text-white cursor-pointer">
            ⭐ Mark this product as Featured
          </label>
        </div>

        <button
          disabled={loading}
          className="w-full bg-[#D4AF37] hover:bg-yellow-400 text-black py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
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
  required = false,
}) {
  return (
    <div>
      <label className="block text-white mb-2">{label}</label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-lg outline-none focus:border-[#D4AF37]"
        required={required}
      />
    </div>
  );
}