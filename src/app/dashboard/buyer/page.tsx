'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogoutButton } from '@/components/LogoutButton';
import Link from 'next/link';
import { mockProducts } from '@/lib/mockData';
import { motion } from 'framer-motion';

type Product = {
  _id: string;
  name: string;
  imageUrl: string;
  price: number;
  owner: { email: string };
};

export default function BuyerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') router.push('/login');
    else if (session?.user.role !== 'buyer') {
      alert('Access denied');
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    // For real fetch:
    // const fetchProducts = async () => {
    //   const res = await fetch('/api/products');
    //   const data = await res.json();
    //   setProducts(data);
    // };
    // fetchProducts();

    setProducts(mockProducts);
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading') {
    return (
      <main className="h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg animate-pulse">Loading Buyer Dashboard...</p>
      </main>
    );
  }

  if (!session || session.user.role !== 'buyer') return null;

  return (
    <main className="min-h-screen p-6 md:p-10 bg-gradient-to-tr from-white to-sky-50">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Buyer Dashboard</h1>
          <p className="text-gray-600">Welcome, <strong>{session.user.email}</strong> 🛍</p>
        </div>
        <LogoutButton />
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search products..."
          className="w-full md:w-1/2 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Product Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {filteredProducts.length === 0 && (
          <p className="text-center col-span-full text-gray-500">No products found.</p>
        )}

        {filteredProducts.map((product) => (
          <Link href={`/dashboard/buyer/product/${product._id}`} key={product._id}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition cursor-pointer"
            >
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={60}
                height={60}
                className="h-40 w-full object-cover rounded mb-3"
              />
              <h2 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h2>
              <p className="text-blue-600 font-medium mt-1 mb-1">฿ {product.price}</p>
              <p className="text-xs text-gray-400">Seller: {product.owner?.email}</p>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </main>
  );
}
