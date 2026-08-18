"""
NexusFinance Documentation Suite — Full Generator
Generates 8 documents × 2 languages = 16 .docx files
"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from engine import NexusDoc

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "DOC"))
EN_DIR = os.path.join(BASE, "EN")
KH_DIR = os.path.join(BASE, "KH")
os.makedirs(EN_DIR, exist_ok=True)
os.makedirs(KH_DIR, exist_ok=True)

# ═══════════════════════════════════════════════════════════════
#  1. EXECUTIVE OVERVIEW
# ═══════════════════════════════════════════════════════════════
def doc001(doc):
    doc.cover(version="1.0", date="August 2026", author="NDX Digital Support",
              tags=["Loan Management", "KHQR Payments", "Telegram Bot", "Android App"])
    doc.toc([
        ("1", "Executive Summary"),
        ("2", "What We Delivered"),
        ("3", "Demo Accounts"),
        ("4", "Technology Stack"),
        ("5", "Security & Compliance Highlights"),
        ("6", "Roadmap"),
    ])
    doc.h1("1. Executive Summary")
    doc.p("NexusFinance is a full-stack digital lending platform built for microfinance "
          "operations in Cambodia. It covers the complete lending lifecycle — from customer "
          "loan applications, through officer review and KYC verification, to repayment "
          "collection via KHQR payments — with real-time oversight through a secure web "
          "dashboard and a Telegram bot.")
    doc.callout("Why this matters",
                "NexusFinance replaces manual, paper-based lending workflows with a secure, "
                "auditable, and bilingual (English / Khmer) digital system.", kind="tip")

    doc.h1("2. What We Delivered")
    doc.table(
        ["Capability", "Description"],
        [
            ["Web App", "React SPA with three portals — Customer, Loan Officer, Super Admin"],
            ["Backend API", "Node.js/Express REST API with JWT authentication and audit logging"],
            ["Auth", "Email + password with Brevo OTP verification — login blocked until the email is verified"],
            ["Payments", "KHQR (Bakong) integration and ABA PayWay hosted checkout"],
            ["Telegram Bot", "Payment notifications, reminders, admin commands"],
            ["Android App", "Expo WebView shell — installable APK"],
            ["Deployment", "Vercel (frontend) + Render (backend) + Supabase (database)"],
        ],
        col_widths=[1.8, 4.6],
    )

    doc.h1("3. Demo Accounts")
    doc.table(
        ["Role", "Email", "Password"],
        [
            ["Customer", "customer@nexus.com", "password123"],
            ["Loan Officer", "officer@nexus.com", "password123"],
            ["Super Admin", "admin@nexus.com", "password123"],
        ],
        col_widths=[1.6, 2.6, 2.2],
    )
    doc.callout("Security note",
                "All passwords are stored as bcrypt hashes. OTP codes are hashed and expire "
                "after 10 minutes. All admin actions are written to an immutable audit log.",
                kind="info")

    doc.h1("4. Technology Stack")
    doc.table(
        ["Layer", "Technology"],
        [
            ["Frontend", "React 18, TypeScript, Vite, Tailwind CSS"],
            ["Backend", "Node.js, Express, TypeScript (tsx)"],
            ["Database", "Supabase (PostgreSQL)"],
            ["Auth", "JWT + bcrypt + Brevo OTP email"],
            ["Hosting", "Vercel (frontend) + Render (backend)"],
            ["Payments", "KHQR / EMVCo QR, ABA PayWay (sandbox)"],
            ["Notifications", "Telegram Bot API, Brevo transactional email"],
            ["Mobile", "Expo SDK 57, React Native WebView"],
        ],
        col_widths=[1.8, 4.6],
    )

    doc.h1("5. Security & Compliance Highlights")
    doc.bullet("JWT sessions with server-side role enforcement (customer / loan-officer / super-admin)")
    doc.bullet("Bcrypt password hashing — no plain-text credentials stored")
    doc.bullet("Email OTP verification required before first login (new accounts are locked until verified)")
    doc.bullet("Full audit log with timestamps for every sensitive action")
    doc.bullet("Rate limiting on auth endpoints to prevent brute force")
    doc.bullet("Environment variables keep all secrets out of the codebase")

    doc.h1("6. Roadmap")
    doc.check_item("Go live with ABA PayWay production checkout")
    doc.check_item("Add ACLEDA bank integration for payment notifications")
    doc.check_item("Connect Vercel auto-deploys (already connected)")
    doc.check_item("Add Google OAuth sign-in (deferred)")
    doc.check_item("Launch customer mobile app to app stores")


# ═══════════════════════════════════════════════════════════════
#  2. PLATFORM REPORT
# ═══════════════════════════════════════════════════════════════
def doc002(doc):
    doc.cover(version="1.0", date="August 2026", author="NDX Digital Support",
              tags=["Full Project Report", "Features", "Architecture", "Integrations"])
    doc.toc([
        ("1", "Project Overview"),
        ("2", "Portal Features"),
        ("3", "Authentication & User Management"),
        ("4", "Payment Integration"),
        ("5", "Telegram Bot Features"),
        ("6", "Mobile Application"),
        ("7", "Hosting & Infrastructure"),
    ])
    doc.h1("1. Project Overview")
    doc.p("NexusFinance is a comprehensive fintech lending platform designed for microfinance "
          "institutions in Cambodia. The platform serves three user roles — Customers, Loan Officers, "
          "and Super Administrators — each with a dedicated portal tailored to their workflow.")

    doc.h1("2. Portal Features")
    doc.h2("2.1 Customer Portal")
    doc.bullet("Loan application with step-by-step form (personal info, financial details, loan terms)")
    doc.bullet("Outstanding balance tracking and wallet management")
    doc.bullet("KHQR payment integration (Bakong-compatible)")
    doc.bullet("Transaction history and repayment scheduling")
    doc.bullet("Profile management (name, email, phone, password)")

    doc.h2("2.2 Loan Officer Portal")
    doc.bullet("Application review dashboard with priority filtering")
    doc.bullet("Credit score analysis and DTI ratio calculation")
    doc.bullet("Direct loan approval/rejection/hold workflow")
    doc.bullet("KYC task management")

    doc.h2("2.3 Super Admin Portal")
    doc.bullet("Platform-wide analytics and volume tracking")
    doc.bullet("Interest rate and auto-underwrite configuration")
    doc.bullet("User management (roles, password resets)")
    doc.bullet("Full audit log with timestamped entries")
    doc.bullet("System configuration")

    doc.h1("3. Authentication & User Management")
    doc.table(
        ["Feature", "Implementation"],
        [
            ["Registration", "Email + password → Brevo OTP verification (10-min expiry)"],
            ["Login", "Email + password with bcrypt comparison, JWT issued — blocked until email is verified"],
            ["Email Verification", "New accounts cannot log in until the emailed OTP is verified"],
            ["Password Reset", "Brevo OTP → verify code → set new password"],
            ["Profile Update", "PATCH /api/auth/profile (name, email, phone)"],
            ["Password Change", "OTP verification required before password update"],
            ["Role System", "customer, loan-officer, super-admin with server-side enforcement"],
        ],
        col_widths=[2.0, 4.4],
    )

    doc.h1("4. Payment Integration")
    doc.h2("4.1 KHQR (Bakong)")
    doc.p("KHQR is Cambodia's national QR payment standard based on EMVCo. NexusFinance "
          "generates KHQR codes for loan repayments and can verify payments via the Bakong API.")
    doc.bullet("Static and dynamic QR generation")
    doc.bullet("Payment verification via MD5 hash")
    doc.bullet("Deeplink generation for mobile banking apps")

    doc.h2("4.2 ABA PayWay")
    doc.p("ABA Bank's PayWay Purchase API powers hosted checkout for loan repayments. "
          "The customer selects an amount and is redirected to ABA's secure hosted checkout "
          "page (view_type: hosted_view), where they can pay via KHQR, ABA PAY, or cards.")
    doc.bullet("Sandbox mode currently active (checkout-sandbox.payway.com.kh)")
    doc.bullet("Hosted checkout with view_type=hosted_view and payment_gate=0")
    doc.bullet("HMAC-SHA512 signature on every purchase request (24-field fixed hash order)")
    doc.bullet("Return / cancel redirects to /payment/success and /payment/cancel")
    doc.bullet("Webhook callback + GET return handler both verify and persist payments")
    doc.bullet("Approved payments are persisted to the ledger (nexus_transactions) and trigger Telegram confirmation")

    doc.h1("5. Telegram Bot Features")
    doc.table(
        ["Command", "Access", "Description"],
        [
            ["/start", "All users", "Welcome message and quick actions"],
            ["/link", "All users", "Link Telegram account — emails a code to your NexusFinance profile"],
            ["/confirm <code>", "All users", "Complete linking with the emailed code"],
            ["/unlink", "All users", "Unlink Telegram account"],
            ["/status", "All users", "View linked account status"],
            ["/reminder-check", "Admin", "Run payment reminder check now"],
            ["/broadcast", "Admin", "Send message to all linked users"],
            ["/send", "Admin", "Send message to a specific user"],
            ["/stats", "Admin", "Platform statistics"],
            ["/loans", "Admin", "Recent loan applications"],
            ["/users", "Admin", "Registered users list"],
            ["/notifications", "Admin", "Recent payment notifications"],
            ["/help", "All users", "Show available commands"],
        ],
        col_widths=[1.8, 1.4, 3.2],
    )

    doc.h1("6. Mobile Application")
    doc.p("The Android app is an Expo WebView shell that loads the live web application. "
          "This allows the platform to be distributed as an installable APK while keeping "
          "all logic on the web server.")
    doc.bullet("Expo SDK 57 with React Native WebView")
    doc.bullet("Full-screen immersive design matching the web app")
    doc.bullet("Offline retry screen with brand styling")
    doc.bullet("Custom app icon and splash screen")

    doc.h1("7. Hosting & Infrastructure")
    doc.table(
        ["Component", "Service", "Details"],
        [
            ["Frontend", "Vercel", "React SPA, auto-deploys from GitHub main branch"],
            ["Backend", "Render", "Node.js/Express, free tier with UptimeRobot keep-alive"],
            ["Database", "Supabase", "PostgreSQL with Row Level Security"],
            ["Email", "Brevo", "Transactional OTP emails, 300/day free tier"],
            ["Monitoring", "UptimeRobot", "5-minute health checks on /api/health"],
            ["Bot", "Telegram API", "node-telegram-bot-api with long polling"],
        ],
        col_widths=[1.4, 1.6, 3.4],
    )


# ═══════════════════════════════════════════════════════════════
#  3. SECURITY & COMPLIANCE
# ═══════════════════════════════════════════════════════════════
def doc003(doc):
    doc.cover(version="1.0", date="August 2026", author="NDX Digital Support",
              tags=["Security", "Auth", "OTP", "Data Protection", "Audit"])
    doc.toc([
        ("1", "Authentication Architecture"),
        ("2", "Password Security"),
        ("3", "OTP Verification System"),
        ("4", "Session & Token Management"),
        ("5", "Role-Based Access Control"),
        ("6", "Audit Logging"),
        ("7", "API Security"),
        ("8", "Data Protection"),
        ("9", "Payment Security"),
    ])
    doc.h1("1. Authentication Architecture")
    doc.p("NexusFinance uses a multi-layer authentication system combining email/password "
          "with OTP verification. All authentication flows are handled by the Express backend "
          "and validated against the Supabase PostgreSQL database.")

    doc.h2("1.1 Auth Flow Summary")
    doc.table(
        ["Flow", "Steps", "Security Measure"],
        [
            ["Register", "Email + password → OTP email → verify → account created", "OTP hash, 10-min expiry"],
            ["Login", "Email + password → bcrypt verify → email must be verified → JWT issued", "Rate limited, gated on email_verified"],
            ["Email Verification", "Unverified accounts receive 403 EMAIL_NOT_VERIFIED and must verify first", "email_verified flag on nexus_users"],
            ["Forgot Password", "Email → OTP → verify → set new password", "OTP verified before change"],
            ["Change Password", "OTP email → verify → update password", "Requires active session + OTP"],
        ],
        col_widths=[1.6, 3.0, 1.8],
    )

    doc.h1("2. Password Security")
    doc.bullet("Passwords are hashed using bcrypt with salt rounds = 10")
    doc.bullet("Plain-text passwords are never stored or logged")
    doc.bullet("Password comparison uses bcrypt.compare() — constant-time to prevent timing attacks")
    doc.bullet("Minimum password length: 6 characters (enforced on registration)")
    doc.bullet("All password changes require OTP verification first")

    doc.h1("3. OTP Verification System")
    doc.table(
        ["Property", "Value"],
        [
            ["Code Length", "6 digits"],
            ["Hash Method", "bcrypt (10 rounds)"],
            ["Expiry", "10 minutes from generation"],
            ["Verified Window", "15 minutes after successful verification"],
            ["Storage", "otp_code (hashed), otp_expires_at, otp_verified_at columns on nexus_users"],
            ["Delivery", "Brevo transactional email API"],
            ["Resend Limit", "300 seconds cooldown"],
        ],
        col_widths=[2.0, 4.4],
    )
    doc.callout("Security note",
                "OTP codes are stored as bcrypt hashes, not plain text. Even if the database "
                "is compromised, the codes cannot be reversed.", kind="info")

    doc.h1("4. Session & Token Management")
    doc.bullet("JWT tokens are issued on successful login")
    doc.bullet("Token payload: { id, email, name, role, iat }")
    doc.bullet("Tokens are validated server-side on every API request")
    doc.bullet("No refresh tokens — re-login required after expiry")
    doc.bullet("Tokens are stored in browser localStorage (client-side)")

    doc.h1("5. Role-Based Access Control")
    doc.table(
        ["Role", "Permissions"],
        [
            ["customer", "Apply for loans, view own transactions, manage profile, make payments"],
            ["loan-officer", "Review applications, approve/reject/hold loans, view assigned cases, access stats & tasks"],
            ["super-admin", "Full access: analytics, user management, config, audit logs, bot commands"],
        ],
        col_widths=[1.6, 4.8],
    )
    doc.p("All API endpoints enforce role checks server-side. A user cannot access another "
          "role's endpoints even with a valid JWT token. Loan approval/rejection/hold actions "
          "and the platform statistics and tasks endpoints require a loan-officer or super-admin role.")

    doc.h1("6. Audit Logging")
    doc.bullet("Every sensitive action is logged to the nexus_audit_logs table")
    doc.bullet("Log entry: timestamp, action type, description, user metadata (id, email, name, role)")
    doc.bullet("Actions logged: login, register, loan create, loan update, profile update, password change")
    doc.bullet("Audit logs are append-only and viewable by Super Admin")

    doc.h1("7. API Security")
    doc.bullet("Rate limiting on auth endpoints (login, register, OTP, password reset)")
    doc.bullet("CORS configured to allow only the frontend origin")
    doc.bullet("Environment variables for all secrets (JWT_SECRET, API keys, database credentials)")
    doc.bullet("No secrets committed to the Git repository")
    doc.bullet("HTTPS enforced on all deployed endpoints")

    doc.h1("8. Data Protection")
    doc.bullet("User data stored in Supabase (AWS-hosted PostgreSQL)")
    doc.bullet("Service role key used for server-side operations (bypasses RLS)")
    doc.bullet("Frontend uses anon key with RLS policies")
    doc.bullet("No personally identifiable information in logs or error messages")
    doc.bullet("OTP codes never stored in plain text")

    doc.h1("9. Payment Security")
    doc.bullet("KHQR codes are generated server-side with CRC16 verification")
    doc.bullet("Payment verification requires server-side API calls (not client-side)")
    doc.bullet("ABA PayWay purchase requests are signed with HMAC-SHA512 using a fixed 24-field hash order")
    doc.bullet("PayWay webhook callbacks are verified with the same HMAC signature before processing")
    doc.bullet("Hosted checkout keeps card and account data on ABA's PCI-compliant pages — never on our servers")
    doc.bullet("All payment transactions are logged in the audit trail")
    doc.bullet("Sandbox mode active — no real money processed yet")


# ═══════════════════════════════════════════════════════════════
#  4. USER MANUAL — ADMIN & OFFICER
# ═══════════════════════════════════════════════════════════════
def doc004(doc):
    doc.cover(version="1.0", date="August 2026", author="NDX Digital Support",
              tags=["Admin Guide", "Loan Officer Guide", "Operations Manual"])
    doc.toc([
        ("1", "Logging In"),
        ("2", "Super Admin Dashboard"),
        ("3", "User Management"),
        ("4", "Loan Review Workflow"),
        ("5", "System Configuration"),
        ("6", "Audit Logs"),
        ("7", "Telegram Bot Commands"),
    ])
    doc.h1("1. Logging In")
    doc.p("Navigate to https://nexusfinancefintech.vercel.app and enter your email and password. "
          "You will be redirected to the appropriate portal based on your role.")
    doc.table(
        ["Email", "Password", "Role"],
        [
            ["admin@nexus.com", "password123", "Super Admin"],
            ["officer@nexus.com", "password123", "Loan Officer"],
        ],
        col_widths=[2.4, 2.0, 2.0],
    )

    doc.h1("2. Super Admin Dashboard")
    doc.p("The dashboard provides an overview of the entire platform:")
    doc.bullet("Outstanding balance and total volume")
    doc.bullet("Active customers and loan count")
    doc.bullet("Recent transaction history")
    doc.bullet("Quick access to Apply Loan, Repay, Wallets, Support")

    doc.h1("3. User Management")
    doc.p("Navigate to the Users section (Admin sidebar) to:")
    doc.bullet("View all registered users with search and pagination")
    doc.bullet("Change user roles (Customer, Loan Officer, Super Admin)")
    doc.bullet("Reset user passwords")
    doc.bullet("View user creation dates and last login")

    doc.h1("4. Loan Review Workflow")
    doc.h2("4.1 Viewing Applications")
    doc.p("The Loans Ledger shows all loan applications with status, amount, applicant, and dates.")
    doc.h2("4.2 Reviewing an Application")
    doc.bullet("Click on any loan to open the detail modal")
    doc.bullet("Review applicant information and financial details")
    doc.bullet("Check the credit score and DTI ratio")
    doc.h2("4.3 Taking Action")
    doc.bullet("Approve — sets status to 'approved' and notifies the customer")
    doc.bullet("Reject — sets status to 'rejected' with optional reason")
    doc.bullet("Hold — keeps the application in review status")

    doc.h1("5. System Configuration")
    doc.p("Super Admins can adjust platform settings:")
    doc.bullet("Interest rates (monthly)")
    doc.bullet("Auto-underwrite threshold")
    doc.bullet("Platform name and branding")
    doc.bullet("Minimum and maximum loan amounts")

    doc.h1("6. Audit Logs")
    doc.p("Navigate to History Logs to view the complete audit trail. Every action — logins, "
          "loan changes, profile updates, password changes — is recorded with timestamps and user details.")

    doc.h1("7. Telegram Bot Commands")
    doc.p("The following commands are available to Super Admins via the Telegram bot:")
    doc.table(
        ["Command", "Description"],
        [
            ["/stats", "View platform statistics"],
            ["/loans", "List recent loan applications"],
            ["/users", "List registered users"],
            ["/notifications", "View recent payment notifications"],
            ["/broadcast <message>", "Send a message to all linked users"],
            ["/send <user_id> <message>", "Send a message to a specific user"],
            ["/reminder-check", "Run payment reminder check now"],
        ],
        col_widths=[2.2, 4.2],
    )
    doc.callout("Tip",
                "Link your Telegram account first with /link, then confirm with /confirm <code> "
                "so the bot can send you notifications.",
                kind="tip")


# ═══════════════════════════════════════════════════════════════
#  5. USER MANUAL — CUSTOMER
# ═══════════════════════════════════════════════════════════════
def doc005(doc):
    doc.cover(version="1.0", date="August 2026", author="NDX Digital Support",
              tags=["Customer Guide", "Registration", "Loan Application", "Payments"])
    doc.toc([
        ("1", "Getting Started"),
        ("2", "Creating an Account"),
        ("3", "Applying for a Loan"),
        ("4", "Making Payments"),
        ("5", "Managing Your Profile"),
        ("6", "Frequently Asked Questions"),
    ])
    doc.h1("1. Getting Started")
    doc.p("NexusFinance is your digital lending platform. You can access it from any web browser "
          "or install the Android app for the best experience.")

    doc.h1("2. Creating an Account")
    doc.h2("2.1 Registration")
    doc.numbered("Go to https://nexusfinancefintech.vercel.app")
    doc.numbered("Click 'Register'")
    doc.numbered("Enter your name, email, and password")
    doc.numbered("Click 'Register'")
    doc.numbered("Check your email for a 6-digit verification code")
    doc.numbered("Enter the code in the verification form")
    doc.numbered("Your account is now active — you can log in")

    doc.h2("2.2 Login")
    doc.numbered("Enter your email and password")
    doc.numbered("Click 'Login'")
    doc.numbered("You will be redirected to your dashboard")
    doc.callout("Email not verified?",
                "New accounts must verify their email before the first login. If your email "
                "isn't verified yet, you'll be asked to enter the 6-digit code emailed to you "
                "during registration — log in again once it's confirmed.",
                kind="info")

    doc.callout("Forgot your password?",
                "Click 'Forgot Password' on the login page. Enter your email, receive an OTP "
                "code, verify it, then set a new password.", kind="info")

    doc.h1("3. Applying for a Loan")
    doc.h2("3.1 Start Application")
    doc.p("Click 'Apply for Loan' from the sidebar or dashboard.")
    doc.h2("3.2 Fill in Details")
    doc.bullet("Personal Information (name, email, phone)")
    doc.bullet("Loan Type (SME Loan, Personal Loan, etc.)")
    doc.bullet("Loan Amount and Duration")
    doc.bullet("Purpose of the loan")
    doc.bullet("Monthly income information")
    doc.h2("3.3 Submit")
    doc.p("Review your details and click 'Submit Application'. Your application will be "
          "reviewed by a Loan Officer.")

    doc.h1("4. Making Payments")
    doc.h2("4.1 Loan Repayment (ABA PayWay Hosted Checkout)")
    doc.p("Navigate to 'Loan Repayment' in the sidebar. The page shows your next installment "
          "due and outstanding balance for your active loan.")
    doc.numbered("Choose a payment amount: next installment, full balance, or a custom amount")
    doc.numbered("Click 'Pay Now' — an ABA PayWay secure checkout page opens in a new tab")
    doc.numbered("Complete the payment with KHQR, ABA PAY, cards, or another supported method")
    doc.numbered("After payment you are returned to the success page and the dashboard updates automatically")
    doc.p("You can also scan the KHQR code shown on the checkout page with any Bakong-compatible "
          "banking app.")

    doc.h2("4.2 View Transactions")
    doc.p("Check 'Recent Payments' on the Loan Repayment page or 'History Logs' to see all "
          "your past transactions and payments.")

    doc.h1("5. Managing Your Profile")
    doc.p("Navigate to 'Profile' in the sidebar to update your information:")
    doc.bullet("Name, email, and phone number")
    doc.bullet("Change your password (requires OTP verification)")
    doc.bullet("View your role and account status")

    doc.h1("6. Frequently Asked Questions")
    doc.table(
        ["Question", "Answer"],
        [
            ["How long does loan approval take?", "Typically 1-3 business days after submission."],
            ["What payment methods are accepted?", "KHQR (Bakong) and ABA PayWay hosted checkout (KHQR, ABA PAY, cards)."],
            ["Can I apply for multiple loans?", "Check with your loan officer for policy details."],
            ["How do I link my Telegram account?", "Send /link to the bot, then confirm with the code emailed to you (/confirm <code>)."],
        ],
        col_widths=[2.4, 4.0],
    )


# ═══════════════════════════════════════════════════════════════
#  6. TELEGRAM BOT GUIDE
# ═══════════════════════════════════════════════════════════════
def doc006(doc):
    doc.cover(version="1.0", date="August 2026", author="NDX Digital Support",
              tags=["Telegram", "Bot", "Notifications", "Admin Commands"])
    doc.toc([
        ("1", "Overview"),
        ("2", "Getting Started"),
        ("3", "User Commands"),
        ("4", "Admin Commands"),
        ("5", "Account Linking"),
        ("6", "Notifications & Reminders"),
        ("7", "Troubleshooting"),
    ])
    doc.h1("1. Overview")
    doc.p("The NexusFinance Telegram bot (@nexusfinancefintech_bot) provides real-time "
          "notifications, payment reminders, and admin tools directly inside Telegram.")

    doc.h1("2. Getting Started")
    doc.numbered("Open Telegram and search for @nexusfinancefintech_bot")
    doc.numbered("Click 'Start' or send /start")
    doc.numbered("The bot will show available commands")
    doc.numbered("Use /link to connect your Telegram account to NexusFinance")

    doc.h1("3. User Commands")
    doc.table(
        ["Command", "Description"],
        [
            ["/start", "Welcome message and quick actions"],
            ["/help", "Show all available commands"],
            ["/link", "Link your Telegram account — emails a verification code"],
            ["/confirm <code>", "Complete linking with the code sent to your email"],
            ["/unlink", "Unlink your Telegram account"],
            ["/status", "View your linked account and loan status"],
        ],
        col_widths=[1.8, 4.6],
    )

    doc.h1("4. Admin Commands")
    doc.table(
        ["Command", "Description"],
        [
            ["/stats", "View platform statistics (volume, customers, loans)"],
            ["/loans", "List recent loan applications with status"],
            ["/users", "List registered users"],
            ["/notifications", "View recent payment notifications"],
            ["/broadcast <message>", "Send a message to all linked users"],
            ["/send <user_id> <message>", "Send a message to a specific user"],
            ["/reminder-check", "Manually trigger payment reminder check"],
        ],
        col_widths=[2.4, 4.0],
    )
    doc.callout("Admin only",
                "Admin commands (/stats, /loans, /users, /broadcast, /send) are restricted to "
                "the configured admin Telegram ID.", kind="warn")

    doc.h1("5. Account Linking")
    doc.h2("5.1 Linking")
    doc.numbered("Send /link <your-email> to the bot")
    doc.numbered("A 6-digit verification code is sent to your registered email")
    doc.numbered("Send /confirm <code> to complete the link")
    doc.numbered("The code expires after 10 minutes — run /link again for a new one")
    doc.p("Once linked, you will receive payment notifications and reminders.")
    doc.h2("5.2 Unlinking")
    doc.p("Send /unlink to disconnect your Telegram account from NexusFinance.")
    doc.h2("5.3 Status Check")
    doc.p("Send /status to view your linked email and current loan status, including your "
          "monthly installment amount and next due date.")

    doc.h1("6. Notifications & Reminders")
    doc.bullet("Payment confirmations — instant notification when a payment is received")
    doc.bullet("Daily reminders — scheduled at 9:00 AM Cambodia time (Asia/Phnom_Penh)")
    doc.bullet("Reminders are based on monthly installments (amortized at 5.4% APR), not the full loan amount")
    doc.bullet("New loan alerts — admin is notified when a new loan application is submitted")

    doc.h1("7. Troubleshooting")
    doc.table(
        ["Problem", "Solution"],
        [
            ["Bot not responding", "Send /start to re-initialize"],
            ["409 Conflict error", "Only one bot instance can run — check Render logs"],
            ["Not receiving notifications", "Use /link to connect your account first"],
            ["Admin commands not working", "Verify your Telegram ID matches TELEGRAM_ADMIN_ID"],
        ],
        col_widths=[2.4, 4.0],
    )


# ═══════════════════════════════════════════════════════════════
#  7. TECHNICAL ARCHITECTURE & DEPLOYMENT
# ═══════════════════════════════════════════════════════════════
def doc007(doc):
    doc.cover(version="1.0", date="August 2026", author="NDX Digital Support",
              tags=["Architecture", "Tech Stack", "Deployment", "DevOps"])
    doc.toc([
        ("1", "System Architecture"),
        ("2", "Technology Stack"),
        ("3", "Project Structure"),
        ("4", "Database Schema"),
        ("5", "Frontend Architecture"),
        ("6", "Backend Architecture"),
        ("7", "Deployment Pipeline"),
        ("8", "Environment Variables"),
        ("9", "Local Development"),
    ])
    doc.h1("1. System Architecture")
    doc.code(
        "Customer Browser ──> Vercel (React SPA)\n"
        "                            │\n"
        "                            ▼\n"
        "                     Render (Express API)\n"
        "                         │         │\n"
        "                         ▼         ▼\n"
        "                  Supabase    Telegram Bot\n"
        "                (PostgreSQL)     (polling)\n"
        "                         │\n"
        "                    Brevo Email\n"
        "                   (OTP delivery)"
    )

    doc.h1("2. Technology Stack")
    doc.table(
        ["Layer", "Technology", "Purpose"],
        [
            ["Frontend", "React 18, TypeScript, Vite, Tailwind CSS", "User interface"],
            ["Backend", "Node.js, Express, TypeScript", "REST API server"],
            ["Database", "Supabase (PostgreSQL)", "Data storage"],
            ["Auth", "JWT + bcrypt + Brevo OTP", "Authentication"],
            ["Hosting", "Vercel + Render", "Deployment"],
            ["Payments", "KHQR, ABA PayWay (Purchase API)", "Payment processing"],
            ["Notifications", "Telegram Bot API, Brevo", "Messaging"],
            ["Mobile", "Expo SDK 57", "Android app"],
        ],
        col_widths=[1.2, 2.6, 2.6],
    )

    doc.h1("3. Project Structure")
    doc.code(
        "nexusfinance/\n"
        "├── src/                    # React frontend\n"
        "│   ├── components/         # UI components\n"
        "│   ├── App.tsx             # Main app with routing\n"
        "│   ├── api.ts              # API client\n"
        "│   └── index.css           # Design tokens\n"
        "├── server/                 # Express backend\n"
        "│   ├── index.ts            # API routes + server start\n"
        "│   ├── db.ts               # Supabase client\n"
        "│   ├── bot.ts              # Telegram bot\n"
        "│   ├── brevo.ts            # Brevo email API\n"
        "│   ├── otp.ts              # OTP generation/verification\n"
        "│   ├── khqr.ts             # KHQR QR generation\n"
        "│   ├── payway.ts           # ABA PayWay Purchase API + HMAC signing\n"
        "│   └── sms.ts              # Twilio SMS\n"
        "├── mobile/                 # Expo Android app\n"
        "├── supabase/migrations/    # Database migrations\n"
        "├── vercel.json             # Vercel rewrites to Render\n"
        "└── package.json"
    )

    doc.h1("4. Database Schema")
    doc.h2("4.1 Core Tables")
    doc.table(
        ["Table", "Key Columns", "Purpose"],
        [
            ["nexus_users", "id, name, email, password, role, phone, telegram_chat_id, email_verified, otp_*", "User accounts"],
            ["nexus_loans", "id, user_id, amount, type, status, duration_months, interest_rate", "Loan applications"],
            ["nexus_transactions", "id, user_id, loan_id, amount, type, status", "Payment transactions"],
            ["nexus_audit_logs", "id, action, description, user_id, metadata, created_at", "Audit trail"],
            ["nexus_tasks", "id, user_id, title, status, priority", "KYC and review tasks"],
            ["nexus_payway_transactions", "tran_id, email, amount, currency, status, apv, loan_id", "ABA PayWay payment records (persisted)"],
        ],
        col_widths=[1.8, 2.8, 1.8],
    )

    doc.h1("5. Frontend Architecture")
    doc.bullet("Single-page application (SPA) with React 18 and TypeScript")
    doc.bullet("Three portals: Customer, Loan Officer, Super Admin")
    doc.bullet("Lazy-loaded route components for performance")
    doc.bullet("Design tokens in CSS custom properties (dark/light mode)")
    doc.bullet("Vercel proxies /api/* to the Render backend")

    doc.h1("6. Backend Architecture")
    doc.bullet("Express.js REST API with TypeScript")
    doc.bullet("JWT authentication middleware with role checks")
    doc.bullet("Rate limiting on auth endpoints")
    doc.bullet("Cron job for daily payment reminders (9 AM Cambodia time)")
    doc.bullet("Telegram bot starts automatically with the server")

    doc.h1("7. Deployment Pipeline")
    doc.table(
        ["Component", "Trigger", "URL"],
        [
            ["Frontend (Vercel)", "Git push to main", "https://nexusfinancefintech.vercel.app"],
            ["Backend (Render)", "Git push to main (auto)", "https://nexusfinance-lof3.onrender.com"],
            ["Database (Supabase)", "Migration files", "https://jpltdxlljqqcobxuhfvb.supabase.co"],
        ],
        col_widths=[1.8, 2.0, 2.6],
    )

    doc.h1("8. Environment Variables")
    doc.p("All secrets are managed via environment variables on Render. Key variables:")
    doc.table(
        ["Variable", "Purpose"],
        [
            ["SUPABASE_URL", "Supabase project URL"],
            ["SUPABASE_SERVICE_ROLE", "Server-side Supabase access key"],
            ["BREVO_API_KEY", "Brevo transactional email API key"],
            ["TELEGRAM_BOT_TOKEN", "Telegram bot authentication token"],
            ["TELEGRAM_ADMIN_ID", "Admin Telegram user ID"],
            ["JWT_SECRET", "Token signing secret"],
            ["PAYWAY_MERCHANT_ID", "ABA PayWay merchant ID"],
            ["PAYWAY_API_KEY", "ABA PayWay API key"],
            ["PAYWAY_BASE_URL", "ABA PayWay base URL (sandbox: https://checkout-sandbox.payway.com.kh)"],
            ["CORS_ORIGIN", "Frontend origin used for ABA return/cancel URLs"],
            ["PORT", "Server listening port (set by Render)"],
        ],
        col_widths=[2.4, 4.0],
    )

    doc.h1("9. Local Development")
    doc.code(
        "git clone https://github.com/ndxdigitalsupport/nexusfinance.git\n"
        "cd nexusfinance\n"
        "npm install\n"
        "cp .env.example .env  # fill in your values\n"
        "npm run dev"
    )
    doc.p("Frontend runs on http://localhost:5173, backend on http://localhost:3001.")


# ═══════════════════════════════════════════════════════════════
#  8. API & DATABASE REFERENCE
# ═══════════════════════════════════════════════════════════════
def doc008(doc):
    doc.cover(version="1.0", date="August 2026", author="NDX Digital Support",
              tags=["API Reference", "Endpoints", "Database Schema", "Developer Guide"])
    doc.toc([
        ("1", "API Overview"),
        ("2", "Authentication Endpoints"),
        ("3", "Loan Endpoints"),
        ("4", "Transaction Endpoints"),
        ("5", "Admin Endpoints"),
        ("6", "KHQR Endpoints"),
        ("7", "PayWay Endpoints"),
        ("8", "Database Schema Detail"),
    ])
    doc.h1("1. API Overview")
    doc.p("Base URL: https://nexusfinance-lof3.onrender.com/api")
    doc.p("All endpoints return JSON. Protected endpoints require a Bearer token in the "
          "Authorization header.")
    doc.table(
        ["Status Code", "Meaning"],
        [
            ["200", "Success"],
            ["400", "Bad request (missing/invalid fields)"],
            ["401", "Unauthorized (invalid or missing token)"],
            ["403", "Forbidden (insufficient role)"],
            ["404", "Resource not found"],
            ["429", "Rate limited"],
            ["500", "Internal server error"],
        ],
        col_widths=[1.4, 5.0],
    )

    doc.h1("2. Authentication Endpoints")
    doc.h2("POST /api/auth/register")
    doc.p("Register a new user account.")
    doc.table(
        ["Field", "Type", "Required", "Description"],
        [
            ["name", "string", "Yes", "User's full name"],
            ["email", "string", "Yes", "Valid email address"],
            ["password", "string", "Yes", "Min 6 characters"],
            ["phone", "string", "No", "Phone number"],
        ],
        col_widths=[1.2, 1.0, 1.0, 3.2],
    )
    doc.p("Response: 201 { message: 'Account created. Please verify your email.' }")

    doc.h2("POST /api/auth/login")
    doc.p("Authenticate and receive a JWT token.")
    doc.table(
        ["Field", "Type", "Required", "Description"],
        [
            ["email", "string", "Yes", "Registered email"],
            ["password", "string", "Yes", "Account password"],
        ],
        col_widths=[1.2, 1.0, 1.0, 3.2],
    )
    doc.p("Response: 200 { token: 'jwt...', user: { id, name, email, role } }")
    doc.p("Response (unverified email): 403 { error: '...', code: 'EMAIL_NOT_VERIFIED' } — verify "
          "your email via send-otp + verify-otp first.")

    doc.h2("POST /api/auth/send-otp")
    doc.p("Send a 6-digit OTP to the user's email.")
    doc.table(
        ["Field", "Type", "Required", "Description"],
        [
            ["email", "string", "Yes", "Email to send OTP to"],
        ],
        col_widths=[1.2, 1.0, 1.0, 3.2],
    )

    doc.h2("POST /api/auth/verify-otp")
    doc.p("Verify the OTP code.")
    doc.table(
        ["Field", "Type", "Required", "Description"],
        [
            ["email", "string", "Yes", "Email address"],
            ["code", "string", "Yes", "6-digit code"],
        ],
        col_widths=[1.2, 1.0, 1.0, 3.2],
    )

    doc.h1("3. Loan Endpoints")
    doc.h2("GET /api/loans")
    doc.p("List all loans. Customers see only their own; admins see all.")
    doc.p("Response: 200 [ { id, user_id, name, email, amount, type, status, ... } ]")

    doc.h2("POST /api/loans")
    doc.p("Create a new loan application. Requires authentication.")
    doc.table(
        ["Field", "Type", "Required"],
        [
            ["name", "string", "Yes"],
            ["email", "string", "Yes"],
            ["amount", "number", "Yes"],
            ["type", "string", "Yes"],
            ["purpose", "string", "No"],
            ["monthlyIncome", "string", "No"],
            ["durationMonths", "string", "No"],
        ],
        col_widths=[2.0, 1.4, 1.4],
    )

    doc.h2("PATCH /api/loans/:id")
    doc.p("Update a loan status. Requires loan-officer or super-admin role.")
    doc.table(
        ["Field", "Type", "Required"],
        [
            ["status", "string", "Yes (approved/rejected/hold)"],
        ],
        col_widths=[2.0, 1.4, 1.4],
    )
    doc.p("Dedicated actions: PATCH /api/loans/:id/approve, /api/loans/:id/reject, "
          "/api/loans/:id/hold — all restricted to loan-officer and super-admin.")

    doc.h1("4. Transaction Endpoints")
    doc.h2("GET /api/transactions")
    doc.p("List transactions. Customers see their own; admins see all.")
    doc.h2("POST /api/transactions")
    doc.p("Record a new transaction.")
    doc.h2("POST /api/simulate-payment")
    doc.p("Simulate a payment callback (for testing). Triggers Telegram notification.")

    doc.h1("5. Admin Endpoints")
    doc.p("The following endpoints require a loan-officer or super-admin role:")
    doc.table(
        ["Endpoint", "Method", "Description"],
        [
            ["/api/stats", "GET", "Platform statistics"],
            ["/api/users", "GET", "List all users (paginated)"],
            ["/api/audit/logs", "GET", "Audit log entries"],
            ["/api/config", "GET/PATCH", "Platform configuration"],
            ["/api/tasks", "GET", "KYC/review tasks"],
        ],
        col_widths=[2.0, 1.0, 3.4],
    )

    doc.h1("6. KHQR Endpoints")
    doc.table(
        ["Endpoint", "Method", "Description"],
        [
            ["/api/khqr/generate", "POST", "Generate a KHQR code"],
            ["/api/khqr/verify", "POST", "Verify a payment by MD5"],
            ["/api/khqr/decode", "POST", "Decode a KHQR string"],
            ["/api/khqr/deeplink", "POST", "Generate a payment deeplink"],
        ],
        col_widths=[2.0, 1.0, 3.4],
    )

    doc.h1("7. PayWay Endpoints")
    doc.p("NexusFinance uses the ABA PayWay Purchase API with hosted checkout. The frontend "
          "calls /api/payway/purchase, then submits the returned fields as a form to ABA's "
          "checkout URL. The return / cancel endpoints handle the post-payment redirects.")
    doc.table(
        ["Endpoint", "Method", "Description"],
        [
            ["/api/payway/purchase", "POST", "Create a hosted-checkout purchase (view_type=hosted_view) and persist a PENDING record"],
            ["/api/payway/return", "GET", "ABA success redirect; verifies status, records approved payments, redirects to /payment/success"],
            ["/api/payway/cancel", "GET", "ABA cancel redirect; redirects to /payment/cancel"],
            ["/api/payway/verify-payment", "POST", "Check transaction status; marks APPROVED + writes ledger"],
            ["/api/payway/callback", "POST", "ABA webhook (HMAC-signed) with approval/decline updates"],
            ["/api/payway/simulate-payment", "POST", "Sandbox-only helper to approve a payment for testing"],
            ["/api/payway/transactions", "GET", "List recent PayWay transactions from the database"],
            ["/api/payway/generate-qr", "POST", "Legacy endpoint; now delegates to the Purchase API"],
        ],
        col_widths=[2.0, 1.0, 3.9],
    )
    doc.p("Approved PayWay payments are written to nexus_payway_transactions and create a "
          "Repayment entry in nexus_transactions, plus an in-app and Telegram notification.")
    doc.p("Purchase requests are signed with HMAC-SHA512 over a fixed 24-field hash order "
          "(req_time, merchant_id, tran_id, amount, items, shipping, firstname, lastname, email, "
          "phone, type, payment_option, return_url, cancel_url, continue_success_url, return_deeplink, "
          "currency, custom_fields, return_params, payout, lifetime, additional_params, google_pay_token, "
          "skip_success_page). view_type and payment_gate are sent unsigned. Webhook callbacks are "
          "verified with the same hash order via the x-payway-hmac-sha512 header.")

    doc.h1("8. Database Schema Detail")
    doc.h2("nexus_users")
    doc.table(
        ["Column", "Type", "Description"],
        [
            ["id", "SERIAL PK", "Auto-increment ID"],
            ["name", "TEXT", "User's full name"],
            ["email", "TEXT UNIQUE", "Email address"],
            ["password", "TEXT", "Bcrypt password hash"],
            ["role", "TEXT", "customer / loan-officer / super-admin"],
            ["phone", "TEXT", "Phone number"],
            ["telegram_chat_id", "BIGINT", "Telegram chat ID (if linked)"],
            ["email_verified", "BOOLEAN", "Whether the email has been verified (blocks login when false)"],
            ["otp_code", "TEXT", "Bcrypt hash of OTP"],
            ["otp_expires_at", "TIMESTAMPTZ", "OTP expiry time"],
            ["otp_verified_at", "TIMESTAMPTZ", "When OTP was verified"],
            ["created_at", "TIMESTAMPTZ", "Account creation time"],
        ],
        col_widths=[1.8, 1.4, 3.2],
    )

    doc.h2("nexus_loans")
    doc.table(
        ["Column", "Type", "Description"],
        [
            ["id", "SERIAL PK", "Auto-increment ID"],
            ["user_id", "INTEGER", "Applicant user ID"],
            ["name", "TEXT", "Applicant name (denormalized)"],
            ["email", "TEXT", "Applicant email (denormalized)"],
            ["amount", "NUMERIC", "Loan amount"],
            ["type", "TEXT", "Loan type (SME, Personal, etc.)"],
            ["status", "TEXT", "pending / approved / rejected / hold"],
            ["purpose", "TEXT", "Loan purpose"],
            ["duration_months", "INTEGER", "Repayment duration"],
            ["interest_rate", "NUMERIC", "Annual interest rate"],
            ["monthly_income", "NUMERIC", "Applicant monthly income"],
            ["assigned_to", "INTEGER", "Assigned officer user ID"],
            ["created_at", "TIMESTAMPTZ", "Application date"],
        ],
        col_widths=[1.8, 1.4, 3.2],
    )

    doc.h2("nexus_payway_transactions")
    doc.table(
        ["Column", "Type", "Description"],
        [
            ["id", "BIGSERIAL PK", "Auto-increment ID"],
            ["tran_id", "TEXT UNIQUE", "PayWay transaction ID"],
            ["email", "TEXT", "Customer email (normalized)"],
            ["amount", "NUMERIC", "Payment amount"],
            ["currency", "TEXT", "Currency (default USD)"],
            ["status", "TEXT", "PENDING / APPROVED / DECLINED"],
            ["apv", "TEXT", "PayWay approval code"],
            ["loan_id", "TEXT", "Linked loan ID (optional)"],
            ["user_id", "INT", "NexusFinance user ID"],
            ["created_at", "TIMESTAMPTZ", "Creation time"],
            ["paid_at", "TIMESTAMPTZ", "When the payment was approved"],
        ],
        col_widths=[1.8, 1.4, 3.2],
    )


# ═══════════════════════════════════════════════════════════════
#  KHMER CONTENT
# ═══════════════════════════════════════════════════════════════
def doc001_kh(doc):
    doc.cover(version="1.0", date="សីហា 2026", author="NDX Digital Support",
              tags=["ការគ្រប់គ្រងប្រាក់កម្ចី", "ការទូទាត់ KHQR", "ប៉ុត Telegram", "កម្មវិធី Android"])
    doc.toc([
        ("1", "សេចក្តីសង្ខេប"),
        ("2", "អ្វីដែលយើងបានផ្តល់ឱ្យ"),
        ("3", "គណនីគំរូ"),
        ("4", "ប្រព័ន្ធបច្ចេកវិទ្យា"),
        ("5", "សន្តិសុខនិងការអនុវត្ត"),
        ("6", "ផែនការអភិវឌ្ឍន៍"),
    ])
    doc.h1("១. សេចក្តីសង្ខេប")
    doc.p("NexusFinance ជាប្រព័ន្ធគ្រប់គ្រងប្រាក់កម្ចីឌីជីថលពេញលេញដែលបង្កើតសម្រាប់ប្រតិបត្តិការហិរញ្ញវត្ថុ "
          "តូចៗនៅកម្ពុជា។ ប្រព័ន្ធនេះគ្របដណ្តប់លើវដ្តនៃការផ្តល់ប្រាក់កម្ចីពេញលេញ — ពីការដាក់ស្នើសុំកម្ចីរបស់អតិថិជន "
          "រហូតដល់ការពិនិត្យនិងផ្ទៀងផ្ទាត់ រួមទាំងការប្រមូលប្រាក់សងត្រឡប់តាមរយៈការទូទាត់ KHQR។")
    doc.callout("ហេតុអ្វីនេះសំខាន់",
                "NexusFinance ជំនួសដល់លំហូរការងារផ្តល់ប្រាក់កម្ចីដែលផ្អែកលើក្រដាសដោយប្រព័ន្ធឌីជីថលដែលមានសុវត្ថិភាព "
                "និងអាចត្រួតពិនិត្យបាន។", kind="tip")

    doc.h1("២. អ្វីដែលយើងបានផ្តល់ឱ្យ")
    doc.table(
        ["សមត្ថភាព", "ការពិពណ៌នា"],
        [
            ["គេហទំព័រ", "React SPA ជាមួយប្រូតូល ៣ — អតិថិជន បុគ្គលិកកម្ចី អ្នកគ្រប់គ្រង"],
            ["Backend API", "Node.js/Express REST API ជាមួយ JWT auth និង audit log"],
            ["ការផ្ទៀងផ្ទាត់", "អ៊ីមែល + ពាក្យសម្ងាត់ជាមួយ Brevo OTP — ការចូលត្រូវបានរារាំងរហូតដល់អ៊ីមែលត្រូវបានផ្ទៀងផ្ទាត់"],
            ["ការទូទាត់", "KHQR (Bakong) និង ABA PayWay hosted checkout"],
            ["ប៉ុត Telegram", "ការជូនដំណឹងការទូទាត់ ការរំលឹក បញ្ជារបស់អ្នកគ្រប់គ្រង"],
            ["កម្មវិធី Android", "Expo WebView shell — APK ដែលអាចដំឡើងបាន"],
            ["ការដាក់ស្នើ", "Vercel (frontend) + Render (backend) + Supabase (database)"],
        ],
        col_widths=[1.6, 4.8],
    )

    doc.h1("៣. គណនីគំរូ")
    doc.table(
        ["តួនាទី", "អ៊ីមែល", "ពាក្យសម្ងាត់"],
        [
            ["អតិថិជន", "customer@nexus.com", "password123"],
            ["បុគ្គលិកកម្ចី", "officer@nexus.com", "password123"],
            ["អ្នកគ្រប់គ្រង", "admin@nexus.com", "password123"],
        ],
        col_widths=[1.6, 2.6, 2.2],
    )

    doc.h1("៤. ប្រព័ន្ធបច្ចេកវិទ្យា")
    doc.table(
        ["ស្រទាប់", "បច្ចេកវិទ្យា"],
        [
            ["Frontend", "React 18, TypeScript, Vite, Tailwind CSS"],
            ["Backend", "Node.js, Express, TypeScript (tsx)"],
            ["Database", "Supabase (PostgreSQL)"],
            ["ការផ្ទៀងផ្ទាត់", "JWT + bcrypt + Brevo OTP email"],
            ["ការដាក់ស្នើ", "Vercel (frontend) + Render (backend)"],
            ["ការទូទាត់", "KHQR / EMVCo QR, ABA PayWay (sandbox)"],
            ["ការជូនដំណឹង", "Telegram Bot API, Brevo transactional email"],
            ["ទូរស័ព្ទ", "Expo SDK 57, React Native WebView"],
        ],
        col_widths=[1.8, 4.6],
    )

    doc.h1("៥. សន្តិសុខនិងការអនុវត្ត")
    doc.bullet("JWT sessions ជាមួយការអនុវត្តតួនាទីខាងសែវិ")
    doc.bullet("Bcrypt password hashing — គ្មានពាក្យសម្ងាត់រក្សាទុកជាអត្ថបទ")
    doc.bullet("ការផ្ទៀងផ្ទាត់ OTP តម្រូវឲ្យមានមុនពេលចូលលើកដំបូង (គណនីថ្មីត្រូវបានចាក់សោរហូតដល់ផ្ទៀងផ្ទាត់)")
    doc.bullet("Audit log ពេញលេញជាមួយពេលវេលា")
    doc.bullet("Rate limiting នៅលើ endpoint ផ្ទៀងផ្ទាត់")
    doc.bullet("Environment variables រក្សាទុក keys ទាំងអស់ក្រៅ codebase")

    doc.h1("៦. ផែនការអភិវឌ្ឍន៍")
    doc.check_item("ដាក់ស្នើ ABA PayWay production checkout")
    doc.check_item("បន្ថែមការរួមបញ្ចូលធនាគារ ACLEDA")
    doc.check_item("ភ្ជាប់ Vercel auto-deploys (ភ្ជាប់រួចហើយ)")
    doc.check_item("បន្ថែម Google OAuth sign-in (ពន្យឺត)")
    doc.check_item("ចេញផ្សាយកម្មវិធីទូរស័ព្ទទៅ app stores")

def doc002_kh(doc):
    doc.cover(version="1.0", date="សីហា 206", author="NDX Digital Support",
              tags=["របាយការណ៍ពេញលេញ", "លក្ខណៈពិសេស", "ស្ថាបត្យកម្ម"])
    doc.toc([
        ("1", "ទិដ្ឋភាពទូទៅ"),
        ("2", "លក្ខណៈពិសេសនៃប្រូតូល"),
        ("3", "ការផ្ទៀងផ្ទាត់និងការគ្រប់គ្រងអ្នកប្រើប្រាស់"),
        ("4", "ការរួមបញ្ចូលការទូទាត់"),
        ("5", "លក្ខណៈពិសេសប៉ុត Telegram"),
        ("6", "កម្មវិធីទូរស័ព្ទ"),
        ("7", "ការដាក់ស្នើនិងហេដ្ឋារចនាសម្ព័ន្ធ"),
    ])
    doc.h1("១. ទិដ្ឋភាពទូទៅ")
    doc.p("NexusFinance ជាប្រព័ន្ធហិរញ្ញវត្ថីសម្រាប់ប្រតិបត្តិការហិរញ្ញវត្ថុតូចៗនៅកម្ពុជា។ "
          "ប្រព័ន្ធបម្រើអ្នកប្រើប្រាស់ ៣ តួនាទី — អតិថិជន បុគ្គលិកកម្ចី និងអ្នកគ្រប់គ្រង។")

    doc.h1("២. លក្ខណៈពិសេសនៃប្រូតូល")
    doc.h2("២.១ ប្រូតូលអតិថិជន")
    doc.bullet("សំណុំបែបបទសុំកម្ចីជាមួយជំហានជាក់លាក់")
    doc.bullet("តាមដានសមតុល្យជំពាក់និងគ្រប់គ្រងកាបូប")
    doc.bullet("ការរួមបញ្ចូលការទូទាត់ KHQR")
    doc.bullet("ប្រវត្តិនៃប្រតិបត្តិការនិងកាលវិភាគសង")
    doc.h2("២.២ ប្រូតូលបុគ្គលិកកម្ចី")
    doc.bullet("ទិដ្ឋភាពការពិនិត្យសំណុំបែបបទជាមួយតម្រង់ទិស")
    doc.bullet("ការវិភាគពិន្ទុឥណទាននិងសមាមាត្រ DTI")
    doc.bullet("លំហូរការអនុម័ត/បដិសេធ/ក្សឹត")
    doc.h2("២.៣ ប្រូតូលអ្នកគ្រប់គ្រង")
    doc.bullet("ទិដ្ឋភាពវិភាគទូទាំងប្រព័ន្ធ")
    doc.bullet("ការគ្រប់គ្រងអ្នកប្រើប្រាស់")
    doc.bullet("Audit log ពេញលេញ")

    doc.h1("៣. ការផ្ទៀងផ្ទាត់និងការគ្រប់គ្រងអ្នកប្រើប្រាស់")
    doc.table(
        ["លក្ខណៈពិសេស", "ការអនុវត្ត"],
        [
            ["ការចុះឈ្មោះ", "អ៊ីមែល + ពាក្យសម្ងាត់ → Brevo OTP"],
            ["ការចូល", "អ៊ីមែល + ពាក្យសម្ងាត់ជាមួយ bcrypt — រារាំងរហូតដល់អ៊ីមែលត្រូវបានផ្ទៀងផ្ទាត់"],
            ["ការផ្ទៀងផ្ទាត់អ៊ីមែល", "គណនីថ្មីមិនអាចចូលបានទេរហូតដល់ OTP តាមអ៊ីមែលត្រូវបានផ្ទៀងផ្ទាត់"],
            ["ការសង្គ្រោះពាក្យសម្ងាត់", "Brevo OTP → ផ្ទៀងផ្ទាត់ → ពាក្យសម្ងាត់ថ្មី"],
            ["ការគ្រប់គ្រងតួនាទី", "customer / loan-officer / super-admin"],
        ],
        col_widths=[2.0, 4.4],
    )

    doc.h1("៤. ការរួមបញ្ចូលការទូទាត់")
    doc.h2("៤.១ KHQR (Bakong)")
    doc.p("KHQR ជាស្តង់ដារទូទាត់ QR ជាតិរបស់កម្ពុជា។ NexusFinance បង្កើតកូដ KHQR "
          "សម្រាប់ការសងប្រាក់កម្ចី។")
    doc.h2("៤.២ ABA PayWay")
    doc.p("ABA PayWay Purchase API ផ្តល់ការទូទាត់តាមទំព័រកម្មវិធី (hosted checkout) "
          "សម្រាប់ការសងប្រាក់កម្ចី។ អតិថិជនជ្រើសរើសចំនួនទឹកប្រាក់ រួចត្រូវបានដឹកជញ្ជូន "
          "ទៅកាន់ទំព័រទូទាត់ដែលមានសុវត្ថិភាពរបស់ ABA (view_type: hosted_view) "
          "ដែលអាចទូទាត់តាម KHQR, ABA PAY ឬប័ណ្ណ។")
    doc.bullet("Sandbox mode សកម្មបច្ចុប្បន្ន (checkout-sandbox.payway.com.kh)")
    doc.bullet("Hosted checkout ជាមួយ view_type=hosted_view និង payment_gate=0")
    doc.bullet("HMAC-SHA512 signature លើរាល់សំណើ purchase (24-field fixed hash order)")
    doc.bullet("Return / cancel redirects ទៅកាន់ /payment/success និង /payment/cancel")
    doc.bullet("Webhook callback + GET return handler ផ្ទៀងផ្ទាត់ និងរក្សាទុកការទូទាត់")
    doc.bullet("ការទូទាត់ដែលបានអនុម័តត្រូវបានរក្សាទុកក្នុងបញ្ជី ledger និងផ្ញើការជូនដំណឹង Telegram")

    doc.h1("៥. លក្ខណៈពិសេសប៉ុត Telegram")
    doc.table(
        ["បញ្ជា", "ការពិពណ៌នា"],
        [
            ["/start", "សារស្វាគមន៍"],
            ["/link", "ភ្ជាប់គណនី Telegram — ផ្ញើកូដទៅអ៊ីមែល"],
            ["/confirm <code>", "បញ្ចប់ការភ្ជាប់ជាមួយកូដដែលបានផ្ញើ"],
            ["/unlink", "ផ្តាច់គណនី Telegram"],
            ["/status", "មើលស្ថានភាពគណនី"],
            ["/stats", "ស្ថិតិប្រព័ន្ធ"],
            ["/loans", "សំណុំបែបបទកម្ចីថ្មីៗ"],
            ["/users", "អ្នកប្រើប្រាស់ដែលបានចុះឈ្មោះ"],
            ["/broadcast <សារ>", "ផ្ញើសារទៅអ្នកប្រើប្រាស់ទាំងអស់"],
            ["/help", "បង្ហាញបញ្ជាដែលមាន"],
        ],
        col_widths=[2.2, 4.2],
    )

    doc.h1("៦. កម្មវិធីទូរស័ព្ទ")
    doc.p("កម្មវិធី Android ជា Expo WebView shell ដែលផ្ទុកគេហទំព័រ។")

    doc.h1("៧. ការដាក់ស្នើនិងហេដ្ឋារចនាសម្ព័ន្ធ")
    doc.table(
        ["សមាសភាគ", "សេវាកម្ម", "ព័ត៌មានលម្អិត"],
        [
            ["Frontend", "Vercel", "React SPA"],
            ["Backend", "Render", "Node.js/Express"],
            ["Database", "Supabase", "PostgreSQL"],
            ["អ៊ីមែល", "Brevo", "OTP emails"],
            ["Bot", "Telegram API", "long polling"],
        ],
        col_widths=[1.4, 1.6, 3.4],
    )

def doc003_kh(doc):
    doc.cover(version="1.0", date="សីហា 2026", author="NDX Digital Support",
              tags=["សន្តិសុខ", "Auth", "OTP", "ការពារទិន្នន័យ", "Audit"])
    doc.toc([
        ("1", "ស្ថាបត្យកម្មការផ្ទៀងផ្ទាត់"),
        ("2", "សន្តិសុខពាក្យសម្ងាត់"),
        ("3", "ប្រព័ន្ធផ្ទៀងផ្ទាត់ OTP"),
        ("4", "ការគ្រប់គ្រងសម័យនិង Token"),
        ("5", "ការគ្រប់គ្រងតួនាទី"),
        ("6", "Audit Logging"),
        ("7", "សន្តិសុខ API"),
        ("8", "ការពារទិន្នន័យ"),
        ("9", "សន្តិសុខការទូទាត់"),
    ])
    doc.h1("១. ស្ថាបត្យកម្មការផ្ទៀងផ្ទាត់")
    doc.p("NexusFinance ប្រើប្រព័ន្ធផ្ទៀងផ្ទាត់ពហុស្រទាប់ដែលរួមបញ្ចូល "
          "អ៊ីមែល/ពាក្យសម្ងាត់ជាមួយ OTP។ លំហូរទាំងអស់ដំណើរការដោយ Express backend។")

    doc.h1("២. សន្តិសុខពាក្យសម្ងាត់")
    doc.bullet("ពាក្យសម្ងាត់ hash ដោយ bcrypt ជាមួយ salt rounds = 10")
    doc.bullet("ពាក្យសម្ងាត់អត្ថបទមិនរក្សាទុក")
    doc.bullet("ការប្រៀបធៀបប្រើ bcrypt.compare()")
    doc.bullet("រយៈពេលអប្បបរមា: ៦ តួអក្សរ")

    doc.h1("៣. ប្រព័ន្ធផ្ទៀងផ្ទាត់ OTP")
    doc.table(
        ["លក្ខណៈ", "តម្លៃ"],
        [
            ["ប្រវែងកូដ", "៦ ខ្ទង់"],
            ["វិធីសាស្ត្រ Hash", "bcrypt (10 rounds)"],
            ["ការផុតកំណត់", "១០ នាទី"],
            ["ការផ្ទៀងផ្ទាត់", "Brevo transactional email"],
        ],
        col_widths=[2.0, 4.4],
    )

    doc.h1("៤. ការគ្រប់គ្រងសម័យនិង Token")
    doc.bullet("JWT tokens ចេញនៅពេលចូលជោគជ័យ")
    doc.bullet("មាតិកា token: id, email, name, role")
    doc.bullet("Tokens រក្សាទុកក្នុង browser localStorage")

    doc.h1("៥. ការគ្រប់គ្រងតួនាទី")
    doc.table(
        ["តួនាទី", "សិទ្ធិ"],
        [
            ["customer", "សុំកម្ចី មើលប្រតិបត្តិការ គ្រប់គ្រងប្រ៉ូហ្វាល"],
            ["loan-officer", "ពិនិត្យសំណុំបែបបទ អនុម័ត/បដិសេធ មើល stats និង tasks"],
            ["super-admin", "សិទ្ធិពេញលេញ: វិភាគ គ្រប់គ្រងអ្នកប្រើប្រាស់ config audit log"],
        ],
        col_widths=[1.6, 4.8],
    )
    doc.p("រាល់ API endpoints អនុវត្តការត្រួតពិនិត្យតួនាទីខាងសែវិរ។ ការអនុម័ត/បដិសេធ/ក្សឹត "
          "កម្ចី និង endpoint stats និង tasks តម្រូវឱ្យមានតួនាទី loan-officer ឬ super-admin។")

    doc.h1("៦. Audit Logging")
    doc.bullet("រាល់សកម្មភាពសំខាន់ទាំងអស់ត្រូវបានកត់ត្រា")
    doc.bullet("Audit logs append-only និងមើលឃើញដោយអ្នកគ្រប់គ្រង")

    doc.h1("៧. សន្តិសុខ API")
    doc.bullet("Rate limiting នៅលើ endpoint ផ្ទៀងផ្ទាត់")
    doc.bullet("CORS កំណត់ត្រឹមត្រូវ")
    doc.bullet("HTTPS តម្រូវសម្រាប់ endpoint ទាំងអស់")

    doc.h1("៨. ការពារទិន្នន័យ")
    doc.bullet("ទិន្នន័យអ្នកប្រើប្រាស់រក្សាទុកក្នុង Supabase")
    doc.bullet("Service role key សម្រាប់ server-side operations")
    doc.bullet("គ្មានព័ត៌មានផ្ទាល់ខ្លួនក្នុង logs")

    doc.h1("៩. សន្តិសុខការទូទាត់")
    doc.bullet("កូដ KHQR បង្កើតខាងសែវិ")
    doc.bullet("ការផ្ទៀងផ្ទាត់តម្រូវឱ្យមាន API call")
    doc.bullet("សំណើ ABA PayWay purchase ចុះហត្ថលេខាជាមួយ HMAC-SHA512 (24-field fixed hash order)")
    doc.bullet("Webhook callback ផ្ទៀងផ្ទាត់ជាមួយ HMAC signature ដូចគ្នាមុនដំណើរការ")
    doc.bullet("Hosted checkout រក្សាទិន្នន័យប័ណ្ណលើទំព័រ PCI-compliant របស់ ABA — មិនមែនលើ server របស់យើង")
    doc.bullet(" Sandbox mode សកម្ម")

def doc004_kh(doc):
    doc.cover(version="1.0", date="សីហា 2026", author="NDX Digital Support",
              tags=["មគ្គុទេសក៍អ្នកគ្រប់គ្រង", "បុគ្គលិកកម្ចី", "ប្រតិបត្តិការ"])
    doc.toc([
        ("1", "ការចូល"),
        ("2", "ទិដ្ឋភាពអ្នកគ្រប់គ្រង"),
        ("3", "ការគ្រប់គ្រងអ្នកប្រើប្រាស់"),
        ("4", "លំហូរពិនិត្យកម្ចី"),
        ("5", "ការកំណត់ប្រព័ន្ធ"),
        ("6", "Audit Logs"),
        ("7", "បញ្ជា Telegram Bot"),
    ])
    doc.h1("១. ការចូល")
    doc.p("ចូលទៅ https://nexusfinancefintech.vercel.app និងបញ្ចូលអ៊ីមែលនិងពាក្យសម្ងាត់។")
    doc.table(
        ["អ៊ីមែល", "ពាក្យសម្ងាត់", "តួនាទី"],
        [
            ["admin@nexus.com", "password123", "អ្នកគ្រប់គ្រង"],
            ["officer@nexus.com", "password123", "បុគ្គលិកកម្ចី"],
        ],
        col_widths=[2.4, 2.0, 2.0],
    )

    doc.h1("២. ទិដ្ឋភាពអ្នកគ្រប់គ្រង")
    doc.bullet("សមតុល្យជំពាក់និងទំហំសរុប")
    doc.bullet("អតិថិជនសកម្មនិងចំនួនកម្ចី")
    doc.bullet("ប្រវត្តិប្រតិបត្តិការថ្មីៗ")

    doc.h1("៣. ការគ្រប់គ្រងអ្នកប្រើប្រាស់")
    doc.bullet("មើលអ្នកប្រើប្រាស់ទាំងអស់")
    doc.bullet("ផ្លាស់ប្តូរតួនាទី")
    doc.bullet("សង្គ្រោះពាក្យសម្ងាត់")

    doc.h1("៤. លំហូរពិនិត្យកម្ចី")
    doc.bullet("មើលសំណុំបែបទាំងអស់ក្នុង Loans Ledger")
    doc.bullet("ចុចលើកម្ចីដើម្បីពិនិត្យមើលព័ត៌មានលម្អិត")
    doc.bullet("អនុម័ត បដិសេធ ឬក្សឹត")

    doc.h1("៥. ការកំណត់ប្រព័ន្ធ")
    doc.bullet("អត្រាការប្រាក់")
    doc.bullet("ដែនកំណត់កម្ចី")
    doc.bullet("ឈ្មោះប្រព័ន្ធ")

    doc.h1("៦. Audit Logs")
    doc.p("មើល History Logs ដើម្បីមើល audit trail ពេញលេញ។")

    doc.h1("៧. បញ្ជា Telegram Bot")
    doc.table(
        ["បញ្ជា", "ការពិពណ៌នា"],
        [
            ["/stats", "ស្ថិតិប្រព័ន្ធ"],
            ["/loans", "កម្ចីថ្មីៗ"],
            ["/users", "អ្នកប្រើប្រាស់"],
            ["/broadcast <សារ>", "ផ្ញើសារទៅទាំងអស់"],
            ["/reminder-check", "រំលឹកការទូទាត់"],
        ],
        col_widths=[2.2, 4.2],
    )
    doc.callout("Tip",
                "ភ្ជាប់គណនី Telegram ជាមុនជាមួយ /link បន្ទាប់មកបញ្ជាក់ជាមួយ /confirm <code> ដើម្បីទទួលបានការជូនដំណឹង។",
                kind="tip")

def doc005_kh(doc):
    doc.cover(version="1.0", date="សីហា 2026", author="NDX Digital Support",
              tags=["មគ្គុទេសក៍អតិថិជន", "ការចុះឈ្មោះ", "កម្ចី", "ការទូទាត់"])
    doc.toc([
        ("1", "ចាប់ផ្តើម"),
        ("2", "បង្កើតគណនី"),
        ("3", "សុំកម្ចី"),
        ("4", "ធ្វើការទូទាត់"),
        ("5", "គ្រប់គ្រងប្រ៉ូហ្វាល"),
        ("6", "សំណួរដែលសួរញឹកញាប់"),
    ])
    doc.h1("១. ចាប់ផ្តើម")
    doc.p("NexusFinance ជាវេទិញហិរញ្ញវត្ថីឌីជីថលរបស់អ្នក។ អ្នកអាចចូលមើលពី browser ណាមួយ។")

    doc.h1("២. បង្កើតគណនី")
    doc.h2("២.១ ការចុះឈ្មោះ")
    doc.numbered("ចូលទៅ https://nexusfinancefintech.vercel.app")
    doc.numbered("ចុច 'Register'")
    doc.numbered("បញ្ចូលឈ្មោះ អ៊ីមែល និងពាក្យសម្ងាត់")
    doc.numbered("ចុច 'Register'")
    doc.numbered("ពិនិត្យអ៊ីមែលសម្រាប់កូដ ៦ ខ្ទង់")
    doc.numbered("បញ្ចូលកូដ")
    doc.numbered("គណនីសកម្ម — អាចចូលបាន")

    doc.h2("២.២ ការចូល")
    doc.numbered("បញ្ចូលអ៊ីមែលនិងពាក្យសម្ងាត់")
    doc.numbered("ចុច 'Login'")
    doc.numbered("ត្រូវបានបញ្ជូនទៅ dashboard")

    doc.callout("ភ្លេចពាក្យសម្ងាត់?",
                "ចុច 'Forgot Password' នៅលើទំព័រ login។ បញ្ចូលអ៊ីមែល ទទួលកូដ OTP ផ្ទៀងផ្ទាត់ រួចកំណត់ពាក្យសម្ងាត់ថ្មី។", kind="info")
    doc.callout("អ៊ីមែលមិនទាន់ផ្ទៀងផ្ទាត់?",
                "គណនីថ្មីត្រូវតែផ្ទៀងផ្ទាត់អ៊ីមែលមុនពេលចូលលើកដំបូង។ បញ្ចូលកូដ ៦ ខ្ទង់ដែលបានផ្ញើទៅអ៊ីមែល រួចចូលម្តងទៀត។", kind="info")

    doc.h1("៣. សុំកម្ចី")
    doc.p("ចុច 'Apply for Loan' ពី sidebar។")
    doc.bullet("ព័ត៌មានផ្ទាល់ខ្លួន")
    doc.bullet("ប្រភេទកម្ចី")
    doc.bullet("ចំនួនទឹកប្រាក់និងរយៈពេល")
    doc.bullet("មូលហេតុសុំកម្ចី")

    doc.h1("៤. ធ្វើការទូទាត់")
    doc.h2("៤.១ សងប្រាក់កម្ចី (ABA PayWay Hosted Checkout)")
    doc.p("ចូលទៅ 'Loan Repayment' ក្នុង sidebar។ ទំព័របង្ហាញការដំឡើងថ្មី និងសមតុល្យ "
          "ដែលត្រូវសង នៃកម្ចីសកម្មរបស់អ្នក។")
    doc.numbered("ជ្រើសរើសចំនួនទឹកប្រាក់៖ ដំឡើងបន្ទាប់ សមតុល្យពេញ ឬចំនួនផ្ទាល់ខ្លួន")
    doc.numbered("ចុច 'Pay Now' — ទំព័រទូទាត់សុវត្ថិភាព ABA PayWay បើកក្នុង tab ថ្មី")
    doc.numbered("បញ្ចប់ការទូទាត់ជាមួយ KHQR, ABA PAY, ប័ណ្ណ ឬវិធីសាស្ត្រផ្សេងទៀត")
    doc.numbered("បន្ទាប់ពីទូទាត់ អ្នកត្រូវបានត្រឡប់ទៅទំព័រជោគជ័យ ហើយ dashboard អាប់ដេតដោយស្វ័យប្រវត្តិ")
    doc.p("អ្នកក៏អាចស្កេនកូដ KHQR នៅលើទំព័រ checkout ជាមួយ banking app ដែលត្រូវគ្នា។")

    doc.h1("៥. គ្រប់គ្រងប្រ៉ូហ្វាល")
    doc.p("ចូលទៅ 'Profile' ដើម្បីអាប់ដេតព័ត៌មាន៖")
    doc.bullet("ឈ្មោះ អ៊ីមែល និងទូរស័ព្ទ")
    doc.bullet("ផ្លាស់ប្តូរពាក្យសម្ងាត់")

    doc.h1("៦. សំណួរដែលសួរញឹកញាប់")
    doc.table(
        ["សំណួរ", "ចម្លើយ"],
        [
            ["តើការអនុម័តកម្ចីចំណាយពេលប៉ុន្មាន?", "ជាធម្មតា ១-៣ ថ្ងៃធ្វើការ។"],
            ["តើទទួលយកវិធីទូទាត់អ្វីខ្លះ?", "KHQR (Bakong) និង ABA PayWay hosted checkout (KHQR, ABA PAY, ប័ណ្ណ)។"],
            ["តើខ្ញុំអាចភ្ជាប់ Telegram បានទេ?", "ផ្ញើ /link ទៅប៉ុត បន្ទាប់មកបញ្ជាក់ជាមួយកូដដែលបានផ្ញើទៅអ៊ីមែល (/confirm <code>)។"],
        ],
        col_widths=[2.4, 4.0],
    )

def doc006_kh(doc):
    doc.cover(version="1.0", date="សីហា 2026", author="NDX Digital Support",
              tags=["Telegram", "Bot", "ការជូនដំណឹង", "បញ្ជាអ្នកគ្រប់គ្រង"])
    doc.toc([
        ("1", "ទិដ្ឋភាពទូទៅ"),
        ("2", "ចាប់ផ្តើម"),
        ("3", "បញ្ជាអ្នកប្រើប្រាស់"),
        ("4", "បញ្ជាអ្នកគ្រប់គ្រង"),
        ("5", "ការភ្ជាប់គណនី"),
        ("6", "ការជូនដំណឹងនិងការរំលឹក"),
        ("7", "ការដោះស្រាយបញ្ហា"),
    ])
    doc.h1("១. ទិដ្ឋភាពទូទៅ")
    doc.p("ប៉ុត Telegram (@nexusfinancefintech_bot) ផ្តល់ការជូនដំណឹង real-time "
          "ការរំលឹកការទូទាត់ និងឧបករណ៍សម្រាប់អ្នកគ្រប់គ្រង។")

    doc.h1("២. ចាប់ផ្តើម")
    doc.numbered("បើក Telegram និងស្វែងរក @nexusfinancefintech_bot")
    doc.numbered("ចុច 'Start' ឬផ្ញើ /start")
    doc.numbered("ប៉ុតបង្ហាញបញ្ជាដែលមាន")
    doc.numbered("ប្រើ /link ដើម្បីភ្ជាប់គណនី")

    doc.h1("៣. បញ្ជាអ្នកប្រើប្រាស់")
    doc.table(
        ["បញ្ជា", "ការពិពណ៌នា"],
        [
            ["/start", "សារស្វាគមន៍"],
            ["/help", "បង្ហាញបញ្ជាទាំងអស់"],
            ["/link", "ភ្ជាប់គណនី — ផ្ញើកូដទៅអ៊ីមែល"],
            ["/confirm <code>", "បញ្ចប់ការភ្ជាប់ជាមួយកូដដែលបានផ្ញើ"],
            ["/unlink", "ផ្តាច់គណនី"],
            ["/status", "មើលស្ថានភាពគណនី និងកម្ចី"],
        ],
        col_widths=[1.8, 4.6],
    )

    doc.h1("៤. បញ្ជាអ្នកគ្រប់គ្រង")
    doc.table(
        ["បញ្ជា", "ការពិពណ៌នា"],
        [
            ["/stats", "ស្ថិតិប្រព័ន្ធ"],
            ["/loans", "កម្ចីថ្មីៗ"],
            ["/users", "អ្នកប្រើប្រាស់"],
            ["/broadcast <សារ>", "ផ្ញើសារទៅទាំងអស់"],
            ["/reminder-check", "រំលឹកការទូទាត់"],
        ],
        col_widths=[2.2, 4.2],
    )
    doc.callout("Tip",
                "ភ្ជាប់គណនី Telegram ជាមុនជាមួយ /link បន្ទាប់មកបញ្ជាក់ជាមួយ /confirm <code> ដើម្បីទទួលបានការជូនដំណឹង។",
                kind="tip")

    doc.h1("៥. ការភ្ជាប់គណនី")
    doc.numbered("ផ្ញើ /link <អ៊ីមែល> ទៅប៉ុត")
    doc.numbered("កូដ ៦ ខ្ទង់ត្រូវបានផ្ញើទៅអ៊ីមែលរបស់អ្នក")
    doc.numbered("ផ្ញើ /confirm <code> ដើម្បីបញ្ចប់ការភ្ជាប់")
    doc.numbered("កូដផុតកំណត់ក្រោយ ១០ នាទី — ផ្ញើ /link ម្តងទៀតសម្រាប់កូដថ្មី")
    doc.p("ផ្ញើ /unlink ដើម្បីផ្តាច់គណនី Telegram ពី NexusFinance។")
    doc.p("ផ្ញើ /status ដើម្បីមើលអ៊ីមែលដែលបានភ្ជាប់ និងស្ថានភាពកម្ចី រួមទាំងបង់រំលោះប្រចាំខែ និងកាលបរិច្ឆេទកំណត់។")

    doc.h1("៦. ការជូនដំណឹងនិងការរំលឹក")
    doc.bullet("ការផ្ទៀងផ្ទាត់ការទូទាត់")
    doc.bullet("ការរំលឹកប្រចាំថ្ងៃនៅម៉ោង ៩ ព្រឹក")
    doc.bullet("ការរំលឹកផ្អែកលើបង់រំលោះប្រចាំខែ (5.4% APR) មិនមែនចំនួនកម្ចីសរុបទេ")

    doc.h1("៧. ការដោះស្រាយបញ្ហា")
    doc.table(
        ["បញ្ហា", "ដំណោះស្រាយ"],
        [
            ["Bot មិនឆ្លើយតប", "ផ្ញើ /start"],
            ["Error 409", "មាន bot instance ច្រើន — ពិនិត្យ logs"],
            ["មិនទទួលការជូនដំណឹង", "ប្រើ /link ដើម្បីភ្ជាប់គណនី"],
        ],
        col_widths=[2.4, 4.0],
    )

def doc007_kh(doc):
    doc.cover(version="1.0", date="សីហា 2026", author="NDX Digital Support",
              tags=["ស្ថាបត្យកម្ម", "បច្ចេកវិទ្យា", "ការដាក់ស្នើ", "DevOps"])
    doc.toc([
        ("1", "ស្ថាបត្យកម្មប្រព័ន្ធ"),
        ("2", "ប្រព័ន្ធបច្ចេកវិទ្យា"),
        ("3", "រចនាសម្ព័ន្ធគម្រោង"),
        ("4", "Schema មូលដ្ឋានទិន្នន័យ"),
        ("5", "ស្ថាបត្យកម្ម Frontend"),
        ("6", "ស្ថាបត្យកម្ម Backend"),
        ("7", "លំហូរការដាក់ស្នើ"),
        ("8", "Environment Variables"),
        ("9", "ការអភិវឌ្ឍន៍មូលដ្ឋាន"),
    ])
    doc.h1("១. ស្ថាបត្យកម្មប្រព័ន្ធ")
    doc.code(
        "Browser ──> Vercel (React SPA)\n"
        "                  │\n"
        "                  ▼\n"
        "            Render (Express API)\n"
        "                │         │\n"
        "                ▼         ▼\n"
        "         Supabase    Telegram Bot\n"
        "       (PostgreSQL)     (polling)\n"
        "                │\n"
        "           Brevo Email"
    )

    doc.h1("២. ប្រព័ន្ធបច្ចេកវិទ្យា")
    doc.table(
        ["ស្រទាប់", "បច្ចេកវិទ្យា", "គោលបំណង"],
        [
            ["Frontend", "React 18, TypeScript, Vite", "ចំណុចប្រទាក់អ្នកប្រើប្រាស់"],
            ["Backend", "Node.js, Express, TypeScript", "REST API server"],
            ["Database", "Supabase (PostgreSQL)", "ការរក្សាទិន្នន័យ"],
            ["Auth", "JWT + bcrypt + Brevo OTP", "ការផ្ទៀងផ្ទាត់"],
            ["Hosting", "Vercel + Render", "ការដាក់ស្នើ"],
        ],
        col_widths=[1.2, 2.6, 2.6],
    )

    doc.h1("៣. រចនាសម្ព័ន្ធគម្រោង")
    doc.code(
        "nexusfinance/\n"
        "├── src/                    # React frontend\n"
        "│   ├── components/         # UI components\n"
        "│   └── App.tsx             # Main app\n"
        "├── server/                 # Express backend\n"
        "│   ├── index.ts            # API routes\n"
        "│   ├── db.ts               # Supabase client\n"
        "│   ├── bot.ts              # Telegram bot\n"
        "│   ├── brevo.ts            # Brevo email\n"
        "│   └── otp.ts              # OTP module\n"
        "├── mobile/                 # Expo Android app\n"
        "└── supabase/migrations/    # DB migrations"
    )

    doc.h1("៤. Schema មូលដ្ឋានទិន្នន័យ")
    doc.table(
        ["តារាង", "ស្លាកស្នាម", "គោលបំណង"],
        [
            ["nexus_users", "id, name, email, password, role, telegram_chat_id, email_verified, otp_*", "គណនីអ្នកប្រើប្រាស់"],
            ["nexus_loans", "id, user_id, amount, type, status, duration_months", "សំណុំបែបបទកម្ចី"],
            ["nexus_transactions", "id, user_id, loan_id, amount, type, status", "ប្រតិបត្តិការ"],
            ["nexus_audit_logs", "id, action, description, user_id, created_at", "Audit trail"],
            ["nexus_tasks", "id, user_id, title, status, priority", "ការងារ KYC"],
            ["nexus_payway_transactions", "tran_id, email, amount, currency, status, apv, loan_id", "កំណត់ត្រាការទូទាត់ ABA PayWay (រក្សាទុកអចិន្ត្រៃយ៍)"],
        ],
        col_widths=[1.8, 2.8, 1.8],
    )

    doc.h1("៥. ស្ថាបត្យកម្ម Frontend")
    doc.bullet("SPA ជាមួយ React 18 និង TypeScript")
    doc.bullet("ប្រូតូល ៣ ៖ អតិថិជន បុគ្គលិកកម្ចី អ្នកគ្រប់គ្រង")
    doc.bullet("Design tokens ក្នុង CSS custom properties")

    doc.h1("៦. ស្ថាបត្យកម្ម Backend")
    doc.bullet("Express.js REST API ជាមួយ TypeScript")
    doc.bullet("JWT auth middleware")
    doc.bullet("Rate limiting")
    doc.bullet("Cron job សម្រាប់ការរំលឹក")
    doc.bullet("Telegram bot ចាប់ផ្តើមដោយស្វ័យប្រវត្តិ")

    doc.h1("៧. លំហូរការដាក់ស្នើ")
    doc.table(
        ["សមាសភាគ", "Trigger", "URL"],
        [
            ["Frontend", "Git push to main", "nexusfinancefintech.vercel.app"],
            ["Backend", "Git push to main", "nexusfinance-lof3.onrender.com"],
            ["Database", "Migration files", "supabase.co"],
        ],
        col_widths=[1.8, 2.0, 2.6],
    )

    doc.h1("៨. Environment Variables")
    doc.table(
        ["Variable", "គោលបំណង"],
        [
            ["SUPABASE_URL", "Supabase project URL"],
            ["BREVO_API_KEY", "Brevo email API key"],
            ["TELEGRAM_BOT_TOKEN", "Telegram bot token"],
            ["JWT_SECRET", "Token signing secret"],
        ],
        col_widths=[2.4, 4.0],
    )

    doc.h1("៩. ការអភិវឌ្ឍន៍មូលដ្ឋាន")
    doc.code(
        "git clone https://github.com/ndxdigitalsupport/nexusfinance.git\n"
        "cd nexusfinance\n"
        "npm install\n"
        "cp .env.example .env\n"
        "npm run dev"
    )

def doc008_kh(doc):
    doc.cover(version="1.0", date="សីហា 2026", author="NDX Digital Support",
              tags=["API Reference", "Endpoints", "Schema", "Developer Guide"])
    doc.toc([
        ("1", "ទិដ្ឋភាព API"),
        ("2", "Endpoint ការផ្ទៀងផ្ទាត់"),
        ("3", "Endpoint កម្ចី"),
        ("4", "Endpoint ប្រតិបត្តិការ"),
        ("5", "Endpoint អ្នកគ្រប់គ្រង"),
        ("6", "Endpoint KHQR"),
        ("7", "Endpoint PayWay"),
        ("8", "Schema មូលដ្ឋានទិន្នន័យ"),
    ])
    doc.h1("១. ទិដ្ឋភាព API")
    doc.p("Base URL: https://nexusfinance-lof3.onrender.com/api")
    doc.p("រាល់ endpoint ត្រឡប់ JSON។ Endpoint ការពារតម្រូវ Bearer token។")
    doc.table(
        ["Status Code", "អត្ថន័យ"],
        [
            ["200", "ជោគជ័យ"],
            ["400", "សំណើមត្រូវបានបដិសេធ"],
            ["401", "មិនអនុញ្ញាត"],
            ["403", "ហាមឃាត់"],
            ["404", "រកមិនឃើញ"],
            ["500", "កំហុស server"],
        ],
        col_widths=[1.4, 5.0],
    )

    doc.h1("២. Endpoint ការផ្ទៀងផ្ទាត់")
    doc.h2("POST /api/auth/register")
    doc.p("បង្កើតគណនីជាមួយ email_verified = false។ ផ្ទៀងផ្ទាត់អ៊ីមែលជាមួយ send-otp + verify-otp មុនពេលចូល។")
    doc.table(
        ["Field", "Type", "Required"],
        [
            ["name", "string", "Yes"],
            ["email", "string", "Yes"],
            ["password", "string", "Yes"],
            ["phone", "string", "No"],
        ],
        col_widths=[1.6, 1.4, 1.4],
    )

    doc.h2("POST /api/auth/login")
    doc.p("Response: 200 { token, user }។ ប្រសិនបើអ៊ីមែលមិនទាន់ផ្ទៀងផ្ទាត់: 403 { error, code: 'EMAIL_NOT_VERIFIED' }។")
    doc.table(
        ["Field", "Type", "Required"],
        [
            ["email", "string", "Yes"],
            ["password", "string", "Yes"],
        ],
        col_widths=[1.6, 1.4, 1.4],
    )

    doc.h2("POST /api/auth/send-otp")
    doc.table(
        ["Field", "Type", "Required"],
        [["email", "string", "Yes"]],
        col_widths=[1.6, 1.4, 1.4],
    )

    doc.h2("POST /api/auth/verify-otp")
    doc.table(
        ["Field", "Type", "Required"],
        [
            ["email", "string", "Yes"],
            ["code", "string", "Yes"],
        ],
        col_widths=[1.6, 1.4, 1.4],
    )

    doc.h1("៣. Endpoint កម្ចី")
    doc.h2("GET /api/loans")
    doc.p("មើលកម្ចីទាំងអស់។ អតិថិជនមើលតែរបស់ខ្លួន។")
    doc.h2("POST /api/loans")
    doc.p("បង្កើតសំណុំបែបទកម្ចីថ្មី។")
    doc.h2("PATCH /api/loans/:id")
    doc.p("អាប់ដេតស្ថានភាពកម្ចី។ តម្រូវតួនាទី loan-officer ឬ super-admin។")
    doc.p("សកម្មភាពផ្តាច់មុខ: PATCH /api/loans/:id/approve, /reject, /hold — កំណត់ត្រឹម loan-officer និង super-admin។")

    doc.h1("៤. Endpoint ប្រតិបត្តិការ")
    doc.h2("GET /api/transactions")
    doc.p("មើលប្រតិបត្តិការ។")
    doc.h2("POST /api/simulate-payment")
    doc.p("ក្លែងធ្វើការទូទាត់ (សម្រាប់តេស្ត)។")

    doc.h1("៥. Endpoint អ្នកគ្រប់គ្រង")
    doc.p("Endpoint ខាងក្រោមតម្រូវឱ្យមានតួនាទី loan-officer ឬ super-admin:")
    doc.table(
        ["Endpoint", "Method", "ការពិពណ៌នា"],
        [
            ["/api/stats", "GET", "ស្ថិតិប្រព័ន្ធ"],
            ["/api/users", "GET", "មើលអ្នកប្រើប្រាស់"],
            ["/api/audit/logs", "GET", "Audit logs"],
            ["/api/config", "GET/PATCH", "ការកំណត់ប្រព័ន្ធ"],
            ["/api/tasks", "GET", "ការងារ KYC"],
        ],
        col_widths=[2.0, 1.0, 3.4],
    )

    doc.h1("៦. Endpoint KHQR")
    doc.table(
        ["Endpoint", "Method", "ការពិពណ៌នា"],
        [
            ["/api/khqr/generate", "POST", "បង្កើតកូដ KHQR"],
            ["/api/khqr/verify", "POST", "ផ្ទៀងផ្ទាត់ការទូទាត់"],
            ["/api/khqr/decode", "POST", "ឌិកូដកូដ KHQR"],
            ["/api/khqr/deeplink", "POST", "បង្កើត deeplink"],
        ],
        col_widths=[2.0, 1.0, 3.4],
    )

    doc.h1("៧. Endpoint PayWay")
    doc.p("NexusFinance ប្រើ ABA PayWay Purchase API ជាមួយ hosted checkout។ Frontend ហៅ "
          "/api/payway/purchase រួចបញ្ជូន fields ដែលបានត្រឡប់ជា form ទៅកាន់ URL checkout របស់ ABA។ "
          "Endpoints return / cancel គ្រប់គ្រងការបញ្ជូនបន្តក្រោយការទូទាត់។")
    doc.table(
        ["Endpoint", "Method", "ការពិពណ៌នា"],
        [
            ["/api/payway/purchase", "POST", "បង្កើតការទូទាត់ hosted checkout (view_type=hosted_view) និងរក្សាទុកកំណត់ត្រា PENDING"],
            ["/api/payway/return", "GET", "ABA success redirect; ផ្ទៀងផ្ទាត់ស្ថានភាព រក្សាទុកការទូទាត់ដែលបានអនុម័ត បញ្ជូនទៅ /payment/success"],
            ["/api/payway/cancel", "GET", "ABA cancel redirect; បញ្ជូនទៅ /payment/cancel"],
            ["/api/payway/verify-payment", "POST", "ពិនិត្យស្ថានភាពប្រតិបត្តិការ; សម្គាល់ APPROVED + សរសេរក្នុង ledger"],
            ["/api/payway/callback", "POST", "ABA webhook (HMAC-signed) ជាមួយការធ្វើបច្ចុប្បន្នភាព approval/decline"],
            ["/api/payway/simulate-payment", "POST", "ជំនួយ sandbox ដើម្បីអនុម័តការទូទាត់សម្រាប់តេស្ត"],
            ["/api/payway/transactions", "GET", "បញ្ជីប្រតិបត្តិការ PayWay ពីមូលដ្ឋានទិន្នន័យ"],
            ["/api/payway/generate-qr", "POST", "Legacy endpoint; ឥឡូវបញ្ជូនទៅ Purchase API"],
        ],
        col_widths=[2.0, 1.0, 3.9],
    )
    doc.p("ការទូទាត់ PayWay ដែលត្រូវបានអនុម័តត្រូវបានសរសេរទៅ nexus_payway_transactions បង្កើតធាតុ Repayment ក្នុង "
          "nexus_transactions ព្រមទាំងការជូនដំណឹងក្នុងកម្មវិធី និង Telegram។")
    doc.p("សំណើ purchase ចុះហត្ថលេខាជាមួយ HMAC-SHA512 តាមលំដាប់ 24-field ថេរ "
          "(req_time, merchant_id, tran_id, amount, items, shipping, firstname, lastname, email, "
          "phone, type, payment_option, return_url, cancel_url, continue_success_url, return_deeplink, "
          "currency, custom_fields, return_params, payout, lifetime, additional_params, google_pay_token, "
          "skip_success_page)។ view_type និង payment_gate ផ្ញើដោយគ្មាន signature។ Webhook callback "
          "ផ្ទៀងផ្ទាត់តាមលំដាប់ដូចគ្នា តាម header x-payway-hmac-sha512។")

    doc.h1("៨. Schema មូលដ្ឋានទិន្នន័យ")
    doc.h2("nexus_users")
    doc.table(
        ["Column", "Type", "ការពិពណ៌នា"],
        [
            ["id", "SERIAL PK", "ID"],
            ["name", "TEXT", "ឈ្មោះ"],
            ["email", "TEXT UNIQUE", "អ៊ីមែល"],
            ["password", "TEXT", "Bcrypt hash"],
            ["role", "TEXT", "customer / loan-officer / super-admin"],
            ["phone", "TEXT", "ទូរស័ព្ទ"],
            ["telegram_chat_id", "BIGINT", "Telegram chat ID"],
            ["email_verified", "BOOLEAN", "អ៊ីមែលបានផ្ទៀងផ្ទាត់ឬអត់ (រារាំងការចូលពេល false)"],
            ["otp_code", "TEXT", "OTP hash"],
            ["otp_expires_at", "TIMESTAMPTZ", "OTP expiry"],
            ["otp_verified_at", "TIMESTAMPTZ", "OTP verified"],
            ["created_at", "TIMESTAMPTZ", "កាលបរិច្ឆេទបង្កើត"],
        ],
        col_widths=[1.8, 1.4, 3.2],
    )

    doc.h2("nexus_loans")
    doc.table(
        ["Column", "Type", "ការពិពណ៌នា"],
        [
            ["id", "SERIAL PK", "ID"],
            ["user_id", "INTEGER", "User ID"],
            ["name", "TEXT", "ឈ្មោះអ្នកសុំ"],
            ["email", "TEXT", "អ៊ីមែល"],
            ["amount", "NUMERIC", "ចំនួនទឹកប្រាក់"],
            ["type", "TEXT", "ប្រភេទកម្ចី"],
            ["status", "TEXT", "pending / approved / rejected / hold"],
            ["duration_months", "INTEGER", "រយៈពេល"],
            ["interest_rate", "NUMERIC", "អត្រាការប្រាក់"],
            ["created_at", "TIMESTAMPTZ", "កាលបរិច្ឆេទ"],
        ],
        col_widths=[1.8, 1.4, 3.2],
    )

    doc.h2("nexus_payway_transactions")
    doc.table(
        ["Column", "Type", "ការពិពណ៌នា"],
        [
            ["id", "BIGSERIAL PK", "ID"],
            ["tran_id", "TEXT UNIQUE", "លេខសម្គាល់ប្រតិបត្តិការ PayWay"],
            ["email", "TEXT", "អ៊ីមែលអតិថិជន (normalized)"],
            ["amount", "NUMERIC", "ចំនួនទឹកប្រាក់"],
            ["currency", "TEXT", "រូបិយប័ណ្ណ (default USD)"],
            ["status", "TEXT", "PENDING / APPROVED / DECLINED"],
            ["apv", "TEXT", "លេខកូដអនុម័ត PayWay"],
            ["loan_id", "TEXT", "លេខកម្ចីដែលភ្ជាប់ (optional)"],
            ["user_id", "INT", "លេខអ្នកប្រើ NexusFinance"],
            ["created_at", "TIMESTAMPTZ", "កាលបរិច្ឆេទបង្កើត"],
            ["paid_at", "TIMESTAMPTZ", "ពេលវេលាអនុម័ត"],
        ],
        col_widths=[1.8, 1.4, 3.2],
    )


# ═══════════════════════════════════════════════════════════════
#  BUILD ALL
# ═══════════════════════════════════════════════════════════════
DOCS = [
    ("NF-DOC-001", "Executive Overview",       "ទិដ្ឋភាពសង្ខេប",             doc001,    doc001_kh),
    ("NF-DOC-002", "Platform Report",          "របាយការណ៍ប្រព័ន្ធ",          doc002,    doc002_kh),
    ("NF-DOC-003", "Security & Compliance",    "សន្តិសុខនិងការអនុវត្ត",     doc003,    doc003_kh),
    ("NF-DOC-004", "User Manual — Admin & Officer", "មគ្គុទេសក៍អ្នកគ្រប់គ្រង", doc004, doc004_kh),
    ("NF-DOC-005", "User Manual — Customer",   "មគ្គុទេសក៍អតិថិជន",        doc005,    doc005_kh),
    ("NF-DOC-006", "Telegram Bot Guide",       "មគ្គុទេសក៍ប៉ុត Telegram",    doc006,    doc006_kh),
    ("NF-DOC-007", "Technical Architecture",   "ស្ថាបត្យកម្មបច្ចេកវិទ្យា",  doc007,    doc007_kh),
    ("NF-DOC-008", "API & Database Reference", "API និងមូលដ្ឋានទិន្នន័យ",   doc008,    doc008_kh),
]

def build_all():
    print("=== NexusFinance Documentation Suite ===\n")

    for doc_id, title_en, title_kh, fn_en, fn_kh in DOCS:
        print(f"--- {doc_id}: {title_en} ---")

        # English
        doc_en = NexusDoc(lang="EN", title=f"NexusFinance — {title_en}",
                          subtitle=f"Digital Lending Platform for Cambodia",
                          doc_number=doc_id, footer_note="Internal & Confidential")
        fn_en(doc_en)
        out_en = os.path.join(EN_DIR, f"{doc_id}_{title_en.replace(' ','_').replace('&','and')}_EN.docx")
        doc_en.save(os.path.abspath(out_en))

        # Khmer
        doc_kh = NexusDoc(lang="KH", title=f"NexusFinance — {title_kh}",
                          subtitle="ប្រព័ន្ធគ្រប់គ្រងប្រាក់កម្ចីឌីជីថលសម្រាប់កម្ពុជា",
                          doc_number=doc_id, footer_note="Internal & Confidential")
        fn_kh(doc_kh)
        out_kh = os.path.join(KH_DIR, f"{doc_id}_{title_kh}_KH.docx")
        doc_kh.save(os.path.abspath(out_kh))

        print()

    print("=== DONE: 16 documents generated ===")

if __name__ == "__main__":
    build_all()
