"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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

// Badge colors
function getStatusColor(status: string) {
  switch (status) {
    case "pending":
      return "bg-yellow-200 text-yellow-800";
    case "confirmed":
      return "bg-blue-200 text-blue-800";
    case "shipped":
      return "bg-orange-200 text-orange-800";
    case "delivered":
      return "bg-green-200 text-green-800";
    case "cancelled":
      return "bg-red-200 text-red-800";
    default:
      return "bg-gray-200 text-gray-800";
  }
}

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/buyer/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setOrders(data.orders);
        else setError(data.error || "Failed to fetch orders");
      } catch {
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading orders...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border rounded-lg shadow-sm p-4 md:flex gap-6 hover:shadow-lg transition-shadow duration-200 overflow-x-auto"
            >
              {/* Product Image */}
              <div className="flex-shrink-0 w-full md:w-32 h-32 relative">
                <Image
                  src={order.productId.imageUrl || "/placeholder.png"}
                  alt={order.productId.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>

              {/* Main Info */}
              <div className="flex-1 flex flex-col justify-between min-w-[250px]">
                <div className="mb-4 md:mb-2">
                  <h2 className="text-lg font-semibold">{order.productId.name}</h2>
                  <p>Quantity: {order.quantity}</p>
                  <p>Total Price: ${order.totalPrice.toFixed(2)}</p>
                  <p className="mt-1">
                    Status:{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Ordered: {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Shipping Info */}
                <div className="mb-2">
                  <h3 className="font-semibold text-gray-700 mb-1">Shipping Info</h3>
                  <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  <p>Email: {order.shippingAddress.email}</p>
                  <p>Phone: {order.shippingAddress.phone}</p>
                  <p>
                    Address: {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
                    {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                </div>

                {/* Payment Slip */}
                {order.paymentSlipUrl ? (
                  <div>
                    <p className="text-gray-600 font-semibold mb-1">Payment Slip:</p>
                    <div className="w-48 h-48 relative">
                      <Image
                        src={order.paymentSlipUrl}
                        alt="Payment Slip"
                        fill
                        className="object-cover rounded-lg border"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No payment slip uploaded yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
