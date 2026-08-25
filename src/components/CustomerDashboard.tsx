import React from 'react';
import { 
  PlusCircle, 
  HelpCircle, 
  Clock, 
  QrCode,
  Info,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { Transaction } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface CustomerDashboardProps {
  userName: string;
  outstandingBalance: number;
  walletBalance: number;
  transactions: Transaction[];
  onApplyLoanClick: () => void;
  onRepayClick: () => void;
  onSetActiveMenu: (menu: string) => void;
  onInstantApprovedFastCash: (amount: number) => void;
}

export default function CustomerDashboard({
  userName,
  outstandingBalance,
  walletBalance,
  transactions,
  onApplyLoanClick,
  onRepayClick,
  onSetActiveMenu,
  onInstantApprovedFastCash
}: CustomerDashboardProps) {
  const { formatCurrency } = useCurrency();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* HUD Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 select-none">
        <div>
          <h2 className="text-[32px] md:text-[36px] font-sans font-extrabold text-[var(--text-primary)] tracking-tight">Welcome, {userName.split(' ')[0]}</h2>
          <p className="text-[14.5px] text-[var(--text-secondary)] font-medium mt-0.5">Access your balances, active requests and more.</p>
        </div>
      </div>

      {/* Grid Canvas Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column - main stats, actions, promotion banner */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main balance card */}
          <div className="premium-card-dark text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between md:items-center relative overflow-hidden group">

            <div className="space-y-5 relative z-10">
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

            <div className="space-y-0.5 select-none text-[13.5px]">
                <p style={{ color: 'var(--text-secondary)' }} className="font-medium">Next scheduled installment</p>
                <p className="font-bold text-[var(--text-primary)] text-[15px]">{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="mt-6 md:mt-0 relative z-10 shrink-0">
              <button
                onClick={onApplyLoanClick}
                className="premium-btn-primary w-full sm:w-auto px-8 py-3.5 text-[14.5px] select-none"
              >
                Apply Loan
              </button>
            </div>
          </div>

          {/* Core Action Squares layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 select-none">
            <button onClick={onApplyLoanClick}
              className="stagger-1 p-5 text-center flex flex-col items-center justify-center hover-lift group cursor-pointer rounded-2xl transition-all duration-200"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--text-inverse)' }}
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-3 group-hover:scale-105 duration-200">
                <PlusCircle className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[13.5px] font-extrabold">Apply Loan</span>
            </button>
            <button onClick={() => onSetActiveMenu('khqr')}
              className="stagger-2 premium-card p-5 text-center flex flex-col items-center justify-center hover-lift group cursor-pointer"
              style={{ borderColor: 'rgba(139, 92, 246, 0.3)' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 duration-200"
                style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}
              >
                <QrCode className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[13.5px] font-extrabold text-[var(--text-primary)]">KHQR Payment</span>
            </button>
            <button onClick={() => onSetActiveMenu('support')}
              className="stagger-3 premium-card p-5 text-center flex flex-col items-center justify-center hover-lift group cursor-pointer"
              style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 duration-200"
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}
              >
                <HelpCircle className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[13.5px] font-extrabold text-[var(--text-primary)]">Support Hub</span>
            </button>
          </div>

        </div>

        {/* Right column - Chronicles history lists */}
        <div className="lg:col-span-4 select-none">
          
          <div className="premium-card rounded-2xl p-6 shadow-xs h-full flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Box header toolbar */}
              <div className="flex justify-between items-center pb-2 border-b border-[var(--border-primary)]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4.5 h-4.5 text-[var(--text-secondary)]" />
                  <h3 className="text-[15px] font-bold text-[var(--text-primary)] uppercase tracking-wider">Recent History</h3>
                </div>
                <button
                  onClick={() => onSetActiveMenu('transactions')}
                  className="text-[var(--text-secondary)] font-bold hover:underline text-[12px] cursor-pointer"
                >
                  View All
                </button>
              </div>

              {/* Transactions feed list */}
              <div className="divide-y divide-[var(--border-primary)] space-y-1.5">
                {transactions.length > 0 ? (
                  transactions.slice(0, 5).map((tx, idx) => {
                    const isPositive = tx.amount > 0;
                    return (
                      <div key={tx.id} className={`stagger-${Math.min(idx + 1, 6)} flex justify-between items-center py-3.5 group hover:bg-[var(--surface-secondary)] p-1.5 rounded-lg transition-colors`}>
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
                  <div className="p-8 text-center text-[12px] text-[var(--text-secondary)]">
                    No recent transaction activities recorded.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
