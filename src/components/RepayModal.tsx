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
    <div className="fixed inset-0 bg-[#0F171C]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-[#c4c7ca] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-[#44474a] hover:bg-[#f1f4f6]"
        >
          <X className="w-5 h-5" />
        </button>

        {showSuccess ? (
          /* SUCCESS SCREEN */
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600 animate-pulse">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <h3 className="text-[20px] font-sans font-bold text-[#0F171C] mb-1">Payment Successful!</h3>
            <p className="text-[13px] text-[#44474a] mb-6">
              A transaction of <span className="font-bold text-[#0F171C]">${parseFloat(repayAmount).toFixed(2)} USD</span> has been cleared via your wallet.
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
            <h3 className="text-[20px] font-sans font-bold text-[#0F171C] mb-4">Make a Repayment</h3>

            {/* Outstandings indicator */}
            <div className="bg-[#f1f4f6] rounded-xl p-4 mb-6 border border-[#c4c7ca]/60">
              <span className="text-[11px] font-bold text-[#44474a] uppercase tracking-wider block">Outstanding Balance</span>
              <span className="text-[28px] font-sans font-bold text-[#0F171C] block">${outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            {/* Input field */}
            <div className="mb-6">
              <label className="block text-[13px] font-bold text-[#0F171C] mb-2">Repayment Amount (USD)</label>
              <div className="relative">
                <DollarSign className="w-5 h-5 text-[#44474a] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.01"
                  value={repayAmount}
                  onChange={(e) => {
                    setRepayAmount(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className="w-full bg-white border border-[#c4c7ca] rounded-lg pl-9 pr-4 py-3 text-[16px] font-medium text-[#0F171C] focus:outline-none focus:border-[#5CF2D0] focus:ring-1 focus:ring-[#5CF2D0]"
                  placeholder="250.00"
                />
              </div>
              {errorMsg && <p className="text-red-500 text-[11px] mt-1.5 font-semibold">{errorMsg}</p>}
            </div>

            {/* Payment Method Selector */}
            <div className="mb-8">
              <label className="block text-[13px] font-bold text-[#0F171C] mb-2">Select Funding Source</label>
              <div className="space-y-2">
                <div
                  onClick={() => setPayMethod('wallet')}
                  className={`flex items-center justify-between p-3.5 border rounded-lg cursor-pointer transition ${
                    payMethod === 'wallet' ? 'border-[#5CF2D0] bg-[#5CF2D0]/5' : 'border-[#c4c7ca] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Coins className={`w-5 h-5 ${payMethod === 'wallet' ? 'text-[#006b59]' : 'text-gray-500'}`} />
                    <span className="text-[13.5px] font-bold text-[#181c1e]">Nexus Digital Vault Wallet</span>
                  </div>
                  <div className="text-[12px] font-sans font-bold bg-[#5CF2D0]/20 text-[#006b59] px-2.5 py-0.5 rounded-full">Primary</div>
                </div>

                <div
                  onClick={() => setPayMethod('card')}
                  className={`flex items-center gap-3 p-3.5 border rounded-lg cursor-pointer transition ${
                    payMethod === 'card' ? 'border-[#5CF2D0] bg-[#5CF2D0]/5' : 'border-[#c4c7ca] bg-white'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  <span className="text-[13.5px] font-bold text-[#181c1e]">Linked Debit Card (•••• 1024)</span>
                </div>

                <div
                  onClick={() => setPayMethod('bank')}
                  className={`flex items-center gap-3 p-3.5 border rounded-lg cursor-pointer transition ${
                    payMethod === 'bank' ? 'border-[#5CF2D0] bg-[#5CF2D0]/5' : 'border-[#c4c7ca] bg-white'
                  }`}
                >
                  <Landmark className="w-5 h-5 text-gray-500" />
                  <span className="text-[13.5px] font-bold text-[#181c1e]">ACH Direct Bank Transfer</span>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-[#c4c7ca] rounded-lg text-[14px] font-semibold text-[#0F171C] hover:bg-[#f1f4f6]"
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
