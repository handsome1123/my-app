'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import LogoutButton from '../LogoutButton';

interface UserProfile {
  email: string | null;
  role: 'buyer' | 'seller' | 'admin' | null;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [toggling, setToggling] = useState(false); // to disable button while toggling

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

  // Fetch user and profile
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
    if (!user) return;
    if (toggling) return; // prevent multiple clicks

    setToggling(true);

    const newRole = user.role === 'seller' ? 'buyer' : 'seller';

    // Update role in your user_profiles table
    const { error } = await supabase
      .from('user_profiles')
      .update({ role: newRole })
      .eq('email', user.email); // Assuming email is unique key here, or use user id

    if (error) {
      alert('Failed to switch mode: ' + error.message);
      setToggling(false);
      return;
    }

    // Update local state immediately
    setUser((prev) => (prev ? { ...prev, role: newRole } : prev));

    setToggling(false);

    // Optionally navigate to the correct page depending on role
    if (newRole === 'seller') {
      router.push('/seller/dashboard');
    } else {
      router.push('/');
    }
  };

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              MFU SecondHand
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            {user ? (
              <>
                {user.role &&
                  navLinks[user.role]
                    .filter(link => !(link.href === '/become-seller' && user.role === 'seller'))
                    .map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`${
                          pathname === link.href ? 'text-blue-600 font-semibold' : 'text-gray-700'
                        } hover:text-blue-500`}
                      >
                        {link.label}
                      </Link>
                    ))}

                {/* Toggle button */}
                {user.role !== 'admin' && (
                  <button
                    onClick={handleToggleRole}
                    disabled={toggling}
                    className="ml-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                    title="Toggle between Buyer and Seller modes"
                  >
                    {toggling
                      ? 'Switching...'
                      : user.role === 'seller'
                      ? 'Switch to Buyer Mode'
                      : 'Switch to Seller Mode'}
                  </button>
                )}

                <div className="flex items-center space-x-3 text-sm text-gray-700 ml-4">
                  <span>{user.email}</span>
                  <LogoutButton />
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-blue-600 hover:underline font-medium">
                  Login
                </Link>
                <Link href="/signup" className="text-blue-600 hover:underline font-medium">
                  Signup
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)}>
              <span className="text-2xl">☰</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-50 px-4 py-2 space-y-2">
          {user ? (
            <>
              {user.role &&
                navLinks[user.role]
                  .filter(link => !(link.href === '/become-seller' && user.role === 'seller'))
                  .map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block text-gray-700 hover:text-blue-500"
                    >
                      {link.label}
                    </Link>
                  ))}

              {/* Toggle button mobile */}
              {user.role !== 'admin' && (
                <button
                  onClick={handleToggleRole}
                  disabled={toggling}
                  className="w-full text-left mt-1 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                  title="Toggle between Buyer and Seller modes"
                >
                  {toggling
                    ? 'Switching...'
                    : user.role === 'seller'
                    ? 'Switch to Buyer Mode'
                    : 'Switch to Seller Mode'}
                </button>
              )}

              <div className="flex flex-col items-start space-y-1 text-sm text-gray-700 mt-2">
                <span>{user.email}</span>
                <LogoutButton />
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-blue-600 hover:underline font-medium">
                Login
              </Link>
              <Link href="/signup" className="block text-blue-600 hover:underline font-medium">
                Signup
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
 