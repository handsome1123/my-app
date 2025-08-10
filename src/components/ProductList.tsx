'use client';

import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  price: number;
  seller_id: string;
}

interface ProductListProps {
  products: Product[];
  role: string | null;
  userId: string | null;
  onBuy: (productId: string) => void;
}

export default function ProductList({ products, role, userId, onBuy }: ProductListProps) {
  if (products.length === 0) return <p>No products available.</p>;

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id} className="mb-4 border p-2 rounded">
          <Link href={`/products/${product.id}`}>
            <div className="cursor-pointer hover:underline">
              <strong>{product.title}</strong>
            </div>
          </Link>
          <div>Price: ${product.price}</div>

          {role === 'buyer' && product.seller_id !== userId && (
            <button
              onClick={() => onBuy(product.id)}
              className="mt-2 px-4 py-1 bg-blue-600 text-white rounded"
            >
              Buy
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
