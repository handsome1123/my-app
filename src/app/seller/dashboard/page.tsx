'use client';

import { useState } from 'react';
import { DollarSign, Package, ShoppingBag } from 'lucide-react';

export default function SellerDashboardPage() {
  // Mock Data (replace with API later if needed)
  const [email] = useState<string | null>('seller@mfu.ac.th'); // Change to null for no email
  const [role] = useState<string | null>('seller'); // "buyer" | "seller" | "admin"
  const [productCount] = useState<number>(12); // Example count

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard Overview</h2>
        <p className="text-gray-500 text-sm sm:text-base">
          Here’s your sales, orders, and recent activity summary.
        </p>

        {email && (
          <div className="mt-4">
            <span className="block text-sm text-blue-600">{email}</span>
            <h1 className="text-base sm:text-lg font-medium text-gray-700">
              Welcome, <span className="font-semibold">{role}</span>
            </h1>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <section className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1 */}
        <div className="p-5 sm:p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-gray-700">Total Sales Revenue</h2>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">$1,250.00</p>
          <p className="text-xs sm:text-sm text-gray-400">Updated just now</p>
        </div>

        {/* Card 2 */}
        <div className="p-5 sm:p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-gray-700">Orders In Process</h2>
            <ShoppingBag className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">3</p>
          <p className="text-xs sm:text-sm text-gray-400">Pending fulfillment</p>
        </div>

        {/* Card 3 */}
        <div className="p-5 sm:p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-gray-700">Products Listed</h2>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">{productCount}</p>
          <p className="text-xs sm:text-sm text-gray-400">Available in store</p>
        </div>
      </section>
    </div>
  );
}
