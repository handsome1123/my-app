'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogoutButton } from '@/components/LogoutButton';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SellerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user.role !== 'seller') {
      alert('Access denied');
      router.push('/');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <main className="h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg animate-pulse">Loading Seller Panel...</p>
      </main>
    );
  }

  if (!session || session.user.role !== 'seller') return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-green-100 p-6 md:p-10">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Seller Dashboard</h1>
          <p className="text-gray-600">
            Welcome, <span className="font-semibold">{session.user.email}</span> 🛒
          </p>
        </div>
        <LogoutButton />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <DashboardCard
          title="Manage Products"
          description="Add, edit, or delete your items"
          href="/dashboard/seller/products"
          icon="📦"
          color="bg-green-100"
        />
        <DashboardCard
          title="Manage Orders"
          description="Track and update your orders"
          href="/dashboard/seller/orders"
          icon="📬"
          color="bg-yellow-100"
        />
        <DashboardCard
          title="Earnings Report"
          description="View your total sales & revenue"
          href="/dashboard/seller/reports"
          icon="💰"
          color="bg-purple-100"
        />
      </motion.div>
    </main>
  );
}

type DashboardCardProps = {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
};

function DashboardCard({ title, description, href, icon, color }: DashboardCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`p-6 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition ${color}`}
      >
        <div className="text-3xl mb-3">{icon}</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">{title}</h2>
        <p className="text-gray-600 text-sm">{description}</p>
      </motion.div>
    </Link>
  );
}
