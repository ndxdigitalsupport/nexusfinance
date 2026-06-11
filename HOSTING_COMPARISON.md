# NexusFinance — Hosting Platform Comparison

**Prepared for:** Management Review  
**Date:** June 10, 2026  
**Project:** NexusFinance Loan Management Platform

---

## Executive Summary

We are evaluating hosting platforms for the NexusFinance application — a Dockerized Node.js/React loan management system currently deployed on **Render**. This document compares three options across features, pricing, and operational overhead.

| Platform | Monthly Cost (Production) | Best For |
|----------|--------------------------|----------|
| **Google Cloud (Cloud Run)** | $18–30/mo | Scalability, long-term growth |
| **Render** (current) | $14–45/mo | Simplicity, fast setup |
| **Railway** | $10–25/mo | Developer experience, speed |

**Recommendation:** Google Cloud (Cloud Run) offers the best balance of cost, scalability, and industry-standard infrastructure.

---

## Option 1: Google Cloud (Cloud Run + Cloud SQL + Firebase Auth)

### Architecture
- **Compute:** Cloud Run (serverless containers)
- **Database:** Cloud SQL (managed PostgreSQL)
- **Auth:** Firebase Authentication

### Pricing Breakdown

| Component | Free Tier | Paid (Small App) |
|-----------|-----------|------------------|
| Cloud Run | 2M requests/mo, 180K vCPU-seconds free | ~$0–5/mo |
| Cloud SQL (db-f1-micro) | None (but $300 credit for 90 days) | ~$13/mo |
| Firebase Auth | 50,000 MAUs free | $0 (until 50K users) |
| **Total** | **$0/mo** (first 90 days) | **~$18–25/mo** |

### Key Features
- ✅ Scales to zero (no cost when idle)
- ✅ Auto-scaling handles traffic spikes
- ✅ Google infrastructure (99.95% SLA)
- ✅ Built-in HTTPS and load balancing
- ✅ Industry-standard — easy to hire for
- ✅ $300 free credits for new accounts (90 days)
- ✅ Firebase Auth: 50,000 users free (generous)
- ✅ Per-second billing — pay only for actual usage

### Considerations
- ⚠️ Cloud SQL has no always-free tier (~$13/mo minimum)
- ⚠️ More complex initial setup than Render/Railway
- ⚠️ Vendor lock-in with Google ecosystem
- ⚠️ Network egress costs ($0.12/GB after 1GB free)

---

## Option 2: Render (Current Platform)

### Architecture
- **Compute:** Render Web Service (Docker)
- **Database:** Render PostgreSQL
- **Auth:** Appwrite (external service)

### Pricing Breakdown

| Component | Free Tier | Paid (Production) |
|-----------|-----------|-------------------|
| Web Service | 512MB RAM, spins down after 15 min idle | $7–25/mo |
| PostgreSQL | 256MB RAM, expires after 30 days | $7–20/mo |
| Appwrite (Auth) | 75,000 MAUs free | $0 (until 75K users) |
| **Total** | **$0/mo** (limited) | **$14–45/mo** |

### Key Features
- ✅ Simplest setup — deploy from GitHub in minutes
- ✅ Managed database included
- ✅ Free tier available (with limitations)
- ✅ No Docker knowledge required
- ✅ Built-in preview environments

### Considerations
- ⚠️ Free tier services spin down after 15 minutes (30–60s cold start)
- ⚠️ Free PostgreSQL database expires after 30 days
- ⚠️ Per-service billing adds up with multiple services
- ⚠️ Staging environments double the cost
- ⚠️ Limited global regions
- ⚠️ Less scalable than Google Cloud

---

## Option 3: Railway

### Architecture
- **Compute:** Railway (usage-based containers)
- **Database:** Managed PostgreSQL
- **Auth:** Appwrite (external service)

### Pricing Breakdown

| Component | Free Tier | Paid (Production) |
|-----------|-----------|-------------------|
| Compute | $1 credit/mo | $5–20/mo |
| PostgreSQL | Included in credits | $5–10/mo |
| Appwrite (Auth) | 75,000 MAUs free | $0 (until 75K users) |
| **Total** | **$1/mo** | **$10–25/mo** |

### Key Features
- ✅ Fastest deployment experience (push to deploy)
- ✅ Usage-based pricing — pay for what you use
- ✅ Built-in managed databases
- ✅ Preview environments for PRs
- ✅ Modern developer dashboard
- ✅ One-click database provisioning

### Considerations
- ⚠️ Usage-based pricing can be unpredictable
- ⚠️ No permanent free tier (only $1/mo credit)
- ⚠️ Fewer global regions than Google Cloud
- ⚠️ Smaller company — less enterprise support
- ⚠️ Egress fees can add up ($0.05/GB)

---

## Side-by-Side Comparison

| Feature | Google Cloud | Render | Railway |
|---------|-------------|--------|---------|
| **Monthly Cost** | $18–25/mo | $14–45/mo | $10–25/mo |
| **Free Tier** | Yes (90-day credits) | Yes (limited) | $1/mo credit |
| **Auto-scaling** | ✅ Automatic | ❌ Manual | ✅ Automatic |
| **Scale to Zero** | ✅ Yes | ✅ Yes (free tier) | ✅ Yes |
| **Global Regions** | 40+ regions | 5 regions | 6 regions |
| **SLA** | 99.95% | 99.9% | 99.9% |
| **Database** | Cloud SQL ($13/mo) | Render PG ($7/mo) | Railway PG (usage) |
| **Auth Solution** | Firebase (50K free) | Appwrite (75K free) | Appwrite (75K free) |
| **Docker Support** | ✅ Native | ✅ Native | ✅ Native |
| **Setup Complexity** | Medium | Low | Low |
| **Enterprise Ready** | ✅ Yes | ⚠️ Growing | ⚠️ Growing |
| **Vendor Lock-in** | High | Low | Low |
| **Cold Start** | ~1–3s | ~30–60s (free) | ~1–5s |

---

## Cost Projection (12 Months)

| Platform | Month 1–3 | Month 4–12 | Annual Total |
|----------|-----------|------------|--------------|
| **Google Cloud** | $0 (credits) | $18–25/mo | **$162–225** |
| **Render** | $14–25/mo | $14–45/mo | **$168–405** |
| **Railway** | $5–10/mo | $10–25/mo | **$95–240** |

---

## Recommendation

**Google Cloud (Cloud Run)** is recommended for the following reasons:

1. **Best long-term value** — While slightly more expensive than Railway, the $300 free credits offset the first 3 months entirely
2. **Superior scalability** — Auto-scales from zero to thousands of instances; handles traffic spikes seamlessly
3. **Industry standard** — Google Cloud is the most widely used enterprise cloud platform; easier to hire engineers familiar with it
4. **Reliability** — 99.95% SLA with Google's infrastructure
5. **Firebase Auth** — 50,000 free MAUs is more than sufficient for our current user base
6. **Future-proof** — As the application grows, Google Cloud scales with it without platform migration

**For cost-conscious teams**, Railway offers the best developer experience at the lowest price point, with usage-based billing that scales with actual usage.

**Render** is suitable if simplicity is the top priority and the team wants minimal infrastructure management.

---

## Next Steps

1. Management approval for platform selection
2. Set up Google Cloud project and enable billing
3. Create Cloud SQL instance and migrate database
4. Set up Firebase project for authentication
5. Deploy application to Cloud Run
6. Update DNS and SSL certificates
7. Monitor costs for first 30 days
