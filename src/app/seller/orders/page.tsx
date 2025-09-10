'use client';

import { useState } from 'react';
import Image from 'next/image';

interface SellerOrder {
  id: string;
  status: string;
  payment_slip_url: string | null;
  created_at: string;
  buyer_id: string;
  product_id: string;
  product: {
    name: string;
    price: number;
    images?: { image_url: string; is_primary: boolean }[];
  } | null;
  address: {
    address_line1: string;
    address_line2?: string | null;
    city: string;
    zip_code: string;
    contact_number: string;
  } | null;
  buyer: {
    email: string;
  } | null;
}

export default function SellerOrdersPage() {
  // 🔹 Mock Data (replace with API later)
  const [orders, setOrders] = useState<SellerOrder[]>([
    {
      id: 'order-1',
      status: 'pending_payment_verification',
      payment_slip_url: '/mock/slip1.jpg',
      created_at: new Date().toISOString(),
      buyer_id: 'buyer-123',
      product_id: 'product-1',
      product: {
        name: 'Used Laptop',
        price: 8500,
        images: [{ image_url: '/products/laptop.jpg', is_primary: true }],
      },
      address: {
        address_line1: '123 MFU Street',
        city: 'Chiang Rai',
        zip_code: '57100',
        contact_number: '0812345678',
      },
      buyer: { email: 'buyer1@mfu.ac.th' },
    },
    {
      id: 'order-2',
      status: 'payment_confirmed',
      payment_slip_url: '/mock/slip2.jpg',
      created_at: new Date().toISOString(),
      buyer_id: 'buyer-456',
      product_id: 'product-2',
      product: {
        name: 'Secondhand Phone',
        price: 3500,
        images: [{ image_url: '/products/phone.jpg', is_primary: true }],
      },
      address: {
        address_line1: '456 Dorm Road',
        city: 'Chiang Rai',
        zip_code: '57110',
        contact_number: '0898765432',
      },
      buyer: { email: 'buyer2@mfu.ac.th' },
    },
  ]);

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    alert(`Order ${orderId} updated to ${newStatus}`);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending_payment_verification':
        return 'bg-yellow-100 text-yellow-800';
      case 'payment_confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!orders.length) return <p>No orders yet.</p>;

  const pendingOrders = orders.filter(
    (order) => order.status === 'pending_payment_verification'
  );
  const otherOrders = orders.filter(
    (order) => order.status !== 'pending_payment_verification'
  );
  const sortedOrders = [...pendingOrders, ...otherOrders];

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {pendingOrders.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            ⚠️ {pendingOrders.length}{' '}
            {pendingOrders.length > 1 ? 'Orders' : 'Order'} Pending Payment
            Verification
          </h2>
          <p className="text-yellow-700 text-sm">
            These orders require your attention to verify the payment slips.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {sortedOrders.map((order) => (
          <div
            key={order.id}
            className={`border rounded-lg p-4 shadow-sm ${
              order.status === 'pending_payment_verification'
                ? 'border-yellow-300 bg-yellow-50'
                : 'border-gray-200'
            }`}
          >
            {/* Product Info */}
            {order.product && (
              <div className="flex items-center gap-4">
                {order.product.images?.[0] && (
                  <Image
                    src={
                      order.product.images.find((img) => img.is_primary)
                        ?.image_url || order.product.images[0].image_url
                    }
                    alt={order.product.name}
                    width={80}
                    height={80}
                    className="rounded object-cover"
                  />
                )}
                <div>
                  <h2 className="font-semibold">{order.product.name}</h2>
                  <p className="text-gray-600">฿{order.product.price}</p>
                </div>
              </div>
            )}

            {/* Buyer Info */}
            {order.buyer && (
              <div className="mt-4">
                <p>
                  <strong>Buyer:</strong> {order.buyer.email}
                </p>
              </div>
            )}

            {/* Address */}
            {order.address && (
              <div className="mt-2 text-sm text-gray-700">
                <p>
                  <strong>Shipping Address:</strong>
                </p>
                <p>{order.address.address_line1}</p>
                {order.address.address_line2 && (
                  <p>{order.address.address_line2}</p>
                )}
                <p>
                  {order.address.city}, {order.address.zip_code}
                </p>
                <p>Contact: {order.address.contact_number}</p>
              </div>
            )}

            {/* Payment Slip */}
            {order.payment_slip_url && (
              <div className="mt-3">
                <p className="font-semibold">Payment Slip:</p>
                <a
                  href={order.payment_slip_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  View Payment Slip
                </a>
              </div>
            )}

            {/* Status and Actions */}
            <div className="mt-3 flex items-center justify-between">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                  order.status
                )}`}
              >
                {order.status.replace('_', ' ').toUpperCase()}
              </span>

              {order.status === 'pending_payment_verification' && (
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      updateOrderStatus(order.id, 'payment_confirmed')
                    }
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Confirm Payment
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              )}

              {order.status === 'payment_confirmed' && (
                <select
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Update Status
                  </option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              )}
            </div>

            {/* Order Date */}
            <p className="mt-2 text-xs text-gray-500">
              Ordered:{' '}
              {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
