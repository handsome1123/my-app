'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

type AuthMethod = 'email' | 'phone' | 'google' | 'facebook';

export default function SignUpPage() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleOAuthSignUp = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    try {
      const result = await signIn(provider, { callbackUrl: '/' });
      if (result?.error) {
        setMessage('Authentication failed. Please try again.');
      }
    } catch {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      setMessage('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, type: 'email' }),
      });

      const data = await response.json();
      if (data.success) {
        setShowOtpInput(true);
        setMessage('OTP sent to your email!');
      } else {
        setMessage(data.message || 'Failed to send OTP.');
      }
    } catch {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !name) {
      setMessage('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name, type: 'phone' }),
      });

      const data = await response.json();
      if (data.success) {
        setShowOtpInput(true);
        setMessage('OTP sent to your phone!');
      } else {
        setMessage(data.message || 'Failed to send OTP.');
      }
    } catch {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setMessage('Please enter the OTP.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp,
          email: authMethod === 'email' ? email : undefined,
          phone: authMethod === 'phone' ? phone : undefined,
          name,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const result = await signIn('credentials', {
          email: data.user.email,
          password: '',
          redirect: false,
        });

        if (result?.ok) {
          router.push('/');
        } else {
          setMessage('Authentication failed. Please try again.');
        }
      } else {
        setMessage(data.message || 'Invalid OTP.');
      }
    } catch {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Sign up to get started</p>
        </div>

        <div className="space-y-4 mb-8">
          <button
            onClick={() => handleOAuthSignUp('google')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            <Image src="/google.svg" alt="Google" width={20} height={20} />
            Continue with Google
          </button>
          <button
            onClick={() => handleOAuthSignUp('facebook')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Image src="/facebook.svg" alt="Facebook" width={20} height={20} />
            Continue with Facebook
          </button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or sign up with</span>
          </div>
        </div>

        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setAuthMethod('email')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
              authMethod === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setAuthMethod('phone')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
              authMethod === 'phone' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            Phone
          </button>
        </div>

        {!showOtpInput ? (
          <form onSubmit={authMethod === 'email' ? handleEmailSignUp : handlePhoneSignUp}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {authMethod === 'email' ? (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : `Send OTP to ${authMethod === 'email' ? 'Email' : 'Phone'}`}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpVerification}>
            <div className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowOtpInput(false);
                  setOtp('');
                  setMessage('');
                }}
                className="w-full text-blue-600 hover:text-blue-700 text-sm"
              >
                Back to {authMethod === 'email' ? 'Email' : 'Phone'}
              </button>
            </div>
          </form>
        )}

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            message.includes('success') || message.includes('sent') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/auth/signin')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
