"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
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
  });

  const [imageMode, setImageMode] = useState("url"); // "url" | "file"
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageModeSwitch = (mode) => {
    setImageMode(mode);
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, image: url }));
    setImagePreview(url);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showErrorToast("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showErrorToast("Image must be smaller than 5MB");
      return;
    }

    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showErrorToast("Please drop an image file");
      return;
    }

    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const handleDragOver = (e) => e.preventDefault();

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

    if (!cloudRes.ok) {
      throw new Error("Cloudinary upload failed");
    }

    const cloudData = await cloudRes.json();
    return cloudData.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imageMode === "url" && !formData.image) {
      showErrorToast("Please enter an image URL");
      return;
    }
    if (imageMode === "file" && !imageFile) {
      showErrorToast("Please select an image file");
      return;
    }

    try {
      setLoading(true);

      let imageValue = formData.image;

      if (imageMode === "file" && imageFile) {
        imageValue = await uploadToCloudinary(imageFile);
      }

      await api.post("/products", {
        name: formData.name,
        description: formData.description,
        image: imageValue,
        category: formData.category,
        price: Number(formData.price),
      });

      showSuccessToast("Product Added Successfully");
      router.push("/admin/products");
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-white mb-8">Add New Product</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-5"
      >
        {/* Product Name */}
        <div>
          <label className="block text-white mb-2">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Black T-Shirt"
            className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-lg"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-white mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Premium Cotton T-Shirt"
            className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-lg"
            required
          />
        </div>

        {/* Image Section */}
        <div>
          <label className="block text-white mb-2">Product Image</label>

          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => handleImageModeSwitch("url")}
              className={`flex-1 py-2 rounded-lg font-medium transition text-sm ${
                imageMode === "url"
                  ? "bg-green-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              🔗 Add via URL
            </button>
            <button
              type="button"
              onClick={() => handleImageModeSwitch("file")}
              className={`flex-1 py-2 rounded-lg font-medium transition text-sm ${
                imageMode === "file"
                  ? "bg-green-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              📁 Upload File
            </button>
          </div>

          {imageMode === "url" && (
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleUrlChange}
              placeholder="https://example.com/image.jpg"
              className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-lg"
            />
          )}

          {imageMode === "file" && (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="w-full border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 hover:bg-slate-800/50 transition"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {imageFile ? (
                <div className="text-slate-300">
                  <p className="text-green-400 font-medium">✓ {imageFile.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {(imageFile.size / 1024).toFixed(1)} KB
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Click to change image
                  </p>
                </div>
              ) : (
                <div className="text-slate-400">
                  <p className="text-3xl mb-2">📷</p>
                  <p className="font-medium">Click or drag an image here</p>
                  <p className="text-xs text-slate-500 mt-1">
                    PNG, JPG, WEBP — Max 5MB
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {imagePreview && (
          <div>
            <label className="block text-white mb-2">Preview</label>
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-48 h-48 object-cover rounded-lg border border-slate-700"
                onError={() => setImagePreview("")}
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview("");
                  setImageFile(null);
                  setFormData((prev) => ({ ...prev, image: "" }));
                }}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-white mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-lg"
          >
            <option value="Clothing">Clothing</option>
            <option value="Shoes">Shoes</option>
            <option value="Accessories">Accessories</option>
            <option value="Hoodies">Hoodies</option>
            <option value="T-Shirts">T-Shirts</option>
          </select>
        </div>

        <div>
          <label className="block text-white mb-2">Price (Rs)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="1999"
            className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-lg"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}