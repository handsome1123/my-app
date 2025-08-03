'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
  const [isPhoneOtpSent, setIsPhoneOtpSent] = useState(false);
  const [message, setMessage] = useState('');

  const handleOAuthSignIn = async (provider: string) => {
    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch {
      setMessage('An error occurred. Please try again.');
    }
  };

  const handleEmailSignIn = async () => {
    try {
      const response = await fetch('/api/auth/email/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsEmailOtpSent(true);
        setMessage('OTP sent to email');
      } else {
        setMessage(data.error || 'Failed to send OTP');
      }
    } catch {
      setMessage('An error occurred. Please try again.');
    }
  };

  const handlePhoneSignIn = async () => {
    try {
      const response = await fetch('/api/auth/phone/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsPhoneOtpSent(true);
        setMessage('OTP sent to phone');
      } else {
        setMessage(data.error || 'Failed to send OTP');
      }
    } catch {
      setMessage('An error occurred. Please try again.');
    }
  };

  const handleOtpVerification = async () => {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/dashboard');
      } else {
        setMessage(data.error || 'OTP verification failed');
      }
    } catch {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border border-gray-200 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Sign In</h1>

      {message && <p className="text-sm text-red-500 mb-4">{message}</p>}

      {/* Google Sign-In */}
      <button
        onClick={() => handleOAuthSignIn('google')}
        className="w-full bg-red-500 text-white py-2 px-4 rounded mb-4"
      >
        Sign in with Google
      </button>

      <div className="border-t border-gray-300 my-4" />

      {/* Email OTP Sign-In */}
      <div className="mb-4">
        <label className="block mb-1">Email</label>
        <input
          type="email"
          className="w-full px-3 py-2 border border-gray-300 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {!isEmailOtpSent ? (
        <button
          onClick={handleEmailSignIn}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded mb-4"
        >
          Send OTP to Email
        </button>
      ) : (
        <>
          <div className="mb-4">
            <label className="block mb-1">Enter OTP</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          <button
            onClick={handleOtpVerification}
            className="w-full bg-green-500 text-white py-2 px-4 rounded mb-4"
          >
            Verify OTP
          </button>
        </>
      )}

      <div className="border-t border-gray-300 my-4" />

      {/* Phone OTP Sign-In */}
      <div className="mb-4">
        <label className="block mb-1">Phone</label>
        <input
          type="tel"
          className="w-full px-3 py-2 border border-gray-300 rounded"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      {!isPhoneOtpSent ? (
        <button
          onClick={handlePhoneSignIn}
          className="w-full bg-purple-500 text-white py-2 px-4 rounded mb-4"
        >
          Send OTP to Phone
        </button>
      ) : (
        <>
          <div className="mb-4">
            <label className="block mb-1">Enter OTP</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          <button
            onClick={handleOtpVerification}
            className="w-full bg-green-500 text-white py-2 px-4 rounded mb-4"
          >
            Verify OTP
          </button>
        </>
      )}

      {/* Link to Sign Up */}
      <p className="text-gray-600">
        Don&apos;t have an account?{' '}
        <button
          onClick={() => router.push('/auth/signup')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Sign up
        </button>
      </p>
    </div>
  );
}
