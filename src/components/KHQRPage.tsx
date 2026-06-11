import React, { useState } from 'react';
import { QrCode, ScanSearch, CheckCircle2, Link2, Search, Copy, ArrowLeft, AlertCircle, Check, ExternalLink } from 'lucide-react';
import type { KHQRGenerateResponse, KHQRVerifyResponse, KHQRDecodeResponse, KHQRDeeplinkResponse, KHQRTransactionCheckResponse } from '../types';

const s = (name: string) => `var(--${name})`;

type TabId = 'generate' | 'verify' | 'decode' | 'deeplink' | 'check';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'generate', label: 'Generate QR', icon: QrCode },
  { id: 'verify', label: 'Verify QR', icon: CheckCircle2 },
  { id: 'decode', label: 'Decode QR', icon: ScanSearch },
  { id: 'deeplink', label: 'Deeplink', icon: Link2 },
  { id: 'check', label: 'Check Transaction', icon: Search },
];

export default function KHQRPage() {
  const [activeTab, setActiveTab] = useState<TabId>('generate');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate state
  const [genForm, setGenForm] = useState({ bakongAccountId: '', merchantName: '', merchantCity: 'Phnom Penh', currency: '840' as '840' | '116', amount: '', storeLabel: '', phone: '' });
  const [genResult, setGenResult] = useState<KHQRGenerateResponse | null>(null);

  // Verify state
  const [verifyQr, setVerifyQr] = useState('');
  const [verifyResult, setVerifyResult] = useState<KHQRVerifyResponse | null>(null);

  // Decode state
  const [decodeQr, setDecodeQr] = useState('');
  const [decodeResult, setDecodeResult] = useState<KHQRDecodeResponse | null>(null);

  // Deeplink state
  const [deeplinkQr, setDeeplinkQr] = useState('');
  const [deeplinkResult, setDeeplinkResult] = useState<KHQRDeeplinkResponse | null>(null);

  // Check transaction state
  const [txRefId, setTxRefId] = useState('');
  const [txResult, setTxResult] = useState<KHQRTransactionCheckResponse | null>(null);

  const apiFetch = async (url: string) => {
    const res = await fetch(url);
    return res.json();
  };

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl text-[13px] font-medium outline-none transition-all duration-200 border";
  const inputStyle = {
    backgroundColor: s('input-bg'),
    borderColor: s('input-border'),
    color: s('text-primary'),
  };
  const labelStyle = { color: s('text-secondary') };
  const cardStyle = { backgroundColor: s('card-bg'), borderColor: s('border-primary') };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s('accent-primary') }}>
          <QrCode className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: s('text-primary') }}>KHQR Payment</h1>
          <p className="text-xs" style={{ color: s('text-muted') }}>Generate, verify, and manage Bakong QR payments</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ backgroundColor: s('bg-tertiary') }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer"
              style={{
                backgroundColor: isActive ? s('card-bg') : 'transparent',
                color: isActive ? s('accent-primary') : s('text-muted'),
                boxShadow: isActive ? `0 1px 3px ${s('shadow-color')}` : 'none',
              }}>
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Generate Tab */}
      {activeTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border p-6 space-y-4" style={cardStyle}>
            <h2 className="text-sm font-bold" style={labelStyle}>Merchant Details</h2>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={labelStyle}>Bakong Account ID *</label>
                <input type="text" placeholder="e.g. 0047888882222@nbc" value={genForm.bakongAccountId}
                  onChange={(e) => setGenForm({ ...genForm, bakongAccountId: e.target.value })}
                  className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={labelStyle}>Merchant Name *</label>
                <input type="text" placeholder="e.g. NexusFinance" value={genForm.merchantName}
                  onChange={(e) => setGenForm({ ...genForm, merchantName: e.target.value })}
                  className={inputClass} style={inputStyle} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={labelStyle}>City</label>
                  <input type="text" placeholder="Phnom Penh" value={genForm.merchantCity}
                    onChange={(e) => setGenForm({ ...genForm, merchantCity: e.target.value })}
                    className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={labelStyle}>Currency</label>
                  <select value={genForm.currency} onChange={(e) => setGenForm({ ...genForm, currency: e.target.value as '840' | '116' })}
                    className={inputClass} style={inputStyle}>
                    <option value="840">USD (840)</option>
                    <option value="116">KHR (116)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={labelStyle}>Amount (optional)</label>
                <input type="number" placeholder="Leave empty for dynamic QR" value={genForm.amount}
                  onChange={(e) => setGenForm({ ...genForm, amount: e.target.value })}
                  className={inputClass} style={inputStyle} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={labelStyle}>Store Label</label>
                  <input type="text" placeholder="Branch name" value={genForm.storeLabel}
                    onChange={(e) => setGenForm({ ...genForm, storeLabel: e.target.value })}
                    className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={labelStyle}>Phone</label>
                  <input type="text" placeholder="012345678" value={genForm.phone}
                    onChange={(e) => setGenForm({ ...genForm, phone: e.target.value })}
                    className={inputClass} style={inputStyle} />
                </div>
              </div>
            </div>
            <button onClick={handleGenerate} disabled={loading || !genForm.bakongAccountId || !genForm.merchantName}
              className="w-full py-3 rounded-xl text-[13px] font-bold transition-all duration-200 cursor-pointer disabled:opacity-40"
              style={{ backgroundColor: s('accent-primary'), color: '#fff' }}>
              {loading ? 'Generating...' : 'Generate KHQR'}
            </button>
          </div>

          {genResult && genResult.success && (
            <div className="rounded-2xl border p-6 space-y-4" style={cardStyle}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold" style={labelStyle}>Generated QR</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: s('success-bg'), color: s('success-text') }}>SUCCESS</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: s('bg-tertiary') }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: s('success-bg'), color: s('success-text') }}>
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold" style={labelStyle}>Reference ID</p>
                  <p className="text-xs font-mono font-bold" style={{ color: s('text-primary') }}>{genResult.referenceId}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[11px]"><span style={labelStyle}>Merchant</span><span className="font-semibold" style={{ color: s('text-primary') }}>{genResult.merchantInfo.name}</span></div>
                <div className="flex justify-between text-[11px]"><span style={labelStyle}>City</span><span className="font-semibold" style={{ color: s('text-primary') }}>{genResult.merchantInfo.city}</span></div>
                <div className="flex justify-between text-[11px]"><span style={labelStyle}>Currency</span><span className="font-semibold" style={{ color: s('text-primary') }}>{genResult.merchantInfo.currency}</span></div>
                {genResult.merchantInfo.amount && <div className="flex justify-between text-[11px]"><span style={labelStyle}>Amount</span><span className="font-semibold" style={{ color: s('text-primary') }}>{genResult.merchantInfo.amount}</span></div>}
                <div className="flex justify-between text-[11px]"><span style={labelStyle}>CRC</span><span className="font-mono text-[10px] font-semibold" style={{ color: s('text-muted') }}>{genResult.crc}</span></div>
              </div>
              <div className="rounded-xl p-3 break-all" style={{ backgroundColor: s('bg-tertiary') }}>
                <p className="text-[11px] font-semibold mb-1" style={labelStyle}>KHQR String</p>
                <p className="text-[10px] font-mono leading-relaxed" style={{ color: s('text-primary') }}>{genResult.khqrString}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => copyToClipboard(genResult.khqrString)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200 cursor-pointer"
                  style={{ backgroundColor: s('bg-tertiary'), color: s('text-primary') }}>
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy QR String</>}
                </button>
                <button onClick={() => { setVerifyQr(genResult.khqrString); setActiveTab('verify'); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200 cursor-pointer"
                  style={{ backgroundColor: s('accent-primary'), color: '#fff' }}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verify It
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Verify Tab */}
      {activeTab === 'verify' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border p-6 space-y-4" style={cardStyle}>
            <h2 className="text-sm font-bold" style={labelStyle}>Paste KHQR String</h2>
            <textarea placeholder="Paste your KHQR string here..." value={verifyQr}
              onChange={(e) => setVerifyQr(e.target.value)} rows={6}
              className={inputClass + " resize-none font-mono text-[11px]"} style={inputStyle} />
            <button onClick={handleVerify} disabled={loading || !verifyQr}
              className="w-full py-3 rounded-xl text-[13px] font-bold transition-all duration-200 cursor-pointer disabled:opacity-40"
              style={{ backgroundColor: s('accent-primary'), color: '#fff' }}>
              {loading ? 'Verifying...' : 'Verify CRC'}
            </button>
          </div>
          {verifyResult && (
            <div className="rounded-2xl border p-6 space-y-4" style={cardStyle}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold" style={labelStyle}>Verification Result</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: verifyResult.valid ? s('success-bg') : s('error-bg'), color: verifyResult.valid ? s('success-text') : s('error-text') }}>
                  {verifyResult.valid ? 'VALID' : 'INVALID'}
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: s('bg-tertiary') }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: verifyResult.valid ? s('success-bg') : s('error-bg'), color: verifyResult.valid ? s('success-text') : s('error-text') }}>
                  {verifyResult.valid ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-[11px] font-semibold" style={labelStyle}>Response Code</p>
                  <p className="text-xs font-bold" style={{ color: s('text-primary') }}>{verifyResult.responseCode}</p>
                </div>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: s('bg-tertiary') }}>
                <p className="text-[11px] font-semibold" style={labelStyle}>Message</p>
                <p className="text-[12px] font-medium mt-1" style={{ color: s('text-primary') }}>{verifyResult.responseMessage}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Decode Tab */}
      {activeTab === 'decode' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border p-6 space-y-4" style={cardStyle}>
            <h2 className="text-sm font-bold" style={labelStyle}>Paste KHQR String</h2>
            <textarea placeholder="Paste your KHQR string here..." value={decodeQr}
              onChange={(e) => setDecodeQr(e.target.value)} rows={6}
              className={inputClass + " resize-none font-mono text-[11px]"} style={inputStyle} />
            <button onClick={handleDecode} disabled={loading || !decodeQr}
              className="w-full py-3 rounded-xl text-[13px] font-bold transition-all duration-200 cursor-pointer disabled:opacity-40"
              style={{ backgroundColor: s('accent-primary'), color: '#fff' }}>
              {loading ? 'Decoding...' : 'Decode QR'}
            </button>
          </div>
          {decodeResult && decodeResult.success && (
            <div className="rounded-2xl border p-6 space-y-4" style={cardStyle}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold" style={labelStyle}>Decoded Fields</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: decodeResult.crcValid ? s('success-bg') : s('warning-bg'), color: decodeResult.crcValid ? s('success-text') : s('warning-text') }}>
                  CRC {decodeResult.crcValid ? 'VALID' : 'INVALID'}
                </span>
              </div>
              <div className="space-y-2">
                {decodeResult.merchantInfo.accountId && <div className="flex justify-between text-[11px]"><span style={labelStyle}>Account ID</span><span className="font-mono font-semibold text-right" style={{ color: s('text-primary') }}>{decodeResult.merchantInfo.accountId}</span></div>}
                {decodeResult.merchantInfo.name && <div className="flex justify-between text-[11px]"><span style={labelStyle}>Name</span><span className="font-semibold" style={{ color: s('text-primary') }}>{decodeResult.merchantInfo.name}</span></div>}
                {decodeResult.merchantInfo.city && <div className="flex justify-between text-[11px]"><span style={labelStyle}>City</span><span className="font-semibold" style={{ color: s('text-primary') }}>{decodeResult.merchantInfo.city}</span></div>}
                {decodeResult.merchantInfo.country && <div className="flex justify-between text-[11px]"><span style={labelStyle}>Country</span><span className="font-semibold" style={{ color: s('text-primary') }}>{decodeResult.merchantInfo.country}</span></div>}
                {decodeResult.merchantInfo.currency && <div className="flex justify-between text-[11px]"><span style={labelStyle}>Currency</span><span className="font-semibold" style={{ color: s('text-primary') }}>{decodeResult.merchantInfo.currency}</span></div>}
                {decodeResult.merchantInfo.amount && <div className="flex justify-between text-[11px]"><span style={labelStyle}>Amount</span><span className="font-semibold" style={{ color: s('text-primary') }}>{decodeResult.merchantInfo.amount}</span></div>}
              </div>
              <div className="rounded-xl p-3 space-y-1" style={{ backgroundColor: s('bg-tertiary') }}>
                <p className="text-[11px] font-semibold" style={labelStyle}>All Tags</p>
                {Object.entries(decodeResult.data).map(([tag, value]) => (
                  <div key={tag} className="flex justify-between text-[10px] font-mono">
                    <span style={{ color: s('text-muted') }}>{tag}</span>
                    <span style={{ color: s('text-primary') }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deeplink Tab */}
      {activeTab === 'deeplink' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border p-6 space-y-4" style={cardStyle}>
            <h2 className="text-sm font-bold" style={labelStyle}>Paste KHQR String</h2>
            <textarea placeholder="Paste your KHQR string to generate deeplink..." value={deeplinkQr}
              onChange={(e) => setDeeplinkQr(e.target.value)} rows={6}
              className={inputClass + " resize-none font-mono text-[11px]"} style={inputStyle} />
            <button onClick={handleDeeplink} disabled={loading || !deeplinkQr}
              className="w-full py-3 rounded-xl text-[13px] font-bold transition-all duration-200 cursor-pointer disabled:opacity-40"
              style={{ backgroundColor: s('accent-primary'), color: '#fff' }}>
              {loading ? 'Generating...' : 'Generate Deeplink'}
            </button>
          </div>
          {deeplinkResult && deeplinkResult.success && (
            <div className="rounded-2xl border p-6 space-y-4" style={cardStyle}>
              <h2 className="text-sm font-bold" style={labelStyle}>Deeplink Result</h2>
              <div className="rounded-xl p-3 break-all" style={{ backgroundColor: s('bg-tertiary') }}>
                <p className="text-[11px] font-semibold mb-1" style={labelStyle}>Deeplink URL</p>
                <p className="text-[10px] font-mono leading-relaxed" style={{ color: s('text-primary') }}>{deeplinkResult.deeplink}</p>
              </div>
              <div className="flex justify-between text-[11px] p-2 rounded-lg" style={{ backgroundColor: s('bg-tertiary') }}>
                <span style={labelStyle}>MD5 Hash</span>
                <span className="font-mono font-semibold" style={{ color: s('text-primary') }}>{deeplinkResult.md5}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => copyToClipboard(deeplinkResult.deeplink)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200 cursor-pointer"
                  style={{ backgroundColor: s('bg-tertiary'), color: s('text-primary') }}>
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy Link</>}
                </button>
                <a href={deeplinkResult.deeplink} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200"
                  style={{ backgroundColor: s('accent-primary'), color: '#fff' }}>
                  <ExternalLink className="w-3.5 h-3.5" /> Open Link
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Check Transaction Tab */}
      {activeTab === 'check' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border p-6 space-y-4" style={cardStyle}>
            <h2 className="text-sm font-bold" style={labelStyle}>Check Transaction Status</h2>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={labelStyle}>Reference ID</label>
              <input type="text" placeholder="Enter reference ID from QR generation" value={txRefId}
                onChange={(e) => setTxRefId(e.target.value)}
                className={inputClass} style={inputStyle} />
            </div>
            <button onClick={handleCheckTx} disabled={loading || !txRefId}
              className="w-full py-3 rounded-xl text-[13px] font-bold transition-all duration-200 cursor-pointer disabled:opacity-40"
              style={{ backgroundColor: s('accent-primary'), color: '#fff' }}>
              {loading ? 'Checking...' : 'Check Status'}
            </button>
            <p className="text-[10px]" style={{ color: s('text-muted') }}>Note: QR codes expire after 10 minutes per Bakong spec.</p>
          </div>
          {txResult && (
            <div className="rounded-2xl border p-6 space-y-4" style={cardStyle}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold" style={labelStyle}>Transaction Status</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: txResult.responseCode === 0 ? s('success-bg') : txResult.transactionStatus === 'PENDING' ? s('warning-bg') : s('error-bg'),
                    color: txResult.responseCode === 0 ? s('success-text') : txResult.transactionStatus === 'PENDING' ? s('warning-text') : s('error-text'),
                  }}>
                  {txResult.transactionStatus}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[11px]"><span style={labelStyle}>Response Code</span><span className="font-semibold" style={{ color: s('text-primary') }}>{txResult.responseCode}</span></div>
                <div className="flex justify-between text-[11px]"><span style={labelStyle}>Message</span><span className="font-semibold text-right" style={{ color: s('text-primary') }}>{txResult.responseMessage}</span></div>
                {txResult.transactionId && <div className="flex justify-between text-[11px]"><span style={labelStyle}>Transaction ID</span><span className="font-mono font-semibold" style={{ color: s('text-primary') }}>{txResult.transactionId}</span></div>}
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: s('bg-tertiary') }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: txResult.responseCode === 0 ? s('success-bg') : s('warning-bg'), color: txResult.responseCode === 0 ? s('success-text') : s('warning-text') }}>
                  {txResult.responseCode === 0 ? <CheckCircle2 className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                </div>
                <p className="text-[11px] font-medium" style={{ color: s('text-primary') }}>
                  {txResult.responseCode === 0 ? 'Payment received successfully!' : 'Transaction is still pending — try again in a few seconds.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}