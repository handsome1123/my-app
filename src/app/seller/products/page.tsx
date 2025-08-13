'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface ProductImage {
  id?: string;
  image_url: string;
  is_primary: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  status: 'active' | 'sold' | 'inactive';
  categoryName?: string;
  images: ProductImage[];
}

// Supabase response type - fixed to match actual response structure
interface SupabaseProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  status: 'active' | 'sold' | 'inactive';
  category?: { name: string }[] | null; // Changed to array since Supabase returns array
  images?: { image_url: string; is_primary: boolean }[];
}

export default function SellerProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) {
      setProducts([]);
      setFilteredProducts([]);
      setLoading(false);
      return;
    }

    // Fixed: Removed type parameter from .from()
    const { data: productsData, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        description,
        status,
        category:categories!inner(name),
        images:product_images(image_url,is_primary)
      `)
      .eq('seller_id', userId);

    if (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setFilteredProducts([]);
    } else {
      // Type assertion for the response
      const typedProductsData = productsData as SupabaseProduct[];
      
      const transformed: Product[] = (typedProductsData || []).map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        description: p.description,
        status: p.status,
        categoryName: p.category?.[0]?.name || 'N/A', // Fixed: Access first element of array
        images: (p.images || []).map((img) => ({
          image_url: img.image_url.startsWith('http')
            ? img.image_url
            : supabase.storage.from('product-images').getPublicUrl(img.image_url).data.publicUrl,
          is_primary: img.is_primary,
        })),
      }));
      setProducts(transformed);
      setFilteredProducts(transformed);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert('Error deleting product: ' + error.message);
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setFilteredProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setFilteredProducts(
      products.filter((p) => p.name.toLowerCase().includes(value.toLowerCase()))
    );
  };

  if (loading) return <p className="p-6">Loading products...</p>;

  return (
    <main className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">My Products</h1>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={handleSearch}
            className="border border-gray-300 p-2 rounded w-full md:w-64"
          />
          <Link
            href="/seller/products/add"
            className="mt-2 md:mt-0 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            + Add New Product
          </Link>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3">Image</th>
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Description</th>
              <th className="p-3">Category</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const primaryImage = product.images.find((img) => img.is_primary)?.image_url;
                return (
                  <tr key={product.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      {primaryImage ? (
                        <div className="w-14 h-14 relative rounded overflow-hidden bg-gray-100">
                          <Image 
                            src={primaryImage} 
                            alt={product.name} 
                            fill 
                            className="object-cover"
                            unoptimized={true}
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 bg-gray-100 flex items-center justify-center text-gray-400 rounded">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-medium">{product.name}</td>
                    <td className="p-3">{product.price.toLocaleString()} THB</td>
                    <td className="p-3 text-gray-600">{product.description}</td>
                    <td className="p-3">{product.categoryName}</td>
                    <td className="p-3 capitalize">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          product.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="p-3 space-x-3">
                      <Link
                        href={`/seller/products/${product.id}/edit`}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="grid gap-4 md:hidden">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
            const primaryImage = product.images.find((img) => img.is_primary)?.image_url;
            return (
              <div key={product.id} className="border rounded-lg p-4 shadow-sm bg-white">
                <div className="flex gap-4">
                  {primaryImage ? (
                    <Image 
                      src={primaryImage} 
                      alt={product.name} 
                      width={80} 
                      height={80} 
                      className="rounded object-cover"
                      unoptimized={true}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 flex items-center justify-center text-gray-400 rounded">
                      No Image
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="font-bold text-lg">{product.name}</h2>
                    <p className="text-blue-600 font-medium">{product.price.toLocaleString()} THB</p>
                    <p className="text-sm text-gray-600">{product.description?.slice(0, 60)}</p>
                    <p className="text-xs text-gray-500 mt-1">Category: {product.categoryName}</p>
                    <span
                      className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                        product.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex gap-3">
                  <Link
                    href={`/seller/products/${product.id}/edit`}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500">No products found.</p>
        )}
      </div>
    </main>
  );
}