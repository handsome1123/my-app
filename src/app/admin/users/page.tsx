"use client";

import { useEffect, useState } from "react";
import { 
  User,
  Search,
  Mail,
  Calendar,
  Trash2,
  Phone,
  Plus,
  RefreshCcw,
  UserCheck
} from "lucide-react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  status?: 'active' | 'inactive' | 'pending';
  createdAt: string;
  phone?: string;
}


export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Track deleting state

  useEffect(() => {
    async function fetchUsers() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
      }
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users || data);
        } else {
          setError(data.error || "Failed to fetch users");
        }
      } catch {
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [router]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: updatedUser.role } : u))
        );
      } else {
        console.error("Failed to update role");
      }
    } catch (err) {
      console.error("Error updating role", err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!userId) return;

    setIsDeleting(userId);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        alert("User deleted successfully.");
      } else {
        const data = await res.json();
        switch (res.status) {
          case 401:
            alert("Unauthorized: Please log in again.");
            router.replace("/login");
            break;
          case 403:
            alert("Unauthorized: Admin access required.");
            break;
          case 404:
            alert("User not found.");
            break;
          default:
            alert(data.error || "Failed to delete user.");
        }
      }
    } catch (err) {
      console.error(`Error deleting user ${userId}:`, err);
      alert("Error deleting user. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse p-4 border rounded-lg bg-white">
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                  <p className="text-sm text-gray-500">Manage platform users and roles</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => { setLoading(true); setTimeout(() => window.location.reload(), 200); }}
                title="Refresh"
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              >
                <RefreshCcw className="w-5 h-5" />
              </button>

              <button
                onClick={() => router.push('/admin/users/create')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
              >
                <Plus className="w-4 h-4" />
                Invite
              </button>
            </div>
          </div>

          {/* small stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <div className="text-xs text-gray-500">Total users</div>
              <div className="text-lg font-bold text-gray-900">{users.length}</div>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <div className="text-xs text-gray-500">Active</div>
              <div className="text-lg font-bold text-green-600">{users.filter(u => u.status === 'active').length}</div>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <div className="text-xs text-gray-500">Pending</div>
              <div className="text-lg font-bold text-yellow-600">{users.filter(u => u.status === 'pending').length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* quick role pills for faster filtering */}
            {['all', 'buyer', 'seller', 'admin'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${roleFilter === r ? 'bg-blue-600 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                aria-pressed={roleFilter === r}
              >
                {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
            <button
              onClick={() => { setSearchTerm(''); setRoleFilter('all'); }}
              className="px-3 py-2 rounded-lg text-sm bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">
              {searchTerm || roleFilter !== "all"
                ? "No results. Try different filters or clear search."
                : "There are no users yet. Invite new users to get started."}
            </p>
            <div className="mt-6 inline-flex gap-3">
              <button
                onClick={() => router.push('/admin/users/create')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <Plus className="w-4 h-4" /> Invite User
              </button>
              <button
                onClick={() => { setSearchTerm(''); setRoleFilter('all'); }}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
              >
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label={`Change role for ${user.name}`}
                      >
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                        user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Active'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.phone ? (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {user.phone}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => { if(confirm(`Make ${user.name} contact verified?`)) {/* placeholder action */} }}
                          className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition"
                          title="Mark verified"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                          title="Delete user"
                          disabled={isDeleting === user._id}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}