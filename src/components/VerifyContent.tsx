"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status");

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  const renderContent = () => {
    switch (status) {
      case "success":
        return (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Email Verified 🎉</h2>
            <p className="text-gray-600 mt-2">
              Your account has been successfully verified. Redirecting to login...
            </p>
          </div>
        );
      case "invalid":
        return (
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Invalid or Expired Link</h2>
            <p className="text-gray-600 mt-2">
              Please request a new verification email and try again.
            </p>
          </div>
        );
      case "missing":
        return (
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Token Missing</h2>
            <p className="text-gray-600 mt-2">
              The verification link is incomplete. Please check your email again.
            </p>
          </div>
        );
      default:
        return (
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Verifying your email...</h2>
            <p className="text-gray-600 mt-2">
              Please wait while we confirm your account.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        {renderContent()}
      </div>
    </div>
  );
}
