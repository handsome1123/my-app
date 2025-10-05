"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
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
  CreditCard,
  Lock,
  QrCode,
  XCircle
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

// Type definitions for PromptPay
interface PromptPayDisplayQRCode {
  data?: string;
  hosted_instructions_url?: string;
  image_url_png?: string;
  image_url_svg?: string;
}

interface PromptPayNextAction {
  type: 'promptpay_display_qr_code';
  promptpay_display_qr_code: PromptPayDisplayQRCode;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  sellerId: string;
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

interface OrderConfirmation {
  orderId: string;
  status: "pending_payment" | "paid" | "confirmed" | "rejected";
  stripePaymentIntentId?: string;
  clientSecret: string;
}

interface CancelModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

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

function CancelModal({ onClose, onConfirm }: CancelModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Order</h3>
        <p className="text-gray-600 mb-6">Are you sure you want to cancel this order? This action cannot be undone.</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            No, Keep Order
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Yes, Cancel Order
          </button>
        </div>
      </div>
    </div>
  );
}

type PaymentMethodType = "card" | "promptpay";

function PaymentForm({ 
  clientSecret, 
  total, 
  product, 
  quantity, 
  onPaymentSuccess 
}: { 
  clientSecret: string; 
  total: number; 
  product: Product; 
  quantity: number; 
  onPaymentSuccess: (paymentIntentId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>("promptpay");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableMethods, setAvailableMethods] = useState<PaymentMethodType[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("");

  const generatePromptPayQR = useCallback(async () => {
    if (!stripe || !clientSecret) return;

    try {
      const { paymentIntent: existingPI } = await stripe.retrievePaymentIntent(clientSecret);

      if (existingPI?.next_action?.type === "promptpay_display_qr_code") {
        const nextAction = existingPI.next_action as PromptPayNextAction;
        const qrData = nextAction.promptpay_display_qr_code?.data;
        const hostedUrl = nextAction.promptpay_display_qr_code?.hosted_instructions_url;

        if (qrData) setQrCodeData(qrData);
        if (hostedUrl) setQrCodeUrl(hostedUrl);
        return;
      }

      const result = await stripe.confirmPromptPayPayment(clientSecret, {
        payment_method: {
          billing_details: {
            email: "customer@example.com", // replace with real customer email
          },
        },
        return_url: `${window.location.origin}/buyer/orders`,
      });

      if (result.error) {
        setError(result.error.message || "Failed to generate QR code");
      } else if (result.paymentIntent?.next_action?.type === "promptpay_display_qr_code") {
        const nextAction = result.paymentIntent.next_action as PromptPayNextAction;
        const qrData = nextAction.promptpay_display_qr_code?.data;
        const hostedUrl = nextAction.promptpay_display_qr_code?.hosted_instructions_url;

        if (qrData) setQrCodeData(qrData);
        if (hostedUrl) setQrCodeUrl(hostedUrl);
      }
    } catch (err) {
      console.error("Error generating PromptPay QR:", err);
      setError("Failed to generate QR code");
    }
  }, [stripe, clientSecret]);

  useEffect(() => {
    if (!stripe || !clientSecret) return;

    stripe.retrievePaymentIntent(clientSecret)
      .then(({ paymentIntent }) => {
        if (paymentIntent) {
          const methods = paymentIntent.payment_method_types as string[];
          const supportedMethods = methods.filter((m): m is PaymentMethodType =>
            ["card", "promptpay"].includes(m)
          );
          setAvailableMethods(supportedMethods);

          if (supportedMethods.includes("promptpay")) {
            setSelectedMethod("promptpay");
          } else if (supportedMethods.includes("card")) {
            setSelectedMethod("card");
          }
        }
      })
      .catch(err => {
        console.error("Failed to retrieve payment intent:", err);
        setError("Unable to load payment options.");
      });
  }, [stripe, clientSecret]);

  useEffect(() => {
    if (selectedMethod === "promptpay" && stripe && clientSecret) {
      generatePromptPayQR();
    }
  }, [selectedMethod, stripe, clientSecret, generatePromptPayQR]);

  useEffect(() => {
    if (selectedMethod !== "promptpay" || !stripe || !clientSecret) return;

    const pollInterval = setInterval(async () => {
      try {
        const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

        if (paymentIntent) {
          setPaymentStatus(paymentIntent.status);

          if (paymentIntent.status === "succeeded") {
            clearInterval(pollInterval);
            onPaymentSuccess(paymentIntent.id);
          } else if (paymentIntent.status === "canceled") {
            clearInterval(pollInterval);
            setError("Payment was canceled or failed.");
          }
        }
      } catch (err) {
        console.error("Error polling payment status:", err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [selectedMethod, stripe, clientSecret, onPaymentSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError("Payment system not ready. Please refresh.");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      if (selectedMethod === "card") {
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          setError("Card element not found");
          setProcessing(false);
          return;
        }

        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

        if (result.error) {
          setError(result.error.message || "Payment failed.");
        } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
          onPaymentSuccess(result.paymentIntent.id);
        }
      } else if (selectedMethod === "promptpay") {
        setError(null);
        setPaymentStatus("waiting");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("Payment processing failed.");
    } finally {
      setProcessing(false);
    }
  };

  if (availableMethods.length === 0) {
    return <div className="text-center p-8">Loading payment methods...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield size={20} className="text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Secure Payment</p>
            <p className="text-sm text-blue-600 mt-1">
              Choose PromptPay for QR scan or Card for global payments. Processed by Stripe.
            </p>
          </div>
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
        <div className="flex space-x-2 mb-4">
          {availableMethods.map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setSelectedMethod(method)}
              className={`flex-1 py-3 px-4 rounded-lg transition-colors ${
                selectedMethod === method
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {method === "promptpay" ? (
                <QrCode size={20} className="mx-auto mb-1" />
              ) : (
                <CreditCard size={20} className="mx-auto mb-1" />
              )}
              <span className="block text-sm font-medium">
                {method === "promptpay" ? "PromptPay (QR)" : "Card"}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4">
          {selectedMethod === "promptpay" ? (
            <div className="min-h-[350px] flex flex-col items-center justify-center bg-white rounded-lg p-6">
              <QrCode size={48} className="text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Scan to Pay with PromptPay</h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Open your banking app and scan the QR code to complete payment
              </p>
              {qrCodeData ? (
                <div className="w-full flex flex-col items-center">
                  <div className="bg-white p-4 rounded-lg border-2 border-blue-600 mb-4">
                    <Image
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCodeData)}`}
                      alt="PromptPay QR Code"
                      width={256}
                      height={256}
                      className="w-64 h-64"
                      unoptimized
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center mb-2">
                    Amount: ฿{total.toFixed(2)}
                  </p>
                  {paymentStatus === "waiting" && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg w-full">
                      <p className="text-sm text-yellow-800 text-center flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-800"></div>
                        Waiting for payment confirmation...
                      </p>
                    </div>
                  )}
                </div>
              ) : qrCodeUrl ? (
                <div className="w-full">
                  <iframe
                    src={qrCodeUrl}
                    className="w-full h-80 border-0 rounded-lg"
                    title="PromptPay QR Code"
                  />
                  {paymentStatus === "waiting" && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 text-center flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-800"></div>
                        Waiting for payment confirmation...
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                  Generating QR code...
                </div>
              )}
            </div>
          ) : (
            <div className="min-h-[100px] p-4 border border-gray-300 rounded-lg bg-white">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#1f2937",
                      "::placeholder": {
                        color: "#9ca3af",
                      },
                    },
                    invalid: {
                      color: "#ef4444",
                    },
                  },
                }}
              />
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Payment Summary</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Product: {product.name}</span>
            <span>฿{product.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Quantity:</span>
            <span>{quantity}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping:</span>
            <span>Free</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold">
              <span>Total Amount:</span>
              <span className="text-blue-600">฿{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {selectedMethod === "card" && (
        <button
          type="submit"
          disabled={processing}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing Payment...
            </>
          ) : (
            <>
              <Lock size={20} />
              Pay ฿{total.toFixed(2)} Securely
            </>
          )}
        </button>
      )}

      {selectedMethod === "promptpay" && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            After scanning and paying, your order will be automatically confirmed.
          </p>
        </div>
      )}
    </form>
  );
}

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
  const [currentStep, setCurrentStep] = useState<"form" | "payment">("form");
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(null);
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const [formData, setFormData] = useState<CheckoutForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Thailand"
  });

  useEffect(() => {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (publishableKey) {
      setStripePromise(loadStripe(publishableKey));
    }
  }, []);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProceedToPayment = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setError("Please login or register before making a purchase.");
      return;
    }

    const requiredFields = ["firstName", "lastName", "email", "phone", "address", "city", "state", "zipCode"];
    const isFormValid = requiredFields.every(field => formData[field as keyof CheckoutForm].trim() !== "");

    if (!isFormValid) {
      setError("Please fill in all required fields");
      return;
    }
    
    setError("");
    setProcessing(true);

    try {
      const res = await fetch("/api/buyer/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          quantity,
          customerInfo: formData,
          amount: product ? Math.round(product.price * quantity * 100) : 0,
          paymentMethodTypes: ["card", "promptpay"]
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setOrderConfirmation({ 
          orderId: data.orderId, 
          status: data.status, 
          stripePaymentIntentId: data.stripePaymentIntentId, 
          clientSecret: data.clientSecret 
        });
        setClientSecret(data.clientSecret);
        setCurrentStep("payment");
      } else {
        setError(data.error || "Failed to create payment intent");
      }
    } catch (err) {
      console.error("Error creating payment intent:", err);
      setError("Something went wrong while setting up payment");
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login again.");
        router.push("/login");
        return;
      }

      const res = await fetch("/api/buyer/confirm-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: orderConfirmation?.orderId,
          paymentIntentId
        })
      });

      const data = await res.json();
      if (res.ok) {
        setOrderSuccess(true);
        await fetch("/api/seller/notify-new-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            orderId: orderConfirmation?.orderId
          })
        });
      } else {
        setError(data.error || "Failed to confirm payment");
      }
    } catch (err) {
      console.error("Error confirming payment:", err);
      setError("Payment confirmation failed");
    }
  };

  const handleCancelOrder = async () => {
    if (!orderConfirmation?.orderId) {
      setError("No order to cancel.");
      return;
    }

    setIsCanceling(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login again.");
        router.push("/login");
        return;
      }

      const res = await fetch(`/api/admin/orders/delete/${orderConfirmation.orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setOrderSuccess(false);
        setCurrentStep("form");
        setOrderConfirmation(null);
        setClientSecret("");
        alert("Order canceled successfully.");
        router.push("/buyer/products");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to cancel order.");
      }
    } catch (err) {
      console.error("Error canceling order:", err);
      setError("Error canceling order. Please try again.");
    } finally {
      setIsCanceling(false);
      setCancelModalOpen(false);
    }
  };

  const subtotal = product ? product.price * quantity : 0;
  const shipping = 0;
  const total = subtotal + shipping;

  if (loading) return <CheckoutLoading />;
  
  if (error && currentStep === "form") {
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
          <p className="text-gray-600 mb-6">Thank you for your purchase. Your payment has been processed and the seller has been notified.</p>
          <div className="space-y-3">
            <button 
              onClick={() => router.push("/buyer/orders")}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View My Orders
            </button>
            <button 
              onClick={() => router.push("/buyer/products")}
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
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => {
                if (currentStep === "payment") setCurrentStep("form");
                else router.back();
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "form" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>1</div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "payment" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>2</div>
            </div>
            <div className="w-16">
              {orderConfirmation && (
                <button
                  onClick={() => setCancelModalOpen(true)}
                  className="flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors"
                  disabled={isCanceling}
                >
                  <XCircle size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentStep === "form" && (
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
                  onClick={handleProceedToPayment}
                  disabled={processing}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Setting up payment...
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      Proceed to Payment
                    </>
                  )}
                </button>
              </div>
            )}

            {currentStep === "payment" && stripePromise && clientSecret && orderConfirmation && product && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard size={24} className="text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Payment Information</h2>
                    <Lock size={16} className="text-gray-400" />
                  </div>
                  <PaymentForm 
                    clientSecret={clientSecret}
                    total={total}
                    product={product}
                    quantity={quantity}
                    onPaymentSuccess={handlePaymentSuccess}
                  />
                </div>
              </Elements>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
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

              <div className="grid grid-cols-3 gap-3 text-center">
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
            </div>
          </div>
        </div>
      </div>

      {cancelModalOpen && (
        <CancelModal
          onClose={() => setCancelModalOpen(false)}
          onConfirm={handleCancelOrder}
        />
      )}
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