"use client";

import { useRouter, useParams } from "next/navigation";
import { CreditCard, X } from "lucide-react"; // Removed ShoppingCart
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
  const router = useRouter();
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof id !== "string") return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.message || `Product not found (HTTP ${response.status})`);
        }
        const data = await response.json();
        setProduct(data.product);
      } catch (err) {
        // Use unknown type and type guard
        if (err instanceof Error) {
          setError(err.message);
          console.error("Error fetching product:", err);
        } else {
          setError("Failed to fetch product.");
          console.error("Unknown error fetching product:", err);
        }
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const [address, setAddress] = useState({
    house: "",
    district: "",
    province: "",
    postalCode: "",
  });

  const handleCheckout = async () => {
    if (!product) return;

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          address,
        }),
      });

      if (response.ok) {
        alert("Checkout successful!");
        setShowModal(false);
        router.push("/orders"); // Redirect to orders page
      } else {
        const errorData = await response.json();
        alert(`Checkout failed: ${errorData?.message || "Something went wrong."}`);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error during checkout:", err);
      } else {
        console.error("Unknown error during checkout:", err);
      }
      alert("An error occurred during checkout.");
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading product details...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (!product) {
    return <div className="p-6 text-center">Product not found.</div>;
  }

  return (
    <main>
      <LoggedInHeader />
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <button
          onClick={() => router.back()}
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
            <p className="text-gray-700 text-lg">
              {product.description || "No description available."}
            </p>
            <div className="text-2xl font-semibold text-green-600">
              ${product.price.toLocaleString()}
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p>
                Category: <span className="font-medium">{product.category}</span>
              </p>
              <p>
                Seller: <span className="font-medium">{product.seller}</span>
              </p>
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
          <div className="bg-amber-50 rounded-xl shadow-lg max-w-4xl w-full p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X />
            </button>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Checkout
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Order Summary */}
              <div className="space-y-6 border-r border-gray-300 pr-6">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="rounded-lg object-cover shadow-md mx-auto"
                />
                <div className="text-center space-y-1">
                  <p className="text-xl font-medium">{product.name}</p>
                  <p className="text-gray-700">Price: ฿{product.price}</p>
                  <p className="text-gray-900 font-bold text-lg">Total: ฿{product.price}</p>
                </div>
              </div>

              {/* Right: QR + Thai-style Address */}
              <div className="space-y-4">
                <Image
                  src="/images/mike_bank.png"
                  alt="Payment QR"
                  width={220}
                  height={220}
                  className="rounded-lg object-cover shadow-md mx-auto"
                />

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800">Pickup Address</h3>

                  <input
                    type="text"
                    placeholder="Contact Number"
                    className="w-full border rounded-lg p-2"
                    value={address.house}
                    onChange={(e) => setAddress({ ...address, house: e.target.value })}
                    required
                  />

                  <input
                    type="text"
                    placeholder="Dormitory / House Number"
                    className="w-full border rounded-lg p-2"
                    value={address.district}
                    onChange={(e) => setAddress({ ...address, district: e.target.value })}
                    required
                  />

                  <input
                    type="text"
                    placeholder="Province"
                    className="w-full border rounded-lg p-2"
                    value={address.province}
                    onChange={(e) => setAddress({ ...address, province: e.target.value })}
                  />

                  <input
                    type="text"
                    placeholder="Postal Code"
                    className="w-full border rounded-lg p-2"
                    value={address.postalCode}
                    onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                  />
                </div>

                <button
                  onClick={() => {
                    alert("Confirming purchase...");
                    handleCheckout();
                  }}
                  className="bg-green-600 text-white w-full py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Confirm Purchase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
