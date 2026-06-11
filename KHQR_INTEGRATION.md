# KHQR Payment Integration Guide

## Bakong + ABA Bank Integration for NexusFinance

---

# Part 1: Bakong (NBC) KHQR Integration

## Overview

Bakong is Cambodia's national real-time payment system operated by the National Bank of Cambodia (NBC). KHQR is the standardized QR code format used by all Cambodian banks.

### How It Works

Customer scans KHQR -> Opens Bakong or any banking app -> Confirms payment -> NBC clears funds -> Webhook notifies your server

## Prerequisites

| Item | How to Get |
|------|-----------|
| Bakong Wallet | Download Bakong app, register |
| Bakong Account ID | Format: yourname@bank (e.g. merchant@aclb) |
| NBC API Token | Register with NBC for developer access |
| Server in Cambodia | Production check-transaction API only works from Cambodia IPs |

## Getting an NBC API Token

1. Email NBC at their developer support or contact your bank
2. They provide a username/password for the API
3. Call POST /v1/request_token with your credentials
4. Receive a Bearer token (expires - use /v1/renew_token)

## API Reference

### Base URLs

| Environment | URL |
|------------|-----|
| Sandbox (SIT) | https://sit-api-bakong.nbc.gov.kh/v1 |
| Production | https://api-bakong.nbc.gov.kh/v1 |

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /v1/request_token | Get access token |
| POST | /v1/verify | Verify token validity |
| POST | /v1/renew_token | Renew expiring token |
| POST | /v1/generate_deeplink_by_qr | Create payment deeplink |
| POST | /v1/check_transaction_by_md5 | Check payment by MD5 |
| POST | /v1/check_transaction_by_hash | Check payment by full hash |
| POST | /v1/check_transaction_by_short_hash | Check payment by short hash |
| POST | /v1/check_bakong_account | Verify Bakong account exists |

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
| 00 | Payload Format Indicator | 01 |
| 01 | Point of Initiation Method | 11 (static) or 12 (dynamic) |
| 29 | Bakong Account ID | merchant@aclb |
| 53 | Currency Code | 840 (USD) or 116 (KHR) |
| 54 | Amount | 25.00 |
| 58 | Country Code | KH |
| 59 | Merchant Name | NexusFinance |
| 60 | Merchant City | Phnom Penh |
| 61 | Store Label | Main Branch |
| 63 | CRC | 7D00 (CRC16-CCITT) |

### Reference Links

- Bakong API Docs: https://bakong.nbc.gov.kh/download/KHQR/integration/Bakong Open API Document.pdf
- Bakong Production API: https://api-bakong.nbc.gov.kh/v1
- Bakong Sandbox API: https://sit-api-bakong.nbc.gov.kh/v1
- KHQR SDK (Java): https://github.com/tongbora/Bakong-API-Integration-with-Spring-Boot
- KHQR Integration (Node.js): https://github.com/Leap-Chanvuthy/bakong-open-api
- CamFinTech Guide: https://www.camfintech.com/knowledge/bakong-technical-integration

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

1. Visit any ABA Bank branch with:
   - Business registration / company license
   - ID documents
   - Bank account statement
2. Request Merchant Payment Gateway / API integration
3. ABA provides:
   - Merchant ID
   - API Key & Secret
   - Endpoint URLs
   - IP whitelist registration

---

# Part 3: Current Implementation Status

## What Currently Exists in This Project

| File | Status | Description |
|------|--------|-------------|
| server/khqr.ts | Mock | EMVCo QR generation, CRC verify, decode, deeplink, transaction check |
| src/components/KHQRPage.tsx | UI | Full frontend with 5 tabs (Generate, Verify, Decode, Deeplink, Check) |
| server/index.ts | Routes | /api/khqr/* endpoints wired |

## What's Mock vs Real

| Feature | Current (Mock) | Real Implementation |
|---------|---------------|-------------------|
| QR Generation | Local EMVCo builder | NBC KHQR SDK |
| Payment Verification | Random (30% success) | Call Bakong API |
| Deeplink | Generates fake bakong:// link | Call Bakong generate_deeplink |
| Transaction Storage | In-memory Map | Database |
| Bank Coverage | Bakong only | Bakong + ABA |

---

# Part 4: Environment Variables

Add these to .env and docker-compose.env:

### Bakong (NBC)

BAKONG_API_BASE_URL=https://sit-api-bakong.nbc.gov.kh/v1
BAKONG_USERNAME=your_email@example.com
BAKONG_PASSWORD=your_api_password
BAKONG_MERCHANT_ID=merchant@aclb
BAKONG_MERCHANT_NAME=NexusFinance
BAKONG_MERCHANT_CITY=Phnom Penh

### ABA Bank

ABA_API_BASE_URL=https://api.aba.com.kh/v1
ABA_MERCHANT_ID=your_aba_merchant_id
ABA_API_KEY=your_aba_api_key
ABA_API_SECRET=your_aba_api_secret
ABA_CALLBACK_URL=https://nexusfinancefintech.vercel.app/api/payment/callback

---

# Part 5: Quick Start Checklist

- [ ] Download Bakong app and register a wallet
- [ ] Get your Bakong Account ID (e.g. yourname@aclb)
- [ ] Email NBC or your bank to request API token
- [ ] Set BAKONG_API_* variables in .env
- [ ] Update server/khqr.ts to call real Bakong API instead of mock
- [ ] Visit ABA branch with business docs to apply for merchant API
- [ ] Set ABA_API_* variables in .env
- [ ] Register server IP with ABA (for Render: contact Render for static IP)
- [ ] Create server/aba.ts for ABA payment flow
- [ ] Add webhook endpoint /api/payment/callback
- [ ] Test in sandbox environment
- [ ] Go live in production
