'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Product = {
  _id: string;
  name: string;
  imageUrl?: string;
  price: number;
  owner: { email: string };
};

export default function AdminProductsPage() {
  const { data: session, status } = useSession();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products by search term (name or owner email)
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.owner?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dummy handlers for demo, replace with real handlers
  const handleEdit = (product: Product) => {
    alert(`Edit product: ${product.name}`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts((prev) => prev.filter((p) => p._id !== id));
    }
  };

  if (status === 'loading' || loading) return <p>Loading...</p>;
  if (!session || session.user.role !== 'admin') return null;

  return (
    <main className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
        Manage Products
      </h1>

      <div className="max-w-md mx-auto mb-8">
        <input
          type="search"
          aria-label="Search products"
          placeholder="Search by product or seller email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-4 py-3 text-lg placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 outline-none transition"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500 text-xl mt-20">
          No products found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="border rounded-xl p-4 shadow-sm hover:shadow-lg transition relative flex flex-col"
            >
              {product.imageUrl && (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
              )}

              <h2 className="text-xl font-semibold text-gray-800 mb-2 truncate">
                {product.name}
              </h2>

              <p className="text-indigo-600 font-semibold text-lg mb-1">
                ฿ {product.price}
              </p>

              <p className="text-gray-500 mb-4 text-sm truncate">
                Seller: {product.owner?.email}
              </p>

              <div className="mt-auto flex justify-between gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 bg-yellow-400 text-gray-900 font-semibold py-2 rounded-md hover:bg-yellow-500 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="flex-1 bg-red-600 text-white font-semibold py-2 rounded-md hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>

              <Link
                href={`/dashboard/admin/product/${product._id}`}
                className="absolute inset-0"
                aria-label={`View details for ${product.name}`}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
