'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
  const confirmed = confirm('Are you sure you want to logout?');
  if (!confirmed) return;

  await supabase.auth.signOut();
  router.push('/');
};


  return (
    <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
      Logout
    </button>
  );
}
