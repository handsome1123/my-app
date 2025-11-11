"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Star, Gift, TrendingUp, Award, Clock, CheckCircle } from "lucide-react";

interface LoyaltyData {
  points: number;
  lifetimePoints: number;
  level: number;
  levelName: string;
  progressToNext: number;
  nextLevelThreshold: number;
  transactions: {
    type: "earned" | "redeemed" | "expired";
    points: number;
    reason: string;
    createdAt: string;
  }[];
}

interface Reward {
  _id: string;
  title: string;
  description: string;
  pointsRequired: number;
  rewardType: string;
  discountValue?: number;
  discountType?: string;
  category: string;
  isActive: boolean;
  minimumLevel: number;
}

interface RewardsData {
  rewards: Reward[];
  userPoints: number;
  userLevel: number;
}

const levelConfig = {
  1: { name: "Bronze", color: "text-amber-700", bgColor: "bg-amber-100", icon: "🥉" },
  2: { name: "Silver", color: "text-gray-600", bgColor: "bg-gray-100", icon: "🥈" },
  3: { name: "Gold", color: "text-yellow-600", bgColor: "bg-yellow-100", icon: "🥇" },
  4: { name: "Platinum", color: "text-blue-600", bgColor: "bg-blue-100", icon: "💎" },
  5: { name: "Diamond", color: "text-purple-600", bgColor: "bg-purple-100", icon: "💎" }
};

export default function LoyaltyPage() {
  const router = useRouter();
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [rewardsData, setRewardsData] = useState<RewardsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "rewards" | "history">("overview");
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const fetchLoyaltyData = useCallback(async () => {
    console.log('fetchLoyaltyData called');
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      setLoading(true);

      // Fetch points data
      const pointsRes = await fetch("/api/buyer/loyalty?type=points", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const pointsData = await pointsRes.json();
      if (pointsRes.ok) {
        setLoyaltyData(pointsData);
      } else {
        setError(pointsData.error || "Failed to fetch loyalty data");
      }

      // Fetch rewards data
      const rewardsRes = await fetch("/api/buyer/loyalty?type=rewards", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rewardsData = await rewardsRes.json();
      if (rewardsRes.ok) {
        setRewardsData(rewardsData);
      }
    } catch (err) {
      console.error("Failed to fetch loyalty data:", err);
      setError("Failed to fetch loyalty data");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    console.log('useEffect running with new fetchLoyaltyData reference');
    fetchLoyaltyData();
  }, [fetchLoyaltyData]);

  const handleRedeemReward = async (rewardId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setRedeemingId(rewardId);
    try {
      const res = await fetch("/api/buyer/loyalty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: "redeem", rewardId }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Successfully redeemed: ${data.reward}!`);
        await fetchLoyaltyData(); // Refresh data
      } else {
        alert(data.error || "Failed to redeem reward");
      }
    } catch (err) {
      console.error("Redeem error:", err);
      alert("Error redeeming reward");
    } finally {
      setRedeemingId(null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading loyalty program...</p>
        </div>
      </div>
    );
  }

  if (error || !loyaltyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-xl shadow-lg">
          <p className="text-red-500 text-lg mb-4">{error || "Failed to load loyalty data"}</p>
          <button
            onClick={fetchLoyaltyData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const levelInfo = levelConfig[loyaltyData.level as keyof typeof levelConfig] || levelConfig[1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/10 rounded-xl">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Loyalty Program</h1>
              <p className="text-blue-100">Earn points and unlock exclusive rewards</p>
            </div>
          </div>

          {/* Points Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
              <div className="text-3xl font-bold mb-2">{loyaltyData.points.toLocaleString()}</div>
              <div className="text-blue-100">Current Points</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
              <div className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                {levelInfo.icon}
                {loyaltyData.levelName}
              </div>
              <div className="text-blue-100">Current Level</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
              <div className="text-3xl font-bold mb-2">{loyaltyData.lifetimePoints.toLocaleString()}</div>
              <div className="text-blue-100">Lifetime Points</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-xl p-6">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold">Progress to Next Level</span>
              <span className="text-blue-100">
                {loyaltyData.lifetimePoints.toLocaleString()} / {loyaltyData.nextLevelThreshold.toLocaleString()} pts
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${loyaltyData.progressToNext * 100}%` }}
              ></div>
            </div>
            <div className="text-center mt-2 text-sm text-blue-100">
              {Math.round((1 - loyaltyData.progressToNext) * loyaltyData.nextLevelThreshold)} points to next level
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
          {[
            { id: "overview", label: "Overview", icon: Star },
            { id: "rewards", label: "Rewards", icon: Gift },
            { id: "history", label: "History", icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* How to Earn Points */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                How to Earn Points
              </h3>
              <div className="space-y-3">
                {[
                  { action: "Make a purchase", points: "1 point per ฿10 spent" },
                  { action: "Leave a review", points: "10 points per review" },
                  { action: "Follow a seller", points: "5 points per follow" },
                  { action: "Share products", points: "2 points per share" },
                  { action: "Complete profile", points: "50 points (one-time)" }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="text-gray-700">{item.action}</span>
                    <span className="font-semibold text-green-600">{item.points}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Level Benefits */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Level Benefits
              </h3>
              <div className="space-y-3">
                {[
                  { level: "Bronze", benefit: "Basic member benefits" },
                  { level: "Silver", benefit: "5% bonus points on purchases" },
                  { level: "Gold", benefit: "Free shipping on orders over ฿500" },
                  { level: "Platinum", benefit: "Exclusive early access to sales" },
                  { level: "Diamond", benefit: "Personal shopping assistant" }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className={`font-medium ${index < loyaltyData.level ? 'text-gray-900' : 'text-gray-500'}`}>
                      {item.level}
                    </span>
                    {index < loyaltyData.level && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "rewards" && rewardsData && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Available Rewards</h3>
            {rewardsData.rewards.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No rewards available at your current level</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewardsData.rewards.map((reward) => (
                  <div key={reward._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Gift className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{reward.pointsRequired}</div>
                        <div className="text-sm text-gray-500">points</div>
                      </div>
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-2">{reward.title}</h4>
                    <p className="text-gray-600 text-sm mb-4">{reward.description}</p>

                    <div className="text-xs text-gray-500 mb-4">
                      Category: {reward.category} • Level {reward.minimumLevel}+ required
                    </div>

                    <button
                      onClick={() => handleRedeemReward(reward._id)}
                      disabled={rewardsData.userPoints < reward.pointsRequired || redeemingId === reward._id}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                    >
                      {redeemingId === reward._id ? "Redeeming..." :
                       rewardsData.userPoints < reward.pointsRequired ? "Insufficient Points" : "Redeem Reward"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Points History</h3>
            {loyaltyData.transactions.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No transaction history yet</p>
                <p className="text-sm text-gray-400">Start earning points to see your history here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {loyaltyData.transactions.map((transaction, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === "earned" ? "bg-green-100" :
                          transaction.type === "redeemed" ? "bg-blue-100" : "bg-red-100"
                        }`}>
                          {transaction.type === "earned" ? "+" :
                           transaction.type === "redeemed" ? "-" : "×"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.reason}</p>
                          <p className="text-sm text-gray-500">{getTimeAgo(transaction.createdAt)}</p>
                        </div>
                      </div>
                      <div className={`font-bold ${
                        transaction.type === "earned" ? "text-green-600" :
                        transaction.type === "redeemed" ? "text-blue-600" : "text-red-600"
                      }`}>
                        {transaction.type === "earned" ? "+" : transaction.type === "redeemed" ? "-" : ""}
                        {transaction.points} pts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}