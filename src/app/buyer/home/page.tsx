'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import { ChevronRight, Truck, Phone, ShieldCheck } from 'lucide-react';
import ImageCarousel from '@/components/ImageCarousel';
import LoggedInHeader from '@/components/LoggedInHeader';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  seller: string;
  discount: number;
  originalPrice: number;
}

const heroImages = [
  { src: '/images/carousel/1.png', alt: 'Slide 1' },
  { src: '/images/carousel/2.png', alt: 'Slide 2' },
  { src: '/images/carousel/3.png', alt: 'Slide 3' },
  { src: '/images/carousel/4.png', alt: 'Slide 4' },
  { src: '/images/carousel/5.png', alt: 'Slide 5' },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      router.push('/auth/login'); // redirect if not logged in
    }
  }, [router]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const result = await res.json();
        if (res.ok) setProducts(result.data || []);
        else throw new Error(result.message || 'Failed to fetch products');
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);


  return (
    <main>
      {/* Header */}
      <LoggedInHeader />

      {/* Main Layout: Categories + Hero Carousel */}
      <div className="container mx-auto px-4 py-4 flex gap-8">
        {/* Categories Sidebar */}
        <div className="hidden md:block w-64 space-y-4">
          {[
            "Woman&apos;s Fashion",
            "Men&apos;s Fashion",
            'Electronics',
            'Home & Lifestyle',
            'Medicine',
            'Sports & Outdoor',
            "Baby&apos;s & Toys",
            'Groceries & Pets',
            'Health & Beauty',
          ].map((category) => (
            <div
              key={category}
              className="flex items-center justify-between hover:text-red-500 cursor-pointer"
            >
              <span dangerouslySetInnerHTML={{ __html: category }} />
              <ChevronRight className="w-4 h-4" />
            </div>
          ))}
        </div>

        {/* Hero Carousel */}
        <ImageCarousel images={heroImages} />
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-2 py-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-5 h-10 bg-gray-900 rounded-sm"></div>
          <h2 className="text-2xl font-bold">Explore Our Products</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p>Loading products...</p>
          ) : products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="bg-white shadow-md rounded-lg p-4">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={200}
                  height={200}
                  className="object-cover rounded-lg"
                />
                <h4 className="font-bold text-gray-800 mt-4">{product.name}</h4>
                <p className="text-gray-600">{product.description}</p>
                <p className="text-xl font-semibold text-gray-800">${product.price}</p>
                <button
                  onClick={() => router.push(`/buyer/products/${product.id}`)}
                  className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                >
                  Add to Cart
                </button>
              </div>
            ))
          ) : (
            <p>No products found.</p>
          )}
        </div>

        {/* View All Button */}
        <div className="mt-8 text-center">
          <Link
            href="/products"
            className="inline-block bg-black text-white px-6 py-3 rounded-lg text-lg hover:bg-gray-800 transition"
          >
            View All Products
          </Link>
        </div>
      </div>

      {/* New Arrivals */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">New Arrival</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="col-span-2 row-span-2 bg-black text-white rounded-lg p-8 flex flex-col justify-between">
            <h3 className="text-2xl font-bold">PlayStation 5</h3>
            <p className="text-gray-300">Black and White version of the PS5 coming out on sale.</p>
            <a href="#" className="text-white hover:underline">Shop Now</a>
          </div>
          <div className="bg-gray-900 text-white rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">Women&apos;s Collections</h3>
            <p className="text-sm text-gray-300 mb-4">Featured woman collections that give you another vibe.</p>
            <a href="#" className="hover:underline">Shop Now</a>
          </div>
          <div className="bg-gray-900 text-white rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">Speakers</h3>
            <p className="text-sm text-gray-300 mb-4">Amazon wireless speakers</p>
            <a href="#" className="hover:underline">Shop Now</a>
          </div>
          <div className="bg-gray-900 text-white rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">Perfume</h3>
            <p className="text-sm text-gray-300 mb-4">GUCCI INTENSE OUD EDP</p>
            <a href="#" className="hover:underline">Shop Now</a>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Truck className="w-6 h-6" />,
              title: 'FREE AND FAST DELIVERY',
              desc: 'Free delivery for all orders over $140',
            },
            {
              icon: <Phone className="w-6 h-6" />,
              title: '24/7 CUSTOMER SERVICE',
              desc: 'Friendly 24/7 customer support',
            },
            {
              icon: <ShieldCheck className="w-6 h-6" />,
              title: 'MONEY BACK GUARANTEE',
              desc: 'We return money within 30 days',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                {icon}
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
