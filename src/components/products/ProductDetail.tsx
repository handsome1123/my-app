'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Heart, ShoppingCart, Truck, Shield, RotateCcw, Minus, Plus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import Image from 'next/image';

// Mock product data
const productData = {
  id: '1',
  name: 'Wireless Bluetooth Headphones',
  price: 299.99,
  originalPrice: 399.99,
  images: [
    'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3394658/pexels-photo-3394658.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3394664/pexels-photo-3394664.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  rating: 4.8,
  reviews: 324,
  description: 'Experience premium sound quality with these wireless Bluetooth headphones. Featuring active noise cancellation, 30-hour battery life, and premium comfort design.',
  features: [
    'Active Noise Cancellation',
    '30-hour battery life',
    'Bluetooth 5.0 connectivity',
    'Premium leather headband',
    'Quick charge: 5 min = 2 hours playback'
  ],
  specifications: {
    'Driver Size': '40mm',
    'Frequency Response': '20Hz - 20kHz',
    'Impedance': '32 ohms',
    'Battery Life': '30 hours',
    'Charging Time': '2 hours',
    'Weight': '250g'
  },
  inStock: true,
  stock: 15
};

export function ProductDetail() { 
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: productData.id,
        name: productData.name,
        price: productData.price,
        image: productData.images[0],
      });
    }
  };

  const handleWishlist = () => {
    toast.success('Added to wishlist!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      {/* Product Images */}
      <div className="space-y-4">
        <div className="aspect-square overflow-hidden rounded-lg border relative">
          <Image
            src={productData.images[selectedImage]}
            alt={productData.name}
            fill
            className="object-cover"
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {productData.images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`aspect-square relative overflow-hidden rounded-lg border-2 transition-colors ${
                selectedImage === index ? 'border-primary' : 'border-border'
              }`}
              aria-label={`Select image ${index + 1}`}
              type="button"
            >
              <Image
                src={image}
                alt={`${productData.name} ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{productData.name}</h1>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{productData.rating}</span>
              <span className="text-muted-foreground">({productData.reviews} reviews)</span>
            </div>
            
            {productData.inStock ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                In Stock ({productData.stock} left)
              </Badge>
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold">${productData.price}</span>
            {productData.originalPrice && (
              <span className="text-xl text-muted-foreground line-through">
                ${productData.originalPrice}
              </span>
            )}
            {productData.originalPrice && (
              <Badge variant="destructive">
                Save ${(productData.originalPrice - productData.price).toFixed(2)}
              </Badge>
            )}
          </div>
        </div>

        <p className="text-muted-foreground">{productData.description}</p>

        <div className="space-y-4">
          <h3 className="font-semibold">Key Features:</h3>
          <ul className="space-y-2">
            {productData.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Quantity and Actions */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="font-medium">Quantity:</label>
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="px-4 py-2 font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(Math.min(productData.stock, quantity + 1))}
                disabled={quantity >= productData.stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={!productData.inStock}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleWishlist}
            >
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium text-sm">Free Shipping</div>
              <div className="text-xs text-muted-foreground">Orders over $50</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium text-sm">2 Year Warranty</div>
              <div className="text-xs text-muted-foreground">Full protection</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RotateCcw className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium text-sm">30-Day Returns</div>
              <div className="text-xs text-muted-foreground">No questions asked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="lg:col-span-2">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="prose max-w-none">
                  <p className="mb-4">{productData.description}</p>
                  <p>
                    These premium wireless headphones deliver exceptional audio quality with deep bass, clear mids, and crisp highs. The active noise cancellation technology blocks out unwanted ambient sound, allowing you to focus on your music or calls.
                  </p>

                  <p className="mt-4">
                    With a comfortable over-ear design and premium materials, these headphones are 
                    perfect for long listening sessions. The quick-charge feature ensures you&apos;re 
                    never without your music for long.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(productData.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-border/50">
                      <span className="font-medium">{key}</span>
                      <span className="text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Customer Reviews</h3>
                    <Button variant="outline">Write a Review</Button>
                  </div>
                  
                  <div className="space-y-4">
                    {[1, 2, 3].map((review) => (
                      <div key={review} className="border-b pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <span className="font-medium">John D.</span>
                          <span className="text-sm text-muted-foreground">2 days ago</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Amazing sound quality and comfort. The noise cancellation works perfectly 
                          for my daily commute. Highly recommended!
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
