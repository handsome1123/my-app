"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";

interface Order {
  _id: string;
  productId?: {
    _id: string;
    name: string;
    imageUrl?: string;
    price: number;
  };
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function BuyerHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { router.replace("/login"); return; }

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/buyer/orders", { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!mounted) return;
        if (res.ok && Array.isArray(data.orders)) setOrders(data.orders);
        else setError(data.error || "Failed to load orders");
      } catch {
        if (mounted) setError("Unable to load orders");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => router.refresh()} className="px-4 py-2 bg-blue-600 text-white rounded">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Order History</h1>
          <Link href="/buyer/products" className="text-blue-600">Browse products</Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow">
            <Package className="mx-auto mb-4 w-12 h-12 text-gray-400" />
            <h2 className="text-lg font-semibold">No orders yet</h2>
            <p className="text-gray-500 mt-2">Your past orders will appear here.</p>
            <div className="mt-4">
              <Link href="/buyer/products" className="px-4 py-2 bg-blue-600 text-white rounded">Start shopping</Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-lg shadow p-4 flex gap-4 items-center">
                <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                  {order.productId?.imageUrl ? (
                    <Image src={order.productId.imageUrl} alt={order.productId.name} width={80} height={80} className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-400">📦</div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{order.productId?.name || "Order"}</h3>
                      <p className="text-sm text-gray-500 mt-1">Qty: {order.quantity}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                      <div className="text-lg font-semibold text-gray-900">฿{order.totalPrice.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === "delivered" ? "bg-green-100 text-green-800" :
                      order.status === "shipped" ? "bg-purple-100 text-purple-800" :
                      order.status === "pending_payment" ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {order.status.replace("_", " ")}
                    </span>
                    <Link href={`/buyer/orders/${order._id}`} className="text-sm text-blue-600">View details</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
