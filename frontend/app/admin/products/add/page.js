"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import api from "@/services/api";
import { showSuccessToast, showErrorToast } from "@/utils/toast";


export default function AddProductPage() {
const router = useRouter();

const [formData, setFormData] = useState({
name: "",
description: "",
image: "",
category: "Clothing",
price: "",
});

const [loading, setLoading] = useState(false);

const handleChange = (e) => {
setFormData({
...formData,
[e.target.name]: e.target.value,
});
};

const handleSubmit = async (e) => {
e.preventDefault();


try {
  setLoading(true);

  await api.post("/products", {
    name: formData.name,
    description: formData.description,
    image: formData.image,
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

return ( <div className="max-w-3xl mx-auto px-6 py-12"> <h1 className="text-4xl font-bold text-white mb-8">
Add New Product </h1>

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
        placeholder="Black T-Shirt"
        className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-lg"
        required
      />
    </div>

    <div>
      <label className="block text-white mb-2">
        Description
      </label>

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

    <div>
      <label className="block text-white mb-2">
        Image URL
      </label>

      <input
        type="text"
        name="image"
        value={formData.image}
        onChange={handleChange}
        placeholder="https://image-url.com"
        className="w-full bg-slate-800 border border-slate-600 text-white p-3 rounded-lg"
        required
      />
    </div>

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
        <option value="Clothing">Clothing</option>
        <option value="Shoes">Shoes</option>
        <option value="Accessories">Accessories</option>
        <option value="Hoodies">Hoodies</option>
        <option value="T-Shirts">T-Shirts</option>
      </select>
    </div>

    <div>
      <label className="block text-white mb-2">
        Price (Rs)
      </label>

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

    {formData.image && (
      <div>
        <label className="block text-white mb-2">
          Preview
        </label>

        <img
          src={formData.image}
          alt="Preview"
          className="w-48 h-48 object-cover rounded-lg border border-slate-700"
        />
      </div>
    )}

    <button
      type="submit"
      disabled={loading}
      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
    >
      {loading ? "Adding..." : "Add Product"}
    </button>
  </form>
</div>

);
}
