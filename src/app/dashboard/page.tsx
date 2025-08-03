// app/dashboard/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Redirect based on user role
    const userRole = session.user?.role || 'buyer';
    
    switch (userRole) {
      case 'admin':
        router.push('/dashboard/admin');
        break;
      case 'seller':
        router.push('/dashboard/seller');
        break;
      case 'buyer':
      default:
        router.push('/dashboard/buyer');
        break;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">Please sign in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  // This shouldn't be reached due to redirects above, but just in case
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2">Redirecting...</span>
    </div>
  );
}