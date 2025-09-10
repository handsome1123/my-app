"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Product {
  _id: string;
  name: string;
  imageUrl: string;
  price: number;
}

interface Order {
  _id: string;
  product: Product;
  quantity: number;
  status: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token"); // assuming JWT is stored here
        if (!token) {
          setError("You must be logged in to view orders.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/buyer/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) setOrders(data.orders);
        else setError(data.error || "Failed to fetch orders");
      } catch {
        setError("Something went wrong while fetching orders.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) return <p className="text-center p-6">Loading orders...</p>;
  if (error) return <p className="text-center text-red-500 p-6">{error}</p>;
  if (orders.length === 0) return <p className="text-center p-6">No orders found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-lg shadow p-4 flex gap-4 items-center"
          >
            <div className="relative w-24 h-24 flex-shrink-0">
              <Image
                src={order.product?.imageUrl || "/placeholder.png"}
                alt={order.product?.name}
                fill
                className="object-cover rounded"
              />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">{order.product?.name}</h2>
              <p>Quantity: {order.quantity}</p>
              <p>Price: ${order.product?.price * order.quantity}</p>
              <p>Status: <span className="capitalize">{order.status}</span></p>
              <p className="text-sm text-gray-500">
                Ordered on: {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
