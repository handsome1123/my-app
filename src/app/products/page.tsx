"use client";

import Link from "next/link";
import { Heart, ChevronRight, ChevronLeft, Eye, Truck, Phone, ShieldCheck } from 'lucide-react';
import { products } from "@/data/products";
import { useRouter } from 'next/navigation';

import { useEffect, useState } from "react";

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

  const[products, setProducts] = useState<Product[]>([]);
  const[loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try{
        const res = await fetch('/api/products');
        const result = await res.json();
        setProducts(result.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }finally{
        setLoading(false);
      }
    }
    fetchProduct();
  }, []);

  if(loading) {
    return <p>Loading products...</p>
  }

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    localStorage.removeItem('userEmail');
    router.push('/auth/login');
  };

  return (
    <main>
      {/* Explore Our Porducts */}
      <div className="container mx-auto px-2 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-5 h-10 bg-gray-900 rounded-sm"></div>
            <h2 className="text-2xl font-bold">Explore Our Products</h2>
          </div>
        </div>

        <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>

        {/* Products Grid */}

        <div className="container mx-auto px-2 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((item) => (
              <Link href={`/products/${item.id}`} key={item.id}>
                <div className="group relative bg-gray-50 rounded-lg p-4 cursor-pointer hover:shadow-md transition">
                  <div className="relative aspect-square mb-4">
                    {/* Discount Badge */}
                    {item.discount && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-sm px-2 py-1 rounded">
                        -{item.discount}%
                      </span>
                    )}

                    {/* Product Image */}
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />


                    {/* Action Buttons (Heart, Eye) */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Product Name */}
                  <h3 className="font-semibold mb-2">{item.name}</h3>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">${item.price}</span>
                    {item.originalPrice && (
                      <span className="text-gray-400 line-through">${item.originalPrice}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}

