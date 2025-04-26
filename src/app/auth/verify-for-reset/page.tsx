"use client"; // Ensure this page is client-side

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Use useSearchParams from next/navigation

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Access the search params (query parameters)
  const email = searchParams.get("email"); // Get email from query string

  const [otpCode, setOtpCode] = useState("");
  const [message, setMessage] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    // If email is missing, show an error
    if (!email) {
      setMessage("Email is missing in the query string.");
      return;
    }

    // Send OTP verification request
    const res = await fetch('/api/verify-otp-for-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otpCode }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage('OTP verified successfully!');
      setIsVerified(true);
    } else {
      setMessage(data.message || 'Invalid OTP');
    }
  };

  useEffect(() => {
    if (!email) {
      setMessage("Email is missing in the query string.");
    }
  }, [email]);

  return (
    <div>
      <h1>Verify OTP for Password Reset</h1>
      {email ? (
        <form onSubmit={handleVerify}>
          <div>
            <label htmlFor="email">Email Address:</label>
            <input
              type="email"
              id="email"
              value={email}
              disabled // Email is auto-filled and cannot be changed
              readOnly
            />
          </div>
          <div>
            <label htmlFor="otp">Enter OTP:</label>
            <input
              type="text"
              id="otp"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              required
            />
          </div>
          <button type="submit">Verify OTP</button>
        </form>
      ) : (
        <p>No email provided for verification.</p>
      )}
      {message && <p>{message}</p>}
      {isVerified && (
        <div>
          <p>OTP Verified! Now, you can reset your password.</p>
          <button onClick={() => router.push(`/auth/reset-password?email=${email}`)}>
            Go to Reset Password
          </button>
        </div>
      )}
    </div>
  );
}
