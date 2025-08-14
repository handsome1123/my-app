'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// QR
import promptpay from 'promptpay-qr'
import QRCode from 'qrcode'

interface Product {
  id: string;
  name: string;
  price: number;
  seller_id: string;
  description?: string;
  images?: { image_url: string; is_primary: boolean }[];
}

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Address fields
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { id } = await params;

      // 1️⃣ Get logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      // 2️⃣ Get product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          description,
          seller_id,
          images:product_images(image_url, is_primary)
        `)
        .eq('id', id)
        .single();

      if (productError || !productData) {
        console.error('Product fetch error:', productError?.message);
        setProduct(null);
        setLoading(false);
        return;
      }

      setProduct(productData);

      // 3️⃣ Fetch seller's PromptPay ID with better debugging
      console.log('Looking for seller_id:', productData.seller_id);
      
      const { data: paymentInfo, error: paymentQueryError } = await supabase
        .from('seller_payment_info')
        .select('promptpay_id, seller_id')
        .eq('seller_id', productData.seller_id)
        .single();

      console.log('Payment query result:', { paymentInfo, error: paymentQueryError });

      let promptPayId = paymentInfo?.promptpay_id;

      if (paymentQueryError) {
        if (paymentQueryError.code === 'PGRST116') {
          // No rows returned - use fallback for testing
          console.warn('No payment info found, using fallback PromptPay ID for testing');
          promptPayId = '0812345678'; // Replace with a test PromptPay ID
          setPaymentError('Using test payment info - seller should set up their PromptPay ID');
        } else {
          setPaymentError(`Payment info error: ${paymentQueryError.message}`);
          setQrImage(null);
          setLoading(false);
          return;
        }
      }

      if (!promptPayId) {
        setPaymentError('Seller has not configured their PromptPay ID. Please contact the seller.');
        setQrImage(null);
        setLoading(false);
        return;
      }

      // 4️⃣ Generate PromptPay QR
      try {
        const payload = promptpay(promptPayId, { amount: parseFloat(productData.price.toString()) });
        const qrImageURL = await QRCode.toDataURL(payload);
        setQrImage(qrImageURL);
        setPaymentError(null); // Clear any previous errors
      } catch (err) {
        console.error('QR generation error:', err);
        setPaymentError('Failed to generate payment QR code. Please try again later.');
        setQrImage(null);
      }

      setLoading(false);
    };

    fetchData();
  }, [params]);

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found</p>;

  const primaryImage =
    product.images?.find((img) => img.is_primary)?.image_url ||
    product.images?.[0]?.image_url ||
    '/placeholder.jpg';

  const handleConfirm = async () => {
    try {
      if (!userId) return alert('Login required');
      if (!addressLine1 || !city || !zipCode || !contactNumber)
        return alert('Please fill all required address fields');
      if (!slipFile) return alert('Please upload your payment slip');
      if (paymentError)
        return alert('Cannot proceed with payment issues. Please contact the seller.');

      // 1️⃣ Upload payment slip to Supabase Storage
      const fileExt = slipFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('payment_slips')
        .upload(fileName, slipFile);

      if (uploadError) {
        throw new Error('Slip upload failed: ' + uploadError.message);
      }

      const { data: { publicUrl } } = supabase
        .storage
        .from('payment_slips')
        .getPublicUrl(fileName);

      // 2️⃣ Insert into orders table
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: userId,
          seller_id: product.seller_id, // NEW: store seller ID
          product_id: product.id,
          payment_slip_url: publicUrl,
          status: 'pending_payment_verification'
        })
        .select()
        .single();

      if (orderError || !order) {
        throw new Error('Order creation failed: ' + orderError?.message);
      }

      // 3️⃣ Insert into order_addresses table
      const { error: addressError } = await supabase
        .from('order_addresses')
        .insert({
          order_id: order.id,
          address_line1: addressLine1,
          address_line2: addressLine2,
          city,
          zip_code: zipCode,
          contact_number: contactNumber
        });

      if (addressError) {
        // Rollback order if address fails
        await supabase.from('orders').delete().eq('id', order.id);
        throw new Error('Address save failed: ' + addressError.message);
      }

      // 4️⃣ Success
      alert('Order placed successfully! Waiting for seller/admin confirmation.');
      router.push('/');
    } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err);
          alert(err.message);
        } else {
          console.error(err);
          alert('An unexpected error occurred');
        }
    }
  };


  return (
  <div className="p-4 max-w-4xl mx-auto">
    <h1 className="text-2xl font-bold mb-6 text-center">Checkout</h1>

    <div className="flex flex-col md:flex-row gap-6">
      {/* Left Column: Product + Payment */}
      <div className="md:w-1/2 space-y-4">
        {/* Product Info */}
        <div>
          <p className="font-semibold">Product:</p>
          <p className="mb-2">{product.name}</p>
          <div className="w-full h-64 relative overflow-hidden mb-2">
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover rounded"
              priority
            />
          </div>
          <p className="font-semibold">Price:</p>
          <p className="mb-2">฿{product.price}</p>
          <p className="text-gray-700">{product.description}</p>
        </div>

        {/* Payment Section */}
        {paymentError ? (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <h3 className="font-bold mb-2">Payment Issue</h3>
            <p>{paymentError}</p>
            <p className="mt-2 text-sm">
              You can still place an order, but you&apos;ll need to contact the seller directly for payment instructions.
            </p>
          </div>
        ) : qrImage ? (
          <div className="text-center">
            <h3 className="font-bold mb-2">Scan to Pay via PromptPay</h3>
            <div className="relative w-48 h-48 mx-auto">
              <Image
                src={qrImage}
                alt="PromptPay QR"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        ) : (
          <p>Generating QR...</p>
        )}
      </div>

      {/* Right Column: Address + Slip Upload + Confirm */}
      <div className="md:w-1/2 space-y-4">
        {/* Address Fields */}
        <div>
          <label className="block font-medium">Address Line 1 *</label>
          <input
            type="text"
            className="w-full border p-2 rounded mt-1"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium">Address Line 2</label>
          <input
            type="text"
            className="w-full border p-2 rounded mt-1"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium">City *</label>
          <input
            type="text"
            className="w-full border p-2 rounded mt-1"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium">Zip Code *</label>
          <input
            type="text"
            className="w-full border p-2 rounded mt-1"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium">Contact Number *</label>
          <input
            type="tel"
            className="w-full border p-2 rounded mt-1"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            required
          />
        </div>

        {/* Payment Slip Upload */}
        <div>
          <label className="block font-medium">Upload Payment Slip *</label>
          <input
            type="file"
            accept="image/*"
            className="mt-1"
            onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
            required
          />
          {paymentError && (
            <p className="text-sm text-gray-600 mt-1">
              If you can&apos;t make the payment via QR, contact the seller and upload a screenshot of your conversation as proof.
            </p>
          )}
        </div>

        <button
          onClick={handleConfirm}
          className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          disabled={!userId}
        >
          Confirm Purchase
        </button>
      </div>
    </div>
  </div>
);

}