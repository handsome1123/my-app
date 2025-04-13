'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBoxOpen, faUser, faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'; // Import more icons as needed

const OrderItem = ({ item }) => (
  <div className="flex items-start space-x-4 py-4 border-b border-gray-200">
    <div className="w-20 h-20 overflow-hidden rounded-md shadow-inner">
      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
    </div>
    <div className="flex-grow">
      <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
      <p className="text-gray-600 text-xs">{item.color}, Size: {item.size}</p>
      {item.sku && <p className="text-gray-500 text-xs">SKU: {item.sku}</p>}
    </div>
    <div className="text-right">
      <p className="text-sm text-gray-700">${item.price} x {item.quantity}</p>
      <p className="text-sm font-semibold text-gray-900">${item.total}</p>
    </div>
  </div>
);

const CustomerInfo = ({ customer }) => (
  <div className="bg-white rounded-md shadow-sm p-4 mb-4">
    <h2 className="text-sm font-semibold text-gray-800 mb-3">Customer</h2>
    <div className="flex items-center space-x-2 mb-2">
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
        <FontAwesomeIcon icon={faUser} className="text-gray-500 text-sm" />
      </div>
      <Link href={`/customers/${customer.id}`} className="text-blue-500 hover:underline text-sm font-medium">{customer.name}</Link>
      <FontAwesomeIcon icon={faArrowLeft} className="text-gray-400 text-xs rotate-180" />
    </div>
    <p className="text-gray-600 text-xs">{customer.ordersCount} Orders</p>
  </div>
);

const ContactInfo = ({ contact }) => (
  <div className="bg-white rounded-md shadow-sm p-4 mb-4">
    <h2 className="text-sm font-semibold text-gray-800 mb-3">Contact Info</h2>
    {contact.email && (
      <div className="flex items-center space-x-2 mb-1">
        <FontAwesomeIcon icon={faEnvelope} className="text-gray-500 text-xs" />
        <p className="text-gray-600 text-xs">{contact.email}</p>
      </div>
    )}
    {contact.phone && (
      <div className="flex items-center space-x-2">
        <FontAwesomeIcon icon={faPhone} className="text-gray-500 text-xs" />
        <p className="text-gray-600 text-xs">{contact.phone}</p>
      </div>
    )}
  </div>
);

const AddressInfo = ({ title, address }) => (
  <div className="bg-white rounded-md shadow-sm p-4 mb-4">
    <h2 className="text-sm font-semibold text-gray-800 mb-3">{title} Adress</h2>
    <p className="text-gray-600 text-xs">{address.name}</p>
    <p className="text-gray-600 text-xs">{address.street}</p>
    <p className="text-gray-600 text-xs">{address.city}, {address.state} {address.zip}</p>
    <p className="text-gray-600 text-xs">{address.country}</p>
  </div>
);

const PaymentSummary = ({ summary }) => (
  <div className="bg-white rounded-md shadow-sm p-4 mb-4">
    <h2 className="text-sm font-semibold text-gray-800 mb-3">Payment Summary</h2>
    <div className="flex justify-between text-gray-600 text-xs mb-1">
      <span>Subtotal</span>
      <span>${summary.subtotal}</span>
    </div>
    <div className="flex justify-between text-gray-600 text-xs mb-1">
      <span>Delivery</span>
      <span>${summary.delivery}</span>
    </div>
    <div className="flex justify-between text-gray-600 text-xs mb-1">
      <span>Tax ({summary.taxRate}%)</span>
      <span>${summary.tax}</span>
    </div>
    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-semibold text-gray-900 text-sm">
      <span>Total paid by customer</span>
      <span>${summary.total}</span>
    </div>
  </div>
);

const ActivityItem = ({ activity }) => (
  <div className="py-2">
    <p className="text-gray-700 text-xs">{activity.time}</p>
    <p className="text-gray-800 text-sm">{activity.description}</p>
  </div>
);

