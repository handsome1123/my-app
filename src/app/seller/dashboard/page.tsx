'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faEnvelope,
  faSearch,
  faUserCircle,
} from '@fortawesome/free-solid-svg-icons'; // Import more icons as needed

const DashboardCard = ({ title, value, color }) => (
  <div className={`bg-${color}-500 text-white rounded-lg shadow-md p-4 flex flex-col justify-center items-center`}>
    <h3 className="text-sm font-semibold mb-1">{title}</h3>
    <span className="text-2xl font-bold">{value}</span>
  </div>
);

const RecentOrderRow = ({ order }) => (
  <div className="bg-white rounded-md shadow-sm p-3 mb-2 flex items-center text-sm">
    <div className="w-12 h-12 mr-3 overflow-hidden rounded-md shadow-inner">
      <Image src={order.image} alt={order.productCode} className="w-full h-full object-cover" />
    </div>
    <div className="flex-grow">
      <p className="font-semibold text-gray-800">{order.productCode}</p>
      <p className="text-gray-600 text-xs">{order.category}</p>
    </div>
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${order.status === 'Active' ? 'bg-green-200 text-green-700' : 'bg-yellow-200 text-yellow-700'}`}>
      {order.status}
    </span>
    <span className="text-gray-700 ml-4">{order.trackingId}</span>
  </div>
);

const UserRatingCard = ({ rating }) => (
  <div className="bg-white rounded-md shadow-sm p-3 mb-2">
    <div className="flex items-center mb-2">
      <div className="w-8 h-8 mr-2 overflow-hidden rounded-full">
        <Image src={rating.avatar} alt={rating.username} className="w-full h-full object-cover" />
      </div>
      <p className="text-sm font-semibold text-gray-800">{rating.username}</p>
    </div>
    <p className="text-gray-600 text-xs italic mb-2">{`"${rating.comment}"`}</p>
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < rating.rating ? 'text-yellow-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.928c-0.532-1.136-2.392-1.136-2.924 0l-2.184 4.686-4.651 0c-1.12 0-1.629 1.291-0.879 2.051l3.383 3.235-0.786 4.636c-0.225 1.346 1.13 2.424 2.116 1.727l4.163-2.33 4.163 2.33c0.986 0.697 2.341-0.381 2.116-1.727l-0.786-4.636 3.383-3.235c0.75-0.76 0.241-2.051-0.879-2.051l-4.651 0-2.184-4.686z" />
        </svg>
      ))}
    </div>
  </div>
);

export default function AmazonSellerDashboard() {
  // Dummy data for demonstration
  const dashboardMetrics = [
    { title: 'Total Products', value: '1080', color: 'blue' },
    { title: 'Total Orders', value: '980', color: 'purple' },
    { title: 'Total Profit', value: '$12120', color: 'yellow' },
    { title: 'New Orders', value: '320', color: 'green' },
  ];

  const recentOrders = [
    { image: 'https://via.placeholder.com/48/000000/FFFFFF?Text=T', productCode: 'ASIN001', category: 'T-Shirt', status: 'Active', trackingId: 'TRACK123' },
    { image: 'https://via.placeholder.com/48/0000FF/FFFFFF?Text=S', productCode: 'ASIN002', category: 'Shoes', status: 'Inactive', trackingId: 'TRACK456' },
    { image: 'https://via.placeholder.com/48/FFFFFF/000000?Text=M', productCode: 'ASIN003', category: 'Mug', status: 'Active', trackingId: 'TRACK789' },
    { image: 'https://via.placeholder.com/48/FF0000/FFFFFF?Text=B', productCode: 'ASIN004', category: 'Book', status: 'Active', trackingId: 'TRACK012' },
  ];

  const userRatings = [
    { avatar: 'https://via.placeholder.com/32/FFA07A/FFFFFF?Text=JD', username: 'johndoe', comment: 'The product delivered by the seller was on time and matched the product quality.', rating: 4 },
    { avatar: 'https://via.placeholder.com/32/ADD8E6/000000?Text=AS', username: 'alice_smith', comment: 'The product is brilliant! The seller was also very responsive and helpful.', rating: 5 },
  ];

  return (
    <div className="bg-gray-100 min-h-screen flex">
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="relative mr-4">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input type="text" placeholder="Q Product Search ASIN" className="bg-gray-200 rounded-md py-2 pl-10 pr-3 focus:outline-none" />
            </div>
          </div>
          <div className="flex items-center">
            <Link href="/notifications" className="relative mr-4">
              <FontAwesomeIcon icon={faBell} className="text-xl text-gray-700" />
              {/* Optional: Notification badge */}
              {/* <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span> */}
            </Link>
            <Link href="/messages" className="mr-4">
              <FontAwesomeIcon icon={faEnvelope} className="text-xl text-gray-700" />
            </Link>
            <Link href="/account" className="flex items-center">
              <FontAwesomeIcon icon={faUserCircle} className="text-2xl text-gray-700 mr-1" />
              <span className="text-gray-700 text-sm">Hi, User</span>
            </Link>
          </div>
        </header>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {dashboardMetrics.map((metric) => (
            <DashboardCard key={metric.title} title={metric.title} value={metric.value} color={metric.color} />
          ))}
        </div>

        {/* Analytics and Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Analytics</h2>
            {/* Placeholder for charts */}
            <div className="h-48 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
              {/* Replace with actual chart components (e.g., using libraries like Chart.js, Recharts) */}
              <p>Analytics Charts Placeholder</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Recent Orders</h2>
            <div>
              {recentOrders.map((order) => (
                <RecentOrderRow key={order.productCode} order={order} />
              ))}
            </div>
            {/* Optional: View All Orders Link */}
            {/* <Link href="/orders" className="block mt-3 text-blue-500 hover:underline text-sm">View All Orders</Link> */}
          </div>
        </div>

        {/* User Rating on the Product Experience */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">User Rating on the Product Experience</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userRatings.map((rating) => (
              <UserRatingCard key={rating.username} rating={rating} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
