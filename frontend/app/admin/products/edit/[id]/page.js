"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/services/api";
import {
  showSuccessToast,
  showErrorToast,
} from "@/utils/toast";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    category: "Clothing",
    price: "",
    featured: false,
  });

  const [imageMode, setImageMode] = useState("url");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${params.id}`);

      setFormData({
        name: res.data.name,
        description: res.data.description,
        image: res.data.image,
        category: res.data.category,
        price: res.data.price,
        featured: res.data.featured,
      });

      setImagePreview(res.data.image);
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to load product");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleImageModeSwitch = (mode) => {
    setImageMode(mode);
    setImageFile(null);

    if (mode === "file") {
      setImagePreview("");
    } else {
      setImagePreview(formData.image);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;

    setFormData((prev) => ({
      ...prev,
      image: url,
    }));

    setImagePreview(url);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return showErrorToast("Please select an image");
    }

    setImageFile(file);

    setImagePreview(
      URL.createObjectURL(file)
    );
  };

  const uploadToCloudinary = async (file) => {
    const data = new FormData();

    data.append("file", file);

    data.append(
      "upload_preset",
      process.env
        .NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );

    const cloud = await res.json();

    return cloud.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      let image = formData.image;

      if (imageMode === "file" && imageFile) {
        image =
          await uploadToCloudinary(
            imageFile
          );
      }

      await api.put(
        `/products/${params.id}`,
        {
          ...formData,
          image,
          price: Number(formData.price),
        }
      );

      showSuccessToast(
        "Product Updated Successfully"
      );

      router.push("/admin/products");
    } catch (error) {
      console.log(error);

      showErrorToast(
        "Failed to update product"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">

      <h1 className="text-4xl font-bold text-white mb-8">
        Edit Product
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-5"
      >

        <div>

          <label className="block text-white mb-2">
            Product Name
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-lg"
            required
          />

        </div>

        <div>

          <label className="block text-white mb-2">
            Description
          </label>

          <textarea
            rows="4"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-lg"
            required
          />

        </div>

        <div>

          <label className="block text-white mb-2">
            Product Image
          </label>

          <div className="flex gap-2 mb-4">

            <button
              type="button"
              onClick={() =>
                setImageMode("url")
              }
              className={`flex-1 py-2 rounded-lg ${
                imageMode === "url"
                  ? "bg-green-600 text-white"
                  : "bg-slate-700 text-slate-300"
              }`}
            >
              URL
            </button>

            <button
              type="button"
              onClick={() =>
                handleImageModeSwitch(
                  "file"
                )
              }
              className={`flex-1 py-2 rounded-lg ${
                imageMode === "file"
                  ? "bg-green-600 text-white"
                  : "bg-slate-700 text-slate-300"
              }`}
            >
              Upload
            </button>

          </div>

          {imageMode === "url" ? (
            <input
              type="text"
              value={formData.image}
              onChange={
                handleUrlChange
              }
              className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-lg"
            />
          ) : (
            <>
              <div
                onClick={() =>
                  fileInputRef.current.click()
                }
                className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-green-500"
              >
                Click to Upload
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={
                  handleFileChange
                }
              />
            </>
          )}

        </div>

        {imagePreview && (
          <img
            src={imagePreview}
            className="w-52 rounded-lg border border-slate-700"
          />
        )}

        <div>

          <label className="block text-white mb-2">
            Category
          </label>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-lg"
          >
            <option>Clothing</option>
            <option>Shoes</option>
            <option>Accessories</option>
            <option>Hoodies</option>
            <option>T-Shirts</option>
          </select>

        </div>

        <div>

          <label className="block text-white mb-2">
            Price
          </label>

          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-lg"
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

          <label
            htmlFor="featured"
            className="text-white cursor-pointer"
          >
            ⭐ Featured Product
          </label>

        </div>

        <button
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
        >
          {loading
            ? "Updating..."
            : "Update Product"}
        </button>

      </form>

    </div>
  );
}