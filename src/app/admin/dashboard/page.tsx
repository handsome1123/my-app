"use client";
import { useEffect, useState } from "react";
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Eye,
  Plus,
  Calendar,
  Users,
  ArrowUpRight,
  ArrowDownRight,
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
  totalUsers?: number; // <-- add this
}

interface RecentOrder {
  id: string;
  customerName: string;
  product: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
}

export default function AdminDashboard() {
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [ , setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // setError("No authentication token found");
      // setLoading(false);
      // return;
      router.replace("/login");
    }

    const headers = { Authorization: `Bearer ${token}` };

    // Fetch profile, products, and orders
    const fetchProfile = fetch("/api/seller/profile", { headers });
    const fetchUsers = fetch("/api/admin/users", { headers });
    const fetchProducts = fetch("/api/admin/products", { headers });
    const fetchOrders = fetch("/api/admin/orders", { headers });

    Promise.all([fetchProfile, fetchUsers, fetchProducts, fetchOrders])
      .then(async ([profileRes, usersRes, productsRes, ordersRes]) => {
        // Profile
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }

        // Products -> use totalProducts from API
        let totalProducts = 0;
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          totalProducts = productsData.totalProducts || 0; // <-- use totalProducts
        }

        // Users -> use totalUsers from API
        let totalUsers = 0;
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          totalUsers = usersData.totalUsers || 0; // <-- use totalUsers
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
          totalUsers,
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
          totalUsers: 0,
          pendingOrders: 0,
          monthlyRevenue: 0,
          revenueChange: 0,
          ordersChange: 0,
          lowStockProducts: 0,
        });
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

  // small helper to format currency
  const fmt = (v = 0) => `฿${v.toLocaleString()}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error || "Failed to load profile"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero */}
        <header className="relative mb-8">
          <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8 shadow-2xl">
            <div className="absolute -left-20 -top-24 w-72 h-72 bg-white/6 blur-3xl rounded-full pointer-events-none"></div>
            <div className="absolute -right-20 -bottom-24 w-72 h-72 bg-white/6 blur-3xl rounded-full pointer-events-none"></div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
                  Welcome back, <span className="underline decoration-white/30">{profile.name}</span> 👋
                </h1>
                <p className="mt-2 text-blue-100 max-w-xl">
                  Snapshot of your store — revenue, products, orders and quick actions to keep things moving.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm transition">
                    <Calendar className="w-4 h-4" />
                    This Month
                  </button>
                  <button
                    onClick={() => router.push("/admin/products")}
                    className="inline-flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold shadow hover:scale-105 transform transition"
                  >
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <div className="text-right">
                  <div className="text-sm text-blue-100">Monthly Revenue</div>
                  <div className="text-2xl font-bold">{fmt(stats?.monthlyRevenue ?? 0)}</div>
                  <div className="text-xs text-blue-200 mt-1">Compared to last month</div>
                </div>

                <div className="bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm">
                  <div className="text-xs text-white/90">Account</div>
                  <div className="font-medium mt-1">{profile.name}</div>
                  <div className="text-xs text-white/80 mt-1">{profile.email}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* KPI grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-5 shadow-md hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Revenue</p>
                <div className="text-2xl font-bold text-gray-900">{fmt(stats?.totalRevenue ?? 0)}</div>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  {(stats?.revenueChange ?? 0) > 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`font-medium ${(stats?.revenueChange ?? 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(stats?.revenueChange ?? 0)}%
                  </span>
                  <span className="text-gray-400 text-sm ml-2">vs last month</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-full shadow">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-5 shadow-md hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Products</p>
                <div className="text-2xl font-bold text-gray-900">{stats?.totalProducts ?? 0}</div>
                <div className="mt-2 text-sm text-gray-500">{stats?.lowStockProducts ?? 0} low stock</div>
              </div>
              <div className="bg-white p-3 rounded-full shadow">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-5 shadow-md hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Users</p>
                <div className="text-2xl font-bold text-gray-900">{stats?.totalUsers ?? 0}</div>
                <div className="mt-2 text-sm text-gray-500">Community size</div>
              </div>
              <div className="bg-white p-3 rounded-full shadow">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-5 shadow-md hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Orders</p>
                <div className="text-2xl font-bold text-gray-900">{stats?.totalOrders ?? 0}</div>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className="text-gray-500">{stats?.pendingOrders ?? 0} pending</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-full shadow">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </section>

        {/* Main content: profile + recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity (wide) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <div className="text-sm text-gray-500">Live stream of latest orders & payments</div>
            </div>

            <div className="p-6 space-y-4">
              {/* Convert previous recentOrders rendering into compact cards (if any) */}
              {/* ...existing code for recent orders mapping replaced with compact card UI... */}
              {/* Example placeholder: */}
              <div className="grid gap-4">
                {/* Keep logic unchanged: iterate recentOrders if present */}
                {/* ...existing code... */}
              </div>
            </div>
          </div>

          {/* Profile & Quick Actions */}
          <aside className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-100 p-3 rounded-xl">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Signed in as</div>
                  <div className="font-semibold text-gray-900">{profile.name}</div>
                  <div className="text-xs text-gray-500">{profile.email}</div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Account status</span>
                  <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${profile.isVerified ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                    {profile.isVerified ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {profile.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>

                {profile.bankInfo && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500">Bank</div>
                    <div className="font-medium">{profile.bankInfo.bankName}</div>
                    <div className="text-sm text-gray-500">••••{profile.bankInfo.accountNumber.slice(-4)}</div>
                  </div>
                )}

                <button onClick={() => router.push('/admin/orders')} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:scale-[1.01] transition">
                  <Eye className="w-4 h-4" /> View Orders
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="grid gap-3">
                <button className="w-full flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow transition">
                  <div className="flex items-center gap-3">
                    <Plus className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Add Product</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </button>

                <button className="w-full flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow transition">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="font-medium">Marketing</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}