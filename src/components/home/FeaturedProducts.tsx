import { ProductCard } from '@/components/products/ProductCard';

const featuredProducts = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    price: 299.99,
    originalPrice: 399.99,
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.8,
    reviews: 324,
    badge: 'Best Seller'
  },
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
    id: '4',
    name: 'Ceramic Coffee Mug Set',
    price: 34.99,
    originalPrice: 49.99,
    image: '/logo.jpg',
    rating: 4.7,
    reviews: 89,
  },
  {
    id: '5',
    name: 'Leather Crossbody Bag',
    price: 89.99,
    originalPrice: 129.99,
    image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.5,
    reviews: 203,
    badge: 'Limited'
  },
  {
    id: '6',
    name: 'Indoor Plant Collection',
    price: 79.99,
    image: 'https://images.pexels.com/photos/1084542/pexels-photo-1084542.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.8,
    reviews: 145,
  }
];

export function FeaturedProducts() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our hand-picked selection of the best products across all categories
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}