"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Star, ThumbsUp } from "lucide-react";

interface Review {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  rating: number;
  title?: string;
  comment?: string;
  verified: boolean;
  helpful: number;
  createdAt: string;
}

interface ReviewStats {
  total: number;
  average: number;
  distribution: number[];
}

export default function ProductReviewsPage() {
  const params = useParams();
  const productId = params.id as string;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    console.log('fetchReviews called');
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/buyer/reviews?productId=${productId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (res.ok) {
        setReviews(data.reviews || []);
        setStats(data.stats);
      } else {
        setError(data.error || "Failed to fetch reviews");
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setError("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    console.log('useEffect running for reviews, productId:', productId);
    if (productId) {
      fetchReviews();
    }
  }, [productId, fetchReviews]);


  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
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
            onClick={fetchReviews}
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
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Customer Reviews</h1>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">{stats.average.toFixed(1)}</div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(stats.average))}
                </div>
                <div className="text-gray-500">{stats.total} reviews</div>
              </div>

              {/* Rating Distribution */}
              <div className="col-span-2">
                <h3 className="font-semibold text-gray-900 mb-3">Rating Breakdown</h3>
                {[5, 4, 3, 2, 1].map((rating, index) => (
                  <div key={rating} className="flex items-center gap-3 mb-2">
                    <div className="text-sm text-gray-600 w-8">{rating}★</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${stats.total > 0 ? (stats.distribution[index] / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 w-8">{stats.distribution[index]}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-md mx-auto">
              <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-500">Be the first to leave a review for this product!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {review.userId.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{review.userId.name}</div>
                      {review.verified && (
                        <div className="text-sm text-green-600 flex items-center gap-1">
                          ✓ Verified Purchase
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex mb-1">
                      {renderStars(review.rating)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {review.title && (
                  <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                )}

                {review.comment && (
                  <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      Helpful ({review.helpful})
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}