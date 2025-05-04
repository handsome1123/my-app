"use client";

import { useSearchParams } from "next/navigation";
import { products } from "@/data/products";
import Link from "next/link";
import LoggedInHeader from "@/components/LoggedInHeader";
import Image from "next/image";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';


export default function CheckoutPage({params }: {params: {id: string}}) {
  const [product, setProduct] = useState<any>(null);
  const router = useRouter();
  

  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const numericId = Number(id);


  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch(`/api/product/${params.id}`)
      .then(res => res.json())
      .then(data => setProduct(data));
  }, [params.id]);

  const handleCheckout = async () => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id }),
    });

    if (res.ok) {
      alert('Order placed!');
      router.push('/');
    } else {
      alert('Checkout failed');
    }
  };

  if (!product) {
    return (
      <main>
        <LoggedInHeader />
        <div className="p-6 text-center">Product not found.</div>
      </main>
    );
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          address,
          phone,
          email,
          items: [{ productId: product.id, quantity: 1 }],
          totalAmount: product.price,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Order placed:", result);
        alert("Order placed successfully!");
      } else {
        alert("Failed to place order.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    }
  }

  return (
    <main>
      <LoggedInHeader />
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4 text-gray-500">
            <Link href="/products" className="hover:underline">
              Products
            </Link>
            <span className="mx-2">/</span>
            <span>Checkout</span>
          </div>

          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8 lg:mb-0">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing Details</h2>
              <form className="space-y-4" onSubmit={handlePlaceOrder}>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="w-full border p-2 rounded" required />
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" className="w-full border p-2 rounded" required />
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" className="w-full border p-2 rounded" required />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full border p-2 rounded" required />

                <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded w-full">
                  Place Order
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="mb-4 flex items-center gap-4">
                <div className="h-24 w-24 relative">
                  <Image src={product.imageUrl} alt={product.name} fill className="object-contain rounded" />
                </div>
                <div>
                  <div className="font-semibold text-lg">{product.name}</div>
                  <div className="text-gray-600">${product.price.toLocaleString()}</div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Subtotal :</span>
                  <span>${product.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Shipping :</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 mb-4">
                  <span>Total :</span>
                  <span>${product.price.toLocaleString()}</span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment</h3>
                <div className="flex justify-center">
                  <img src="/images/mike_bank.png" alt="Bank Details" width="300" />
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
