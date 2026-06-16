import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const PAYWAY_BASE_URL = process.env.PAYWAY_BASE_URL || 'https://checkout-sandbox.payway.com.kh';
const MERCHANT_ID = process.env.PAYWAY_MERCHANT_ID || '';
const API_KEY = process.env.PAYWAY_API_KEY || '';

function hmacSha512(data: string, key: string): string {
  return crypto.createHmac('sha512', key).update(data, 'utf8').digest('base64');
}

function reqTime(): string {
  const d = new Date();
  return d.getUTCFullYear().toString() +
    String(d.getUTCMonth() + 1).padStart(2, '0') +
    String(d.getUTCDate()).padStart(2, '0') +
    String(d.getUTCHours()).padStart(2, '0') +
    String(d.getUTCMinutes()).padStart(2, '0') +
    String(d.getUTCSeconds()).padStart(2, '0');
}

function newTranId(): string {
  return 'NX' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
}

export interface PayWayQRRequest {
  amount: number;
  currency?: 'USD' | 'KHR';
  lifetime?: number;
  callbackUrl?: string;
  returnParams?: string;
  items?: { name: string; quantity: number; price: number }[];
}

export interface PayWayQRResult {
  success: boolean;
  qrString: string;
  qrImage: string;
  deeplink: string;
  tranId: string;
  amount: number;
  currency: string;
  expiresAt: Date;
  raw?: any;
}

export async function generateQR(req: PayWayQRRequest): Promise<PayWayQRResult> {
  if (!MERCHANT_ID || !API_KEY) {
    throw new Error('PayWay not configured: missing MERCHANT_ID or API_KEY');
  }

  const rt = reqTime();
  const tranId = newTranId();
  const amount = req.amount.toFixed(2);
  const currency = req.currency || 'USD';
  const lifetime = req.lifetime || 15;
  const items = req.items ? Buffer.from(JSON.stringify(req.items)).toString('base64') : '';
  const callbackUrl = req.callbackUrl ? Buffer.from(req.callbackUrl).toString('base64') : '';
  const returnParams = req.returnParams || '';

  const b4hash = [
    rt, MERCHANT_ID, tranId, amount, items,
    '', '', '', '', '', // first_name, last_name, email, phone, purchase_type
    'abapay_khqr', callbackUrl, '', currency, // payment_option, callback_url, return_deeplink, currency
    '', returnParams, '', String(lifetime), '', // custom_fields, return_params, payout, lifetime, qr_image_template
  ].join('');

  const hash = hmacSha512(b4hash, API_KEY);

  const payload = {
    req_time: rt,
    merchant_id: MERCHANT_ID,
    tran_id: tranId,
    amount,
    items,
    first_name: '', last_name: '', email: '', phone: '', purchase_type: '',
    payment_option: 'abapay_khqr',
    callback_url: callbackUrl,
    return_deeplink: '',
    currency,
    custom_fields: '',
    return_params: returnParams,
    payout: '',
    lifetime: String(lifetime),
    qr_image_template: '',
    hash,
  };

  const url = `${PAYWAY_BASE_URL}/api/payment-gateway/v1/payments/generate-qr`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  const code = data.status?.code;
  if (!res.ok || (code !== '0' && code !== 0 && code !== '00')) {
    throw new Error(`PayWay error (${code}): ${data.status?.message || res.statusText}`);
  }

  return {
    success: true,
    qrString: data.qrString || '',
    qrImage: data.qrImage || '',
    deeplink: data.abapay_deeplink || '',
    tranId,
    amount: parseFloat(amount),
    currency,
    expiresAt: new Date(Date.now() + lifetime * 60 * 1000),
    raw: data,
  };
}

export interface PayWayCheckResult {
  status: 'APPROVED' | 'PENDING' | 'DECLINED' | 'NOT_FOUND';
  paymentAmount?: number;
  paymentCurrency?: string;
  apv?: string;
  raw?: any;
}

export async function checkTransaction(tranId: string): Promise<PayWayCheckResult> {
  if (!MERCHANT_ID || !API_KEY) {
    throw new Error('PayWay not configured');
  }

  const rt = reqTime();
  const b4hash = [rt, MERCHANT_ID, tranId].join('');
  const hash = hmacSha512(b4hash, API_KEY);

  const res = await fetch(`${PAYWAY_BASE_URL}/api/payment-gateway/v1/payments/check-transaction-2`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ req_time: rt, merchant_id: MERCHANT_ID, tran_id: tranId, hash }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`PayWay check error: ${res.statusText}`);

  const code = data.data?.payment_status_code;
  let status: PayWayCheckResult['status'];
  if (code === 0) status = 'APPROVED';
  else if (code === 2) status = 'PENDING';
  else if (code === 3) status = 'DECLINED';
  else status = 'NOT_FOUND';

  return {
    status,
    paymentAmount: data.data?.total_amount ?? data.data?.payment_amount,
    paymentCurrency: data.data?.payment_currency,
    apv: data.data?.apv,
    raw: data,
  };
}

export function verifyWebhook(body: string, signature: string): boolean {
  if (!API_KEY) return false;
  try {
    const payload = JSON.parse(body);
    const keys = Object.keys(payload).sort();
    const b4hash = keys.map(k => {
      const v = payload[k];
      return Array.isArray(v) ? JSON.stringify(v) : v == null ? '' : String(v);
    }).join('');
    return hmacSha512(b4hash, API_KEY) === signature;
  } catch {
    return false;
  }
}

export function isConfigured(): boolean {
  return !!(MERCHANT_ID && API_KEY);
}
