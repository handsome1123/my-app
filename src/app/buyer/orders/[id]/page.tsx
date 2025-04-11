'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCheckCircle, faTruck, faBoxOpen, faCalendarAlt, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const OrderItemDetail = ({ item }) => (
  <div className="flex items-start mb-4 border-b border-gray-200 pb-4">
    <div className="w-24 h-24 mr-4 overflow-hidden rounded-md shadow-inner">
      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
    </div>
    <div className="flex-grow">
      <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
      <p className="text-gray-600 text-xs">{item.designer}</p>
      <p className="text-gray-600 text-xs">Size: {item.size}, Qty: {item.quantity}, Price: Rs. {item.price}</p>
    </div>
    <div className="text-right">
      <p className="text-gray-800 font-semibold text-sm">Rs. {item.price * item.quantity}</p>
    </div>
  </div>
);

const OrderStatusDetail = ({ status }) => {
  let statusText = '';
  let icon = null;
  let colorClass = '';

  switch (status) {
    case 'pending':
      statusText = 'Pending';
      icon = faCalendarAlt;
      colorClass = 'text-yellow-500';
      break;
    case 'processing':
      statusText = 'Processing';
      icon = faTruck;
      colorClass = 'text-blue-500';
      break;
    case 'shipped':
      statusText = 'Shipped';
      icon = faBoxOpen;
      colorClass = 'text-indigo-500';
      break;
    case 'delivered':
      statusText = 'Delivered';
      icon = faCheckCircle;
      colorClass = 'text-green-500';
      break;
    case 'cancelled':
      statusText = 'Cancelled';
      icon = faTimesCircle;
      colorClass = 'text-red-500';
      break;
    default:
      statusText = 'Unknown';
      
      colorClass = 'text-gray-500';
  }

  return (
    <span className="flex items-center text-sm">
      <FontAwesomeIcon icon={icon} className={`mr-2 ${colorClass}`} />
      <span className={`font-semibold ${colorClass}`}>{statusText}</span>
    </span>
  );
};

export default function OrderDetailsPage() {
  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/account/orders" className="text-blue-500 hover:underline flex items-center">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to My Orders
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Order Details: #R0374915036</h1>

          <div className="md:grid md:grid-cols-2 md:gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Order Information</h2>
              <p className="text-gray-600 text-sm">Order Date: Thu, 17th Nov '16</p>
              <p className="text-gray-600 text-sm">Status: <OrderStatusDetail status="shipped" /></p>
              <p className="text-gray-600 text-sm">Tracking Number: TRACK-123456789</p>
              <p className="text-gray-600 text-sm">Estimated Delivery: 24 December 2016</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Shipping Address</h2>
              <p className="text-gray-600 text-sm">John Doe</p>
              <p className="text-gray-600 text-sm">123 Main St</p>
              <p className="text-gray-600 text-sm">Anytown, CA 90210</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Billing Address</h2>
              <p className="text-gray-600 text-sm">John Doe</p>
              <p className="text-gray-600 text-sm">456 Oak Ave</p>
              <p className="text-gray-600 text-sm">Otherville, NY 10001</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Payment Information</h2>
              <p className="text-gray-600 text-sm">Payment Method: Credit Card ending with 7343</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">Order Items</h2>
          <div>
            <OrderItemDetail item={{ id: 1, name: 'Netting Mykonos Tunic Dress', designer: 'By Milly Thomas', size: 'S', quantity: 1, price: 1250, image: 'https://via.placeholder.com/80/D3D3D3/FFFFFF?Text=Dress1' }} />
            <OrderItemDetail item={{ id: 2, name: 'Elegant Evening Gown', designer: 'By Stella McCartney', size: 'M', quantity: 1, price: 2500, image: 'https://via.placeholder.com/80/800080/FFFFFF?Text=Gown' }} />
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex justify-between text-gray-600 mb-2">
              <span>Subtotal:</span>
              <span className="font-semibold">Rs. 3750.00</span>
            </div>
            <div className="flex justify-between text-gray-600 mb-2">
              <span>Shipping Fee:</span>
              <span className="font-semibold">Rs. 50.00</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 text-lg">
              <span>Total:</span>
              <span>Rs. 3800.00</span>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button className="bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline-red text-sm">
                Cancel Order
              </button>
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline-blue text-sm">
                Track Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}