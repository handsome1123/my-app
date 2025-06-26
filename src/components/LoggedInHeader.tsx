// components/LoggedInHeader.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search, Heart, ShoppingCart } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      localStorage.removeItem('userEmail');
      // router.push('/auth/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

const LoggedInHeader = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/buyer/home">
          <Image
            src="/images/sh_logo.jpg"
            alt="Logo"
            className="h-15 w-auto"
            width={100}
            height={100}
          />
        </Link>

        <nav className="hidden md:flex space-x-8">
          <Link href="/buyer/home" className="hover:text-red-500">Home</Link>
          <Link href="/buyer/orders" className="hover:text-red-500">My order</Link>
          <Link href="/about" className="hover:text-red-500">My whilst</Link>
        </nav>

        <div className="flex items-center space-x-6">
          <div className="relative">
            <input
              type="text"
              placeholder="What are you looking for?"
              className="border rounded-md py-2 pl-4 pr-10 w-[300px]"
            />
            <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-500" />
          </div>
          <Link href="/wishlist" className="relative">
            <Heart className="w-6 h-6" />
            {/* <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">2</span> */}
          </Link>
          <Link href="/buyer/cart" className="relative">
            <ShoppingCart className="w-6 h-6 relative">
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">8</span>
            </ShoppingCart>
          </Link>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center text-gray-700 hover:text-red-500"
            >
              <FontAwesomeIcon icon={faUserCircle} className="text-lg mr-1" />
              <FontAwesomeIcon icon={faCaretDown} className="text-sm" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-300 rounded-md shadow-xl z-50">
                <Link href="/account">
                  <span className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">
                    Manage My Account
                  </span>
                </Link>
                <Link href="/buyer/orders">
                  <span className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">
                    My Order
                  </span>
                </Link>
                <Link href="/cancellations">
                  <span className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">
                    My Cancellations
                  </span>
                </Link>
                <Link href="/reviews">
                  <span className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100">
                    My Reviews
                  </span>
                </Link>
                <Link href="/">
                  <div className="border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="block w-full py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 text-left"
                    >
                      Logout
                    </button>
                  </div>
                </Link>

              </div>

            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default LoggedInHeader;