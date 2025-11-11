/**
 * Payout analytics and reporting utilities
 */

import { connectToDatabase } from "./mongodb";

export interface PayoutSummary {
  totalPayouts: number;
  totalGrossAmount: number;
  totalCommission: number;
  totalNetAmount: number;
  pendingCount: number;
  paidCount: number;
  failedCount: number;
  retryingCount: number;
  averageCommissionRate: number;
  topSellersByVolume: Array<{
    sellerId: string;
    totalPaid: number;
    payoutCount: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    totalGross: number;
    totalNet: number;
    payoutCount: number;
  }>;
}

export interface PayoutAnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  sellerId?: string;
  status?: string;
  currency?: string;
}

/**
 * Generate comprehensive payout analytics
 */
export async function generatePayoutAnalytics(filters: PayoutAnalyticsFilters = {}): Promise<PayoutSummary> {
  const { db } = await connectToDatabase();
  const payoutsCol = db.collection("payouts");

  // Build match query
  const matchQuery: any = {};
  if (filters.startDate || filters.endDate) {
    matchQuery.createdAt = {};
    if (filters.startDate) matchQuery.createdAt.$gte = filters.startDate;
    if (filters.endDate) matchQuery.createdAt.$lte = filters.endDate;
  }
  if (filters.sellerId) matchQuery.sellerId = filters.sellerId;
  if (filters.status) matchQuery.status = filters.status;
  if (filters.currency) matchQuery.currency = filters.currency;

  // Aggregate pipeline for summary stats
  const summaryPipeline = [
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalPayouts: { $sum: 1 },
        totalGrossAmount: { $sum: "$grossAmount" },
        totalCommission: { $sum: "$commission" },
        totalNetAmount: { $sum: "$netAmount" },
        pendingCount: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
        },
        paidCount: {
          $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] }
        },
        failedCount: {
          $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] }
        },
        retryingCount: {
          $sum: { $cond: [{ $eq: ["$status", "retrying"] }, 1, 0] }
        },
        averageCommissionRate: {
          $avg: {
            $cond: [
              { $gt: ["$grossAmount", 0] },
              { $divide: ["$commission", "$grossAmount"] },
              0
            ]
          }
        }
      }
    }
  ];

  const summaryResult = await payoutsCol.aggregate(summaryPipeline).toArray();
  const summary = summaryResult[0] || {
    totalPayouts: 0,
    totalGrossAmount: 0,
    totalCommission: 0,
    totalNetAmount: 0,
    pendingCount: 0,
    paidCount: 0,
    failedCount: 0,
    retryingCount: 0,
    averageCommissionRate: 0,
  };

  // Get top sellers by volume (paid payouts only)
  const topSellersPipeline = [
    {
      $match: {
        ...matchQuery,
        status: "paid"
      }
    },
    {
      $group: {
        _id: "$sellerId",
        totalPaid: { $sum: "$netAmount" },
        payoutCount: { $sum: 1 }
      }
    },
    {
      $sort: { totalPaid: -1 }
    },
    {
      $limit: 10
    }
  ];

  const topSellersResult = await payoutsCol.aggregate(topSellersPipeline).toArray();
  const topSellersByVolume = topSellersResult.map(item => ({
    sellerId: String(item._id),
    totalPaid: item.totalPaid,
    payoutCount: item.payoutCount,
  }));

  // Get monthly trends (last 12 months)
  const monthlyTrendsPipeline = [
    {
      $match: {
        ...matchQuery,
        status: "paid",
        createdAt: {
          $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Last 12 months
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        totalGross: { $sum: "$grossAmount" },
        totalNet: { $sum: "$netAmount" },
        payoutCount: { $sum: 1 }
      }
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 }
    }
  ];

  const monthlyTrendsResult = await payoutsCol.aggregate(monthlyTrendsPipeline).toArray();
  const monthlyTrends = monthlyTrendsResult.map(item => ({
    month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    totalGross: item.totalGross,
    totalNet: item.totalNet,
    payoutCount: item.payoutCount,
  }));

  return {
    totalPayouts: summary.totalPayouts,
    totalGrossAmount: summary.totalGrossAmount,
    totalCommission: summary.totalCommission,
    totalNetAmount: summary.totalNetAmount,
    pendingCount: summary.pendingCount,
    paidCount: summary.paidCount,
    failedCount: summary.failedCount,
    retryingCount: summary.retryingCount,
    averageCommissionRate: summary.averageCommissionRate * 100, // Convert to percentage
    topSellersByVolume,
    monthlyTrends,
  };
}

