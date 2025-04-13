'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCamera, faTrash, faPlus, faCalendarAlt } from '@fortawesome/free-solid-svg-icons'; // Import more icons as needed

export default function AddNewProduct() {
  return (
    <div className="bg-gray-100 min-h-screen flex">
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link href="/management/product-list" className="text-gray-500 hover:underline flex items-center mr-4">
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back to List
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Add New Product</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button className="bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-gray-700 flex items-center">
              <FontAwesomeIcon icon={faCamera} className="mr-2" />
              Scan To Fill Form
            </button>
            <button className="bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-gray-700">
              Save to Draft
            </button>
          </div>
        </header>

        {/* Form Content */}
        <div className="bg-white rounded-md shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Product Image</h2>
            <div className="flex items-center mb-3">
              <span className="bg-gray-200 text-gray-700 rounded-md px-2 py-1 text-xs mr-2">Tag</span>
            </div>
            <div className="relative w-48 h-48 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
              <img src="https://via.placeholder.com/150/D3D3D3/FFFFFF?Text=Product" alt="Product Preview" className="max-w-full max-h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-2 flex justify-around">
                <button className="text-sm">Replace</button>
                <button className="text-sm text-red-400">Remove</button>
              </div>
            </div>
            <button className="mt-3 text-blue-500 hover:underline text-sm flex items-center">
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Another Image
            </button>
          </div>

          {/* General Information Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">General Information</h2>
            <div className="mb-3">
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                id="productName"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter product name"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="productType" className="block text-sm font-medium text-gray-700 mb-1">
                Product Type
              </label>
              <input
                type="text"
                id="productType"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value="Moisturizer"
                readOnly
              />
            </div>
            <div className="mb-3">
              <label htmlFor="productMark" className="block text-sm font-medium text-gray-700 mb-1">
                Product Mark
              </label>
              <input
                type="text"
                id="productMark"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value="Scarlett Whitening"
                readOnly
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="price"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="100.00"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
                  Discount <span className="text-gray-500">(Optional)</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="discount"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="20%"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="discountPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Price
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="text"
                    id="discountPrice"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    value="$ 80.00"
                    readOnly
                  />
                </div>
              </div>
              <div></div> {/* Empty cell for alignment */}
            </div>
            <div className="mb-3">
              <label htmlFor="businessDescriptions" className="block text-sm font-medium text-gray-700 mb-1">
                Bussiness Descriptions
              </label>
              <textarea
                id="businessDescriptions"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter business descriptions"
              ></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  id="expirationDate"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md pr-10"
                  placeholder="MM/DD/YYYY"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Manage Stock Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Manage Stock</h2>
            <div className="mb-3">
              <label htmlFor="stockKeepingUnit" className="block text-sm font-medium text-gray-700 mb-1">
                Stock Keeping Unit
              </label>
              <input
                type="text"
                id="stockKeepingUnit"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value="SKC0013600003"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-3">
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </label>
                <input
                  type="number"
                  id="stock"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value="2.000"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="minimumStock" className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Stock
                </label>
                <input
                  type="number"
                  id="minimumStock"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value="10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}