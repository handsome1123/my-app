'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<{
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setState({ user, isLoading: false });
      } catch (error) {
        console.error('Failed to load user from localStorage:', error);
        setState({ user: null, isLoading: false });
      }
    } else {
      setState({ user: null, isLoading: false });
    }
  }, []);

  const login = async (email: string, _password: string) => {
    void _password; // Prevent unused variable warning

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user: User = {
        id: '1',
        email,
        name: email.split('@')[0],
      };

      setState({ user, isLoading: false });
      localStorage.setItem('user', JSON.stringify(user));
      toast.success('Welcome back!');
    } catch (error) {
      toast.error('Login failed. Please try again.');
      throw error;
    }
  };

  const register = async (email: string, _password: string, name: string) => {
    void _password; // Prevent unused variable warning

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user: User = {
        id: Date.now().toString(),
        email,
        name,
      };

      setState({ user, isLoading: false });
      localStorage.setItem('user', JSON.stringify(user));
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      throw error;
    }
  };

  const logout = () => {
    setState({ user: null, isLoading: false });
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
