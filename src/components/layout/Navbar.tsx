"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoutButton from "@/components/LogoutButton";
import { useUser } from "@/context/UserContext";

const navLinks = {
  buyer: [
    { href: "/", label: "Home" },
    { href: "/buyer/orders", label: "My Order" },
    { href: "/history", label: "History" },
    { href: "/profile", label: "Profile" },
    { href: "/become-seller", label: "Become a Seller" },
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
  ],
};

export default function Navbar() {
  const { user } = useUser(); // get user from global context
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm" aria-label="Primary Navigation">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.jpg"
                alt="MFU SecondHand Logo"
                width={40}
                height={40}
                priority
              />
              <span className="text-xl font-bold text-yellow-500">
                MFU SecondHand
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            {user ? (
              <>
                {user.role &&
                  navLinks[user.role]
                    .filter(
                      (link) =>
                        !(
                          link.href === "/become-seller" &&
                          user.role === "seller"
                        )
                    )
                    .map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          pathname === link.href
                            ? "text-blue-600 font-semibold"
                            : "text-gray-700 hover:text-blue-500"
                        }`}
                        aria-current={
                          pathname === link.href ? "page" : undefined
                        }
                      >
                        {link.label}
                      </Link>
                    ))}

                <div className="flex items-center space-x-4 text-sm text-gray-700 ml-6">
                  <span>{user.email}</span>
                  <LogoutButton />
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-blue-600 hover:underline px-3 py-2 rounded-md"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-blue-600 hover:underline px-3 py-2 rounded-md"
                >
                  Signup
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
              aria-label="Toggle mobile menu"
              className="text-2xl focus:outline-none"
            >
              {isOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-gray-50 px-4 py-3 space-y-3 border-t border-gray-200"
        >
          {user ? (
            <>
              {user.role &&
                navLinks[user.role]
                  .filter(
                    (link) =>
                      !(link.href === "/become-seller" && user.role === "seller")
                  )
                  .map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}

              <div className="flex flex-col items-start space-y-2 text-sm text-gray-700 mt-3">
                <span>{user.email}</span>
                <LogoutButton />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block text-blue-600 px-3 py-2 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="block text-blue-600 px-3 py-2 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Signup
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
