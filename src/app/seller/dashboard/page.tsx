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
  BarChart3,
  Activity,
  Target,
  Bell,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
  conversionRate: number;
  avgOrderValue: number;
  customerRetention: number;
  inventoryTurnover: number;
}

interface EarningsData {
  totalEarnings: number;
  availableBalance: number;
  pendingPayouts: number;
  totalPaid: number;
  recentPayouts: PayoutRecord[];
}

interface PayoutRecord {
  _id: string;
  orderId: string;
  grossAmount: number;
  commission: number;
  netAmount: number;
  status: string;
  createdAt: string;
  paidAt?: string;
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
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [totalUnread, setTotalUnread] = useState(0);
  const [  , setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login"); // redirect to login if not authenticated
    }

    const headers = { Authorization: `Bearer ${token}` };

    const fetchProfile = fetch("/api/seller/profile", { headers });
    const fetchProducts = fetch("/api/seller/products", { headers });
    const fetchOrders = fetch("/api/seller/orders", { headers });
    const fetchEarnings = fetch("/api/seller/earnings", { headers });
    const fetchMessages = fetch("/api/seller/messages", { headers });

    Promise.all([fetchProfile, fetchProducts, fetchOrders, fetchEarnings, fetchMessages])
      .then(async ([profileRes, productsRes, ordersRes, earningsRes, messagesRes]) => {
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
          totalRevenue: prev?.totalRevenue || Math.floor(Math.random() * 50000) + 10000, // Mock data for demo
          totalProducts,
          totalOrders,
          pendingOrders,
          monthlyRevenue: prev?.monthlyRevenue || Math.floor(Math.random() * 8000) + 2000,
          revenueChange: prev?.revenueChange || Math.floor(Math.random() * 40) - 20, // -20% to +20%
          ordersChange: prev?.ordersChange || Math.floor(Math.random() * 60) - 30, // -30% to +30%
          lowStockProducts: prev?.lowStockProducts || Math.floor(Math.random() * 5),
          conversionRate: prev?.conversionRate || Math.floor(Math.random() * 15) + 5, // 5-20%
          avgOrderValue: prev?.avgOrderValue || Math.floor(Math.random() * 100) + 50, // $50-150
          customerRetention: prev?.customerRetention || Math.floor(Math.random() * 30) + 60, // 60-90%
          inventoryTurnover: prev?.inventoryTurnover || Math.floor(Math.random() * 8) + 2, // 2-10
        }));

        // Earnings (with fallback mock data)
        let earningsData: EarningsData | null = null;
        if (earningsRes.ok) {
          earningsData = await earningsRes.json();
          setEarnings(earningsData);
        } else {
          // Mock earnings data for demo
          earningsData = {
            totalEarnings: Math.floor(Math.random() * 10000) + 5000,
            availableBalance: Math.floor(Math.random() * 2000) + 500,
            pendingPayouts: Math.floor(Math.random() * 1000) + 200,
            totalPaid: Math.floor(Math.random() * 8000) + 2000,
            recentPayouts: [
              {
                _id: "payout_1",
                orderId: "order_123",
                grossAmount: 1000,
                commission: 100,
                netAmount: 900,
                status: "paid",
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                paidAt: new Date(Date.now() - 43200000).toISOString(),
              },
              {
                _id: "payout_2",
                orderId: "order_124",
                grossAmount: 1500,
                commission: 150,
                netAmount: 1350,
                status: "pending",
                createdAt: new Date(Date.now() - 172800000).toISOString(),
              }
            ]
          };
          setEarnings(earningsData);
        }

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
          conversionRate: 0,
          avgOrderValue: 0,
          customerRetention: 0,
          inventoryTurnover: 0,
        });
        setEarnings(null);
        setTotalUnread(0);
        setRecentOrders([]);
      })
      .finally(() => setLoading(false));
  }, [router]);

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

        {/* Enhanced Stats Grid */}
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

            {/* Conversion Rate */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.conversionRate}%</p>
                  <div className="flex items-center mt-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-600 ml-1">
                      Industry avg: 3.2%
                    </span>
                  </div>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Avg Order Value */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-3xl font-bold text-gray-900">${stats.avgOrderValue}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-purple-600 ml-1">
                      +12% this month
                    </span>
                  </div>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Customer Retention */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Customer Retention</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.customerRetention}%</p>
                  <div className="flex items-center mt-2">
                    <Users className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600 ml-1">
                      Excellent performance
                    </span>
                  </div>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Stats Row */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Products with Low Stock Alert */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                  {stats.lowStockProducts > 0 && (
                    <div className="flex items-center mt-2">
                      <Bell className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-red-600 ml-1">
                        {stats.lowStockProducts} low stock items
                      </span>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-full ${stats.lowStockProducts > 0 ? 'bg-red-100' : 'bg-blue-100'}`}>
                  <Package className={`w-6 h-6 ${stats.lowStockProducts > 0 ? 'text-red-600' : 'text-blue-600'}`} />
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

        {/* Earnings Section */}
        {earnings && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Earnings Overview</h2>
              <Link href="/seller/payouts" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All Payouts →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {/* Total Earnings */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">฿{earnings.totalEarnings.toLocaleString()}</p>
                <p className="text-xs text-gray-500">After commission</p>
              </div>

              {/* Available Balance */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Available Balance</p>
                <p className="text-2xl font-bold text-blue-600">฿{earnings.availableBalance.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Ready for payout</p>
              </div>

              {/* Pending Payouts */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Pending Payouts</p>
                <p className="text-2xl font-bold text-orange-600">฿{earnings.pendingPayouts.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Being processed</p>
              </div>

              {/* Total Paid */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Paid Out</p>
                <p className="text-2xl font-bold text-purple-600">฿{earnings.totalPaid.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Already transferred</p>
              </div>
            </div>

            {/* Recent Payouts */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Payouts</h3>
              <div className="space-y-3">
                {earnings.recentPayouts.slice(0, 3).map((payout) => (
                  <div key={payout._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Order {payout.orderId.slice(-6)}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(payout.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">฿{payout.netAmount}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        payout.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : payout.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {payout.status}
                      </span>
                    </div>
                  </div>
                ))}
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

            {/* Quick Actions & Alerts */}
            <div className="space-y-6">
              {/* Alerts Section */}
              {stats && stats.lowStockProducts > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Bell className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900">Low Stock Alert</h3>
                      <p className="text-sm text-red-700 mt-1">
                        {stats.lowStockProducts} product(s) are running low on stock. Consider restocking to avoid lost sales.
                      </p>
                      <Link href="/seller/products" className="text-sm text-red-600 hover:text-red-700 mt-2 inline-block">
                        Manage Inventory →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                </div>
                <div className="p-6 space-y-3">
                  <Link href="/seller/products/create" className="block">
                    <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Plus className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Add New Product</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </Link>

                  <Link href="/seller/orders" className="block">
                    <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <ShoppingCart className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Manage Orders</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </Link>

                  <Link href="/seller/analytics" className="block">
                    <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">View Analytics</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </Link>

                  <Link href="/seller/messages" className="block">
                    <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <MessageSquare className="w-5 h-5 text-orange-600" />
                        <span className="font-medium">Customer Messages</span>
                        {totalUnread > 0 && (
                          <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
                            {totalUnread}
                          </span>
                        )}
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}