'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function VerifyForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert('Successfully logged in.');
      router.push('/login');
    }
  };

  return (
    <form onSubmit={handleVerify}>
      <p>We sent a 6-digit code to: <strong>{email}</strong></p>
      <input
        type="text"
        placeholder="Enter OTP Code"
        value={token}
        onChange={e => setToken(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Verifying...' : 'Verify'}
      </button>
    </form>
  );
}
