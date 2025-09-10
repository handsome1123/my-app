'use client';

import React, { useState } from 'react';

export default function AddBankInfo() {
  const [promptpayId, setPromptpayId] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Payment information saved! (frontend only)');
  };

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
