"use client";

import { useEffect, useState } from "react";

interface Order {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
  };
  buyerId: {
    _id: string;
    name: string;
    email?: string;
  };
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        const res = await fetch("/api/seller/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch orders");
          setOrders([]);
        } else {
          setOrders(data.orders || []);
        }
      } catch {
        setError("Something went wrong");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (res.ok) {
      setOrders((prev) =>
        prev.map((order) => (order._id === id ? { ...order, status } : order))
      );
    } else {
      alert(data.error || "Failed to update status");
    }
  };

  if (loading) return <p className="p-4">Loading orders...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-2xl font-bold mb-6">Seller Orders</h2>

      <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Product</th>
              <th className="p-4">Buyer</th>
              <th className="p-4">Quantity</th>
              <th className="p-4">Total Price</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order._id} className="border-t hover:bg-gray-50">
                  <td className="p-4">{order._id}</td>
                  <td className="p-4">{order.productId.name}</td>
                  <td className="p-4">
                    {order.buyerId.name} <br />
                    <span className="text-xs text-gray-400">{order.buyerId.email}</span>
                  </td>
                  <td className="p-4">{order.quantity}</td>
                  <td className="p-4">${order.totalPrice}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.status === "shipped"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 space-x-2">
                    {order.status === "pending" && (
                      <button
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition"
                        onClick={() => handleStatusChange(order._id, "shipped")}
                      >
                        Mark Shipped
                      </button>
                    )}
                    {order.status === "shipped" && (
                      <button
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md transition"
                        onClick={() => handleStatusChange(order._id, "delivered")}
                      >
                        Mark Delivered
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
