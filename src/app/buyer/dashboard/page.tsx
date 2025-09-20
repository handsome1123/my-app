"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BankInfo {
  bankName: string;
  accountNumber: string;
}

interface Profile {
  name: string;
  email: string;
  isVerified: boolean;
  bankInfo?: BankInfo;
}

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

export default function BuyerHome() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Fetch user profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login"); // redirect to login if not authenticated
    }

    fetch("/api/seller/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: Profile) => setProfile(data))
      .catch(() => setProfile(null));
  }, [router]);

  // Fetch product randomly + only show > 0
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
        const shuffled = data.products.sort(() => 0.5 - Math.random());
        setProducts(shuffled); // show all products
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

  const truncateText = (text: string | undefined | null, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {profile.name}! 👋</h1>
          <p className="text-yellow-100">Discover amazing products from our sellers</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Your Profile</h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              profile.isVerified 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {profile.isVerified ? '✓ Verified' : '⏳ Pending'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
            <div>
              <p className="mb-2">
                <span className="font-medium text-gray-800">Email:</span> {profile.email}
              </p>
              {profile.bankInfo && (
                <>
                  <p className="mb-1">
                    <span className="font-medium text-gray-800">Bank:</span> {profile.bankInfo.bankName}
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Account:</span> {profile.bankInfo.accountNumber}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              🛍️ Featured Products
            </h2>
            <button 
              onClick={() => fetchProducts()}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              🔄 Refresh
            </button>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😕</div>
              <p className="text-red-500 text-lg font-medium mb-4">{error}</p>
              <button 
                onClick={() => fetchProducts()}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-500 text-lg">No products available right now</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {products.map((product) => (
                <Link
                  key={product._id}
                  href={`/buyer/products/${product._id}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform group-hover:scale-105 cursor-pointer border border-gray-100">
                    {/* Product Image */}
                    <div className="relative h-48 bg-gray-100">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={400}
                          height={192}
                          className="w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                          priority
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <div className="text-4xl">📦</div>
                        </div>
                      )}
                      
                      {/* Stock indicator */}
                      <div className="absolute top-3 right-3">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.stock > 10 
                            ? 'bg-green-100 text-green-800' 
                            : product.stock > 0 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                        </div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 text-gray-800 group-hover:text-yellow-600 transition-colors duration-200">
                        {truncateText(product.name, 25)}
                      </h3>
                      
                      {product.description && (
                        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                          {truncateText(product.description, 60)}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-yellow-600">
                          ฿{product.price.toLocaleString()}
                        </span>
                        
                        {product.sellerId && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            by {truncateText(product.sellerId.name, 12)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}