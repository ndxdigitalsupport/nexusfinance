# KHQR Payment Integration Guide

## Bakong + ABA Bank Integration for NexusFinance

---

# Part 1: Bakong (NBC) KHQR Integration

## Overview

Bakong is Cambodia's national real-time payment system operated by the National Bank of Cambodia (NBC). KHQR is the standardized QR code format used by all Cambodian banks.

### How It Works

```
Customer scans KHQR → Opens Bakong or any banking app → Confirms payment → NBC clears funds → Webhook notifies your server
```

## Prerequisites

| Item | How to Get |
|------|-----------|
| Bakong Wallet | Download Bakong app, register |
| Bakong Account ID | Format: `yourname@bank` (e.g. `merchant@aclb`) |
| NBC API Token | Register with NBC for developer access (see below) |
| Server in Cambodia | Production `check-transaction` API only works from Cambodia IPs |

## Getting an NBC API Token

1. Email NBC at their developer support or contact your bank
2. They provide a username/password for the API
3. Call `POST {{baseUrl}}/v1/request_token` with your credentials
4. Receive a Bearer token (expires — use `/v1/renew_token`)

## API Reference

### Base URLs

| Environment | URL |
|------------|-----|
| Sandbox (SIT) | `https://sit-api-bakong.nbc.gov.kh/v1` |
| Production | `https://api-bakong.nbc.gov.kh/v1` |

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/request_token` | Get access token |
| POST | `/v1/verify` | Verify token validity |
| POST | `/v1/renew_token` | Renew expiring token |
| POST | `/v1/generate_deeplink_by_qr` | Create payment deeplink |
| POST | `/v1/check_transaction_by_md5` | Check payment by MD5 |
| POST | `/v1/check_transaction_by_hash` | Check payment by full hash |
| POST | `/v1/check_transaction_by_short_hash` | Check payment by short hash |
| POST | `/v1/check_bakong_account` | Verify Bakong account exists |

### 1. Request Token

```
POST {{baseUrl}}/v1/request_token
```

**Body:**
```json
{
  "username": "your_registered_email@example.com",
  "password": "your_api_password"
}
```

**Response:**
```json
{
  "responseCode": 0,
  "message": "Success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 2. Generate Deeplink

```
POST {{baseUrl}}/v1/generate_deeplink_by_qr
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "qr": "000201010212...full_khqr_string",
  "md5": "e10adc3949ba59abbe56e057f20f883e"
}
```

### 3. Check Transaction by MD5

```
POST {{baseUrl}}/v1/check_transaction_by_md5
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "md5": "e10adc3949ba59abbe56e057f20f883e"
}
```

**Response:**
```json
{
  "responseCode": 0,
  "message": "Success",
  "data": {
    "status": "SUCCESS",
    "amount": 25.00,
    "currency": "USD",
    "hash": "9bc29426b5e55f171b0e137478d04eb8",
    "fromAccountId": "customer@aclb",
    "toAccountId": "merchant@aclb",
    "transactionDate": "2025-01-15T10:30:00+07:00"
  }
}
```

### Response Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Fail / Not found |
| 2 | Static QR not supported |
| 3 | Transaction failed |
| 4 | Deeplink provider error |
| 5 | Missing required fields |
| 6 | Unauthorized |

## KHQR String Format (EMVCo)

KHQR follows the EMVCo QR standard with these tags:

| Tag | Field | Example |
|-----|-------|---------|
| `00` | Payload Format Indicator | `01` |
| `01` | Point of Initiation Method | `11` (static) or `12` (dynamic) |
| `29` | Bakong Account ID | `merchant@aclb` |
| `53` | Currency Code | `840` (USD) or `116` (KHR) |
| `54` | Amount | `25.00` |
| `58` | Country Code | `KH` |
| `59` | Merchant Name | `NexusFinance` |
| `60` | Merchant City | `Phnom Penh` |
| `61` | Store Label | `Main Branch` |
| `63` | CRC | `7D00` (CRC16-CCITT) |

### KHQR SDK

NBC provides an official KHQR SDK for generating valid QR strings:

- **Java/Kotlin**: https://github.com/Leap-Chanvuthy/bakong-open-api
- **Node.js**: Use a CRC16-CCITT implementation + EMVCo TLV builder (see `server/khqr.ts` in this project)

---

# Part 2: ABA Bank API Integration

## Overview

ABA Bank offers a separate merchant API for payment collection. Unlike Bakong (which is interbank), ABA API is specific to ABA accounts.

### Key Differences from Bakong

| Feature | Bakong | ABA |
|---------|--------|-----|
| Coverage | All Cambodian banks | ABA accounts only |
| QR Standard | KHQR (EMVCo) | ABA-specific QR |
| API Access | Apply via NBC | Apply via ABA |
| Settlement | Real-time via NBC | Batch settlement |
| Fees | Varies by bank | Negotiated with ABA |

## Prerequisites

| Item | How to Get |
|------|-----------|
| ABA Merchant Account | Apply at any ABA branch |
| ABA Corporate Account | Business account with ABA |
| API Credentials | Contact ABA Business Banking |
| Merchant ID | Provided by ABA upon approval |
| API Key/Secret | Provided by ABA upon approval |
| IP Whitelist | Register your server IP with ABA |

## How to Apply

1. Visit any **ABA Bank branch** with:
   - Business registration / company license
   - ID documents
   - Bank account statement
2. Request **Merchant Payment Gateway / API integration**
3. ABA provides:
   - Merchant ID
   - API Key & Secret
   - Endpoint URLs
   - IP whitelist registration

## API Reference

### Base URLs

| Environment | URL |
|------------|-----|
| Sandbox | Provided by ABA on request |
| Production | Provided by ABA on request |

### Common Endpoints (Typical ABA Merchant API)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/payment/init` | Create payment request |
| POST | `/api/v1/payment/status` | Check payment status |
| POST | `/api/v1/payment/refund` | Process refund |
| POST | `/api/v1/account/balance` | Check account balance |

### Initiate Payment

```
POST {{abaBaseUrl}}/api/v1/payment/init
```

**Headers:**
```
Content-Type: application/json
X-Merchant-Id: {{merchantId}}
X-Signature: {{hmac_sha256_signature}}
X-Timestamp: 2025-01-15T10:00:00Z
```

**Body:**
```json
{
  "txnId": "ORDER_20250115_001",
  "amount": 25.00,
  "currency": "USD",
  "description": "Loan repayment",
  "callbackUrl": "https://nexusfinancefintech.vercel.app/api/payment/callback",
  "customerPhone": "85512345678",
  "customerEmail": "customer@example.com"
}
```

**Response:**
```json
{
  "responseCode": 0,
  "message": "Success",
  "data": {
    "paymentUrl": "https://pay.aba.com.kh/checkout/ORDER_20250115_001",
    "qrCode": "data:image/png;base64,...",
    "expiresAt": "2025-01-15T10:30:00Z"
  }
}
```

### Payment Callback (Webhook)

ABA sends a POST to your `callbackUrl` when payment completes:

```json
{
  "txnId": "ORDER_20250115_001",
  "status": "SUCCESS",
  "amount": 25.00,
  "currency": "USD",
  "abaTxnRef": "ABA123456789",
  "settlementDate": "2025-01-16",
  "signature": "hmac_sha256_signature_for_verification"
}
```

### Check Payment Status

```
POST {{abaBaseUrl}}/api/v1/payment/status
```

**Body:**
```json
{
  "txnId": "ORDER_20250115_001"
}
```

**Response:**
```json
{
  "responseCode": 0,
  "message": "Success",
  "data": {
    "txnId": "ORDER_20250115_001",
    "status": "SUCCESS",
    "amount": 25.00,
    "currency": "USD",
    "abaTxnRef": "ABA123456789",
    "paymentMethod": "ABA Mobile",
    "paidAt": "2025-01-15T10:15:00Z"
  }
}
```

---

# Part 3: Current Implementation Status

## What Currently Exists in This Project

| File | Status | Description |
|------|--------|-------------|
| `server/khqr.ts` | ✅ Mock | EMVCo QR generation, CRC verify, decode, deeplink, transaction check |
| `src/components/KHQRPage.tsx` | ✅ UI | Full frontend with 5 tabs (Generate, Verify, Decode, Deeplink, Check) |
| `server/index.ts` | ✅ Routes | `/api/khqr/*` endpoints wired |

## What's Mock vs Real

| Feature | Current (Mock) | Real Implementation |
|---------|---------------|-------------------|
| QR Generation | Local EMVCo builder | NBC KHQR SDK |
| Payment Verification | Random (30% success) | Call Bakong API |
| Deeplink | Generates fake `bakong://` link | Call Bakong generate_deeplink |
| Transaction Storage | In-memory Map | Database |
| Bank Coverage | Bakong only | Bakong + ABA |

## What Needs to Change for Production

1. Replace `server/khqr.ts` mocks with real API calls to Bakong
2. Add ABA API module (`server/aba.ts`)
3. Store transactions in database instead of in-memory
4. Add webhook endpoints for payment callbacks
5. Add environment variables for API credentials

---

# Part 4: Environment Variables

Add these to `.env` and `docker-compose.env`:

```env
# ── Bakong (NBC) ─────────────────────────────────
BAKONG_API_BASE_URL=https://sit-api-bakong.nbc.gov.kh/v1
BAKONG_USERNAME=your_email@example.com
BAKONG_PASSWORD=your_api_password
BAKONG_MERCHANT_ID=merchant@aclb
BAKONG_MERCHANT_NAME=NexusFinance
BAKONG_MERCHANT_CITY=Phnom Penh

# ── ABA Bank ─────────────────────────────────────
ABA_API_BASE_URL=https://api.aba.com.kh/v1
ABA_MERCHANT_ID=your_aba_merchant_id
ABA_API_KEY=your_aba_api_key
ABA_API_SECRET=your_aba_api_secret
ABA_CALLBACK_URL=https://nexusfinancefintech.vercel.app/api/payment/callback
```

---

# Part 5: Quick Start Checklist

- [ ] Download Bakong app and register a wallet
- [ ] Get your Bakong Account ID (e.g. `yourname@aclb`)
- [ ] Email NBC or your bank to request API token
- [ ] Set `BAKONG_API_BASE_URL`, `BAKONG_USERNAME`, `BAKONG_PASSWORD` in `.env`
- [ ] Update `server/khqr.ts` to call real Bakong API instead of mock
- [ ] Visit ABA branch with business docs to apply for merchant API
- [ ] Set `ABA_API_*` variables in `.env`
- [ ] Register server IP with ABA (for Render: get static IP or use proxy)
- [ ] Create `server/aba.ts` for ABA payment flow
- [ ] Add webhook endpoint `/api/payment/callback`
- [ ] Test in sandbox → Go live

---

## Reference Links

| Resource | URL |
|----------|-----|
| Bakong API Docs (PDF) | https://bakong.nbc.gov.kh/download/KHQR/integration/Bakong%20Open%20API%20Document.pdf |
| Bakong Production API | https://api-bakong.nbc.gov.kh/v1 |
| Bakong Sandbox API | https://sit-api-bakong.nbc.gov.kh/v1 |
| KHQR SDK (Java) | https://github.com/tongbora/Bakong-API-Integration-with-Spring-Boot |
| KHQR Integration (Node.js) | https://github.com/Leap-Chanvuthy/bakong-open-api |
| CamFinTech Guide | https://www.camfintech.com/knowledge/bakong-technical-integration |
| ScaleKH (Cambodia Dev) | https://www.scalekh.com/services/integration/api |
