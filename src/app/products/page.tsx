'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import ImageCarousel from '@/components/ImageCarousel';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: { image_url: string; is_primary: boolean }[];
  category_id: string;
  category?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function ProductList() {
  const bannerImages = ['/banner/1.jpg', '/banner/2.jpg', '/banner/3.jpg'];

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    async function fetchData() {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name');

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        return;
      }
      setCategories(categoriesData || []);

      // Fetch products with images and category_id
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          description,
          category_id,
          images:product_images(image_url, is_primary)
        `);

      if (productsError) {
        console.error('Error fetching products:', productsError);
        return;
      }

      // Map category names into products
      const categoryMap = new Map(
        (categoriesData || []).map((cat) => [cat.id, cat.name])
      );

      const productsWithCategory = (productsData || []).map((p) => ({
        ...p,
        category: categoryMap.get(p.category_id) || 'Uncategorized',
      }));

      setProducts(productsWithCategory);
    }

    fetchData();
  }, []);

  // Filter products based on search and selected category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        categoryFilter === 'all' || p.category === categoryFilter;
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase().trim());

      return matchesCategory && matchesSearch;
    });
  }, [products, search, categoryFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-6">
      <div className="px-4 py-8 max-w-7xl mx-auto">
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Browse Products
        </h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 outline-none"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-1/4 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Banner Carousel */}
        <ImageCarousel images={bannerImages} />

        {/* Product List */}
        <div className="p-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const primaryImage =
              product.images.find((img) => img.is_primary)?.image_url ||
              '/placeholder.jpg';

            return (
            <Link key={product.id} href={`/products/${product.id}`}>
              <motion.div
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative w-full h-56 overflow-hidden">
                  <Image
                    src={primaryImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  <span className="absolute top-3 right-3 bg-pink-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                    ${product.price}
                  </span>
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-800 truncate">
                    {product.name}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Category: {product.category}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    {product.description?.slice(0, 60)}
                  </p>
                  <button className="mt-4 w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 px-4 rounded-lg font-medium hover:opacity-90 transition">
                    View Details
                  </button>
                </div>
              </motion.div>
          </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
