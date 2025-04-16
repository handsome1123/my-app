import React from 'react';

interface Props {
  onClose: () => void;
}

export default function RegisterModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50">
      {/* Transparent Background Layer with low opacity */}
      <div className="absolute inset-0 bg-white opacity-30 pointer-events-none" />

      {/* Modal Content */}
      <div className="absolute inset-0 flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative z-10">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-xl"
          >
            &times;
          </button>

          <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Create an Account</h2>

          <form className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full border border-gray-300 rounded p-2"
            />
            <input
              type="email"
              placeholder="Email or Phone Number"
              className="w-full border border-gray-300 rounded p-2"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border border-gray-300 rounded p-2"
            />
            <button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Create Account
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <a href="/auth/login" className="text-blue-500 hover:underline">
                Log In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
