"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal"; // Assuming you have a LoginModal component

export default function VerifyPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");

    if (token) {
      // Call API to verify the token
      verifyToken(token);
    } else {
      setMessage("Invalid or expired verification token.");
      setShowModal(true);
    }
  }, [router]);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`/api/verify?token=${token}`);
      const data = await response.json();

      if (data.message === "Email successfully verified!") {
        setMessage(data.message);
        setShowModal(true);
      } else {
        setMessage(data.message || "An error occurred.");
        setShowModal(true);
      }
    } catch (error) {
      setMessage("An error occurred during verification.");
      setShowModal(true);
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleSwitchToRegister = () => {
    // Redirect to the registration page if necessary
    router.push("/auth/register");
  };

  return (
    <div>
      {/* Conditionally render the modal based on state */}
      {showModal && (
        <LoginModal
          onClose={handleClose}
          onSwitchToRegister={handleSwitchToRegister}
          message={message}
        />
      )}

      {/* Optional: You can display a success or error message here */}
      {message && <p className="text-center mt-4">{message}</p>}
    </div>
  );
}
