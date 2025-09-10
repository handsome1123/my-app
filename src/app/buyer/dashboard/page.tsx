"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface BankInfo {
  bankName: string;
  accountNumber: string;
}

interface Profile {
  name: string;
  email: string;
  isVerified: boolean;
  bankInfo?: BankInfo;
}

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

export default function BuyerHome() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState<string>("");

  // Fetch user profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/seller/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: Profile) => setProfile(data))
      .catch(() => setProfile(null));
  }, []);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/seller/products", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok) setProducts(data.products || []);
      else setError(data.error || "Failed to fetch products");
    } catch {
      setError("Error fetching products");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (!profile) return <div>Loading profile...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {profile.name}</h1>

      <h1 className="text-3xl font-bold text-center mb-8 text-yellow-600">
        🛒 Products
      </h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-2">Profile Info</h2>
        <p>
          <strong>Name:</strong> {profile.name}
        </p>
        <p>
          <strong>Email:</strong> {profile.email}
        </p>
        <p>
          <strong>Verified:</strong> {profile.isVerified ? "Yes" : "No"}
        </p>
        {profile.bankInfo && (
          <>
            <p>
              <strong>Bank Name:</strong> {profile.bankInfo.bankName}
            </p>
            <p>
              <strong>Account Number:</strong> {profile.bankInfo.accountNumber}
            </p>
          </>
        )}
      </div>

    <h2 className="text-xl font-semibold mb-2">All Products</h2>
      {loadingProducts ? (
        <p>Loading products...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map((p) => (
            <div
              key={p._id}
              className="border p-4 rounded shadow hover:shadow-md"
            >
              {p.imageUrl && (
                <Image
                  src={p.imageUrl}
                  alt={p.name}
                  width={400}
                  height={160}
                  className="w-full h-40 object-cover mb-2 rounded"
                />
              )}
              <h3 className="font-bold">{p.name}</h3>
              <p>{p.description}</p>
              <p className="font-semibold mt-1">${p.price}</p>
              <p className="text-sm text-gray-500">
                Seller: {p.sellerId?.name || "Unknown"} | Stock: {p.stock}
              </p>
              <Link
                href={`/buyer/products/${p._id}`}
                className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
