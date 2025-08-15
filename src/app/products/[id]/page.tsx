'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  seller_id: string;
  description?: string;
  images?: { image_url: string; is_primary: boolean }[];
}

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  
  const [product, setProduct] = useState<Product | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { id } = await params;

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

      // Fetch product + images - ADDED seller_id to the select
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          description,
          seller_id,
          images:product_images(image_url, is_primary)
        `)
        .eq('id', id)
        .single();
      
      if(productError) {
        console.error('Product fetch error:', productError.message);
        setProduct(null)
      } else {
        setProduct(productData);
      }
      setLoading(false);
    };

    fetchData();
  }, [params]);

  if (loading) return <p>Loading product...</p>;
  if (!product) return <p>Product not found.</p>;

  const primaryImage =
    product.images?.find((img) => img.is_primary)?.image_url ||
    product.images?.[0]?.image_url ||
    '/placeholder.jpg';

  const handleBuyNow = () => {
    if (!userId) {
      alert('Please log in first.');
      router.push('/login');
      return;
    }

    router.push(`/checkout/${product.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      <div className="w-full h-56 relative overflow-hidden">
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          className="object-cover"
          priority
        />
      </div>
      <p className="mb-2">Price: ฿{product.price}</p>
      <p className="mb-2">Seller ID: {product.seller_id}</p>
      <p className="mb-2">Description: {product.description}</p>

      {role === 'buyer' && product.seller_id !== userId && (
        <button
          onClick={handleBuyNow}
          className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Buy Now
        </button>
      )}
    </div>
  );
}