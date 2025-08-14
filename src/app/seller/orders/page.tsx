'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  images?: { image_url: string }[];
}

interface OrderAddress {
  address_line1: string;
  address_line2?: string;
  city: string;
  zip_code: string;
  contact_number: string;
}

interface Buyer {
  id: string;
  email?: string;
  full_name?: string;
}

interface Order {
  id: string;
  product_id: string;
  buyer_id: string;
  status: string;
  payment_slip_url?: string;
  created_at: string;
  product?: Product;
  address?: OrderAddress;
  buyer?: Buyer;
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);

      // 1️⃣ Get logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // 2️⃣ Fetch orders for this seller
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError || !ordersData) {
        console.error('Error fetching orders:', ordersError);
        setLoading(false);
        return;
      }

      // 3️⃣ Fetch related products
      const productIds = [...new Set(ordersData.map(o => o.product_id))];
      const { data: products } = await supabase
        .from('products')
        .select('id, name, price, product_images(image_url)')
        .in('id', productIds);

      // 4️⃣ Fetch addresses
      const orderIds = ordersData.map(o => o.id);
      const { data: addresses } = await supabase
        .from('order_addresses')
        .select('*')
        .in('order_id', orderIds);

      // 5️⃣ Fetch buyers
      const buyerIds = [...new Set(ordersData.map(o => o.buyer_id))];
      const { data: buyers } = await supabase
        .from('users_profiles')
        .select('id, email, full_name')
        .in('id', buyerIds);

      // 6️⃣ Merge data
      const ordersWithDetails = ordersData.map(order => ({
        ...order,
        product: products?.find(p => p.id === order.product_id) || undefined,
        address: addresses?.find(a => a.order_id === order.id) || undefined,
        buyer: buyers?.find(b => b.id === order.buyer_id) || undefined
      }));

      setOrders(ordersWithDetails);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  if (loading) return <p className="p-4">Loading orders...</p>;
  if (orders.length === 0) return <p className="p-4">No orders found</p>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Seller Orders</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Order ID</th>
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Buyer</th>
              <th className="p-2 border">Address</th>
              <th className="p-2 border">Payment Slip</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-t">
                <td className="p-2 border text-sm">{order.id.slice(0, 8)}</td>
                <td className="p-2 border">
                  {order.product?.images?.[0]?.image_url && (
                    <Image
                      src={order.product.images[0].image_url}
                      alt={order.product.name}
                      width={50}
                      height={50}
                      className="inline-block mr-2"
                    />
                  )}
                  {order.product?.name} <br />
                  <span className="text-gray-600 text-sm">฿{order.product?.price}</span>
                </td>
                <td className="p-2 border">
                  {order.buyer?.full_name || 'Unknown'} <br />
                  <span className="text-gray-600 text-sm">{order.buyer?.email}</span>
                </td>
                <td className="p-2 border text-sm">
                  {order.address?.address_line1}, {order.address?.address_line2 && `${order.address.address_line2}, `}
                  {order.address?.city}, {order.address?.zip_code} <br />
                  📞 {order.address?.contact_number}
                </td>
                <td className="p-2 border text-center">
                  {order.payment_slip_url ? (
                    <a href={order.payment_slip_url} target="_blank" className="text-blue-600 underline">View</a>
                  ) : (
                    'No slip'
                  )}
                </td>
                <td className="p-2 border capitalize">{order.status}</td>
                <td className="p-2 border text-sm">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
