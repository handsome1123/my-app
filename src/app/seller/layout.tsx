import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import React from "react";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="bg-gray-800 text-white w-64 py-6 px-3 flex flex-col">
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={faUserCircle} className="text-3xl mr-2" />
            <span className="text-lg font-semibold">MR. HANDSOME</span>
          </div>

          <nav className="space-y-2">
            <Link href="/seller/dashboard" className="block py-2 px-4 rounded-md hover:bg-gray-700 font-semibold">
              <FontAwesomeIcon icon={faChartBar} className="mr-2" />
              Dashboard
            </Link>
            <Link href="/seller/orders" className="block py-2 px-4 rounded-md hover:bg-gray-700">Orders</Link>
            <Link href="/seller/products" className="block py-2 px-4 rounded-md hover:bg-gray-700">Products</Link>
            <Link href="/seller/reports" className="block py-2 px-4 rounded-md hover:bg-gray-700">Reports</Link>
            <Link href="/seller/payments" className="block py-2 px-4 rounded-md hover:bg-gray-700">Payments</Link>
            <Link href="/seller/returns" className="block py-2 px-4 rounded-md hover:bg-gray-700">Manage Returns</Link>
            <Link href="/seller/settings" className="block py-2 px-4 rounded-md hover:bg-gray-700">Settings</Link>
          </nav>
        </div>
      </aside>

      {/* Page Content */}
      <main className="flex-1 bg-white p-6">
        {children}
      </main>
    </div>
  );
}
