import { ProductCard } from './ProductCard';

const relatedProducts = [
  {
    id: '2',
    name: 'Premium Cotton T-Shirt',
    price: 49.99,
    originalPrice: 69.99,
    image: 'https://images.pexels.com/photos/769732/pexels-photo-769732.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.6,
    reviews: 156,
    badge: 'Sale'
  },
  {
    id: '3',
    name: 'Smart Fitness Watch',
    price: 199.99,
    image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.9,
    reviews: 278,
    badge: 'New'
  },
  {
    id: '7',
    name: 'Gaming Mouse',
    price: 89.99,
    originalPrice: 119.99,
    image: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.7,
    reviews: 432
  },
  {
    id: '11',
    name: 'Mechanical Keyboard',
    price: 159.99,
    image: 'https://images.pexels.com/photos/1772123/pexels-photo-1772123.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.8,
    reviews: 324
  }
];

export function RelatedProducts() {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Related Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
