'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface HeaderProps {
  initialRole?: 'buyer' | 'seller' | 'admin';
  initialEmail?: string;
}

export default function Header({ initialRole = 'buyer', initialEmail = '' }: HeaderProps) {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(initialRole);
  const [email, setEmail] = useState<string | null>(initialEmail);

  const handleLogout = () => {
    // Example frontend-only logout logic
    setRole(null);
    setEmail(null);
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
