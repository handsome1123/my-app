'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const [address, setAddress] = useState('');
  const [product, setProduct] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch product details
    fetch(`/api/products/${params.id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data));
  }, [params.id]);

  const handleCheckout = async () => {
    const email = localStorage.getItem('userEmail');

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: params.id,
        email,
        address,
      }),
    });

    if (res.ok) {
      alert('Order placed!');
      router.push('/dashboard'); // or wherever
    } else {
      alert('Failed to place order.');
    }
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Checkout for {product.name}</h2>
      <p className="mb-4">Price: ${product.price}</p>
      <textarea
        className="w-full p-2 border mb-4"
        placeholder="Enter your address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <button
        onClick={handleCheckout}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Confirm Checkout
      </button>
    </div>
  );
}
