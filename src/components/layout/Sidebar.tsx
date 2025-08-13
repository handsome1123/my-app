'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface SidebarProps {
  role?: 'admin' | 'seller' | 'buyer';
}

export default function Sidebar({ role = 'buyer' }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

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

  const links = roleLinks[role] || [];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden p-2 m-2 bg-white rounded shadow z-50 fixed top-2 right-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-screen w-64 bg-white p-4 border-r shadow-md transform transition-transform duration-300 z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <h2 className="text-lg font-bold mb-4">Menu</h2>
        <nav className="space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block p-2 rounded hover:bg-gray-100"
              onClick={() => setIsOpen(false)} // close on mobile after click
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}
