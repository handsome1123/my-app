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
  User,
  Mail,
  Phone,
  MapPin,
  Search,
  Filter,
  Eye
} from "lucide-react";

interface Order {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    imageUrl?: string;
  };
  buyerId: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  quantity: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "rejected";
  createdAt: string;
  paymentSlipUrl?: string;
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

function getStatusConfig(status: string) {
  switch (status) {
    case "pending":
      return { icon: Clock, color: "bg-amber-50 text-amber-700 border-amber-200" };
    case "confirmed":
      return { icon: CheckCircle, color: "bg-blue-50 text-blue-700 border-blue-200" };
    case "shipped":
      return { icon: Truck, color: "bg-purple-50 text-purple-700 border-purple-200" };
    case "delivered":
      return { icon: Home, color: "bg-green-50 text-green-700 border-green-200" };
    case "cancelled":
    case "rejected":
      return { icon: XCircle, color: "bg-red-50 text-red-700 border-red-200" };
    default:
      return { icon: Package, color: "bg-gray-50 text-gray-700 border-gray-200" };
  }
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const router = useRouter();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Unauthorized. Please log in again.");
        return;
      }

      const res = await fetch("/api/seller/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch orders");
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [router]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      setUpdatingOrder(id);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/seller/orders/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === id ? { ...order, status: status as Order["status"] } : order
          )
        );
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update order status");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleShipOrder = async (id: string) => {
    if (!confirm("Mark this order as shipped?")) return;
    try {
      setUpdatingOrder(id);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/seller/orders/${id}/confirm`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        setOrders((prev) => 
          prev.map((order) => 
            order._id === id ? { ...order, status: "shipped" as const } : order
          )
        );
        alert("Order marked as shipped successfully!");
      } else {
        alert(data.error || "Failed to ship order");
      }
    } catch (err) {
      console.error("Failed to ship order:", err);
      alert("Error shipping order");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleRejectOrder = async (id: string) => {
    if (!confirm("Are you sure you want to reject this order?")) return;
    await handleStatusChange(id, "rejected");
  };

  const handleCancelOrder = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this order? This will return money to the buyer.")) return;
    try {
      setUpdatingOrder(id);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/seller/orders/${id}/reject`, { 
        method: "PATCH", 
        headers: { Authorization: `Bearer ${token}` } 
      });

      const data = await res.json();
      if (res.ok) {
        setOrders((prev) => prev.map((order) => (order._id === id ? { ...order, status: "cancelled" as const } : order)));
        alert("Order cancelled. Money returned to buyer.");
      } else {
        alert(data.error || "Failed to cancel order");
      }
    } catch (err) {
      console.error("Failed to cancel order:", err);
      alert("Error cancelling order");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const productName = order.productId?.name || "";
    const buyerName = order.buyerId?.name || "";
    const matchesSearch =
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading orders...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
      <div className="text-center p-6 bg-white rounded-xl shadow-lg">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg"><Package className="h-6 w-6 text-blue-600" /></div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Seller Orders</h1>
          </div>
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product name or buyer..."
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
                <option value="rejected">Rejected</option>
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
                  : "No orders have been placed for your products yet."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon as React.ElementType;

              return (
                <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-full lg:w-32 h-32 relative rounded-xl overflow-hidden bg-gray-100">
                          <Image
                            src={order.productId?.imageUrl || "/placeholder-product.jpg"}
                            alt={order.productId?.name || "Product"}
                            className="w-full h-full object-cover"
                            width={128}
                            height={128}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder-product.jpg";
                            }}
                          />
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 space-y-4">
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-1">{order.productId?.name || "Unknown Product"}</h2>
                            <p className="text-sm text-gray-600 mb-2">Order ID: {order._id}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <span>Qty: {order.quantity}</span>
                              <span className="font-semibold text-gray-900">฿{order.totalPrice.toLocaleString()}</span>
                              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border font-medium text-sm ${statusConfig.color}`}>
                            <StatusIcon className="h-4 w-4" />
                            {order.status.toUpperCase()}
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Buyer Info */}
                          <div className="bg-gray-50 rounded-xl p-4">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-600" />
                              Buyer Information
                            </h3>
                            <div className="space-y-2 text-sm">
                              {order.buyerId ? (
                                <>
                                  <div className="flex items-center gap-2">
                                    <User className="h-3 w-3 text-gray-500" />
                                    <span>{order.buyerId.name || "N/A"}</span>
                                  </div>
                                  {order.buyerId.email && (
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-3 w-3 text-gray-500" />
                                      <span>{order.buyerId.email}</span>
                                    </div>
                                  )}
                                  {order.buyerId.phone && (
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-3 w-3 text-gray-500" />
                                      <span>{order.buyerId.phone}</span>
                                    </div>
                                  )}
                                  {(order.buyerId.address || order.shippingAddress?.address) && (
                                    <div className="flex items-start gap-2">
                                      <MapPin className="h-3 w-3 text-gray-500 mt-0.5" />
                                      <span className="leading-relaxed">
                                        {order.shippingAddress?.address || order.buyerId.address}<br />
                                        {order.shippingAddress?.city || order.buyerId.city}, {order.shippingAddress?.state || order.buyerId.state} {order.shippingAddress?.zipCode || order.buyerId.zipCode}
                                      </span>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="flex items-center gap-2 text-amber-600">
                                  <User className="h-3 w-3" />
                                  <span>Buyer information not available</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Payment Info */}
                          <div className="bg-gray-50 rounded-xl p-4">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Eye className="h-4 w-4 text-gray-600" />
                              Payment Information
                            </h3>
                            {order.paymentSlipUrl ? (
                              <div className="space-y-3">
                                <p className="text-sm text-green-700 font-medium">Payment slip uploaded</p>
                                <a 
                                  href={order.paymentSlipUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="block w-24 h-24 relative rounded-lg overflow-hidden bg-white border hover:border-blue-300 transition-colors"
                                >
                                  <Image
                                    src={order.paymentSlipUrl}
                                    alt="Payment Slip"
                                    className="w-full h-full object-cover"
                                    width={96}
                                    height={96}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = "/placeholder-receipt.jpg";
                                    }}
                                  />
                                </a>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-amber-700">
                                <Clock className="h-4 w-4" />
                                <span>Payment slip not uploaded</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                          {order.status === "pending" && (
                            <>
                              <button
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
                                onClick={() => handleStatusChange(order._id, "confirmed")}
                                disabled={updatingOrder === order._id}
                              >
                                <CheckCircle className="h-4 w-4" />
                                {updatingOrder === order._id ? "Updating..." : "Confirm Order"}
                              </button>
                              <button
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
                                onClick={() => handleRejectOrder(order._id)}
                                disabled={updatingOrder === order._id}
                              >
                                <XCircle className="h-4 w-4" />
                                Reject Order
                              </button>
                            </>
                          )}

                          {order.status === "confirmed" && (
                            <div className="flex gap-2">
                              <button
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
                                onClick={() => handleShipOrder(order._id)}
                                disabled={updatingOrder === order._id}
                              >
                                <Truck className="h-4 w-4" />
                                {updatingOrder === order._id ? "Updating..." : "Mark as Shipped"}
                              </button>
                              <button
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
                                onClick={() => handleCancelOrder(order._id)}
                                disabled={updatingOrder === order._id}
                              >
                                <XCircle className="h-4 w-4" />
                                Cancel Order
                              </button>
                            </div>
                          )}
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