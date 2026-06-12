import React, { useState } from 'react';
import { 
  PlusCircle, 
  Coins, 
  HelpCircle, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  Wallet,
  Info,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  X
} from 'lucide-react';
import { Transaction } from '../types';

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
  const [showFastCashPromo, setShowFastCashPromo] = useState(false);
  const [fastCashAmtValue, setFastCashAmtValue] = useState('2000.00');
  const [promoSuccess, setPromoSuccess] = useState(false);

  const handleInstantFastCash = () => {
    const amt = parseFloat(fastCashAmtValue);
    if (!isNaN(amt) && amt > 0 && amt <= 5000) {
      onInstantApprovedFastCash(amt);
      setPromoSuccess(true);
      setTimeout(() => {
        setPromoSuccess(false);
        setShowFastCashPromo(false);
      }, 1500);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* HUD Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 select-none">
        <div>
          <h2 className="text-[32px] md:text-[36px] font-sans font-extrabold text-[var(--text-primary)] tracking-tight">Welcome, {userName.split(' ')[0]}</h2>
          <p className="text-[14.5px] text-[var(--text-secondary)] font-medium mt-0.5">Access your outstanding balances, active requests and wallet balances.</p>
        </div>
        <div className="flex gap-2">
          <div className="premium-card flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-xs">
            <Coins className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            <div>
              <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider block">Vault Wallet</span>
              <span className="text-[14px] font-extrabold font-mono text-[var(--text-primary)]">${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Canvas Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column - main stats, actions, promotion banner */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Outstanding balance card */}
          <div className="premium-card-dark text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between md:items-center relative overflow-hidden group">

            <div className="space-y-5 relative z-10">
              <div>
                <div className="flex items-center gap-1.5 mb-1" style={{ color: 'var(--card-dark-text)' }}>
                  <span className="text-[11px] font-bold uppercase tracking-widest leading-none">Outstanding Balance</span>
                  <Info className="w-4 h-4 cursor-help" title="Current sum total of approved credit lines minus repayments" />
                </div>
                <span className="text-[44px] sm:text-[52px] leading-tight font-extrabold font-sans tracking-tighter">
                  ${outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="space-y-0.5 select-none text-[13.5px]">
                <p style={{ color: 'var(--card-dark-text)' }} className="font-medium">Next scheduled installment</p>
                <p className="font-bold text-white text-[15px]">{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="mt-6 md:mt-0 relative z-10 shrink-0">
              <button
                onClick={onRepayClick}
                className="premium-btn-primary w-full sm:w-auto px-8 py-3.5 text-[14.5px] select-none"
              >
                Repay Now
              </button>
            </div>
          </div>

          {/* Core Action Squares layout */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 select-none">
            <button onClick={onApplyLoanClick}
              className="stagger-1 p-5 text-center flex flex-col items-center justify-center hover-lift group cursor-pointer rounded-2xl transition-all duration-200"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--text-inverse)' }}
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-3 group-hover:scale-105 duration-200">
                <PlusCircle className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[13.5px] font-extrabold">Apply Loan</span>
            </button>
            <button onClick={onRepayClick}
              className="stagger-2 premium-card p-5 text-center flex flex-col items-center justify-center hover-lift group cursor-pointer"
              style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 duration-200"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}
              >
                <Coins className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[13.5px] font-extrabold text-[var(--text-primary)]">Repay Account</span>
            </button>
            <button onClick={() => onSetActiveMenu('wallets')}
              className="stagger-3 premium-card p-5 text-center flex flex-col items-center justify-center hover-lift group cursor-pointer"
              style={{ borderColor: 'rgba(139, 92, 246, 0.3)' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 duration-200"
                style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}
              >
                <Wallet className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[13.5px] font-extrabold text-[var(--text-primary)]">My Wallets</span>
            </button>
            <button onClick={() => onSetActiveMenu('support')}
              className="stagger-4 premium-card p-5 text-center flex flex-col items-center justify-center hover-lift group cursor-pointer"
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

          {/* Fast Cash quick-access banner */}
          <button 
            onClick={() => setShowFastCashPromo(true)} 
            className="w-full text-left rounded-[24px] p-6 relative overflow-hidden group cursor-pointer shadow-md select-none hover:shadow-xl transition duration-300 border border-[var(--border-primary)]"
            style={{ backgroundColor: 'var(--surface-card)' }}
          >
            {/* Animated Aurora Background Sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/10 via-[var(--accent-secondary)]/10 to-[var(--accent-tertiary)]/10 bg-[length:200%_200%] animate-aurora-sweep pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-[var(--accent)]/20 to-transparent skew-x-12 pointer-events-none group-hover:translate-x-4 transition-transform duration-500"></div>

            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2">
                <span className="inline-flex px-2.5 py-1 text-[11px] font-sans font-extrabold rounded-full border uppercase tracking-wider"
                  style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)', borderColor: 'rgba(92, 242, 208, 0.25)' }}
                >
                  Quick Access
                </span>
                <h3 className="text-[22px] font-sans font-bold tracking-tight" style={{ color: 'var(--card-dark-text-bright)' }}>Fast Cash Loan</h3>
                <p className="text-[13.5px] max-w-sm" style={{ color: 'var(--card-dark-text)' }}>Need funds quickly? Request a microloan up to $5,000 — auto-approved and deposited to your wallet in minutes.</p>
              </div>

              <div className="font-bold text-[14px] flex items-center gap-1 shrink-0 transition-transform group-hover:translate-x-1"
                style={{ color: 'var(--accent)' }}
              >
                <span>Apply Now</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
          </button>

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
                          {isPositive ? '+' : '-'}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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

      {/* FAST CASH INSTANT PROMOTION CHECKPOINT DIALOG MOCK */}
      {showFastCashPromo && (
        <div className="fixed inset-0 bg-[var(--modal-overlay)] backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-[#0f171c] text-white border border-white/10 w-full max-w-md rounded-2xl shadow-xl overflow-hidden relative">
            <button
              onClick={() => setShowFastCashPromo(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {promoSuccess ? (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-[#5cf2d0]/10 text-[#5cf2d0] rounded-full flex items-center justify-center mb-6 animate-pulse border border-[#5cf2d0]/20">
                  <Sparkles className="w-10 h-10" />
                </div>
                <h3 className="text-[20px] font-sans font-bold text-white mb-2">Microloan Disbursed!</h3>
                <p className="text-[13px] text-slate-300 mb-6">
                  ${parseFloat(fastCashAmtValue).toLocaleString()} USD was auto-approved and deposited immediately to your digital wallet. Outstanding credit levels adjusted.
                </p>
              </div>
            ) : (
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-[20px] font-bold text-white flex items-center gap-1.5">
                    <PiggyBank className="w-5 h-5 text-[#5cf2d0]" /> Fast Cash Micro-Credit
                  </h3>
                  <p className="text-[11.5px] text-slate-400 mt-1 leading-relaxed">
                    Underwrite auto-checks instantly. No physical documentation logs is requested for active accounts.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-2">Micro-credit sum value (max $5,000)</label>
                    <div className="relative">
                      <span className="text-[18px] font-mono text-slate-300 absolute left-3 top-1/2 -translate-y-1/2">$</span>
                      <input
                        type="number"
                        max="5000"
                        min="500"
                        value={fastCashAmtValue}
                        onChange={(e) => setFastCashAmtValue(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 text-white font-mono rounded-lg pl-8 pr-4 py-3 text-[18px] focus:outline-none focus:border-[#5cf2d0]"
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 leading-tight space-y-1.5 border-t border-white/5 pt-3">
                    <p>• Fixed APR: <span className="text-white font-bold">5.4% flat</span></p>
                    <p>• Installment schedules: <span className="text-white font-bold">12 monthly auto-payment terms</span></p>
                    <p>• Processing fee: <span className="text-white font-bold">$0.00 waivered</span></p>
                  </div>
                </div>

                <button
                  onClick={handleInstantFastCash}
                  className="w-full bg-[#5cf2d0] hover:bg-[#41ddbc] text-[var(--text-primary)] py-4 rounded-xl font-bold text-[14px] flex items-center justify-center gap-1.5 transition duration-150 cursor-pointer"
                >
                  <Sparkles className="w-5.5 h-5.5" />
                  Request Pre-Approved Disbursement
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
