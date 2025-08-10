'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  title: string;
  price: number;
  seller_id: string;
}

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

    useEffect(() => {
    const fetchData = async () => {
      const { id } = await params; // ✅ unwrap the Promise here

      // Fetch user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setRole(profile?.role || 'buyer');
      }

      // Fetch product
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      setProduct(data || null);
    };

    fetchData();
  }, [params]); // now params is the Promise, not id

  if (!product) return <p>Loading...</p>;

  const handleBuyNow = () => {
    if (!userId) {
      alert('Please log in first.');
      router.push('/login');
      return;
    }

    router.push(`/checkout/${product.id}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{product.title}</h1>
      <p className="mb-2">Price: ${product.price}</p>
      <p className="mb-2">Seller ID: {product.seller_id}</p>

      {role === 'buyer' && product.seller_id !== userId && (
        <button
          onClick={handleBuyNow}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
        >
          Buy Now
        </button>
      )}
    </div>
  );
}
