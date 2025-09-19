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
  User,
  CreditCard,
  ShoppingBag,
  Filter,
  Search,
  X
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
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
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

// Status configuration with icons and colors
function getStatusConfig(status: string) {
  switch (status) {
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

  useEffect(() => {
    async function fetchOrders() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
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
          // optionally redirect to login
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
        let data;
        try {
          data = await res.json();
        } catch {
          data = { error: "Failed to confirm payment" };
        }
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


  if (loading) return <p className="text-center mt-10">Loading orders...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Orders</h1>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white min-w-[150px]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-md mx-auto">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria." 
                  : "You haven't placed any orders yet. Start shopping to see your orders here!"
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-full lg:w-32 h-32 relative rounded-xl overflow-hidden bg-gray-100">
                          <Image
                            src={order.productId?.imageUrl || "/api/placeholder/200/200"}
                            alt={order.productId?.name || "Unknown product"}
                            className="w-full h-full object-cover"
                            width={100}
                            height={100}
                          />
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 space-y-4">
                        {/* Product Info & Status */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                              {order.productId?.name || "Unknown product"}
                            </h2>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Package className="h-4 w-4" />
                                Qty: {order.quantity}
                              </span>
                              <span className="font-semibold text-gray-900">
                                ฿{(order.totalPrice ?? 0).toFixed(2)}
                              </span>

                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border font-medium text-sm ${statusConfig.color}`}>
                            <StatusIcon className="h-4 w-4" />
                            {order.status.toUpperCase()}
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Shipping Information */}
                          <div className="bg-gray-50 rounded-xl p-4">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-600" />
                              Shipping Details
                            </h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3 text-gray-500" />
                                <span>
                                  {order.shippingAddress?.firstName ?? "Unknown"} {order.shippingAddress?.lastName ?? ""}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3 text-gray-500" />
                                <span>{order.shippingAddress?.email ?? "No email provided"}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-gray-500" />
                                <span>{order.shippingAddress?.phone ?? "No phone number"}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <MapPin className="h-3 w-3 text-gray-500 mt-0.5" />
                                <span className="leading-relaxed">
                                  {order.shippingAddress?.address}<br />
                                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Payment Information */}
                          <div className="bg-gray-50 rounded-xl p-4">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-gray-600" />
                              Payment Details
                            </h3>
                            {order.paymentSlipUrl ? (
                              <div className="space-y-3">
                                <p className="text-sm text-green-700 font-medium">Payment slip uploaded</p>
                                <div
                                  className="w-24 h-24 relative rounded-lg overflow-hidden bg-white border cursor-pointer"
                                  onClick={() => {
                                    setModalImage(order.paymentSlipUrl!);setSelectedOrderId(order._id);
                                  }}
                                >
                                  <Image
                                    src={order.paymentSlipUrl}
                                    alt="Payment Slip"
                                    className="w-full h-full object-cover"
                                    width={100}
                                    height={100}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-amber-700">
                                <Clock className="h-4 w-4" />
                                <span>Awaiting payment confirmation</span>
                              </div>
                            )}

                            {modalImage && selectedOrderId && (
                              <ImageModal
                                src={modalImage}
                                onClose={() => {
                                  setModalImage(null);
                                  setSelectedOrderId(null);
                                }}
                                onConfirm={handleConfirmPayment}
                                onReject={handleRejectPayment}
                              />
                            )}

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
