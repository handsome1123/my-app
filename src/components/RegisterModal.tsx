'use client';

import React from 'react';

interface Props {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterModal({ onClose, onSwitchToLogin }: Props) {
  return (
    <>
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-white opacity-60 pointer-events-none" />
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative z-10">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-xl"
            >
              &times;
            </button>

            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Create an Account</h2>

            <form className="space-y-4">
              <input type="text" placeholder="Name" className="w-full border border-gray-300 rounded p-2" />
              <input type="email" placeholder="Email or Phone Number" className="w-full border border-gray-300 rounded p-2" />
              <input type="password" placeholder="Password" className="w-full border border-gray-300 rounded p-2" />
              <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                Create Account
              </button>
            </form>

            <div className="mt-6">
              <button type="button" className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition duration-300">
                <img src="/images/google-icon.png" alt="Google" className="h-5 w-5" />
                Sign up with Google
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <button onClick={() => {
                  onClose();
                  onSwitchToLogin();
                }} className="hover:text-red-500">
                  Login
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
