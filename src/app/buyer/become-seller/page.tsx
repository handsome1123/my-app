"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BecomeSellerPage() {
  const [storeName, setStoreName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!storeName || !bankName || !accountNumber || !idNumber) {
      setMessage("Please fill all required fields.");
      return;
    }
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch("/api/buyer/apply-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ storeName, bankName, accountNumber, idNumber }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Application submitted. We'll review and notify you.");
        setTimeout(() => router.push("/buyer/profile"), 1400);
      } else {
        setMessage(data.error || "Failed to submit application.");
      }
    } catch {
      setMessage("Error submitting application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">Become a Seller</h1>
        <p className="text-sm text-gray-600 mb-6">Provide your store and bank details so we can enable seller features for your account.</p>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-gray-700">Store name *</span>
            <input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="mt-1 block w-full border rounded p-2" />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Bank name *</span>
            <input value={bankName} onChange={(e) => setBankName(e.target.value)} className="mt-1 block w-full border rounded p-2" />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Account number *</span>
            <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="mt-1 block w-full border rounded p-2" />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">National ID / Citizen ID *</span>
            <input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} className="mt-1 block w-full border rounded p-2" />
          </label>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
              {loading ? "Submitting..." : "Apply to become seller"}
            </button>
            <button type="button" onClick={() => router.push("/buyer/profile")} className="px-4 py-2 border rounded">Cancel</button>
          </div>

          {message && <div className="text-sm mt-2 text-gray-700">{message}</div>}
        </form>
      </div>
    </div>
  );
}
