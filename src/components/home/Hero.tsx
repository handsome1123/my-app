import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingBag, Star, Users } from 'lucide-react';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20">
      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Discover
                <span className="text-primary"> Amazing</span>
                <br />
                Products
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Shop the latest trends and timeless classics. Quality products at unbeatable prices, delivered right to your door.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products">
                <Button size="lg" className="group">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                View Catalog
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold">50K+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm text-muted-foreground">Products</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold">4.9</div>
                <div className="text-sm text-muted-foreground">Rating</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 p-8">
              <Image
  src="https://images.pexels.com/photos/974911/pexels-photo-974911.jpeg?auto=compress&cs=tinysrgb&w=800"
  alt="Shopping"
  width={300}
  height={600}
  className="w-full h-full object-cover rounded-xl"
/>

            </div>
            
            {/* Floating cards */}
            <div className="absolute -top-4 -right-4 bg-background rounded-lg shadow-lg p-4 border">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Verified Reviews</div>
                  <div className="text-xs text-muted-foreground">99% Satisfaction</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-background rounded-lg shadow-lg p-4 border">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Free Shipping</div>
                  <div className="text-xs text-muted-foreground">Orders over $50</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}