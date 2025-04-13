'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faMoneyBillWave, faCalendarAlt, faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons'; // Import more icons as needed

const PayoutCard = ({ payout }) => (
  <div className="bg-white rounded-md shadow-sm p-4 mb-4">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-500" />
        <h3 className="text-sm font-semibold text-gray-800">Payout #{payout.id}</h3>
      </div>
      <span className="text-gray-600 text-xs">{payout.date}</span>
    </div>
    <div className="flex items-center justify-between">
      <p className="text-gray-700 text-sm">Amount:</p>
      <span className="text-green-600 font-semibold text-lg">${payout.amount.toFixed(2)}</span>
    </div>
    <p className="text-gray-500 text-xs mt-1">Status: <span className={`font-semibold ${payout.status === 'Paid' ? 'text-green-500' : 'text-yellow-500'}`}>{payout.status}</span></p>
    {payout.paymentMethod && <p className="text-gray-500 text-xs">Method: {payout.paymentMethod}</p>}
  </div>
);

const TransactionRow = ({ transaction }) => (
  <div className="bg-white rounded-md shadow-sm p-3 mb-2 flex items-center text-sm">
    <div className="flex-grow">
      <h3 className="font-semibold text-gray-800">{transaction.description}</h3>
      <p className="text-gray-600 text-xs">{transaction.date}</p>
    </div>
    <span className={`font-semibold ${transaction.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
      ${transaction.amount.toFixed(2)}
    </span>
  </div>
);

export default function SellerPayouts() {
  // Dummy payout data
  const payouts = [
    { id: 'PYT001', date: '2025-04-10', amount: 125.50, status: 'Paid', paymentMethod: 'Bank Transfer' },
    { id: 'PYT002', date: '2025-04-03', amount: 88.75, status: 'Paid', paymentMethod: 'PayPal' },
    { id: 'PYT003', date: '2025-03-27', amount: 150.00, status: 'Paid', paymentMethod: 'Stripe' },
    { id: 'PYT004', date: '2025-04-17', amount: 92.20, status: 'Pending', paymentMethod: 'Bank Transfer' },
  ];

  // Dummy transaction data
  const transactions = [
    { description: 'Order #1001 - Product A', date: '2025-04-13', amount: 35.99, type: 'Credit' },
    { description: 'Order #1002 - Product B', date: '2025-04-13', amount: 52.50, type: 'Credit' },
    { description: 'Shipping Fee Adjustment', date: '2025-04-12', amount: 5.00, type: 'Debit' },
    { description: 'Payout #PYT001', date: '2025-04-10', amount: 125.50, type: 'Debit' },
    { description: 'Order #1003 - Product C', date: '2025-04-09', amount: 78.20, type: 'Credit' },
  ];

  return (
    <div className="bg-gray-100 min-h-screen flex">

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Payouts & Transactions</h1>
          {/* Optional: Date range picker or other controls */}
        </header>

        {/* Payouts Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Recent Payouts</h2>
          {payouts.length > 0 ? (
            payouts.map((payout) => (
              <PayoutCard key={payout.id} payout={payout} />
            ))
          ) : (
            <p className="text-gray-500 text-sm">No recent payouts.</p>
          )}
          {/* Optional: Link to view all payouts */}
          {payouts.length > 3 && (
            <Link href="/payouts/all" className="text-blue-500 hover:underline text-sm">View All Payouts</Link>
          )}
        </section>

        {/* Transactions Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Recent Transactions</h2>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TransactionRow key={transaction.description + transaction.date} transaction={transaction} />
            ))
          ) : (
            <p className="text-gray-500 text-sm">No recent transactions.</p>
          )}
          {/* Optional: Link to view all transactions and filter options */}
          {transactions.length > 5 && (
            <div className="flex items-center justify-between mt-3">
              <Link href="/transactions/all" className="text-blue-500 hover:underline text-sm">View All Transactions</Link>
              {/* Optional: Filter by date, type etc. */}
              {/* <button className="text-gray-700 hover:underline text-sm">Filter Transactions</button> */}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}