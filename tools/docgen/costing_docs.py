"""
NexusFinance Costing Documents — Per-Client Hosting + OTP Costing
Generates 2 .docx files in DOC/ folder
"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from engine import NexusDoc

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "DOC"))
os.makedirs(BASE, exist_ok=True)


# ═══════════════════════════════════════════════════════════════
#  DOCUMENT 1: PER-CLIENT PRIVATE ACCOUNT HOSTING COSTING
# ═══════════════════════════════════════════════════════════════
def doc_hosting():
    doc = NexusDoc(lang="EN", title="NexusFinance — Private Account Hosting Costing",
                   subtitle="Per-Client Deployment Cost Analysis",
                   doc_number="NF-DOC-COST-001",
                   footer_note="Internal & Confidential")

    doc.cover(version="3.0", date="August 2026", author="NDX Digital Support",
              tags=["Hosting", "Costing", "VPS", "Per-Client", "Scalability"])

    doc.toc([
        ("1", "Executive Summary"),
        ("2", "NexusFinance Resource Requirements"),
        ("3", "Hosting Provider Comparison"),
        ("4", "Per-Client Cost Model"),
        ("5", "Scaling Scenarios"),
        ("6", "Total Cost of Ownership"),
        ("7", "Recommendation"),
    ])

    # ── 1. Executive Summary ──
    doc.h1("1. Executive Summary")
    doc.p("This document evaluates hosting options for deploying private NexusFinance instances "
          "for individual clients. Each client receives an isolated deployment with their own "
          "database, frontend, and backend — ensuring data separation and customization.")
    doc.callout("Key Finding",
                "A single VPS can host 10-20 small-to-medium clients running the NexusFinance "
                "stack (Node.js backend + Supabase/PostgreSQL). The most cost-effective option is "
                "Hostinger KVM 2 at $8.99/month per VPS, yielding $0.45-0.90 per client per month.",
                kind="tip")

    # ── 2. Resource Requirements ──
    doc.h1("2. NexusFinance Resource Requirements")
    doc.p("Based on the current NexusFinance stack, each client deployment requires:")
    doc.table(
        ["Resource", "Minimum", "Recommended", "Notes"],
        [
            ["vCPU", "1 core", "2 cores", "Node.js + PostgreSQL run on same VPS"],
            ["RAM", "1 GB", "2 GB", "512MB for Node.js, 512MB for PostgreSQL"],
            ["Storage", "10 GB", "20 GB", "OS + app + database + backups"],
            ["Bandwidth", "500 GB", "1 TB", "API calls + static assets + notifications"],
            ["OS", "Ubuntu 22.04", "Ubuntu 24.04", "LTS for security updates"],
        ],
        col_widths=[1.2, 1.0, 1.2, 3.2],
    )
    doc.callout("Architecture Note",
                "NexusFinance uses a monolithic Node.js backend. For per-client isolation, "
                "each client gets their own VPS with both the backend and database running "
                "locally. Supabase is replaced with a local PostgreSQL instance.",
                kind="info")

    doc.h2("2.1 What's Included Per Client")
    doc.bullet("Dedicated VPS with Node.js backend + PostgreSQL database")
    doc.bullet("Custom domain (e.g., client.nexusfinance.com)")
    doc.bullet("Free SSL via Let's Encrypt (auto-renewal)")
    doc.bullet("Daily automated backups (7-day retention)")
    doc.bullet("Telegram bot integration (shared bot, separate chat IDs)")
    doc.bullet("SMS OTP via Twilio (shared account, per-message billing)")
    doc.bullet("Email notifications via Brevo (shared account)")

    # ── 3. Hosting Provider Comparison ──
    doc.h1("3. Hosting Provider Comparison")
    doc.p("Five hosting providers are evaluated based on price, performance, and suitability "
          "for running a Node.js + PostgreSQL stack.")

    doc.h2("3.1 Pricing Overview")
    doc.table(
        ["Provider", "Plan", "vCPU", "RAM", "Storage", "Bandwidth", "Monthly", "Yearly"],
        [
            ["Hostinger", "KVM 2", "2", "8 GB", "100 GB NVMe", "8 TB", "$8.99", "$107.88"],
            ["Vultr", "HP 1GB", "1", "1 GB", "25 GB NVMe", "2 TB", "$6.00", "$72.00"],
            ["DigitalOcean", "Basic 2vCPU", "2", "4 GB", "80 GB SSD", "4 TB", "$24.00", "$288.00"],
            ["Railway", "Hobby", "Shared", "512 MB", "Volume", "100 GB", "$5.00*", "$60.00*"],
            ["Render", "Starter", "0.5", "512 MB", "Persistent", "5 GB", "$7.00", "$84.00"],
        ],
        col_widths=[1.0, 0.9, 0.5, 0.7, 1.0, 0.8, 0.7, 0.8],
    )
    doc.p("* Railway and Render are usage-based; actual costs vary by traffic.", size=9, italic=True)

    doc.h2("3.2 Feature Comparison")
    doc.table(
        ["Feature", "Hostinger", "Vultr", "DigitalOcean", "Railway", "Render"],
        [
            ["Managed DB", "No", "No", "Yes ($15+)", "Yes", "Yes ($7+)"],
            ["Auto-scaling", "No", "No", "Yes", "Yes", "Yes"],
            ["Backups", "Weekly free", "Paid add-on", "20% extra", "Included", "Included"],
            ["SSL", "Free Let's Encrypt", "Self-configure", "Self-configure", "Auto", "Auto"],
            ["Support", "24/7 chat", "Ticket only", "Ticket only", "Discord", "Email"],
            ["Regions", "Global", "32 regions", "15 regions", "US (expanding)", "US/EU/SG"],
            ["Uptime SLA", "99.9%", "100%", "99.99%", "99.5%", "99.9%"],
            ["Root access", "Yes", "Yes", "Yes", "No", "No"],
        ],
        col_widths=[1.0, 0.85, 0.85, 0.85, 0.85, 0.85],
    )

    doc.h2("3.3 Cost-Per-Spec Analysis")
    doc.table(
        ["Provider", "Price/GB RAM", "Price/vCPU", "Best Value Tier"],
        [
            ["Hostinger", "$1.12", "$4.50", "KVM 2 — best overall value"],
            ["Vultr", "$6.00", "$6.00", "HP 1GB — good for single clients"],
            ["DigitalOcean", "$6.00", "$12.00", "Basic 2vCPU — ecosystem premium"],
            ["Railway", "~$10.00", "N/A", "Usage-based, hard to compare directly"],
            ["Render", "$14.00", "$14.00", "Starter — simplest setup"],
        ],
        col_widths=[1.2, 1.2, 1.2, 3.0],
    )

    # ── 4. Per-Client Cost Model ──
    doc.h1("4. Per-Client Cost Model")
    doc.p("Assuming each VPS hosts 10-20 clients (shared backend, separate database schemas):")

    doc.h2("4.1 Shared Resource Assumption")
    doc.table(
        ["Scenario", "Clients/VPS", "VPS Plan", "Monthly Cost", "Cost/Client"],
        [
            ["Conservative", "10", "Hostinger KVM 2 ($8.99)", "$8.99", "$0.90"],
            ["Moderate", "15", "Hostinger KVM 2 ($8.99)", "$8.99", "$0.60"],
            ["Aggressive", "20", "Hostinger KVM 2 ($8.99)", "$8.99", "$0.45"],
            ["Premium", "10", "DigitalOcean 2vCPU ($24)", "$24.00", "$2.40"],
            ["Premium+", "15", "DigitalOcean 2vCPU ($24)", "$24.00", "$1.60"],
        ],
        col_widths=[1.2, 1.0, 1.8, 1.0, 1.0],
    )
    doc.callout("Why 10-20 clients per VPS?",
                "NexusFinance is a lightweight Node.js app. With 2GB RAM, the backend uses ~200MB, "
                "PostgreSQL ~300MB, leaving 1.5GB for OS and headroom. Each additional client adds "
                "~50MB for their database schema. At 20 clients, total DB usage is ~1GB, well within limits.",
                kind="tip")

    doc.h2("4.2 Additional Per-Client Costs")
    doc.table(
        ["Item", "Cost", "Frequency", "Notes"],
        [
            ["Domain name", "$10-15", "Per year", "client-domain.com"],
            ["SSL certificate", "$0", "Free", "Let's Encrypt auto-renewal"],
            ["Backup storage", "$0-2", "Per month", "Included or low-cost add-on"],
            ["Twilio SMS", "$0.0105", "Per OTP", "Shared across clients"],
            ["Brevo email", "$0", "Free tier", "300 emails/day free"],
            ["Monitoring", "$0-5", "Per month", "UptimeRobot free tier or paid"],
        ],
        col_widths=[1.4, 1.0, 1.0, 3.0],
    )

    # ── 5. Scaling Scenarios ──
    doc.h1("5. Scaling Scenarios")
    doc.p("Projected costs as the client base grows:")

    doc.h2("5.1 Cost Projection Table")
    doc.table(
        ["Clients", "VPS Needed", "VPS Cost/Mo", "SMS/Mo", "Total/Mo", "Total/Year"],
        [
            ["10", "1", "$8.99", "$1.05", "$10.04", "$120.48"],
            ["20", "1", "$8.99", "$2.10", "$11.09", "$133.08"],
            ["50", "3", "$26.97", "$5.25", "$32.22", "$386.64"],
            ["100", "5", "$44.95", "$10.50", "$55.45", "$665.40"],
            ["200", "10", "$89.90", "$21.00", "$110.90", "$1,330.80"],
            ["500", "25", "$224.75", "$52.50", "$277.25", "$3,327.00"],
        ],
        col_widths=[0.7, 0.8, 1.0, 0.9, 1.0, 1.1],
    )
    doc.p("* Assumes 100 OTPs per client per month.", size=9, italic=True)

    doc.h2("5.2 Cost Per Client At Scale")
    doc.table(
        ["Clients", "Total Monthly", "Cost Per Client/Mo", "Cost Per Client/Year"],
        [
            ["10", "$10.04", "$1.00", "$12.05"],
            ["20", "$11.09", "$0.55", "$6.65"],
            ["50", "$32.22", "$0.64", "$7.73"],
            ["100", "$55.45", "$0.55", "$6.65"],
            ["200", "$110.90", "$0.55", "$6.65"],
            ["500", "$277.25", "$0.55", "$6.65"],
        ],
        col_widths=[1.0, 1.5, 1.8, 1.8],
    )
    doc.callout("Economy of Scale",
                "At 20+ clients, the cost per client drops below $0.60/month — "
                "SMS costs become the primary variable expense. The VPS model becomes "
                "increasingly efficient as you scale.",
                kind="tip")

    # ── 6. Total Cost of Ownership ──
    doc.h1("6. Total Cost of Ownership")
    doc.p("Full TCO breakdown for a 50-client deployment (Year 1):")

    doc.table(
        ["Category", "Item", "Monthly", "Yearly"],
        [
            ["Compute", "3x Hostinger KVM 2 VPS", "$26.97", "$323.64"],
            ["Domains", "50 client domains", "$4.17", "$50.00"],
            ["Monitoring", "UptimeRobot Pro", "$5.00", "$60.00"],
            ["Backups", "Off-site backup storage", "$5.00", "$60.00"],
            ["SMS (Twilio)", "500 OTPs/month", "$5.25", "$63.00"],
            ["Email (Brevo)", "Transactional emails", "$0", "$0"],
            ["SSL", "Let's Encrypt", "$0", "$0"],
            ["Labor", "Server maintenance (5 hrs/mo)", "$50.00", "$600.00"],
            ["", "", "", ""],
            ["TOTAL", "", "$96.39", "$1,156.64"],
        ],
        col_widths=[1.2, 2.0, 1.2, 1.2],
    )
    doc.p("Cost per client: $1.93/month or $23.13/year (including labor).", bold=True)

    # ── 7. Recommendation ──
    doc.h1("7. Recommendation")
    doc.table(
        ["Criterion", "Recommendation", "Rationale"],
        [
            ["Best Value", "Hostinger KVM 2", "$8.99/mo, 8GB RAM, 100GB NVMe — best specs/price"],
            ["Easiest Setup", "Hostinger KVM 2", "hPanel control panel, 24/7 support"],
            ["Best Ecosystem", "DigitalOcean", "Managed databases, one-click apps"],
            ["Simplest (PaaS)", "Render", "Zero server management, auto-deploys"],
            ["Most Flexible", "Railway", "Usage-based billing, pay for what you use"],
        ],
        col_widths=[1.2, 1.5, 3.5],
    )
    doc.callout("Final Recommendation",
                "For NexusFinance per-client hosting, Hostinger KVM 2 is the recommended choice. "
                "At $8.99/month for 2 vCPUs, 8GB RAM, and 100GB NVMe storage, it delivers the best "
                "price-to-performance ratio. A single VPS can comfortably host 10-20 clients at "
                "a cost of $0.45-0.90 per client per month.",
                kind="tip")

    path = os.path.join(BASE, "NexusFinance_Private_Account_Hosting_Costing.docx")
    doc.save(path)
    print(f"  Created: {os.path.basename(path)}")
    return path


# ═══════════════════════════════════════════════════════════════
#  DOCUMENT 2: COMPREHENSIVE OTP COSTING (TWILIO)
# ═══════════════════════════════════════════════════════════════
def doc_otp():
    doc = NexusDoc(lang="EN", title="NexusFinance — OTP Costing Analysis",
                   subtitle="Twilio SMS + Telegram Bot Comparison",
                   doc_number="NF-DOC-COST-002",
                   footer_note="Internal & Confidential")

    doc.cover(version="1.0", date="August 2026", author="NDX Digital Support",
              tags=["OTP", "Twilio", "SMS", "Telegram", "Costing"])

    doc.toc([
        ("1", "Executive Summary"),
        ("2", "OTP Delivery Channels"),
        ("3", "Twilio SMS Pricing Breakdown"),
        ("4", "Telegram Bot (FREE)"),
        ("5", "Volume Scenarios & Projections"),
        ("6", "Hybrid Strategy"),
        ("7", "Annual Cost Comparison"),
        ("8", "Recommendation"),
    ])

    # ── 1. Executive Summary ──
    doc.h1("1. Executive Summary")
    doc.p("This document analyzes the cost of OTP (One-Time Password) delivery for "
          "NexusFinance user verification. Two channels are evaluated: Twilio SMS and "
          "Telegram Bot API.")
    doc.callout("Key Finding",
                "Twilio SMS costs $0.0105 per OTP (Cambodia). Telegram Bot API is completely "
                "FREE. A hybrid strategy — Telegram for linked users, SMS for unlinked — "
                "can reduce OTP costs by 60-90%.",
                kind="tip")

    # ── 2. OTP Delivery Channels ──
    doc.h1("2. OTP Delivery Channels")
    doc.table(
        ["Channel", "Cost Per OTP", "Delivery Speed", "Reliability", "Coverage"],
        [
            ["Twilio SMS", "$0.0105", "1-5 seconds", "99.5%", "All mobile users"],
            ["Telegram Bot", "$0.00 (FREE)", "Instant", "99.9%", "Telegram users only"],
            ["Brevo Email", "$0.00 (FREE)", "5-30 seconds", "98%", "Email users"],
        ],
        col_widths=[1.2, 1.2, 1.2, 1.0, 1.8],
    )
    doc.p("Note: Telegram Bot API has no per-message cost. The bot is free to use. "
          "SMS is the only paid channel.", size=9, italic=True)

    # ── 3. Twilio SMS Pricing Breakdown ──
    doc.h1("3. Twilio SMS Pricing Breakdown")

    doc.h2("3.1 Per-Message Cost Components")
    doc.table(
        ["Component", "Cost", "Notes"],
        [
            ["Base SMS rate (Cambodia)", "$0.0075", "Outbound SMS to Cambodia (+855)"],
            ["Carrier surcharge", "$0.0030", "Pass-through fee from local carriers"],
            ["Long code number rental", "$1.15/mo", "Dedicated phone number for OTP"],
            ["Failed message fee", "$0.0010", "Only charged on delivery failure"],
            ["Inbound SMS", "$0.0075", "If using two-way SMS (not recommended for OTP)"],
        ],
        col_widths=[1.8, 1.2, 3.2],
    )

    doc.h2("3.2 Effective Cost Calculation")
    doc.p("For a standard OTP message (160 characters, single segment):")
    doc.table(
        ["Line Item", "Cost"],
        [
            ["Base SMS rate", "$0.0075"],
            ["Carrier surcharge", "$0.0030"],
            ["Number rental (spread)", "$0.0012 (at 1,000 msgs/mo)"],
            ["TOTAL per OTP", "$0.0117"],
        ],
        col_widths=[3.0, 2.0],
    )
    doc.callout("Cambodia-Specific Note",
                "Twilio's Cambodia SMS rate is $0.0075/message — one of the lowest in Southeast Asia. "
                "For comparison: Thailand is $0.025, Vietnam is $0.015, Philippines is $0.012. "
                "Cambodia benefits from competitive carrier agreements.",
                kind="info")

    doc.h2("3.3 Twilio Volume Discounts")
    doc.table(
        ["Monthly Volume", "Discount", "Effective Rate/OTP"],
        [
            ["0 - 100K", "0%", "$0.0105"],
            ["100K - 500K", "Up to 15%", "$0.0089"],
            ["500K - 1M", "Up to 25%", "$0.0079"],
            ["1M+", "Custom negotiation", "Contact Twilio"],
        ],
        col_widths=[2.0, 1.5, 2.0],
    )

    # ── 4. Telegram Bot (FREE) ──
    doc.h1("4. Telegram Bot (FREE)")
    doc.p("The Telegram Bot API is completely free for sending messages. There are no "
          "per-message fees, no monthly subscriptions, and no volume limits.")

    doc.h2("4.1 Telegram Bot Advantages")
    doc.bullet("Zero cost per OTP — no per-message charges")
    doc.bullet("Instant delivery — typically under 1 second")
    doc.bullet("Rich formatting — Markdown support for OTP messages")
    doc.bullet("No phone number required — works via Telegram chat ID")
    doc.bullet("No carrier surcharges or hidden fees")
    doc.bullet("99.9% uptime — hosted on Telegram's infrastructure")

    doc.h2("4.2 Telegram Bot Limitations")
    doc.bullet("Only works for users who have Telegram installed")
    doc.bullet("Requires user to link their Telegram account first")
    doc.bullet("Not suitable for users who don't use Telegram")
    doc.bullet("Bot must be configured and maintained")

    doc.callout("NexusFinance Integration",
                "NexusFinance already has a Telegram bot (@nexusfinancefintech_bot) with "
                "phone number sharing and account linking. Users who link their Telegram "
                "can receive OTPs via the bot at zero cost.",
                kind="tip")

    # ── 5. Volume Scenarios ──
    doc.h1("5. Volume Scenarios & Projections")
    doc.p("Monthly OTP volume projections for NexusFinance:")

    doc.h2("5.1 Volume Assumptions")
    doc.table(
        ["Scenario", "New Users/Mo", "Logins/Mo", "Password Resets/Mo", "Total OTPs/Mo"],
        [
            ["Early Stage", "20", "50", "5", "75"],
            ["Growth", "50", "200", "15", "265"],
            ["Mature", "100", "500", "30", "630"],
            ["Scale", "300", "1,500", "80", "1,880"],
            ["Enterprise", "1,000", "5,000", "200", "6,200"],
        ],
        col_widths=[1.2, 1.2, 1.2, 1.4, 1.4],
    )

    doc.h2("5.2 SMS-Only Cost (100% SMS)")
    doc.table(
        ["Volume", "SMS Cost", "Number Rental", "Total/Mo", "Total/Year"],
        [
            ["75 OTPs", "$0.79", "$1.15", "$1.94", "$23.28"],
            ["265 OTPs", "$2.78", "$1.15", "$3.93", "$47.16"],
            ["630 OTPs", "$6.62", "$1.15", "$7.77", "$93.24"],
            ["1,880 OTPs", "$19.74", "$1.15", "$20.89", "$250.68"],
            ["6,200 OTPs", "$65.10", "$1.15", "$66.25", "$795.00"],
        ],
        col_widths=[1.2, 1.2, 1.2, 1.2, 1.2],
    )

    doc.h2("5.3 Telegram-Only Cost (0% SMS)")
    doc.table(
        ["Volume", "Telegram Cost", "Total/Mo", "Total/Year"],
        [
            ["75 OTPs", "$0.00", "$0.00", "$0.00"],
            ["265 OTPs", "$0.00", "$0.00", "$0.00"],
            ["630 OTPs", "$0.00", "$0.00", "$0.00"],
            ["1,880 OTPs", "$0.00", "$0.00", "$0.00"],
            ["6,200 OTPs", "$0.00", "$0.00", "$0.00"],
        ],
        col_widths=[1.2, 1.5, 1.2, 1.2],
    )

    # ── 6. Hybrid Strategy ──
    doc.h1("6. Hybrid Strategy")
    doc.p("The recommended approach is a hybrid strategy: Telegram for linked users, "
          "SMS for unlinked users. This maximizes cost savings while maintaining coverage.")

    doc.h2("6.1 Hybrid Cost Model")
    doc.table(
        ["Scenario", "Telegram %", "SMS %", "Volume", "Cost/Mo", "Savings vs SMS-Only"],
        [
            ["10% Telegram", "10%", "90%", "630", "$7.14", "8%"],
            ["30% Telegram", "30%", "70%", "630", "$5.85", "25%"],
            ["50% Telegram", "50%", "50%", "630", "$4.56", "41%"],
            ["70% Telegram", "70%", "30%", "630", "$3.27", "58%"],
            ["90% Telegram", "90%", "10%", "630", "$1.98", "75%"],
        ],
        col_widths=[1.3, 1.0, 0.9, 0.8, 1.0, 1.4],
    )
    doc.callout("Realistic Adoption",
                "In Cambodia, Telegram penetration is ~40% among smartphone users. "
                "With the NexusFinance bot's phone sharing feature, we can expect 30-50% "
                "of users to link their Telegram accounts within the first 3 months.",
                kind="info")

    doc.h2("6.2 Recommended Hybrid Mix")
    doc.table(
        ["Metric", "Value"],
        [
            ["Target Telegram adoption", "40% of users"],
            ["SMS fallback", "60% of users"],
            ["Cost per 1,000 OTPs (hybrid)", "$6.30"],
            ["Cost per 1,000 OTPs (SMS-only)", "$10.50"],
            ["Annual savings at 1,000 OTPs/mo", "$50.40"],
            ["Annual savings at 10,000 OTPs/mo", "$504.00"],
        ],
        col_widths=[2.5, 2.5],
    )

    # ── 7. Annual Cost Comparison ──
    doc.h1("7. Annual Cost Comparison")
    doc.p("Year 1 cost comparison across all strategies:")

    doc.table(
        ["Strategy", "75 OTPs/mo", "265 OTPs/mo", "630 OTPs/mo", "1,880 OTPs/mo", "6,200 OTPs/mo"],
        [
            ["SMS-Only", "$23.28", "$47.16", "$93.24", "$250.68", "$795.00"],
            ["40% Telegram / 60% SMS", "$14.58", "$30.30", "$59.22", "$159.24", "$504.00"],
            ["Telegram-Only", "$0.00", "$0.00", "$0.00", "$0.00", "$0.00"],
        ],
        col_widths=[1.5, 0.9, 0.9, 0.9, 1.0, 1.0],
    )

    doc.h2("7.1 Cost Per OTP Summary")
    doc.table(
        ["Strategy", "Cost/OTP", "Annual Cost (1K OTPs/mo)"],
        [
            ["SMS-Only", "$0.0105", "$126.00"],
            ["Hybrid (40/60)", "$0.0063", "$75.60"],
            ["Telegram-Only", "$0.00", "$0.00"],
        ],
        col_widths=[2.0, 1.5, 2.0],
    )

    # ── 8. Recommendation ──
    doc.h1("8. Recommendation")
    doc.table(
        ["Criterion", "Recommendation", "Rationale"],
        [
            ["Cost Optimization", "Hybrid (40% Telegram)", "60% savings vs SMS-only, realistic adoption"],
            ["Coverage", "Twilio SMS", "All users covered, reliable delivery"],
            ["User Experience", "Telegram Bot", "Instant delivery, rich formatting"],
            ["Long-term Strategy", "Push Telegram linking", "Zero cost, better UX"],
        ],
        col_widths=[1.5, 1.8, 3.0],
    )
    doc.callout("Final Recommendation",
                "Implement a hybrid OTP strategy: Telegram Bot for linked users (FREE), "
                "Twilio SMS for unlinked users ($0.0105/OTP). With 40% Telegram adoption, "
                "the effective cost drops to $0.0063/OTP — saving 40% vs SMS-only. "
                "Promote Telegram linking through the bot's /link command to increase "
                "adoption and further reduce costs.",
                kind="tip")

    path = os.path.join(BASE, "NexusFinance_OTP_Costing_Twilio.docx")
    doc.save(path)
    print(f"  Created: {os.path.basename(path)}")
    return path


# ── Run both generators ──
if __name__ == "__main__":
    print("\n  Generating costing documents...")
    doc_hosting()
    doc_otp()
    print("  Done.\n")
