'use client';

import { useAdminOnly } from '@/lib/hooks/useAdminOnly';
import { motion } from 'framer-motion';
import { LogoutButton } from '@/components/LogoutButton';
import Link from 'next/link';

export default function AdminDashboard() {
  const { session, status } = useAdminOnly();

  if (status === 'loading' || !session) {
    return (
      <main className="h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600 animate-pulse">Loading Admin Panel...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-purple-100 p-6 md:p-10">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, <span className="font-semibold">{session.user.email}</span> 🎉
          </p>
        </div>
        <LogoutButton />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <DashboardCard
          title="Manage Products"
          description="Add, edit, or delete products"
          href="/dashboard/admin/products"
          icon="🛍️"
          color="bg-pink-100"
        />
        <DashboardCard
          title="Manage Users"
          description="View and manage user roles"
          href="/dashboard/admin/users"
          icon="👥"
          color="bg-yellow-100"
        />
        <DashboardCard
          title="Analytics"
          description="View traffic, sales and more"
          href="/dashboard/admin/analytics"
          icon="📊"
          color="bg-blue-100"
        />
      </motion.div>
    </main>
  );
}

type CardProps = {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
};

function DashboardCard({ title, description, href, icon, color }: CardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className={`p-6 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition ${color}`}
      >
        <div className="text-3xl mb-3">{icon}</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">{title}</h2>
        <p className="text-gray-600 text-sm">{description}</p>
      </motion.div>
    </Link>
  );
}
