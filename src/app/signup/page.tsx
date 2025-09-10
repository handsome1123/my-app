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

export default function SignupPage() {
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

    // Frontend-only simulation
    setTimeout(() => {
      if (!email.endsWith('@lamduan.mfu.ac.th')) {
        setError(
          'Registration is only allowed with a Lamduan email address (ending with @lamduan.mfu.ac.th).'
        );
        setIsLoading(false);
        return;
      }

      setSuccess(
        'Registration successful! Please check your email to verify your account.'
      );
      setIsLoading(false);

      setTimeout(() => router.push('/login'), 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 animate-gradient-x flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row animate-fade-in">
        
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

          {/* Separator */}
          <div className="flex items-center my-6">
            <Separator className="flex-1" />
            <span className="px-3 text-xs text-gray-500 uppercase">Or</span>
            <Separator className="flex-1" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 flex-1">
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
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
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                {success}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg transition"
              disabled={isLoading}
            >
              {isLoading && (
                <div className="h-4 w-4 animate-spin mr-2 border-t-2 border-white rounded-full" />
              )}
              {isLoading ? 'Signing up...' : 'Sign up'}
            </Button>
          </form>

          {/* Footer */}
          <div className="p-6 text-sm text-center text-gray-600">
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

      {/* Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease forwards;
        }
      `}</style>
    </div>
  );
}
