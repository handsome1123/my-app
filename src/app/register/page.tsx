'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'seller' | 'buyer'>('buyer');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });

    if (res.ok) {
      alert('User registered successfully! Please login.');
      router.push('/login');
    } else {
      const data = await res.json();
      alert('Error: ' + (data.error || 'Failed to register'));
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm"
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Create an Account 🚀
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <input
              type="email"
              id="email"
              required
              className="peer w-full px-4 pt-5 pb-2 border border-gray-300 rounded-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-300 transition"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <label
              htmlFor="email"
              className="absolute left-4 top-2.5 text-gray-500 text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all"
            >
              Email Address
            </label>
          </div>

          <div className="relative">
            <input
              type="password"
              id="password"
              required
              className="peer w-full px-4 pt-5 pb-2 border border-gray-300 rounded-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-300 transition"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <label
              htmlFor="password"
              className="absolute left-4 top-2.5 text-gray-500 text-sm peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 transition-all"
            >
              Password
            </label>
          </div>

          <div className="relative">
            <select
              id="role"
              value={role}
              onChange={e => setRole(e.target.value as 'admin' | 'seller' | 'buyer')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-purple-300 focus:border-purple-500 transition"
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            {loading ? 'Registering...' : 'Register'}
          </motion.button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-purple-600 hover:underline font-medium">
            Login
          </a>
        </p>
      </motion.div>
    </main>
  );
}
