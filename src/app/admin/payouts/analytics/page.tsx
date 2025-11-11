"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface PayoutAnalytics {
  totalPayouts: number;
  totalGrossAmount: number;
  totalCommission: number;
  totalNetAmount: number;
  pendingCount: number;
  paidCount: number;
  failedCount: number;
  retryingCount: number;
  averageCommissionRate: number;
  topSellersByVolume: Array<{
    sellerId: string;
    totalPaid: number;
    payoutCount: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    totalGross: number;
    totalNet: number;
    payoutCount: number;
  }>;
}

interface PerformanceMetrics {
  successRate: number;
  averageProcessingTime: number;
  failureReasons: Array<{ reason: string; count: number }>;
  retrySuccessRate: number;
}

export default function AdminPayoutAnalyticsPage() {
  const [analytics, setAnalytics] = useState<PayoutAnalytics | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const router = useRouter();

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/admin/payouts/analytics", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok) {
        setAnalytics(data.analytics);
        setPerformance(data.performance);
      } else {
        setError(data.error || "Failed to load analytics");
        if (res.status === 401) router.replace("/login");
      }
    } catch (err) {
      console.error(err);
      setError("Network error while loading analytics");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const exportData = async () => {
    setExporting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/admin/payouts/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `payout-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Failed to export data");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while exporting data");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white p-6 rounded shadow text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Payout Analytics</h1>
          <div className="flex gap-3">
            <button
              onClick={() => fetchAnalytics()}
              className="px-4 py-2 bg-white border rounded shadow-sm hover:bg-gray-50"
            >
              Refresh
            </button>
            <button
              onClick={exportData}
              disabled={exporting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </div>

        {analytics && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Total Payouts</h3>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalPayouts.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Total Gross Amount</h3>
                <p className="text-2xl font-bold text-green-600">฿{analytics.totalGrossAmount.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Total Commission</h3>
                <p className="text-2xl font-bold text-red-600">฿{analytics.totalCommission.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Total Net Amount</h3>
                <p className="text-2xl font-bold text-blue-600">฿{analytics.totalNetAmount.toLocaleString()}</p>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Payout Status Breakdown</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{analytics.pendingCount}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{analytics.paidCount}</p>
                  <p className="text-sm text-gray-600">Paid</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{analytics.failedCount}</p>
                  <p className="text-sm text-gray-600">Failed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{analytics.retryingCount}</p>
                  <p className="text-sm text-gray-600">Retrying</p>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            {performance && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Performance Metrics (Last 30 Days)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
                    <p className="text-2xl font-bold text-green-600">{performance.successRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Avg Processing Time</h3>
                    <p className="text-2xl font-bold text-blue-600">{performance.averageProcessingTime.toFixed(1)}h</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Retry Success Rate</h3>
                    <p className="text-2xl font-bold text-orange-600">{performance.retrySuccessRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Commission Rate</h3>
                    <p className="text-2xl font-bold text-red-600">{analytics.averageCommissionRate.toFixed(1)}%</p>
                  </div>
                </div>

                {performance.failureReasons.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Common Failure Reasons</h3>
                    <div className="space-y-2">
                      {performance.failureReasons.map((reason, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-sm text-gray-700 truncate max-w-xs">{reason.reason}</span>
                          <span className="text-sm font-medium">{reason.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Top Sellers */}
            {analytics.topSellersByVolume.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Top Sellers by Payout Volume</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Seller ID</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total Paid</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Payout Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topSellersByVolume.map((seller, index) => (
                        <tr key={seller.sellerId} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-4 py-2 text-sm font-mono">{seller.sellerId}</td>
                          <td className="px-4 py-2 text-sm text-right text-green-600">฿{seller.totalPaid.toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm text-right">{seller.payoutCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Monthly Trends */}
            {analytics.monthlyTrends.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Monthly Trends (Last 12 Months)</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Month</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Gross Amount</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Net Amount</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Payout Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.monthlyTrends.map((trend, index) => (
                        <tr key={trend.month} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-4 py-2 text-sm">{trend.month}</td>
                          <td className="px-4 py-2 text-sm text-right">฿{trend.totalGross.toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm text-right text-blue-600">฿{trend.totalNet.toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm text-right">{trend.payoutCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}