'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  seller_id: string;
  description?: string;
  images?: { image_url: string; is_primary: boolean }[];
}

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { id } = await params;

      // Fetch user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Note: removed unused role fetching
      }

      // Fetch product + images
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
  }, [params, router]);

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found</p>;

  const primaryImage =
    product.images?.find((img) => img.is_primary)?.image_url ||
    product.images?.[0]?.image_url ||
    '/placeholder.jpg';

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
      <p><strong>Product:</strong> {product.name}</p>
      <div className="w-full h-56 relative overflow-hidden">
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          className="object-cover"
          priority
        />
      </div>
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