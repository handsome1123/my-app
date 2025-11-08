"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import LogoutButton from "@/components/LogoutButton";
import { useUser } from "@/context/UserContext";
import { Menu, Bell, Search as IconSearch, ChevronDown, Users, CreditCard, FileText } from "lucide-react";

// User type
type User = {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
  role?: "buyer" | "seller" | "admin";
  unreadNotifications?: number;
  notificationsCount?: number;
};

// Navbar links by role
const navLinks: Record<NonNullable<User["role"]>, { href: string; label: string }[]> = {
  buyer: [
    { href: "/buyer/dashboard", label: "Home" },
    { href: "/buyer/orders", label: "My Order" },
    { href: "/buyer/history", label: "History" },
    { href: "/buyer/profile", label: "Profile" },
    { href: "/buyer/refunds", label: "Refund" },
    { href: "/buyer/become-seller", label: "Become a Seller" },
  ],
  seller: [
    { href: "/seller/dashboard", label: "Dashboard" },
    { href: "/seller/products", label: "My Products" },
    { href: "/seller/orders", label: "Orders" },
    { href: "/seller/payments", label: "Payments" },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/profiles", label: "Profiles" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/refunds", label: "Refunds" },
    { href: "/admin/payouts", label: "Payouts" },
  ],
};

export default function Navbar() {
  const { user } = useUser();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const mobileCloseRef = useRef<HTMLButtonElement | null>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement | null>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement | null>(null);

  const [pendingPayoutsCount, setPendingPayoutsCount] = useState<number | null>(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const quickActionsRef = useRef<HTMLDivElement | null>(null);

  // Fetch pending payouts count for admins
  useEffect(() => {
    let mounted = true;
    async function fetchPending() {
      if (user?.role !== "admin") return;
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const res = await fetch(`/api/admin/payouts?status=pending`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          setPendingPayoutsCount(Array.isArray(data.payouts) ? data.payouts.length : 0);
        } else {
          setPendingPayoutsCount(0);
        }
      } catch {
        if (mounted) setPendingPayoutsCount(0);
      }
    }
    fetchPending();
    return () => {
      mounted = false;
    };
  }, [user]);

  // Close profile dropdown on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Keyboard: Esc to close mobile/menu/search/profile
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (isOpen) setIsOpen(false);
        if (showProfileMenu) setShowProfileMenu(false);
        if (showSearch) setShowSearch(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, showProfileMenu, showSearch]);

  useEffect(() => {
    if (isOpen) setTimeout(() => mobileCloseRef.current?.focus(), 50);
  }, [isOpen]);

  useEffect(() => {
    if (showSearch) setTimeout(() => mobileSearchInputRef.current?.focus(), 50);
  }, [showSearch]);

  // "/" shortcut focuses desktop search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "")) {
        e.preventDefault();
        desktopSearchInputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // derive userLinks
  const userLinks =
    user?.role
      ? navLinks[user.role as NonNullable<User["role"]>].filter(
          (link) => !(link.href === "/become-seller" && user.role === "seller")
        )
      : [];

  const notifCount = Number(user?.notificationsCount ?? user?.unreadNotifications ?? 0);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm" role="navigation" aria-label="Primary Navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden shadow-sm">
                <Image src="/logo.jpg" alt="MFU SecondHand Logo" fill className="object-cover" />
              </div>
              <span className="text-lg font-bold text-yellow-500 tracking-tight">MFU SecondHand</span>
            </Link>
          </div>

          {/* Center: Search (desktop) */}
          <div className="flex-1 mx-6 hidden md:flex items-center justify-center">
            <div className="w-full max-w-xl relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="global-search"
                ref={desktopSearchInputRef}
                placeholder="Search products, categories, sellers..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Search products"
              />
            </div>
          </div>

          {/* Right: Links + actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <div className="flex items-center space-x-2">
                    {userLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                          pathname === link.href ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"
                        }`}
                        aria-current={pathname === link.href ? "page" : undefined}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  {/* Notifications */}
                  <div className="relative" ref={notificationsRef}>
                    <button
                      onClick={() => { setShowNotifs((s) => !s); setShowQuickActions(false); }}
                      aria-expanded={showNotifs}
                      aria-haspopup="true"
                      className="p-2 rounded-md hover:bg-gray-100 transition relative"
                      title="Notifications"
                    >
                      <Bell className="w-5 h-5 text-gray-600" />
                      {notifCount > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs bg-red-600 text-white rounded-full">
                          {notifCount}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Admin Quick Actions */}
                  {user.role === "admin" && (
                    <div className="relative" ref={quickActionsRef}>
                      <button
                        onClick={() => { setShowQuickActions((s) => !s); setShowNotifs(false); }}
                        aria-expanded={showQuickActions}
                        aria-haspopup="true"
                        className="p-2 rounded-md hover:bg-gray-100 transition flex items-center gap-2"
                        title="Admin quick actions"
                      >
                        <Users className="w-5 h-5 text-gray-600" />
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showQuickActions ? "rotate-180" : ""}`} />
                      </button>

                      {showQuickActions && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                          <Link href="/admin/payouts" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-gray-500" /> Payouts
                          </Link>
                          <Link href="/admin/users" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" /> Users
                          </Link>
                          <Link href="/admin/logs" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" /> Activity Logs
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pending payouts badge */}
                  {user.role === "admin" && pendingPayoutsCount !== null && (
                    <Link href="/admin/payouts" className="ml-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 text-yellow-800 text-sm font-medium">
                      Payouts
                      <span className="inline-flex items-center justify-center w-6 h-6 text-xs bg-yellow-600 text-white rounded-full">{pendingPayoutsCount}</span>
                    </Link>
                  )}

                  {/* Profile */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setShowProfileMenu((s) => !s)}
                      aria-haspopup="true"
                      aria-expanded={showProfileMenu}
                      className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 transition"
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700">
                        {user.avatar ? (
                          <Image src={user.avatar} alt={user.name || "User"} width={32} height={32} className="rounded-full object-cover" />
                        ) : (
                          initials
                        )}
                      </div>
                      <span className="hidden sm:inline-block text-sm text-gray-700">{user.email}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProfileMenu ? "rotate-180" : ""}`} />
                    </button>

                    {showProfileMenu && (
                      <div role="menu" aria-label="Profile menu" className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                        <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                        <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Settings</Link>
                        <div className="border-t my-1" />
                        <div className="px-4 py-2"><LogoutButton /></div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-blue-600 hover:underline">Login</Link>
                  <Link href="/signup" className="text-sm px-3 py-2 bg-blue-600 text-white rounded-md">Sign up</Link>
                </>
              )}
            </div>

            {/* Mobile menu & search toggles */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={() => setShowSearch((s) => !s)} aria-expanded={showSearch} aria-controls="mobile-search" aria-label="Toggle search" className="p-2 rounded-md hover:bg-gray-100 transition">
                <IconSearch className="w-5 h-5 text-gray-600" />
              </button>
              <button onClick={() => setIsOpen(true)} aria-label="Open menu" className="p-2 rounded-md hover:bg-gray-100 transition">
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
