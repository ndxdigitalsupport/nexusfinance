/**
 * Nexusfinance Dashboard State Types
 */

export type PortalType = 'portal-selection' | 'customer' | 'loan-officer' | 'super-admin';

export interface LoanApplication {
  id: string; // e.g., "#77281"
  applicantName: string;
  applicantEmail: string;
  initials: string;
  amount: number;
  type: 'SME Loan' | 'Housing' | 'Personal' | 'Auto';
  status: 'New' | 'Review' | 'Final' | 'Hold' | 'Approved' | 'Rejected';
  urgency: 'Normal' | 'Urgent';
  assignedToMe: boolean;
  date: string;
  purpose: string;
  creditScore: number;
  monthlyIncome: number;
  durationMonths: number;
}

export interface Task {
  id: string;
  title: string;
  applicant: string;
  regarding: string;
  time: string;
  completed: boolean;
}

export interface Transaction {
  id: string;
  title: string;
  date: string;
  amount: number; // Positive for disbursement, negative for payment/repayment or fee
  type: 'Repayment' | 'Loan Disbursement' | 'Fee' | 'Internal Transfer';
}

export interface PlatformConfig {
  baseInterestRate: number; // e.g., 5.4%
  maxLoanAmount: number; // e.g., 500000
  kycRequired: boolean;
  autoApproveLimit: number; // e.g., 2000
}

export interface PlatformStats {
  totalVolume: number;
  activeCustomers: number;
  outstandingBalanceValue: number;
  interestEarned: number;
}

export type CurrencyCode = 'USD' | 'KHR';

export const EXCHANGE_RATE_KHR = 4100; // 1 USD = 4,100 KHR (approximate)

// ── KHQR Types ──────────────────────────────────────────────

export interface KHQRGenerateRequest {
  bakongAccountId: string;
  merchantName: string;
  merchantCity: string;
  currency: '840' | '116';
  amount?: number;
  countryCode?: string;
  storeLabel?: string;
  phone?: string;
  email?: string;
}

export interface KHQRGenerateResponse {
  success: boolean;
  khqrString: string;
  referenceId: string;
  merchantInfo: {
    name: string;
    city: string;
    currency: string;
    amount?: number;
  };
  crc: string;
}

export interface KHQRVerifyResponse {
  success: boolean;
  responseCode: number;
  responseMessage: string;
  valid: boolean;
}

export interface KHQRDecodeResponse {
  success: boolean;
  data: Record<string, string>;
  merchantInfo: {
    accountId?: string;
    name?: string;
    city?: string;
    currency?: string;
    amount?: string;
    country?: string;
  };
  crcValid: boolean;
}

export interface KHQRDeeplinkResponse {
  success: boolean;
  deeplink: string;
  md5: string;
}

export interface KHQRTransactionCheckResponse {
  success: boolean;
  transactionStatus: string;
  responseCode: number;
  responseMessage: string;
  transactionId?: string;
}
