'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 🔹 Simulate auth check (frontend only)
    const timer = setTimeout(() => {
      const isLoggedIn = true; // change to false to test redirect
      const role = 'seller';   // change to "buyer" or "admin" to test

      if (!isLoggedIn) {
        router.push('/login');
        return;
      }

      if (role !== 'seller') {
        router.push('/');
        return;
      }

      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
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
