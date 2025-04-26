"use client"; // Ensure this page is client-side

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Use useSearchParams from next/navigation

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Access the search params (query parameters)
  const email = searchParams.get("email"); // Get email from query string

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const res = await fetch('/api/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, newPassword }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage('Password reset successfully!');
      setIsPasswordReset(true);
    } else {
      setMessage(data.message || 'Something went wrong.');
    }
  };

  useEffect(() => {
    if (!email) {
      setMessage("Email is missing in the query string.");
    }
  }, [email]);

  return (
    <div>
      <h1>Reset Your Password</h1>
      {email ? (
        <form onSubmit={handleResetPassword}>
          <label htmlFor="new-password">New Password:</label>
          <input
            type="password"
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <label htmlFor="confirm-password">Confirm Password:</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Reset Password</button>
        </form>
      ) : (
        <p>No email provided for password reset.</p>
      )}
      {message && <p>{message}</p>}
      {isPasswordReset && (
        <div>
          <p>Your password has been reset successfully!</p>
          <button onClick={() => router.push("/auth/login")}>Go to Login</button>
        </div>
      )}
    </div>
  );
}
