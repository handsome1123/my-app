"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  Home, 
  XCircle, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  RefreshCcw,
  Search,
  X,
  Trash2
} from "lucide-react";

interface Order {
  _id: string;
  productId: {
    _id: string;
    name: string;
    imageUrl?: string;
    price: number;
  };
  quantity: number;
  totalPrice: number;
  status: "pending_payment" | "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "rejected";
  stripePaymentIntentId?: string;
  paymentSlipUrl?: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
}

interface ModalProps {
  src: string;
  alt?: string;
  onClose: () => void;
  onConfirm: () => void;
  onReject: () => void;
}

interface DeleteModalProps {
  orderId: string;
  onClose: () => void;
  onConfirm: () => void;
}

function ImageModal({ src, alt, onClose, onConfirm, onReject }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-auto py-10">
      <div className="relative bg-white rounded-lg shadow-lg max-w-3xl w-full mx-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 rounded-full bg-white shadow hover:bg-gray-100 z-10"
        >
          <X size={20} />
        </button>
        <div className="p-4 flex justify-center">
          <Image
            src={src}
            alt={alt || "Payment Slip"}
            width={800}
            height={800}
            className="w-full h-auto object-contain"
          />
        </div>
        <div className="flex justify-center gap-4 p-4 border-t">
          <button
            onClick={onConfirm}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Confirm
          </button>
          <button
            onClick={onReject}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ onClose, onConfirm }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
        <p className="text-gray-600 mb-6">Are you sure you want to delete this order? This action cannot be undone.</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Status configuration with icons and colors
