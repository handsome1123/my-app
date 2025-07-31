'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { mockProducts } from '@/lib/mockData';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');

  const [product, setProduct] = useState<any>(null);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (productId) {
      const found = mockProducts.find((p) => p._id === productId);
      setProduct(found);
    }
  }, [productId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleConfirm = () => {
    if (!form.fullName || !form.phone || !form.address) {
      alert('❗ Please fill in all fields');
      return;
    }

    alert(`✅ Purchase Successful!\n\nShipping to: ${form.fullName}, ${form.phone}\n${form.address}`);
  };

  if (!product) {
    return (
      <main className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">🚫 Product Not Found</h1>
        <p className="text-gray-500">We couldn’t find the product you’re trying to purchase.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50 px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-10">🛒 Checkout</h1>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* LEFT: Product Summary */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">{product.name}</h2>

          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-72 object-cover rounded-xl shadow mb-4"
          />

          <p className="text-lg font-semibold text-green-600 mb-2">💰 ฿ {product.price}</p>
          <p className="text-sm text-gray-600 mb-6">Sold by: {product.owner?.email}</p>

          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-700 mb-2">Scan to Pay</h3>
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=mock-payment-url"
              alt="QR Code"
              className="w-40 h-40 rounded bg-gray-100"
            />
          </div>
        </div>

        {/* RIGHT: Shipping Form */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">📦 Shipping Info</h2>

          <div className="space-y-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Full Name</label>
              <input
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleInputChange}
                placeholder="Your name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleInputChange}
                placeholder="e.g. 099-999-9999"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Delivery Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleInputChange}
                rows={4}
                placeholder="e.g. 123 Main St, Chiang Mai, Thailand"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-blue-400"
              />
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="mt-6 w-full bg-blue-600 text-white text-lg font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
          >
            ✅ Confirm & Place Order
          </button>
        </div>
      </div>
    </main>
  );
}
