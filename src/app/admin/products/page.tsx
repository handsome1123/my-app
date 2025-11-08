"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, Edit2, Trash2, RefreshCcw, Package } from "lucide-react";

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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // filters
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
      }
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const res = await fetch("/api/seller/products", {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch products");
          setProducts([]);
        } else {
          setProducts(data.products || []);
        }
      } catch {
        setError("Something went wrong");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [router]);

  // delete product
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

    const token = localStorage.getItem("token"); // your JWT from login
    const res = await fetch(`/api/seller/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (res.ok) {
      // optimistic update
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } else {
      alert(data.error || "Failed to delete");
    }
  };

  // filter logic
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description?.toLowerCase().includes(search.toLowerCase());

    const matchesStock =
      stockFilter === "all"
        ? true
        : stockFilter === "in"
        ? product.stock > 0
        : product.stock === 0;

    return matchesSearch && matchesStock;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header + CTA */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and monitor your product inventory</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                title="Refresh"
                onClick={() => { setLoading(true); setTimeout(() => window.location.reload(), 200); }}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              >
                <RefreshCcw className="w-5 h-5" />
              </button>

              <Link href="/seller/products/create" className="inline-flex">
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <div className="text-xs text-gray-500">Total products</div>
              <div className="text-lg font-bold text-gray-900">{products.length}</div>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <div className="text-xs text-gray-500">In stock</div>
              <div className="text-lg font-bold text-green-600">{products.filter(p => p.stock > 0).length}</div>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <div className="text-xs text-gray-500">Out of stock</div>
              <div className="text-lg font-bold text-red-600">{products.filter(p => p.stock === 0).length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All stock</option>
              <option value="in">In stock</option>
              <option value="out">Out of stock</option>
            </select>

            <button
              onClick={() => { setSearch(''); setStockFilter('all'); }}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Table / Cards */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Loading skeleton */}
          {loading ? (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse p-4 border rounded-lg bg-gray-50">
                  <div className="h-36 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-20 bg-gray-200 rounded"></div>
                    <div className="h-8 w-12 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Stock</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {product.imageUrl ? (
                              <Image
                                src={product.imageUrl}
                                alt={product.name}
                                width={64}
                                height={64}
                                className="rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                <Package />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-xs text-gray-500">Seller: {product.sellerId?.name || '—'}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-xl truncate">{product.description || '—'}</div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">฿{product.price.toLocaleString()}</div>
                        </td>

                        <td className="px-6 py-4">
                          {product.stock > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {product.stock} in stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Out of stock
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/seller/products/edit/${product._id}`)}
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                              aria-label="Edit product"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(product._id)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                              aria-label="Delete product"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty state */}
              {filteredProducts.length === 0 && (
                <div className="p-8 text-center">
                  <div className="mx-auto inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                    <Package className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">No products found</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Try adjusting your filters or add a new product.
                  </p>
                  <div className="mt-4">
                    <Link href="/seller/products/create">
                      <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                        <Plus className="w-4 h-4 mr-2" /> Add Product
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Inline error message */}
        {error && (
          <div className="mt-6 max-w-2xl mx-auto bg-red-50 border border-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
