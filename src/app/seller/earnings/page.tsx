"use client";

import { useEffect, useState, useCallback } from "react";
import { DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, Download } from "lucide-react";

interface PayoutRecord {
  _id: string;
  orderId: string;
  grossAmount: number;
  commission: number;
  netAmount: number;
  status: "pending" | "paid" | "failed" | "processing";
  createdAt: string;
  paidAt?: string;
}

interface EarningsData {
  totalEarnings: number;
  availableBalance: number;
  pendingPayouts: number;
  totalPaid: number;
  recentPayouts: PayoutRecord[];
  monthlyBreakdown: Array<{
    month: string;
    earnings: number;
    payouts: number;
  }>;
}

export default function SellerEarningsPage() {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  const fetchEarnings = useCallback(async () => {
    console.log('fetchEarnings called with selectedPeriod:', selectedPeriod);
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/seller/earnings?period=${selectedPeriod}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setEarnings(data);
      } else {
        // Mock data for demonstration
        setEarnings({
          totalEarnings: 15420,
          availableBalance: 1250,
          pendingPayouts: 380,
          totalPaid: 13790,
          recentPayouts: [
            {
              _id: "payout_1",
              orderId: "order_12345",
              grossAmount: 1500,
              commission: 150,
              netAmount: 1350,
              status: "paid",
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              paidAt: new Date(Date.now() - 43200000).toISOString(),
            },
            {
              _id: "payout_2",
              orderId: "order_12346",
              grossAmount: 2200,
              commission: 220,
              netAmount: 1980,
              status: "pending",
              createdAt: new Date(Date.now() - 172800000).toISOString(),
            },
            {
              _id: "payout_3",
              orderId: "order_12347",
              grossAmount: 800,
              commission: 80,
              netAmount: 720,
              status: "processing",
              createdAt: new Date(Date.now() - 259200000).toISOString(),
            },
          ],
          monthlyBreakdown: [
            { month: "Dec 2024", earnings: 4200, payouts: 3780 },
            { month: "Nov 2024", earnings: 3800, payouts: 3420 },
            { month: "Oct 2024", earnings: 5100, payouts: 4590 },
            { month: "Sep 2024", earnings: 2320, payouts: 2000 },
          ],
        });
      }
    } catch (error) {
      console.error("Failed to fetch earnings:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "processing":
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Paid";
      case "pending":
        return "Pending";
      case "processing":
        return "Processing";
      case "failed":
        return "Failed";
      default:
        return status;
    }
  };

  const exportEarningsReport = () => {
    if (!earnings) return;

    const csvContent = [
      ["Earnings Report", new Date().toLocaleDateString()],
      [],
      ["Summary"],
      ["Total Earnings", earnings.totalEarnings],
      ["Available Balance", earnings.availableBalance],
      ["Pending Payouts", earnings.pendingPayouts],
      ["Total Paid", earnings.totalPaid],
      [],
      ["Recent Payouts"],
      ["Order ID", "Gross Amount", "Commission", "Net Amount", "Status", "Date"],
      ...earnings.recentPayouts.map(payout => [
        payout.orderId,
        payout.grossAmount,
        payout.commission,
        payout.netAmount,
        payout.status,
        new Date(payout.createdAt).toLocaleDateString()
      ]),
    ];

    const csv = csvContent.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `earnings-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading earnings data...</p>
        </div>
      </div>
    );
  }

  if (!earnings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Earnings</h2>
          <p className="text-gray-600">Unable to fetch your earnings data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Earnings & Payouts</h2>
            <p className="text-gray-600">Track your earnings and payout history</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <button
              onClick={exportEarningsReport}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-3xl font-bold text-green-600">฿{earnings.totalEarnings.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">After 10% commission</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Balance</p>
                <p className="text-3xl font-bold text-blue-600">฿{earnings.availableBalance.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Ready for payout</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                <p className="text-3xl font-bold text-orange-600">฿{earnings.pendingPayouts.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Being processed</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Paid Out</p>
                <p className="text-3xl font-bold text-purple-600">฿{earnings.totalPaid.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Transferred to you</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Payouts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Recent Payouts</h3>
              <p className="text-sm text-gray-600">Your latest transactions</p>
            </div>
            <div className="divide-y divide-gray-100">
              {earnings.recentPayouts.map((payout) => (
                <div key={payout._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(payout.status)}
                      <div>
                        <p className="font-medium text-gray-900">Order #{payout.orderId.slice(-6)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(payout.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">฿{payout.netAmount}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        payout.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : payout.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : payout.status === "processing"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {getStatusText(payout.status)}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    <span>Gross: ฿{payout.grossAmount} • Commission: ฿{payout.commission}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Earnings</h3>
              <p className="text-sm text-gray-600">Your earnings over time</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {earnings.monthlyBreakdown && earnings.monthlyBreakdown.length > 0 ? (
                  earnings.monthlyBreakdown.map((month, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{month.month}</p>
                        <p className="text-sm text-gray-500">Earnings: ฿{month.earnings.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-600">฿{month.payouts.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Paid out</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p>No monthly data available yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Commission Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Commission Structure</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-blue-900">Platform Fee</p>
                  <p className="text-blue-700">10% of gross sales</p>
                </div>
                <div>
                  <p className="font-medium text-blue-900">Processing Time</p>
                  <p className="text-blue-700">1-3 business days</p>
                </div>
                <div>
                  <p className="font-medium text-blue-900">Minimum Payout</p>
                  <p className="text-blue-700">฿100 (if applicable)</p>
                </div>
              </div>
              <p className="text-blue-700 mt-3 text-sm">
                You receive 90% of your sales revenue after our platform commission.
                Funds are transferred to your connected bank account or payment method.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}