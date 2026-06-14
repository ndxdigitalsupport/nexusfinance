import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Smartphone, DollarSign, Calendar, CreditCard, History, CheckCircle2, Download, Settings, Clock, Copy, Check, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode';
import type { KHQRGenerateResponse } from '../types';

const s = (name: string) => `var(--${name})`;

function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function QRPreview({ text, size = 220 }: { text: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current && text) {
      QRCode.toCanvas(canvasRef.current, text, { 
        width: size, 
        margin: 2, 
        color: { dark: '#0F171C', light: '#FFFFFF' } 
      });
    }
  }, [text, size]);
  
  if (!text) return <div className="w-[220px] h-[220px] rounded-xl flex items-center justify-center" style={{ backgroundColor: s('surface-secondary') }}><Spinner /></div>;

  return (
    <div className="flex justify-center p-4 rounded-2xl shadow-sm" style={{ backgroundColor: '#ffffff' }}>
      <canvas ref={canvasRef} className="rounded-xl" />
    </div>
  );
}

type PaymentMode = 'installment' | 'full' | 'custom';

export default function KHQRPage() {
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('installment');
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [genResult, setGenResult] = useState<KHQRGenerateResponse | null>(null);
  const [genTime, setGenTime] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [merchantId, setMerchantId] = useState('nexusfinance@aclb');
  const [merchantName, setMerchantName] = useState('Nexus Finance');
  const qrRef = useRef<HTMLCanvasElement>(null);

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
      try {
        const params = new URLSearchParams({
          bakongAccountId: merchantId,
          merchantName: merchantName,
          merchantCity: 'Phnom Penh',
          currency: '840',
          amount: amount,
          storeLabel: loanData.loanId,
        });
        const res = await fetch(`/api/khqr/generate?${params.toString()}`);
        const result = await res.json();
        setGenResult(result);
        setGenTime(new Date());
      } catch (e) {
        console.error("Failed to generate KHQR", e);
      } finally {
        setLoading(false);
      }
    };
    generateQR();
  }, [paymentMode, customAmount, merchantId, merchantName]);

  // Expiry countdown (10 minutes from generation)
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
    if (!genResult?.khqrString) return;
    try {
      const res = await fetch(`/api/khqr/deeplink?qr=${encodeURIComponent(genResult.khqrString)}`);
      const data = await res.json();
      if (data.success && data.deeplink) {
        window.open(data.deeplink, '_blank');
      }
    } catch (e) {
      console.error("Failed to get deeplink", e);
    }
  };

  const handleDownloadQR = () => {
    // Find the canvas inside QRPreview and trigger download
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `KHQR-${loanData.loanId}-${getAmount()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopyQR = async () => {
    if (!genResult?.khqrString) return;
    await navigator.clipboard.writeText(genResult.khqrString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mockHistory = [
    { date: 'Jun 14, 2026', amount: '$50.00', status: 'Completed', ref: 'KHQR-8924X', time: '09:30 AM' },
    { date: 'May 30, 2026', amount: '$50.00', status: 'Completed', ref: 'KHQR-8291X', time: '02:15 PM' },
    { date: 'Apr 30, 2026', amount: '$50.00', status: 'Completed', ref: 'KHQR-7182Y', time: '11:00 AM' },
    { date: 'Mar 31, 2026', amount: '$50.00', status: 'Completed', ref: 'KHQR-6093Z', time: '04:45 PM' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
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

      {/* Merchant Settings Panel */}
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
              <input type="text" value={merchantId} onChange={e => setMerchantId(e.target.value)}
                className="premium-input w-full px-4 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: s('text-secondary') }}>Merchant Name</label>
              <input type="text" value={merchantName} onChange={e => setMerchantName(e.target.value)}
                className="premium-input w-full px-4 py-2.5 rounded-xl text-sm" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Overview & Options */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Payment Overview Cards */}
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

          {/* Payment Options */}
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
              {mockHistory.map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl border" style={{ backgroundColor: s('surface-card'), borderColor: s('border-primary') }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}>
                      <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--success-text)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: s('text-primary') }}>Installment Payment</p>
                      <p className="text-xs font-medium mt-0.5" style={{ color: s('text-secondary') }}>{tx.date} at {tx.time} • {tx.ref}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: s('text-primary') }}>{tx.amount}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-1 inline-block px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
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
                    <QRPreview text={genResult?.khqrString || ''} size={240} />
                  </div>
                )}
              </div>

              {/* QR Status */}
              {genTime && !loading && (
                <div className="flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ backgroundColor: timeLeft === 'Expired' ? 'var(--error-bg)' : 'rgba(14,165,233,0.1)', color: timeLeft === 'Expired' ? 'var(--error-text)' : s('accent') }}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {timeLeft === 'Expired' ? 'Expired — regenerate to use' : `Expires in ${timeLeft}`}
                </div>
              )}

              {/* Amount display */}
              {genResult?.merchantInfo?.amount && (
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
                    <span className="text-xs font-mono font-bold" style={{ color: s('text-primary') }}>{genResult?.referenceId?.slice(0, 12) || '—'}...</span>
                  </div>
                </div>
              )}

              <div className="w-full space-y-3">
                <button onClick={handleDeeplink}
                  disabled={loading || !genResult?.khqrString}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 hover:opacity-90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  style={{ backgroundColor: s('accent'), color: s('text-inverse') }}
                >
                  <Smartphone className="w-5 h-5" />
                  Pay with Banking App
                </button>
                
                <div className="flex gap-2">
                  <button onClick={handleDownloadQR}
                    disabled={loading || !genResult?.khqrString}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 hover:bg-black/5 dark:hover:bg-white/5 border-2"
                    style={{ borderColor: s('border-primary'), color: s('text-primary') }}
                  >
                    <Download className="w-4 h-4" />
                    Save QR
                  </button>
                  <button onClick={handleCopyQR}
                    disabled={loading || !genResult?.khqrString}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 hover:bg-black/5 dark:hover:bg-white/5 border-2"
                    style={{ borderColor: s('border-primary'), color: s('text-primary') }}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

            </div>
            
            {/* Footer */}
            <div className="p-4 border-t flex items-center justify-between text-xs font-medium" style={{ borderColor: s('border-secondary'), backgroundColor: s('surface-secondary'), color: s('text-tertiary') }}>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--success-text)' }} /> Secure Payment</span>
              <span className="uppercase tracking-wider">Powered by KHQR</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}