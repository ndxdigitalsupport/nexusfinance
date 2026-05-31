import { LoanApplication, Task, Transaction, PlatformConfig, PlatformStats } from './types';

export const INITIAL_APPLICATIONS: LoanApplication[] = [
  {
    id: '#77281',
    applicantName: 'Somchai V.',
    applicantEmail: 'somchai.v@nexusport.com',
    initials: 'SV',
    amount: 12500,
    type: 'SME Loan',
    status: 'Review',
    urgency: 'Normal',
    assignedToMe: true,
    date: '2026-05-28',
    purpose: 'Business inventory expansion and equipment upgrades.',
    creditScore: 720,
    monthlyIncome: 6200,
    durationMonths: 24
  },
  {
    id: '#77295',
    applicantName: 'Nguyen Khanh',
    applicantEmail: 'nguyen.k@nexusport.com',
    initials: 'NK',
    amount: 45000,
    type: 'Housing',
    status: 'Review',
    urgency: 'Urgent',
    assignedToMe: true,
    date: '2026-05-29',
    purpose: 'Primary residence down payment funding.',
    creditScore: 685,
    monthlyIncome: 8500,
    durationMonths: 180
  },
  {
    id: '#77310',
    applicantName: 'Preeya P.',
    applicantEmail: 'preeya.p@nexusport.com',
    initials: 'PP',
    amount: 2500,
    type: 'Personal',
    status: 'Review',
    urgency: 'Normal',
    assignedToMe: true,
    date: '2026-05-30',
    purpose: 'Medical procedure coverage and short-term liquidity.',
    creditScore: 745,
    monthlyIncome: 3100,
    durationMonths: 12
  },
  {
    id: '#77215',
    applicantName: 'Anan S.',
    applicantEmail: 'anan.s@nexusport.com',
    initials: 'AS',
    amount: 15000,
    type: 'SME Loan',
    status: 'New',
    urgency: 'Urgent',
    assignedToMe: true,
    date: '2026-05-27',
    purpose: 'Store renovative project and marketing campaigns.',
    creditScore: 710,
    monthlyIncome: 5800,
    durationMonths: 36
  },
  {
    id: '#77382',
    applicantName: 'Emily Chen',
    applicantEmail: 'emily.c@nexusport.com',
    initials: 'EC',
    amount: 32000,
    type: 'Auto',
    status: 'Hold',
    urgency: 'Urgent',
    assignedToMe: false,
    date: '2026-05-25',
    purpose: 'Eco-friendly electric vehicle purchase financing.',
    creditScore: 640,
    monthlyIncome: 4500,
    durationMonths: 60
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'KYC Verification Call',
    applicant: 'Anan S.',
    regarding: 'SME Loan #7721',
    time: '14:00 PM',
    completed: false
  },
  {
    id: 't2',
    title: 'Credit Score Audit',
    applicant: 'Nguyen Khanh',
    regarding: 'Housing Loan #77295',
    time: '15:30 PM',
    completed: false
  },
  {
    id: 't3',
    title: 'Collateral Registry Verification',
    applicant: 'Somchai V.',
    regarding: 'SME Loan #77281',
    time: '16:45 PM',
    completed: true
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx1',
    title: 'Repayment',
    date: 'Nov 28, 2023',
    amount: -250.00,
    type: 'Repayment'
  },
  {
    id: 'tx2',
    title: 'Loan Disbursement',
    date: 'Nov 15, 2023',
    amount: 1200.00,
    type: 'Loan Disbursement'
  },
  {
    id: 'tx3',
    title: 'Fee',
    date: 'Nov 01, 2023',
    amount: -15.00,
    type: 'Fee'
  }
];

export const DEFAULT_CONFIG: PlatformConfig = {
  baseInterestRate: 5.4,
  maxLoanAmount: 500000,
  kycRequired: true,
  autoApproveLimit: 5000
};

export const DEFAULT_STATS: PlatformStats = {
  totalVolume: 843500,
  activeCustomers: 142,
  outstandingBalanceValue: 124500,
  interestEarned: 24320
};
