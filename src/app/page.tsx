"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
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
  // debounce ref
  const searchDebounceRef = useRef<number | null>(null);

  // UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // New: client-side filters & pagination
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [stockOnly, setStockOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12); // initial items shown

  // Static Banner Images
  const bannerImages = ["/banner/1.jpg", "/banner/2.jpg", "/banner/3.jpg", "/banner/4.jpg"];

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

  const displayedProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount]);
  const hasMore = filteredProducts.length > visibleCount;

  // Improved ProductCard: use sizes & lazy loading for non-priority images
  const ProductCard = ({ product }: { product: Product }) => (
    <Link 
      href={`/buyer/products/${product._id}`}
      className="group relative block backdrop-blur-xl bg-white/30 rounded-3xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 overflow-hidden border border-white/20 hover:border-blue-300/50 transform hover:-translate-y-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      aria-label={`View ${product.name}`}
    >
      <div className="relative overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={1200}
            height={800}
            sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1200px"
            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
            priority={false}
          />
        ) : (
          <div className="w-full h-56 bg-gradient-to-br from-gray-100/50 to-gray-200/50 flex items-center justify-center">
            <ShoppingBag className="w-16 h-16 text-gray-400/70" />
          </div>
        )}
        <div className="absolute top-3 right-3 backdrop-blur-xl bg-white/30 rounded-2xl p-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:translate-y-0 translate-y-2">
          <Eye className="w-5 h-5 text-gray-700" />
        </div>
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-3 left-3 backdrop-blur-xl bg-orange-500/80 text-white px-4 py-2 rounded-2xl font-medium">
            Only {product.stock} left
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="font-bold text-xl mb-3 text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600/90 mb-4 line-clamp-2 leading-relaxed">
          {product.description || "No description available"}
        </p>
        
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="font-bold text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ฿{product.price.toLocaleString()}
            </span>
            {product.stock > 0 ? (
              <span className="text-sm text-green-500/90 mt-1">✓ In stock</span>
            ) : (
              <span className="text-sm text-red-500/90 mt-1">✗ Out of stock</span>
            )}
          </div>
          <div className="transform group-hover:translate-x-2 transition-transform duration-500">
            <div className="flex items-center gap-1 text-blue-600">
              <span className="text-sm font-medium">View Details</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      className="block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      <div className="flex">
        <div className="w-32 h-32 flex-shrink-0">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={128}
              height={128}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1 p-4 flex justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1 text-gray-900 hover:text-blue-600 transition-colors">
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
          
          <div className="flex flex-col items-end justify-center ml-4">
            <div className="text-right">
              <span className="font-bold text-xl text-blue-600">฿{product.price.toLocaleString()}</span>
              <div className={`text-sm mt-1 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `✓ Stock: ${product.stock}` : '✗ Out of stock'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-white/10 to-transparent"></div>
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 [text-wrap:balance] bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Discover the Future of Shopping
            </h1>
            <p className="text-xl text-blue-100 mb-12 [text-wrap:balance]">
              Experience AI-powered recommendations and seamless shopping
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-30"></div>
              <div className="relative">
                <input
                  type="search"
                  id="homepage-search"
                  aria-label="Search products"
                  placeholder="Search for amazing products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') fetchProducts(search.trim()); }}
                  className="w-full pl-14 pr-12 py-5 text-lg rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 focus:border-blue-300/50 focus:ring-4 focus:ring-blue-300/20 text-white placeholder-blue-200/70 transition-all duration-300"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-200" />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Quick Filters */}
        <div className="mb-16">
          <div className="flex flex-wrap justify-center gap-4">
            {["All Categories", "Electronics", "Fashion", "Home", "Books", "Sports"].map((category) => (
              <button
                key={category}
                onClick={() => setSearch(category === "All Categories" ? "" : category)}
                className={`px-8 py-4 rounded-2xl text-sm font-medium transition-all duration-300 backdrop-blur-xl ${
                  (category === "All Categories" && !search) || search === category
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-600/20"
                    : "bg-white/50 text-gray-700 hover:bg-white/80 border border-white/50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Banner Carousel */}
        <div className="mb-12 rounded-2xl overflow-hidden shadow-xl">
          <ImageCarousel images={bannerImages} />
        </div>

        {/* Products Section */}
        <div className="backdrop-blur-xl bg-white/50 rounded-3xl shadow-xl border border-white/20 p-8">
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
                className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-100 transition"
                aria-controls="filters-panel"
              >
                <Filter className="inline-block w-4 h-4 mr-2" /> Filters
              </button>
              
              {/* Filters panel */}
              {showFilters && (
                <div id="filters-panel" className="absolute right-8 mt-16 w-80 bg-white rounded-lg shadow-lg p-4 border border-gray-100 z-30">
                  <div className="mb-3">
                    <label className="text-xs text-gray-600">Price range</label>
                    <div className="flex gap-2 mt-2">
                      <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))} className="w-1/2 px-3 py-2 border rounded" />
                      <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))} className="w-1/2 px-3 py-2 border rounded" />
                    </div>
                  </div>
                  <div className="mb-3 flex items-center gap-3">
                    <input id="stockOnly" type="checkbox" checked={stockOnly} onChange={() => setStockOnly(v => !v)} className="w-4 h-4" />
                    <label htmlFor="stockOnly" className="text-sm text-gray-700">Show in-stock only</label>
                  </div>
                  <div className="flex justify-between">
                    <button onClick={() => { setMinPrice(""); setMaxPrice(""); setStockOnly(false); }} className="px-3 py-2 text-sm border rounded">Reset</button>
                    <button onClick={() => { setVisibleCount(12); setShowFilters(false); }} className="px-3 py-2 bg-blue-600 text-white rounded">Apply</button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select className="bg-transparent border-none text-sm font-medium focus:outline-none">
                  <option>Latest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>

              <div className="flex bg-gray-50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loadingProducts && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl p-4">
                  <div className="h-44 bg-gray-200 rounded mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
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

          {/* Empty State: reflect filtered results */}
          {!loadingProducts && !error && filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-white rounded-3xl shadow-lg p-12 max-w-md mx-auto">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">
                  {search
                    ? `We couldn't find any products matching "${search}". Try a different search term.`
                    : "No products are available at the moment."}
                </p>
                {search && (
                  <button
                    onClick={() => { setSearch(""); setMinPrice(""); setMaxPrice(""); setStockOnly(false); }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    aria-label="Clear search and filters"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Products Grid/List with updated gap */}
          {!loadingProducts && !error && filteredProducts.length > 0 && (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8" : "space-y-6"}>
              {displayedProducts.map((product) =>
                viewMode === 'grid'
                  ? <ProductCard key={product._id} product={product} />
                  : <ProductListItem key={product._id} product={product} />
              )}
            </div>
          )}

          {/* Load more (accessible) */}
          {!loadingProducts && !error && hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setVisibleCount((v) => v + 12)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                aria-label="Load more products"
              >
                Load more ({Math.min(12, filteredProducts.length - visibleCount)} more)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}