import React from 'react';
import { 
  Clock, 
  Info,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { Transaction, LoanApplication } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface CustomerDashboardProps {
  userName: string;
  outstandingBalance: number;
  walletBalance: number;
  transactions: Transaction[];
  onApplyLoanClick: () => void;
  onSetActiveMenu: (menu: string) => void;
  onInstantApprovedFastCash: (amount: number) => void;
  applications: LoanApplication[];
}

export default function CustomerDashboard({
  userName,
  outstandingBalance,
  walletBalance,
  transactions,
  onApplyLoanClick,
  onSetActiveMenu,
  onInstantApprovedFastCash,
  applications
}: CustomerDashboardProps) {
  const { formatCurrency, t } = useCurrency();

  const nextDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const daysUntilDue = Math.ceil((nextDueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  // Dynamic active loan resolver
  const activeLoan = applications.find(
    (app) => 
      ['Approved', 'Approved', 'disbursed'].includes(app.status) && 
      app.repaymentStatus !== 'Paid'
  );

  let loanTermMonths = 24;
  let currentMonth = 1;
  let progressPercent = 0;

  if (activeLoan) {
    loanTermMonths = activeLoan.durationMonths || 12;
    
    // Calculate months passed since disbursement date
    const startDate = new Date(activeLoan.date);
    const currentDate = new Date();
    const monthsPassed = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + (currentDate.getMonth() - startDate.getMonth());
    
    currentMonth = Math.max(1, Math.min(monthsPassed + 1, loanTermMonths));
    
    // Compute progress based on actual repayments paid
    const repayments = transactions.filter(t => t.type === 'Repayment');
    const totalRepaid = Math.abs(repayments.reduce((sum, r) => sum + r.amount, 0));
    progressPercent = Math.min(100, Math.round((totalRepaid / activeLoan.amount) * 100));
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* HUD Header */}
      <div className="select-none">
        <h2 className="text-[32px] md:text-[36px] font-sans font-extrabold text-[var(--text-primary)] tracking-tight">Welcome, {userName.split(' ')[0]}</h2>
        <p className="text-[14.5px] text-[var(--text-secondary)] font-medium mt-0.5">Access your balances, active requests and more.</p>
      </div>

      {/* Main Balance Card */}
      <div className="premium-card-dark text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden group">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1" style={{ color: 'var(--text-primary)' }}>
                <span className="text-[11px] font-bold uppercase tracking-widest leading-none" style={{ color: 'var(--text-tertiary)' }}>Balance</span>
                <span title="Current sum total of approved credit lines minus repayments" className="cursor-help inline-flex">
                  <Info className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                </span>
              </div>
              <span
                className="text-[44px] sm:text-[52px] leading-tight font-extrabold font-sans tracking-tighter"
                style={{ color: 'var(--text-primary)' }}
              >
                {formatCurrency(outstandingBalance)}
              </span>
            </div>

            <div className="flex items-center gap-4 text-[13px] select-none">
              <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Due {nextDueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                <Timer className="w-4 h-4" />
                <span className="font-medium">{daysUntilDue} days left</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSetActiveMenu('khqr')}
              className="px-6 py-3 text-[14px] font-bold rounded-xl transition-all duration-200 cursor-pointer select-none bg-white/10 border border-[var(--border-primary)] hover:bg-white/20"
              style={{ color: 'var(--text-primary)', backdropFilter: 'blur(8px)' }}
            >
              Repay
            </button>
            <button
              onClick={onApplyLoanClick}
              className="premium-btn-primary px-6 py-3 text-[14px] select-none"
            >
              Apply Loan
            </button>
          </div>
        </div>
      </div>

      {/* Loan Progress */}
      {outstandingBalance > 0 && (
        <div className="premium-card rounded-2xl p-5 sm:p-6 select-none">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-[var(--accent)]" />
              <span className="text-[14px] font-bold text-[var(--text-primary)]">{t('loan_progress')}</span>
            </div>
            <span className="text-[12px] font-bold text-[var(--text-secondary)]">
              {t('month')} {currentMonth} {t('of')} {loanTermMonths}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-secondary)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%`, backgroundColor: 'var(--accent)' }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[11px] font-bold text-[var(--text-tertiary)]">
            <span>{t('started')}</span>
            <span>{progressPercent}% {t('complete')}</span>
            <span>{t('completed')}</span>
          </div>
        </div>
      )}

      {/* Recent History - Full Width */}
      <div className="premium-card rounded-2xl p-6 shadow-xs select-none">
        <div className="flex justify-between items-center pb-3 border-b border-[var(--border-primary)] mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4.5 h-4.5 text-[var(--text-secondary)]" />
            <h3 className="text-[15px] font-bold text-[var(--text-primary)] uppercase tracking-wider">Recent History</h3>
          </div>
          <button
            onClick={() => onSetActiveMenu('loans')}
            className="text-[var(--text-secondary)] font-bold hover:underline text-[12px] cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="divide-y divide-[var(--border-primary)]">
          {transactions.length > 0 ? (
            transactions.slice(0, 6).map((tx, idx) => {
              const isPositive = tx.amount > 0;
              return (
                <div key={tx.id} className={`stagger-${Math.min(idx + 1, 6)} flex justify-between items-center py-3.5 group hover:bg-[var(--surface-secondary)] px-2 rounded-lg transition-colors`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: isPositive ? 'var(--success-bg)' : 'var(--error-bg)',
                        color: isPositive ? 'var(--success-text)' : 'var(--error-text)'
                      }}
                    >
                      {isPositive ? <ArrowDownLeft className="w-4.5 h-4.5" /> : <ArrowUpRight className="w-4.5 h-4.5" />}
                    </div>
                    <div>
                      <span className="text-[14px] font-extrabold text-[var(--text-primary)] block">{tx.title}</span>
                      <span className="text-[11px] text-[var(--text-tertiary)] block mt-0.5">{tx.date}</span>
                    </div>
                  </div>

                  <span className="text-[15.5px] font-bold font-mono"
                    style={{color: isPositive ? 'var(--success-text)' : 'var(--error-text)'}}
                  >
                    {isPositive ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="p-10 text-center text-[13px] text-[var(--text-secondary)]">
              No recent transaction activities recorded.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
