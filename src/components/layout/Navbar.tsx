'use client';

import Image from "next/image";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import LogoutButton from '../LogoutButton';

interface UserProfile {
  email: string | null;
  role: 'buyer' | 'seller' | 'admin' | null;
}

const navLinks = {
  buyer: [
    { href: '/', label: 'Home' },
    { href: '/orders', label: 'My Orders' },
    { href: '/history', label: 'History' },
    { href: '/profile', label: 'Profile' },
    { href: '/become-seller', label: 'Become a Seller' },
  ],
  seller: [
    { href: '/seller/dashboard', label: 'Dashboard' },
    { href: '/seller/products', label: 'My Products' },
    { href: '/seller/orders', label: 'Orders' },
    { href: '/seller/payments', label: 'Payments' },
  ],
  admin: [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/refunds', label: 'Refunds' },
  ],
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [toggling, setToggling] = useState(false);

  // Fetch user and profile on mount and on auth changes
  const fetchUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setUser(null);
      return;
    }
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', authUser.id)
      .single();

    setUser({
      email: authUser.email ?? null,
      role: (profile?.role as 'buyer' | 'seller' | 'admin') ?? 'buyer',
    });
  };

  useEffect(() => {
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Toggle buyer <-> seller mode
  const handleToggleRole = async () => {
    if (!user || toggling) return;

    setToggling(true);
    const newRole = user.role === 'seller' ? 'buyer' : 'seller';

    const { error } = await supabase
      .from('user_profiles')
      .update({ role: newRole })
      .eq('email', user.email);

    if (error) {
      alert('Failed to switch mode: ' + error.message);
      setToggling(false);
      return;
    }

    setUser((prev) => (prev ? { ...prev, role: newRole } : prev));
    setToggling(false);

    if (newRole === 'seller') {
      router.push('/seller/dashboard');
    } else {
      router.push('/');
    }
  };

  return (
    <nav className="bg-white shadow-sm" aria-label="Primary Navigation">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
            {/* Logo */}
<div className="flex items-center">
  <Link
    href="/"
    className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
  >
    <Image
      src="/logo.jpg" // Place your logo file in public/logo.png
      alt="MFU SecondHand Logo"
      width={40}
      height={40}
      priority
    />
    <span className="text-xl font-bold text-blue-600">MFU SecondHand</span>
  </Link>
</div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            {user ? (
              <>
                {user.role &&
                  navLinks[user.role]
                    .filter((link) => !(link.href === '/become-seller' && user.role === 'seller'))
                    .map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          pathname === link.href
                            ? 'text-blue-600 font-semibold'
                            : 'text-gray-700 hover:text-blue-500'
                        }`}
                        aria-current={pathname === link.href ? 'page' : undefined}
                      >
                        {link.label}
                      </Link>
                    ))}

                {user.role !== 'admin' && (
                  <button
                    onClick={handleToggleRole}
                    disabled={toggling}
                    className="ml-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-pressed={user.role === 'seller'}
                    aria-label="Toggle between Buyer and Seller modes"
                    title="Toggle between Buyer and Seller modes"
                  >
                    {toggling ? 'Switching...' : user.role === 'seller' ? 'Buyer Mode' : 'Seller Mode'}
                  </button>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-700 ml-6">
                  <span tabIndex={0} className="outline-none focus:ring-2 focus:ring-blue-500 rounded">
                    {user.email}
                  </span>
                  <LogoutButton />
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-blue-600 hover:underline font-medium px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-blue-600 hover:underline font-medium px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Signup
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
              aria-label="Toggle mobile menu"
              className="text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              {isOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-gray-50 px-4 py-3 space-y-3 border-t border-gray-200"
        >
          {user ? (
            <>
              {user.role &&
                navLinks[user.role]
                  .filter((link) => !(link.href === '/become-seller' && user.role === 'seller'))
                  .map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}

              {user.role !== 'admin' && (
                <button
                  onClick={handleToggleRole}
                  disabled={toggling}
                  className="w-full text-left px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-pressed={user.role === 'seller'}
                  aria-label="Toggle between Buyer and Seller modes"
                  title="Toggle between Buyer and Seller modes"
                >
                  {toggling ? 'Switching...' : user.role === 'seller' ? 'Buyer Mode' : 'Seller Mode'}
                </button>
              )}

              <div className="flex flex-col items-start space-y-2 text-sm text-gray-700 mt-3">
                <span tabIndex={0} className="outline-none focus:ring-2 focus:ring-blue-500 rounded">
                  {user.email}
                </span>
                <LogoutButton />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block text-blue-600 hover:underline font-medium px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="block text-blue-600 hover:underline font-medium px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setIsOpen(false)}
              >
                Signup
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
