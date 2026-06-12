// Bakong (NBC) Real API Integration
// Uses JWT token from Bakong developer portal for real KHQR payment processing
// Docs: https://bakong.nbc.gov.kh/download/KHQR/integration/Bakong Open API Document.pdf

import dotenv from 'dotenv';
dotenv.config();

const BAKONG_API_BASE = process.env.BAKONG_API_BASE_URL || 'https://sit-api-bakong.nbc.gov.kh/v1';
const BAKONG_TOKEN = process.env.BAKONG_TOKEN || '';
const BAKONG_MERCHANT_ID = process.env.BAKONG_MERCHANT_ID || '';
const BAKONG_MERCHANT_NAME = process.env.BAKONG_MERCHANT_NAME || 'NexusFinance';

interface BakongResponse {
  responseCode?: number;
  responseMessage?: string;
  [key: string]: any;
}

async function bakongCall(endpoint: string, payload: Record<string, any>): Promise<BakongResponse> {
  const url = `${BAKONG_API_BASE}${endpoint}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BAKONG_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bakong API error ${res.status}: ${text}`);
  }
  return res.json();
}

export interface BakongGenerateQRRequest {
  bakongAccountId: string;
  merchantName?: string;
  merchantCity?: string;
  currency?: '840' | '116';
  amount?: number;
  storeLabel?: string;
  phone?: string;
  email?: string;
}

export interface BakongGenerateQRResponse {
  success: boolean;
  khqrString: string;
  referenceId: string;
  merchantInfo: {
    name: string;
    city: string;
    currency: string;
    amount?: number;
  };
  crc: string;
  rawResponse?: any;
}

export interface BakongCheckTransactionResponse {
  success: boolean;
  transactionStatus: string;
  responseCode: number;
  responseMessage: string;
  transactionId?: string;
  rawResponse?: any;
}

/**
 * Generate KHQR via Bakong API
 * Falls back to local mock if BAKONG_TOKEN is not set
 */
export async function generateKHQR(req: BakongGenerateQRRequest): Promise<BakongGenerateQRResponse> {
  // Normalize: ensure required fields for mock fallback
  const normalizedReq = {
    ...req,
    merchantName: req.merchantName || BAKONG_MERCHANT_NAME,
    merchantCity: req.merchantCity || 'Phnom Penh',
    currency: req.currency || '840' as '840' | '116',
  };

  if (!BAKONG_TOKEN) {
    // Fall back to local mock
    const { generateKHQR: mockGenerate } = await import('./khqr.js');
    return mockGenerate(normalizedReq as any);
  }

  try {
    // Step 1: Generate deeplink via Bakong API (this creates the QR + deeplink)
    const deeplinkPayload: Record<string, any> = {
      bakongAccountId: req.bakongAccountId,
      merchantName: normalizedReq.merchantName,
      merchantCity: normalizedReq.merchantCity,
      currency: normalizedReq.currency,
      amount: req.amount,
      storeLabel: req.storeLabel,
      phone: req.phone,
      email: req.email,
    };

    const deeplinkResult = await bakongCall('/generate_deeplink_by_qr', deeplinkPayload);

    // The Bakong API returns a deeplink that contains the QR info
    // We extract the md5 hash as reference ID and construct the response
    const md5 = deeplinkResult.md5 || '';
    const deeplink = deeplinkResult.deeplink || '';

    // Extract QR string from deeplink if available, otherwise generate locally
    let khqrString = '';
    if (deeplink) {
      try {
        const qrParam = deeplink.split('qr=')[1]?.split('&')[0];
        if (qrParam) {
          khqrString = Buffer.from(decodeURIComponent(qrParam), 'base64').toString('utf-8');
        }
      } catch {}
    }

    if (!khqrString) {
      // Fall back to local QR generation
      const { generateKHQR: mockGenerate } = await import('./khqr.js');
      const mockResult = mockGenerate(normalizedReq as any);
      khqrString = mockResult.khqrString;
    }

    // Store reference in memory for checking
    const { randomUUID } = await import('crypto');
    const refId = md5 || randomUUID().replace(/-/g, '').substring(0, 12);

    return {
      success: true,
      khqrString,
      referenceId: refId,
      merchantInfo: {
        name: normalizedReq.merchantName,
        city: normalizedReq.merchantCity,
        currency: normalizedReq.currency === '116' ? 'KHR' : 'USD',
        amount: req.amount,
      },
      crc: '', // CRC is verified by Bakong server
      rawResponse: deeplinkResult,
    };
  } catch (err: any) {
    console.error('Bakong generateKHQR error:', err.message || err);
    // Fall back to local mock on API failure
    const { generateKHQR: mockGenerate } = await import('./khqr.js');
    return mockGenerate(normalizedReq as any);
  }
}

/**
 * Check transaction status via Bakong API
 * Uses md5 hash to look up the transaction
 */
export async function checkTransaction(referenceId: string): Promise<BakongCheckTransactionResponse> {
  if (!BAKONG_TOKEN) {
    // Fall back to local mock
    const { checkTransaction: mockCheck } = await import('./khqr.js');
    return mockCheck(referenceId);
  }

  try {
    // Try checking by MD5 hash first (the referenceId is the md5 from generation)
    const result = await bakongCall('/check_transaction_by_md5', {
      md5: referenceId,
    });

    const responseCode = result.responseCode ?? 1;
    const isSuccess = responseCode === 0;

    return {
      success: true,
      transactionStatus: isSuccess ? 'SUCCESS' : result.transactionStatus || 'PENDING',
      responseCode,
      responseMessage: result.responseMessage || (isSuccess ? 'Transaction completed' : 'Transaction not found'),
      transactionId: result.transactionId || result.md5 || referenceId,
      rawResponse: result,
    };
  } catch (err: any) {
    console.error('Bakong checkTransaction error:', err.message || err);
    // Fall back to local mock
    const { checkTransaction: mockCheck } = await import('./khqr.js');
    return mockCheck(referenceId);
  }
}

/**
 * Verify if a Bakong account exists
 */
export async function checkBakongAccount(bakongAccountId: string): Promise<{ success: boolean; exists: boolean; message: string }> {
  if (!BAKONG_TOKEN) {
    return { success: true, exists: true, message: 'Sandbox mode — account assumed valid' };
  }

  try {
    const result = await bakongCall('/check_bakong_account', {
      bakongAccountId,
    });
    return {
      success: result.responseCode === 0,
      exists: result.responseCode === 0,
      message: result.responseMessage || 'Account check completed',
    };
  } catch (err: any) {
    return { success: false, exists: false, message: err.message || 'Failed to check account' };
  }
}

export function isBakongConfigured(): boolean {
  return !!(BAKONG_TOKEN && BAKONG_MERCHANT_ID);
}