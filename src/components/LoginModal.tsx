"use client";

import React from "react";
import Image from "next/image";

interface Props {
  onClose: () => void;
  onSwitchToRegister: () => void;
  message?: string;
}

export default function LoginModal({
  onClose,
  onSwitchToRegister,
  message,
}: Props) {
  return (
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

          <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Log In to Your Account</h2>

          {message && (
            <div className="text-center text-green-500 mb-4">
              <p>{message}</p>
            </div>
          )}

          <form className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-gray-300 rounded p-2"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border border-gray-300 rounded p-2"
            />
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Log In
            </button>
          </form>

          <div className="mt-6">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition duration-300"
            >
              <Image src="/images/google-icon.png" alt="Google" width={20} height={20} className="h-5 w-5" />
              Log in with Google
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-gray-600 text-sm">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => {
                  onClose();
                  onSwitchToRegister();
                }}
                className="text-red-500 hover:underline"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
    
  );
}
