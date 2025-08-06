import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

const categories = [
  {
    name: 'Electronics',
    image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400',
    href: '/products?category=electronics',
    count: '1,200+ items'
  },
  {
    name: 'Fashion',
    image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
    href: '/products?category=fashion',
    count: '2,500+ items'
  },
  {
    name: 'Home & Garden',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
    href: '/products?category=home',
    count: '800+ items'
  },
  {
    name: 'Sports',
    image: 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=400',
    href: '/products?category=sports',
    count: '600+ items'
  },
  {
    name: 'Books',
    image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400',
    href: '/products?category=books',
    count: '1,000+ items'
  },
  {
    name: 'Beauty',
    image: 'https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg?auto=compress&cs=tinysrgb&w=400',
    href: '/products?category=beauty',
    count: '400+ items'
  }
];

export function Categories() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
  Explore our wide range of categories and find exactly what you&apos;re looking for
</p>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <Link key={category.name} href={category.href}>
              <Card className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-4">
                  <div className="aspect-square mb-4 overflow-hidden rounded-lg">
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={500}
                      height={300}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <h3 className="font-semibold text-center mb-1">{category.name}</h3>
                  <p className="text-xs text-muted-foreground text-center">{category.count}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}