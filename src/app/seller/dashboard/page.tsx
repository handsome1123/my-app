"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  Calendar,
  CreditCard,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface BankInfo {
  bankName: string;
  accountNumber: string;
}

interface SellerProfile {
  name: string;
  email: string;
  isVerified: boolean;
  bankInfo?: BankInfo;
}

interface DashboardStats {
  totalRevenue: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  monthlyRevenue: number;
  revenueChange: number;
  ordersChange: number;
  lowStockProducts: number;
}

interface RecentOrder {
  id: string;
  customerName: string;
  product: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
}

export default function SellerHome() {
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [  , setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    const fetchProfile = fetch("/api/seller/profile", { headers });
    const fetchProducts = fetch("/api/seller/products", { headers });
    const fetchOrders = fetch("/api/seller/orders", { headers });

    Promise.all([fetchProfile, fetchProducts, fetchOrders])
      .then(async ([profileRes, productsRes, ordersRes]) => {
        // Profile
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }

        // Products -> only use count
        let totalProducts = 0;
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          totalProducts = productsData.count || 0;
        }

        // Orders -> use count and recent orders
        let totalOrders = 0;
        let pendingOrders = 0;
        let recentOrdersData: RecentOrder[] = [];
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          totalOrders = ordersData.count || 0;
          recentOrdersData = ordersData.orders || [];
          
          // Properly type each order
          pendingOrders = (ordersData.orders as RecentOrder[] | undefined)?.filter(
            (o) => o.status === "pending"
          ).length || 0;
        }

        setStats((prev) => ({
          totalRevenue: prev?.totalRevenue || 0, // keep previous or calculate later
          totalProducts,
          totalOrders,
          pendingOrders,
          monthlyRevenue: prev?.monthlyRevenue || 0,
          revenueChange: prev?.revenueChange || 0,
          ordersChange: prev?.ordersChange || 0,
          lowStockProducts: prev?.lowStockProducts || 0,
        }));

        setRecentOrders(recentOrdersData);
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data");
        setStats({
          totalRevenue: 0,
          totalProducts: 0,
          totalOrders: 0,
          pendingOrders: 0,
          monthlyRevenue: 0,
          revenueChange: 0,
          ordersChange: 0,
          lowStockProducts: 0,
        });
        setRecentOrders([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // const getStatusBadge = (status: string) => {
  //   const badges = {
  //     pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  //     completed: "bg-green-100 text-green-800 border-green-200",
  //     cancelled: "bg-red-100 text-red-800 border-red-200"
  //   };
  //   return badges[status as keyof typeof badges] || badges.pending;
  // };

  // const getStatusIcon = (status: string) => {
  //   switch (status) {
  //     case 'completed': return <CheckCircle className="w-4 h-4" />;
  //     case 'cancelled': return <XCircle className="w-4 h-4" />;
  //     default: return <AlertTriangle className="w-4 h-4" />;
  //   }
  // };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error || "Failed to load profile"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {profile.name}! 👋
              </h1>
              <p className="text-gray-600">Here&apos;s what&apos;s happening with your store today</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <Calendar className="w-4 h-4 mr-2" />
                This Month
              </button>
              <Link href="/seller/products/create">
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </button>
              </Link>
            </div>
          </div>

          {/* Verification Status */}
          {!profile.isVerified && (
            <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Account verification required.</strong> Complete your profile to start selling.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">฿{stats.totalRevenue.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    {stats.revenueChange > 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${stats.revenueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(stats.revenueChange)}%
                    </span>
                    <span className="text-gray-500 text-sm ml-1">vs last month</span>
                  </div>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Total Products */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {stats.lowStockProducts} low stock items
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                  <div className="flex items-center mt-2">
                    {stats.ordersChange > 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${stats.ordersChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(stats.ordersChange)}%
                    </span>
                    <span className="text-gray-500 text-sm ml-1">vs last month</span>
                  </div>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <ShoppingCart className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Pending Orders */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
                  <p className="text-sm text-orange-600 mt-2">Requires attention</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          {/* <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View all
                  </button>
                </div>
              </div>
              <div className="p-6">
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {getStatusIcon(order.status)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{order.product}</p>
                            <p className="text-sm text-gray-500">Customer: {order.customerName}</p>
                            <p className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${order.amount}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent orders</p>
                  </div>
                )}
              </div>
            </div>
          </div> */}

          {/* Profile & Quick Actions */}
          <div className="space-y-6">
            {/* Profile Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{profile.name}</p>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Account Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    profile.isVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.isVerified ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 mr-1" />
                        Unverified
                      </>
                    )}
                  </span>
                </div>

                {profile.bankInfo && (
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-3 mb-3">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">Bank Information</span>
                    </div>
                    <div className="space-y-2 ml-8">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Bank:</span> {profile.bankInfo.bankName}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Account:</span> ****{profile.bankInfo.accountNumber.slice(-4)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Plus className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Add New Product</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </button>
                
                <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Eye className="w-5 h-5 text-green-600" />
                    <span className="font-medium">View Analytics</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </button>
                
                <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Marketing Tools</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}