"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // filters
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");

  useEffect(() => {
    const fetchProducts = async () => {
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
  }, []);


  // delete product
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const token = localStorage.getItem("token"); // your JWT from login
    const res = await fetch(`/api/seller/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (res.ok) {
      alert("Product deleted!");
      // if you have state with products, remove it locally
      setProducts(products.filter(p => p._id !== id));
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

  if (loading) return <p>Loading products...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Products</h2>
        <Link href="/seller/products/create">
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition">
          + Add Product
        </button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Stock</option>
          <option value="in">In Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4">Image</th>
              <th className="p-4">Name</th>
              <th className="p-4">Description</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product._id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-lg text-xs text-gray-400">
                        No Img
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-semibold">{product.name}</td>
                  <td className="p-4 text-sm max-w-xs truncate">
                    {product.description}
                  </td>
                  <td className="p-4 font-medium">${product.price}</td>
                  <td className="p-4">
                    {product.stock > 0 ? (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                        {product.stock} In Stock
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                        Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="p-4 space-x-2">
                    <button
                      onClick={() => router.push(`/seller/products/edit/${product._id}`)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md transition"
                    >
                        Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-6 text-gray-500"
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
