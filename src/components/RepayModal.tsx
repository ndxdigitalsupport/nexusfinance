import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, CreditCard, Landmark, Coins, DollarSign } from 'lucide-react';

interface RepayModalProps {
  isOpen: boolean;
  onClose: () => void;
  outstandingBalance: number;
  onRepayConfirm: (amount: number) => void;
}

export default function RepayModal({
  isOpen,
  onClose,
  outstandingBalance,
  onRepayConfirm
}: RepayModalProps) {
  const [repayAmount, setRepayAmount] = useState('250.00');
  const [payMethod, setPayMethod] = useState<'wallet' | 'card' | 'bank'>('wallet');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setShowSuccess(false);
      setIsSubmitting(false);
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRepaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(repayAmount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid positive payment amount');
      return;
    }

    if (parsedAmount > outstandingBalance) {
      setErrorMsg(`Amount cannot exceed outstanding balance of $${outstandingBalance.toLocaleString()}`);
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onRepayConfirm(parsedAmount);
      setShowSuccess(true);
    }, 1200);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    onClose();
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Repayment modal" className="fixed inset-0 bg-[var(--modal-overlay)] backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-[var(--surface-card)] w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-[var(--border-primary)] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
        >
          <X className="w-5 h-5" />
        </button>

        {showSuccess ? (
          /* SUCCESS SCREEN */
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600 animate-pulse">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <h3 className="text-[20px] font-sans font-bold text-[var(--text-primary)] mb-1">Payment Successful!</h3>
            <p className="text-[13px] text-[var(--text-secondary)] mb-6">
              A transaction of <span className="font-bold text-[var(--text-primary)]">${parseFloat(repayAmount).toFixed(2)} USD</span> has been cleared via your wallet.
            </p>
            <button
              onClick={handleCloseSuccess}
className="w-full premium-btn-primary hover:brightness-110 text-white font-bold py-3 rounded-lg text-[14px]"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          /* PAYMENT FORM */
          <form onSubmit={handleRepaySubmit} className="p-6 sm:p-8">
            <h3 className="text-[20px] font-sans font-bold text-[var(--text-primary)] mb-4">Make a Repayment</h3>

            {/* Outstandings indicator */}
            <div className="bg-[var(--surface-secondary)] rounded-xl p-4 mb-6 border border-[var(--border-primary)]/60">
              <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Outstanding Balance</span>
              <span className="text-[28px] font-sans font-bold text-[var(--text-primary)] block">${outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            {/* Input field */}
            <div className="mb-6">
              <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-2">Repayment Amount (USD)</label>
              <div className="relative">
                <DollarSign className="w-5 h-5 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.01"
                  value={repayAmount}
                  onChange={(e) => {
                    setRepayAmount(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className="w-full bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-lg pl-9 pr-4 py-3 text-[16px] font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                  placeholder="250.00"
                />
              </div>
              <div className="flex gap-1.5 mt-2">
                {[0.25, 0.5, 0.75, 1].map(f => {
                  const amt = Math.round(outstandingBalance * f * 100) / 100;
                  return (
                    <button key={f} type="button" onClick={() => setRepayAmount(amt.toFixed(2))}
                      className={`flex-1 px-2 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${parseFloat(repayAmount) === amt ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'bg-[var(--surface-secondary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}>
                      {f === 1 ? 'Full' : `${f * 100}%`}
                    </button>
                  );
                })}
              </div>
              {errorMsg && <p className="text-red-500 text-[11px] mt-1.5 font-semibold">{errorMsg}</p>}
            </div>

            {/* Payment Method Selector */}
            <div className="mb-8">
              <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-2">Select Funding Source</label>
              <div className="space-y-2">
                <button type="button" onClick={() => setPayMethod('wallet')}
                  className={`w-full flex items-center justify-between p-3.5 border rounded-lg cursor-pointer transition-all duration-200 ${
                    payMethod === 'wallet'
                      ? 'border-[var(--accent)] bg-[var(--accent)]/5 shadow-sm'
                      : 'border-[var(--border-primary)] bg-[var(--surface-card)] hover:border-[var(--text-tertiary)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${payMethod === 'wallet' ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'bg-[var(--surface-secondary)] text-[var(--text-tertiary)]'}`}>
                      <Coins className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="text-[13.5px] font-bold text-[var(--text-primary)] block">Nexus Digital Vault Wallet</span>
                      <span className="text-[10px] text-[var(--text-tertiary)]">Instant · No fees</span>
                    </div>
                  </div>
                  <div className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${payMethod === 'wallet' ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--surface-secondary)] text-[var(--text-tertiary)]'}`}>Primary</div>
                </button>

                <button type="button" onClick={() => setPayMethod('card')}
                  className={`w-full flex items-center justify-between p-3.5 border rounded-lg cursor-pointer transition-all duration-200 ${
                    payMethod === 'card'
                      ? 'border-[var(--accent)] bg-[var(--accent)]/5 shadow-sm'
                      : 'border-[var(--border-primary)] bg-[var(--surface-card)] hover:border-[var(--text-tertiary)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${payMethod === 'card' ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'bg-[var(--surface-secondary)] text-[var(--text-tertiary)]'}`}>
                      <CreditCard className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="text-[13.5px] font-bold text-[var(--text-primary)] block">Linked Debit Card</span>
                      <span className="text-[10px] text-[var(--text-tertiary)]">Visa •••• 1024 · 1.5% fee</span>
                    </div>
                  </div>
                </button>

                <button type="button" onClick={() => setPayMethod('bank')}
                  className={`w-full flex items-center justify-between p-3.5 border rounded-lg cursor-pointer transition-all duration-200 ${
                    payMethod === 'bank'
                      ? 'border-[var(--accent)] bg-[var(--accent)]/5 shadow-sm'
                      : 'border-[var(--border-primary)] bg-[var(--surface-card)] hover:border-[var(--text-tertiary)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${payMethod === 'bank' ? 'bg-[var(--accent)] text-[var(--text-inverse)]' : 'bg-[var(--surface-secondary)] text-[var(--text-tertiary)]'}`}>
                      <Landmark className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="text-[13.5px] font-bold text-[var(--text-primary)] block">ACH Direct Bank Transfer</span>
                      <span className="text-[10px] text-[var(--text-tertiary)]">2-3 business days · Free</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-[var(--border-primary)] rounded-lg text-[14px] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-[var(--sidebar-bg)] hover:brightness-125 text-white font-sans font-bold rounded-lg text-[14px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Clearing...
                  </>
                ) : (
                  'Clear Payment'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
