'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login'); // Not logged in? Go to login
    } else {
      // Logged in → Redirect to role-based dashboard
      const role = session.user.role;
      router.push(`/dashboard/${role}`);
    }
  }, [session, status, router]);

  return (
    <main className="min-h-screen flex items-center justify-center p-8 text-center">
      <h1 className="text-3xl font-semibold">Redirecting...</h1>
    </main>
  );
}
