"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import api from "@/services/api";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    price: "",
  });

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
        price: res.data.price,
      });
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to load product");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/products/${params.id}`, formData);

      showSuccessToast("Product Updated Successfully");

      router.push("/admin/products");
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to update product");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-white mb-8">
        Edit Product
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4"
      >
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Product Name"
          className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-lg"
          required
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          rows="4"
          className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-lg"
          required
        />

        <input
          type="text"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="Image URL"
          className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-lg"
          required
        />

        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="Price"
          className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-lg"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition cursor-pointer"
        >
          Update Product
        </button>
      </form>
    </div>
  );
}