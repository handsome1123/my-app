'use client';

import { useRouter } from 'next/navigation';

export function BuyNowButton({ productId }: { productId: string }) {
  const router = useRouter();

  const handleBuyNow = () => {
    router.push(`/dashboard/buyer/checkout?productId=${productId}`);
  };

  return (
    <button
      onClick={handleBuyNow}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      Buy Now
    </button>
  );
}