export default function OrderDetailsPage() {
  // Dummy order data for demonstration
  const order = {
    id: '#1002',
    date: '06.22.2019 at 10:14 am',
    status: 'Unfulfilled',
    items: [
      { image: 'https://via.placeholder.com/80/4682B4/FFFFFF?Text=NikeAir', name: 'Nike Air Force 1 LVR 2', color: 'Black-Pink', size: 'US 10', price: 80.00, quantity: 1, total: 80.00 },
      { image: 'https://via.placeholder.com/80/000000/FFFFFF?Text=Hoodie', name: 'UNITED STANDARD - Long Hoodie', color: 'Black', size: 'M', price: 234.00, quantity: 1, total: 234.00 },
    ],
    delivery: {
      method: 'FedEx',
      cost: 20.00,
    },
    paymentSummary: {
      subtotal: 314.00,
      delivery: 20.00,
      taxRate: 0,
      tax: 0.00,
      total: 334.00,
    },
    customer: {
      id: 'cust001',
      name: 'Eugenia Bates',
      ordersCount: 5,
    },
    contactInfo: {
      email: 'eugenia.bates@gmail.com',
      phone: '+1 (123) 123-1234',
    },
    shippingAddress: {
      name: 'Eugenia Bates',
      street: 'Savoyn Oval, 605',
      city: 'New York',
      state: 'New York',
      zip: '10101',
      country: 'United States',
    },
    billingAddress: {
      name: 'Eugenia Bates',
      street: 'Savoyn Oval, 605',
      city: 'New York',
      state: 'New York',
      zip: '10101',
      country: 'United States',
    },
    activity: [
      { time: 'TODAY', description: 'Order was placed' },
      { time: '01.10.2019', description: 'Payment was received' },
    ],
  };

  return (
    <div className="bg-gray-100 min-h-screen flex">
      {/* Left Sidebar (Similar to the image) */}
      <aside className="bg-white w-64 py-6 px-3 shadow-md">
        <div className="mb-8">
          <Link href="/" className="block text-lg font-semibold text-gray-800 mb-4">
            EYEAZY
          </Link>
          <div className="bg-green-100 text-green-700 rounded-md p-2 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center text-white text-xs">S</div>
              <span className="text-sm font-medium">Simsay shop</span>
            </div>
            <Link href="#" className="text-green-500 hover:underline text-xs block mt-1">Switch shop</Link>
          </div>
          <Link href="/home" className="block py-2 px-4 rounded-md hover:bg-gray-100 text-gray-700 font-medium">Home</Link>
          <div className="mb-2">
            <div className="block py-2 px-4 text-gray-900 font-semibold">Orders</div>
            <Link href="/orders/all" className="block py-2 px-4 rounded-md hover:bg-gray-100 text-gray-700 text-sm">All Orders</Link>
            <Link href="/orders/drafts" className="block py-2 px-4 rounded-md hover:bg-gray-100 text-gray-700 text-sm">Drafts</Link>
            <Link href="/orders/archived" className="block py-2 px-4 rounded-md hover:bg-gray-100 text-gray-700 text-sm">Archived</Link>
          </div>
          <Link href="/customers" className="block py-2 px-4 rounded-md hover:bg-gray-100 text-gray-700 font-medium">Customers</Link>
          <Link href="/products" className="block py-2 px-4 rounded-md hover:bg-gray-100 text-gray-700 font-medium">Products</Link>
          <Link href="/analytics" className="block py-2 px-4 rounded-md hover:bg-gray-100 text-gray-700 font-medium">Analytics</Link>
          <Link href="/apps" className="block py-2 px-4 rounded-md hover:bg-gray-100 text-gray-700 font-medium">Apps</Link>
          <Link href="/settings" className="block py-2 px-4 rounded-md hover:bg-gray-100 text-gray-700 font-medium">Settings</Link>
        </div>
        <div className="mt-auto p-3 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-300"></div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Cory Chandler</p>
              <p className="text-gray-500 text-xs">Owner</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link href="/orders" className="text-gray-500 hover:underline flex items-center mr-4">
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Orders
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Order #{order.id}</h1>
            <span className="text-gray-500 text-sm ml-2">{order.date}</span>
          </div>
          <div className="flex items-center space-x-2">
            {/* Action Buttons - Placeholder */}
            <button className="bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-gray-700">
              {/* Icon */}
            </button>
            <button className="bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-gray-700">
              {/* Icon */}
            </button>
            <button className="bg-blue-500 text-white rounded-md py-2 px-4 text-sm font-semibold">
              Fulfill
            </button>
          </div>
        </header>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items and Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-md shadow-sm p-4 mb-4">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <h2 className="text-sm font-semibold text-gray-800">{order.status}</h2>
              </div>
              {order.items.map((item) => (
                <OrderItem key={item.name} item={item} />
              ))}
              {order.delivery && (
                <div className="py-4 border-b border-gray-200 flex justify-between items-center text-sm">
                  <p className="text-gray-700">Delivery via {order.delivery.method}</p>
                  <p className="font-semibold text-gray-900">${order.delivery.cost}</p>
                </div>
              )}
              <PaymentSummary summary={order.paymentSummary} />
            </div>

            <div className="bg-white rounded-md shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Activity</h2>
              {order.activity.map((activity) => (
                <ActivityItem key={activity.description} activity={activity} />
              ))}
            </div>
          </div>

          {/* Right Column - Customer and Address Information */}
          <div>
            <CustomerInfo customer={order.customer} />
            <ContactInfo contact={order.contactInfo} />
            <AddressInfo title="Shipping" address={order.shippingAddress} />
            <AddressInfo title="Billing" address={order.billingAddress} />
          </div>
        </div>
      </div>
    </div>
  );
}