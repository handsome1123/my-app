'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ImageCarousel from '@/components/ImageCarousel'

export default function HomePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  
  const bannerImages = [
    '/banner/1.jpg',
    '/banner/2.jpg',
    '/banner/3.jpg',
    '/banner/4.jpg',
  ];

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email ?? null);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setRole(profile?.role || 'buyer');
    };

    fetchUserRole();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">

        <h1 className="text-center text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-yellow-500">MFU SecondHand</span>
        </h1>

        <ImageCarousel images={bannerImages} /> 

        <div className="p-6 text-center">
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your premier marketplace for buying and selling products. 
            Discover amazing deals or start selling your items today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/products" 
              className="bg-yellow-500 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse Products
            </Link>
            {role === 'seller' && (
              <Link 
                href="/seller/dashboard" 
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Seller Dashboard
              </Link>
            )}
            {role === 'admin' && (
              <Link 
                href="/admin/dashboard" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Admin Dashboard
              </Link>
            )}
          </div>

          {!email && (
            <div className="space-y-4">
              <p className="text-gray-600">Get started by creating an account</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/signup" 
                  className="bg-white hover:bg-gray-50 text-yellow-500 border border-yellow-500 px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Sign Up
                </Link>
                <Link 
                  href="/login" 
                  className="bg-yellow-500 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          )}

          {email && (
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
              <p className="text-gray-600 mb-2">Welcome back!</p>
              <p className="font-semibold text-gray-900">{email}</p>
              <p className="text-sm text-gray-500 capitalize">Role: {role}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
