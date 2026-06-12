import React, { useState, useRef, useEffect, useCallback } from 'react';
import { QrCode, ScanSearch, CheckCircle2, Link2, Search, Copy, Check, ExternalLink, AlertCircle, ArrowLeft, CreditCard, Building2, MapPin, DollarSign, Hash, Clock, User, Smartphone, ChevronRight, Info } from 'lucide-react';
import QRCode from 'qrcode';
import type { KHQRGenerateResponse, KHQRVerifyResponse, KHQRDecodeResponse, KHQRDeeplinkResponse, KHQRTransactionCheckResponse } from '../types';

const s = (name: string) => `var(--${name})`;

function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

type TabId = 'generate' | 'verify' | 'decode' | 'deeplink' | 'check';

const tabs: { id: TabId; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'generate', label: 'Generate QR', icon: QrCode, color: '#0EA5E9' },
  { id: 'verify', label: 'Verify QR', icon: CheckCircle2, color: '#10B981' },
  { id: 'decode', label: 'Decode QR', icon: ScanSearch, color: '#8B5CF6' },
  { id: 'deeplink', label: 'Deeplink', icon: Link2, color: '#F59E0B' },
  { id: 'check', label: 'Check Transaction', icon: Search, color: '#EC4899' },
];

function QRPreview({ text, size = 200 }: { text: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current && text) {
      QRCode.toCanvas(canvasRef.current, text, { width: size, margin: 2, color: { dark: '#0F171C', light: '#FFFFFF' } });
    }
  }, [text, size]);
  if (!text) return null;
  return (
    <div className="flex justify-center p-4 rounded-2xl" style={{ backgroundColor: s('surface-secondary') }}>
      <canvas ref={canvasRef} className="rounded-xl" />
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy}
      className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[12px] font-bold transition-all duration-200 cursor-pointer hover:opacity-80"
      style={{ backgroundColor: s('surface-tertiary'), color: s('text-primary') }}>
      {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> {label || 'Copy'}</>}
    </button>
  );
}

function StatusBadge({ status, valid }: { status: string; valid?: boolean }) {
  const isSuccess = status === 'SUCCESS' || valid === true;
  const isError = status === 'NOT_FOUND' || status === 'TIMEOUT' || valid === false;
  const isPending = status === 'PENDING' || status === 'pending';
  const bg = isSuccess ? 'rgba(16,185,129,0.12)' : isError ? 'rgba(239,68,68,0.12)' : isPending ? 'rgba(245,158,11,0.12)' : 'rgba(100,116,139,0.12)';
  const fg = isSuccess ? '#10B981' : isError ? '#EF4444' : isPending ? '#F59E0B' : '#64748B';
  return (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: bg, color: fg }}>
      {status}
    </span>
  );
}

const inputClass = "premium-input w-full px-4 py-2.5 rounded-xl text-[13px] font-medium outline-none transition-all duration-200 border focus:ring-2";
const inputStyle = (focus: boolean) => ({
  backgroundColor: s('surface-secondary'),
  borderColor: focus ? s('accent') : s('border-primary'),
  color: s('text-primary'),
});

function FormField({ label, children, icon }: { label: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-1.5" style={{ color: s('text-secondary') }}>
        {icon}{label}
      </label>
      {children}
    </div>
  );
}

function SectionCard({ title, icon, children, color, className = '' }: { title: string; icon: React.ReactNode; children: React.ReactNode; color?: string; className?: string }) {
  return (
    <div className={`stagger-4 premium-card rounded-2xl overflow-hidden ${className}`} style={{ borderColor: s('border-primary') }}>
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b" style={{ borderColor: s('border-secondary'), backgroundColor: s('surface-secondary') }}>
        {icon}
        <span className="text-[13px] font-bold" style={{ color: s('text-primary') }}>{title}</span>
      </div>
      <div className="p-5 space-y-4">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-[11px] font-medium" style={{ color: s('text-secondary') }}>{label}</span>
      <span className={`text-[12px] font-semibold text-right ${mono ? 'font-mono' : ''}`} style={{ color: s('text-primary') }}>
        {value}
      </span>
    </div>
  );
}

