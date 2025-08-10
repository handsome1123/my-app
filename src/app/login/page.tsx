'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setErrorMsg(loginError.message);
      return;
    }

    const user = loginData.user;

    // Fetch user role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.role) {
      setErrorMsg('Failed to fetch user role.');
      return;
    }

    // Redirect based on role
    const role = profile.role;
    if (role === 'admin') {
      router.push('/admin/dashboard');
    } else if (role === 'seller') {
      router.push('/seller/dashboard');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <form onSubmit={handleLogin} className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow-md space-y-6">
       <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
        {errorMsg && <p className="text-red-600">{errorMsg}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          Login
        </button>

        <p className="text-sm text-center text-gray-600">
        Don&apos;t have account yet?{' '}
        <Link href="/signup" className="text-blue-600 hover:underline font-medium">
          Sign Up
        </Link>
      </p>

      </form>
    </div>
  );
}
