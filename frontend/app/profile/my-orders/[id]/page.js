"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/services/api";

export default function OrderDetailPage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const res = await api.get(`/orders/user/${user.email}`);

      const foundOrder = res.data.find(
        (o) => String(o.id) === String(id)
      );

      setOrder(foundOrder || null);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500";

      case "Processing":
        return "bg-blue-500";

      case "Shipped":
        return "bg-purple-500";

      case "Delivered":
        return "bg-green-500";

      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 text-center text-white">
        Loading...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 text-center text-white">
        Order not found
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="bg-[#0d1117] border border-slate-700 rounded-2xl p-8">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Order Details
            </h1>

            <p className="text-gray-400 mt-2">
              Tracking ID: {order.trackingId}
            </p>
          </div>

          <span
            className={`${getStatusColor(
              order.status
            )} px-4 py-2 rounded-full text-white text-sm font-medium`}
          >
            {order.status}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">

          <div className="border border-slate-700 rounded-xl p-4">
            <p className="text-white">
              <strong>Customer:</strong> {order.customer}
            </p>

            <p className="text-gray-300 mt-2">
              <strong>Email:</strong> {order.email}
            </p>

            <p className="text-gray-300 mt-2">
              <strong>Phone:</strong> {order.phone}
            </p>

            <p className="text-gray-300 mt-2">
              <strong>Address:</strong> {order.address}
            </p>
          </div>

          <div className="border border-slate-700 rounded-xl p-4">
            <p className="text-white">
              <strong>Order ID:</strong> #{order.id}
            </p>

            <p className="text-gray-300 mt-2">
              <strong>Date:</strong>{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </p>

            <p className="text-[#D4AF37] font-bold text-lg mt-4">
              Total: Rs {order.total}
            </p>
          </div>

        </div>

        <div className="border border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-5">
            Ordered Products
          </h2>

          {order.items && order.items.length > 0 ? (
            <div className="space-y-4">

              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="border border-slate-700 rounded-xl p-4 flex items-center gap-4"
                >
                  <img
                    src={
                      item.product?.image ||
                      "/placeholder-product.png"
                    }
                    alt={item.product?.name || "Product"}
                    className="w-24 h-24 rounded-lg object-cover border border-slate-700"
                  />

                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">
                      {item.product?.name || "Product"}
                    </h3>

                    <p className="text-gray-400 text-sm mt-1">
                      Quantity: {item.quantity}
                    </p>

                    <p className="text-[#D4AF37] font-semibold mt-2">
                      Rs {item.price}
                    </p>
                  </div>
                </div>
              ))}

            </div>
          ) : (
            <p className="text-gray-400">
              No products found in this order
            </p>
          )}
        </div>

      </div>
    </div>
  );
}