/**
 * Get payout performance metrics
 */
export async function getPayoutPerformanceMetrics(days: number = 30): Promise<{
  successRate: number;
  averageProcessingTime: number;
  failureReasons: Array<{ reason: string; count: number }>;
  retrySuccessRate: number;
}> {
  const { db } = await connectToDatabase();
  const payoutsCol = db.collection("payouts");

  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Success rate: paid / (paid + failed) for payouts created in the period
  const successRatePipeline = [
    {
      $match: {
        createdAt: { $gte: cutoffDate },
        status: { $in: ["paid", "failed"] }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        successful: {
          $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] }
        }
      }
    }
  ];

  const successRateResult = await payoutsCol.aggregate(successRatePipeline).toArray();
  const successRate = successRateResult[0] ?
    (successRateResult[0].successful / successRateResult[0].total) * 100 : 0;

  // Average processing time for paid payouts
  const processingTimePipeline = [
    {
      $match: {
        status: "paid",
        createdAt: { $gte: cutoffDate },
        paidAt: { $exists: true }
      }
    },
    {
      $project: {
        processingTime: {
          $divide: [
            { $subtract: ["$paidAt", "$createdAt"] },
            1000 * 60 * 60 // Convert to hours
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        averageProcessingTime: { $avg: "$processingTime" }
      }
    }
  ];

  const processingTimeResult = await payoutsCol.aggregate(processingTimePipeline).toArray();
  const averageProcessingTime = processingTimeResult[0]?.averageProcessingTime || 0;

  // Common failure reasons
  const failureReasonsPipeline = [
    {
      $match: {
        status: "failed",
        createdAt: { $gte: cutoffDate },
        lastError: { $exists: true }
      }
    },
    {
      $group: {
        _id: "$lastError",
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 5
    }
  ];

  const failureReasonsResult = await payoutsCol.aggregate(failureReasonsPipeline).toArray();
  const failureReasons = failureReasonsResult.map(item => ({
    reason: String(item._id),
    count: item.count,
  }));

  // Retry success rate
  const retrySuccessPipeline = [
    {
      $match: {
        retryCount: { $gt: 0 },
        createdAt: { $gte: cutoffDate }
      }
    },
    {
      $group: {
        _id: null,
        totalRetries: { $sum: 1 },
        successfulRetries: {
          $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] }
        }
      }
    }
  ];

  const retrySuccessResult = await payoutsCol.aggregate(retrySuccessPipeline).toArray();
  const retrySuccessRate = retrySuccessResult[0] ?
    (retrySuccessResult[0].successfulRetries / retrySuccessResult[0].totalRetries) * 100 : 0;

  return {
    successRate,
    averageProcessingTime,
    failureReasons,
    retrySuccessRate,
  };
}

/**
 * Export payout data for reporting
 */
export async function exportPayoutData(filters: PayoutAnalyticsFilters = {}): Promise<string> {
  const { db } = await connectToDatabase();
  const payoutsCol = db.collection("payouts");

  const query: any = { ...filters };
  if (filters.startDate) query.createdAt = { $gte: filters.startDate };
  if (filters.endDate) {
    query.createdAt = { ...query.createdAt, $lte: filters.endDate };
  }

  const payouts = await payoutsCol.find(query).sort({ createdAt: -1 }).toArray();

  // CSV headers
  const headers = [
    "Payout ID",
    "Order ID",
    "Seller ID",
    "Gross Amount",
    "Commission",
    "Net Amount",
    "Currency",
    "Status",
    "Created At",
    "Paid At",
    "Provider ID",
    "Last Error",
    "Retry Count"
  ];

  // CSV rows
  const rows = payouts.map(payout => [
    String(payout._id),
    String(payout.orderId || ""),
    String(payout.sellerId || ""),
    String(payout.grossAmount || 0),
    String(payout.commission || 0),
    String(payout.netAmount || 0),
    payout.currency || "THB",
    payout.status || "",
    payout.createdAt ? payout.createdAt.toISOString() : "",
    payout.paidAt ? payout.paidAt.toISOString() : "",
    payout.transferId || "",
    payout.lastError || "",
    String(payout.retryCount || 0)
  ]);

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return csvContent;
}