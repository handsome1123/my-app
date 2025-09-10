"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { setUser } = useUser();

  const handleLogout = async () => {
    const confirmed = confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json();

      // Remove token from localStorage if you store it there
      localStorage.removeItem("token");
      setUser(null); // clear user after logout

      alert(data.message || "Logged out successfully");

      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
      alert("Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`bg-red-500 text-white px-4 py-2 rounded transition ${
        loading ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600"
      }`}
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}
