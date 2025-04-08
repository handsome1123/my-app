// app/products/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  seller: string;
  imageUrl: string;
  location: string;
  pickupDate: string;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      // Replace with actual API call
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      setProduct(data);
    }
    if (id) fetchProduct();
  }, [id]);

  if (!product) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={500}
          height={500}
          className="rounded shadow"
        />
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-700 mb-4">{product.description}</p>
          <p className="text-xl font-semibold text-blue-600 mb-2">${product.price}</p>
          <p className="text-sm text-gray-500 mb-2">Category: {product.category}</p>
          <p className="text-sm text-gray-500 mb-2">Sold by: {product.seller}</p>
          <p className="text-sm text-gray-500 mb-2">Delivery location: {product.location}</p>
          <p className="text-sm text-gray-500 mb-4">Pickup date: {product.pickupDate}</p>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add to Cart</button>
        </div>
      </div>
    </div>
  );
}
