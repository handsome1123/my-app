'use client';

import React, { useState } from 'react';

interface Order {
  id: string;
  productTitle: string;
  buyerName: string;
  status: 'pending' | 'confirmed' | 'rejected';
}

export default function SellerOrders() {
  // TODO: fetch seller orders from API/DB
  const [orders, setOrders] = useState<Order[]>([
    { id: '1', productTitle: 'Laptop', buyerName: 'Somchai', status: 'pending' },
    { id: '2', productTitle: 'Table', buyerName: 'Nida', status: 'confirmed' },
  ]);

  const handleConfirm = (id: string) => {
    alert(`Confirm order ${id}`);
    // TODO: update order status to confirmed via API
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'confirmed' } : o))
    );
  };

  const handleReject = (id: string) => {
    alert(`Reject order ${id}`);
    // TODO: update order status to rejected via API
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'rejected' } : o))
    );
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 border border-gray-300">Product</th>
              <th className="p-3 border border-gray-300">Buyer</th>
              <th className="p-3 border border-gray-300">Status</th>
              <th className="p-3 border border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map(({ id, productTitle, buyerName, status }) => (
                <tr key={id} className="border-t hover:bg-gray-50">
                  <td className="p-3 border border-gray-300">{productTitle}</td>
                  <td className="p-3 border border-gray-300">{buyerName}</td>
                  <td className="p-3 border border-gray-300">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="p-3 border border-gray-300 space-x-2">
                    {status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleConfirm(id)}
                          className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleReject(id)}
                          className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-500">No actions</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="grid gap-4 md:hidden">
        {orders.length > 0 ? (
          orders.map(({ id, productTitle, buyerName, status }) => (
            <div key={id} className="border rounded-lg p-4 shadow-sm bg-white">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="font-bold text-lg">{productTitle}</h2>
                  <p className="text-gray-600 text-sm">Buyer: {buyerName}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : status === 'confirmed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {status}
                </span>
              </div>
              {status === 'pending' && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleConfirm(id)}
                    className="flex-1 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleReject(id)}
                    className="flex-1 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    Reject
                  </button>
                </div>
              )}
              {status !== 'pending' && (
                <p className="text-gray-500 text-sm mt-2">No actions</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No orders found.</p>
        )}
      </div>
    </main>
  );
}
