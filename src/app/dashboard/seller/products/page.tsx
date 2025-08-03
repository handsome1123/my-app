'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/ImageUpload';
import Image from 'next/image';
import { useCallback } from 'react';

type Product = {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
};

export default function SellerProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [imageUrl, setImageUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  const sellerId = session?.user?.id;
  const sellerProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    else if (session?.user.role !== 'seller') router.push('/');
  }, [session, status, router]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    if (!sellerId) return;
    
    try {
      const res = await fetch(`/api/products?owner=${sellerId}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }, [sellerId]);

  useEffect(() => {
    // Fetch products 
    fetchProducts();
  }, [fetchProducts]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price) return alert('Please fill in all fields');

    setLoading(true);

    const method = editingId ? 'PUT' : 'POST';
    const body = editingId
      ? { id: editingId, name, price: Number(price), imageUrl }
      : { name, price: Number(price), imageUrl };

    const res = await fetch('/api/products', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setName('');
      setPrice('');
      setImageUrl('');
      setEditingId(null);
      fetchProducts();
    } else {
      const data = await res.json();
      alert(data.error || 'Error saving product');
    }

    setLoading(false);
  }

  function handleEdit(product: Product) {
    setName(product.name);
    setPrice(product.price);
    // ✅ Fixed: Handle undefined imageUrl
    setImageUrl(product.imageUrl || '');
    setEditingId(product._id);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return;

    const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchProducts(); // Refresh products
    } else {
      const data = await res.json();
      alert(data.error || 'Error deleting product');
    } 
  }

  if (status === 'loading') return <p className="text-center mt-10">Loading...</p>;
  if (!session || session.user.role !== 'seller') return null;

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">🛒 Manage Your Products</h1>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search your products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Product Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm space-y-4 mb-10">
        <h2 className="text-xl font-semibold mb-2">{editingId ? '✏️ Edit Product' : '➕ Add New Product'}</h2>

        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Product Name"
            className="flex-grow p-3 border border-gray-300 rounded-md"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Price"
            className="w-40 p-3 border border-gray-300 rounded-md"
            value={price}
            onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>

        <ImageUpload onUploadComplete={(url) => setImageUrl(url)} />

        {imageUrl && (
          <Image
            src={imageUrl}
            alt="Product"
            width={100}
            height={100}
            className="rounded-md object-cover mt-2"
          />
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {editingId ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </form>

      {/* Product List */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">📦 Your Products</h2>

        {sellerProducts.length === 0 ? (
          <p className="text-gray-500 text-center">No products found.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellerProducts.map((product) => (
              <li key={product._id} className="border rounded-lg p-4 shadow-sm bg-white relative">
                {product.imageUrl && (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={100}
                    height={100}
                    className="h-40 w-full object-cover rounded-md mb-3"
                  />
                )}
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-gray-600 mb-4">฿ {product.price}</p>
                <div className="flex gap-2 absolute bottom-4 right-4">
                  <button
                    onClick={() => handleEdit(product)}
                    className="px-3 py-1 text-sm bg-yellow-400 hover:bg-yellow-500 rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}