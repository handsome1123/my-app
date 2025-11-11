"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/*
  Admin page to list payouts and call processing endpoint.
  Requires admin to be logged in and token stored in localStorage as "token".
*/

type Payout = {
  _id: string;
  orderId: string;
  sellerId: string;
  grossAmount: number;
  commission: number;
  netAmount: number;
  currency?: string;
  status: "pending" | "paid" | "failed";
  createdAt: string;
  providerId?: string;
};

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAll, setProcessingAll] = useState(false);
  const router = useRouter();

  const fetchPayouts = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`/api/admin/payouts?status=pending&includeRetrying=true`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok) {
        setPayouts(Array.isArray(data.payouts) ? data.payouts : []);
      } else {
        setError(data.error || "Failed to load payouts");
        if (res.status === 401) router.replace("/login");
      }
    } catch (err) {
      console.error(err);
      setError("Network error while loading payouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processPayout = async (payoutId: string) => {
    if (!confirm("Process this payout? This will attempt to transfer funds to seller's account.")) return;
    setProcessingId(payoutId);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/admin/payouts/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ payoutId }),
      });
      const data = await res.json();
      if (res.ok) {
        // update local list
        setPayouts((prev) => prev.map(p => p._id === payoutId ? { ...p, status: "paid", providerId: data.transferId || data.providerId } : p));
      } else {
        alert(data.error || "Failed to process payout");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while processing payout");
    } finally {
      setProcessingId(null);
    }
  };

  const processAll = async () => {
    if (!confirm("Process all pending payouts?")) return;
    setProcessingAll(true);
    try {
      // process sequentially to avoid rate/balance issues
      for (const p of payouts) {
        await processPayout(p._id);
      }
      // reload to reflect latest statuses
      await fetchPayouts();
    } finally {
      setProcessingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Pending Payouts</h1>
          <div className="flex items-center gap-3">
            <Link href="/admin/payouts/analytics" className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Analytics
            </Link>
            <Link href="/admin/payouts/history" className="px-3 py-2 bg-white border rounded shadow-sm hover:bg-gray-50">
              History
            </Link>
            <button
              onClick={() => fetchPayouts()}
              className="px-3 py-2 bg-white border rounded shadow-sm hover:bg-gray-50"
            >
              Refresh
            </button>
            <button
              onClick={processAll}
              disabled={processingAll || payouts.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              {processingAll ? "Processing..." : `Process All (${payouts.length})`}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse h-28" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white p-6 rounded shadow text-red-600">{error}</div>
        ) : payouts.length === 0 ? (
          <div className="bg-white p-6 rounded shadow text-center">
            No pending payouts found.
            <div className="mt-3">
              <Link href="/admin/dashboard" className="text-blue-600">Back to dashboard</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {payouts.map((p) => (
              <div key={p._id} className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Order</div>
                      <div className="font-medium">#{p.orderId}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Seller</div>
                      <div className="font-medium">{p.sellerId}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Gross</div>
                      <div className="font-medium">฿{Number(p.grossAmount).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Commission</div>
                      <div className="font-medium">฿{Number(p.commission).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Net</div>
                      <div className="text-lg font-bold text-green-700">฿{Number(p.netAmount).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 mt-2">Requested: {new Date(p.createdAt).toLocaleString()}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm px-3 py-1 rounded-full bg-yellow-50 text-yellow-800">{p.status}</div>
                  <button
                    onClick={() => processPayout(p._id)}
                    disabled={processingId === p._id}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
                  >
                    {processingId === p._id ? "Processing..." : "Process"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
