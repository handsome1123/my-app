// /dashboard/buyer/checkout/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Component that uses useSearchParams
function CheckoutForm() {
  const searchParams = useSearchParams();
  
  const productId = searchParams.get('productId');
  const quantity = searchParams.get('quantity');
  const price = searchParams.get('price');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        
        {productId && (
          <div className="space-y-2 mb-6">
            <p>Product ID: {productId}</p>
            <p>Quantity: {quantity || 1}</p>
            <p>Price: ${price || 'N/A'}</p>
          </div>
        )}
        
        <form>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Shipping Address
              </label>
              <textarea 
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Payment Method
              </label>
              <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                <option>Credit Card</option>
                <option>PayPal</option>
                <option>Bank Transfer</option>
              </select>
            </div>
            
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Place Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Loading fallback
function CheckoutLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2">Loading checkout...</span>
    </div>
  );
}

// Main page component
export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutForm />
    </Suspense>
  );
}