'use client';

import Link from 'next/link';
import { Search, Heart, ShoppingCart } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

const LoggedOutHeader = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <img
            src="/images/sh_logo.jpg"
            alt="Logo"
            className="h-15 w-auto"
          />
        </Link>

        <nav className="hidden md:flex space-x-8">
          <Link href="/" className="hover:text-red-500">Home</Link>
          <Link href="/contact" className="hover:text-red-500">Contact</Link>
          <Link href="/about" className="hover:text-red-500">About</Link>
          <Link href="/auth/register" className="hover:text-red-500">Sign Up</Link>
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
        </div>
      </div>
    </header>
  );
};

export default LoggedOutHeader;