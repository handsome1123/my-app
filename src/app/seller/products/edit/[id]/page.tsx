"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ArrowLeft, 
  Save, 
  X, 
  Upload, 
  Package, 
  DollarSign, 
  FileText, 
  Hash,
  AlertTriangle,
  CheckCircle,
  Eye,
  Camera
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  stock: number;
  category?: string;
  isActive?: boolean;
}

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const categories = [
    "Electronics", "Clothing", "Books", "Home & Garden", 
    "Sports", "Beauty", "Toys", "Automotive", "Health", "Food"
  ];

  // Auto-clear messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Fetch product data
  // useEffect(() => {
  //   const fetchProduct = async () => {
  //       const token = localStorage.getItem("token");
  //         if (!token) {
  //           router.replace("/login"); // redirect to login if not authenticated
  //           return; // ✅ exit early to prevent API call
  //         }

  //     try {
  //       setLoading(true);
  //       setError("");

  //       const res = await fetch(`/api/seller/products/${id}`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
        
  //       const data = await res.json();
  //       if (!res.ok) {
  //         throw new Error(data.error || "Failed to fetch product");
  //       }

  //       const productData = data.product;
  //       setProduct(productData);
  //       setName(productData.name || "");
  //       setDescription(productData.description || "");
  //       setPrice(productData.price?.toString() || "");
  //       setStock(productData.stock?.toString() || "");
  //       setCategory(productData.category || "");
  //       setIsActive(productData.isActive ?? true);
        
  //       // Set preview image if exists
  //       if (productData.imageUrl) {
  //         setPreviewImage(productData.imageUrl);
  //       }
  //     } catch {
  //       setError("Failed to load product");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (id) {
  //     fetchProduct();
  //   }
  // }, [id]);
  useEffect(() => {
    const fetchProduct = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login"); // redirect if not authenticated
        return; // exit early
      }

      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/seller/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch product");
        }

        const productData = data.product;
        setProduct(productData);
        setName(productData.name || "");
        setDescription(productData.description || "");
        setPrice(productData.price?.toString() || "");
        setStock(productData.stock?.toString() || "");
        setCategory(productData.category || "");
        setIsActive(productData.isActive ?? true);

        if (productData.imageUrl) {
          setPreviewImage(productData.imageUrl);
        }
      } catch {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, router]); // ✅ add router here


  // Handle file input change
  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      
      setImage(file);
      
      // Clean up previous preview URL
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
      
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setError("Please select a valid image file");
    }
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Remove image
  const removeImage = () => {
    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(product?.imageUrl || null);
    setImage(null);
  };

  // Form validation
  const validateForm = () => {
    if (!name.trim()) {
      setError("Product name is required");
      return false;
    }
    if (!price || parseFloat(price) <= 0) {
      setError("Price must be greater than 0");
      return false;
    }
    if (!stock || parseInt(stock) < 0) {
      setError("Stock must be 0 or greater");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("price", parseFloat(price).toString());
      formData.append("stock", parseInt(stock).toString());
      formData.append("category", category);
      formData.append("isActive", isActive.toString());
      
      if (image) {
        formData.append("image", image);
      }

      const res = await fetch(`/api/seller/products/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Product updated successfully!");
        setTimeout(() => {
          router.push("/seller/products");
        }, 1500);
      } else {
        setError(data.error || "Update failed");
      }
    } catch {
      setError("Failed to update product. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name: fieldName, value } = e.target;
    
    switch (fieldName) {
      case "name": setName(value); break;
      case "description": setDescription(value); break;
      case "price": setPrice(value); break;
      case "stock": setStock(value); break;
      case "category": setCategory(value); break;
    }
    
    // Clear error when user starts typing
    if (error) setError("");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The product you're looking for doesn't exist."}</p>
          <button
            onClick={() => router.push("/seller/products")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/seller/products")}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </button>
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600">Update your product information</p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {(error || success) && (
          <div className="mb-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleUpdate} className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Product Information</h2>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Product Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    <Package className="w-4 h-4 inline mr-2" />
                    Product Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                    placeholder="Describe your product..."
                  />
                </div>

                {/* Price and Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-2" />
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                      <Hash className="w-4 h-4 inline mr-2" />
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      value={stock}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                {/* Category and Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Product is active</span>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => router.push("/seller/products")}
                    className="flex-1 flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {updating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update Product
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar - Image Upload & Preview */}
          <div className="space-y-6">
            {/* Current Image */}
            {previewImage && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Current Image</h3>
                </div>
                <div className="p-6">
                  <div className="relative">
                    <Image
                      src={previewImage}
                      alt={name || "Product"}
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover rounded-lg"
                      unoptimized={previewImage.startsWith("blob:")}
                    />
                    {image && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Image Upload */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  <Camera className="w-5 h-5 inline mr-2" />
                  Update Image
                </h3>
              </div>
              <div className="p-6">
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 transition-colors text-center ${
                    dragActive
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Product Stats</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Views</span>
                  <span className="text-sm font-medium flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {Math.floor(Math.random() * 500)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}