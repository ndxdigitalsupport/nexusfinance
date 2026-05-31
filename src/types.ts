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
