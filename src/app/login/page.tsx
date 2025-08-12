'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push('/');
    }
  };

  return (
  <div className="h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 animate-gradient-x flex items-center justify-center">
  <div className="max-w-4xl bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row animate-fade-in w-full h-full md:h-auto md:max-h-[90vh]">
    
    {/* Image side */}
    <div className="md:w-1/2 relative h-48 md:h-auto">
      <Image
        src="/mfu.jpg"
        alt="Login"
        fill
        className="object-cover"
        priority
      />
    </div>

    {/* Form side */}
    <form
      onSubmit={handleLogin}
      className="md:w-1/2 p-8 md:p-10 space-y-6 flex flex-col justify-center h-full overflow-auto"
    >
      <h2 className="text-2xl md:text-3xl font-extrabold text-yellow-500 text-center">
        Sign in to MFU SecondHand
      </h2>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Email
        </label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 transition"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Password
        </label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 transition"
        />
      </div>

      {errorMsg && <p className="text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg transition"
      >
        Login
      </button>

      <p className="text-sm text-center text-gray-600">
        Don&apos;t have account yet?{' '}
        <Link href="/signup" className="text-yellow-500 hover:underline font-semibold">
          Sign Up
        </Link>
      </p>
    </form>
    
  </div>

  <style jsx>{`
    @keyframes gradient-x {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }
    .animate-gradient-x {
      background-size: 200% 200%;
      animation: gradient-x 15s ease infinite;
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(15px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fade-in {
      animation: fadeIn 0.8s ease forwards;
    }
  `}</style>
</div>

    
  );
}
