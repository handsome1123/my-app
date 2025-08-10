'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Header() {
  const router = useRouter();
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gray-800 text-white">
      <div className="text-lg font-bold">
        <Link href="/">📝 ToDo App</Link>
      </div>

      <nav className="flex gap-4">
        <Link href="/">Home</Link>
        {role === 'seller' && <Link href="/seller">Seller Dashboard</Link>}
        {role === 'admin' && <Link href="/admin">Admin Dashboard</Link>}
      </nav>

      <div className="flex items-center gap-4">
        {email && <span className="text-sm text-gray-300">{email}</span>}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
