"use client";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: string | number;
  name: string;
  price: number;
  images?: { image_url: string; is_primary: boolean }[];
  originalPrice?: number;
  discount?: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const primaryImage = product.images?.find(img => img.is_primary)?.image_url || '/placeholder.jpg';
  
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col">
      {/* Product Image */}
      <Link href={`/products/${product.id}`}>
        <div className="relative w-full h-48 rounded-lg overflow-hidden">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover hover:scale-105 transition-transform"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="mt-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
          {product.name}
        </h3>

        {/* Price Section */}
        <div className="mt-2">
          <span className="text-blue-600 font-bold text-lg">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through ml-2">
              ${product.originalPrice}
            </span>
          )}
          {product.discount && (
            <span className="ml-2 text-sm text-green-600">
              {product.discount}% OFF
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-auto pt-4 flex gap-2">
          <Link
            href={`/products/${product.id}`}
            className="flex-1 text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            View
          </Link>
          <button
            className="flex-1 text-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
