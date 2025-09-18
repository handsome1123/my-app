'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useUser } from "@/context/UserContext";


// Continue with google 
import { GoogleLogin } from "@react-oauth/google";


export default function SignupPage() {
  const { setUser } = useUser(); // ✅ add this
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create formData object from state variables
      const formData = {
        name,
        email,
        password
      };

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Success
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // You'll need to get setUser from context or props
        // setUser(data.user); // updates navbar automatically

        setSuccess('Registration successful! Redirecting...');

        // Add delay before redirect
        setTimeout(() => {
          // Redirect based on role
          if (data.user.role === 'admin') {
            router.push('/admin');
          } else if (data.user.role === 'seller') {
            router.push('/seller/dashboard');
          } else {
            router.push('/buyer/dashboard'); // fallback for buyers
          }
        }, 1500);
        
      } else {
        // ❌ API returned an error
        setError(data.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-xl">
        
        {/* Left Image */}
        <div className="md:w-1/2 relative h-48 md:h-auto">
          <Image
            src="/mfu.jpg"
            alt="Campus"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Right Content */}
        <div className="w-full md:w-1/2 flex flex-col p-8">
          
          {/* Header */}
          <div className="mb-6 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-extrabold text-yellow-500">
              Create your account
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Sign up to get started with your MFU portal
            </p>
          </div>

          <div>
          {/* Google button */}
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const res = await fetch("/api/auth/google", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ idToken: credentialResponse.credential }),
                  });

                  const data = await res.json();

                  if (res.ok) {
                    // Store token and user data
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));
                    setUser(data.user); // ✅ now works because we imported useUser

                    // Redirect based on role
                    if (data.user.role === "buyer") {
                      router.push("/buyer/dashboard");
                    } else if (data.user.role === "seller") {
                      router.push("/seller/dashboard");
                    } else if (data.user.role === "admin") {
                      router.push("/admin/dashboard");
                    } else {
                      router.push("/");
                    }
                  } else {
                    setError(data.error || "Google signup failed");
                  }
                } catch {
                  setError("Something went wrong with Google signup");
                }
              }}
              onError={() => {
                setError("Google signup failed. Please try again.");
              }}
            />
          </div>


          {/* Separator */}
          <div className="flex items-center my-6">
            <Separator className="flex-1" />
            <span className="px-3 text-xs text-gray-500 uppercase">Or</span>
            <Separator className="flex-1" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 flex-1">
            {/* Name */}
            <div>
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your Lamduan email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
                {success}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg transition-colors"
              disabled={isLoading}
            >
              {isLoading && (
                <div className="h-4 w-4 animate-spin mr-2 border-2 border-white border-t-transparent rounded-full" />
              )}
              {isLoading ? 'Signing up...' : 'Sign up'}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-sm text-center text-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-yellow-500 hover:underline font-semibold"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}