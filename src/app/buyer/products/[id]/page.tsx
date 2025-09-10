"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/buyer/products/${id}`);
        const data = await res.json();
        if (res.ok) setProduct(data);
        else setError(data.error || "Failed to fetch product");
      } catch {
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id]);


  if (loading) return <p className="text-center p-6">Loading...</p>;
  if (error) return <p className="text-center text-red-500 p-6">{error}</p>;
  if (!product) return <p className="text-center p-6">Product not found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col md:flex-row gap-10 md:gap-16 items-start">
      {/* Product Image */}
      <div className="relative w-full md:w-1/2 h-96 md:h-[500px] rounded-xl shadow-lg overflow-hidden">
        <Image
          src={product.imageUrl || "/placeholder.png"}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="md:w-1/2 flex flex-col justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-gray-700 text-lg md:text-xl mb-6 leading-relaxed">{product.description}</p>
          <div className="flex items-center gap-4">
            <span className="text-3xl md:text-4xl font-bold text-green-600">${product.price}</span>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={() => router.push(`/buyer/checkout?productId=${product._id}`)}
            className="w-full bg-green-600 hover:bg-green-700 transition-colors duration-300 text-white font-semibold py-4 rounded-xl shadow-md hover:shadow-lg"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );

}
