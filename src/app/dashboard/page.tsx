// src/app/profile/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

import { Header } from '@/components/layout/Header';
import { Hero } from '@/components/home/Hero';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { Categories } from '@/components/home/Categories';
import { Newsletter } from '@/components/home/Newsletter';
import { Footer } from '@/components/layout/Footer';

type Product = {
  id: number;
  name: string;
  price: number;
};

export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserName(user?.user_metadata?.name || user?.email || 'No name')
    }

    getUser()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?select=*`, {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        console.error('Error fetching products:', error);
        return;
      }

      const data = await res.json();
      setProducts(data);
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <h1 className="text-xl font-bold">Welcome, {userName}</h1>
            <Header />
      <main>
              <h1>Product List from Supabase</h1>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.name} - ${p.price}
          </li>
        ))}
      </ul>

        <Hero />
        <Categories />
        <FeaturedProducts />
        <Newsletter />
      </main>
      <Footer />
    </div>
    
  )
}
