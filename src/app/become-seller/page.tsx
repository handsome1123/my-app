'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AddBankInfo() {
  const [promptpayId, setPromptpayId] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch seller payment info
  useEffect(() => {
    const fetchPaymentInfo = async () => {
      setLoading(true);
      setError(null);

      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      if (!userId) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('seller_payment_info') // your payment info table
        .select('promptpay_id, bank_name, account_number, account_name')
        .eq('seller_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        setError(error.message);
      } else if (data) {
        setPromptpayId(data.promptpay_id || '');
        setBankName(data.bank_name || '');
        setAccountNumber(data.account_number || '');
        setAccountName(data.account_name || '');
      }

      setLoading(false);
    };

    fetchPaymentInfo();
  }, []);

  // Save or update payment info
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    if (!userId) {
      setError('Not authenticated');
      return;
    }

    const { error } = await supabase
      .from('seller_payment_info')
      .upsert(
        {
          seller_id: userId,
          promptpay_id: promptpayId,
          bank_name: bankName,
          account_number: accountNumber,
          account_name: accountName,
        },
        { onConflict: 'seller_id' }
      );

    if (error) {
      setError(error.message);
    } else {
      alert('Payment information saved!');
    }
  };

  if (loading) return <p className="p-6">Loading payment info...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Payment Information</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* PromptPay ID */}
        <div>
          <label className="block mb-1 font-semibold">PromptPay ID</label>
          <input
            type="text"
            placeholder="Phone number or PromptPay ID"
            value={promptpayId}
            onChange={(e) => setPromptpayId(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        {/* Bank Name */}
        <div>
          <label className="block mb-1 font-semibold">Bank Name</label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        {/* Account Number */}
        <div>
          <label className="block mb-1 font-semibold">Account Number</label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        {/* Account Name */}
        <div>
          <label className="block mb-1 font-semibold">Account Name</label>
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
        >
          Save Payment Info
        </button>
      </form>
    </main>
  );
}
