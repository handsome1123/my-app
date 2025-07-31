'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

import { mockUser } from '@/lib/userData';

type User = {
  id: string;
  email: string;
  role: string;
};

export default function AdminUsersPage() {
  const { data: session, status } = useSession();

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setUsers(mockUser);
  }, []);

  if (status === 'loading') return <p className="text-center py-10">Loading...</p>;
  if (!session || session.user.role !== 'admin') return null;

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="flex flex-col max-w-5xl mx-auto p-10 min-h-screen bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-800">User Management</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Search Sidebar */}
        <aside className="md:w-1/4 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Search Users</h2>
          <input
            type="search"
            aria-label="Search users by email"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Type user email..."
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
        </aside>

        {/* User List */}
        <section className="md:flex-1 bg-white p-6 rounded-lg shadow-sm">
          {filteredUsers.length === 0 ? (
            <p className="text-gray-600 text-center py-10">No users found matching your search.</p>
          ) : (
            <ul className="space-y-6">
              {filteredUsers.map(user => (
                <li
                  key={user.id}
                  className="flex justify-between items-center border border-gray-200 rounded-md p-4 hover:shadow-lg transition cursor-pointer"
                >
                  <Link href={`/dashboard/admin/user/${user.id}`} className="flex flex-col flex-1">
                    <span className="text-lg font-semibold text-indigo-700 hover:underline">
                      {user.email}
                    </span>
                    <span className="text-sm text-gray-500 capitalize">{user.role}</span>
                  </Link>
                  {/* Optional: Add buttons for edit/delete in the future */}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
