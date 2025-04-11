'use client';

const OrderCard = ({ order }) => {
  const handleTrackOrder = () => {
    alert(`Simulating tracking order: ${order.orderId}`);
    console.log(`Tracking order: ${order.orderId}`);
    // In a real application, you would likely navigate to a tracking page
  };

  const handleCancelOrder = () => {
    const confirmCancel = confirm(`Are you sure you want to cancel order ${order.orderId}?`);
    if (confirmCancel) {
      alert(`Simulating cancellation of order: ${order.orderId}`);
      console.log(`Cancelling order: ${order.orderId}`);
      // In a real application, you would likely make an API call to cancel
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Order <span className="text-blue-500">{order.orderId}</span>
          </h2>
          <p className="text-gray-500 text-xs">Order Placed: {order.orderDate}</p>
        </div>
        <button
          onClick={handleTrackOrder}
          className="bg-orange-500 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-md text-xs focus:outline-none focus:shadow-outline-orange"
        >
          Track Order
        </button>
      </div>

      {order.items.map((item) => (
        <div key={item.id} className="flex items-center mb-4">
          <div className="w-16 h-16 mr-4 overflow-hidden rounded-md shadow-inner">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-grow">
            <h3 className="text-sm font-semibold text-gray-800">{item.name}</h3>
            <p className="text-gray-600 text-xs">{item.designer}</p>
            <p className="text-gray-600 text-xs">Size: {item.size}, Qty: {item.quantity}, Rs. {item.price}</p>
          </div>
          <div>
            <p className="text-sm text-gray-700">Status: <span className="text-green-500 font-semibold">{item.status}</span></p>
            <p className="text-sm text-gray-700">Delivery Expected by: <span className="font-semibold">{item.deliveryDate}</span></p>
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handleCancelOrder}
          className="text-red-500 hover:underline text-xs font-semibold focus:outline-none"
        >
          X CANCEL ORDER
        </button>
        <p className="text-gray-600 text-xs">Paid using credit card ending with {order.paymentLastDigits}</p>
        <p className="text-lg font-semibold text-gray-900">Rs. {order.totalAmount}</p>
      </div>
    </div>
  );
};

export default function MyOrdersPage() {
  // Dummy order data (replace with your actual data fetching)
  const orders = [
    {
      orderId: '#R0374915036',
      orderDate: 'Thu, 17th Nov \'16',
      items: [
        {
          id: 1,
          name: 'Netting Mykonos Tunic Dress',
          designer: 'By Milly Thomas',
          size: 'S',
          quantity: 1,
          price: 1250,
          image: 'https://via.placeholder.com/80/D3D3D3/FFFFFF?Text=Dress1',
          status: 'In-Transit',
          deliveryDate: '24 December 2016',
        },
      ],
      paymentLastDigits: '7343',
      totalAmount: 1250,
    },
    {
      orderId: '#R0374915037',
      orderDate: 'Fri, 25th Nov \'16',
      items: [
        {
          id: 2,
          name: 'Embroidered Sequin Mini Dress',
          designer: 'By Sonia Agrawal',
          size: 'S',
          quantity: 1,
          price: 1760,
          image: 'https://via.placeholder.com/80/696969/FFFFFF?Text=Dress2',
          status: 'In-Transit',
          deliveryDate: '24 December 2016',
        },
      ],
      paymentLastDigits: '9876',
      totalAmount: 1760,
    },
    // Add more order objects here
  ];

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500">
            View and edit all your pending, delivered, and returned orders here.
          </p>
        </div>

        <div>
          {orders.map((order) => (
            <OrderCard key={order.orderId} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}