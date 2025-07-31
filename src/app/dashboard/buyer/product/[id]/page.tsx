import { notFound } from 'next/navigation';
import { mockProducts } from '@/lib/mockData';
import { BuyNowButton } from '@/components/BuyNowButton';

type PageProps = {
  params: {
    id: string;
  };
};

export default async function ProductDetailPage({ params }: PageProps) {
  const product = mockProducts.find((p) => p._id === params.id);

  if (!product) return notFound();

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-blue-50 px-6 py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
        {/* Product Image */}
        <div>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="rounded-xl w-full h-96 object-cover shadow"
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-between">
          <div>
            <span className="inline-block px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full mb-3">
              Product ID: {product._id.slice(0, 6)}...
            </span>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-700 text-base leading-relaxed mb-4">
              This is a premium product listed by a trusted seller. Buy with confidence!
            </p>

            <p className="text-xl font-semibold text-green-600 mb-2">฿ {product.price}</p>
            <p className="text-sm text-gray-500">Seller: {product.owner?.email}</p>
          </div>

          {/* Buy Now Button */}
          <div className="mt-6">
            <BuyNowButton productId={product._id} />
          </div>
        </div>
      </div>
    </main>
  );
}
