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
  ArrowLeft,
  AlertTriangle
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
  stock?: number; // Changed from stockCount to match your data structure
  stockCount?: number; // Keep both for compatibility
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
        if (res.ok) {
          setProduct(data);
          // Reset quantity to 1 when product loads
          setQuantity(1);
        } else {
          setError(data.error || "Failed to fetch product");
        }
      } catch {
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
    
  }, [id]);

  // Get actual stock count from product data
  const getStockCount = () => {
    if (!product) return 0;
    return product.stock || product.stockCount || 0;
  };

  const handleQuantityChange = (change: number) => {
    if (!product) return;
    
    const currentStock = getStockCount();
    const newQuantity = quantity + change;
    
    // Ensure quantity is between 1 and available stock
    if (newQuantity >= 1 && newQuantity <= currentStock) {
      setQuantity(newQuantity);
    }
  };

  const handleQuantityInput = (value: string) => {
    if (!product) return;
    
    const numValue = parseInt(value);
    const currentStock = getStockCount();
    
    if (isNaN(numValue) || numValue < 1) {
      setQuantity(1);
    } else if (numValue > currentStock) {
      setQuantity(currentStock);
    } else {
      setQuantity(numValue);
    }
  };

  const handleBuyNow = () => {
    if (product && quantity > 0 && quantity <= getStockCount()) {
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

  // Get current stock and determine availability
  const currentStock = getStockCount();
  const rating = product.rating || 4.5;
  const reviewCount = product.reviewCount || 0;
  const inStock = currentStock > 0;

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
      <div className="flex-grow container mx-auto px-2 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg group max-w-md mx-auto">
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
                    <span className="text-sm font-medium">In Stock ({currentStock} available)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertTriangle size={16} />
                    <span className="text-sm font-medium">Out of Stock</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900">฿{product.price.toLocaleString()}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">฿{product.originalPrice.toLocaleString()}</span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                      Save ฿{(product.originalPrice - product.price).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600">Free shipping on orders over ฿100</p>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Stock Warning */}
            {inStock && currentStock <= 5 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-orange-600" />
                  <span className="text-orange-800 font-medium text-sm">
                    Only {currentStock} items left in stock!
                  </span>
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {inStock && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Quantity</h3>
                  <span className="text-sm text-gray-600">Max: {currentStock}</span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Minus Button */}
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-3 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus size={16} />
                  </button>

                  {/* Quantity Input */}
                  <input
                    type="number"
                    min="1"
                    max={currentStock}
                    value={quantity}
                    onChange={(e) => handleQuantityInput(e.target.value)}
                    className="w-20 px-3 py-2 text-center border border-gray-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                  {/* Plus Button */}
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= currentStock}
                    className="p-3 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                {/* Quantity Helper Text */}
                <p className="text-xs text-gray-500">
                  {quantity === currentStock ? (
                    "You've selected the maximum available quantity"
                  ) : (
                    `You can add ${currentStock - quantity} more to your cart`
                  )}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleBuyNow}
                disabled={!inStock || quantity > currentStock}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                {!inStock ? 'Out of Stock' : 'Buy Now'}
              </button>
              
              {!inStock && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-gray-600 text-sm">This product is currently out of stock.</p>
                  <p className="text-gray-500 text-xs mt-1">Check back later or contact us for availability updates.</p>
                </div>
              )}
            </div>

            {/* Features/Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white shadow-sm">
                <div className="p-2 bg-green-100 rounded-full">
                  <Truck size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Free Delivery</p>
                  <p className="text-xs text-gray-600">Orders over ฿100</p>
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