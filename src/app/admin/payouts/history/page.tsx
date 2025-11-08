"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Payout = {
  _id: string;
  orderId: string;
  sellerId: string;
  grossAmount: number;
  commission: number;
  netAmount: number;
  currency?: string;
  status: "paid" | "failed" | string;
  createdAt: string;
  paidAt?: string;
  providerId?: string;
  processedBy?: string;
};

export default function AdminPayoutsHistoryPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"paid" | "failed">("paid");
  const [query, setQuery] = useState("");
  const router = useRouter();

  const fetchPayouts = async (status: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`/api/admin/payouts?status=${encodeURIComponent(status)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok) {
        setPayouts(Array.isArray(data.payouts) ? data.payouts : []);
      } else {
        setError(data.error || "Failed to fetch payouts");
        if (res.status === 401) router.replace("/login");
      }
    } catch (err) {
      console.error(err);
      setError("Network error while fetching payouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return payouts;
    return payouts.filter(
      (p) =>
        p.orderId?.toLowerCase().includes(q) ||
        p.sellerId?.toLowerCase().includes(q) ||
        String(p.providerId || "").toLowerCase().includes(q)
    );
  }, [payouts, query]);

  const exportCSV = () => {
    const rows = [
      [
        "Payout ID",
        "Order ID",
        "Seller ID",
        "Gross",
        "Commission",
        "Net",
        "Currency",
        "Status",
        "Requested At",
        "Paid At",
        "Provider ID",
        "Processed By",
      ],
      ...filtered.map((p) => [
        p._id,
        p.orderId,
        p.sellerId,
        String(p.grossAmount),
        String(p.commission),
        String(p.netAmount),
        p.currency || "THB",
        p.status,
        p.createdAt,
        p.paidAt || "",
        p.providerId || "",
        p.processedBy || "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payouts_${statusFilter}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Payout History</h1>
          <div className="flex items-center gap-3">
            <Link href="/admin/payouts" className="px-3 py-2 bg-white border rounded shadow-sm hover:bg-gray-50">Pending</Link>
            <button
              onClick={() => fetchPayouts(statusFilter)}
              className="px-3 py-2 bg-white border rounded shadow-sm hover:bg-gray-50"
            >
              Refresh
            </button>
            <button
              onClick={exportCSV}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-3 items-center">
          <div className="inline-flex rounded overflow-hidden border bg-white">
            <button
              className={`px-3 py-2 ${statusFilter === "paid" ? "bg-blue-600 text-white" : "text-gray-700"}`}
              onClick={() => setStatusFilter("paid")}
            >
              Paid
            </button>
            <button
              className={`px-3 py-2 ${statusFilter === "failed" ? "bg-blue-600 text-white" : "text-gray-700"}`}
              onClick={() => setStatusFilter("failed")}
            >
              Failed
            </button>
          </div>

          <div className="relative flex-1 max-w-md">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by order, seller or provider id..."
              className="w-full pl-4 pr-4 py-2 border rounded-lg"
              aria-label="Search payouts"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-white rounded shadow animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="bg-white p-6 rounded shadow text-red-600">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white p-6 rounded shadow text-center">No payouts found for current filter.</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Payout ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Seller</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">Gross</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">Net</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Provider ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Paid At</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Processed By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{p._id}</td>
                    <td className="px-4 py-3 text-sm text-blue-600"><Link href={`/admin/orders/${p.orderId}`}>{p.orderId}</Link></td>
                    <td className="px-4 py-3 text-sm text-gray-700">{p.sellerId}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-800">฿{Number(p.grossAmount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right text-green-700">฿{Number(p.netAmount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 break-all">{p.providerId || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.paidAt ? new Date(p.paidAt).toLocaleString() : "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.processedBy || "—"}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        p.status === "paid" ? "bg-green-100 text-green-800" : p.status === "failed" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-700"
                      }`}>{p.status}</span>
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
