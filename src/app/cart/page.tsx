"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, Trash2 } from "lucide-react";

type CartItem = {
  productId: {
    _id: string;
    name?: string;
    imageUrl?: string;
    price?: number;
  };
  quantity: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<{ items: CartItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCart = async () => {
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const res = await fetch("/api/buyer/cart", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    const data = await res.json();
    if (res.ok) setCart(data.cart ?? { items: [] });
    else setCart({ items: [] });
    setLoading(false);
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQty = async (productId: string, qty: number) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    await fetch("/api/buyer/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ productId, quantity: qty }),
    });
    await fetchCart();
  };

  const removeItem = async (productId: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    await fetch(`/api/buyer/cart?productId=${encodeURIComponent(productId)}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    await fetchCart();
  };

  const subtotal = (cart?.items || []).reduce((s: number, it: CartItem) => s + (it.productId?.price ?? 0) * it.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (cart?.items.length ?? 0) === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Your cart is empty.</p>
            <Link href="/buyer/products" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded">
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cart!.items.map((it) => {
                const imageUrl = it.productId.imageUrl ?? "/placeholder.png"; // fallback
                const name = it.productId.name ?? "Product";
                const price = it.productId.price ?? 0;

                return (
                  <div key={it.productId._id} className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden">
                      <Image src={imageUrl} alt={name} width={80} height={80} className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{name}</div>
                      <div className="text-sm text-gray-500">฿{price}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQty(it.productId._id, Math.max(1, it.quantity - 1))}
                          className="px-2 py-1 border rounded"
                        >
                          -
                        </button>
                        <div className="px-3">{it.quantity}</div>
                        <button
                          onClick={() => updateQty(it.productId._id, it.quantity + 1)}
                          className="px-2 py-1 border rounded"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(it.productId._id)}
                          className="ml-4 text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 p-6 rounded-lg">
              <div className="text-xl font-bold text-gray-900">
                Subtotal: <span className="text-blue-600">฿{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex gap-4">
                <Link
                  href="/buyer/dashboard"
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Continue Shopping
                </Link>
                <Link
                  href="/buyer/checkout"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
