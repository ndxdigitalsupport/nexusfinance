// KHQR Mock Implementation
// Generates realistic EMVCo-format QR strings for testing
// Replace with real Bakong API when token is available

import { randomUUID } from 'crypto';

// CRC16-CCITT-FALSE calculation for EMVCo QR checksums
function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// Build EMVCo TLV (Tag-Length-Value) string
function tlv(tag: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return tag + len + value;
}

// Parse EMVCo TLV string into key-value pairs
function parseTLV(data: string): Record<string, string> {
  const result: Record<string, string> = {};
  let i = 0;
  while (i < data.length) {
    const tag = data.substring(i, i + 2);
    const len = parseInt(data.substring(i + 2, i + 4), 10);
    const value = data.substring(i + 4, i + 4 + len);
    result[tag] = value;
    i += 4 + len;
  }
  return result;
}

export interface KHQRGenerateRequest {
  bakongAccountId: string;   // e.g. "0047888882222@nbc"
  merchantName: string;
  merchantCity: string;
  currency: '840' | '116';   // 840=USD, 116=KHR
  amount?: number;           // optional for dynamic QR
  countryCode?: string;      // default "KH"
  storeLabel?: string;
  phone?: string;
  email?: string;
}

export interface KHQRGenerateResponse {
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
}

export interface KHQRVerifyResponse {
  success: boolean;
  responseCode: number;
  responseMessage: string;
  valid: boolean;
}

export interface KHQRDecodeResponse {
  success: boolean;
  data: Record<string, string>;
  merchantInfo: {
    accountId?: string;
    name?: string;
    city?: string;
    currency?: string;
    amount?: string;
    country?: string;
  };
  crcValid: boolean;
}

export interface KHQRDeeplinkResponse {
  success: boolean;
  deeplink: string;
  md5: string;
}

export interface KHQRTransactionCheckResponse {
  success: boolean;
  transactionStatus: string;
  responseCode: number;
  responseMessage: string;
  transactionId?: string;
}

// Store pending transactions for mock
const pendingTransactions = new Map<string, {
  amount: number;
  currency: string;
  merchantName: string;
  createdAt: number;
}>();

export function generateKHQR(req: KHQRGenerateRequest): KHQRGenerateResponse {
  const refId = randomUUID().replace(/-/g, '').substring(0, 12);

  // Build EMVCo QR string per SDK spec
  const tags: string[] = [];
  tags.push(tlv('00', '01'));                          // Payload Format Indicator
  tags.push(tlv('01', req.amount ? '12' : '11'));     // 11=Dynamic, 12=Static
  tags.push(tlv('29', req.bakongAccountId));           // Bakong Account ID
  tags.push(tlv('53', req.currency || '840'));         // Transaction Currency
  if (req.amount) {
    tags.push(tlv('54', req.amount.toFixed(2)));       // Transaction Amount
  }
  tags.push(tlv('58', req.countryCode || 'KH'));      // Country Code
  tags.push(tlv('59', req.merchantName));              // Merchant Name
  tags.push(tlv('60', req.merchantCity || 'Phnom Penh')); // Merchant City
  if (req.storeLabel) {
    tags.push(tlv('61', req.storeLabel));              // Store Label
  }
  if (req.phone) {
    tags.push(tlv('62', `01${req.phone.length.toString().padStart(2,'0')}${req.phone}`)); // Additional Data
  }

  // Compute CRC over tags 00-62 (before adding tag 63)
  const dataForCrc = tags.join('') + '6304';
  const crcValue = crc16(dataForCrc);
  tags.push(tlv('63', crcValue));

  const khqrString = tags.join('');

  // Store for transaction checking
  pendingTransactions.set(refId, {
    amount: req.amount || 0,
    currency: req.currency || '840',
    merchantName: req.merchantName,
    createdAt: Date.now(),
  });

  return {
    success: true,
    khqrString,
    referenceId: refId,
    merchantInfo: {
      name: req.merchantName,
      city: req.merchantCity || 'Phnom Penh',
      currency: req.currency === '116' ? 'KHR' : 'USD',
      amount: req.amount,
    },
    crc: crcValue,
  };
}

