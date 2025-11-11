"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  Trash2,
  CheckCheck,
  Clock,
  Package,
  CreditCard,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  payload?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const notificationIcons = {
  order_status_update: Package,
  review_request: Clock,
  refund_processed: CreditCard,
  default: Bell
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [marking, setMarking] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchNotifications = useCallback(async (page: number = 1) => {
    console.log('fetchNotifications called with page:', page, 'filter:', filter);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      setLoading(true);
      const url = `/api/buyer/notifications?page=${page}&limit=20${filter === "unread" ? "&unreadOnly=true" : ""}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
        setPagination(data.pagination);
        setUnreadCount(data.unreadCount || 0);
      } else {
        setError(data.error || "Failed to fetch notifications");
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, [filter, router]);

  useEffect(() => {
    console.log('useEffect running for notifications with new fetchNotifications reference, filter:', filter);
    fetchNotifications(1);
  }, [filter, fetchNotifications]);

  const handleBulkAction = async (action: "markAsRead" | "markAsUnread" | "delete") => {
    if (selectedNotifications.size === 0) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const loadingState = action === "delete" ? setDeleting : setMarking;
    loadingState(true);

    try {
      const res = await fetch("/api/buyer/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          notificationIds: Array.from(selectedNotifications),
          action
        }),
      });

      if (res.ok) {
        // Refresh notifications and clear selection
        await fetchNotifications(pagination?.page || 1);
        setSelectedNotifications(new Set());
      } else {
        const data = await res.json();
        alert(data.error || "Action failed");
      }
    } catch (err) {
      console.error("Bulk action error:", err);
      alert("Action failed");
    } finally {
      loadingState(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map(n => n._id)));
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    const IconComponent = notificationIcons[type as keyof typeof notificationIcons] || notificationIcons.default;
    return IconComponent;
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-xl shadow-lg">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => fetchNotifications(1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
                </p>
              </div>
            </div>
            <button
              onClick={() => fetchNotifications(pagination?.page || 1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All ({pagination?.total || 0})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === "unread"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Bulk Actions */}
        {selectedNotifications.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">
                {selectedNotifications.size} notification{selectedNotifications.size > 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction("markAsRead")}
                  disabled={marking}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-60"
                >
                  {marking ? "Marking..." : "Mark Read"}
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  disabled={deleting}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-60"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-md mx-auto">
              <BellOff className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filter === "unread" ? "No unread notifications" : "No notifications yet"}
              </h3>
              <p className="text-gray-500">
                {filter === "unread"
                  ? "You're all caught up!"
                  : "Notifications about your orders and account will appear here."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Select All */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={selectedNotifications.size === notifications.length && notifications.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300"
              />
              <label className="text-sm text-gray-600">Select all</label>
            </div>

            {/* Individual Notifications */}
            {notifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification._id}
                  className={`bg-white rounded-lg border p-4 transition-all ${
                    notification.isRead
                      ? "border-gray-200"
                      : "border-blue-200 bg-blue-50/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.has(notification._id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedNotifications);
                        if (e.target.checked) {
                          newSelected.add(notification._id);
                        } else {
                          newSelected.delete(notification._id);
                        }
                        setSelectedNotifications(newSelected);
                      }}
                      className="mt-1 rounded border-gray-300"
                    />

                    <div className={`p-2 rounded-full ${notification.isRead ? "bg-gray-100" : "bg-blue-100"}`}>
                      <IconComponent className={`w-4 h-4 ${notification.isRead ? "text-gray-600" : "text-blue-600"}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className={`font-semibold ${notification.isRead ? "text-gray-900" : "text-blue-900"}`}>
                            {notification.title}
                          </h3>
                          <p className={`text-sm mt-1 ${notification.isRead ? "text-gray-600" : "text-gray-800"}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {getTimeAgo(notification.createdAt)}
                          </p>
                        </div>

                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => fetchNotifications(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>

            <button
              onClick={() => fetchNotifications(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}