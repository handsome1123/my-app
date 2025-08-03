// app/dashboard/buyer/product/[id]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';

// Safe fetch function that handles build-time issues
async function fetchProduct(id: string) {
  // During build time, skip the fetch to avoid errors
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_URL) {
    return null;
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${baseUrl}/products/${id}`, {
      // Add cache options for better performance
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const product = await fetchProduct(id);

  // Handle case where product is not found
  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
            {product.image ? (
              <Image 
                src={product.image} 
                alt={product.name}
                width={500}
                height={500}
                className="w-full h-full object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No Image Available
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <p className="text-2xl font-semibold text-blue-600 mt-2">
                ${product.price}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Description
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label htmlFor="quantity" className="font-medium">
                  Quantity:
                </label>
                <select 
                  id="quantity"
                  className="border border-gray-300 rounded-md px-3 py-1"
                  defaultValue="1"
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-4">
                <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors">
                  Add to Cart
                </button>
                <button className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors">
                  Buy Now
                </button>
              </div>
            </div>

            {/* Additional Product Info */}
            <div className="pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Category:</span>
                  <span className="ml-2 text-gray-600">
                    {product.category || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Stock:</span>
                  <span className="ml-2 text-gray-600">
                    {product.stock || 'In Stock'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await fetchProduct(id);
  
  if (!product) {
    return {
      title: 'Product Not Found'
    };
  }

  return {
    title: product.name,
    description: product.description,
  };
}