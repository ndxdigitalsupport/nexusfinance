import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Smartphone, DollarSign, Calendar, CreditCard, History, CheckCircle2, Download, Settings, Clock, Copy, Check, XCircle, AlertCircle } from 'lucide-react';
import { API } from '../api';

const s = (name: string) => `var(--${name})`;

function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function QRPreview({ image }: { image?: string }) {
  if (!image) return <div className="w-[240px] h-[240px] rounded-xl flex items-center justify-center" style={{ backgroundColor: s('surface-secondary') }}><Spinner /></div>;
  return (
    <div className="flex justify-center rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
      <img src={image} alt="KHQR" className="w-full h-auto" style={{ maxWidth: 300 }} />
    </div>
  );
}

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

export default function KHQRPage() {
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('installment');
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [genResult, setGenResult] = useState<any>(null);
  const [genTime, setGenTime] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [bakongAccountId, setBakongAccountId] = useState('nexusfinance@aclb');
  const [merchantName, setMerchantName] = useState('Nexus Finance');
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'APPROVED' | 'DECLINED' | 'IDLE'>('IDLE');
  const [transactions, setTransactions] = useState<PayWayTx[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loanData = {
    nextInstallment: '50.00',
    dueDate: '2026-06-30',
    totalOutstanding: '1,250.00',
    loanId: 'LN-2026-8924'
  };

  const getAmount = () => {
    if (paymentMode === 'installment') return loanData.nextInstallment;
    if (paymentMode === 'full') return loanData.totalOutstanding;
    return customAmount || '0';
  };

  useEffect(() => {
    const generateQR = async () => {
      const amount = getAmount();
      if (!amount || parseFloat(amount) <= 0) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setPaymentStatus('IDLE');
      try {
        const res = await fetch(`${API}/payway/generate-qr`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: parseFloat(amount),
            currency: 'USD',
            lifetime: 15,
            items: [{ name: `Loan Repayment - ${loanData.loanId}`, quantity: 1, price: parseFloat(amount) }],
          }),
        });
        const result = await res.json();
        if (result.error) throw new Error(result.error);
        setGenResult(result);
        setGenTime(new Date());
        setPaymentStatus('PENDING');
      } catch (e: any) {
        console.error("Failed to generate PayWay QR", e);
        setPaymentStatus('DECLINED');
      } finally {
        setLoading(false);
      }
    };
    generateQR();
  }, [paymentMode, customAmount, bakongAccountId, merchantName]);

  useEffect(() => {
    if (paymentStatus !== 'PENDING' || !genResult?.tranId) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API}/payway/verify-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tranId: genResult.tranId }),
        });
        const data = await res.json();
        if (data.status === 'APPROVED') {
          setPaymentStatus('APPROVED');
          if (pollRef.current) clearInterval(pollRef.current);
        } else if (data.status === 'DECLINED') {
          setPaymentStatus('DECLINED');
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch { /* retry */ }
    }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [paymentStatus, genResult?.tranId]);

  useEffect(() => {
    fetch(`${API}/payway/transactions`)
      .then(r => r.json())
      .then(setTransactions)
      .catch(() => {});
  }, []);

  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    if (!genTime) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - genTime.getTime()) / 1000);
      const remaining = Math.max(0, 600 - elapsed);
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      setTimeLeft(remaining > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : 'Expired');
    }, 1000);
    return () => clearInterval(interval);
  }, [genTime]);

  const handleDeeplink = async () => {
    if (!genResult?.deeplink) return;
    window.open(genResult.deeplink, '_blank');
  };

  const handleDownloadQR = () => {
    const img = document.querySelector('img[alt="KHQR"]') as HTMLImageElement;
    if (!img) return;
    const link = document.createElement('a');
    link.download = `KHQR-${loanData.loanId}-${getAmount()}.png`;
    link.href = img.src;
    link.click();
  };

  const handleCopyQR = async () => {
    if (!genResult?.qrString) return;
    await navigator.clipboard.writeText(genResult.qrString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const payStatusIcon = () => {
    if (paymentStatus === 'APPROVED') return <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--success-text)' }} />;
    if (paymentStatus === 'DECLINED') return <XCircle className="w-5 h-5" style={{ color: 'var(--error-text)' }} />;
    return <Clock className="w-5 h-5" style={{ color: s('accent') }} />;
  };

  const payStatusLabel = () => {
    if (paymentStatus === 'APPROVED') return 'Payment Approved';
    if (paymentStatus === 'DECLINED') return 'Payment Failed';
    if (paymentStatus === 'PENDING') return 'Awaiting Payment';
    return '';
  };

  const payStatusColor = () => {
    if (paymentStatus === 'APPROVED') return 'var(--success-bg)';
    if (paymentStatus === 'DECLINED') return 'var(--error-bg)';
    return 'rgba(14,165,233,0.1)';
  };

  const payStatusTextColor = () => {
    if (paymentStatus === 'APPROVED') return 'var(--success-text)';
    if (paymentStatus === 'DECLINED') return 'var(--error-text)';
    return s('accent');
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: s('accent') }}>
            <QrCode className="w-6 h-6" style={{ color: s('text-inverse') }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: s('text-primary') }}>Loan Repayment</h1>
            <p className="text-sm font-medium mt-1" style={{ color: s('text-tertiary') }}>Make your next installment payment securely via KHQR</p>
          </div>
        </div>
        <button onClick={() => setShowSettings(!showSettings)}
          className="p-2.5 rounded-xl transition-colors cursor-pointer"
          style={{ backgroundColor: showSettings ? s('accent-muted') : s('surface-secondary'), color: showSettings ? s('accent') : s('text-secondary') }}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {showSettings && (
        <div className="stagger-1 premium-card rounded-2xl p-5 space-y-4 animate-in slide-in-from-top duration-200"
          style={{ borderColor: s('border-primary') }}
        >
          <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: s('border-secondary') }}>
            <Settings className="w-4 h-4" style={{ color: s('accent') }} />
            <span className="text-sm font-bold" style={{ color: s('text-primary') }}>Merchant Settings</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: s('text-secondary') }}>Bakong Account ID</label>
              <input type="text" value={bakongAccountId} onChange={e => setBakongAccountId(e.target.value)}
                className="premium-input w-full px-4 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: s('text-secondary') }}>Display Name</label>
              <input type="text" value={merchantName} onChange={e => setMerchantName(e.target.value)}
                className="premium-input w-full px-4 py-2.5 rounded-xl text-sm" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-7 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="stagger-1 p-5 rounded-3xl border relative overflow-hidden" style={{ backgroundColor: s('surface-card'), borderColor: s('border-primary') }}>
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
                ${loanData.nextInstallment}
              </div>
              <p className="text-sm font-medium" style={{ color: s('text-tertiary') }}>Due by {loanData.dueDate}</p>
            </div>

            <div className="stagger-2 p-5 rounded-3xl border relative overflow-hidden" style={{ backgroundColor: s('surface-secondary'), borderColor: s('border-primary') }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(100,116,139,0.1)' }}>
                  <CreditCard className="w-4 h-4" style={{ color: s('text-secondary') }} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: s('text-secondary') }}>Outstanding Balance</span>
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: s('text-primary') }}>
                ${loanData.totalOutstanding}
              </div>
              <p className="text-sm font-medium" style={{ color: s('text-tertiary') }}>Loan ID: {loanData.loanId}</p>
            </div>
          </div>

          <div className="stagger-3 premium-card rounded-3xl border p-1" style={{ borderColor: s('border-primary'), backgroundColor: s('surface-card') }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: s('border-secondary') }}>
              <h3 className="text-sm font-bold" style={{ color: s('text-primary') }}>Payment Amount</h3>
              <span className="text-xs font-medium" style={{ color: s('text-tertiary') }}>
                Amount: <strong style={{ color: s('text-primary') }}>${getAmount()}</strong>
              </span>
            </div>
            <div className="p-3 space-y-2">
              <label onClick={() => setPaymentMode('installment')}
                className="flex items-center justify-between p-4 rounded-2xl cursor-pointer border-2 transition-all duration-200" 
                style={{ 
                  borderColor: paymentMode === 'installment' ? s('accent') : 'transparent', 
                  backgroundColor: paymentMode === 'installment' ? 'rgba(14,165,233,0.05)' : 'transparent' 
                }}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${paymentMode === 'installment' ? 'border-4' : 'border-2'}`} style={{ borderColor: paymentMode === 'installment' ? s('accent') : s('border-primary') }} />
                  <div>
                    <p className="text-sm font-bold" style={{ color: s('text-primary') }}>Pay Next Installment</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: s('text-secondary') }}>Standard monthly payment</p>
                  </div>
                </div>
                <span className="text-lg font-bold" style={{ color: s('text-primary') }}>${loanData.nextInstallment}</span>
              </label>

              <label onClick={() => setPaymentMode('full')}
                className="flex items-center justify-between p-4 rounded-2xl cursor-pointer border-2 transition-all duration-200" 
                style={{ 
                  borderColor: paymentMode === 'full' ? s('accent') : 'transparent', 
                  backgroundColor: paymentMode === 'full' ? 'rgba(14,165,233,0.05)' : 'transparent' 
                }}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${paymentMode === 'full' ? 'border-4' : 'border-2'}`} style={{ borderColor: paymentMode === 'full' ? s('accent') : s('border-primary') }} />
                  <div>
                    <p className="text-sm font-bold" style={{ color: s('text-primary') }}>Pay Full Balance</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: s('text-secondary') }}>Clear your entire loan early</p>
                  </div>
                </div>
                <span className="text-lg font-bold" style={{ color: s('text-primary') }}>${loanData.totalOutstanding}</span>
              </label>

              <label onClick={() => setPaymentMode('custom')}
                className="flex items-center justify-between p-4 rounded-2xl cursor-pointer border-2 transition-all duration-200"
                style={{ 
                  borderColor: paymentMode === 'custom' ? s('accent') : 'transparent', 
                  backgroundColor: paymentMode === 'custom' ? 'rgba(14,165,233,0.05)' : 'transparent' 
                }}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${paymentMode === 'custom' ? 'border-4' : 'border-2'}`} style={{ borderColor: paymentMode === 'custom' ? s('accent') : s('border-primary') }} />
                  <div>
                    <p className="text-sm font-bold" style={{ color: s('text-primary') }}>Custom Amount</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: s('text-secondary') }}>Enter any amount to pay</p>
                  </div>
                </div>
              </label>

              {paymentMode === 'custom' && (
                <div className="px-1 py-2 animate-in slide-in-from-top duration-150">
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: s('accent') }} />
                    <input type="number" placeholder="Enter amount in USD"
                      value={customAmount} onChange={e => setCustomAmount(e.target.value)}
                      className="premium-input w-full pl-10 pr-4 py-3 rounded-xl text-lg font-bold"
                      style={{ backgroundColor: s('surface-secondary'), color: s('text-primary') }}
                      autoFocus
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Payments */}
          <div className="stagger-4">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: s('text-primary') }}>
              <History className="w-4 h-4" /> Recent Payments
            </h3>
            <div className="space-y-2">
              {transactions.length > 0 ? transactions.slice(0, 5).map((tx, i) => (
                <div key={tx.tranId} className="flex items-center justify-between p-4 rounded-2xl border" style={{ backgroundColor: s('surface-card'), borderColor: s('border-primary') }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center`} style={{
                      backgroundColor: tx.status === 'APPROVED' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)'
                    }}>
                      {tx.status === 'APPROVED' ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--success-text)' }} />
                      ) : (
                        <AlertCircle className="w-5 h-5" style={{ color: 'var(--warning-text)' }} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: s('text-primary') }}>Installment Payment</p>
                      <p className="text-xs font-medium mt-0.5" style={{ color: s('text-secondary') }}>
                        {new Date(tx.createdAt).toLocaleDateString()} · {tx.tranId.slice(0, 10)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: s('text-primary') }}>${tx.amount.toFixed(2)}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 inline-block px-2 py-0.5 rounded-full`}
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

        {/* Right Column: QR Code */}
        <div className="lg:col-span-5">
          <div className="stagger-5 premium-card rounded-3xl border overflow-hidden sticky top-6 shadow-xl" style={{ borderColor: s('border-primary'), backgroundColor: s('surface-card') }}>
            <div className="p-8 flex flex-col items-center justify-center text-center">
              
              <div className="mb-6">
                <h2 className="text-lg font-black" style={{ color: s('text-primary') }}>Scan to Pay</h2>
                <p className="text-sm font-medium mt-1" style={{ color: s('text-secondary') }}>Use any Bakong-supported app</p>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 blur-2xl opacity-20 scale-110 rounded-full" style={{ backgroundColor: s('accent') }} />
                
                {loading ? (
                  <div className="w-[240px] h-[240px] rounded-3xl flex items-center justify-center z-10 relative shadow-sm" style={{ backgroundColor: s('surface-secondary') }}>
                    <Spinner size={32} />
                  </div>
                ) : (
                  <div className="z-10 relative">
                    <QRPreview image={genResult?.qrImage} />
                  </div>
                )}
              </div>

              {/* Payment Status */}
              {paymentStatus !== 'IDLE' && !loading && (
                <div className="flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-xs font-bold"
                  style={{ backgroundColor: payStatusColor(), color: payStatusTextColor() }}
                >
                  {payStatusIcon()}
                  {payStatusLabel()}
                </div>
              )}

              {/* Expiry */}
              {genTime && !loading && paymentStatus === 'PENDING' && (
                <div className="flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ backgroundColor: timeLeft === 'Expired' ? 'var(--error-bg)' : 'rgba(14,165,233,0.1)', color: timeLeft === 'Expired' ? 'var(--error-text)' : s('accent') }}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {timeLeft === 'Expired' ? 'Expired — regenerate to use' : `Expires in ${timeLeft}`}
                </div>
              )}

              {/* Amount & Merchant info */}
              {genResult && !loading && (
                <div className="w-full mb-6 p-4 rounded-2xl" style={{ backgroundColor: s('surface-secondary') }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium" style={{ color: s('text-secondary') }}>Payment Amount</span>
                    <span className="text-2xl font-black" style={{ color: s('text-primary') }}>${getAmount()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-xs font-medium" style={{ color: s('text-secondary') }}>Merchant</span>
                    <span className="text-sm font-bold" style={{ color: s('text-primary') }}>{merchantName}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-xs font-medium" style={{ color: s('text-secondary') }}>Reference</span>
                    <span className="text-xs font-mono font-bold" style={{ color: s('text-primary') }}>{genResult?.tranId?.slice(0, 12) || '—'}</span>
                  </div>
                </div>
              )}

              <div className="w-full space-y-3">
                <button onClick={handleDeeplink}
                  disabled={loading || !genResult?.deeplink || paymentStatus === 'APPROVED'}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 hover:opacity-90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  style={{ backgroundColor: s('accent'), color: s('text-inverse') }}
                >
                  <Smartphone className="w-5 h-5" />
                  Pay with Banking App
                </button>
                
                <div className="flex gap-2">
                  <button onClick={handleDownloadQR}
                    disabled={loading || !genResult?.qrImage}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 hover:bg-black/5 dark:hover:bg-white/5 border-2"
                    style={{ borderColor: s('border-primary'), color: s('text-primary') }}
                  >
                    <Download className="w-4 h-4" />
                    Save QR
                  </button>
                  <button onClick={handleCopyQR}
                    disabled={loading || !genResult?.qrString}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 hover:bg-black/5 dark:hover:bg-white/5 border-2"
                    style={{ borderColor: s('border-primary'), color: s('text-primary') }}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

            </div>
            
            <div className="p-4 border-t flex items-center justify-between text-xs font-medium" style={{ borderColor: s('border-secondary'), backgroundColor: s('surface-secondary'), color: s('text-tertiary') }}>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--success-text)' }} /> Secure via ABA PayWay</span>
              <span className="uppercase tracking-wider">Powered by KHQR</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
