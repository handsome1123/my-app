'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sign up user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }
    const user = data.user;

    if (user) {
      await supabase.from('user_profiles').insert({
        id: user.id,
        role: 'buyer', // default role
      })
    }
    router.push('/login'); // Or redirect as needed
  };

  return (
    <form onSubmit={signup} className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800">Create an Account</h2>

      <div>
      {/* <label htmlFor="name" className="block text-sm font-medium text-gray-700">
      Full Name
      </label>
      <input type="text" placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} required
      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" /> */}
      </div>
      
      <div>
      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
      Email
    </label>
      <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required 
      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
      </div>
      
      <div>
      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
      Password
    </label>
      <input type="password" placeholder="Create a Password" value={password} onChange={e => setPassword(e.target.value)} required 
      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
      </div>

      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
        Sign Up
      </button>

      <p className="text-sm text-center text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline font-medium">
          Login
        </Link>
      </p>
      
    </form>
  );
}
