"use client";

import { useEffect, useState, useCallback } from "react";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User, Store, UserMinus, ExternalLink } from "lucide-react";

interface FollowedSeller {
  _id: string;
  sellerId: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function FollowingPage() {
  const router = useRouter();
  const [following, setFollowing] = useState<FollowedSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null);

  const fetchFollowing = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/buyer/follow", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setFollowing(data.followedSellers || []);
      } else {
        setError(data.error || "Failed to fetch following list");
      }
    } catch (err) {
      console.error("Failed to fetch following:", err);
      setError("Failed to fetch following list");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchFollowing();
  }, [fetchFollowing]);

  const unfollowSeller = async (sellerId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setUnfollowingId(sellerId);
    try {
      const res = await fetch("/api/buyer/follow", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ sellerId }),
      });

      if (res.ok) {
        setFollowing(prev => prev.filter(f => f.sellerId._id !== sellerId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to unfollow seller");
      }
    } catch (err) {
      console.error("Unfollow error:", err);
      alert("Error unfollowing seller");
    } finally {
      setUnfollowingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading following list...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-xl shadow-lg">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={fetchFollowing}
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
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Following</h1>
              <p className="text-gray-600">
                Sellers you&apos;re following ({following.length})
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {following.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-md mx-auto">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Not following anyone yet</h3>
              <p className="text-gray-500 mb-4">
                Follow sellers to get notified about their new products and updates!
              </p>
              <Link
                href="/buyer/dashboard"
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {following.map((follow) => (
              <div
                key={follow._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Store className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{follow.sellerId.name}</h3>
                      <p className="text-sm text-gray-600">{follow.sellerId.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Following since {new Date(follow.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => unfollowSeller(follow.sellerId._id)}
                    disabled={unfollowingId === follow.sellerId._id}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-60"
                    title="Unfollow"
                  >
                    <UserMinus className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/buyer/products?seller=${follow.sellerId._id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Products
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}