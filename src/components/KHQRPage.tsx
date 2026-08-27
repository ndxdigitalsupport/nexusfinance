import React, { useState, useEffect, useMemo } from 'react';
import { QrCode, DollarSign, Calendar, CreditCard, History, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { API, apiFetch } from '../api';

const s = (name: string) => `var(--${name})`;

type PaymentMode = 'installment' | 'full' | 'custom';

interface PayWayTx {
  tranId: string;
  amount: number;
  currency: string;
  status: string;
  apv?: string;
  createdAt: string;
  paidAt?: string;
}

interface LoanInfo {
  loanId: string;
  nextInstallment: number;
  dueDate: string;
  totalOutstanding: number;
}

export default function KHQRPage() {
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('installment');
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<PayWayTx[]>([]);
  const [loanData, setLoanData] = useState<LoanInfo | null>(null);
  const [loanLoading, setLoanLoading] = useState(true);

  // KHQR and Deep Link verification states
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [deeplink, setDeeplink] = useState<string | null>(null);
  const [currentTranId, setCurrentTranId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'APPROVED' | null>(null);

  useEffect(() => {
    if (!currentTranId || paymentStatus === 'APPROVED') return;

    const interval = setInterval(async () => {
      try {
        const data = await apiFetch('/payway/verify-payment', {
          method: 'POST',
          body: JSON.stringify({ tranId: currentTranId }),
        });

        if (data.status === 'APPROVED') {
          setPaymentStatus('APPROVED');
          clearInterval(interval);
          
          // Reset states and refresh history after 3 seconds
          setTimeout(() => {
            setQrCode(null);
            setDeeplink(null);
            setCurrentTranId(null);
            setPaymentStatus(null);
            apiFetch('/payway/transactions')
              .then(setTransactions)
              .catch(() => {});
          }, 3000);
        }
      } catch (err) {
        console.error('Verify payment error:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentTranId, paymentStatus]);

  useEffect(() => {
    apiFetch('/loans')
      .then((loans: any[]) => {
        const active = loans.find((l: any) => l.status?.toLowerCase() === 'approved');
        if (active) {
          const monthly = active.amount / (active.durationMonths || 24);
          const loanDate = new Date(active.date || Date.now());
          const nextDue = new Date(loanDate);
          nextDue.setMonth(nextDue.getMonth() + 1);
          setLoanData({
            loanId: active.id ? `LN-${active.id}` : 'N/A',
            nextInstallment: Math.round(monthly * 100) / 100,
            dueDate: nextDue.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            totalOutstanding: active.amount,
          });
        }
        setLoanLoading(false);
      })
      .catch(() => setLoanLoading(false));
  }, []);

  useEffect(() => {
    apiFetch('/payway/transactions')
      .then(setTransactions)
      .catch(() => {});
  }, []);

  const getAmount = useMemo(() => {
    if (!loanData) return 0;
    if (paymentMode === 'installment') return loanData.nextInstallment;
    if (paymentMode === 'full') return loanData.totalOutstanding;
    return parseFloat(customAmount) || 0;
  }, [paymentMode, customAmount, loanData]);

  const handlePay = async () => {
    const amount = getAmount;
    if (!amount || amount <= 0) return;
    setLoading(true);
    setPaymentStatus('PENDING');
    try {
      const data = await apiFetch('/payway/generate-qr', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          currency: 'USD',
          loanId: loanData?.loanId || '',
        }),
      });

      if (!data.qrString) throw new Error(data.error || 'Failed to generate dynamic QR');

      setQrCode(data.qrString);
      setDeeplink(data.abapayDeeplink);
      setCurrentTranId(data.tranId);
    } catch (e: any) {
      console.error('PayWay QR generation error:', e);
      setPaymentStatus(null);
      alert(e.message || 'Failed to generate QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: s('accent') }}>
          <QrCode className="w-6 h-6" style={{ color: s('text-inverse') }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: s('text-primary') }}>Loan Repayment</h1>
          <p className="text-sm font-medium mt-1" style={{ color: s('text-tertiary') }}>Pay securely via ABA PayWay</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-7 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl border relative overflow-hidden" style={{ backgroundColor: s('surface-card'), borderColor: s('border-primary') }}>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <DollarSign className="w-20 h-20" style={{ color: s('accent') }} />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(14,165,233,0.1)' }}>
                  <Calendar className="w-4 h-4" style={{ color: s('accent') }} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: s('text-secondary') }}>Next Installment Due</span>
              </div>
              <div className="text-4xl font-black mb-1" style={{ color: s('text-primary') }}>
                {loanLoading ? '—' : loanData ? `$${loanData.nextInstallment.toLocaleString()}` : '$0'}
              </div>
              <p className="text-sm font-medium" style={{ color: s('text-tertiary') }}>
                {loanData?.dueDate ? `Due by ${loanData.dueDate}` : 'No active loan'}
              </p>
            </div>

            <div className="p-5 rounded-3xl border relative overflow-hidden" style={{ backgroundColor: s('surface-secondary'), borderColor: s('border-primary') }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(100,116,139,0.1)' }}>
                  <CreditCard className="w-4 h-4" style={{ color: s('text-secondary') }} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: s('text-secondary') }}>Outstanding Balance</span>
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: s('text-primary') }}>
                {loanLoading ? '—' : loanData ? `$${loanData.totalOutstanding.toLocaleString()}` : '$0'}
              </div>
              <p className="text-sm font-medium" style={{ color: s('text-tertiary') }}>Loan ID: {loanData?.loanId || '—'}</p>
            </div>
          </div>

          <div className="rounded-3xl border p-1" style={{ borderColor: s('border-primary'), backgroundColor: s('surface-card') }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: s('border-secondary') }}>
              <h3 className="text-sm font-bold" style={{ color: s('text-primary') }}>Payment Amount</h3>
              <span className="text-xs font-medium" style={{ color: s('text-tertiary') }}>
                Amount: <strong style={{ color: s('text-primary') }}>${getAmount.toLocaleString()}</strong>
              </span>
            </div>
            <div className="p-3 space-y-2">
              {(['installment', 'full', 'custom'] as PaymentMode[]).map((mode) => (
                <label key={mode} onClick={() => setPaymentMode(mode)}
                  className="flex items-center justify-between p-4 rounded-2xl cursor-pointer border-2 transition-all duration-200"
                  style={{
                    borderColor: paymentMode === mode ? s('accent') : 'transparent',
                    backgroundColor: paymentMode === mode ? 'rgba(14,165,233,0.05)' : 'transparent'
                  }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${paymentMode === mode ? 'border-4' : 'border-2'}`}
                      style={{ borderColor: paymentMode === mode ? s('accent') : s('border-primary') }} />
                    <div>
                      <p className="text-sm font-bold" style={{ color: s('text-primary') }}>
                        {mode === 'installment' && 'Pay Next Installment'}
                        {mode === 'full' && 'Pay Full Balance'}
                        {mode === 'custom' && 'Custom Amount'}
                      </p>
                      <p className="text-xs font-medium mt-0.5" style={{ color: s('text-secondary') }}>
                        {mode === 'installment' && 'Standard monthly payment'}
                        {mode === 'full' && 'Clear your entire loan early'}
                        {mode === 'custom' && 'Enter any amount to pay'}
                      </p>
                    </div>
                  </div>
                  {mode !== 'custom' && (
                    <span className="text-lg font-bold" style={{ color: s('text-primary') }}>
                      ${mode === 'installment' ? loanData?.nextInstallment.toLocaleString() : loanData?.totalOutstanding.toLocaleString()}
                    </span>
                  )}
                </label>
              ))}

              {paymentMode === 'custom' && (
                <div className="px-1 py-2 animate-in slide-in-from-top duration-150">
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: s('accent') }} />
                    <input type="number" placeholder="Enter amount in USD"
                      value={customAmount} onChange={e => setCustomAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-lg font-bold border-2"
                      style={{ backgroundColor: s('surface-secondary'), color: s('text-primary'), borderColor: s('border-primary') }}
                      autoFocus
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: s('text-primary') }}>
              <History className="w-4 h-4" /> Recent Payments
            </h3>
            <div className="space-y-2">
              {transactions.length > 0 ? transactions.slice(0, 5).map((tx: any) => (
                <div key={tx.tran_id || tx.tranId} className="flex items-center justify-between p-4 rounded-2xl border" style={{ backgroundColor: s('surface-card'), borderColor: s('border-primary') }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                      backgroundColor: tx.status === 'APPROVED' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)'
                    }}>
                      {tx.status === 'APPROVED' ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--success-text)' }} />
                      ) : (
                        <AlertCircle className="w-5 h-5" style={{ color: 'var(--warning-text)' }} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: s('text-primary') }}>Loan Repayment</p>
                      <p className="text-xs font-medium mt-0.5" style={{ color: s('text-secondary') }}>
                        {new Date(tx.created_at || tx.createdAt).toLocaleDateString()} · {(tx.tran_id || tx.tranId || '').slice(0, 10)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: s('text-primary') }}>${tx.amount.toFixed(2)}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-1 inline-block px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: tx.status === 'APPROVED' ? 'var(--success-bg)' : 'var(--warning-bg)',
                        color: tx.status === 'APPROVED' ? 'var(--success-text)' : 'var(--warning-text)',
                      }}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center">
                  <p className="text-xs font-medium" style={{ color: s('text-tertiary') }}>No payment history yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          {qrCode ? (
            /* Inline KHQR Card Frame styled exactly like ABA checkout */
            <div className="rounded-3xl border overflow-hidden sticky top-6 shadow-xl relative animate-in zoom-in duration-200 p-8 flex flex-col items-center" style={{ borderColor: s('border-primary'), backgroundColor: s('surface-card') }}>
              
              {/* ABA PAY Logo on Top */}
              <div className="mb-6 flex items-center gap-1 select-none">
                <span className="text-[20px] font-black tracking-tighter" style={{ color: '#005A9C' }}>ABA′ </span>
                <span className="text-[20px] font-black tracking-tighter" style={{ color: '#00A1E4' }}>PAY</span>
              </div>

              {/* The White Ticket Box (Figma Style) */}
              <div className="w-full max-w-[280px] bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col items-center pb-6">
                
                {/* Red KHQR Header */}
                <div className="w-full bg-[#E11F26] py-3 text-center text-white font-extrabold text-[12px] tracking-widest">
                  KHQR
                </div>

                {/* Merchant Name */}
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mt-4">
                  ndxdigitalsupport
                </p>

                {/* Price tag */}
                <div className="text-3xl font-black text-gray-800 mt-1 mb-3">
                  ${getAmount.toFixed(2)} <span className="text-[12px] font-bold text-gray-400">USD</span>
                </div>

                {/* Dashed Line */}
                <div className="w-full border-t border-dashed border-gray-200 px-4 my-2" />

                {/* QR Code with red center logo */}
                <div className="p-3 relative bg-white my-2">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrCode)}`}
                    alt="KHQR Code"
                    className="w-44 h-44 select-none"
                  />
                  {/* Central Red Circular Logo representing the center icon */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#E11F26] border-2 border-white flex items-center justify-center shadow-md">
                    <span className="text-[6px] font-black text-white leading-none">KHQR</span>
                  </div>
                </div>

                {/* Footer text of the ticket */}
                <p className="text-[9.5px] font-medium text-gray-500 max-w-[200px] text-center mt-3 leading-relaxed">
                  Scan with ABA Mobile or any KHQR supported banking app
                </p>
              </div>

              {paymentStatus === 'APPROVED' ? (
                <div className="w-full py-4 mt-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex flex-col items-center justify-center animate-in fade-in duration-300">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-1.5 animate-bounce" />
                  <span className="text-sm font-bold text-emerald-400">Payment Successful!</span>
                </div>
              ) : (
                <div className="w-full space-y-3 mt-6">
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[var(--text-secondary)] animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-ping" />
                    <span>Waiting for payment verification...</span>
                  </div>

                  {deeplink && (
                    <a
                      href={deeplink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3.5 bg-[var(--accent)] text-[var(--text-inverse)] font-bold text-[13px] rounded-2xl cursor-pointer flex items-center justify-center gap-1.5 shadow hover:brightness-110 active:scale-98 transition-all animate-bounce"
                    >
                      📱 Open in ABA Mobile
                    </a>
                  )}

                  <button
                    onClick={() => {
                      setQrCode(null);
                      setDeeplink(null);
                      setCurrentTranId(null);
                      setPaymentStatus(null);
                    }}
                    className="w-full py-3 border border-[var(--border-primary)] hover:bg-[var(--surface-secondary)] text-[var(--text-primary)] font-bold text-[12px] rounded-2xl cursor-pointer transition-all"
                  >
                    Cancel Payment
                  </button>
                </div>
              )}

              <div className="w-full border-t border-[var(--border-secondary)] pt-4 mt-6 flex items-center justify-between text-[11px] font-medium" style={{ color: s('text-tertiary') }}>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--success-text)' }} /> Secure via ABA PayWay</span>
                <span className="uppercase tracking-wider">Dynamic KHQR</span>
              </div>
            </div>
          ) : (
            /* Hosted Checkout Mode Panel */
            <div className="rounded-3xl border overflow-hidden sticky top-6 shadow-xl" style={{ borderColor: s('border-primary'), backgroundColor: s('surface-card') }}>
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="mb-6">
                  <h2 className="text-lg font-black" style={{ color: s('text-primary') }}>Pay with ABA PayWay</h2>
                  <p className="text-sm font-medium mt-1" style={{ color: s('text-secondary') }}>
                    Generate a dynamic KHQR code to pay instantly
                  </p>
                </div>

                <div className="w-full mb-6 p-4 rounded-2xl" style={{ backgroundColor: s('surface-secondary') }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium" style={{ color: s('text-secondary') }}>Payment Amount</span>
                    <span className="text-2xl font-black" style={{ color: s('text-primary') }}>${getAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-xs font-medium" style={{ color: s('text-secondary') }}>Loan</span>
                    <span className="text-sm font-bold" style={{ color: s('text-primary') }}>{loanData?.loanId || '—'}</span>
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <button onClick={handlePay}
                    disabled={loading || getAmount <= 0}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 hover:opacity-90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    style={{ backgroundColor: s('accent'), color: s('text-inverse') }}
                  >
                    <QrCode className="w-5 h-5" />
                    {loading ? 'Generating KHQR...' : 'Pay Now'}
                  </button>

                  <p className="text-xs text-center" style={{ color: s('text-tertiary') }}>
                    Supported: KHQR, ABA PAY, Cards, WeChat, Alipay
                  </p>
                </div>
              </div>

              <div className="p-4 border-t flex items-center justify-between text-xs font-medium" style={{ borderColor: s('border-secondary'), backgroundColor: s('surface-secondary'), color: s('text-tertiary') }}>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--success-text)' }} /> Secure via ABA PayWay</span>
                <span className="uppercase tracking-wider">Dynamic KHQR</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
