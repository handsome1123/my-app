/**
 * Commission calculation utilities
 */

export interface CommissionConfig {
  percent: number;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
}

export class CommissionService {
  private config: CommissionConfig;

  constructor(config?: Partial<CommissionConfig>) {
    this.config = {
      percent: Number(process.env.COMMISSION_PERCENT ?? 10),
      minAmount: 0,
      maxAmount: undefined,
      currency: 'THB',
      ...config,
    };

    // Validate configuration
    if (this.config.percent < 0 || this.config.percent > 100) {
      throw new Error('Commission percentage must be between 0 and 100');
    }

    if (this.config.minAmount && this.config.minAmount < 0) {
      throw new Error('Minimum commission amount cannot be negative');
    }

    if (this.config.maxAmount && this.config.maxAmount < 0) {
      throw new Error('Maximum commission amount cannot be negative');
    }

    if (this.config.minAmount && this.config.maxAmount && this.config.minAmount > this.config.maxAmount) {
      throw new Error('Minimum commission cannot be greater than maximum commission');
    }
  }

  /**
   * Calculate commission amount from gross amount
   * @param grossAmount - The total gross amount
   * @returns Object containing commission and net amounts
   */
  calculate(grossAmount: number): { commission: number; netAmount: number; grossAmount: number } {
    if (grossAmount < 0) {
      throw new Error('Gross amount cannot be negative');
    }

    const commission = Math.round((grossAmount * this.config.percent) / 100 * 100) / 100;

    // Apply min/max constraints
    let finalCommission = commission;
    if (this.config.minAmount !== undefined && finalCommission < this.config.minAmount) {
      finalCommission = this.config.minAmount;
    }
    if (this.config.maxAmount !== undefined && finalCommission > this.config.maxAmount) {
      finalCommission = this.config.maxAmount;
    }

    const netAmount = Math.round((grossAmount - finalCommission) * 100) / 100;

    return {
      commission: finalCommission,
      netAmount: Math.max(0, netAmount), // Ensure net amount is never negative
      grossAmount,
    };
  }

  /**
   * Get current commission configuration
   */
  getConfig(): CommissionConfig {
    return { ...this.config };
  }

  /**
   * Update commission configuration
   */
  updateConfig(newConfig: Partial<CommissionConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Re-validate
    if (this.config.percent < 0 || this.config.percent > 100) {
      throw new Error('Commission percentage must be between 0 and 100');
    }

    if (this.config.minAmount && this.config.minAmount < 0) {
      throw new Error('Minimum commission amount cannot be negative');
    }

    if (this.config.maxAmount && this.config.maxAmount < 0) {
      throw new Error('Maximum commission amount cannot be negative');
    }

    if (this.config.minAmount && this.config.maxAmount && this.config.minAmount > this.config.maxAmount) {
      throw new Error('Minimum commission cannot be greater than maximum commission');
    }
  }
}

// Global commission service instance
export const commissionService = new CommissionService();

// Helper function for backward compatibility
export function calculateCommission(grossAmount: number): { commission: number; netAmount: number } {
  return commissionService.calculate(grossAmount);
}