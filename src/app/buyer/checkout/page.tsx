// pages/buyer/checkout.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { CreditCard } from "lucide-react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  seller: string;
  description: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { id } = router.query;  // Get the product ID from query params
  const productId = id ? Number(id) : null;

  const [product, setProduct] = useState<Product | null>(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const response = await fetch(`/api/products/${productId}`);
          if (!response.ok) throw new Error("Product not found");
          const data = await response.json();
          setProduct(data.product);
        } catch (error) {
          console.error("Error fetching product:", error);
          setProduct(null);
        }
      };
      fetchProduct();
    }
  }, [productId]);

  const handleCheckout = async () => {
    if (!address) {
      alert("Please provide an address.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      alert("Checkout successful!");
      setLoading(false);
      router.push("/order-success"); // Navigate to confirmation page after checkout
    }, 2000);
  };

  if (!product) return <div className="p-6 text-center">Loading product details...</div>;

  return (
    <main>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <Link href="/products" className="text-blue-600 hover:underline mb-4 inline-block">
          &larr; Back to Products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="relative w-full aspect-square">
            <img
              src={product.imageUrl}
              alt={product.name}
              width={400}
              height={400}
              className="rounded-lg object-cover shadow-md"
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-700 text-lg">{product.description || "No description available."}</p>

            <div className="text-2xl font-semibold text-green-600">
              ${product.price.toLocaleString()}
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p>Category: <span className="font-medium">{product.category ?? "General"}</span></p>
              <p>Seller: <span className="font-medium">{product.seller ?? "Unknown"}</span></p>
              <p>Pickup Location: <span className="font-medium">MFU Canteen</span></p>
              <p>Pickup Date: <span className="font-medium">{new Date().toLocaleDateString()}</span></p>
            </div>

            <div className="mt-6">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="address">
                Shipping Address
              </label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm"
                placeholder="Enter your shipping address"
                rows={4}
              ></textarea>
            </div>

            <div className="mt-4 flex gap-4">
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white text-lg px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow-md disabled:bg-gray-400"
              >
                {loading ? "Processing..." : <><CreditCard size={20} /> Checkout</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}