import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { UserProvider } from '@/context/UserContext';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MFU SecondHand',
  description: 'Discover amazing products at unbeatable prices',
    icons: {
    icon: "/logo.jpg", 
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <UserProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}
