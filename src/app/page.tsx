"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ImageCarousel from "@/components/ImageCarousel";

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  stock: number;
  sellerId?: {
    _id: string;
    name: string;
    email?: string;
  };
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Static Banner Images
  const bannerImages = ["/banner/1.jpg", "/banner/2.jpg", "/banner/3.jpg", "/banner/4.jpg"];

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      setError(null);

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await fetch("/api/buyer/products", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      } else {
        setError(data.error || "Failed to fetch products");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Error fetching products");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Image Slider - Banner */}
        <ImageCarousel images={bannerImages} />

        {/* All Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">All Products</h2>

          {loadingProducts ? (
            <p>Loading products...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : products.length === 0 ? (
            <p className="text-gray-600">No products available</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <div key={p._id} className="rounded-lg shadow hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col">
                  {p.imageUrl && (
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      width={400}
                      height={160}
                      className="w-full h-48 object-cover"
                      priority
                    />
                  )}
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-semibold text-lg mb-1">{p.name}</h3>
                    <p className="text-sm text-gray-600 flex-grow">{p.description || "No description"}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="font-bold text-yellow-600">${p.price}</span>
                      <span className="text-sm text-gray-500">Stock: {p.stock}</span>
                    </div>
                    <Link
                      href={`/buyer/products/${p._id}`}
                      className="mt-3 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold px-4 py-2 rounded-lg text-center"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
