import Link from 'next/link';
import LoggedInHeader from "@/components/LoggedInHeader";

export default function CartPage() {
  return (
    <main>
      {/* LoggedInHeader */}
      <LoggedInHeader />

      <div className="bg-gray-100 min-h-screen py-8">
        <div className="container mx-auto p-8 bg-white shadow-md rounded-lg">
          {/* Breadcrumbs */}
          <div className="mb-4 text-gray-500">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span>Cart</span>
          </div>

          {/* Cart Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Item 1 */}
                <tr>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-full w-full object-contain rounded"
                          src="https://via.placeholder.com/80/0000FF/FFFFFF?Text=Monitor"
                          alt="LCD Monitor"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          LCD Monitor
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">$ 650</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <button className="bg-gray-200 text-gray-600 rounded-l-md focus:outline-none hover:bg-gray-300">
                        -
                      </button>
                      <input
                        type="number"
                        value="01"
                        className="w-12 text-center border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        min="1"
                      />
                      <button className="bg-gray-200 text-gray-600 rounded-r-md focus:outline-none hover:bg-gray-300">
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">$ 650</div>
                  </td>
                </tr>
                {/* Item 2 */}
                <tr>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-full w-full object-contain rounded"
                          src="https://via.placeholder.com/80/FF0000/FFFFFF?Text=Gamepad"
                          alt="HI Gamepad"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          HI Gamepad
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">$ 550</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <button className="bg-gray-200 text-gray-600 rounded-l-md focus:outline-none hover:bg-gray-300">
                        -
                      </button>
                      <input
                        type="number"
                        value="02"
                        className="w-12 text-center border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        min="1"
                      />
                      <button className="bg-gray-200 text-gray-600 rounded-r-md focus:outline-none hover:bg-gray-300">
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">$ 1100</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Actions and Coupon */}
          <div className="md:flex md:items-start md:justify-between mb-8">
            <div className="mb-4 md:mb-0">
              <Link
                href="/shop" // Replace with your actual shop page link
                className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded focus:outline-none hover:bg-gray-100"
              >
                Return To Shop
              </Link>
            </div>
            <div className="md:flex md:items-center">
              <input
                type="text"
                placeholder="Coupon Code"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md md:w-1/3 mr-2"
              />
              <button className="bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded focus:outline-none">
                Apply Coupon
              </button>
            </div>
            <div>
              <button className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded focus:outline-none hover:bg-gray-100">
                Update Cart
              </button>
            </div>
          </div>

          {/* Cart Total */}
          <div className="bg-white shadow-md rounded-lg p-6 w-full md:w-1/3 ml-auto">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Cart Total
            </h2>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Subtotal :</span>
                <span>$ 1750</span>
              </div>
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Shipping :</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-800 mb-4">
                <span>Total :</span>
                <span>$ 1750</span>
              </div>
              <button className="bg-green-500 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded focus:outline-none w-full">
                Procees to checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}