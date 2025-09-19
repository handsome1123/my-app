"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingBag, Star, Eye, Filter, Grid3X3, List } from "lucide-react"; 
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

  // search state
  const [search, setSearch] = useState("");
  
  // UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Static Banner Images
  const bannerImages = ["/banner/1.jpg", "/banner/2.jpg", "/banner/3.jpg", "/banner/4.jpg"];

  const fetchProducts = async (q = "") => {
    try {
      setLoadingProducts(true);
      setError(null);

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const url = q
        ? `/api/buyer/products?search=${encodeURIComponent(q)}`
        : "/api/buyer/products";

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (res.ok) {
        setProducts(data.products);
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

  // initial fetch (randomized order from backend)
  useEffect(() => {
    fetchProducts();
  }, []);

  // debounce search effect
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts(search.trim());
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1">
      <div className="relative overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={400}
            height={200}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <ShoppingBag className="w-16 h-16 text-gray-400" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Eye className="w-4 h-4 text-gray-700" />
        </div>
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Only {product.stock} left
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Out of Stock
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
          {product.description || "No description available"}
        </p>
        
        <div className="flex items-center mb-3">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">(4.5)</span>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <span className="font-bold text-2xl text-blue-600">฿{product.price.toLocaleString()}</span>
            {product.stock > 0 && (
              <span className="text-sm text-green-600">✓ In stock ({product.stock})</span>
            )}
          </div>
        </div>
        
        <Link
          href={`/buyer/products/${product._id}`}
          className={`block w-full text-center py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
            product.stock > 0
              ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          {product.stock > 0 ? "View Details" : "Out of Stock"}
        </Link>
      </div>
    </div>
  );

  const ProductListItem = ({ product }: { product: Product }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
      <div className="flex">
        <div className="w-32 h-32 flex-shrink-0">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1 p-4 flex justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1 text-gray-900">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {product.description || "No description available"}
            </p>
            <div className="flex items-center">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">(4.5)</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end justify-between ml-4">
            <div className="text-right">
              <span className="font-bold text-xl text-blue-600">฿{product.price.toLocaleString()}</span>
              <div className="text-sm text-gray-500">Stock: {product.stock}</div>
            </div>
            <Link
              href={`/buyer/products/${product._id}`}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                product.stock > 0
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {product.stock > 0 ? "View" : "Out of Stock"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Enhanced Search Bar */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-full max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for amazing products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            />
            {search && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <button
                  onClick={() => setSearch("")}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          
          {/* Quick Search Suggestions */}
          <div className="flex flex-wrap gap-2 justify-center">
            {["Electronics", "Fashion", "Home", "Books", "Sports"].map((category) => (
              <button
                key={category}
                onClick={() => setSearch(category)}
                className="px-4 py-2 bg-white/70 hover:bg-white text-gray-700 rounded-full text-sm font-medium transition-all duration-200 hover:shadow-md border border-gray-200 hover:border-blue-300"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Image Slider - Banner */}
        <div className="rounded-3xl overflow-hidden shadow-2xl">
          <ImageCarousel images={bannerImages} />
        </div>

        {/* Products Section */}
        <div className="w-full max-w-7xl mx-auto">
          {/* Header with Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                {search ? (
                  <span>
                    Results for <span className="text-blue-600">&quot;{search}&quot;</span>
                  </span>
                ) : (
                  "Discover Amazing Products"
                )}
              </h2>
              <p className="text-gray-600 mt-1">
                {products.length} {products.length === 1 ? 'product' : 'products'} found
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span className="font-medium">Filters</span>
              </button>
              
              <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loadingProducts && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Finding the best products for you...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
                <p className="text-red-600 font-medium">{error}</p>
                <button
                  onClick={() => fetchProducts(search.trim())}
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loadingProducts && !error && products.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-white rounded-3xl shadow-lg p-12 max-w-md mx-auto">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">
                  {search 
                    ? `We couldn't find any products matching "${search}". Try a different search term.`
                    : "No products are available at the moment."
                  }
                </p>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    Browse All Products
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Products Grid/List */}
          {!loadingProducts && !error && products.length > 0 && (
            <div className={
              viewMode === 'grid'
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                : "space-y-4"
            }>
              {products.map((product) => (
                viewMode === 'grid' 
                  ? <ProductCard key={product._id} product={product} />
                  : <ProductListItem key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}