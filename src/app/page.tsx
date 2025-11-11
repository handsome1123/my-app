"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingBag, Star, Eye, Filter, Grid3X3, List } from "lucide-react"; 
import ImageCarousel from "@/components/ImageCarousel";
import { useRouter } from 'next/navigation';
import { useUser } from "@/context/UserContext";

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
   // debounce ref
   const searchDebounceRef = useRef<number | null>(null);

   // client-side filters & pagination
   const [minPrice, setMinPrice] = useState<number | "">("");
   const [maxPrice, setMaxPrice] = useState<number | "">("");
   const [stockOnly, setStockOnly] = useState(false);
   const [visibleCount, setVisibleCount] = useState(12);

   // derive filtered products on client for quick UX (memoized)
   const filteredProducts = useMemo(() => {
     const q = search.trim().toLowerCase();
     return products.filter((p) => {
       const matchesSearch =
         !q ||
         p.name.toLowerCase().includes(q) ||
         (p.description || "").toLowerCase().includes(q) ||
         p.sellerId?.name?.toLowerCase().includes(q);

       const matchesStock = stockOnly ? p.stock > 0 : true;
       const matchesMin = minPrice === "" ? true : p.price >= Number(minPrice);
       const matchesMax = maxPrice === "" ? true : p.price <= Number(maxPrice);

       return matchesSearch && matchesStock && matchesMin && matchesMax;
     });
   }, [products, search, stockOnly, minPrice, maxPrice]);

   // Memoize displayed products to prevent unnecessary re-renders
   const displayedProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount]);
   const hasMore = useMemo(() => filteredProducts.length > visibleCount, [filteredProducts.length, visibleCount]);

   // UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Static Banner Images
  const bannerImages = ["/banner/1.jpg", "/banner/2.jpg", "/banner/3.jpg", "/banner/4.jpg"];

  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'seller':
          router.push('/seller/dashboard');
          break;
        case 'buyer':
          router.push('/buyer/dashboard');
          break;
        default:
          // stay on page if role is not defined
          break;
      }
    }
  }, [user, router]);

  // useCallback fetch with AbortController
  const fetchProducts = useCallback(async (q = "") => {
    const controller = new AbortController();
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
        signal: controller.signal,
      });

      const data = await res.json();
      if (res.ok) {
        setProducts(Array.isArray(data.products) ? data.products : []);
      } else {
        setError(data.error || "Failed to fetch products");
      }
    } catch (err: unknown) {
  if (err instanceof Error) {
    if (err.name !== "AbortError") {
      console.error("Fetch error:", err);
      setError("Error fetching products");
    }
  } else {
    // fallback for non-Error throwables
    console.error("Unknown fetch error:", err);
    setError("Error fetching products");
  }
} finally {
      setLoadingProducts(false);
    }

    return () => controller.abort();
  }, []);

  // initial fetch
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounce search effect (using ref to avoid multiple timers)
  useEffect(() => {
    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = window.setTimeout(() => {
      fetchProducts(search.trim());
    }, 400);

    return () => {
      if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
    };
  }, [search, fetchProducts]);

  // These are now defined above, no need to redefine

  // Improved ProductCard: use sizes & lazy loading for non-priority images
  const ProductCard = ({ product }: { product: Product }) => (
    <Link
      href={`/buyer/products/${product._id}`}
      className="group relative block backdrop-blur-2xl bg-white/40 rounded-3xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-700 overflow-hidden border border-white/30 hover:border-purple-300/60 transform hover:-translate-y-3 hover:rotate-1 focus:outline-none focus:ring-4 focus:ring-purple-400/50 focus:-translate-y-2 focus:rotate-0.5 focus-ring"
      aria-label={`View ${product.name}`}
    >
      <div className="relative overflow-hidden rounded-t-3xl">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={1200}
            height={800}
            sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1200px"
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-1000"
            loading="lazy"
            priority={false}
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-gray-100/60 to-gray-200/60 flex items-center justify-center">
            <ShoppingBag className="w-20 h-20 text-gray-400/80" />
          </div>
        )}
        <div className="absolute top-4 right-4 backdrop-blur-2xl bg-white/40 rounded-2xl p-3 opacity-0 group-hover:opacity-100 transition-all duration-700 transform group-hover:translate-y-0 translate-y-2 hover:scale-110">
          <Eye className="w-6 h-6 text-gray-800" />
        </div>
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-4 left-4 backdrop-blur-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg animate-pulse">
            Only {product.stock} left
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white font-bold text-xl">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-8">
        <h3 className="font-bold text-2xl mb-4 text-gray-900 line-clamp-1 group-hover:text-purple-700 transition-colors duration-500 leading-tight">
          {product.name}
        </h3>
        <p className="text-base text-gray-600/90 mb-6 line-clamp-2 leading-relaxed">
          {product.description || "No description available"}
        </p>

        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="font-black text-4xl bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 bg-clip-text text-transparent mb-2">
              ฿{product.price.toLocaleString()}
            </span>
            {product.stock > 0 ? (
              <span className="text-sm text-green-600 font-medium mt-1 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                In stock ({product.stock})
              </span>
            ) : (
              <span className="text-sm text-red-500 font-medium mt-1 flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Out of stock
              </span>
            )}
          </div>
          <div className="transform group-hover:translate-x-3 transition-transform duration-700 group-hover:scale-110">
            <div className="flex items-center gap-2 text-purple-600 bg-purple-50 px-4 py-2 rounded-2xl border border-purple-200/50 hover:bg-purple-100 transition-colors duration-300">
              <span className="text-sm font-semibold">View Details</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  const ProductListItem = ({ product }: { product: Product }) => (
    <Link
      href={`/buyer/products/${product._id}`}
      className="block bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 overflow-hidden border border-white/50 hover:border-purple-300/60 cursor-pointer focus:outline-none focus:ring-4 focus:ring-purple-400/50 transform hover:-translate-y-1 hover:scale-[1.02] focus-ring"
    >
      <div className="flex">
        <div className="w-40 h-40 flex-shrink-0 p-4">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={160}
              height={160}
              className="w-full h-full object-cover rounded-xl hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-xl">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1 p-6 flex justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-xl mb-2 text-gray-900 hover:text-purple-700 transition-colors duration-300 leading-tight">
              {product.name}
            </h3>
            <p className="text-base text-gray-600 mb-3 line-clamp-2 leading-relaxed">
              {product.description || "No description available"}
            </p>
            <div className="flex items-center mb-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm text-gray-500 ml-2 font-medium">(4.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                by {product.sellerId?.name || 'Unknown Seller'}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end justify-center ml-6">
            <div className="text-right">
              <span className="font-black text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2 block">
                ฿{product.price.toLocaleString()}
              </span>
              <div className={`text-sm font-medium mt-2 flex items-center gap-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                <div className={`w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                {product.stock > 0 ? `In stock (${product.stock})` : 'Out of stock'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-white/10 to-transparent"></div>
        {/* Animated background elements */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        <div className="container mx-auto px-4 py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 sm:mb-8 [text-wrap:balance] bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent leading-tight">
              Discover the Future of Shopping
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-12 [text-wrap:balance] font-light leading-relaxed">
              Experience AI-powered recommendations and seamless shopping with cutting-edge technology
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="relative max-w-2xl mx-auto group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              <div className="relative">
                <label htmlFor="homepage-search" className="sr-only">Search products</label>
                <input
                  type="search"
                  id="homepage-search"
                  aria-label="Search products"
                  placeholder="Search for amazing products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') fetchProducts(search.trim()); }}
                  className="w-full pl-16 pr-14 py-6 text-xl rounded-3xl bg-white/15 backdrop-blur-2xl border border-white/30 focus:border-purple-300/60 focus:ring-4 focus:ring-purple-300/30 text-white placeholder-purple-200/80 transition-all duration-500 shadow-2xl hover:shadow-purple-500/20 focus-ring"
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-7 h-7 text-purple-200 group-hover:text-purple-100 transition-colors duration-300" aria-hidden="true" />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-purple-200 hover:text-white transition-all duration-300 hover:scale-110 focus-ring"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {/* Quick Filters */}
        <div className="mb-16 sm:mb-20 lg:mb-24">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {["All Categories", "Electronics", "Fashion", "Home", "Books", "Sports"].map((category) => (
              <button
                key={category}
                onClick={() => setSearch(category === "All Categories" ? "" : category)}
                className={`px-10 py-5 rounded-3xl text-sm font-semibold transition-all duration-500 backdrop-blur-2xl border transform hover:scale-105 hover:shadow-2xl ${
                  (category === "All Categories" && !search) || search === category
                    ? "bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white shadow-2xl shadow-purple-500/30 border-purple-400/50"
                    : "bg-white/20 text-white/90 hover:bg-white/30 border-white/30 hover:border-white/50 hover:shadow-xl hover:shadow-white/10"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Banner Carousel */}
        <div className="mb-12 sm:mb-16 lg:mb-20 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-shadow duration-500">
          <ImageCarousel images={bannerImages} />
        </div>

        {/* Featured Products Section */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
            {products.slice(0, 4).map((product, index) => (
              <div key={product._id} className="animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}><ProductCard product={product} /></div>
            ))}
          </div>
        </div>

        {/* Products Section */}
        <div className="backdrop-blur-2xl bg-white/30 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-white/30 p-6 sm:p-8 lg:p-10 hover:shadow-purple-500/10 transition-shadow duration-500">
          {/* Controls Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {search ? (
                  <span>Results for <span className="text-blue-600">&quot;{search}&quot;</span></span>
                ) : (
                  "All Products"
                )}
              </h2>
              <p className="text-gray-500 mt-1">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
                className={`px-6 py-3 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 text-white font-medium hover:bg-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 ${showFilters ? 'ring-4 ring-purple-400/30' : ''}`}
                aria-controls="filters-panel"
              >
                <Filter className="inline-block w-5 h-5 mr-2" /> Filters
              </button>

              {/* Filters panel */}
              {showFilters && (
                <div
                  id="filters-panel"
                  className="absolute right-8 mt-20 w-96 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 z-40 animate-in slide-in-from-top-2 duration-500"
                >
                  <div className="p-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <Filter className="w-5 h-5 text-purple-600" />
                      Filter Products
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Price Range (฿)</label>
                        <div className="flex gap-3">
                          <input
                            type="number"
                            placeholder="Min"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-400/30 focus:border-purple-400 transition-all duration-300"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-400/30 focus:border-purple-400 transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                        <input
                          id="stockOnly"
                          type="checkbox"
                          checked={stockOnly}
                          onChange={() => setStockOnly(v => !v)}
                          className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-4"
                        />
                        <label htmlFor="stockOnly" className="text-sm font-medium text-gray-700 cursor-pointer">
                          Show in-stock products only
                        </label>
                      </div>

                      <div className="flex justify-between gap-4">
                        <button
                          onClick={() => { setMinPrice(""); setMaxPrice(""); setStockOnly(false); }}
                          className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all duration-300 font-medium transform hover:scale-105"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => { setVisibleCount(12); setShowFilters(false); }}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 font-semibold transform hover:scale-105"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30">
                <span className="text-sm font-medium text-white">Sort by:</span>
                <select className="bg-transparent border-none text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-purple-400 rounded">
                  <option className="text-gray-800">Latest</option>
                  <option className="text-gray-800">Price: Low to High</option>
                  <option className="text-gray-800">Price: High to Low</option>
                </select>
              </div>

              <div className="flex bg-white/20 backdrop-blur-xl rounded-2xl p-2 border border-white/30">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 focus-ring ${
                    viewMode === 'grid'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl shadow-purple-500/30'
                      : 'text-white/80 hover:bg-white/30 hover:text-white'
                  }`}
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 focus-ring ${
                    viewMode === 'list'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl shadow-purple-500/30'
                      : 'text-white/80 hover:bg-white/30 hover:text-white'
                  }`}
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loadingProducts && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 sm:gap-8 lg:gap-10">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white/50 backdrop-blur-xl rounded-3xl p-6 border border-white/30">
                  <div className="h-64 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl mb-6 animate-pulse" />
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-4/5 mb-4 animate-pulse" />
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-2/3 mb-6 animate-pulse" />
                  <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-1/2 animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-20">
              <div className="bg-red-50/90 backdrop-blur-xl border border-red-200/50 rounded-3xl p-12 max-w-lg mx-auto shadow-2xl">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-red-700 font-semibold text-lg mb-6">{error}</p>
                <button
                  onClick={() => fetchProducts(search.trim())}
                  className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 font-semibold transform hover:scale-105"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Empty State: reflect filtered results */}
          {!loadingProducts && !error && filteredProducts.length === 0 && (
            <div className="text-center py-24">
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-16 max-w-lg mx-auto border border-white/50">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
                  <ShoppingBag className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">No products found</h3>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  {search
                    ? `We couldn't find any products matching "${search}". Try a different search term.`
                    : "No products are available at the moment."}
                </p>
                {search && (
                  <button
                    onClick={() => { setSearch(""); setMinPrice(""); setMaxPrice(""); setStockOnly(false); }}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 font-semibold transform hover:scale-105"
                    aria-label="Clear search and filters"
                  >
                    Clear Search & Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Products Grid/List with updated gap */}
          {!loadingProducts && !error && filteredProducts.length > 0 && (
            <div
              className={viewMode === 'grid'
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 sm:gap-8 lg:gap-10 animate-in fade-in-0 duration-700"
                : "space-y-6 sm:space-y-8 animate-in fade-in-0 duration-700"
              }
            >
              {displayedProducts.map((product, index) =>
                viewMode === 'grid'
                  ? <div key={product._id} className="animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}><ProductCard product={product} /></div>
                  : <div key={product._id} className="animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}><ProductListItem product={product} /></div>
              )}
            </div>
          )}

          {/* Load more (accessible) */}
          {!loadingProducts && !error && hasMore && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => setVisibleCount((v) => v + 12)}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white rounded-2xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 font-semibold transform hover:scale-105 hover:-translate-y-1"
                aria-label="Load more products"
              >
                Load more products ({Math.min(12, filteredProducts.length - visibleCount)} more)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}