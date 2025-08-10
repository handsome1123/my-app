'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  title: string;
  price: number;
  seller_id: string;
}

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { id } = await params;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      setProduct(data || null);
    };

    fetchData();
  }, [params, router]);

  if (!product) return <p>Loading...</p>;

  const handleConfirm = async () => {
    if (!userId) return alert('Login required');
    if (!address) return alert('Please enter your address');
    if (!slipFile) return alert('Please upload your payment slip');

    // 1. Upload slip to Supabase Storage
    const fileExt = slipFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('payment_slips')
      .upload(fileName, slipFile);

    if (uploadError) {
      alert('Slip upload failed: ' + uploadError.message);
      return;
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from('payment_slips')
      .getPublicUrl(fileName);

    // 2. Save order to database
    const { error } = await supabase.from('orders').insert({
      buyer_id: userId,
      product_id: product.id,
      shipping_address: address,
      payment_slip_url: publicUrl,
      status: 'pending_payment_verification'
    });

    if (error) {
      alert('Order creation failed: ' + error.message);
    } else {
      alert('Order placed successfully! Waiting for seller/admin confirmation.');
      router.push('/');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Checkout</h1>
      <p><strong>Product:</strong> {product.title}</p>
      <p><strong>Price:</strong> ${product.price}</p>

      <div className="mt-4">
        <label className="block font-medium">Shipping Address</label>
        <textarea
          className="w-full border p-2 rounded mt-1"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      <div className="mt-4">
        <label className="block font-medium">Upload Payment Slip</label>
        <input
          type="file"
          accept="image/*"
          className="mt-1"
          onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
        />
      </div>

      <button
        onClick={handleConfirm}
        className="mt-6 px-4 py-2 bg-green-600 text-white rounded w-full"
      >
        Confirm Purchase
      </button>
    </div>
  );
}