function getStatusConfig(status: string) {
  switch (status) {
    case "pending_payment":
      return {
        icon: Clock,
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800"
      };
    case "pending":
      return {
        icon: Clock,
        color: "bg-amber-50 text-amber-700 border-amber-200",
        bgColor: "bg-amber-100",
        textColor: "text-amber-800"
      };
    case "confirmed":
      return {
        icon: CheckCircle,
        color: "bg-blue-50 text-blue-700 border-blue-200",
        bgColor: "bg-blue-100",
        textColor: "text-blue-800"
      };
    case "shipped":
      return {
        icon: Truck,
        color: "bg-purple-50 text-purple-700 border-purple-200",
        bgColor: "bg-purple-100",
        textColor: "text-purple-800"
      };
    case "delivered":
      return {
        icon: Home,
        color: "bg-green-50 text-green-700 border-green-200",
        bgColor: "bg-green-100",
        textColor: "text-green-800"
      };
    case "cancelled":
    case "rejected":
      return {
        icon: XCircle,
        color: "bg-red-50 text-red-700 border-red-200",
        bgColor: "bg-red-100",
        textColor: "text-red-800"
      };
    default:
      return {
        icon: Package,
        color: "bg-gray-50 text-gray-700 border-gray-200",
        bgColor: "bg-gray-100",
        textColor: "text-gray-800"
      };
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const router = useRouter();
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [deleteModalOrderId, setDeleteModalOrderId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Track deleting state

  useEffect(() => {
    async function fetchOrders() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch("/api/admin/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok) {
          setOrders(data.orders);
        } else if (res.status === 401) {
          setError("Unauthorized. Please log in again.");
          router.replace("/login");
        } else {
          setError(data.error || "Failed to fetch orders");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [router]);

  const filteredOrders = orders.filter(order => {
    const productName = order.productId?.name ?? "";
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handler to confirm payment
  const handleConfirmPayment = async () => {
    if (!selectedOrderId) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const res = await fetch(`/api/admin/orders/confirm/${selectedOrderId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === selectedOrderId ? { ...o, status: "confirmed" } : o
          )
        );
        alert("Payment confirmed! Order is now ready for delivery.");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to confirm payment");
      }
    } catch (err) {
      console.error(err);
      alert("Error confirming payment");
    } finally {
      setModalImage(null);
      setSelectedOrderId(null);
    }
  };

  // Handler to reject payment
  const handleRejectPayment = async () => {
    if (!selectedOrderId) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const res = await fetch(`/api/admin/orders/cancel/${selectedOrderId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === selectedOrderId ? { ...o, status: "cancelled" } : o
          )
        );
        alert("Payment rejected. Money returned to buyer.");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to reject payment");
      }
    } catch (err) {
      console.error(err);
      alert("Error rejecting payment");
    } finally {
      setModalImage(null);
      setSelectedOrderId(null);
    }
  };

  // Handler to delete order
  const handleDeleteOrder = async (orderId: string) => {
    setDeleteModalOrderId(orderId); // Show modal instead of confirm
  };

  // Handler for confirming deletion
  const handleConfirmDelete = async (orderId: string) => {
    if (!orderId) return;

    setIsDeleting(orderId); // Set loading state
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      // ✅ FIX: remove "delete" in the path
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
        alert("Order deleted successfully.");
      } else {
        const data = await res.json();
        switch (res.status) {
          case 401:
            alert("Unauthorized: Please log in again.");
            router.replace("/login");
            break;
          case 403:
            alert("Unauthorized: Admin access required.");
            break;
          case 404:
            alert("Order not found.");
            break;
          default:
            alert(data.error || "Failed to delete order.");
        }
      }
    } catch (err) {
      console.error(`Error deleting order ${orderId}:`, err);
      alert("Error deleting order. Please try again.");
    } finally {
      setIsDeleting(null);
      setDeleteModalOrderId(null);
    }
  };

  // small helper to format currency
  const fmt = (v?: number) => (v !== undefined ? `฿${v.toFixed(2)}` : "฿0.00");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="max-w-5xl w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl p-5 shadow-sm">
              <div className="h-36 bg-gray-200 rounded-md mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="flex gap-2">
                <div className="h-8 w-24 bg-gray-200 rounded" />
                <div className="h-8 w-12 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-2xl p-8 shadow">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Retry
            </button>
            <button
              onClick={() => router.replace("/")}
              className="px-4 py-2 bg-gray-50 border rounded-lg"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header + quick stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Orders</h1>
                  <p className="text-sm text-gray-500 mt-1">Review incoming orders and manage payment confirmations</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex gap-3">
                <div className="text-sm text-gray-600">
                  <div className="text-xs text-gray-400">Total</div>
                  <div className="font-semibold text-gray-900">{orders.length}</div>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="text-xs text-gray-400">Pending</div>
                  <div className="font-semibold text-amber-600">{orders.filter(o => o.status === 'pending' || o.status === 'pending_payment').length}</div>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="text-xs text-gray-400">Shipped</div>
                  <div className="font-semibold text-purple-600">{orders.filter(o => o.status === 'shipped').length}</div>
                </div>
              </div>

              <button
                title="Refresh"
                onClick={() => { setLoading(true); setTimeout(() => window.location.reload(), 200); }}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              >
                <RefreshCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {/*
                {key: 'all', label: 'All'},
                {key: 'pending_payment', label: 'Waiting Payment'},
                {key: 'pending', label: 'Pending'},
                {key: 'confirmed', label: 'Confirmed'},
                {key: 'shipped', label: 'Shipped'},
                {key: 'delivered', label: 'Delivered'},
                {key: 'cancelled', label: 'Cancelled'}
              */}
              {Object.entries({
                all: "All",
                pending_payment: "Waiting Payment",
                pending: "Pending",
                confirmed: "Confirmed",
                shipped: "Shipped",
                delivered: "Delivered",
                cancelled: "Cancelled"
              }).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key as keyof Order)}
                  className={`text-sm px-3 py-2 rounded-full transition ${
                    statusFilter === key ? 'bg-blue-600 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orders list */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-md mx-auto">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting filters or search terms."
                  : "No orders yet — customer orders will appear here."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map(order => {
              const statusCfg = getStatusConfig(order.status);
              const StatusIcon = statusCfg.icon;
              return (
                <article
                  key={order._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col lg:flex-row gap-4 items-start hover:shadow-md transition"
                >
                  {/* thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="w-full lg:w-36 h-36 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      <Image
                        src={order.productId?.imageUrl || "/api/placeholder/200/200"}
                        alt={order.productId?.name || "Product"}
                        width={140}
                        height={140}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>

                  {/* main info */}
                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                    <div className="lg:col-span-2">
                      <h3 className="text-lg font-semibold text-gray-900">{order.productId?.name}</h3>
                      <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-4 items-center">
                        <span className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" /> Qty: <strong className="text-gray-900 ml-1">{order.quantity}</strong>
                        </span>
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" /> {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className="font-semibold text-gray-900">{fmt(order.totalPrice)}</span>
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* shipping brief */}
                        <div className="text-sm text-gray-600 flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                          <div>
                            <div className="font-medium text-gray-800">
                              {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.shippingAddress?.city}, {order.shippingAddress?.state}
                            </div>
                          </div>
                        </div>

                        {/* contact */}
                        <div className="text-sm text-gray-600 flex items-start gap-3">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{order.shippingAddress?.phone || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{order.shippingAddress?.email || '—'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* right column: status & actions */}
                    <div className="flex flex-col items-start lg:items-end gap-3">
                      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-medium ${statusCfg.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="uppercase tracking-wider text-xs">{order.status.replace("_", " ")}</span>
                      </div>

                      {/* payment slip preview or hint */}
                      <div className="flex items-center gap-2">
                        {order.paymentSlipUrl ? (
                          <button
                            onClick={() => { setModalImage(order.paymentSlipUrl!); setSelectedOrderId(order._id); }}
                            className="text-sm px-3 py-2 bg-white border rounded-md hover:shadow transition"
                          >
                            View Slip
                          </button>
                        ) : (
                          <div className="text-sm px-3 py-2 bg-yellow-50 text-amber-700 rounded-md">No slip</div>
                        )}
                      </div>

                      {/* actions */}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                          title="Delete order"
                          disabled={isDeleting === order._id}
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>

                        {order.paymentSlipUrl && order.status === "pending_payment" && (
                          <>
                            <button
                              onClick={() => { setModalImage(order.paymentSlipUrl!); setSelectedOrderId(order._id); }}
                              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition"
                            >
                              Review Payment
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals (unchanged behavior) */}
      {modalImage && selectedOrderId && (
        <ImageModal
          src={modalImage}
          onClose={() => { setModalImage(null); setSelectedOrderId(null); }}
          onConfirm={handleConfirmPayment}
          onReject={handleRejectPayment}
        />
      )}

      {deleteModalOrderId && (
        <DeleteModal
          orderId={deleteModalOrderId}
          onClose={() => setDeleteModalOrderId(null)}
          onConfirm={() => handleConfirmDelete(deleteModalOrderId)}
        />
      )}
    </div>
  );
}
