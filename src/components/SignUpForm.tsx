"use client";

import { useState } from "react";

export default function SignUpForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Simulate async request (frontend only)
    setTimeout(() => {
      if (!form.email.endsWith("@lamduan.mfu.ac.th")) {
        setMessage("Only Lamduan emails (@lamduan.mfu.ac.th) are allowed.");
      } else if (form.password.length < 6) {
        setMessage("Password must be at least 6 characters.");
      } else {
        setMessage("Signup successful! Please login.");
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-4 border rounded bg-white shadow"
    >
      <h2 className="text-xl font-bold mb-4">Sign Up</h2>

      <input
        type="text"
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        required
        className="w-full mb-2 p-2 border rounded"
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
        className="w-full mb-2 p-2 border rounded"
      />

      <input
        type="text"
        name="phone"
        placeholder="Phone"
        value={form.phone}
        onChange={handleChange}
        className="w-full mb-2 p-2 border rounded"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
        className="w-full mb-4 p-2 border rounded"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
      >
        {loading ? "Signing Up..." : "Sign Up"}
      </button>

      {message && <p className="mt-2 text-center">{message}</p>}
    </form>
  );
}
