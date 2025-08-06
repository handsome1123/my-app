'use client';

import Link from 'next/link';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  badge?: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Handle wishlist logic here
  };

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 relative overflow-hidden">
        {product.badge && (
          <Badge 
            className="absolute top-2 left-2 z-10"
            variant={product.badge === 'Sale' ? 'destructive' : 'default'}
          >
            {product.badge}
          </Badge>
        )}
        
        <div className="relative">
          <div className="aspect-square overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              width={500}
              height={300}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
          
          {/* Quick actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              onClick={handleWishlist}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Add to cart overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-black/50 backdrop-blur-sm p-2 transform translate-y-full group-hover:translate-y-0 transition-transform">
            <Button
              size="sm"
              className="w-full"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold truncate mb-2">{product.name}</h3>
          
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">({product.reviews})</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}