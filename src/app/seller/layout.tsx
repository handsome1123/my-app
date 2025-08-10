'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/layout/Sidebar';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'seller') {
        router.push('/unauthorized'); // Optional: a "Not Authorized" page
        return;
      }

      setRole(profile.role);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

    return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <Sidebar role="seller" />
        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
