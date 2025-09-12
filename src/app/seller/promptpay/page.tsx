// app/buyer/checkout/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ArrowLeft, 
  ShoppingCart, 
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Loading component
function CheckoutLoading() {
  return (
    <div className="min-h-screen p-6 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading checkout...</p>
      </div>
    </div>
  );
}

// Main checkout component
function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("productId");
  const quantity = parseInt(searchParams.get("quantity") || "1");

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  const [paymentSlipPreview, setPaymentSlipPreview] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<'form' | 'payment' | 'slip'>('form');
  
  const [formData, setFormData] = useState<CheckoutForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: ""
  });

  const [qrImage, setQrImage] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<{bankName: string, accountNumber: string, accountName: string} | null>(null);

  // Fetch product
  useEffect(() => {
    async function fetchProduct() {
      if (!productId) return;
      try {
        const res = await fetch(`/api/buyer/products/${productId}`);
        const data = await res.json();
        if (res.ok) setProduct(data);
        else setError(data.error || "Failed to fetch product");
      } catch {
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  // Fetch PromptPay QR code
  useEffect(() => {
    async function fetchQR() {
      if (!product || !product.price) return;

      try {
        const res = await fetch(`/api/seller/promptpay?amount=${product.price * quantity}`);
        const data = await res.json();
        if (res.ok || data.qrImage) {
          setQrImage(data.qrImage);
          setPaymentInfo({
            bankName: data.bankName,
            accountNumber: data.accountNumber,
            accountName: data.accountName
          });
        }
      } catch {
        console.error("Failed to fetch QR code");
      }
    }

    fetchQR();
  }, [product, quantity]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentSlip(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPaymentSlipPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePaymentSlip = () => {
    setPaymentSlip(null);
    setPaymentSlipPreview("");
  };

  const handleProceedToPayment = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    const isFormValid = requiredFields.every(field => formData[field as keyof CheckoutForm].trim() !== '');
    
    if (!isFormValid) {
      setError("Please fill in all required fields");
      return;
    }
    setError("");
    setCurrentStep('payment');
  };

  const handleProceedToSlip = () => setCurrentStep('slip');

  async function handleConfirmPurchase() {
    if (!productId || !product || !paymentSlip) return;
    
    setProcessing(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const orderData = new FormData();
      orderData.append('productId', productId);
      orderData.append('quantity', quantity.toString());
      orderData.append('paymentSlip', paymentSlip);
      orderData.append('customerInfo', JSON.stringify(formData));

      const res = await fetch(`/api/buyer/checkout`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: orderData,
      });

      const data = await res.json();
      if (res.ok) setOrderSuccess(true);
      else setError(data.error || "Failed to create order");
    } catch {
      setError("Something went wrong during checkout.");
    } finally {
      setProcessing(false);
    }
  }

  const subtotal = product ? product.price * quantity : 0;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (loading) return <CheckoutLoading />;

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button onClick={() => setError("")} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-2">Try Again</button>
        <button onClick={() => router.back()} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors">Go Back</button>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <ShoppingCart size={48} className="text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg mb-4">Product not found.</p>
        <button onClick={() => router.back()} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Go Back</button>
      </div>
    </div>
  );

  if (orderSuccess) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
        <p className="text-gray-600 mb-6">Thank you for your purchase. We&apos;ll verify your payment slip and process your order shortly.</p>
        <div className="space-y-3">
          <button onClick={() => router.push('/buyer/orders')} className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">View My Orders</button>
          <button onClick={() => router.push('/buyer/products')} className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors">Back to Shopping</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center space-x-4">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-200 transition-colors"><ArrowLeft /></button>
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side - Product & Form */}
        <div className="space-y-6">
          {/* Product summary */}
          <div className="bg-white rounded-xl shadow p-6 flex space-x-4">
            <div className="w-28 h-28 relative rounded-lg overflow-hidden">
              <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="text-gray-500">{product.description}</p>
              <p className="mt-2 font-bold">${product.price.toFixed(2)} × {quantity} = ${(product.price * quantity).toFixed(2)}</p>
            </div>
          </div>

          {/* Form */}
          {currentStep === 'form' && (
            <div className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} className="input" />
                <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} className="input" />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} className="input sm:col-span-2" />
                <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleInputChange} className="input sm:col-span-2" />
                <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} className="input sm:col-span-2" />
                <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} className="input" />
                <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleInputChange} className="input" />
                <input type="text" name="zipCode" placeholder="Zip Code" value={formData.zipCode} onChange={handleInputChange} className="input" />
                <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleInputChange} className="input" />
              </div>
              <button onClick={handleProceedToPayment} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mt-4">Proceed to Payment</button>
            </div>
          )}

          {/* Step 2 - Payment */}
          {currentStep === 'payment' && (
            <div className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-lg font-semibold">Payment</h2>
              {qrImage ? (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Scan to Pay with PromptPay</h3>
                  <Image src={qrImage} alt="PromptPay QR Code" className="w-64 h-64 mx-auto" />
                  {paymentInfo && (
                    <div className="mt-2 text-center text-gray-700">
                      <p>{paymentInfo.bankName}</p>
                      <p>{paymentInfo.accountNumber}</p>
                      <p>{paymentInfo.accountName}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p>Generating QR code...</p>
              )}
              <button onClick={handleProceedToSlip} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mt-4">Upload Payment Slip</button>
            </div>
          )}

          {/* Step 3 - Upload Slip */}
          {currentStep === 'slip' && (
            <div className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-lg font-semibold">Upload Payment Slip</h2>
              {paymentSlipPreview && (
                <div className="relative w-64 h-64 mx-auto">
                  <Image src={paymentSlipPreview} alt="Payment Slip Preview" fill className="object-contain rounded-lg border" />
                  <button onClick={removePaymentSlip} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"><X size={16} /></button>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFileUpload} />
              <button onClick={handleConfirmPurchase} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors mt-4" disabled={processing}>
                {processing ? "Processing..." : "Confirm Purchase"}
              </button>
            </div>
          )}
        </div>

        {/* Right Side - Order Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow p-6 space-y-2">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="border-t mt-2 pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  );
}

// "use client"
// import { useEffect, useState } from 'react'

// export default function PaymentQR() {
//   const [qrImage, setQrImage] = useState(null)

//   useEffect(() => {
//     fetch('/api/seller/promptpay')
//       .then(res => res.json())
//       .then(data => setQrImage(data.qrImage))
//   }, [])

//   return (
//     <div>
//       <h2>Scan to Pay via PromptPay</h2>
//       {qrImage ? <img src={qrImage} alt="PromptPay QR" /> : <p>Loading...</p>}
//     </div>
//   )
// }
