"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Truck, Clock, CheckCircle, MapPin, Package } from "lucide-react";
import Link from "next/link";

interface TrackingUpdate {
  _id: string;
  status: "pending_payment" | "paid" | "confirmed" | "shipped" | "delivered" | "cancelled" | "rejected";
  message: string;
  location?: string;
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
}

const statusConfig = {
  pending_payment: {
    icon: Clock,
    color: "bg-gray-100 text-gray-700",
    label: "Payment Pending",
    description: "Waiting for payment confirmation"
  },
  paid: {
    icon: CheckCircle,
    color: "bg-blue-100 text-blue-700",
    label: "Payment Received",
    description: "Payment has been confirmed"
  },
  confirmed: {
    icon: CheckCircle,
    color: "bg-green-100 text-green-700",
    label: "Order Confirmed",
    description: "Seller has confirmed your order"
  },
  shipped: {
    icon: Truck,
    color: "bg-purple-100 text-purple-700",
    label: "Shipped",
    description: "Your order is on the way"
  },
  delivered: {
    icon: Package,
    color: "bg-emerald-100 text-emerald-700",
    label: "Delivered",
    description: "Order has been delivered"
  },
  cancelled: {
    icon: Clock,
    color: "bg-red-100 text-red-700",
    label: "Cancelled",
    description: "Order has been cancelled"
  },
  rejected: {
    icon: Clock,
    color: "bg-red-100 text-red-700",
    label: "Rejected",
    description: "Order has been rejected"
  }
};

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [tracking, setTracking] = useState<TrackingUpdate[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = useCallback(async () => {
    console.log('fetchTracking called with orderId:', orderId);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`/api/buyer/orders/${orderId}/tracking`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setTracking(data.tracking || []);
        setCurrentStatus(data.currentStatus);
      } else {
        setError(data.error || "Failed to fetch tracking");
      }
    } catch (err) {
      console.error("Failed to fetch tracking:", err);
      setError("Failed to fetch tracking");
    } finally {
      setLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    console.log('useEffect running for tracking with new fetchTracking reference, orderId:', orderId);
    fetchTracking();
  }, [orderId, fetchTracking]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-xl shadow-lg">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <Link
            href="/buyer/orders"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusConfig = statusConfig[currentStatus as keyof typeof statusConfig] || statusConfig.pending_payment;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href={`/buyer/orders/${orderId}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
            <p className="text-gray-600">Order #{orderId.slice(-8)}</p>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${currentStatusConfig.color}`}>
              <currentStatusConfig.icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{currentStatusConfig.label}</h2>
              <p className="text-gray-600">{currentStatusConfig.description}</p>
            </div>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Tracking Updates</h3>

          {tracking.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tracking updates yet</p>
              <p className="text-sm text-gray-400">Updates will appear here as your order progresses</p>
            </div>
          ) : (
            <div className="space-y-6">
              {tracking.map((update, index) => {
                const config = statusConfig[update.status as keyof typeof statusConfig] || statusConfig.pending_payment;
                const StatusIcon = config.icon;
                const isLast = index === tracking.length - 1;

                return (
                  <div key={update._id} className="flex gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className={`p-2 rounded-full ${config.color}`}>
                        <StatusIcon className="w-4 h-4" />
                      </div>
                      {!isLast && <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{config.label}</h4>
                          <p className="text-gray-600 text-sm">{update.message}</p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(update.createdAt).toLocaleString()}
                        </span>
                      </div>

                      {/* Additional details */}
                      <div className="space-y-2 text-sm text-gray-600">
                        {update.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{update.location}</span>
                          </div>
                        )}
                        {update.carrier && update.trackingNumber && (
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            <span>{update.carrier} - Tracking: {update.trackingNumber}</span>
                          </div>
                        )}
                        {update.estimatedDelivery && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Estimated delivery: {new Date(update.estimatedDelivery).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 rounded-xl p-6 mt-6">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-gray-600 text-sm mb-4">
            If you have questions about your order or need assistance, contact our support team.
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}