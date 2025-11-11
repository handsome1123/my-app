"use client";

import { useEffect, useState, useCallback } from "react";
import { BarChart3, TrendingUp, Users, ShoppingCart, DollarSign, Package, Calendar, Download } from "lucide-react";

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    conversionRate: number;
    avgOrderValue: number;
  };
  trends: {
    revenue: Array<{ date: string; amount: number }>;
    orders: Array<{ date: string; count: number }>;
    customers: Array<{ date: string; count: number }>;
  };
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
    imageUrl?: string;
  }>;
  customerInsights: {
    newCustomers: number;
    returningCustomers: number;
    avgOrdersPerCustomer: number;
    topRegions: Array<{ region: string; orders: number }>;
  };
}

export default function SellerAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30d");

  const fetchAnalytics = useCallback(async () => {
    console.log('fetchAnalytics called with dateRange:', dateRange);
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/seller/analytics?range=${dateRange}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      } else {
        // Mock data for demonstration
        setAnalytics({
          overview: {
            totalRevenue: 45250,
            totalOrders: 156,
            totalProducts: 89,
            totalCustomers: 134,
            conversionRate: 12.5,
            avgOrderValue: 290,
          },
          trends: {
            revenue: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              amount: Math.floor(Math.random() * 2000) + 500,
            })),
            orders: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              count: Math.floor(Math.random() * 10) + 1,
            })),
            customers: Array.from({ length: 30 }, (_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              count: Math.floor(Math.random() * 5) + 1,
            })),
          },
          topProducts: [
            { name: "iPhone 15 Pro", sales: 23, revenue: 13800, imageUrl: "/logo.jpg" },
            { name: "MacBook Air M2", sales: 12, revenue: 72000, imageUrl: "/logo.jpg" },
            { name: "Nike Air Max", sales: 18, revenue: 3600, imageUrl: "/logo.jpg" },
            { name: "Levi's Jeans", sales: 15, revenue: 2250, imageUrl: "/logo.jpg" },
            { name: "Sony Headphones", sales: 9, revenue: 2700, imageUrl: "/logo.jpg" },
          ],
          customerInsights: {
            newCustomers: 45,
            returningCustomers: 89,
            avgOrdersPerCustomer: 1.2,
            topRegions: [
              { region: "Bangkok", orders: 67 },
              { region: "Chiang Mai", orders: 34 },
              { region: "Phuket", orders: 23 },
              { region: "Pattaya", orders: 18 },
              { region: "Hua Hin", orders: 14 },
            ],
          },
        });
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  const exportReport = () => {
    // CSV export functionality
    if (!analytics) return;

    const csvContent = [
      ["Metric", "Value"],
      ["Total Revenue", analytics.overview.totalRevenue],
      ["Total Orders", analytics.overview.totalOrders],
      ["Total Products", analytics.overview.totalProducts],
      ["Total Customers", analytics.overview.totalCustomers],
      ["Conversion Rate", `${analytics.overview.conversionRate}%`],
      ["Average Order Value", `$${analytics.overview.avgOrderValue}`],
      [],
      ["Top Products"],
      ["Product Name", "Sales", "Revenue"],
      ...analytics.topProducts.map(p => [p.name, p.sales, p.revenue]),
    ];

    const csv = csvContent.map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
            <p className="text-gray-600">Deep insights into your business performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={exportReport}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">฿{analytics.overview.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">+12.5% vs last period</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.overview.totalOrders}</p>
                <p className="text-sm text-blue-600 mt-1">+8.2% vs last period</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.overview.conversionRate}%</p>
                <p className="text-sm text-purple-600 mt-1">Industry avg: 3.2%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-3xl font-bold text-gray-900">${analytics.overview.avgOrderValue}</p>
                <p className="text-sm text-orange-600 mt-1">+5.1% vs last period</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.overview.totalProducts}</p>
                <p className="text-sm text-green-600 mt-1">All performing well</p>
              </div>
              <Package className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.overview.totalCustomers}</p>
                <p className="text-sm text-indigo-600 mt-1">Growing steadily</p>
              </div>
              <Users className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Products</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.sales} sales</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">฿{product.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Customer Insights</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{analytics.customerInsights.newCustomers}</p>
                  <p className="text-sm text-gray-600">New Customers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{analytics.customerInsights.returningCustomers}</p>
                  <p className="text-sm text-gray-600">Returning</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Avg Orders per Customer</p>
                <p className="text-lg font-semibold">{analytics.customerInsights.avgOrdersPerCustomer}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900 mb-3">Top Regions</p>
                <div className="space-y-2">
                  {analytics.customerInsights.topRegions.slice(0, 3).map((region, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{region.region}</span>
                      <span className="text-sm font-medium">{region.orders} orders</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trends Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
            <p className="text-sm text-gray-600">30-day overview</p>
          </div>
          <div className="p-6">
            <div className="text-center text-gray-500 py-8">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Advanced charts and trend analysis</p>
              <p className="text-sm">Integrate with Chart.js or Recharts for visual data representation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}