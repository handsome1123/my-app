'use client';

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) {
      setUserEmail(email);
    } else {
      router.push('/auth/login'); // Redirect if not logged in
    }
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    localStorage.removeItem('userEmail');
    router.push('/auth/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Home Page</h1>
      {userEmail && (
        <>
          <p className="text-lg mb-4">Welcome, {userEmail}</p>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </>
      )}
    </div>
  );
}
