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

export interface PayWayPurchaseRequest {
  amount: number;
  currency?: 'USD' | 'KHR';
  lifetime?: number;
  email?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  loanId?: string;
  returnParams?: string;
  items?: { name: string; quantity: number; price: number }[];
}

export interface PayWayPurchaseResult {
  success: boolean;
  checkoutUrl: string;
  fields: Record<string, string>;
  tranId: string;
}

export function buildPurchaseRequest(req: PayWayPurchaseRequest, frontendUrl: string): PayWayPurchaseResult {
  if (!MERCHANT_ID || !API_KEY) {
    throw new Error('PayWay not configured: missing MERCHANT_ID or API_KEY');
  }

  const rt = reqTime();
  const tranId = newTranId();
  const amount = req.currency === 'KHR'
    ? Math.round(req.amount).toString()
    : req.amount.toFixed(2);
  const currency = req.currency || 'USD';
  const lifetime = req.lifetime || 30;
  const items = req.items ? Buffer.from(JSON.stringify(req.items)).toString('base64') : '';
  const firstname = req.firstname || '';
  const lastname = req.lastname || '';
  const email = req.email || '';
  const phone = req.phone || '';
  const returnParams = req.returnParams || '';
  const callbackUrl = Buffer.from(`${frontendUrl}/api/payway/callback`).toString('base64');
  const returnUrl = Buffer.from(`${frontendUrl}/api/payway/return`).toString('base64');
  const cancelUrl = Buffer.from(`${frontendUrl}/payment/cancel`).toString('base64');
  const continueSuccessUrl = `${frontendUrl}/payment/success`;

  const fields: Record<string, string> = {
    req_time: rt,
    merchant_id: MERCHANT_ID,
    tran_id: tranId,
    amount,
    items,
    shipping: '0',
    firstname,
    lastname,
    email,
    phone,
    type: 'purchase',
    payment_option: 'abapay_khqr',
    return_url: returnUrl,
    cancel_url: cancelUrl,
    continue_success_url: continueSuccessUrl,
    return_deeplink: '',
    currency,
    custom_fields: '',
    return_params: returnParams,
    payout: '',
    lifetime: String(lifetime),
    additional_params: '',
    google_pay_token: '',
    skip_success_page: '1',
  };

  const HASH_ORDER = [
    'req_time', 'merchant_id', 'tran_id', 'amount', 'items', 'shipping',
    'firstname', 'lastname', 'email', 'phone', 'type', 'payment_option',
    'return_url', 'cancel_url', 'continue_success_url', 'return_deeplink',
    'currency', 'custom_fields', 'return_params', 'payout', 'lifetime',
    'additional_params', 'google_pay_token', 'skip_success_page',
  ];

  const b4hash = HASH_ORDER.map(k => fields[k] ?? '').join('');
  const hash = hmacSha512(b4hash, API_KEY);

  return {
    success: true,
    checkoutUrl: `${PAYWAY_BASE_URL}/api/payment-gateway/v1/payments/purchase`,
    fields: { ...fields, hash, view_type: 'hosted_view', payment_gate: '0' },
    tranId,
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
    const PURCHASE_HASH_ORDER = [
      'req_time', 'merchant_id', 'tran_id', 'amount', 'items', 'shipping',
      'firstname', 'lastname', 'email', 'phone', 'type', 'payment_option',
      'return_url', 'cancel_url', 'continue_success_url', 'return_deeplink',
      'currency', 'custom_fields', 'return_params', 'payout', 'lifetime',
      'additional_params', 'google_pay_token', 'skip_success_page',
    ];
    const b4hash = PURCHASE_HASH_ORDER.map(k => {
      const v = payload[k];
      return v == null ? '' : String(v);
    }).join('');
    return hmacSha512(b4hash, API_KEY) === signature;
  } catch {
    return false;
  }
}

export interface PayWayQRRequest {
  amount: number;
  currency?: 'USD' | 'KHR';
  email?: string;
  phone?: string;
  firstname?: string;
  lastname?: string;
  loanId?: string;
  returnParams?: string;
}

export interface PayWayQRResult {
  success: boolean;
  qrString: string;
  abapayDeeplink: string;
  tranId: string;
}

export async function generateDynamicQR(req: PayWayQRRequest, frontendUrl: string): Promise<PayWayQRResult> {
  if (!MERCHANT_ID || !API_KEY) {
    throw new Error('PayWay not configured: missing MERCHANT_ID or API_KEY');
  }

  const rt = reqTime();
  const tranId = newTranId();
  const amount = req.currency === 'KHR'
    ? Math.round(req.amount).toString()
    : req.amount.toFixed(2);
  const currency = req.currency || 'USD';
  const email = req.email || '';
  const phone = req.phone || '';
  const firstname = req.firstname || 'Nexus';
  const lastname = req.lastname || 'Customer';
  const returnParams = req.returnParams || '';
  const callbackUrl = Buffer.from(`${frontendUrl}/api/payway/callback`).toString('base64');
  const items = Buffer.from(JSON.stringify([{ name: `Loan Repayment - ${req.loanId || 'N/A'}`, quantity: 1, price: amount }])).toString('base64');

  const fields: Record<string, string> = {
    req_time: rt,
    merchant_id: MERCHANT_ID,
    tran_id: tranId,
    amount,
    items,
    first_name: firstname,
    last_name: lastname,
    email,
    phone,
    purchase_type: 'purchase',
    payment_option: 'abapay_khqr',
    callback_url: callbackUrl,
    return_deeplink: '',
    currency,
    custom_fields: '',
    return_params: returnParams,
    payout: '',
    lifetime: '30',
    qr_image_template: ''
  };

  const HASH_ORDER = [
    'req_time', 'merchant_id', 'tran_id', 'amount', 'items', 'first_name', 'last_name',
    'email', 'phone', 'purchase_type', 'payment_option', 'callback_url', 'return_deeplink',
    'currency', 'custom_fields', 'return_params', 'payout', 'lifetime', 'qr_image_template'
  ];

  const b4hash = HASH_ORDER.map(k => fields[k] ?? '').join('');
  const hash = hmacSha512(b4hash, API_KEY);

  const payload = {
    ...fields,
    hash
  };

  const res = await fetch(`${PAYWAY_BASE_URL}/api/payment-gateway/v1/payments/generate-qr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  console.log('PayWay generate-qr API raw response:', data);

  const statusVal = data && typeof data.status === 'object' ? data.status?.code : data?.status;
  
  if (!res.ok || (statusVal !== 0 && statusVal !== '0')) {
    console.error('PayWay QR API error response:', data);
    const errMsg = (data && typeof data.status === 'object' ? data.status?.message : (data?.description || data?.message || data?.error))
      || `PayWay QR Generation error: ${res.statusText} (Status: ${JSON.stringify(data?.status)})`;
    throw new Error(errMsg);
  }

  return {
    success: true,
    qrString: data.qrString || data.qr_string,
    abapayDeeplink: data.abapay_deeplink || data.abapayDeeplink,
    tranId
  };
}

export function isConfigured(): boolean {
  return !!(MERCHANT_ID && API_KEY);
}
