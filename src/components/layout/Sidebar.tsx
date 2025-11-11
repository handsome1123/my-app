'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  ClipboardList,
  RefreshCcw,
  CreditCard,
  Home,
  User,
  ChevronDown,
  DollarSign,
  BarChart3,
  TrendingUp,
  MessageSquare,
  Wallet,
  Settings,
  // LogOut,
  // Bell
} from 'lucide-react';
import LogoutButton from "@/components/LogoutButton";
import Image from 'next/image';

interface SidebarProps {
  role?: 'admin' | 'seller' | 'buyer';
  userName?: string;
  userAvatar?: string;
}

interface MenuLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
}

export default function Sidebar({ role = 'buyer', userName = 'User', userAvatar }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();

  // Role-specific colors and branding
  const roleThemes = {
    admin: {
      primary: 'bg-red-600',
      secondary: 'bg-red-50',
      accent: 'text-red-600',
      hover: 'hover:bg-red-50',
      activeHover: 'hover:bg-red-100',
      title: 'Admin Panel'
    },
    seller: {
      primary: 'bg-blue-600',
      secondary: 'bg-blue-50',
      accent: 'text-blue-600',
      hover: 'hover:bg-blue-50',
      activeHover: 'hover:bg-blue-100',
      title: 'Seller Dashboard'
    },
    buyer: {
      primary: 'bg-green-600',
      secondary: 'bg-green-50',
      accent: 'text-green-600',
      hover: 'hover:bg-green-50',
      activeHover: 'hover:bg-green-100',
      title: 'Shopping Portal'
    }
  };

  const theme = roleThemes[role];

  // Menu links for each role with icons
  const roleLinks: Record<string, MenuLink[]> = {
    admin: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/users', label: 'Users', icon: Users, badge: 12 },
      { href: '/admin/products', label: 'Products', icon: Package },
      { href: '/admin/orders', label: 'Orders', icon: ClipboardList, badge: 5 },
      { href: '/admin/payouts', label: 'Payouts', icon: DollarSign, badge: 8 },
      { href: '/admin/refunds', label: 'Refunds', icon: RefreshCcw, badge: 2 },
    ],
    seller: [
      { href: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/seller/orders', label: 'Orders', icon: ClipboardList },
      { href: '/seller/products', label: 'Products', icon: Package },
      { href: '/seller/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/seller/earnings', label: 'Earnings', icon: Wallet },
      { href: '/seller/messages', label: 'Messages', icon: MessageSquare },
      { href: '/seller/payments', label: 'Payments', icon: CreditCard },
      { href: '/seller/settings', label: 'Settings', icon: Settings },
    ],
    buyer: [
      { href: '/', label: 'Home', icon: Home },
      { href: '/cart', label: 'Cart', icon: ShoppingCart, badge: 3 },
      { href: '/orders', label: 'My Orders', icon: ClipboardList },
      { href: '/profile', label: 'Profile', icon: User },
    ],
  };

  const links = roleLinks[role] || [];

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const closeSidebar = () => {
    setIsOpen(false);
    setShowUserMenu(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className={`md:hidden fixed top-4 right-4 z-50 p-3 ${theme.primary} text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
          className={`fixed md:static top-0 left-0 min-h-screen w-72 bg-white shadow-xl transform transition-all duration-300 ease-in-out z-40 flex flex-col
            ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        >
          {/* Header */}
          <div className={`${theme.primary} text-white p-6 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-10 h-10 ${theme.secondary} rounded-lg flex items-center justify-center`}>
                  <LayoutDashboard className={`${theme.accent} w-6 h-6`} />
                </div>
                <div>
                  <h1 className="text-lg font-bold">{theme.title}</h1>
                  <p className="text-xs opacity-90 capitalize">{role} Portal</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="p-4 border-b border-gray-100">
            <div 
              className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="relative">
                {userAvatar ? (
                  <Image
                    src={userAvatar} 
                    alt={userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className={`w-10 h-10 ${theme.primary} rounded-full flex items-center justify-center`}>
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{userName}</p>
                <p className="text-xs text-gray-500 capitalize">{role}</p>
              </div>
              <ChevronDown 
                className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 ${
                  showUserMenu ? 'rotate-180' : ''
                }`} 
              />
            </div>

            {/* User Dropdown Menu */}
            {/* {showUserMenu && (
              <div className="mt-2 py-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                <Link 
                  href="/settings" 
                  className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  onClick={closeSidebar}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <Link 
                  href="/notifications" 
                  className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  onClick={closeSidebar}
                >
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
                </Link>
                <button 
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  onClick={() => {
                    // Handle logout
                    closeSidebar();
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )} */}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {links.map((link) => {
              const IconComponent = link.icon;
              const isActive = isActiveLink(link.href);
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 relative overflow-hidden ${
                    isActive 
                      ? `${theme.secondary} ${theme.accent} shadow-sm ${theme.activeHover}` 
                      : `text-gray-600 ${theme.hover}`
                  }`}
                  onClick={closeSidebar}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className={`absolute left-0 top-0 w-1 h-full ${theme.primary} rounded-r-full`}></div>
                  )}
                  
                  <div className={`flex-shrink-0 ${isActive ? theme.accent : 'text-gray-500'} group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent size={20} />
                  </div>
                  
                  <span className="flex-1">{link.label}</span>
                  
                  {/* Badge */}
                  {link.badge && (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      isActive 
                        ? `${theme.primary} text-white` 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {link.badge}
                    </span>
                  )}

                  {/* Hover effect */}
                  <div className={`absolute inset-0 ${theme.secondary} opacity-0 group-hover:opacity-30 transition-opacity duration-200 rounded-xl`}></div>
                </Link>
              );
            })}
            <LogoutButton />
          </nav>

          {/* Footer with Stats */}
          <div className="p-4 border-t border-gray-100">
            {role === 'seller' && (
              <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div className="text-center">
                  <p className="text-xs text-blue-600 font-medium mb-1">Professional Seller Tools</p>
                  <p className="text-xs text-blue-500">Advanced analytics, bulk operations, and real-time insights</p>
                </div>
              </div>
            )}
            <div className="text-center text-xs text-gray-400">
              <p>© 2025 MFU 2ndhand</p>
              <p className="mt-1">Professional E-commerce Platform</p>
            </div>
          </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-30 transition-opacity duration-300"
          onClick={closeSidebar}
        ></div>
      )}
    </>
  );
}