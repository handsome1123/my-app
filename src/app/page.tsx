'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

import ProductList from '@/components/ProductList';

// import UserInfo from '@/components/UserInfo';

interface Product {
  id: string;
  title: string;
  price: number;
  seller_id: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  // const [email, setEmail] = useState<string | null>(null);

  const fetchUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // setEmail(user.email ?? null);
    setUserId(user.id);

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    setRole(profile?.role || 'buyer');
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*');
    setProducts(data || []);
  };

  const buyProduct = async (productId: string) => {
    if (!userId) {
      alert('Login required');
      return;
    }

    const { error } = await supabase.from('orders').insert({
      buyer_id: userId,
      product_id: productId,
    });

    if (error) {
      alert('Purchase failed: ' + error.message);
    } else {
      alert('Purchase successful!');
    }
  };

  useEffect(() => {
    fetchUserRole();
    fetchProducts();
  }, []);

  return (
    <div className="p-4">
      {/* <UserInfo email={email} role={role} /> */}
      <h2 className="text-lg mb-4">Available Products</h2>
      <ProductList products={products} role={role} userId={userId} onBuy={buyProduct} />
    </div>
  );
}
