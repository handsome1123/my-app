// app/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ChevronRight, Eye, Truck, Phone, ShieldCheck } from 'lucide-react';

import ImageCarousel from '@/components/ImageCarousel';
import { products } from '@/data/products';

const heroImages = [
  { src: "/images/carousel/1.png", alt: "Slide 1" },
  { src: "/images/carousel/2.png", alt: "Slide 2" },
  { src: "/images/carousel/3.png", alt: "Slide 3" },
  { src: "/images/carousel/4.png", alt: "Slide 4" },
  { src: "/images/carousel/5.png", alt: "Slide 5" },
];

export default function Home() {
  return (
    <>

      <main>

        {/* Categories Sidebar + Hero Section */}
        <div className="container mx-auto px-4 py-4 flex gap-8">
          <div className="hidden md:block w-64 space-y-4">
            {[
              "Woman's Fashion",
              "Men's Fashion",
              "Electronics",
              "Home & Lifestyle",
              "Medicine",
              "Sports & Outdoor",
              "Baby's & Toys",
              "Groceries & Pets",
              "Health & Beauty",
            ].map((category, i) => (
              <div
                key={i}
                className="flex items-center justify-between hover:text-red-500 cursor-pointer"
              >
                <span>{category}</span>
                {["Woman's Fashion", "Men's Fashion"].includes(category) && (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            ))}
          </div>

          <ImageCarousel key={0} images={heroImages} />
        </div>

        {/* Explore Products */}
        <div className="container mx-auto px-2 py-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-5 h-10 bg-gray-900 rounded-sm"></div>
              <h2 className="text-2xl font-bold">Explore Our Products</h2>
            </div>
          </div>

          <div className="container mx-auto px-2 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((item) => (
                <Link href="/auth/register" key={item.id}>
                  <div className="group relative bg-gray-50 rounded-lg p-4 cursor-pointer hover:shadow-md transition">
                    <div className="relative aspect-square mb-4">
                      {item.discount && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-sm px-2 py-1 rounded">
                          -{item.discount}%
                        </span>
                      )}
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        priority
                      />
                      <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                          <Heart className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-semibold mb-2">{item.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-red-500">${item.price}</span>
                      {item.originalPrice && (
                        <span className="text-gray-400 line-through">${item.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/products">View All Products</Link>
          </div>
        </div>

        {/* New Arrivals */}
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-8">New Arrival</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="col-span-2 row-span-2">
              <div className="bg-black rounded-lg p-8 h-full flex flex-col justify-between text-white">
                <h3 className="text-2xl font-bold">PlayStation 5</h3>
                <p className="text-gray-300">
                  Black and White version of the PS5 coming out on sale.
                </p>
                <a href="#" className="text-white hover:underline">Shop Now</a>
              </div>
            </div>
            {[
              { title: "Women’s Collections", desc: "Featured woman collections that give you another vibe." },
              { title: "Speakers", desc: "Amazon wireless speakers" },
              { title: "Perfume", desc: "GUCCI INTENSE OUD EDP" },
            ].map((item, i) => (
              <div key={i} className="bg-gray-900 rounded-lg p-6 text-white">
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-300 mb-4">{item.desc}</p>
                <a href="#" className="text-white hover:underline">Shop Now</a>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Truck className="w-6 h-6" />,
                title: "FREE AND FAST DELIVERY",
                desc: "Free delivery for all orders over $140",
              },
              {
                icon: <Phone className="w-6 h-6" />,
                title: "24/7 CUSTOMER SERVICE",
                desc: "Friendly 24/7 customer support",
              },
              {
                icon: <ShieldCheck className="w-6 h-6" />,
                title: "MONEY BACK GUARANTEE",
                desc: "We return money within 30 days",
              },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
