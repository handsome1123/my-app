"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Truck, 
  Shield, 
  CheckCircle2,
  AlertCircle,
  User,
  MapPin,
  Phone,
  Mail,
  Upload,
  X,
  FileText,
  Camera,
  Clock,
  Bell
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  sellerId: string; // Add seller ID to get seller's email
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
  paymentSlip?: string;
}

interface OrderConfirmation {
  orderId: string;
  status: 'pending_seller_confirmation' | 'confirmed' | 'rejected';
  sellerResponse?: string;
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

// Main checkout component that uses useSearchParams
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
  const [currentStep, setCurrentStep] = useState<'form' | 'waiting_confirmation' | 'payment' | 'slip'>('form');
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(null);
  const [ , setWaitingForSeller] = useState(false);
  
  const [formData, setFormData] = useState<CheckoutForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    paymentSlip: ""
  });

  const [qrImage, setQrImage] = useState(null);
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

  // Fetch PromptPay QR code (only when seller confirms availability)
  useEffect(() => {
    async function fetchQR() {
      if (!product || !product.price || currentStep !== 'payment') return;

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
  }, [product, quantity, currentStep]);

  // Poll for seller confirmation
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    
    if (currentStep === 'waiting_confirmation' && orderConfirmation?.orderId) {
      pollInterval = setInterval(async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`/api/buyer/orders/${orderConfirmation.orderId}/status`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          
          const data = await res.json();
          if (res.ok) {
            if (data.status === 'confirmed') {
              setCurrentStep('payment');
              setWaitingForSeller(false);
              clearInterval(pollInterval);
            } else if (data.status === 'rejected') {
              setError(data.sellerResponse || 'Seller rejected the order. Product may not be available.');
              setWaitingForSeller(false);
              clearInterval(pollInterval);
            }
          }
        } catch (err) {
          console.error('Error polling order status:', err);
        }
      }, 5000); // Poll every 5 seconds
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [currentStep, orderConfirmation?.orderId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setError("Please select an image less than 5MB");
      return;
    }

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

  // Modified function to send notification to seller instead of proceeding directly to payment
  const handleSendSellerNotification = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      alert("Please login or register before making a purchase.");
      return;
    }

    // Basic form validation
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    const isFormValid = requiredFields.every(field => {
      const value = formData[field as keyof CheckoutForm];
      return typeof value === 'string' && value.trim() !== '';
    });

    if (!isFormValid) {
      setError("Please fill in all required fields");
      return;
    }
    
    setError("");
    setProcessing(true);

    try {
      // Create preliminary order and send notification to seller
      const res = await fetch('/api/buyer/request-seller-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          quantity,
          customerInfo: formData
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setOrderConfirmation(data);
        setCurrentStep('waiting_confirmation');
        setWaitingForSeller(true);
      } else {
        setError(data.error || 'Failed to send notification to seller');
      }
    } catch (err) {
      console.error('Error sending seller notification:', err);
      setError('Something went wrong while notifying the seller');
    } finally {
      setProcessing(false);
    }
  };

  const handleProceedToSlip = () => {
    setCurrentStep('slip');
  };

  async function handleConfirmPurchase() {
    if (!productId || !product || !paymentSlip || !orderConfirmation?.orderId) return;

    setProcessing(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      // Create FormData for file upload
      const orderData = new FormData();
      orderData.append("orderId", orderConfirmation.orderId);
      orderData.append("paymentSlip", paymentSlip);

      const res = await fetch(`/api/buyer/complete-order`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: orderData,
      });

      const data = await res.json();
      if (res.ok) {
        setOrderSuccess(true);
      } else {
        setError(data.error || "Failed to complete order");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong during checkout.");
    } finally {
      setProcessing(false);
    }
  }

  const subtotal = product ? product.price * quantity : 0;
  const shipping = 0;
  const total = subtotal + shipping;

  if (loading) return <CheckoutLoading />;
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button 
            onClick={() => setError("")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-2"
          >
            Try Again
          </button>
          <button 
            onClick={() => router.back()}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <ShoppingCart size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">Product not found.</p>
          <button 
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-6">Thank you for your purchase. We&apos;ll verify your payment slip and process your order shortly.</p>
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/buyer/orders')}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View My Orders
            </button>
            <button 
              onClick={() => router.push('/buyer/products')}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => {
                if (currentStep === 'waiting_confirmation') setCurrentStep('form');
                else if (currentStep === 'payment') setCurrentStep('waiting_confirmation');
                else if (currentStep === 'slip') setCurrentStep('payment');
                else router.back();
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'form' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'waiting_confirmation' ? 'bg-yellow-500 text-white' : currentStep === 'payment' || currentStep === 'slip' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>3</div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'slip' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>4</div>
            </div>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Customer Information */}
            {currentStep === 'form' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <User size={24} className="text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Customer Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <div className="relative">
                        <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin size={24} className="text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSendSellerNotification}
                  disabled={processing}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Notifying Seller...
                    </>
                  ) : (
                    <>
                      <Bell size={20} />
                      Notify Seller & Check Availability
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 2: Waiting for Seller Confirmation */}
            {currentStep === 'waiting_confirmation' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Clock size={24} className="text-yellow-500" />
                  <h2 className="text-xl font-semibold text-gray-900">Waiting for Seller Confirmation</h2>
                </div>
                
                <div className="text-center space-y-6">
                  <div className="bg-yellow-50 rounded-2xl p-8">
                    <div className="animate-pulse flex justify-center mb-4">
                      <Mail size={64} className="text-yellow-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Notification Sent to Seller
                    </h3>
                    <p className="text-gray-600 mb-4">
                      We&apos;ve sent your order details to the seller. They will confirm product availability shortly.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                      <span>Checking every 5 seconds...</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Order Details Sent:</h4>
                    <div className="text-left space-y-1 text-sm text-blue-700">
                      <p><strong>Product:</strong> {product.name}</p>
                      <p><strong>Quantity:</strong> {quantity}</p>
                      <p><strong>Customer:</strong> {formData.firstName} {formData.lastName}</p>
                      <p><strong>Email:</strong> {formData.email}</p>
                      <p><strong>Phone:</strong> {formData.phone}</p>
                      <p><strong>Address:</strong> {formData.address}, {formData.city}, {formData.state} {formData.zipCode}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      <strong>What happens next?</strong><br />
                      The seller will receive an email with your order details and will confirm if the product is available. 
                      Once confirmed, you&apos;ll be able to proceed with payment.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: QR Code Payment (only after seller confirmation) */}
            {currentStep === 'payment' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle2 size={24} className="text-green-600" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Seller Confirmed - Scan QR Code to Pay</h2>
                    <p className="text-sm text-green-600">Product is available and ready for purchase!</p>
                  </div>
                </div>
                
                <div className="text-center space-y-6">
                  <div className="bg-gray-50 rounded-2xl p-8 inline-block">
                    {qrImage ? (
                      <div className="mt-4">
                        <h3 className="font-semibold mb-2">Scan to Pay with PromptPay</h3>
                        <Image src={qrImage} alt="PromptPay QR Code" 
                        width={256} height={256} 
                        className="w-64 h-64 mx-auto" />

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
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
                    <div className="space-y-2 text-left">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank:</span>
                        <span className="font-medium">{paymentInfo?.bankName || ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account:</span>
                        <span className="font-medium">{paymentInfo?.accountNumber || ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Name:</span>
                        <span className="font-medium">{paymentInfo?.accountName || ''}</span>
                      </div>
                      <div className="border-t pt-2 mt-4">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Amount to Pay:</span>
                          <span className="text-green-600">฿{total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Important:</strong> After making payment, you&apos;ll need to upload your payment slip in the next step.
                    </p>
                  </div>

                  <button
                    onClick={handleProceedToSlip}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <FileText size={20} />
                    I&apos;ve Made the Payment - Upload Slip
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Upload Payment Slip */}
            {currentStep === 'slip' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Upload size={24} className="text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Upload Payment Slip</h2>
                </div>

                <div className="space-y-6">
                  {!paymentSlip ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <div className="space-y-4">
                        <Camera size={48} className="text-gray-400 mx-auto" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Payment Slip</h3>
                          <p className="text-gray-500 mb-4">
                            Take a photo or upload an image of your payment slip
                          </p>
                          <label className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg cursor-pointer inline-flex items-center gap-2 transition-colors">
                            <Upload size={20} />
                            Choose File
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-400">
                          Supported formats: JPG, PNG, GIF (Max 5MB)
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative bg-gray-100 rounded-lg p-4">
                        <button
                          onClick={removePaymentSlip}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                        <Image
                          src={paymentSlipPreview || "/placeholder.jpg"}
                          alt="Payment Slip"
                          className="w-full max-w-md mx-auto rounded-lg"
                          width={400}
                          height={400}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-green-600 font-medium mb-2">✓ Payment slip uploaded successfully</p>
                        <p className="text-sm text-gray-500">File: {paymentSlip.name}</p>
                      </div>
                    </div>
                  )}

                  {paymentSlip && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 size={20} className="text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-800">Ready to place order</p>
                          <p className="text-sm text-green-600 mt-1">
                            Your payment slip has been uploaded. Click &apos;Complete Order&apos; to finalize your purchase.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Product Details */}
              <div className="flex gap-4 mb-6 pb-6 border-b">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={product.imageUrl || "/placeholder.png"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">Qty: {quantity}</p>
                  <p className="font-medium text-gray-900 mt-1">฿{product.price.toFixed(2)}</p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>฿{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>฿{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              {currentStep === 'form' && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-blue-700">
                    <User size={16} />
                    <span className="text-sm font-medium">Fill in your information</span>
                  </div>
                </div>
              )}

              {currentStep === 'waiting_confirmation' && (
                <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <Clock size={16} />
                    <span className="text-sm font-medium">Waiting for seller confirmation...</span>
                  </div>
                </div>
              )}

              {currentStep === 'payment' && (
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 size={16} />
                    <span className="text-sm font-medium">Confirmed! Scan QR code to pay ฿{total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {currentStep === 'slip' && (
                <div className="bg-purple-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-purple-700">
                    <Upload size={16} />
                    <span className="text-sm font-medium">
                      {paymentSlip ? "Payment slip uploaded" : "Upload payment slip"}
                    </span>
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 mb-6 text-center">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Shield size={20} className="text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Secure Payment</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Truck size={20} className="text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Fast Shipping</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <CheckCircle2 size={20} className="text-purple-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Guarantee</p>
                </div>
              </div>

              {/* Action Button */}
              {currentStep === 'slip' && (
                <button
                  onClick={handleConfirmPurchase}
                  disabled={processing || !paymentSlip}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      Complete Order
                    </>
                  )}
                </button>
              )}

              {currentStep !== 'slip' && (
                <div className="bg-gray-100 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500">
                    {currentStep === 'form' && "Complete the form to notify seller"}
                    {currentStep === 'waiting_confirmation' && "Waiting for seller to confirm availability"}
                    {currentStep === 'payment' && "Complete the payment process to place your order"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense wrapper
export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  );
}