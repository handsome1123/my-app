// app/products/page.tsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  seller: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Simulated fetch - replace with real API call
    setProducts([
      {
        id: "1",
        name: "iPhone 14",
        price: 799,
        image: "/images/iphone.jpg",
        category: "electronics",
        seller: "TechWorld",
      },
      {
        id: "2",
        name: "Leather Jacket",
        price: 199,
        image: "/images/jacket.jpg",
        category: "clothing",
        seller: "FashionPoint",
      },
    ]);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg shadow hover:shadow-lg transition overflow-hidden"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-1">{product.name}</h2>
              <p className="text-gray-500 mb-1">${product.price}</p>
              <p className="text-sm text-gray-400">Seller: {product.seller}</p>
              <Link
                href={`/products/${product.id}`}
                className="inline-block mt-2 text-blue-600 hover:underline"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
