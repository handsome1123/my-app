"use client";

import { useParams } from "next/navigation";
import { ShoppingCart, CreditCard, X } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import LoggedInHeader from "@/components/LoggedInHeader";

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  seller: string;
  description: string;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const numericId = Number(id);
  const [product, setProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [address, setAddress] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${numericId}`);
        if (!response.ok) throw new Error("Product not found");
        const data = await response.json();
        setProduct(data.product);
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      }
    };

    fetchProduct();
  }, [numericId]);

  const handleCheckout = async () => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product?.id,
          address,
        }),
      });

      if (response.ok) {
        alert("Checkout successful!");
        setShowModal(false);
      } else {
        alert("Checkout failed.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during checkout.");
    }
  };

  if (!product) return <div className="p-6 text-center">Product not found.</div>;

  return (
    <main>
      <LoggedInHeader />
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <button
          onClick={() => history.back()}
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          &larr; Back to Products
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="relative w-full aspect-square">
            <Image
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
              <p>Category: <span className="font-medium">{product.category}</span></p>
              <p>Seller: <span className="font-medium">{product.seller}</span></p>
              <p>Pickup Location: <span className="font-medium">MFU Canteen</span></p>
              <p>Pickup Date: <span className="font-medium">{new Date().toLocaleDateString()}</span></p>
            </div>

            <div className="mt-4 flex gap-4">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white text-lg px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
              >
                <CreditCard size={20} />
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-blur bg-opacity-60 flex items-center justify-center">
          <div className="bg-amber-50 rounded-xl shadow-lg max-w-md w-full p-6 space-y-4 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
              <X />
            </button>
            <h2 className="text-2xl font-semibold text-gray-900">Checkout</h2>
            <p className="text-gray-700">Product: <strong>{product.name}</strong></p>
            <p className="text-gray-700">Price: <strong>${product.price}</strong></p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Address</label>
              <textarea
                className="w-full border rounded-lg p-2"
                placeholder="Enter your address for delivery or verification"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <button
              onClick={handleCheckout}
              className="bg-green-600 text-white w-full py-2 rounded-lg hover:bg-green-700 transition"
            >
              Confirm Purchase
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
