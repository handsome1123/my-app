import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { UserProvider } from '@/context/UserContext';
import ErrorBoundary from '@/components/ErrorBoundary';

import { GoogleOAuthProvider } from "@react-oauth/google";

import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'MFU SecondHand - Professional E-commerce Platform',
  description: 'Buy and sell second-hand items with professional seller tools, analytics, and customer communication',
  keywords: 'secondhand, marketplace, e-commerce, seller tools, analytics, professional selling',
  authors: [{ name: "MFU SecondHand Team" }],
  creator: "MFU SecondHand",
  publisher: "MFU SecondHand",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "MFU SecondHand - Professional E-commerce Platform",
    description: "Buy and sell second-hand items with professional seller tools",
    url: "https://secondhand.mfu.ac.th",
    siteName: "MFU SecondHand",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "MFU SecondHand Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MFU SecondHand - Professional E-commerce Platform",
    description: "Buy and sell second-hand items with professional seller tools",
    images: ["/logo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification-code",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#3b82f6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MFU SecondHand" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
      </head>
      <body className="min-h-screen flex flex-col">
        <ErrorBoundary>
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
            <UserProvider>
              <Navbar />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </UserProvider>
          </GoogleOAuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
