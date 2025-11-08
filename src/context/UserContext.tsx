// src/context/UserContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "buyer" | "seller" | "admin";
  unreadNotifications?: number;
  notificationsCount?: number;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/seller/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: User) => setUser(data))
      .catch((err) => console.error("Failed to fetch profile:", err));
  }, []);

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
