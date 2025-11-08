"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<null | "idle" | "invalid" | "sent">("idle");

  const submitNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = /^\S+@\S+\.\S+$/.test(email);
    if (!isValid) {
      setStatus("invalid");
      return;
    }
    // Simulate success (no network call)
    setStatus("sent");
    setEmail("");
    setTimeout(() => setStatus("idle"), 4000);
  };

  return (
    <footer className="bg-gradient-to-tr from-slate-900 to-indigo-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-md overflow-hidden bg-white/10">
                <Image src="/logo.jpg" alt="MFU SecondHand" fill className="object-cover" />
              </div>
              <span className="text-lg font-semibold text-yellow-400">MFU SecondHand</span>
            </Link>
            <p className="text-sm text-slate-300">
              Trusted marketplace for MFU students. Buy & sell quality second-hand items with confidence.
            </p>

            <div className="flex items-center gap-3 mt-2">
              <a aria-label="Facebook" href="#" className="p-2 bg-white/6 rounded-md hover:bg-white/10 transition">
                <Facebook className="w-4 h-4 text-slate-100" />
              </a>
              <a aria-label="Twitter" href="#" className="p-2 bg-white/6 rounded-md hover:bg-white/10 transition">
                <Twitter className="w-4 h-4 text-slate-100" />
              </a>
              <a aria-label="Instagram" href="#" className="p-2 bg-white/6 rounded-md hover:bg-white/10 transition">
                <Instagram className="w-4 h-4 text-slate-100" />
              </a>
              <a aria-label="LinkedIn" href="#" className="p-2 bg-white/6 rounded-md hover:bg-white/10 transition">
                <Linkedin className="w-4 h-4 text-slate-100" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li><Link href="/buyer/dashboard" className="hover:text-white">Browse Products</Link></li>
              <li><Link href="/seller/products" className="hover:text-white">Sell an Item</Link></li>
              <li><Link href="/admin/dashboard" className="hover:text-white">Admin</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-3">Stay in the loop</h4>
            <p className="text-sm text-slate-300 mb-3">Subscribe for updates, new arrivals and exclusive offers.</p>

            <form onSubmit={submitNewsletter} className="flex flex-col sm:flex-row gap-3">
              <label htmlFor="footer-email" className="sr-only">Email address</label>
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  id="footer-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-md bg-white/6 border border-transparent focus:border-white/20 focus:bg-white/8 focus:outline-none text-slate-100 placeholder-slate-400"
                  aria-label="Subscribe email"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-yellow-400 text-slate-900 font-semibold hover:brightness-95 transition"
              >
                Subscribe
              </button>
            </form>

            {status === "invalid" && <p className="text-xs text-rose-400 mt-2">Please enter a valid email address.</p>}
            {status === "sent" && <p className="text-xs text-green-400 mt-2">Thanks — we&apos;ll keep you posted!</p>}
          </div>
        </div>

        {/* Footer bottom */}
        <div className="mt-8 border-t border-white/6 pt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-400">
          <p>© {new Date().getFullYear()} MFU SecondHand. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-3 sm:mt-0">
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/security" className="hover:text-white">Security</Link>
            <Link href="/support" className="hover:text-white">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
