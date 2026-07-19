"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import EditProductSkeleton from "@/components/skeletons/EditProductSkeleton";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setPageLoading(true);

        const response = await api.get(`/products/${params.id}`);
        const product = response.data;

        setFormData({
          name: product.name || "",
          description: product.description || "",
          image: product.image || "",
          category: product.category || "Clothing",
          price: product.price ?? "",
          stock: product.stock ?? 0,
          featured: Boolean(product.featured),
        });

        setImagePreview(product.image || "");
      } catch (error) {
        console.error("Fetch product error:", error);

        showErrorToast(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to load product"
        );
      } finally {
        setPageLoading(false);
      }
    };

    if (params?.id) {
      fetchProduct();
    }
  }, [params?.id]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const clearBlobPreview = () => {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
  };

  const handleImageModeSwitch = (mode) => {
    clearBlobPreview();

    setImageMode(mode);
    setImageFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (mode === "url") {
      setImagePreview(formData.image);
    } else {
      setImagePreview("");
    }
  };

  const handleUrlChange = (event) => {
    const url = event.target.value;

    clearBlobPreview();

    setFormData((previousData) => ({
      ...previousData,
      image: url,
    }));

    setImageFile(null);
    setImagePreview(url.trim());
  };

  const validateImageFile = (file) => {
    if (!file) {
      showErrorToast("Please select an image");
      return false;
    }

    if (!file.type.startsWith("image/")) {
      showErrorToast("Please select a valid image file");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      showErrorToast("Image must be less than 5MB");
      return false;
    }

    return true;
  };

  const selectImageFile = (file) => {
    if (!validateImageFile(file)) {
      return;
    }

    clearBlobPreview();

    const previewUrl = URL.createObjectURL(file);

    setImageFile(file);
    setImagePreview(previewUrl);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    selectImageFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files?.[0];

    selectImageFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const validateForm = () => {
    const productName = formData.name.trim();
    const productDescription = formData.description.trim();
    const imageUrl = formData.image.trim();
    const productPrice = Number(formData.price);
    const productStock = Number(formData.stock);

    if (!productName) {
      showErrorToast("Please enter product name");
      return false;
    }

    if (!productDescription) {
      showErrorToast("Please enter product description");
      return false;
    }

    if (imageMode === "url" && !imageUrl) {
      showErrorToast("Please enter an image URL");
      return false;
    }

    if (imageMode === "file" && !imageFile) {
      showErrorToast("Please upload an image");
      return false;
    }

    if (
      formData.price === "" ||
      !Number.isFinite(productPrice) ||
      productPrice < 0
    ) {
      showErrorToast("Please enter a valid product price");
      return false;
    }

    if (
      formData.stock === "" ||
      !Number.isInteger(productStock) ||
      productStock < 0
    ) {
      showErrorToast("Please enter a valid stock quantity");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

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

      if (imageMode === "file" && imageFile) {
        productData.append("image", imageFile);
      } else {
        productData.append("image", formData.image.trim());
      }

      await api.put(`/products/${params.id}`, productData);

      showSuccessToast("Product Updated Successfully");

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Update product error:", error);

      showErrorToast(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update product"
      );
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <EditProductSkeleton />;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-white mb-8">
        Edit <span className="text-[#D4AF37]">Product</span>
      </h1>

      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-5"
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
            className="block text-white mb-2"
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
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
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
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              Upload
            </button>
          </div>

          {imageMode === "url" ? (
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleUrlChange}
              placeholder="Paste image URL..."
              className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-lg outline-none focus:border-[#D4AF37]"
              required
            />
          ) : (
            <>
              <div
                role="button"
                tabIndex={0}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    fileInputRef.current?.click();
                  }
                }}
                className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-[#D4AF37] transition"
              >
                <p className="text-white font-semibold">
                  Upload Product Image
                </p>

                <p className="text-gray-400 text-sm mt-2">
                  Drag and drop image here or click to browse
                </p>

                <p className="text-gray-500 text-xs mt-1">
                  Maximum image size: 5MB
                </p>

                {imageFile && (
                  <p className="text-[#D4AF37] text-sm mt-3 break-all">
                    {imageFile.name}
                  </p>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />
            </>
          )}
        </div>

        {imagePreview && (
          <div>
            <p className="text-gray-400 text-sm mb-2">
              Image Preview
            </p>

            <img
              src={imagePreview}
              alt="Product preview"
              onError={() => {
                if (imageMode === "url") {
                  setImagePreview("");
                  showErrorToast(
                    "Image preview could not be loaded from this URL"
                  );
                }
              }}
              className="w-52 h-52 object-cover rounded-lg border border-slate-700"
            />
          </div>
        )}

        <div>
          <label
            htmlFor="category"
            className="block text-white mb-2"
          >
            Category
          </label>

          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-lg outline-none focus:border-[#D4AF37]"
          >
            <option value="Clothing">Clothing</option>
            <option value="Shoes">Shoes</option>
            <option value="Accessories">Accessories</option>
            <option value="Hoodies">Hoodies</option>
            <option value="T-Shirts">T-Shirts</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
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

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            disabled={loading}
            className="w-full bg-slate-800 border border-slate-600 hover:bg-slate-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D4AF37] hover:bg-yellow-400 text-black py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Updating..." : "Update Product"}
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
        className="block text-white mb-2"
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
        className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-lg outline-none focus:border-[#D4AF37]"
        required={required}
      />
    </div>
  );
}