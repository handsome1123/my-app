// lib/hooks/useAdminOnly.ts
'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAdminOnly() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.replace('/login');
    else if (session.user.role !== 'admin') router.replace('/');
  }, [session, status, router]);

  return { session, status };
}
