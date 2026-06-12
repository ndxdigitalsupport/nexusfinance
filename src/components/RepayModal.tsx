import React, { useState } from 'react';
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
              className="w-full bg-[#0F171C] hover:bg-slate-800 text-white font-bold py-3 rounded-lg text-[14px]"
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
                  className="w-full bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-lg pl-9 pr-4 py-3 text-[16px] font-medium text-[var(--text-primary)] focus:outline-none focus:border-[#5CF2D0] focus:ring-1 focus:ring-[#5CF2D0]"
                  placeholder="250.00"
                />
              </div>
              {errorMsg && <p className="text-red-500 text-[11px] mt-1.5 font-semibold">{errorMsg}</p>}
            </div>

            {/* Payment Method Selector */}
            <div className="mb-8">
              <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-2">Select Funding Source</label>
              <div className="space-y-2">
                <button onClick={() => setPayMethod('wallet')}
                  className={`w-full flex items-center justify-between p-3.5 border rounded-lg cursor-pointer transition ${
                    payMethod === 'wallet' ? 'border-[#5CF2D0] bg-[#5CF2D0]/5' : 'border-[var(--border-primary)] bg-[var(--surface-card)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Coins className={`w-5 h-5 ${payMethod === 'wallet' ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`} />
                    <span className="text-[13.5px] font-bold text-[var(--text-primary)]">Nexus Digital Vault Wallet</span>
                  </div>
                  <div className="text-[12px] font-sans font-bold bg-[#5CF2D0]/20 text-[var(--text-primary)] px-2.5 py-0.5 rounded-full">Primary</div>
                </button>

                <button onClick={() => setPayMethod('card')}
                  className={`w-full flex items-center gap-3 p-3.5 border rounded-lg cursor-pointer transition ${
                    payMethod === 'card' ? 'border-[#5CF2D0] bg-[#5CF2D0]/5' : 'border-[var(--border-primary)] bg-[var(--surface-card)]'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[var(--text-tertiary)]" />
                  <span className="text-[13.5px] font-bold text-[var(--text-primary)]">Linked Debit Card (•••• 1024)</span>
                </button>

                <button onClick={() => setPayMethod('bank')}
                  className={`w-full flex items-center gap-3 p-3.5 border rounded-lg cursor-pointer transition ${
                    payMethod === 'bank' ? 'border-[#5CF2D0] bg-[#5CF2D0]/5' : 'border-[var(--border-primary)] bg-[var(--surface-card)]'
                  }`}
                >
                  <Landmark className="w-5 h-5 text-[var(--text-tertiary)]" />
                  <span className="text-[13.5px] font-bold text-[var(--text-primary)]">ACH Direct Bank Transfer</span>
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
                className="flex-1 py-3 bg-[#0F171C] hover:bg-[#181c1e] text-[#5CF2D0] font-sans font-bold rounded-lg text-[14px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#5CF2D0] border-t-transparent rounded-full animate-spin"></div>
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
