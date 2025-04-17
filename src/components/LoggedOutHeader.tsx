'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useState } from 'react';
import RegisterModal from '@/components/RegisterModal';
import LoginModal from '@/components/LoginModal';

const LoggedOutHeader = () => {
  const [currentModal, setCurrentModal] = useState<'register' | 'login' | null>(null);

  const closeModal = () => setCurrentModal(null);
  const openRegister = () => setCurrentModal('register');
  const openLogin = () => setCurrentModal('login');

  return (
    <header>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <img src="/images/sh_logo.jpg" alt="Logo" className="h-15 w-auto" />
        </Link>

        <nav className="hidden md:flex space-x-8">
          <Link href="/" className="hover:text-red-500">Home</Link>
          <Link href="/contact" className="hover:text-red-500">Contact</Link>
          <Link href="/about" className="hover:text-red-500">About</Link>
          <button onClick={openRegister} className="hover:text-red-500">Sign Up</button>
        </nav>

        <div className="flex items-center space-x-6">
          <div className="relative">
            <input type="text" placeholder="What are you looking for?" className="border rounded-md py-2 pl-4 pr-10 w-[300px]" />
            <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-500" />
          </div>
        </div>
      </div>

      {currentModal === 'register' && (
        <RegisterModal
          onClose={closeModal}
          onSwitchToLogin={openLogin}
        />
      )}

      {currentModal === 'login' && (
        <LoginModal
          onClose={closeModal}
          onSwitchToRegister={openRegister}
        />
      )}
    </header>
  );
};

export default LoggedOutHeader;
