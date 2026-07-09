"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { generateInvoicePDF } from "@/utils/invoiceGenerator";
import OrderDetailSkeleton from "@/components/skeletons/OrderDetailSkeleton";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

const statusColor = {
  Pending: "bg-yellow-500",
  Processing: "bg-blue-500",
  Shipped: "bg-purple-500",
  Delivered: "bg-green-500",
  Cancelled: "bg-red-600",
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [returnOpen, setReturnOpen] = useState(false);
  const [reason, setReason] = useState("Wrong Size");
  const [message, setMessage] = useState("");
  const [returnLoading, setReturnLoading] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        router.push("/signin");
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      const res = await api.get(`/orders/user/${parsedUser.email}`);
      const found = res.data.find((item) => String(item.id) === String(id));

      setOrder(found || null);
    } catch {
      showErrorToast("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      await api.put(`/orders/${order.id}/cancel`);
      setOrder((prev) => ({ ...prev, status: "Cancelled" }));
      showSuccessToast("Order cancelled");
    } catch {
      showErrorToast("Unable to cancel order");
    }
  };

  const submitReturnRequest = async () => {
    if (!order || !user) return;

    try {
      setReturnLoading(true);

      await api.post("/return-requests", {
        orderId: order.id,
        customer: user.username || order.customer,
        email: user.email || order.email,
        reason,
        message,
      });

      showSuccessToast("Return request submitted");
      setReturnOpen(false);
      setMessage("");
    } catch (error) {
      showErrorToast(
        error?.response?.data?.message || "Failed to submit return request"
      );
    } finally {
      setReturnLoading(false);
    }
  };

  const totalQuantity = useMemo(() => {
    return order?.items?.reduce((sum, item) => sum + Number(item.quantity || 1), 0) || 0;
  }, [order]);

  if (loading) return <OrderDetailSkeleton />;

  if (!order) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 text-center text-white">
        <p className="text-5xl mb-4">📭</p>
        <h1 className="text-2xl font-bold mb-2">Order not found</h1>

        <button
          onClick={() => router.push("/profile/my-orders")}
          className="mt-4 bg-[#D4AF37] text-black px-5 py-3 rounded-xl font-semibold"
        >
          ← Back to My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <button
        onClick={() => router.push("/profile/my-orders")}
        className="mb-6 px-5 py-3 rounded-xl border border-[#D4AF37]/40 text-[#D4AF37] font-semibold hover:bg-[#D4AF37]/10"
      >
        ← Back to My Orders
      </button>

      <div className="bg-[#0d1117] border border-slate-700 rounded-2xl p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-[#D4AF37] text-sm font-semibold tracking-widest uppercase mb-2">
              Style Avenue
            </p>

            <h1 className="text-3xl font-bold text-white">Order Details</h1>

            <p className="text-gray-400 mt-2">
              Tracking ID: {order.trackingId}
            </p>
          </div>

          <span
            className={`${
              statusColor[order.status] || "bg-gray-500"
            } px-4 py-2 rounded-full text-white text-sm font-medium w-fit`}
          >
            {order.status}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <InfoBox title="Customer Information">
            <Line label="Customer" value={order.customer} />
            <Line label="Email" value={order.email} />
            <Line label="Phone" value={order.phone} />
            <Line label="Address" value={order.address} />
          </InfoBox>

          <InfoBox title="Order Summary">
            <Line label="Order ID" value={`#${order.id}`} />
            <Line
              label="Date"
              value={new Date(order.createdAt).toLocaleDateString("en-PK")}
            />
            <Line label="Total Quantity" value={totalQuantity} />
            <Line label="Payment Method" value={order.paymentMethod || "COD"} />
            <Line label="Payment Status" value={order.paymentStatus || "PENDING"} />

            <p className="text-[#D4AF37] font-bold text-lg mt-4">
              Total: Rs {Number(order.total || 0).toLocaleString("en-PK")}
            </p>
          </InfoBox>
        </div>

        <div className="border border-slate-700 rounded-xl p-5 mb-8">
          <h2 className="text-xl font-bold text-white mb-5">
            Ordered Products
          </h2>

          <div className="space-y-4">
            {order.items?.map((item) => (
              <div
                key={item.id}
                className="border border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <img
                  src={item.product?.image || "/placeholder-product.png"}
                  alt={item.product?.name || "Product"}
                  className="w-full sm:w-24 h-48 sm:h-24 rounded-lg object-cover border border-slate-700"
                />

                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">
                    {item.product?.name || "Product"}
                  </h3>

                  <p className="text-gray-400 text-sm mt-1">
                    Quantity: {item.quantity}
                  </p>

                  <p className="text-gray-400 text-sm mt-1">
                    Unit Price: Rs {item.price}
                  </p>

                  <p className="text-[#D4AF37] font-semibold mt-2">
                    Subtotal: Rs {Number(item.price || 0) * Number(item.quantity || 1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <button
            onClick={() => generateInvoicePDF(order, "user")}
            className="px-5 py-3 rounded-lg bg-[#D4AF37] text-black font-semibold"
          >
            📄 Download Invoice
          </button>

          <div className="flex flex-col sm:flex-row gap-3">
            {order.status === "Delivered" && (
              <button
                onClick={() => setReturnOpen(true)}
                className="px-5 py-3 rounded-lg bg-[#D4AF37] text-black font-semibold"
              >
                Return Request
              </button>
            )}

            {order.status !== "Delivered" && order.status !== "Cancelled" && (
              <button
                onClick={cancelOrder}
                className="px-5 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>

      {returnOpen && (
        <ReturnModal
          order={order}
          reason={reason}
          setReason={setReason}
          message={message}
          setMessage={setMessage}
          loading={returnLoading}
          onClose={() => setReturnOpen(false)}
          onSubmit={submitReturnRequest}
        />
      )}
    </div>
  );
}

function InfoBox({ title, children }) {
  return (
    <div className="border border-slate-700 rounded-xl p-4">
      <h2 className="text-white font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Line({ label, value }) {
  return (
    <p className="text-gray-300 mt-2">
      <strong className="text-white">{label}:</strong> {value}
    </p>
  );
}

function ReturnModal({
  order,
  reason,
  setReason,
  message,
  setMessage,
  loading,
  onClose,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-slate-900 border border-[#D4AF37]/30 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Return Request</h2>

        <p className="text-gray-400 text-sm mb-5">
          Order: <span className="text-[#D4AF37]">{order.trackingId}</span>
        </p>

        <label className="block text-white mb-2">Reason</label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 mb-4 outline-none focus:border-[#D4AF37]"
        >
          <option>Wrong Size</option>
          <option>Damaged Product</option>
          <option>Wrong Product</option>
          <option>Quality Issue</option>
          <option>Other</option>
        </select>

        <label className="block text-white mb-2">Message</label>
        <textarea
          rows="4"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write extra details..."
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 outline-none resize-none focus:border-[#D4AF37]"
        />

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-600 text-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-[#D4AF37] text-black font-semibold disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}