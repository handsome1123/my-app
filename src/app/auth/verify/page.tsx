import { useState } from 'react';

export default function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/auth/verifyOtp', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com', otp }), // You can store email from localStorage or session
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    setMessage(data.message);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter OTP"
        onChange={(e) => setOtp(e.target.value)}
        required
      />
      <button type="submit">Verify OTP</button>
      {message && <p>{message}</p>}
    </form>
  );
}
