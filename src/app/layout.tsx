import { Inter } from 'next/font/google';
import Image from "next/image";
import { Search, ChevronRight, ShoppingCart, Heart, QrCode } from 'lucide-react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SecondHand E-commerce',
  description: 'A beautiful and modern e-commerce homepage',
  icons: {
    icon: "/images/sh_logo.jpg", 
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-white">
          {/* Top Banner */}
          <div className="bg-gray-900 text-white py-2 px-4 text-center text-sm">
            Summer Sale For All Swim Suits And Free Express Delivery - OFF 50%!
            <a href="#" className="ml-2 underline">ShopNow</a>
          </div>



          {children}

          {/* Footer */}
          <footer className="bg-gray-900 text-white pt-5 pb-2">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
                <div>
                  <h3 className="text-xl font-bold mb-4">SecondHand.com</h3>
                  <p className="mb-4">Subscribe</p>
                  <p className="text-sm mb-4">Get 10% off your first order</p>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full bg-black border border-white rounded-md py-2 px-4 text-white"
                    />
                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">Support</h3>
                  <ul className="space-y-2">
                    <li>333 Moo1, Thasud, Muang, Chiang Rai 57100 , Chiang Rai , Thailand</li>
                    <li>secondhand@gmail.com</li>
                    <li>+66 983744826</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">Account</h3>
                  <ul className="space-y-2">
                    <li><a href="#" className="hover:text-gray-300">My Account</a></li>
                    <li><a href="#" className="hover:text-gray-300">Login / Register</a></li>
                    <li><a href="#" className="hover:text-gray-300">Cart</a></li>
                    <li><a href="#" className="hover:text-gray-300">Wishlist</a></li>
                    <li><a href="#" className="hover:text-gray-300">Shop</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Quick Link</h3>
                  <ul className="space-y-2">
                    <li><a href="#" className="hover:text-gray-300">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-gray-300">Terms Of Use</a></li>
                    <li><a href="#" className="hover:text-gray-300">FAQ</a></li>
                    <li><a href="#" className="hover:text-gray-300">Contact</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Download App</h3>
                  <ul className="space-y-2">
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                      <QrCode className="w-24 h-24" />
                      <div className="flex gap-2">
                        <a href="#" className="hover:text-gray-300"><img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-10" /></a>
                        <a href="#" className="hover:text-gray-300"><img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Play Store" className="h-10" /></a>
                      </div>
                    </div>
                  </ul>
                </div>
              </div>
              <div className="flex flex-col justify-center items-center pt-2 border-t border-gray-800">
                <p className="text-sm text-gray-400 text-center">© Copyright SecondHand 2025. All rights reserved</p>
              </div>

            </div>
          </footer>

        </div>
      </body>
    </html>
  );
}