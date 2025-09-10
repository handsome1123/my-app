// app/buyer/checkout/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

// Loading component
function CheckoutLoading() {
  return (
    <div className="min-h-screen p-6 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading checkout...</p>
      </div>
    </div>
  );
}

// Main checkout component that uses useSearchParams
function CheckoutContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!productId) return;
      try {
        const res = await fetch(`/api/buyer/products/${productId}`);
        const data = await res.json();
        if (res.ok) setProduct(data);
        else setError(data.error || "Failed to fetch product");
      } catch {
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  async function handleConfirmPurchase() {
    if (!productId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/buyer/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrderSuccess(true);
      } else {
        setError(data.error || "Failed to create order");
      }
    } catch {
      setError("Something went wrong during checkout.");
    }
  }

  if (loading) return <p className="text-center p-6">Loading...</p>;
  if (error) return <p className="text-center text-red-500 p-6">{error}</p>;
  if (!product) return <p className="text-center p-6">Product not found.</p>;

  return (
    <div className="min-h-screen p-6 flex flex-col md:flex-row gap-8 bg-gray-50">
      <div className="relative w-full md:w-1/2 h-96 md:h-[500px] rounded-lg overflow-hidden">
        <Image
          src={product.imageUrl || "/placeholder.png"}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="md:w-1/2 flex flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <span className="text-2xl font-bold text-green-600">${product.price}</span>
        </div>

        <div className="mt-6">
          {orderSuccess ? (
            <p className="text-green-600 font-bold text-lg">Order placed successfully!</p>
          ) : (
            <button
              onClick={handleConfirmPurchase}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg"
            >
              Confirm Purchase
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense wrapper
export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  );
}