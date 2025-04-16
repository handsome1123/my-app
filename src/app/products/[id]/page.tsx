"use client";
import { useParams } from "next/navigation";
import { ShoppingCart, CreditCard } from 'lucide-react';
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { products } from "@/data/products";
import LoggedInHeader from "@/components/LoggedInHeader";

export default function ProductDetailPage() {
  const { id } = useParams();
  const numericId = Number(id);
  const [product, setProduct] = useState(() => {
    return products.find((p) => p.id === numericId) || null;
  });

  useEffect(() => {
    const foundProduct = products.find((p) => p.id === numericId);
    setProduct(foundProduct || null);
  }, [numericId]);

  if (!product) return <div className="p-6 text-center">Product not found.</div>;

  return (
    <main>
      {/* LoggedInHeader */}
      <LoggedInHeader />
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <Link href="/products" className="text-blue-600 hover:underline mb-4 inline-block">
          &larr; Back to Products
        </Link>

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
            <p className="text-gray-700 text-lg">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>

            <div className="text-2xl font-semibold text-green-600">
              ${product.price.toLocaleString()}
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p>Category: <span className="font-medium">{product.category ?? "General"}</span></p>
              <p>Seller: <span className="font-medium">{product.seller ?? "Unknown"}</span></p>
              <p>Pickup Location: <span className="font-medium">MFU Canteen</span></p>
              <p>Pickup Date: <span className="font-medium">{new Date().toLocaleDateString()}</span></p>
            </div>
            <div className="mt-4 flex gap-4">
              <Link
                href="/buyer/checkout"
                className="flex items-center gap-2 bg-blue-600 text-white text-lg px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
              >
                <CreditCard size={20} />
                Buy Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
