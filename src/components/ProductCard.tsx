import { Product } from '@/utils/products';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="border p-4 rounded shadow-md">
      <h3 className="font-semibold">{product.name}</h3>
      <p className="text-sm text-gray-600">Price: ${product.price}</p>
      <p className="text-xs text-gray-400">Seller: {product.owner}</p>
    </div>
  );
}
