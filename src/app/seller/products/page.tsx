'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  title: string;
  price: number;
  status: 'active' | 'sold';
}

export default function SellerProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('id, title, price, status')
        .eq('seller_id', userId);

      if (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  // Delete function
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting product: ' + error.message);
    } else {
      // Remove deleted product from state so UI updates instantly
      setProducts((prev) => prev.filter((product) => product.id !== id));
    }
  };

  if (loading) {
    return <p className="p-6">Loading products...</p>;
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Products</h1>

      <Link
        href="/seller/products/add"
        className="mb-4 inline-block px-4 py-2 bg-blue-600 text-white rounded"
      >
        + Add New Product
      </Link>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Title</th>
            <th className="border border-gray-300 p-2">Price</th>
            <th className="border border-gray-300 p-2">Status</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(({ id, title, price, status }) => (
            <tr key={id}>
              <td className="border border-gray-300 p-2">{title}</td>
              <td className="border border-gray-300 p-2">{price} THB</td>
              <td className="border border-gray-300 p-2 capitalize">{status}</td>
              <td className="border border-gray-300 p-2 space-x-2">
                <Link
                  href={`/seller/products/${id}/edit`}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
