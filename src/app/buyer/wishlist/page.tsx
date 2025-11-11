"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";

interface WishlistItem {
  _id: string;
  productId: {
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
  };
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);
  const router = useRouter();

  const fetchWishlist = useCallback(async () => {
    console.log('fetchWishlist called');
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/buyer/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setWishlist(data.wishlist || []);
      } else {
        setError(data.error || "Failed to fetch wishlist");
      }
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
      setError("Failed to fetch wishlist");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    console.log('useEffect running for wishlist');
    fetchWishlist();
  }, [fetchWishlist]);

  const removeFromWishlist = async (productId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setRemovingId(productId);
    try {
      const res = await fetch("/api/buyer/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId }),
      });

      if (res.ok) {
        setWishlist(prev => prev.filter(item => item.productId._id !== productId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to remove from wishlist");
      }
    } catch (err) {
      console.error("Remove from wishlist error:", err);
      alert("Error removing from wishlist");
    } finally {
      setRemovingId(null);
    }
  };

  const addToCart = async (productId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to add items to cart.");
      router.push("/login");
      return;
    }

    setAddingToCartId(productId);
    try {
      const res = await fetch("/api/buyer/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Added to cart");
        // Optionally remove from wishlist after adding to cart
        // removeFromWishlist(productId);
      } else {
        alert(data.error || "Failed to add to cart");
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Error adding to cart");
    } finally {
      setAddingToCartId(null);
    }
  };

  const truncateText = (text: string | undefined | null, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-xl shadow-lg">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="h-6 w-6 text-red-600 fill-current" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Wishlist</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {wishlist.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-md mx-auto">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-4">
                Start adding products you love to your wishlist for easy access later!
              </p>
              <Link
                href="/buyer/dashboard"
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
              >
                <Link href={`/buyer/products/${item.productId._id}`} className="relative block aspect-square">
                  {item.productId.imageUrl ? (
                    <Image
                      src={item.productId.imageUrl}
                      alt={item.productId.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-4xl">📦</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                    <div className="text-white text-sm font-medium">View Details →</div>
                  </div>
                </Link>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-gray-900">{truncateText(item.productId.name, 40)}</h3>
                    <span className="text-lg font-bold text-blue-600">฿{item.productId.price.toLocaleString()}</span>
                  </div>

                  <div className={`mb-4 px-2 py-1 rounded-full text-xs font-medium inline-block ${
                    item.productId.stock > 10 ? 'bg-green-100 text-green-700' :
                    item.productId.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {item.productId.stock > 0 ? `${item.productId.stock} in stock` : 'Out of stock'}
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => removeFromWishlist(item.productId._id)}
                      disabled={removingId === item.productId._id}
                      className="inline-flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm transition disabled:opacity-60"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                      {removingId === item.productId._id ? 'Removing...' : 'Remove'}
                    </button>

                    <button
                      onClick={() => addToCart(item.productId._id)}
                      disabled={addingToCartId === item.productId._id}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition disabled:opacity-60"
                      aria-label={`Add ${item.productId.name} to cart`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {addingToCartId === item.productId._id ? 'Adding...' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}