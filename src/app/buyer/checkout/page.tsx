"use client";

import { Suspense, useEffect, useState, useCallback, useMemo } from "react";
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
  QrCode,
  XCircle
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe } from "@stripe/react-stripe-js";

// Type definitions
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

interface ShippingAddress {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
  label?: string;
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

function PaymentSection({ 
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
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

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
            email: "customer@example.com",
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
    if (stripe && clientSecret) {
      generatePromptPayQR();
    }
  }, [stripe, clientSecret, generatePromptPayQR]);

  useEffect(() => {
    if (!stripe || !clientSecret) return;

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
  }, [stripe, clientSecret, onPaymentSuccess]);

  return (
    <div className="space-y-6">
      {/* Product Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
        
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
            <h4 className="font-medium text-gray-900">{product.name}</h4>
            <p className="text-gray-500 text-sm mt-1">Quantity: {quantity}</p>
            <p className="font-medium text-gray-900 mt-1">฿{product.price.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>฿{(product.price * quantity).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span className="text-green-600">Free</span>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between text-xl font-bold text-gray-900">
              <span>Total</span>
              <span className="text-blue-600">฿{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center mt-6">
          <div className="p-3 bg-gray-50 rounded-lg">
            <Shield size={20} className="text-green-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Secure</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <Truck size={20} className="text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Fast Ship</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <CheckCircle2 size={20} className="text-purple-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Guarantee</p>
          </div>
        </div>
      </div>

      {/* Payment QR Code */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <QrCode size={24} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Scan to Pay</h3>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield size={20} className="text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">Secure Payment via PromptPay</p>
              <p className="text-sm text-blue-600 mt-1">
                Scan the QR code with your banking app to complete payment
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-[350px] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
          {qrCodeData ? (
            <div className="w-full flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-blue-600 mb-4">
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrCodeData)}`}
                  alt="PromptPay QR Code"
                  width={280}
                  height={280}
                  className="w-70 h-70"
                  unoptimized
                />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900 mb-1">
                  Amount: ฿{total.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  Open your banking app and scan to pay
                </p>
              </div>
              {paymentStatus === "waiting" && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg w-full">
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
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
              <p>Generating QR code...</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 text-center">
            After scanning and paying, your order will be automatically confirmed.
          </p>
        </div>
      </div>
    </div>
  );
}

// This is a constant, so it can be defined outside the component to prevent re-creation on every render.
const requiredFields = ["firstName", "lastName", "email", "phone", "address", "city", "state", "zipCode"];

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

  const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState("Home");

  // Check if the form is valid. This memo will only re-run when formData changes.
  const isFormValid = useMemo(() => {
    return requiredFields.every((f) => {
      const v = formData[f as keyof CheckoutForm];
      return typeof v === "string" && v.trim() !== "";
    });
  }, [formData]);

  useEffect(() => {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (publishableKey) {
      setStripePromise(loadStripe(publishableKey));
    }
  }, []);

  // Load saved addresses for returning customers
  useEffect(() => {
    const fetchSavedAddresses = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;

      try {
        const res = await fetch("/api/buyer/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.shippingAddresses) {
          setSavedAddresses(data.shippingAddresses);

          // If user has addresses and form is empty, auto-fill with default
          if (data.shippingAddresses.length > 0 && !formData.firstName) {
            const defaultAddr = data.shippingAddresses.find((addr: ShippingAddress) => addr.isDefault) || data.shippingAddresses[0];
            if (defaultAddr) {
              setFormData({
                firstName: defaultAddr.firstName || "",
                lastName: defaultAddr.lastName || "",
                email: defaultAddr.email || "",
                phone: defaultAddr.phone || "",
                address: defaultAddr.address || "",
                city: defaultAddr.city || "",
                state: defaultAddr.state || "",
                zipCode: defaultAddr.zipCode || "",
                country: defaultAddr.country || "Thailand"
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch saved addresses:", err);
      }
    };

    fetchSavedAddresses();
  }, [formData.firstName]); // Include formData.firstName to satisfy ESLint, but effect logic prevents unwanted re-runs

  useEffect(() => {
    async function fetchCart() {
      // First try to fetch from cart if available
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const cartRes = await fetch("/api/buyer/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cartData = await cartRes.json();

        if (cartRes.ok && cartData.cart?.items?.length > 0) {
          // Use cart items
          const cartItems = cartData.cart.items;
          if (cartItems.length === 1) {
            // Single item in cart - use that
            const item = cartItems[0];
            setProduct({
              _id: item.productId._id,
              name: item.productId.name || "Unknown Product",
              description: item.productId.description || "",
              price: item.productId.price || 0,
              imageUrl: item.productId.imageUrl || "",
              sellerId: item.productId.sellerId || "",
            });
            // Override quantity with cart quantity
            const url = new URL(window.location.href);
            url.searchParams.set('quantity', item.quantity.toString());
            window.history.replaceState({}, '', url.toString());
          } else {
            // Multiple items - redirect to cart
            router.push("/cart");
            return;
          }
        } else if (productId) {
          // Fallback to single product if no cart items
          const res = await fetch(`/api/buyer/products/${productId}`);
          const data = await res.json();
          if (res.ok) setProduct(data.product);
          else setError(data.error || "Failed to fetch product");
        }
      } catch (err) {
        console.error("Checkout fetch error:", err);
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    fetchCart();
  }, [productId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateQR = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setError("Please login or register before making a purchase.");
      return;
    }

    // Use computed validity, show error if invalid
    if (!isFormValid) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    setProcessing(true);

    try {
      // Save address to user's profile if it's a new address or first time
      if (savedAddresses.length === 0) {
        const addressPayload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          isDefault: true,
          label: "Home"
        };

        await fetch("/api/buyer/profile", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ shippingAddress: addressPayload })
        });
      }

      // Call server create-order route which validates cart or single product and creates PaymentIntent
      const payload: { productId?: string; quantity?: number; shippingAddress?: any } = {};
      if (productId) {
        payload.productId = productId;
        payload.quantity = quantity;
      }
      payload.shippingAddress = formData;

      const res = await fetch("/api/buyer/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.clientSecret) {
        // set order confirmation and client secret for client-side payment handling
        setOrderConfirmation({
          orderId: data.orderId,
          status: "pending_payment",
          clientSecret: data.clientSecret,
        });
        setClientSecret(data.clientSecret);
      } else {
        setError(data.error || "Failed to create order");
      }
    } catch (err) {
      console.error("Error creating order / payment intent:", err);
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

      // Use buyer endpoint for cancelling a buyer's order
      const res = await fetch(`/api/buyer/orders/${orderConfirmation.orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setOrderSuccess(false);
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
  const total = subtotal;

  if (loading) return <CheckoutLoading />;
  
  if (error && !clientSecret) {
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
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
            <div className="w-20">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Shipping Address Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <User size={24} className="text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Customer Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MapPin size={24} className="text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
                </div>
                {savedAddresses.length > 0 && (
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Choose Address
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
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

            {!clientSecret && (
              <button
                onClick={handleGenerateQR}
                disabled={processing || !isFormValid}
                aria-disabled={processing || !isFormValid}
                aria-label={processing ? "Generating payment QR code" : "Generate Payment QR Code"}
                className={`w-full ${processing || !isFormValid ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2`}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating QR Code...
                  </>
                ) : (
                  <>
                    <QrCode size={20} />
                    Generate Payment QR Code
                  </>
                )}
              </button>
            )}

            {/* Error region - use role="alert" and aria-live so screen readers announce it */}
            {error && (
              <div role="alert" aria-live="assertive" className="p-4 bg-red-50 border border-red-200 rounded-lg mt-2">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-600 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Order Summary & Payment QR */}
          <div className="lg:sticky lg:top-24 h-fit">
            {clientSecret && stripePromise ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentSection 
                  clientSecret={clientSecret}
                  total={total}
                  product={product}
                  quantity={quantity}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              </Elements>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                
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
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-gray-500 text-sm mt-1">Quantity: {quantity}</p>
                    <p className="font-medium text-gray-900 mt-1">฿{product.price.toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>฿{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Total</span>
                      <span className="text-blue-600">฿{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center mt-6">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Shield size={20} className="text-green-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Secure</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Truck size={20} className="text-blue-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Fast Ship</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <CheckCircle2 size={20} className="text-purple-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Guarantee</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 text-center">
                    {/* escape quotes already applied here; keep message concise */}
                    Fill in your address and click &quot;Generate Payment QR Code&quot; to proceed
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Selection Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Choose Shipping Address</h3>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {savedAddresses.map((addr, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors"
                    onClick={() => {
                      setFormData({
                        firstName: addr.firstName || "",
                        lastName: addr.lastName || "",
                        email: addr.email || "",
                        phone: addr.phone || "",
                        address: addr.address || "",
                        city: addr.city || "",
                        state: addr.state || "",
                        zipCode: addr.zipCode || "",
                        country: addr.country || "Thailand"
                      });
                      setShowAddressModal(false);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">
                            {addr.label || "Address"} {addr.isDefault ? "(Default)" : ""}
                          </span>
                          {addr.isDefault && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>{addr.firstName} {addr.lastName}</p>
                          <p>{addr.address}</p>
                          <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                          <p>{addr.phone} • {addr.email}</p>
                        </div>
                      </div>
                      <div className="text-blue-600">
                        <MapPin size={20} />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <button
                    onClick={() => setShowAddressModal(false)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Add New Address
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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