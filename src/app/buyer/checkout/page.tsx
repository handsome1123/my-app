import Link from 'next/link';
import LoggedInHeader from "@/components/LoggedInHeader";

export default function CheckoutPage() {
  return (
    <main>
      {/* LoggedInHeader */}
      <LoggedInHeader />
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="mb-4 text-gray-500">
            <Link href="/account" className="hover:underline">
              Account
            </Link>
            <span className="mx-2">/</span>
            <Link href="/my-account" className="hover:underline">
              My Account
            </Link>
            <span className="mx-2">/</span>
            <Link href="/product" className="hover:underline">
              Product
            </Link>
            <span className="mx-2">/</span>
            <Link href="/cart" className="hover:underline">
              View Cart
            </Link>
            <span className="mx-2">/</span>
            <span>Checkout</span>
          </div>

          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            {/* Billing Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8 lg:mb-0">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Billing Details
              </h2>
              <form className="space-y-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="companyName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="streetAddress"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="streetAddress"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="apartment"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Apartment, floor, etc. (optional)
                  </label>
                  <input
                    type="text"
                    id="apartment"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="townCity"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Town / City
                  </label>
                  <input
                    type="text"
                    id="townCity"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="emailAddress"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="emailAddress"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="saveInfo"
                      type="checkbox"
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="saveInfo" className="font-medium text-gray-700">
                      Save this information for faster check-out next time
                    </label>
                  </div>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img
                        src="/images/products/1.png"
                        alt="LCD Monitor"
                        className="h-full w-full object-contain rounded"
                      />
                    </div>
                    <div className="ml-2 text-sm font-medium text-gray-900">
                      LCD Monitor
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">$ 650</div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img
                        src="/images/products/2.png"
                        alt="HI Gamepad"
                        className="h-full w-full object-contain rounded"
                      />
                    </div>
                    <div className="ml-2 text-sm font-medium text-gray-900">
                      HI Gamepad
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">$ 1100</div>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Subtotal :</span>
                  <span>$ 1750</span>
                </div>
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Shipping :</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 mb-4">
                  <span>Total :</span>
                  <span>$ 1750</span>
                </div>
              </div>

              {/* Payment Options */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Payment Options
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="bank"
                      name="paymentMethod"
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <label htmlFor="bank" className="ml-2 text-sm font-medium text-gray-700">
                      Bank
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="cashOnDelivery"
                      name="paymentMethod"
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      defaultChecked
                    />
                    <label htmlFor="cashOnDelivery" className="ml-2 text-sm font-medium text-gray-700">
                      Cash on delivery
                    </label>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <div>
                <button className="bg-green-500 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded focus:outline-none w-full">
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}