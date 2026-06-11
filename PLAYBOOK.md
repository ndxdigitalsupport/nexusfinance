# NexusFinance — Operations Playbook

**Version:** 1.0.0
**Last Updated:** June 10, 2026
**Live URL:** https://nexusfinance-5okf.onrender.com
**Repo:** https://github.com/Not-Juicy/nexusfinance

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Scope of Work](#4-scope-of-work)
5. [Local Development](#5-local-development)
6. [Environment Variables](#6-environment-variables)
7. [Database Schema](#7-database-schema)
8. [API Reference](#8-api-reference)
9. [Auth Flow](#9-auth-flow)
10. [Frontend Structure](#10-frontend-structure)
11. [Deployment](#11-deployment)
12. [Google Cloud Migration Guide](#12-google-cloud-migration-guide)
13. [Maintenance & Operations](#13-maintenance--operations)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Project Overview

NexusFinance is a full-stack loan management platform with three portals:

| Portal | Role | Access |
|--------|------|--------|
| **Customer** | Borrower | Apply for loans, view wallet/balance, make repayments, transaction history |
| **Loan Officer** | Underwriter | Review applications (Approve/Reject/Hold), complete KYC tasks, join simulated meetings |
| **Super Admin** | Administrator | Platform stats, user management (roles/passwords), system config, audit logs, Telegram bot commands |

### Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| customer@nexus.com | password123 | Customer |
| officer@nexus.com | password123 | Loan Officer |
| admin@nexus.com | password123 | Super Admin |

---

## 2. Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Browser     │────▶│  Express     │────▶│  Supabase    │
│  (React SPA) │     │  Server      │     │  (Postgres)  │
└─────────────┘     │  port 3001   │     └─────────────┘
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Appwrite    │
                    │  (Auth)      │
                    └──────────────┘
```

- **Frontend**: React 19 SPA, built by Vite into `dist/`, served by Express in production
- **Backend**: Single Express server (`server/index.ts`, 397 lines) — handles API + static file serving
- **Database**: Supabase (PostgreSQL) with 7 tables
- **Auth**: Appwrite handles email/password auth; server issues JWT tokens for API authorization

---

## 3. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 19.0.1 |
| Build | Vite | 6.2.3 |
| Styling | Tailwind CSS | 4.1.14 |
| Icons | Lucide React | 0.546.0 |
| Server | Express | 4.21.2 |
| Runtime | Node.js | 22 (Alpine Docker) |
| TypeScript | tsx (runtime) / tsc (type-check) | 4.21 / 5.8 |
| Database | Supabase (PostgreSQL) | — |
| Auth | Appwrite + JWT | 25.2.0 |
| Email | Nodemailer (Gmail SMTP) | 8.0.10 |
| SMS | Twilio | 6.0.2 |
| Bot | node-telegram-bot-api | 0.67.0 |
| OAuth | Passport + Google OAuth 2.0 | 0.7.0 |
| Container | Docker (node:22-alpine) | — |

---

## 4. Scope of Work

### 4.1 Frontend Scope (React SPA)

| Area | Components | Status |
|------|-----------|--------|
| **Auth UI** | `AuthPage.tsx` — Login, Register, Forgot Password, Check Email views | Done |
| **Portal Selection** | `PortalSelection.tsx` — Role-based portal picker (Customer / Officer / Admin) | Done |
| **Customer Dashboard** | `CustomerDashboard.tsx` — Wallet balance, action grid, recent history, Fast Cash promo | Done |
| **Loan Officer Dashboard** | `LoanOfficerDashboard.tsx` — Stats cards, filterable loan table, status chart, next task | Done |
| **Super Admin Dashboard** | `SuperAdminDashboard.tsx` — Stats overview, platform config editor, audit log viewer | Done |
| **Navigation** | `Sidebar.tsx`, `Header.tsx` — Role-aware sidebar, top bar with search/notifications/user menu | Done |
| **Modals** | `ApplyLoanModal.tsx` (multi-step form), `RepayModal.tsx` (payment), `ApplicationDetailsModal.tsx` (loan review), `LiveMeetingModal.tsx` (KYC video call) | Done |
| **Profile** | `ProfilePage.tsx` — Edit profile fields, change password | Done |
| **Notifications** | `Toast.tsx` — Success/error/info/warning toasts, notification bell in header | Done |
| **Loading States** | `Skeleton.tsx` — Card and table skeleton variants | Done |
| **Pagination** | `Pagination.tsx` — Reusable page controls | Done |
| **Dark Mode** | CSS class toggle on `<html>` with custom properties | Done |
| **Responsive** | Tailwind breakpoints for mobile/tablet/desktop | Done |
| **Form Validation** | Inline validation in loan application, auth, and profile forms | Done |
| **Error Handling** | API error toasts, auth failure messages, fallback UI states | Done |

### 4.2 Backend Scope (Express API)

| Area | Endpoints | Status |
|------|-----------|--------|
| **Auth** | `POST /api/auth/session`, `GET /api/auth/me`, `PATCH /api/auth/profile` | Done |
| **Loans** | `GET /api/loans`, `POST /api/loans`, `PATCH /api/loans/:id/approve`, `PATCH /api/loans/:id/reject`, `PATCH /api/loans/:id/hold` | Done |
| **Transactions** | `GET /api/transactions`, `POST /api/transactions/repay`, `POST /api/transactions/disburse` | Done |
| **Tasks** | `GET /api/tasks`, `PATCH /api/tasks/:id/complete` | Done |
| **User Management** | `GET /api/users`, `PATCH /api/users/:id/role`, `PATCH /api/users/:id/reset-password` | Done |
| **Config** | `GET /api/config`, `PATCH /api/config` | Done |
| **Stats** | `GET /api/stats` — aggregated loan volume, active customers, outstanding balance | Done |
| **Notifications** | `GET /api/notifications`, `PATCH /api/notifications/:id/read` | Done |
| **Audit Logs** | `GET /api/audit/logs` | Done |
| **System** | `GET /api/health`, `POST /api/support/message` | Done |
| **Telegram Bot** | `server/bot.ts` — `/stats`, `/loans`, `/users`, `/notifications` commands | Done |
| **Auth Provider** | `server/appwrite.ts` — Appwrite admin client for password resets | Done |
| **Middleware** | JWT verification, CORS, rate limiting, error handling, role-based access control | Done |
| **Static Serving** | Serves built React SPA from `dist/` in production, injects runtime config | Done |

### 4.3 What's NOT Built / Needs Work

| Item | Details | Priority |
|------|---------|----------|
| **Google OAuth** | `passport-google-oauth20` is installed but no route implemented for `/api/auth/google` | Low |
| **Email Verification** | Appwrite sends verification email on register, but frontend doesn't handle email link callback | Low |
| **OTP Flow** | SMS (Twilio) is configured but OTP sending is not wired into the auth flow | Low |
| **Super Admin — User Creation** | No API to create new users from scratch (only created via login session) | Medium |
| **Delete Loan** | No endpoint to delete/cancel a loan | Low |
| **Loan Document Upload** | No file upload for supporting documents during loan application | Medium |
| **Push Notifications** | No WebSocket or push notification — relies on polling via API calls | Low |
| **Unit Tests** | No test suite configured (no jest, vitest, etc.) | Medium |
| **CI/CD Pipeline** | Render auto-deploys on push, but no lint/test gates | Low |
| **API Documentation** | No OpenAPI/Swagger spec | Low |
| **Rate Limit Tuning** | Global rate limiter installed but not per-endpoint tuned | Low |
| **Data Export** | No CSV/PDF export for loans, transactions, or audit logs | Low |

## 5. Local Development

### Prerequisites
- Node.js >= 22
- npm

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env from example (see Section 5 for required vars)
cp .env.example .env

# 3. Start the server (API on port 3001)
npm run server

# 4. In a separate terminal, start the frontend dev server
npm run dev
# Frontend at http://localhost:3000, proxies API calls to :3001
```

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (port 3000) |
| `npm run server` | Start Express API (port 3001) |
| `npm run build` | Production build (outputs to `dist/`) |
| `npm run start` | Production mode (build + serve on port 3001) |
| `npm run lint` | Type-check with `tsc --noEmit` |
| `npm run preview` | Preview production build |

### Version Check

```bash
node -v    # Should be >= 22
npm -v     # Should be >= 10
```

---

## 6. Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Secret key for signing auth tokens |
| `SUPABASE_URL` | Supabase project URL (e.g., `https://xxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE` | Supabase service role key (server-side only) |

### Optional — Auth & Email

| Variable | Description | Default |
|----------|-------------|---------|
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | — |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | — |
| `SENDGRID_API_KEY` | SendGrid email API key | — |
| `SENDGRID_FROM_EMAIL` | SendGrid sender email | — |
| `RESEND_API_KEY` | Resend email API key (fallback) | — |

### Optional — SMS & Bot

| Variable | Description |
|----------|-------------|
| `TWILIO_ACCOUNT_SID` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Twilio phone number (e.g. +18551234567) |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token (from BotFather) |
| `TELEGRAM_ADMIN_ID` | Telegram admin user ID |
| `SITE_URL` | Site URL for Telegram bot web app |

### Required by Server at Startup

The server validates these on boot and exits if missing:
```
SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE, JWT_SECRET
```

---

## 7. Database Schema

### 6.1 `nexus_users` — User accounts

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| name | TEXT | NOT NULL |
| email | TEXT | UNIQUE NOT NULL |
| password | TEXT | NOT NULL DEFAULT '' |
| role | TEXT | NOT NULL DEFAULT 'customer' |
| phone | TEXT | DEFAULT '' |
| verified | BOOLEAN | NOT NULL DEFAULT false |

### 6.2 `nexus_loans` — Loan applications

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY (e.g. `#77281`) |
| applicantName | TEXT | NOT NULL |
| applicantEmail | TEXT | NOT NULL |
| initials | TEXT | NOT NULL |
| amount | NUMERIC | NOT NULL |
| type | TEXT | NOT NULL |
| status | TEXT | NOT NULL DEFAULT 'New' |
| urgency | TEXT | NOT NULL DEFAULT 'Normal' |
| assignedTo | INT | FK → nexus_users(id) ON DELETE SET NULL |
| date | TEXT | NOT NULL |
| purpose | TEXT | NOT NULL |
| creditScore | INT | NOT NULL |
| monthlyIncome | NUMERIC | NOT NULL |
| durationMonths | INT | NOT NULL |

**Status lifecycle**: `New → Review → Approved | Rejected | Hold`

### 6.3 `nexus_transactions` — Financial transactions

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| title | TEXT | NOT NULL |
| date | TEXT | NOT NULL |
| amount | NUMERIC | NOT NULL (negative = repayment, positive = disbursement) |
| type | TEXT | NOT NULL |
| userId | INT | FK → nexus_users(id) ON DELETE CASCADE |

### 6.4 `nexus_tasks` — Compliance/KYC tasks

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| title | TEXT | NOT NULL |
| applicant | TEXT | NOT NULL |
| regarding | TEXT | NOT NULL (references loan ID) |
| time | TEXT | NOT NULL |
| completed | BOOLEAN | NOT NULL DEFAULT false |

### 6.5 `nexus_config` — Platform configuration (singleton row)

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PRIMARY KEY DEFAULT 1 CHECK (id = 1) |
| baseInterestRate | NUMERIC | NOT NULL DEFAULT 5.4 |
| maxLoanAmount | NUMERIC | NOT NULL DEFAULT 500000 |
| kycRequired | BOOLEAN | NOT NULL DEFAULT true |
| autoApproveLimit | NUMERIC | NOT NULL DEFAULT 5000 |

### 6.6 `nexus_audit_logs` — Audit trail

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| action | TEXT | NOT NULL |
| details | TEXT | NOT NULL |
| userId | INT | FK → nexus_users(id) ON DELETE SET NULL |
| userEmail | TEXT | NOT NULL |
| timestamp | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### 6.7 `nexus_notifications` — In-app notifications

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| userId | INT | FK → nexus_users(id) ON DELETE CASCADE |
| text | TEXT | NOT NULL |
| time | TEXT | NOT NULL |
| unread | BOOLEAN | NOT NULL DEFAULT true |
| createdAt | TIMESTAMPTZ | NOT NULL DEFAULT NOW() |

### Seed Data

Located in `supabase-migration.sql`:
- 3 demo users (customer, loan-officer, super-admin) — all password `password123`
- 5 loan applications (various statuses)
- 2 transactions
- 3 compliance tasks
- 1 config row (5.4% interest, $500K max, $5K auto-approve)
- bcrypt password hashes pre-computed

---

## 8. API Reference

All endpoints prefixed with `/api`. Auth via `Authorization: Bearer <token>` header.

### 7.1 Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/session` | — | Exchange Appwrite session for JWT. Creates user if new. Body: `{ email, name? }` |
| GET | `/api/auth/me` | JWT | Get current user profile |
| PATCH | `/api/auth/profile` | JWT | Update name, email, or phone |

### 7.2 Loans

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/loans` | JWT | List loans (customers see own, officers/admins see all) |
| POST | `/api/loans` | JWT | Create loan application |
| PATCH | `/api/loans/:id/approve` | JWT | Approve → creates disbursement, notifies user |
| PATCH | `/api/loans/:id/reject` | JWT | Reject → notifies user |
| PATCH | `/api/loans/:id/hold` | JWT | Put on hold |

### 7.3 Transactions

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/transactions` | JWT | List user's transactions |
| POST | `/api/transactions/repay` | JWT | Record repayment (negative amount) |
| POST | `/api/transactions/disburse` | JWT | Record disbursement (positive amount) |

### 7.4 Tasks

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/tasks` | JWT | List all compliance tasks |
| PATCH | `/api/tasks/:id/complete` | JWT | Mark task complete (promotes loan to "Review" if applicable) |

### 7.5 User Management (Super Admin)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users` | JWT + admin | List all users |
| PATCH | `/api/users/:id/role` | JWT + admin | Change user role |
| PATCH | `/api/users/:id/reset-password` | JWT + admin | Reset password via Appwrite |

### 7.6 Config (Super Admin)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/config` | JWT | Get platform configuration |
| PATCH | `/api/config` | JWT + admin | Update config (interest rate, limits, etc.) |

### 7.7 Stats & Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/stats` | JWT | Aggregated platform statistics |
| GET | `/api/notifications` | JWT | Last 20 notifications for current user |
| PATCH | `/api/notifications/:id/read` | JWT | Mark notification read |
| GET | `/api/audit/logs` | JWT + admin | Last 100 audit log entries |

### 7.8 SMS

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/sms/send` | JWT | Send SMS via Twilio (sandbox logs to console if no API key) |

### 7.9 System

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | — | Health check: `{ status: 'ok', uptime: N }` |
| POST | `/api/support/message` | JWT | Submit support message (logs to console) |

---

## 9. Auth Flow

### Login Flow

```
User → Appwrite(email, password) → Session Token
     → POST /api/auth/session → Server finds/creates user in nexus_users
     → Server signs JWT {id, email, name, role} → Returns to client
     → Client stores JWT in localStorage (nexus_token)
     → All subsequent API calls include Authorization: Bearer <token>
```

### Registration Flow

```
User → Appwrite.create(ID.unique(), email, password, name) → Session
     → POST /api/auth/session → User created in nexus_users → JWT
```

### JWT Details
- **Secret**: `JWT_SECRET` env var
- **Expiry**: 24 hours
- **Payload**: `{ id, email, name, role }`
- **Storage**: `localStorage` as `nexus_token`

### Password Reset
- Initiated via Appwrite (frontend `account.createRecovery()`)
- Super Admin can reset any user's password via Appwrite admin API

### Role-Based Access
- **customer**: Own loans, own transactions, own notifications
- **loan-officer**: All loans, all tasks, stats
- **super-admin**: All of the above + user management, config, audit logs

---

## 10. Frontend Structure

```
src/
├── main.tsx                          # Entry point
├── App.tsx                           # Root component: state, API, routing (~736 lines)
├── index.css                         # Tailwind v4 + custom theme + dark mode
├── api.ts                            # API base URL configuration
├── appwriteClient.ts                 # Appwrite frontend client
├── types.ts                          # TypeScript interfaces
├── data.ts                           # Fallback/default data
├── logo.png
└── components/
    ├── ApplicationDetailsModal.tsx    # Loan detail view for officers
    ├── ApplyLoanModal.tsx             # Multi-step loan application form
    ├── AuditLogView.tsx               # Audit log table (super admin)
    ├── AuthPage.tsx                   # Login/Register/Forgot password
    ├── CustomerDashboard.tsx          # Customer portal home
    ├── Header.tsx                     # Top navigation bar
    ├── LiveMeetingModal.tsx           # KYC video call simulation
    ├── LoanOfficerDashboard.tsx       # Loan officer dashboard
    ├── Logo.tsx                       # NexusFinance logo
    ├── Pagination.tsx                 # Reusable pagination
    ├── PortalSelection.tsx            # Role-based portal picker
    ├── ProfilePage.tsx                # Edit profile & change password
    ├── RepayModal.tsx                 # Loan repayment form
    ├── Sidebar.tsx                    # Side navigation
    ├── Skeleton.tsx                   # Loading skeletons
    ├── SuperAdminDashboard.tsx        # Super admin dashboard + settings
    └── Toast.tsx                      # Toast notification system
```

### State Management
- **All state** managed via `useState` in `App.tsx`
- No state management library (Redux, Zustand, etc.)
- JWT stored in `localStorage`, loaded on app mount
- Portal selection persisted in `localStorage`

### CSS Architecture
- Tailwind CSS v4 with `@import "tailwindcss"` (no config file)
- Custom theme: `nexus-navy` (#0F171C), `nexus-teal` (#5CF2D0)
- Dark mode via CSS class on `<html>` + CSS custom properties
- Fonts: Inter (body), JetBrains Mono (code)

---

## 11. Deployment

### Current Platform: Render

Deployed as Docker container on Render Free tier.

**render.yaml** (auto-deploy config):
```yaml
services:
  - type: web
    name: nexusfinance
    runtime: docker
    repo: https://github.com/Not-Juicy/nexusfinance
    branch: main
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV    value: production
      - key: PORT        value: "3001"
```

**Deploy URL**: https://nexusfinance-5okf.onrender.com

**How to deploy**: Push to `main` branch → Render auto-deploys via webhook.

### Alternative: Fly.io

Configured in `fly.toml`:
```toml
app = "nexusfinance"
primary_region = "iad"
[http_service]
  internal_port = 3001
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
```

Deploy: `flyctl deploy`

### Docker

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "start"]
```

- Build: `docker build -t nexusfinance .`
- Run: `docker run -p 3001:3001 --env-file .env nexusfinance`

### Docker Sandbox (Beta Testing)

Use Docker Compose for local sandbox testing without affecting production:

```bash
# Create sandbox env from template
cp docker-compose.env .env.sandbox
# Edit .env.sandbox with your Supabase/Appwrite credentials
# Then build and run
docker compose --env-file .env.sandbox up --build
```

The app runs at `http://localhost:3001`. Test changes locally before pushing.

**Files:**
- `docker-compose.yml` — sandbox container config
- `docker-compose.env` — sandbox environment variables template

**Postman API testing:**

Import `postman/nexusfinance.postman_collection.json` into Postman.

1. Set `base_url` collection variable to `http://localhost:3001`
2. Run **Auth → Session Login** to get a JWT token (saves automatically)
3. Run any other endpoint — token auto-injects

---

## 12. Google Cloud Migration Guide

### Phase 1: Move Container to Cloud Run (No Code Changes)

The Dockerfile works as-is. Steps:

```bash
# One-time: authenticate
gcloud auth login

# Set project
gcloud config set project nexusfinance-499004

# Enable APIs
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com

# Create Artifact Registry repo
gcloud artifacts repositories create nexusfinance --repository-format=docker --location=us-central1

# Build and push using Cloud Build (no local Docker needed)
gcloud builds submit --tag us-central1-docker.pkg.dev/nexusfinance-499004/nexusfinance/app

# Deploy to Cloud Run
gcloud run deploy nexusfinance \
  --image=us-central1-docker.pkg.dev/nexusfinance-499004/nexusfinance/app \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --timeout=300s \
  --set-env-vars="NODE_ENV=production,PORT=3001" \
  --set-secrets="JWT_SECRET=projects/nexusfinance-499004/secrets/JWT_SECRET/versions/latest,SUPABASE_URL=projects/nexusfinance-499004/secrets/SUPABASE_URL/versions/latest,SUPABASE_ANON_KEY=projects/nexusfinance-499004/secrets/SUPABASE_ANON_KEY/versions/latest,SUPABASE_SERVICE_ROLE=projects/nexusfinance-499004/secrets/SUPABASE_SERVICE_ROLE/versions/latest"
```

**Env vars to set in Cloud Run**: Copy from current Render dashboard.

### Phase 2: Migrate Database (Optional — Firestore or Cloud SQL)

**Option A: Firestore ($$0/month)** — Requires rewriting 42 Supabase queries as denormalized Firestore calls. No JOINs, manual aggregations.

**Option B: Cloud SQL ($9-11/month)** — Keeps SQL schema. Replace `server/db.ts` with `pg` (node-postgres).

### Deployment Costs Summary

| Service | Free Tier | Paid (estimate) |
|---------|-----------|-----------------|
| Cloud Run | 2M req/mo, 360K vCPU-s, 180K GB-s | ~$0 at small scale |
| Firestore | 1GB, 50K reads/day, 20K writes/day | $0 |
| Cloud SQL (db-f1-micro) | None | $7.67/mo + $1.70 storage |
| Cloud Run + Firestore | **~$0/month** | — |
| Cloud Run + Cloud SQL | $9-11/month | — |

---

## 13. Maintenance & Operations

### Database Backups

Supabase handles automated backups. For self-hosted Postgres:
```bash
pg_dump --no-owner --no-acl -h host -U user -d nexusfinance > backup_$(date +%Y%m%d).sql
```

### Monitoring

- **Health check**: `GET /api/health` — returns `{ status: 'ok', uptime: N }`
- **Server logs**: Console output on Render dashboard (or `gcloud logging read` on Cloud Run)
- **Telegram bot**: Super Admin can use Telegram commands if `TELEGRAM_BOT_TOKEN` is set

### TypeScript / Build

```bash
npm run lint    # Type-check (tsc --noEmit) — run before commits
npm run build   # Production build — must succeed before deploy
```

### Updating Dependencies

```bash
npm outdated              # Check for outdated packages
npm update                # Safe updates (patch + minor)
npm install <pkg>@latest  # Major version upgrade
npm run lint              # Verify types after any update
```

### Logs

- **Render**: Dashboard → Service → Logs
- **Cloud Run**: `gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=nexusfinance"`
- **Local**: Console output from `npm run server`

---

## 14. Troubleshooting

### Blank Page on Deploy

The server injects Appwrite config into HTML at runtime (`server/index.ts` lines 359-380). If `window.__APPWRITE__` is missing, Appwrite SDK fails silently.

**Check**: Server log shows Appwrite env vars at startup.
**Fix**: Ensure `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY` are set in deployment env.

### Rate Limiting

Server uses `express-rate-limit` with `trust proxy` enabled. If behind a proxy (Render/Cloud Run), ensure `app.set('trust proxy', 1)` is present.

### Database Connection Issues

- Verify `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE` are correct
- Check Supabase dashboard → Settings → API for keys
- On Supabase free tier: project pauses after 1 week of inactivity. Wake via Supabase dashboard.

### JWT Token Expired

JWT expires after 24 hours. User will see "Invalid or expired token" error. Login again to get a new token.

### Container Fails to Start

```bash
# Test locally first
docker build -t nexusfinance .
docker run -p 3001:3001 --env-file .env nexusfinance
```

### Email Not Sending

The app uses Nodemailer with Gmail SMTP. Gmail blocks "less secure apps" by default.
**Fix**: Use Gmail App Password (requires 2FA enabled) or switch to SendGrid/Resend.


