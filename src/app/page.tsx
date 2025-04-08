// app/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Lamduan Ecommerce | Home",
  description: "Welcome to Lamduan Ecommerce - Explore Electronics, Fashion, Furniture & more",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to Lamduan Ecommerce</h1>
          <p className="text-lg text-gray-600">Shop electronics, clothing, furniture, and more from trusted sellers</p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-xl p-4 shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">Explore Products</h2>
            <p className="text-gray-500 mb-4">Browse by category or search for specific items</p>
            <Link href="/products" className="text-blue-600 font-medium">Go to Products →</Link>
          </div>

          <div className="border rounded-xl p-4 shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">Become a Seller</h2>
            <p className="text-gray-500 mb-4">List your products and manage orders on your own dashboard</p>
            <Link href="/seller/dashboard" className="text-blue-600 font-medium">Go to Seller Panel →</Link>
          </div>

          <div className="border rounded-xl p-4 shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">Admin Tools</h2>
            <p className="text-gray-500 mb-4">Monitor platform statistics, users, products, and orders</p>
            <Link href="/admin/dashboard" className="text-blue-600 font-medium">Go to Admin Panel →</Link>
          </div>
        </section>

        <footer className="text-center mt-16 text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Lamduan Ecommerce. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
