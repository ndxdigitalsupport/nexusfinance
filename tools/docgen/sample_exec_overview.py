"""
Sample — Executive Overview (EN). Verifies the document design/format/layout.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from engine import NexusDoc

def build(doc):
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

    # ── 1 ──────────────────────────────────────────────
    doc.h1("1. Executive Summary")
    doc.p("NexusFinance is a full-stack digital lending platform built for microfinance "
          "operations in Cambodia. It covers the complete lending lifecycle — from customer "
          "loan applications, through officer review and KYC verification, to repayment "
          "collection via KHQR payments — with real-time oversight through a secure web "
          "dashboard and a Telegram bot.")
    doc.callout("Why this matters",
                "NexusFinance replaces manual, paper-based lending workflows with a secure, "
                "auditable, and bilingual (English / Khmer) digital system that customers, "
                "loan officers, and administrators use every day.",
                kind="tip")

    # ── 2 ──────────────────────────────────────────────
    doc.h1("2. What We Delivered")
    doc.table(
        ["Capability", "Description"],
        [
            ["Web App", "React SPA with three portals — Customer, Loan Officer, Super Admin"],
            ["Backend API", "Node.js/Express REST API with JWT authentication and audit logging"],
            ["Auth", "Email + password with Brevo OTP verification (10-minute expiry)"],
            ["Payments", "KHQR (Bakong) integration and ABA PayWay webhooks"],
            ["Telegram Bot", "Payment notifications, reminders, admin commands"],
            ["Android App", "Expo WebView shell — installable APK"],
            ["Deployment", "Vercel (frontend) + Render (backend) + Supabase (database)"],
        ],
        col_widths=[1.8, 4.6],
    )

    # ── 3 ──────────────────────────────────────────────
    doc.h1("3. Demo Accounts")
    doc.p("Three demo accounts are seeded automatically on server start.")
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

    # ── 4 ──────────────────────────────────────────────
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

    # ── 5 ──────────────────────────────────────────────
    doc.h1("5. Security & Compliance Highlights")
    doc.bullet("JWT sessions with server-side role enforcement (customer / loan-officer / super-admin)")
    doc.bullet("Bcrypt password hashing — no plain-text credentials stored")
    doc.bullet("Email OTP verification for register, login, and password change flows")
    doc.bullet("Full audit log with timestamps for every sensitive action")
    doc.bullet("Rate limiting on auth endpoints to prevent brute force")
    doc.bullet("Environment variables keep all secrets out of the codebase")

    # ── 6 ──────────────────────────────────────────────
    doc.h1("6. Roadmap")
    doc.check_item("Go live with ABA PayWay production webhooks")
    doc.check_item("Add ACLEDA bank integration for payment notifications")
    doc.check_item("Connect Vercel auto-deploys (already connected)")
    doc.check_item("Add Google OAuth sign-in (deferred)")
    doc.check_item("Launch customer mobile app to app stores")

def main():
    doc = NexusDoc(lang="EN", title="NexusFinance — Executive Overview",
                   subtitle="Digital Lending Platform for Cambodia",
                   doc_number="NF-DOC-001", footer_note="Internal & Confidential")
    build(doc)
    out = os.path.join(os.path.dirname(__file__), "..", "..", "DOC", "EN",
                       "NF-DOC-001_Executive_Overview_EN.docx")
    doc.save(os.path.abspath(out))

if __name__ == "__main__":
    main()
