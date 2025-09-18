"use client";

import { useEffect, useState } from "react";
import Image from "next/image";


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
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  paymentSlipUrl?: string;
}

// Status configuration with icons and colors
// function getStatusConfig(status: string) {
//   switch (status) {
//     case "pending":
//       return { icon: Clock, color: "bg-amber-50 text-amber-700 border-amber-200" };
//     case "confirmed":
//       return { icon: CheckCircle, color: "bg-blue-50 text-blue-700 border-blue-200" };
//     case "shipped":
//       return { icon: Truck, color: "bg-purple-50 text-purple-700 border-purple-200" };
//     case "delivered":
//       return { icon: Home, color: "bg-green-50 text-green-700 border-green-200" };
//     case "cancelled":
//       return { icon: XCircle, color: "bg-red-50 text-red-700 border-red-200" };
//     default:
//       return { icon: Package, color: "bg-gray-50 text-gray-700 border-gray-200" };
//   }
// }

export default function SellerSaleOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // useEffect(() => {
  //   const fetchOrders = async () => {
  //     try {
  //       setLoading(true);
  //       setError("");

  //       const token = localStorage.getItem("token");
  //       const res = await fetch("/api/seller/orders", {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       const data = await res.json();

  //       if (!res.ok) {
  //         setError(data.error || "Failed to fetch orders");
  //         setOrders([]);
  //       } else {
  //         // Only show orders confirmed by admin
  //         setOrders(data.orders.filter((o: Order) => o.status !== "pending"));
  //       }
  //     } catch {
  //       setError("Something went wrong");
  //       setOrders([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchOrders();
  // }, []);

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
        // Only show orders confirmed by admin
        setOrders(data.orders.filter((o: Order) => o.status !== "pending"));
      }
    } catch {
      setError("Something went wrong");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStartDelivery = async (orderId: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/seller/orders/ship/${orderId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      alert("Delivery started!");
      fetchOrders();
    } else {
      alert(data.error);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/seller/orders/cancel/${orderId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      alert("Order cancelled and refund initiated!");
      fetchOrders();
    } else {
      alert(data.error);
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
              <th className="p-4">Buyer Info</th>
              <th className="p-4">Quantity</th>
              <th className="p-4">Total Price</th>
              <th className="p-4">Payment Slip</th>
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
                  <td className="p-4 text-sm">
                    <p><strong>Name:</strong> {order.buyerId.name}</p>
                    <p><strong>Email:</strong> {order.buyerId.email || "-"}</p>
                    <p><strong>Phone:</strong> {order.buyerId.phone || "-"}</p>
                    <p>
                      <strong>Address:</strong>{" "}
                      {`${order.buyerId.address || ""}, ${order.buyerId.city || ""}, ${order.buyerId.state || ""}, ${order.buyerId.zipCode || ""}`}
                    </p>
                  </td>
                  <td className="p-4">{order.quantity}</td>
                  <td className="p-4">฿{order.totalPrice.toFixed(2)}</td>
                  <td className="p-4">
                    {order.paymentSlipUrl ? (
                      <a href={order.paymentSlipUrl} target="_blank" rel="noopener noreferrer">
                        <Image
                          src={order.paymentSlipUrl}
                          alt="Payment Slip"
                          className="w-20 h-20 object-cover rounded-md border"
                          width={80}
                          height={80}
                        />
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">Not uploaded</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        order.status === "confirmed"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "shipped"
                          ? "bg-purple-100 text-purple-700"
                          : order.status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 space-x-2">
                    {order.status === "confirmed" && (
                      <>
                        <button
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition"
                          onClick={() => handleStartDelivery(order._id)}
                        >
                          Mark Shipped
                        </button>
                        <button
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md transition"
                          onClick={() => handleCancelOrder(order._id)}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {/* {order.status === "shipped" && (
                      <button
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md transition"
                        onClick={() => handleStatusChange(order._id, "delivered")}
                      >
                        Mark Delivered
                      </button>
                    )} */}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  No orders available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
