'use client';

import { useState } from 'react';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Mock product data
const allProducts = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    price: 299.99,
    originalPrice: 399.99,
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.8,
    reviews: 324,
    badge: 'Best Seller',
    category: 'electronics'
  },
  {
    id: '2',
    name: 'Premium Cotton T-Shirt',
    price: 49.99,
    originalPrice: 69.99,
    image: 'https://images.pexels.com/photos/769732/pexels-photo-769732.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.6,
    reviews: 156,
    badge: 'Sale',
    category: 'fashion'
  },
  {
    id: '3',
    name: 'Smart Fitness Watch',
    price: 199.99,
    image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.9,
    reviews: 278,
    badge: 'New',
    category: 'electronics'
  },
  {
    id: '4',
    name: 'Ceramic Coffee Mug Set',
    price: 34.99,
    originalPrice: 49.99,
    image: 'https://images.pexels.com/photos/6347/coffee-cup-mug-white.jpg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.7,
    reviews: 89,
    category: 'home'
  },
  {
    id: '5',
    name: 'Leather Crossbody Bag',
    price: 89.99,
    originalPrice: 129.99,
    image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.5,
    reviews: 203,
    badge: 'Limited',
    category: 'fashion'
  },
  {
    id: '6',
    name: 'Indoor Plant Collection',
    price: 79.99,
    image: 'https://images.pexels.com/photos/1084542/pexels-photo-1084542.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.8,
    reviews: 145,
    category: 'home'
  },
  {
    id: '7',
    name: 'Gaming Mouse',
    price: 89.99,
    originalPrice: 119.99,
    image: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.7,
    reviews: 432,
    category: 'electronics'
  },
  {
    id: '8',
    name: 'Yoga Mat Pro',
    price: 59.99,
    image: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.6,
    reviews: 189,
    category: 'sports'
  },
  {
    id: '9',
    name: 'Bestseller Novel',
    price: 24.99,
    originalPrice: 29.99,
    image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.9,
    reviews: 567,
    category: 'books'
  },
  {
    id: '10',
    name: 'Skincare Set',
    price: 149.99,
    originalPrice: 199.99,
    image: 'https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.5,
    reviews: 234,
    badge: 'Popular',
    category: 'beauty'
  },
  {
    id: '11',
    name: 'Mechanical Keyboard',
    price: 159.99,
    image: 'https://images.pexels.com/photos/1772123/pexels-photo-1772123.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.8,
    reviews: 324,
    category: 'electronics'
  },
  {
    id: '12',
    name: 'Running Shoes',
    price: 119.99,
    originalPrice: 149.99,
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.7,
    reviews: 298,
    category: 'sports'
  }
];

export function ProductGrid() {
  const [products, setProducts] = useState(allProducts.slice(0, 8));
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const currentLength = products.length;
    const nextProducts = allProducts.slice(currentLength, currentLength + 4);
    
    if (nextProducts.length === 0) {
      setHasMore(false);
    } else {
      setProducts(prev => [...prev, ...nextProducts]);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          Showing {products.length} of {allProducts.length} products
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            onClick={loadMore}
            disabled={isLoading}
            variant="outline"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Products'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}