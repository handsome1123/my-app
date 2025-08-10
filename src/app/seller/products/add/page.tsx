// src/app/seller/products/add/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AddProduct() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  // For image upload, you could add a file input later

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    if (!userId) {
      setError('User not authenticated');
      return;
    }

    const { data, error } = await supabase.from('products').insert([
      {
        title,
        price,
        description,
        seller_id: userId,
        status: 'active',
      },
    ]);

    if (error) {
      setError(error.message);
    } else {
      alert(`Adding product: ${title} - ${price} THB`);
      router.push('/seller/products');
    }
  };

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add New Product</h1>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Price (THB)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
            min={1}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Add Product
        </button>
      </form>
    </main>
  );
}
