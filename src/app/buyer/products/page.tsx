'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Eye } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  seller: string;
  discount: number;
  originalPrice: number;
}

export default function ProductsPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Get user email from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem("userEmail");
      setUserEmail(email);
    }
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const result = await res.json();
        if (res.ok) {
          setProducts(result.data || []);
        } else {
          throw new Error(result.message || 'Failed to fetch');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      localStorage.removeItem('userEmail');
      router.push('/auth/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="flex flex-col items-center py-6 bg-white shadow">
        <h1 className="text-3xl font-bold mb-2">Second Hand Store</h1>
        {userEmail ? (
          <div className="flex items-center gap-4">
            <p className="text-gray-600">Welcome, {userEmail}</p>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link href="/auth/login" className="text-blue-600 underline">
            Login
          </Link>
        )}
      </div>

      {/* Carousel Placeholder */}
      <section className="w-full h-64 bg-blue-300 flex items-center justify-center text-2xl font-bold text-white mb-6">
        Image Carousel Goes Here
      </section>

      {/* Products Section */}
      <section className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-4">Explore Our Products</h2>

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link href={`/products/${product.id}`} key={product.id}>
                <div className="group relative bg-white p-4 rounded-lg shadow hover:shadow-md transition">
                  <div className="relative aspect-square mb-4">
                    {product.discount > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-sm px-2 py-1 rounded">
                        -{product.discount}%
                      </span>
                    )}

                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />

                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold mb-2">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-gray-400 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
