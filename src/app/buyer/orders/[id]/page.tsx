"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle2, Clock, Truck } from "lucide-react";
import Link from "next/link";

interface Order {
  _id: string;
  productId?: { _id: string; name: string; imageUrl?: string; price: number; };
  quantity: number;
  totalPrice: number;
  status: string;
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    phone?: string;
  };
  createdAt: string;
}

export default function BuyerOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState("wrong_item");
  const [refundDetails, setRefundDetails] = useState("");
  const [refundAmount, setRefundAmount] = useState<number | "">("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [submittingRefund, setSubmittingRefund] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);
  const [refundSuccess, setRefundSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/buyer/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!mounted) return;
        if (res.ok) setOrder(data.order);
        else setError(data.error || "Failed to load order");
      } catch (err) {
        console.error(err);
        if (mounted) setError("Unable to load order");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [id, router]);

  const handleConfirmReceived = async () => {
    if (!order) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { router.push("/login"); return; }

    setConfirming(true);
    setError(null);
    try {
      const res = await fetch("/api/buyer/orders/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId: order._id }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Receipt confirmed. Payout request created for the seller.");
        setOrder({ ...order, status: "completed" });
      } else {
        setError(data.error || "Failed to confirm receipt");
      }
    } catch (err) {
      console.error(err);
      setError("Network error while confirming receipt");
    } finally {
      setConfirming(false);
    }
  };

  // Refund submit handler
  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setRefundError(null);
    setRefundSuccess(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { setRefundError("Please login to request a refund."); return; }
    setSubmittingRefund(true);
    try {
      const payload = {
        orderId: order._id,
        amount: refundAmount === "" ? order.totalPrice : Number(refundAmount),
        reason: refundReason,
        details: refundDetails,
        evidenceUrls: evidenceUrl ? [evidenceUrl] : [],
      };
      const res = await fetch("/api/buyer/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setRefundSuccess("Refund request submitted.");
        setShowRefundModal(false);
        // Optionally update order or navigate
      } else {
        setRefundError(data.error || "Failed to submit refund");
      }
    } catch (err) {
      console.error(err);
      setRefundError("Network error while submitting refund");
    } finally {
      setSubmittingRefund(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center text-red-600">{error || "Order not found"}</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Order #{order._id}</h1>
            <div className="text-sm text-gray-500">Placed: {new Date(order.createdAt).toLocaleString()}</div>
          </div>
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700">
              {order.status === "completed" ? <CheckCircle2 /> : <Clock />}
              {order.status.replace("_", " ")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-3">
            <div className="flex gap-4 items-center">
              <div className="w-28 h-28 rounded-md overflow-hidden bg-gray-100">
                {order.productId?.imageUrl ? (
                  <Image src={order.productId.imageUrl} alt={order.productId.name} width={112} height={112} className="object-cover" />
                ) : <div className="flex items-center justify-center w-full h-full text-gray-400">📦</div>}
              </div>
              <div>
                <div className="font-medium text-gray-900">{order.productId?.name}</div>
                <div className="text-sm text-gray-600">Qty: {order.quantity}</div>
                <div className="text-sm text-gray-600">Price: ฿{order.productId?.price?.toFixed(2)}</div>
                <div className="text-lg font-semibold mt-2">Total: ฿{order.totalPrice.toFixed(2)}</div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Shipping Address</h3>
              <div className="text-sm text-gray-600">
                {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}<br />
                {order.shippingAddress?.address}<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}<br />
                {order.shippingAddress?.country}<br />
                <span className="text-xs text-gray-500">Phone: {order.shippingAddress?.phone}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-white p-4 rounded shadow-sm">
              <div className="text-sm text-gray-500">Order total</div>
              <div className="text-2xl font-bold">฿{order.totalPrice.toFixed(2)}</div>
            </div>

            <div className="bg-white p-4 rounded shadow-sm">
              <h4 className="text-sm font-medium mb-2">Actions</h4>
              <div className="space-y-2">
                <Link
                  href={`/buyer/orders/${id}/tracking`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Truck className="w-4 h-4" />
                  Track Order
                </Link>

                {order.status !== "completed" ? (
                  <button
                    onClick={handleConfirmReceived}
                    disabled={confirming}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
                  >
                    {confirming ? "Confirming..." : "Confirm Received"}
                  </button>
                ) : (
                  <div className="text-sm text-gray-600">You have confirmed receipt.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
        {success && <div className="text-sm text-green-600">{success}</div>}

        {/* Request Refund Button (place next to other actions) */}
        <div className="mt-4">
          <button
            onClick={() => setShowRefundModal(true)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            disabled={order.status === "completed" || order.status === "refund_requested"}
          >
            Request Refund
          </button>
          {refundSuccess && <div className="text-sm text-green-600 mt-2">{refundSuccess}</div>}
        </div>

        {/* Refund Modal */}
        {showRefundModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-lg w-full p-6">
              <h3 className="text-lg font-semibold mb-3">Request a Refund</h3>
              <form onSubmit={handleSubmitRefund} className="space-y-3">
                <label className="block">
                  <span className="text-sm text-gray-700">Reason</span>
                  <select value={refundReason} onChange={(e) => setRefundReason(e.target.value)} className="mt-1 w-full border rounded p-2">
                    <option value="wrong_item">Wrong item delivered</option>
                    <option value="damaged">Damaged item</option>
                    <option value="not_received">Not received</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm text-gray-700">Details</span>
                  <textarea value={refundDetails} onChange={(e) => setRefundDetails(e.target.value)} rows={4} className="mt-1 w-full border rounded p-2" />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-700">Refund amount (optional)</span>
                  <input type="number" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value === "" ? "" : Number(e.target.value))} className="mt-1 w-full border rounded p-2" />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-700">Evidence image URL (optional)</span>
                  <input value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} placeholder="https://..." className="mt-1 w-full border rounded p-2" />
                </label>

                {refundError && <div className="text-sm text-red-600">{refundError}</div>}

                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowRefundModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                  <button type="submit" disabled={submittingRefund} className="px-4 py-2 bg-blue-600 text-white rounded">
                    {submittingRefund ? "Submitting..." : "Submit Refund Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
