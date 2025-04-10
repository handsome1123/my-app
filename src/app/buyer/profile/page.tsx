'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function MyAccountPage() {
  const [firstName, setFirstName] = useState('Md');
  const [lastName, setLastName] = useState('Rimel');
  const [email, setEmail] = useState('rimellill@gmail.com');
  const [address, setAddress] = useState('Kingston , 5236 , United State');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleSaveChanges = () => {
    console.log('Saving changes:', {
      firstName,
      lastName,
      email,
      address,
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
    alert('Changes Saved (Frontend Simulation)');
  };

  const handleCancel = () => {
    console.log('Cancel changes');
    alert('Changes Cancelled (Frontend Simulation)');
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-500">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span>My Account</span>
          </div>
          <div className="text-gray-700">Welcome! Md Rimel</div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden lg:grid lg:grid-cols-4">
          {/* Sidebar */}
          <aside className="p-6 border-b lg:border-r lg:border-b-0 border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Manage My Account
            </h2>
            <nav className="space-y-2">
              <Link
                href="/buyer/profile"
                className="block text-gray-700 hover:text-red-500 font-medium"
              >
                My Profile
              </Link>
              <Link
                href="/buyer/address-book"
                className="block text-gray-700 hover:text-red-500 font-medium"
              >
                Address Book
              </Link>
              <Link
                href="/buyer/payment-options"
                className="block text-gray-700 hover:text-red-500 font-medium"
              >
                My Payment Options
              </Link>
            </nav>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-4">
              My Orders
            </h2>
            <nav className="space-y-2">
              <Link
                href="/buyer/orders"
                className="block text-gray-700 hover:text-red-500 font-medium"
              >
                My Orders
              </Link>
              <Link
                href="/buyer/returns"
                className="block text-gray-700 hover:text-red-500 font-medium"
              >
                My Returns
              </Link>
              <Link
                href="/buyer/cancellations"
                className="block text-gray-700 hover:text-red-500 font-medium"
              >
                My Cancellations
              </Link>
            </nav>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-4">
              My WishList
            </h2>
            <nav>
              <Link
                href="/buyer/wishlist"
                className="block text-gray-700 hover:text-red-500 font-medium"
              >
                My WishList
              </Link>
            </nav>
          </aside>

          {/* Content Area */}
          <div className="p-6 lg:col-span-3">
            <h1 className="text-xl font-semibold text-red-500 mb-4">
              Edit Your Profile
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Password Changes
            </h2>
            <div className="space-y-4 mb-6">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="confirmNewPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-semibold hover:bg-gray-100 focus:outline-none mr-2"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white py-2 px-4 rounded-md text-sm font-semibold hover:bg-red-700 focus:outline-none"
                onClick={handleSaveChanges}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}