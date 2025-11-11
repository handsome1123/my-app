"use client";

import { useEffect, useState, useCallback } from "react";
import {
  User,
  Search,
  Mail,
  Calendar,
  Trash2,
  Phone,
  Plus,
  RefreshCcw,
  UserCheck,
  Shield,
  ShieldOff,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Filter,
  Users as UsersIcon,
  Store,
  Crown
} from "lucide-react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin' | 'suspended';
  isVerified: boolean;
  createdAt: string;
  phone?: string;
}

interface UserStats {
  total: number;
  buyers: number;
  sellers: number;
  admins: number;
  verified: number;
  unverified: number;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}


export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const fetchUsers = useCallback(async (page: number = 1) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20"
      });

      if (roleFilter !== "all") params.append("role", roleFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());

      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
        setStats(data.stats);
        setPagination(data.pagination);
      } else {
        setError(data.error || "Failed to fetch users");
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [router, roleFilter, statusFilter, searchTerm]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchUsers(1);
  }, [roleFilter, statusFilter, fetchUsers]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchUsers(1);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, fetchUsers]);

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u._id)));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.size === 0) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userIds: Array.from(selectedUsers),
          action: bulkAction
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`${data.modifiedCount} users updated`);
        setSelectedUsers(new Set());
        setBulkAction("");
        fetchUsers(pagination?.page || 1);
      } else {
        alert(data.error || "Bulk action failed");
      }
    } catch (err) {
      console.error("Bulk action error:", err);
      alert("Bulk action failed");
    }
  };

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

          {/* Enhanced stats */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 mt-6">
              <div className="bg-white border border-gray-100 rounded-lg p-4">
                <div className="text-xs text-gray-500">Total Users</div>
                <div className="text-lg font-bold text-gray-900">{stats.total.toLocaleString()}</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-lg p-4">
                <div className="text-xs text-gray-500">Buyers</div>
                <div className="text-lg font-bold text-blue-600">{stats.buyers.toLocaleString()}</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-lg p-4">
                <div className="text-xs text-gray-500">Sellers</div>
                <div className="text-lg font-bold text-green-600">{stats.sellers.toLocaleString()}</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-lg p-4">
                <div className="text-xs text-gray-500">Admins</div>
                <div className="text-lg font-bold text-purple-600">{stats.admins.toLocaleString()}</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-lg p-4">
                <div className="text-xs text-gray-500">Verified</div>
                <div className="text-lg font-bold text-emerald-600">{stats.verified.toLocaleString()}</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-lg p-4">
                <div className="text-xs text-gray-500">Unverified</div>
                <div className="text-lg font-bold text-orange-600">{stats.unverified.toLocaleString()}</div>
              </div>
            </div>
          )}
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

          <div className="flex flex-wrap items-center gap-3">
            {/* Role filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Role:</span>
              {['all', 'buyer', 'seller', 'admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    roleFilter === r
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                  aria-pressed={roleFilter === r}
                >
                  {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              {['all', 'verified', 'unverified'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    statusFilter === s
                      ? 'bg-green-600 text-white shadow'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                  aria-pressed={statusFilter === s}
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setStatusFilter('all');
                setSelectedUsers(new Set());
              }}
              className="px-3 py-2 rounded-lg text-sm bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
            >
              Clear Filters
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
          <div className="space-y-4">
            {/* Bulk Actions Bar */}
            {selectedUsers.size > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">
                    {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center gap-3">
                    <select
                      value={bulkAction}
                      onChange={(e) => setBulkAction(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Choose action...</option>
                      <option value="verify">Verify Users</option>
                      <option value="unverify">Unverify Users</option>
                      <option value="promote_to_admin">Promote to Admin</option>
                      <option value="demote_to_buyer">Demote to Buyer</option>
                      <option value="suspend">Suspend Users</option>
                      <option value="activate">Activate Users</option>
                    </select>
                    <button
                      onClick={handleBulkAction}
                      disabled={!bulkAction}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Apply Action
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === users.length && users.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Select All ({users.length} users)
                    </span>
                  </div>
                  {pagination && (
                    <div className="text-sm text-gray-500">
                      Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                    </div>
                  )}
                </div>
              </div>

              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-12 px-6 py-3"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user._id)}
                          onChange={() => handleSelectUser(user._id)}
                          className="rounded border-gray-300"
                        />
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                            user.role === 'admin' ? 'bg-purple-100' :
                            user.role === 'seller' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            {user.role === 'admin' ? <Crown className="h-5 w-5 text-purple-600" /> :
                             user.role === 'seller' ? <Store className="h-5 w-5 text-green-600" /> :
                             <UsersIcon className="h-5 w-5 text-blue-600" />}
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
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label={`Change role for ${user.name}`}
                        >
                          <option value="buyer">Buyer</option>
                          <option value="seller">Seller</option>
                          <option value="admin">Admin</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.isVerified ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isVerified ? 'bg-green-100 text-green-800' :
                            user.role === 'suspended' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.isVerified ? 'Verified' :
                             user.role === 'suspended' ? 'Suspended' : 'Unverified'}
                          </span>
                        </div>
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
                          {!user.isVerified && (
                            <button
                              onClick={() => handleRoleChange(user._id, 'verify')}
                              className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition"
                              title="Verify user"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => router.push(`/admin/users/${user._id}`)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchUsers(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600 px-3">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => fetchUsers(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                      className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}