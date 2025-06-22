'use client';

import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faGripHorizontal,
  faChevronDown,
  faFilter,
  faPlus,
  faEllipsisV,
} from '@fortawesome/free-solid-svg-icons';

interface Product {
  image: string;
  name: string;
  id: string;
  price: number;
  stock: number;
  sales: number;
  totalSales: number;
  active: boolean;
}

const ProductRow = ({ product }: { product: Product }) => (
  <div className="bg-white rounded-md shadow-sm p-3 mb-2 flex items-center text-sm">
    <div className="w-12 h-12 mr-3 overflow-hidden rounded-md shadow-inner relative">
      <Image
        src={product.image}
        alt={product.name}
        layout="fill"
        objectFit="cover"
        unoptimized={false}
        priority={false}
        sizes="48px"
      />
    </div>
    <div className="flex-grow">
      <h3 className="font-semibold text-gray-800">{product.name}</h3>
      <p className="text-gray-600 text-xs">{product.id}</p>
    </div>
    <span className="text-gray-700">${product.price.toFixed(2)}</span>
    <div className="flex items-center text-gray-600 mx-4">
      <span>{product.stock}</span>
    </div>
    <div className="relative w-32 bg-gray-200 rounded-full h-4 overflow-hidden mr-4">
      <div
        className="bg-green-400 h-full rounded-full"
        style={{ width: `${(product.sales / product.totalSales) * 100}%` }}
      ></div>
      <span className="absolute left-1/2 -translate-x-1/2 text-xs text-gray-700">{`${product.sales}/${product.totalSales}`}</span>
    </div>
    <div className="flex items-center mr-2">
      <div className={`w-6 h-6 rounded-full ${product.active ? 'bg-green-400' : 'bg-gray-400'}`}></div>
    </div>
    <FontAwesomeIcon icon={faEllipsisV} className="text-gray-500 ml-2 cursor-pointer" />
  </div>
);

export default function ProductList() {
  const products: Product[] = [
    {
      image: 'https://via.placeholder.com/48/000000/FFFFFF?Text=T',
      name: 'Oversized Heritage Washed',
      id: '087654MT',
      price: 84.99,
      stock: 1000,
      sales: 800,
      totalSales: 1000,
      active: true,
    },
    {
      image: 'https://via.placeholder.com/48/FFC0CB/FFFFFF?Text=H',
      name: 'Pink Sweatshirt With Hoodie',
      id: '087654MT',
      price: 54.99,
      stock: 583,
      sales: 600,
      totalSales: 1000,
      active: true,
    },
    {
      image: 'https://via.placeholder.com/48/ADD8E6/000000?Text=S',
      name: 'Soft and Light Break',
      id: '087654MT',
      price: 79.99,
      stock: 700,
      sales: 420,
      totalSales: 1000,
      active: false,
    },
    {
      image: 'https://via.placeholder.com/48/000000/FFFFFF?Text=B',
      name: 'Bot Chelsea With Black',
      id: '087654MT',
      price: 84.99,
      stock: 922,
      sales: 900,
      totalSales: 1000,
      active: true,
    },
    {
      image: 'https://via.placeholder.com/48/6495ED/FFFFFF?Text=D',
      name: 'Shirt With Patterned Design',
      id: '087654MT',
      price: 35.49,
      stock: 840,
      sales: 882,
      totalSales: 1000,
      active: true,
    },
    {
      image: 'https://via.placeholder.com/48/E0FFFF/000000?Text=O',
      name: 'Oxford Shirt',
      id: '087654MT',
      price: 68.99,
      stock: 200,
      sales: 200,
      totalSales: 1000,
      active: false,
    },
    {
      image: 'https://via.placeholder.com/48/F0F8FF/000000?Text=W',
      name: 'White Oversize Blazer',
      id: '087654MT',
      price: 44.99,
      stock: 450,
      sales: 540,
      totalSales: 1000,
      active: true,
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen flex">
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900 mr-4">Product</h1>
          </div>
          <div className="flex items-center">
            <div className="relative mr-4">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-gray-100 rounded-md py-2 pl-10 pr-3 focus:outline-none text-sm"
              />
            </div>
            {/* User Info Placeholder */}
            <div className="flex items-center text-sm text-gray-700">
              <div className="w-8 h-8 rounded-full bg-gray-300 mr-2"></div>
              <span>Oliver Foster</span>
              <FontAwesomeIcon icon={faChevronDown} className="ml-1" />
            </div>
          </div>
        </header>

        {/* Filters and Actions */}
        <div className="bg-white rounded-md shadow-sm p-4 mb-4 flex items-center space-x-4">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faGripHorizontal} className="text-gray-500 mr-2" />
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-100 rounded-md py-2 pl-3 pr-8 focus:outline-none text-sm"
            />
            <FontAwesomeIcon icon={faSearch} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
          <div className="relative">
            <select className="bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none appearance-none">
              <option>Show All Products</option>
              {/* Add more options */}
            </select>
            <FontAwesomeIcon icon={faChevronDown} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
          <div className="relative">
            <select className="bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none appearance-none">
              <option>Sort by: Default</option>
              {/* Add more sorting options */}
            </select>
            <FontAwesomeIcon icon={faChevronDown} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
          <button className="bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-gray-700 flex items-center">
            <FontAwesomeIcon icon={faFilter} className="mr-2" />
            Filter
          </button>
          <button className="bg-purple-600 text-white rounded-md py-2 px-4 text-sm font-semibold flex items-center">
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Add new product
          </button>
        </div>

        {/* Product List Header */}
        <div className="bg-gray-100 rounded-md p-3 mb-2 grid grid-cols-6 gap-4 text-xs text-gray-600">
          <span>Product Info</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Sales Rate</span>
          <span>Active</span>
          <span></span>
        </div>

        {/* Product List */}
        <div>
          {products.map((product, idx) => (
            <ProductRow key={`${product.name}-${idx}`} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