export function verifyKHQR(khqrString: string): KHQRVerifyResponse {
  try {
    // Extract CRC (last 4 chars of the string before tag 63 value)
    const crcIdx = khqrString.indexOf('6304');
    if (crcIdx === -1) {
      return {
        success: true,
        responseCode: 2,
        responseMessage: 'Invalid QR format: missing CRC tag',
        valid: false,
      };
    }

    const dataForCrc = khqrString.substring(0, crcIdx + 4);
    const providedCrc = khqrString.substring(crcIdx + 4);
    const computedCrc = crc16(dataForCrc);

    const isValid = computedCrc === providedCrc;

    return {
      success: true,
      responseCode: isValid ? 0 : 1,
      responseMessage: isValid ? 'CRC verification successful' : `CRC mismatch: expected ${computedCrc}, got ${providedCrc}`,
      valid: isValid,
    };
  } catch {
    return {
      success: true,
      responseCode: 2,
      responseMessage: 'Failed to parse QR string',
      valid: false,
    };
  }
}

export function decodeKHQR(khqrString: string): KHQRDecodeResponse {
  try {
    const parsed = parseTLV(khqrString);

    // Verify CRC
    const crcIdx = khqrString.indexOf('6304');
    let crcValid = false;
    if (crcIdx !== -1) {
      const dataForCrc = khqrString.substring(0, crcIdx + 4);
      const providedCrc = khqrString.substring(crcIdx + 4);
      crcValid = crc16(dataForCrc) === providedCrc;
    }

    return {
      success: true,
      data: parsed,
      merchantInfo: {
        accountId: parsed['29'],
        name: parsed['59'],
        city: parsed['60'],
        currency: parsed['53'] === '116' ? 'KHR' : 'USD',
        amount: parsed['54'],
        country: parsed['58'],
      },
      crcValid,
    };
  } catch {
    return {
      success: false,
      data: {},
      merchantInfo: {},
      crcValid: false,
    };
  }
}

export function generateDeeplink(khqrString: string): KHQRDeeplinkResponse {
  const md5Hash = randomUUID().replace(/-/g, '');
  // Deeplink format per SDK: bakong://pay?qr=<base64>&md5=<hash>
  const encoded = Buffer.from(khqrString).toString('base64');
  const deeplink = `bakong://pay?qr=${encodeURIComponent(encoded)}&md5=${md5Hash}`;

  return {
    success: true,
    deeplink,
    md5: md5Hash,
  };
}

export function checkTransaction(referenceId: string): KHQRTransactionCheckResponse {
  const tx = pendingTransactions.get(referenceId);
  if (!tx) {
    return {
      success: true,
      transactionStatus: 'NOT_FOUND',
      responseCode: 1,
      responseMessage: 'Transaction not found',
    };
  }

  const elapsed = Date.now() - tx.createdAt;
  const timeoutMs = 10 * 60 * 1000; // 10 min timeout per spec

  if (elapsed > timeoutMs) {
    pendingTransactions.delete(referenceId);
    return {
      success: true,
      transactionStatus: 'TIMEOUT',
      responseCode: 1,
      responseMessage: 'QR code has expired',
    };
  }

  // Mock: randomly return PENDING or SUCCESS for demo
  const random = Math.random();
  if (random < 0.3) {
    return {
      success: true,
      transactionStatus: 'SUCCESS',
      responseCode: 0,
      responseMessage: 'Transaction completed successfully',
      transactionId: randomUUID().replace(/-/g, '').substring(0, 16),
    };
  }

  return {
    success: true,
    transactionStatus: 'PENDING',
    responseCode: 1,
    responseMessage: 'Transaction is still pending',
  };
}