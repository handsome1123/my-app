"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Shield, 
  Truck, 
  RotateCcw, 
  CheckCircle,
  Minus,
  Plus,
  ArrowLeft
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  stockCount?: number;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/buyer/products/${id}`);
        const data = await res.json();
        if (res.ok) setProduct(data);
        else setError(data.error || "Failed to fetch product");
      } catch {
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id]);

  const handleQuantityChange = (change: number) => {
    const maxStock = product?.stockCount || 99;
    setQuantity(Math.max(1, Math.min(maxStock, quantity + change)));
  };

  const handleBuyNow = () => {
    if (product) {
      router.push(`/buyer/checkout?productId=${product._id}&quantity=${quantity}`);
    }
  };


  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-xl shadow-lg">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button 
            onClick={handleBack}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-xl shadow-lg">
          <p className="text-gray-600 text-lg mb-4">Product not found.</p>
          <button 
            onClick={handleBack}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Default values for optional properties
  const rating = product.rating || 4.5;
  const reviewCount = product.reviewCount || 0;
  const inStock = product.inStock !== false; // Default to true if undefined
  const stockCount = product.stockCount || 10;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Products</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg group">
              <Image
                src={product.imageUrl || "/placeholder.png"}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {!inStock && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white text-xl font-semibold">Out of Stock</span>
                </div>
              )}
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Heart 
                  size={20} 
                  className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"} 
                />
              </button>
            </div>
            
            {/* Thumbnail images */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-200 border-2 border-transparent hover:border-blue-500 cursor-pointer transition-all">
                  <Image
                    src={product.imageUrl || "/placeholder.png"}
                    alt={`Product view ${i}`}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Rating and Reviews */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className={star <= Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                  />
                ))}
                <span className="ml-2 text-sm font-medium text-gray-700">{rating}</span>
              </div>
              {reviewCount > 0 && (
                <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
              )}
            </div>

            {/* Product Title */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-2">
                {inStock ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle size={16} />
                    <span className="text-sm font-medium">In Stock ({stockCount} available)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <span className="text-sm font-medium">Out of Stock</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900">${product.price}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">${product.originalPrice}</span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                      Save ${(product.originalPrice - product.price).toFixed(2)}
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600">Free shipping on orders over $100</p>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Quantity</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 border border-gray-300 rounded-lg min-w-[60px] text-center font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= stockCount}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleBuyNow}
                disabled={!inStock}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                Buy Now
              </button>
              
              {/* <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed font-semibold py-4 px-6 rounded-xl transition-colors duration-200"
              >
                Add to Cart
              </button> */}

              {/* <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2">
                <Share2 size={18} />
                Share Product
              </button> */}
            </div>

            {/* Features/Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white shadow-sm">
                <div className="p-2 bg-green-100 rounded-full">
                  <Truck size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Free Delivery</p>
                  <p className="text-xs text-gray-600">Orders over $100</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-white shadow-sm">
                <div className="p-2 bg-blue-100 rounded-full">
                  <RotateCcw size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">30-Day Returns</p>
                  <p className="text-xs text-gray-600">Easy returns</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-white shadow-sm">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Shield size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">2 Year Warranty</p>
                  <p className="text-xs text-gray-600">Full coverage</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}