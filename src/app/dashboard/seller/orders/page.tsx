'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { mockOrders } from '@/lib/orderData';

export default function SellerOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const sellerId = session?.user?.id;
  const [orders, setOrders] = useState(() =>
    mockOrders.filter((o) => o.sellerId === sellerId)
  );

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    else if (session?.user.role !== 'seller') router.push('/');
  }, [session, status, router]);

  if (status === 'loading') return <p>Loading...</p>;
  if (!session || session.user.role !== 'seller') return null;

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-10 text-center text-gray-900">Your Orders</h1>

      <div className="mb-8">
        <input
          type="search"
          placeholder="Search orders..."
          className="w-full max-w-md mx-auto block rounded-lg border border-gray-300 px-5 py-3 text-lg placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition"
        />
      </div>

      {orders.length === 0 ? (
        <p className="text-center text-gray-500 text-xl mt-16">No orders found.</p>
      ) : (
        <ul className="space-y-8">
          {orders.map((order) => (
            <li
              key={order.id}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 hover:shadow-lg transition"
            >
              <div className="flex items-center gap-6">
                {order.imageUrl && (
                  <img
                    src={order.imageUrl}
                    alt={order.productName}
                    className="w-32 h-32 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                  />
                )}

                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">{order.productName}</h2>
                  <p className="text-gray-600 mt-1">Buyer: <span className="font-medium">{order.buyerEmail}</span></p>
                  <p className="text-gray-600 mt-1">Ordered on: <span className="font-medium">{order.orderDate}</span></p>
                </div>
              </div>

              <div className="text-right space-y-2">
                <p className="text-lg font-semibold text-gray-900">Price: ฿{order.price}</p>
                <p className="text-md font-medium text-indigo-600 capitalize">Status: {order.status}</p>

                <div className="flex justify-end gap-4 mt-3">
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg bg-green-600 text-white text-lg font-semibold hover:bg-green-700 transition"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg bg-red-600 text-white text-lg font-semibold hover:bg-red-700 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
