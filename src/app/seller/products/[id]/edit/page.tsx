'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function EditProduct() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch product & categories on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Check auth
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      if (!userId) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      // Fetch categories for selector
      const { data: cats, error: catError } = await supabase
        .from('categories')
        .select('id, name');
      if (catError) {
        setError('Failed to load categories');
        setLoading(false);
        return;
      }
      setCategories(cats || []);

      // Fetch product data
      const { data, error: prodError } = await supabase
          .from('products')
          .select('id, name, price, description, seller_id, category_id')
          .eq('id', productId)
          .single();

      if (prodError) {
        setError(prodError.message);
      } else if (data.seller_id !== userId) {
        setError('You do not have permission to edit this product');
      } else {
        setName(data.name);
        setPrice(data.price);
        setDescription(data.description || '');
        setCategoryId(data.category_id);
      }

      setLoading(false);
    };

    fetchData();
  }, [productId]);

  // Handle update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter a product name');
      return;
    }
    if (!price || price <= 0) {
      setError('Please enter a valid price');
      return;
    }
    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;
    if (!userId) {
      setError('Not authenticated');
      return;
    }

    const { error: updateError } = await supabase
      .from('products')
      .update({
        name,
        price,
        description,
        category_id: categoryId,
      })
      .eq('id', productId)
      .eq('seller_id', userId); // ensure user can only update their product

    if (updateError) {
      setError(updateError.message);
    } else {
      router.push('/seller/products');
    }
  };

  if (loading) {
    return <p className="p-6">Loading product data...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Category</label>
          <select
            value={categoryId || ''}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
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

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Update Product
        </button>
      </form>
    </main>
  );
}
