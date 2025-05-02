"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const defaultEmail = searchParams.get("email");
    if (defaultEmail) setEmail(defaultEmail);
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }
  
      const role = data.user?.role;
  
      if (role === "admin") {
        router.push("/admin/dashboard");
      } else if (role === "seller") {
        router.push("/seller/dashboard");
      } else {
        router.push("/products"); // default route for regular users
      }
  
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    }
  };
  

  return (
    <main className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg flex flex-col lg:flex-row w-11/12 max-w-4xl overflow-hidden">

        {/* Image Section */}
        <div className="hidden lg:flex items-center justify-center bg-blue-100 p-8 w-1/2">
          <div className="relative w-full h-80">
            <Image
              src="/images/login.jpg"
              alt="Shopping Illustration"
              fill
              className="object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Form Section */}
        <div className="p-8 w-full lg:w-1/2">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Login to Second Hand
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              Login
            </button>
          </form>

          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}

          <div className="mt-4 text-sm">
            <Link href="/auth/forget-password" className="text-blue-500 hover:underline">
              Forgot password?
            </Link>
          </div>

          <div className="mt-6">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition duration-300"
            >
              <img src="/images/google-icon.png" alt="Google" className="h-5 w-5" />
              Sign in with Google
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-blue-500 hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
