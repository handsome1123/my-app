"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Refund = {
  id: string;
  orderId: string;
  amount: number;
  currency?: string;
  reason: string;
  details?: string;
  evidenceUrls?: string[];
  status: string;
  requestedAt: string;
  updatedAt?: string;
};

export default function BuyerRefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRefunds = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/buyer/refunds", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok) {
        setRefunds(Array.isArray(data.refunds) ? data.refunds : []);
      } else {
        setError(data.error || "Failed to load refunds");
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow p-6 text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchRefunds} className="px-4 py-2 bg-blue-600 text-white rounded">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Refund Requests</h1>
          <div className="text-sm text-gray-500">{refunds.length} {refunds.length === 1 ? "request" : "requests"}</div>
        </div>

        {refunds.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-700">You have not requested any refunds yet.</p>
            <div className="mt-4">
              <Link href="/buyer/orders" className="px-4 py-2 bg-blue-600 text-white rounded">View Orders</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {refunds.map((r) => (
              <div key={r.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Order</div>
                        <Link href={`/buyer/orders/${r.orderId}`} className="font-medium text-blue-600">{r.orderId}</Link>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500">Amount</div>
                        <div className="font-semibold">฿{Number(r.amount).toLocaleString()} {r.currency ?? "THB"}</div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500">Reason</div>
                        <div className="text-sm text-gray-700">{r.reason}</div>
                      </div>
                    </div>

                    {r.details && (
                      <div className="mt-3 text-sm text-gray-600">
                        {r.details}
                      </div>
                    )}

                    {r.evidenceUrls && r.evidenceUrls.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-3">
                        {r.evidenceUrls.map((u, i) => (
                          <a key={i} href={u} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">Evidence {i+1}</a>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      r.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      r.status === "under_review" ? "bg-blue-100 text-blue-800" :
                      r.status === "approved" ? "bg-green-100 text-green-800" :
                      r.status === "rejected" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {r.status.replace("_", " ")}
                    </div>

                    <div className="text-xs text-gray-400 mt-2">
                      Requested: {new Date(r.requestedAt).toLocaleString()}
                    </div>
                    {r.updatedAt && (
                      <div className="text-xs text-gray-400">Updated: {new Date(r.updatedAt).toLocaleString()}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
