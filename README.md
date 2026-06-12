<div align="center">

# NexusFinance

**Full-stack fintech lending platform built for Cambodia**

[![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square&logo=vercel)](https://nexusfinancefintech.vercel.app)
[![Render](https://img.shields.io/badge/Backend-Render-blueviolet?style=flat-square&logo=render)](https://nexusfinance-5okf.onrender.com)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3fcf8e?style=flat-square&logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178c6?style=flat-square&logo=typescript)](https://typescriptlang.org)

[Live Demo](https://nexusfinancefintech.vercel.app) · [API Health](https://nexusfinance-5okf.onrender.com/api/health)

</div>

---

## What is NexusFinance?

NexusFinance is a loan management system designed for microfinance operations in Cambodia. It handles the full lending lifecycle — from customer applications through officer review to admin oversight — with real-time KYC video verification and KHQR payment integration.

## Features

### Customer Portal
- Loan applications with step-by-step form
- Outstanding balance tracking and wallet management
- KHQR payment integration (Bakong-compatible)
- Transaction history and repayment scheduling

### Loan Officer Portal
- Application review dashboard with priority filtering
- Live KYC video verification with checklist
- Credit score analysis and DTI ratio calculation
- Direct loan approval/rejection workflow

### Super Admin Portal
- Platform-wide analytics and volume tracking
- Interest rate and auto-underwrite configuration
- User management and role assignment
- Full audit log with timestamped entries

### Infrastructure
- Google OAuth 2.0 login
- SMS notifications via Twilio (Cambodia +855)
- Telegram bot alerts for new applications
- Dark mode support across all interfaces
- Premium glassmorphism UI with animated transitions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Express.js, Node.js |
| Database | Supabase (PostgreSQL) |
| Auth | Google OAuth 2.0, JWT |
| Hosting | Vercel (frontend), Render (backend) |
| Payments | KHQR / EMVCo QR standard |
| SMS | Twilio |
| Charts | Recharts |

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Development

```bash
# Clone the repo
git clone https://github.com/ndxdigitalsupport/nexusfinance.git
cd nexusfinance

# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.example .env

# Start the dev server
npm run dev
```

The app runs at `http://localhost:5173` (frontend) and `http://localhost:3001` (backend).

### Environment Variables

Create a `.env` file in the project root:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE=your-service-role-key

# Frontend Supabase (VITE_ prefix)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Auth
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Appwrite
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key

# Server
PORT=3001
CORS_ORIGIN=http://localhost:5173

# SMS (optional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Telegram (optional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_ADMIN_ID=
```

## Project Structure

```
nexusfinance/
├── src/                    # React frontend
│   ├── components/         # UI components
│   │   ├── AuthPage.tsx    # Login / register / Google OAuth
│   │   ├── CustomerDashboard.tsx
│   │   ├── LoanOfficerDashboard.tsx
│   │   ├── SuperAdminDashboard.tsx
│   │   ├── KHQRPage.tsx    # QR payment interface
│   │   ├── ProfilePage.tsx
│   │   └── ...
│   ├── App.tsx             # Main app with routing
│   ├── index.css           # Design tokens & animations
│   └── api.ts              # API client
├── server/                 # Express backend
│   ├── index.ts            # API routes
│   ├── db.ts               # Supabase client
│   ├── khqr.ts             # KHQR QR generation
│   └── sms.ts              # Twilio SMS
├── vercel.json             # Vercel rewrites to Render
└── package.json
```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@nexus.com | password123 |
| Loan Officer | officer@nexus.com | password123 |
| Admin | admin@nexus.com | password123 |

## Deployment

### Frontend (Vercel)
Connected to `ndxdigitalsupport/nexusfinance` repo. Auto-deploys on push to `main`.

### Backend (Render)
Environment variables must be set in Render dashboard. Manual deploy required after env changes.

## License

Private — NexusFinance by NDX Digital Support