function ResultCard({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div className="rounded-2xl border p-5 space-y-4" style={{
      borderColor: color || s('border-primary'),
      backgroundColor: s('surface-card'),
    }}>
      {children}
    </div>
  );
}

export default function KHQRPage() {
  const [activeTab, setActiveTab] = useState<TabId>('generate');
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState<string | null>(null);

  const [genForm, setGenForm] = useState({ bakongAccountId: '', merchantName: '', merchantCity: 'Phnom Penh', currency: '840' as '840' | '116', amount: '', storeLabel: '', phone: '' });
  const [genResult, setGenResult] = useState<KHQRGenerateResponse | null>(null);
  const [verifyQr, setVerifyQr] = useState('');
  const [verifyResult, setVerifyResult] = useState<KHQRVerifyResponse | null>(null);
  const [decodeQr, setDecodeQr] = useState('');
  const [decodeResult, setDecodeResult] = useState<KHQRDecodeResponse | null>(null);
  const [deeplinkQr, setDeeplinkQr] = useState('');
  const [deeplinkResult, setDeeplinkResult] = useState<KHQRDeeplinkResponse | null>(null);
  const [txRefId, setTxRefId] = useState('');
  const [txResult, setTxResult] = useState<KHQRTransactionCheckResponse | null>(null);

  const apiFetch = async (url: string) => { const res = await fetch(url); return res.json(); };

  const handleGenerate = async () => {
    if (!genForm.bakongAccountId || !genForm.merchantName) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        bakongAccountId: genForm.bakongAccountId,
        merchantName: genForm.merchantName,
        merchantCity: genForm.merchantCity,
        currency: genForm.currency,
      });
      if (genForm.amount) params.append('amount', genForm.amount);
      if (genForm.storeLabel) params.append('storeLabel', genForm.storeLabel);
      if (genForm.phone) params.append('phone', genForm.phone);
      const result = await apiFetch(`/api/khqr/generate?${params.toString()}`);
      setGenResult(result);
    } catch { setGenResult({ success: false, khqrString: '', referenceId: '', merchantInfo: { name: '', city: '', currency: '' }, crc: '' }); }
    setLoading(false);
  };

  const handleVerify = async () => {
    if (!verifyQr) return;
    setLoading(true);
    try { setVerifyResult(await apiFetch(`/api/khqr/verify?qr=${encodeURIComponent(verifyQr)}`)); }
    catch { setVerifyResult({ success: false, responseCode: 1, responseMessage: 'Request failed', valid: false }); }
    setLoading(false);
  };

  const handleDecode = async () => {
    if (!decodeQr) return;
    setLoading(true);
    try { setDecodeResult(await apiFetch(`/api/khqr/decode?qr=${encodeURIComponent(decodeQr)}`)); }
    catch { setDecodeResult({ success: false, data: {}, merchantInfo: {}, crcValid: false }); }
    setLoading(false);
  };

  const handleDeeplink = async () => {
    if (!deeplinkQr) return;
    setLoading(true);
    try { setDeeplinkResult(await apiFetch(`/api/khqr/deeplink?qr=${encodeURIComponent(deeplinkQr)}`)); }
    catch { setDeeplinkResult({ success: false, deeplink: '', md5: '' }); }
    setLoading(false);
  };

  const handleCheckTx = async () => {
    if (!txRefId) return;
    setLoading(true);
    try { setTxResult(await apiFetch(`/api/khqr/check-transaction?referenceId=${encodeURIComponent(txRefId)}`)); }
    catch { setTxResult({ success: false, transactionStatus: 'ERROR', responseCode: 1, responseMessage: 'Request failed' }); }
    setLoading(false);
  };

  const useGenResult = (r: KHQRGenerateResponse | null) => {
    if (!r?.success) return null;
    return {
      qrString: r.khqrString,
      refId: r.referenceId,
      merchant: r.merchantInfo.name,
      city: r.merchantInfo.city,
      currency: r.merchantInfo.currency,
      amount: r.merchantInfo.amount,
      crc: r.crc,
    };
  };
  const gen = useGenResult(genResult);
  const tabColor = tabs.find(t => t.id === activeTab)?.color || '#0EA5E9';

  const genInputClass = (name: string) =>
    `${inputClass} ${focusField === name ? 'ring-2' : ''}`;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: s('accent') }}>
          <QrCode className="w-5.5 h-5.5" style={{ color: s('text-inverse') }} />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: s('text-primary') }}>KHQR Payment</h1>
          <p className="text-xs" style={{ color: s('text-tertiary') }}>Generate, verify, and manage Bakong QR payments</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ backgroundColor: s('surface-tertiary') }}>
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setGenResult(null); setVerifyResult(null); setDecodeResult(null); setDeeplinkResult(null); setTxResult(null); }}
              className={`stagger-${idx + 1} flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-[12px] font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer`}
              style={{
                backgroundColor: isActive ? s('surface-card') : 'transparent',
                color: isActive ? tab.color : s('text-tertiary'),
                boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              }}>
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── GENERATE ─── */}
      {activeTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 space-y-4">
            <SectionCard title="Merchant Details" icon={<Building2 className="w-4 h-4" style={{ color: tabColor }} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField label="Bakong Account ID *" icon={<User className="w-3 h-3" />}>
                  <input type="text" placeholder="e.g. merchant@aclb" value={genForm.bakongAccountId}
                    onChange={(e) => setGenForm({ ...genForm, bakongAccountId: e.target.value })}
                    onFocus={() => setFocusField('bakongId')} onBlur={() => setFocusField(null)}
                    className={genInputClass('bakongId')} style={inputStyle(focusField === 'bakongId')} />
                </FormField>
                <FormField label="Merchant Name *" icon={<Building2 className="w-3 h-3" />}>
                  <input type="text" placeholder="e.g. NexusFinance" value={genForm.merchantName}
                    onChange={(e) => setGenForm({ ...genForm, merchantName: e.target.value })}
                    onFocus={() => setFocusField('name')} onBlur={() => setFocusField(null)}
                    className={genInputClass('name')} style={inputStyle(focusField === 'name')} />
                </FormField>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField label="City" icon={<MapPin className="w-3 h-3" />}>
                  <input type="text" placeholder="Phnom Penh" value={genForm.merchantCity}
                    onChange={(e) => setGenForm({ ...genForm, merchantCity: e.target.value })}
                    onFocus={() => setFocusField('city')} onBlur={() => setFocusField(null)}
                    className={genInputClass('city')} style={inputStyle(focusField === 'city')} />
                </FormField>
                <FormField label="Currency" icon={<DollarSign className="w-3 h-3" />}>
                  <select value={genForm.currency} onChange={(e) => setGenForm({ ...genForm, currency: e.target.value as '840' | '116' })}
                    className={inputClass} style={inputStyle(false)}>
                    <option value="840">USD ($)</option>
                    <option value="116">KHR (៛)</option>
                  </select>
                </FormField>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField label="Amount (optional)" icon={<CreditCard className="w-3 h-3" />}>
                  <input type="number" placeholder="Leave empty for dynamic QR" value={genForm.amount}
                    onChange={(e) => setGenForm({ ...genForm, amount: e.target.value })}
                    onFocus={() => setFocusField('amount')} onBlur={() => setFocusField(null)}
                    className={genInputClass('amount')} style={inputStyle(focusField === 'amount')} />
                </FormField>
                <FormField label="Store Label" icon={<Hash className="w-3 h-3" />}>
                  <input type="text" placeholder="e.g. Main Branch" value={genForm.storeLabel}
                    onChange={(e) => setGenForm({ ...genForm, storeLabel: e.target.value })}
                    onFocus={() => setFocusField('store')} onBlur={() => setFocusField(null)}
                    className={genInputClass('store')} style={inputStyle(focusField === 'store')} />
                </FormField>
              </div>
              <FormField label="Phone" icon={<Smartphone className="w-3 h-3" />}>
                <input type="text" placeholder="012345678" value={genForm.phone}
                  onChange={(e) => setGenForm({ ...genForm, phone: e.target.value })}
                  onFocus={() => setFocusField('phone')} onBlur={() => setFocusField(null)}
                  className={genInputClass('phone')} style={inputStyle(focusField === 'phone')} />
              </FormField>
            </SectionCard>
            <button onClick={handleGenerate} disabled={loading || !genForm.bakongAccountId || !genForm.merchantName}
              className="w-full premium-btn-primary py-3 rounded-xl text-[13px] font-bold transition-all duration-200 cursor-pointer disabled:opacity-40"
            >
              {loading ? <span className="flex items-center justify-center gap-2"><Spinner /> Generating...</span> : 'Generate KHQR'}
            </button>
          </div>
          <div className="lg:col-span-2 space-y-4">
            {gen && (
              <SectionCard title="Payment QR Code" icon={<QrCode className="w-4 h-4" style={{ color: tabColor }} />}>
                <QRPreview text={gen.qrString} />
                <div className="text-center">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#10B981' }}>GENERATED</span>
                </div>
                {/* Receipt Summary */}
                <div className="rounded-xl p-4 space-y-1.5" style={{ backgroundColor: s('surface-secondary') }}>
                  <InfoRow label="Merchant" value={gen.merchant} />
                  <InfoRow label="City" value={gen.city} />
                  <InfoRow label="Currency" value={gen.currency} />
                  {gen.amount && <InfoRow label="Amount" value={`${gen.currency === 'KHR' ? '៛' : '$'}${gen.amount}`} />}
                  <InfoRow label="CRC" value={gen.crc} mono />
                  <div className="border-t pt-2 mt-2" style={{ borderColor: s('border-primary') }}>
                    <InfoRow label="Reference ID" value={gen.refId} mono />
                  </div>
                </div>
                <div className="flex gap-2">
                  <CopyButton text={gen.qrString} label="Copy QR String" />
                  <button onClick={() => { setVerifyQr(gen.qrString); setActiveTab('verify'); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200 cursor-pointer hover:brightness-95"
                    style={{ backgroundColor: tabColor, color: '#fff' }}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                  </button>
                </div>
              </SectionCard>
            )}
            {/* Tips card */}
            <div className="rounded-2xl border p-4 flex items-start gap-3" style={{ borderColor: s('border-primary'), backgroundColor: 'rgba(14,165,233,0.05)' }}>
              <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: tabColor }} />
              <p className="text-[11px] leading-relaxed" style={{ color: s('text-secondary') }}>
                KHQR uses EMVCo standard format. Customers can scan with any Cambodian banking app (Bakong, ABA, ACLEDA, Wing, etc.).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── VERIFY ─── */}
      {activeTab === 'verify' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SectionCard title="Paste KHQR String" icon={<ScanSearch className="w-4 h-4" style={{ color: tabColor }} />}>
            <textarea placeholder="Paste your KHQR string here to verify CRC..." value={verifyQr}
              onChange={(e) => setVerifyQr(e.target.value)} rows={6}
              className={`${inputClass} resize-none font-mono text-[11px]`} style={inputStyle(false)} />
            <button onClick={handleVerify} disabled={loading || !verifyQr}
              className="w-full premium-btn-primary py-3 rounded-xl text-[13px] font-bold transition-all duration-200 cursor-pointer disabled:opacity-40"
            >
              {loading ? <span className="flex items-center justify-center gap-2"><Spinner /> Verifying...</span> : 'Verify KHQR'}
            </button>
          </SectionCard>
          {verifyResult && (
            <SectionCard title="Verification Result" icon={<CheckCircle2 className="w-4 h-4" style={{ color: verifyResult.valid ? '#10B981' : '#EF4444' }} />}>
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: s('surface-secondary') }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: verifyResult.valid ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: verifyResult.valid ? '#10B981' : '#EF4444' }}>
                  {verifyResult.valid ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-[13px] font-bold" style={{ color: verifyResult.valid ? '#10B981' : '#EF4444' }}>
                    {verifyResult.valid ? 'CRC Valid' : 'CRC Invalid'}
                  </p>
                  <p className="text-[11px]" style={{ color: s('text-secondary') }}>{verifyResult.responseMessage}</p>
                </div>
              </div>
              <InfoRow label="Response Code" value={String(verifyResult.responseCode)} />
              {verifyQr && (
                <div className="rounded-xl p-3" style={{ backgroundColor: s('surface-secondary') }}>
                  <p className="text-[10px] font-semibold mb-1" style={{ color: s('text-secondary') }}>KHQR Preview</p>
                  <QRPreview text={verifyQr} size={160} />
                </div>
              )}
            </SectionCard>
          )}
        </div>
      )}

      {/* ─── DECODE ─── */}
      {activeTab === 'decode' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SectionCard title="Paste KHQR String" icon={<ScanSearch className="w-4 h-4" style={{ color: tabColor }} />}>
            <textarea placeholder="Paste KHQR string to decode its fields..." value={decodeQr}
              onChange={(e) => setDecodeQr(e.target.value)} rows={6}
              className={`${inputClass} resize-none font-mono text-[11px]`} style={inputStyle(false)} />
            <button onClick={handleDecode} disabled={loading || !decodeQr}
              className="w-full premium-btn-primary py-3 rounded-xl text-[13px] font-bold transition-all duration-200 cursor-pointer disabled:opacity-40"
            >
              {loading ? <span className="flex items-center justify-center gap-2"><Spinner /> Decoding...</span> : 'Decode QR'}
            </button>
          </SectionCard>
          {decodeResult && decodeResult.success && (
            <SectionCard title="Decoded Fields" icon={<Hash className="w-4 h-4" style={{ color: tabColor }} />}>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold" style={{ color: s('text-primary') }}>Merchant Info</span>
                <StatusBadge status={decodeResult.crcValid ? 'CRC VALID' : 'CRC INVALID'} valid={decodeResult.crcValid} />
              </div>
              <div className="rounded-xl p-4 space-y-1.5" style={{ backgroundColor: s('surface-secondary') }}>
                {decodeResult.merchantInfo.accountId && <InfoRow label="Account ID" value={decodeResult.merchantInfo.accountId} mono />}
                {decodeResult.merchantInfo.name && <InfoRow label="Name" value={decodeResult.merchantInfo.name} />}
                {decodeResult.merchantInfo.city && <InfoRow label="City" value={decodeResult.merchantInfo.city} />}
                {decodeResult.merchantInfo.country && <InfoRow label="Country" value={decodeResult.merchantInfo.country} />}
                {decodeResult.merchantInfo.currency && <InfoRow label="Currency" value={decodeResult.merchantInfo.currency} />}
                {decodeResult.merchantInfo.amount && <InfoRow label="Amount" value={decodeResult.merchantInfo.amount} />}
              </div>
              <div>
                <p className="text-[11px] font-semibold mb-2" style={{ color: s('text-secondary') }}>All Tags</p>
                <div className="rounded-xl p-3 space-y-1" style={{ backgroundColor: s('surface-secondary') }}>
                  {Object.entries(decodeResult.data).map(([tag, value]) => (
                    <div key={tag} className="flex justify-between text-[10px] font-mono">
                      <span style={{ color: s('text-tertiary') }}>Tag {tag}</span>
                      <span style={{ color: s('text-primary') }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {decodeQr && (
                <div className="pt-2">
                  <QRPreview text={decodeQr} size={140} />
                </div>
              )}
            </SectionCard>
          )}
        </div>
      )}

      {/* ─── DEEPLINK ─── */}
      {activeTab === 'deeplink' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SectionCard title="Generate Deeplink" icon={<Link2 className="w-4 h-4" style={{ color: tabColor }} />}>
            <textarea placeholder="Paste KHQR string to generate a Bakong deeplink..." value={deeplinkQr}
              onChange={(e) => setDeeplinkQr(e.target.value)} rows={6}
              className={`${inputClass} resize-none font-mono text-[11px]`} style={inputStyle(false)} />
            <button onClick={handleDeeplink} disabled={loading || !deeplinkQr}
              className="w-full premium-btn-primary py-3 rounded-xl text-[13px] font-bold transition-all duration-200 cursor-pointer disabled:opacity-40"
            >
              {loading ? <span className="flex items-center justify-center gap-2"><Spinner /> Generating...</span> : 'Generate Deeplink'}
            </button>
          </SectionCard>
          {deeplinkResult && deeplinkResult.success && (
            <SectionCard title="Deeplink Result" icon={<ExternalLink className="w-4 h-4" style={{ color: tabColor }} />}>
              <div className="rounded-xl p-3 break-all" style={{ backgroundColor: s('surface-secondary') }}>
                <p className="text-[10px] font-semibold mb-1" style={{ color: s('text-secondary') }}>Deeplink URL</p>
                <p className="text-[10px] font-mono leading-relaxed" style={{ color: s('text-primary') }}>{deeplinkResult.deeplink}</p>
              </div>
              <InfoRow label="MD5 Hash" value={deeplinkResult.md5} mono />
              <div className="flex gap-2">
                <CopyButton text={deeplinkResult.deeplink} label="Copy Link" />
                <a href={deeplinkResult.deeplink} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200 hover:brightness-95"
                  style={{ backgroundColor: tabColor, color: '#fff' }}>
                  <ExternalLink className="w-3.5 h-3.5" /> Open Link
                </a>
              </div>
            </SectionCard>
          )}
        </div>
      )}

      {/* ─── CHECK TRANSACTION ─── */}
      {activeTab === 'check' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SectionCard title="Check Transaction Status" icon={<Search className="w-4 h-4" style={{ color: tabColor }} />}>
            <FormField label="Reference ID" icon={<Hash className="w-3 h-3" />}>
              <input type="text" placeholder="Enter reference ID from QR generation" value={txRefId}
                onChange={(e) => setTxRefId(e.target.value)}
                className={inputClass} style={inputStyle(false)} />
            </FormField>
            <button onClick={handleCheckTx} disabled={loading || !txRefId}
              className="w-full premium-btn-primary py-3 rounded-xl text-[13px] font-bold transition-all duration-200 cursor-pointer disabled:opacity-40"
            >
              {loading ? <span className="flex items-center justify-center gap-2"><Spinner /> Checking...</span> : 'Check Status'}
            </button>
            <div className="flex items-start gap-2 p-3 rounded-xl" style={{ backgroundColor: 'rgba(245,158,11,0.08)' }}>
              <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#F59E0B' }} />
              <p className="text-[10px]" style={{ color: s('text-tertiary') }}>
                QR codes expire after 10 minutes per Bakong spec. Mock mode randomly returns PENDING or SUCCESS.
              </p>
            </div>
          </SectionCard>
          {txResult && (
            <SectionCard title="Transaction Status" icon={<CheckCircle2 className="w-4 h-4" style={{
              color: txResult.responseCode === 0 ? '#10B981' : txResult.transactionStatus === 'PENDING' ? '#F59E0B' : '#EF4444'
            }} />}>
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: s('surface-secondary') }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: txResult.responseCode === 0 ? 'rgba(16,185,129,0.12)' : txResult.transactionStatus === 'PENDING' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                    color: txResult.responseCode === 0 ? '#10B981' : txResult.transactionStatus === 'PENDING' ? '#F59E0B' : '#EF4444',
                  }}>
                  {txResult.responseCode === 0 ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-bold" style={{ color: s('text-primary') }}>
                      {txResult.responseCode === 0 ? 'Completed' : txResult.transactionStatus === 'PENDING' ? 'Pending' : 'Not Found'}
                    </p>
                    <StatusBadge status={txResult.transactionStatus} />
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: s('text-secondary') }}>{txResult.responseMessage}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <InfoRow label="Response Code" value={String(txResult.responseCode)} />
                {txResult.transactionId && <InfoRow label="Transaction ID" value={txResult.transactionId} mono />}
              </div>
            </SectionCard>
          )}
        </div>
      )}
    </div>
  );
}
