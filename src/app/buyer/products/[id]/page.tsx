"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star, MessageCircle, Share2, UserPlus, UserCheck, Zap } from "lucide-react";

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
  inWishlist?: boolean;
  isFollowingSeller?: boolean;
}

interface ReviewStats {
  total: number;
  average: number;
  distribution: number[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [updatingWishlist, setUpdatingWishlist] = useState(false);
  const [followingSeller, setFollowingSeller] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const fetchProduct = useCallback(async () => {
    console.log('fetchProduct called');
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/buyer/products/${productId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (res.ok) {
        setProduct(data.product);
      } else {
        setError(data.error || "Failed to fetch product");
      }
    } catch (err) {
      console.error("Failed to fetch product:", err);
      setError("Failed to fetch product");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const fetchReviewStats = useCallback(async () => {
    console.log('fetchReviewStats called');
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/buyer/reviews?productId=${productId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (res.ok) {
        setReviewStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch review stats:", err);
    }
  }, [productId]);

  useEffect(() => {
    console.log('useEffect running for product detail, productId:', productId);
    if (productId) {
      fetchProduct();
      fetchReviewStats();
    }
  }, [productId, fetchProduct, fetchReviewStats]);

  const addToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to add items to cart.");
      router.push("/login");
      return;
    }

    setAddingToCart(true);
    try {
      const res = await fetch("/api/buyer/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Added to cart");
      } else {
        alert(data.error || "Failed to add to cart");
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Error adding to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to manage wishlist.");
      router.push("/login");
      return;
    }

    setUpdatingWishlist(true);
    try {
      const res = await fetch("/api/buyer/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();
      if (res.ok) {
        setProduct(prev => prev ? { ...prev, inWishlist: data.action === 'added' } : null);
        alert(data.action === 'added' ? "Added to wishlist" : "Removed from wishlist");
      } else {
        alert(data.error || "Failed to update wishlist");
      }
    } catch (err) {
      console.error("Wishlist error:", err);
      alert("Error updating wishlist");
    } finally {
      setUpdatingWishlist(false);
    }
  };

  const toggleFollowSeller = async () => {
    if (!product?.sellerId?._id) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to follow sellers.");
      router.push("/login");
      return;
    }

    setFollowingSeller(true);
    try {
      const res = await fetch("/api/buyer/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          sellerId: product.sellerId._id,
          action: product.isFollowingSeller ? "unfollow" : "follow"
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setProduct(prev => prev ? { ...prev, isFollowingSeller: !prev.isFollowingSeller } : null);
        alert(data.message);
      } else {
        alert(data.error || "Failed to update follow status");
      }
    } catch (err) {
      console.error("Follow seller error:", err);
      alert("Error updating follow status");
    } finally {
      setFollowingSeller(false);
    }
  };

  const handleShare = async (platform: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to share products.");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/buyer/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId, platform }),
      });

      const data = await res.json();
      if (res.ok) {
        if (platform === "copy") {
          navigator.clipboard.writeText(data.text);
          alert("Link copied to clipboard!");
        } else {
          window.open(data.shareUrl, "_blank");
        }
        setShowShareModal(false);
      } else {
        alert(data.error || "Failed to share product");
      }
    } catch (err) {
      console.error("Share error:", err);
      alert("Error sharing product");
    }
  };

  const buyNow = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to purchase products.");
      router.push("/login");
      return;
    }

    if (product && product.stock === 0) {
      alert("This product is out of stock.");
      return;
    }

    // Add to cart first, then redirect to checkout
    try {
      const res = await fetch("/api/buyer/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      const data = await res.json();
      if (res.ok) {
        // Redirect to checkout
        router.push("/buyer/checkout");
      } else {
        alert(data.error || "Failed to add to cart");
      }
    } catch (err) {
      console.error("Buy now error:", err);
      alert("Error adding to cart");
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-xl shadow-lg">
          <p className="text-red-500 text-lg mb-4">{error || "Product not found"}</p>
          <Link
            href="/buyer/dashboard"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="aspect-square relative rounded-xl overflow-hidden bg-gray-100">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  {reviewStats && reviewStats.total > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {renderStars(Math.round(reviewStats.average))}
                      </div>
                      <span className="text-gray-600">
                        {reviewStats.average.toFixed(1)} ({reviewStats.total} reviews)
                      </span>
                    </div>
                  )}
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.stock > 10 ? 'bg-green-100 text-green-700' :
                    product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </div>
                </div>

                <div className="text-3xl font-bold text-blue-600 mb-4">
                  ฿{product.price.toLocaleString()}
                </div>

                {product.description && (
                  <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>
                )}

                {product.sellerId && (
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-sm text-gray-600">
                      Sold by: <span className="font-medium">{product.sellerId.name}</span>
                    </div>
                    <button
                      onClick={toggleFollowSeller}
                      disabled={followingSeller}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                        product.isFollowingSeller
                          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:opacity-60`}
                    >
                      {product.isFollowingSeller ? (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Follow
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={addToCart}
                  disabled={addingToCart || product.stock === 0}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {addingToCart ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>

                <button
                  onClick={buyNow}
                  disabled={product.stock === 0}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-60"
                >
                  <Zap className="w-5 h-5" />
                  {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={toggleWishlist}
                  disabled={updatingWishlist}
                  className={`flex-1 p-3 rounded-lg transition-colors ${
                    product.inWishlist
                      ? 'text-red-600 hover:text-red-700 bg-red-50'
                      : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                  aria-label={product.inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Heart className={`w-5 h-5 ${product.inWishlist ? 'fill-current' : ''}`} />
                    <span className="text-sm">{product.inWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
                  </div>
                </button>

                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex-1 p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  aria-label="Share product"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm">Share</span>
                  </div>
                </button>
              </div>

              {/* Reviews and Write Review */}
              <div className="flex gap-4">
                {reviewStats && reviewStats.total > 0 && (
                  <Link
                    href={`/buyer/products/${productId}/reviews`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    View all {reviewStats.total} reviews
                  </Link>
                )}
                <Link
                  href={`/buyer/products/${productId}/write-review`}
                  className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
                >
                  <Star className="w-5 h-5" />
                  Write a Review
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Share this product</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Facebook", icon: "📘", platform: "facebook" },
                  { name: "Twitter", icon: "🐦", platform: "twitter" },
                  { name: "WhatsApp", icon: "💬", platform: "whatsapp" },
                  { name: "Telegram", icon: "📱", platform: "telegram" },
                  { name: "LINE", icon: "💚", platform: "line" },
                  { name: "Copy Link", icon: "🔗", platform: "copy" },
                ].map((option) => (
                  <button
                    key={option.platform}
                    onClick={() => handleShare(option.platform)}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-xl">{option.icon}</span>
                    <span className="text-sm font-medium text-gray-900">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}