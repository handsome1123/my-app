"use client";
import { Heart, ChevronRight, ChevronLeft, Eye, Truck, Phone, ShieldCheck } from 'lucide-react';
import ImageCarousel from '../components/ImageCarousel';
import Link from "next/link";
import { products } from "@/data/products";



const heroImages = [
  { src: '/images/carousel/1.png', alt: 'Slide 1' },
  { src: '/images/carousel/2.png', alt: 'Slide 2' },
  { src: '/images/carousel/3.png', alt: 'Slide 3' },
  { src: '/images/carousel/4.png', alt: 'Slide 4' },
  { src: '/images/carousel/5.png', alt: 'Slide 5' },
]


export default function Home() {
  return (
    <main>
      {/* Categories Sidebar + Hero Section */}
      <div className="container mx-auto px-4 py-4 flex gap-8">

        {/* Categories */}
        <div className="hidden md:block w-64 space-y-4">
          <div className="flex items-center justify-between hover:text-red-500 cursor-pointer">
            <span>Woman's Fashion</span>
            <ChevronRight className="w-4 h-4" />
          </div>
          <div className="flex items-center justify-between hover:text-red-500 cursor-pointer">
            <span>Men's Fashion</span>
            <ChevronRight className="w-4 h-4" />
          </div>
          <div className="hover:text-red-500 cursor-pointer">Electronics</div>
          <div className="hover:text-red-500 cursor-pointer">Home & Lifestyle</div>
          <div className="hover:text-red-500 cursor-pointer">Medicine</div>
          <div className="hover:text-red-500 cursor-pointer">Sports & Outdoor</div>
          <div className="hover:text-red-500 cursor-pointer">Baby's & Toys</div>
          <div className="hover:text-red-500 cursor-pointer">Groceries & Pets</div>
          <div className="hover:text-red-500 cursor-pointer">Health & Beauty</div>
        </div>

        {/* Hero Section */}
        <ImageCarousel images={heroImages} />

      </div>

      {/* Explore Our Porducts */}
      <div className="container mx-auto px-2 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-5 h-10 bg-gray-900 rounded-sm"></div>
            <h2 className="text-2xl font-bold">Explore Our Products</h2>
          </div>
        </div>

        {/* Products Grid */}

        <div className="container mx-auto px-2 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((item) => (
              <Link href={`/products/${item.id}`} key={item.id}>
                <div className="group relative bg-gray-50 rounded-lg p-4 cursor-pointer hover:shadow-md transition">
                  <div className="relative aspect-square mb-4">
                    {/* Discount Badge */}
                    {item.discount && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-sm px-2 py-1 rounded">
                        -{item.discount}%
                      </span>
                    )}

                    {/* Product Image */}
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />

                    {/* Action Buttons (Heart, Eye) */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Product Name */}
                  <h3 className="font-semibold mb-2">{item.name}</h3>

                  {/* Price */}
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

        {/* View All Products Button */}
        <div className="mt-8 text-center">
          <a href="/products" className="inline-block bg-black text-white px-6 py-3 rounded-lg text-lg hover:bg-gray-800 transition">
            View All Products
          </a>
        </div>

      </div>

      {/* New Arrivals Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">New Arrival</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="col-span-2 row-span-2">
            <div className="bg-black rounded-lg p-8 h-full flex flex-col justify-between text-white">
              <h3 className="text-2xl font-bold">PlayStation 5</h3>
              <p className="text-gray-300">Black and White version of the PS5 coming out on sale.</p>
              <a href="#" className="text-white hover:underline">Shop Now</a>
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Women's Collections</h3>
            <p className="text-sm text-gray-300 mb-4">Featured woman collections that give you another vibe.</p>
            <a href="#" className="text-white hover:underline">Shop Now</a>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Speakers</h3>
            <p className="text-sm text-gray-300 mb-4">Amazon wireless speakers</p>
            <a href="#" className="text-white hover:underline">Shop Now</a>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Perfume</h3>
            <p className="text-sm text-gray-300 mb-4">GUCCI INTENSE OUD EDP</p>
            <a href="#" className="text-white hover:underline">Shop Now</a>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-2">FREE AND FAST DELIVERY</h3>
            <p className="text-sm text-gray-600">Free delivery for all orders over $140</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-2">24/7 CUSTOMER SERVICE</h3>
            <p className="text-sm text-gray-600">Friendly 24/7 customer support</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-2">MONEY BACK GUARANTEE</h3>
            <p className="text-sm text-gray-600">We return money within 30 days</p>
          </div>
        </div>
      </div>

    </main>
  );
}