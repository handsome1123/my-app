// src/app/seller/orders/page.tsx
'use client';

import React from 'react';

interface Order {
  id: string;
  productTitle: string;
  buyerName: string;
  status: 'pending' | 'confirmed' | 'rejected';
}

export default function SellerOrders() {
  // TODO: fetch seller orders from API/DB
  const orders: Order[] = [
    { id: '1', productTitle: 'Laptop', buyerName: 'Somchai', status: 'pending' },
    { id: '2', productTitle: 'Table', buyerName: 'Nida', status: 'confirmed' },
  ];

  const handleConfirm = (id: string) => {
    alert(`Confirm order ${id}`);
    // TODO: update order status to confirmed via API
  };

  const handleReject = (id: string) => {
    alert(`Reject order ${id}`);
    // TODO: update order status to rejected via API
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Product</th>
            <th className="border border-gray-300 p-2">Buyer</th>
            <th className="border border-gray-300 p-2">Status</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(({ id, productTitle, buyerName, status }) => (
            <tr key={id}>
              <td className="border border-gray-300 p-2">{productTitle}</td>
              <td className="border border-gray-300 p-2">{buyerName}</td>
              <td className="border border-gray-300 p-2 capitalize">{status}</td>
              <td className="border border-gray-300 p-2 space-x-2">
                {status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleConfirm(id)}
                      className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleReject(id)}
                      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}
                {status !== 'pending' && <span>No actions</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
