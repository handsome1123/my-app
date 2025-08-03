'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DatabaseTest from '@/components/DatabaseTest';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin'); // Not logged in? Go to sign in
    } else {
      // Logged in → Redirect to role-based dashboard
      const role = session.user.role;
      router.push(`/dashboard/${role}`);
    }
  }, [session, status, router]);

  return (
    <main className="min-h-screen flex items-center justify-center p-8 text-center">
      <div className="space-y-8">
        <h1 className="text-3xl font-semibold">Redirecting...</h1>
        <DatabaseTest />
      </div>
    </main>
  );
}
