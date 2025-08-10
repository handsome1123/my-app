'use client';

import Link from 'next/link';

interface SidebarProps {
  role?: 'admin' | 'seller' | 'buyer';
}

export default function Sidebar({ role = 'buyer' }: SidebarProps) {
  // Menu links for each role
  const roleLinks: Record<string, { href: string; label: string }[]> = {
    admin: [
      { href: '/admin/dashboard', label: 'Dashboard' },
      { href: '/admin/users', label: 'Users' },
      { href: '/admin/products', label: 'Products' },
      { href: '/admin/orders', label: 'Orders' },
      { href: '/admin/refunds', label: 'Refunds' },
    ],
    seller: [
      { href: '/seller/dashboard', label: 'Dashboard' },
      { href: '/seller/products', label: 'Products' },
      { href: '/seller/orders', label: 'Orders' },
      { href: '/seller/payments', label: 'Payments' },
    ],
    buyer: [
      { href: '/', label: 'Home' },
      { href: '/cart', label: 'Cart' },
      { href: '/orders', label: 'My Orders' },
      { href: '/profile', label: 'Profile' },
    ],
  };

  // Ensure we always have an array to map over
  const links = roleLinks[role] || [];

  return (
    <aside className="w-64 bg-white p-4 border-r">
      <h2 className="text-lg font-bold mb-4">Menu</h2>
      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block p-2 rounded hover:bg-gray-100"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
