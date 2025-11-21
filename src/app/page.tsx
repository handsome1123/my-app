"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  Star,
  Eye,
  Filter,
  Grid3X3,
  List,
} from "lucide-react";
import ImageCarousel from "@/components/ImageCarousel";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

/* Product Type */
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
  /* Core State */
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Search */
  const [search, setSearch] = useState("");
  const searchDebounceRef = useRef<number | null>(null);

  /* Filters */
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [stockOnly, setStockOnly] = useState(false);

  /* Pagination */
  const [visibleCount, setVisibleCount] = useState(12);

  /* UI State */
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const router = useRouter();
  const { user } = useUser();

  /* Auto Redirect by Role */
  useEffect(() => {
    if (user) {
      if (user.role === "admin") router.push("/admin/dashboard");
      if (user.role === "seller") router.push("/seller/dashboard");
      if (user.role === "buyer") router.push("/buyer/dashboard");
    }
  }, [user, router]);

  /* Fetch with AbortController */
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
      if (res.ok) setProducts(Array.isArray(data.products) ? data.products : []);
      else setError(data.error || "Failed to fetch products");
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Fetch error:", err);
        setError("Error fetching products");
      }
    } finally {
      setLoadingProducts(false);
    }

    return () => controller.abort();
  }, []);

  /* Initial Load */
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* Debounced Search */
  useEffect(() => {
    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = window.setTimeout(() => {
      fetchProducts(search.trim());
    }, 400);

    return () => {
      if (searchDebounceRef.current)
        window.clearTimeout(searchDebounceRef.current);
    };
  }, [search, fetchProducts]);

  /* Client Filtering */
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

  const displayedProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  const hasMore = filteredProducts.length > visibleCount;

  /* Banner Images */
  const bannerImages = [
    "/banner/1.jpg",
    "/banner/2.jpg",
    "/banner/3.jpg",
    "/banner/4.jpg",
  ];

  /* Product Card (Redesigned) */
  const ProductCard = ({ product }: { product: Product }) => (
  <Link
    href={`/buyer/products/${product._id}`}
    className="group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
  >
    {/* Image */}
    <div className="relative w-full h-40 bg-gray-100">
      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
      )}
    </div>

    {/* Content */}
    <div className="p-3">
      <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
        {product.name}
      </h3>

      <p className="text-xs text-gray-500 line-clamp-1 mt-1">
        {product.description || "No description"}
      </p>

      <div className="flex justify-between items-center mt-3">
        <span className="text-base font-bold text-gray-900">
          ฿{product.price.toLocaleString()}
        </span>

        <span
          className={`text-xs ${
            product.stock > 0 ? "text-green-600" : "text-red-500"
          }`}
        >
          {product.stock > 0 ? "Stock" : "No stock"}
        </span>
      </div>
    </div>
  </Link>
  );

  /* List View Card */
  const ProductListItem = ({ product }: { product: Product }) => (
  <Link
    href={`/buyer/products/${product._id}`}
    className="flex gap-3 bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
  >
    {/* Image */}
    <div className="relative w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ShoppingBag className="w-8 h-8 text-gray-400" />
        </div>
      )}
    </div>

    {/* Info */}
    <div className="flex flex-col flex-1">
      <h3 className="text-sm font-semibold text-gray-900">
        {product.name}
      </h3>

      <p className="text-xs text-gray-500 line-clamp-1 mt-1">
        {product.description || "No description"}
      </p>

      <div className="flex justify-between items-center mt-auto pt-1">
        <span className="text-base font-bold text-gray-900">
          ฿{product.price.toLocaleString()}
        </span>

        <span
          className={`text-xs ${
            product.stock > 0 ? "text-green-600" : "text-red-500"
          }`}
        >
          {product.stock > 0 ? "Stock" : "No stock"}
        </span>
      </div>
    </div>
  </Link>
  );
  

  /* ============================= */
  /*            RETURN UI          */
  /* ============================= */

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F9FF] to-[#E9ECFF]">

      {/* Container */}
      <div className="container mx-auto px-4 md:px-8 py-10">

        {/* Banner */}
        <div className="rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(88,0,255,0.15)] mb-14">
          <ImageCarousel images={bannerImages} />
        </div>

        {/* Main Glass Panel */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_8px_40px_-10px_rgba(88,0,255,0.15)] rounded-3xl p-8">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">

            {/* Title */}
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800">
                {search ? (
                  <>Results for <span className="text-indigo-600">&quot;{search}&quot;</span></>
                ) : (
                  "Discover Products"
                )}
              </h2>
              <p className="text-gray-500 mt-1">
                {filteredProducts.length} items found
              </p>
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-4">

              {/* Filters */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-5 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <Filter className="w-5 h-5 text-indigo-600" />
                Filters
              </button>

              {/* Filters Panel */}
              {showFilters && (
                <div className="absolute right-8 top-[360px] w-80 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-xl p-6 space-y-6 animate-fadeIn">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Filter className="w-5 h-5 text-indigo-600" />
                    Filters
                  </h3>

                  {/* Price */}
                  <div>
                    <label className="font-medium text-gray-700">
                      Price Range
                    </label>
                    <div className="flex gap-3 mt-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) =>
                          setMinPrice(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) =>
                          setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200"
                      />
                    </div>
                  </div>

                  {/* Stock */}
                  <label className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl">
                    <input
                      type="checkbox"
                      checked={stockOnly}
                      onChange={() => setStockOnly(!stockOnly)}
                    />
                    In-stock only
                  </label>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setMinPrice("");
                        setMaxPrice("");
                        setStockOnly(false);
                      }}
                      className="flex-1 py-2 bg-gray-200 rounded-xl font-medium"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="flex-1 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}

              {/* Sort */}
              <select className="px-4 py-2 bg-white border border-gray-200 rounded-2xl font-medium text-gray-700 shadow-sm">
                <option>Latest</option>
                <option>Price: Low → High</option>
                <option>Price: High → Low</option>
              </select>

              {/* View Mode */}
              <div className="p-2 bg-white border border-gray-200 rounded-2xl shadow-sm flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 rounded-xl ${
                    viewMode === "grid"
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 rounded-xl ${
                    viewMode === "list"
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loadingProducts && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl bg-gray-200 h-64 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-20">
              <p className="text-red-600 text-lg font-semibold">{error}</p>
              <button
                onClick={() => fetchProducts(search.trim())}
                className="mt-6 px-6 py-3 bg-red-600 text-white rounded-xl"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loadingProducts &&
            !error &&
            filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <ShoppingBag className="w-14 h-14 mx-auto text-gray-400" />
                <h3 className="text-xl font-bold mt-4">No results found</h3>
                <p className="text-gray-500 mt-2">
                  Try changing your search or filters.
                </p>
              </div>
            )}

          {/* Products */}
          {!loadingProducts &&
            !error &&
            filteredProducts.length > 0 && (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
                    : "flex flex-col gap-4"
                }
              >
                {displayedProducts.map((p) =>
                  viewMode === "grid" ? (
                    <ProductCard key={p._id} product={p} />
                  ) : (
                    <ProductListItem key={p._id} product={p} />
                  )
                )}
              </div>
            )}

          {/* Load More */}
          {!loadingProducts && !error && hasMore && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setVisibleCount((v) => v + 12)}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl shadow-lg hover:shadow-xl"
              >
                Load more ({filteredProducts.length - visibleCount} left)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
