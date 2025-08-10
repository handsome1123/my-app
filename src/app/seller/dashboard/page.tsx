'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SellerDashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email ?? null); // fallback to null if undefined

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setRole(profile?.role || 'buyer');
    };

    fetchUserRole();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
      <p>Here’s your sales, orders, and recent activity summary.</p>
      {email && (
      <div>
        <span className="text-sm text-blue-500">{email}</span>
        <h1 className="text-xl mb-4">Welcome, {role}</h1>
      </div>

    )}

          <section className="grid grid-cols-3 gap-6">
        <div className="p-4 bg-gray-100 rounded shadow">
          <h2 className="text-lg font-semibold">Total Sales Revenue</h2>
          <p className="text-2xl">$0.00</p>
        </div>
        <div className="p-4 bg-gray-100 rounded shadow">
          <h2 className="text-lg font-semibold">Orders In Process</h2>
          <p className="text-2xl">0</p>
        </div>
        <div className="p-4 bg-gray-100 rounded shadow">
          <h2 className="text-lg font-semibold">Products Listed</h2>
          <p className="text-2xl">0</p>
        </div>
      </section>
    </div>
  );
}
