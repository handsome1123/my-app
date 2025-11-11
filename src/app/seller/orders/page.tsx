"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search, Filter, CheckSquare, Square, Download, MessageSquare, FileText, Package } from "lucide-react";

interface Order {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
  } | null;
  buyerId: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  shippingAddress?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  paymentSlipUrl?: string;
  notes?: {
    content: string;
    createdAt: string;
    author: string;
  }[];
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Modal states
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedOrderForNotes, setSelectedOrderForNotes] = useState<Order | null>(null);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        const res = await fetch("/api/seller/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch orders");
          setOrders([]);
        } else {
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error("DEBUG FRONTEND: Fetch error:", error);
        setError("Something went wrong");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on search and filters
  useEffect(() => {
    // console.log("DEBUG FRONTEND: Filtering orders. Total orders:", orders.length);
    // console.log("DEBUG FRONTEND: Orders data:", orders.map(o => ({ _id: o._id, productId: o.productId, buyerId: o.buyerId, status: o.status })));
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.productId?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.buyerId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyerId.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(order => new Date(order.createdAt) >= filterDate);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const handleStatusChange = async (id: string, status: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/seller/orders/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (res.ok) {
      setOrders((prev) =>
        prev.map((order) => (order._id === id ? { ...order, status } : order))
      );
    } else {
      alert(data.error || "Failed to update status");
    }
  };

  const handleRejectOrder = async (id: string) => {
    if (!confirm("Are you sure you want to reject this order?")) return;
    await handleStatusChange(id, "rejected");
  };

  // Bulk operations
  const handleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedOrders(new Set(filteredOrders.map(order => order._id)));
      setShowBulkActions(true);
    }
  };

  const handleBulkConfirm = async () => {
    const token = localStorage.getItem("token");
    const promises = Array.from(selectedOrders).map(orderId =>
      fetch(`/api/seller/orders/${orderId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "confirmed" }),
      })
    );

    try {
      await Promise.all(promises);
      // Refresh orders
      const res = await fetch("/api/seller/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
        setSelectedOrders(new Set());
        setShowBulkActions(false);
        alert("Selected orders confirmed successfully");
      }
    } catch (error) {
      alert("Failed to confirm some orders");
    }
  };

  const handleBulkShip = async () => {
    const token = localStorage.getItem("token");
    const promises = Array.from(selectedOrders).map(orderId =>
      fetch(`/api/seller/orders/ship/${orderId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    );

    try {
      await Promise.all(promises);
      // Refresh orders
      const res = await fetch("/api/seller/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
        setSelectedOrders(new Set());
        setShowBulkActions(false);
        alert("Selected orders marked as shipped");
      }
    } catch (error) {
      alert("Failed to ship some orders");
    }
  };

  // Notes functionality
  const openNotesModal = (order: Order) => {
    setSelectedOrderForNotes(order);
    setShowNotesModal(true);
  };

  const addNote = async () => {
    if (!newNote.trim() || !selectedOrderForNotes) return;

    const token = localStorage.getItem("token");
    const res = await fetch(`/api/seller/orders/${selectedOrderForNotes._id}/notes`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ note: newNote }),
    });

    if (res.ok) {
      setOrders(prev => prev.map(order =>
        order._id === selectedOrderForNotes._id
          ? { ...order, notes: [...(order.notes || []), { content: newNote, createdAt: new Date().toISOString(), author: "Seller" }] }
          : order
      ));
      setNewNote("");
    } else {
      alert("Failed to add note");
    }
  };

  // Export functionality
  const exportToCSV = () => {
    const headers = ["Order ID", "Product", "Customer", "Email", "Quantity", "Total Price", "Status", "Date"];
    const csvContent = [
      headers.join(","),
      ...filteredOrders.map(order => [
        order._id,
        `"${order.productId?.name || 'Unknown Product'}"`,
        `"${order.buyerId.name}"`,
        order.buyerId.email || "",
        order.quantity,
        order.totalPrice,
        order.status,
        new Date(order.createdAt).toLocaleDateString()
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Production logging - remove debug console logs

if (loading) {
  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading orders...</p>
      </div>
    </div>
  );
}
if (error) {
  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-red-200">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L10.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Orders</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Professional Order Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="paid">Paid</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSelectAll}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {selectedOrders.size === filteredOrders.length ? (
                <CheckSquare className="w-4 h-4 mr-2" />
              ) : (
                <Square className="w-4 h-4 mr-2" />
              )}
              Select All
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedOrders.size} order(s) selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleBulkConfirm}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  Bulk Confirm
                </button>
                <button
                  onClick={handleBulkShip}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  Bulk Ship
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4">
                <input
                  type="checkbox"
                  checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="p-4">Order ID</th>
              <th className="p-4">Product</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Shipping Address</th>
              <th className="p-4">Quantity</th>
              <th className="p-4">Total Price</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order._id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.has(order._id)}
                      onChange={() => handleSelectOrder(order._id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-4 font-medium text-gray-900">{order._id.slice(-8)}</td>
                  <td className="p-4">
                    <div className="max-w-xs truncate font-medium" title={order.productId?.name || 'Unknown Product'}>
                      {order.productId?.name || 'Unknown Product'}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm max-w-xs">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                        <p className="text-gray-600">{order.shippingAddress?.email}</p>
                        <p className="text-gray-600">{order.shippingAddress?.phone || 'No phone'}</p>
                      </div>
                      {/* {order.shippingAddress?.address && (
                        <div className="text-xs text-gray-600 border-t pt-2 mt-2">
                          <p className="font-medium text-gray-700 mb-1">Shipping Address:</p>
                          <p className="text-gray-500">{order.shippingAddress.address}</p>
                          {(order.shippingAddress.city || order.shippingAddress.state || order.shippingAddress.zipCode) && (
                            <p className="text-gray-500">
                              {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.zipCode].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                      )} */}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm max-w-xs">
                      {order.shippingAddress ? (
                        <div className="text-gray-700">
                          {/* <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p> */}
                          <p className="truncate" title={order.shippingAddress.address}>
                            {order.shippingAddress.address}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No address</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center font-medium">{order.quantity}</td>
                  <td className="p-4 font-semibold text-green-600">${order.totalPrice}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                        order.status === "pending_payment"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : order.status === "confirmed"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "shipped"
                          ? "bg-purple-100 text-purple-800"
                          : order.status === "delivered"
                          ? "bg-emerald-100 text-emerald-800"
                          : order.status === "cancelled"
                          ? "bg-gray-100 text-gray-800"
                          : order.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openNotesModal(order)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Add Notes"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      {order.status === "paid" && (
                        <button
                          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-all shadow-sm hover:shadow"
                          onClick={() => handleStatusChange(order._id, "confirmed")}
                        >
                          Confirm
                        </button>
                      )}
                      {order.status === "confirmed" && (
                        <button
                          className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-all shadow-sm hover:shadow"
                          onClick={() => handleStatusChange(order._id, "shipped")}
                        >
                          Ship
                        </button>
                      )}
                      {order.status === "shipped" && (
                        <button
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-all shadow-sm hover:shadow"
                          onClick={() => handleStatusChange(order._id, "delivered")}
                        >
                          Deliver
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="text-center py-8 text-gray-500">
                  <div className="text-center">
                    <div className="bg-white border border-gray-200 rounded-lg p-8 text-center max-w-md mx-auto">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                      <p className="text-gray-500 mb-6">
                        When buyers purchase your products, their orders will appear here.<br/>
                        You can manage order statuses, add notes, and track fulfillment.
                      </p>
                      <div className="text-sm text-gray-400">
                        <p>Total Orders: {orders.length} | Filtered: {filteredOrders.length}</p>
                        <p>Loading: {loading ? 'true' : 'false'} | Error: {error || 'none'}</p>
                      </div>
                    </div>
                    {(searchTerm || statusFilter !== "all" || dateFilter !== "all") && (
                      <div className="mt-4">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p>No orders found matching your criteria.</p>
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("all");
                            setDateFilter("all");
                          }}
                          className="mt-2 text-blue-600 hover:text-blue-700 text-sm underline"
                        >
                          Clear filters
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Notes Modal */}
      {showNotesModal && selectedOrderForNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Order Notes</h3>
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Order: {selectedOrderForNotes._id.slice(-8)} - {selectedOrderForNotes.productId?.name || 'Unknown Product'}
                </p>
                {selectedOrderForNotes.shippingAddress && (
                  <div className="text-xs text-gray-500 mb-3 p-2 bg-gray-50 rounded">
                    <p><strong>Customer:</strong> {selectedOrderForNotes.shippingAddress.firstName} {selectedOrderForNotes.shippingAddress.lastName}</p>
                    <p><strong>Phone:</strong> {selectedOrderForNotes.shippingAddress.phone}</p>
                    {/* <p><strong>Address:</strong> {selectedOrderForNotes.shippingAddress.address}, {selectedOrderForNotes.shippingAddress.city}</p> */}
                  </div>
                )}

                {/* Existing Notes */}
                <div className="max-h-32 overflow-y-auto mb-3">
                  {selectedOrderForNotes.notes && selectedOrderForNotes.notes.length > 0 ? (
                    selectedOrderForNotes.notes.map((note, index) => (
                      <div key={index} className="bg-gray-50 p-2 rounded mb-2 text-sm">
                        <p>{note.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {note.author} • {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No notes yet</p>
                  )}
                </div>

                {/* Add New Note */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && addNote()}
                  />
                  <button
                    onClick={addNote}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
