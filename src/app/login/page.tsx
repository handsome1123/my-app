'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new authentication system
    router.push('/auth/signin');
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-100 to-blue-200 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Redirecting...</h1>
        <p className="text-gray-600">Taking you to the new authentication system</p>
      </div>
    </main>
  );
}
