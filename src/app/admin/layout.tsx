'use client';

import { ReactNode } from 'react';
import Sidebar from '@/components/layout/Sidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <Sidebar role="admin" />
        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
