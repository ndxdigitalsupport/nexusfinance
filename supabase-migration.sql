-- Nexusfinance Database Schema
-- Run this in Supabase SQL Editor

CREATE TABLE nexus_users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'customer',
  phone TEXT DEFAULT '',
  verified BOOLEAN NOT NULL DEFAULT false
);

-- If nexus_users already exists without phone column, run:
-- ALTER TABLE nexus_users ADD COLUMN phone TEXT DEFAULT '';

CREATE TABLE nexus_loans (
  id TEXT PRIMARY KEY,
  "applicantName" TEXT NOT NULL,
  "applicantEmail" TEXT NOT NULL,
  initials TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New',
  urgency TEXT NOT NULL DEFAULT 'Normal',
  "assignedTo" INT REFERENCES nexus_users(id) ON DELETE SET NULL,
  date TEXT NOT NULL,
  purpose TEXT NOT NULL,
  "creditScore" INT NOT NULL,
  "monthlyIncome" NUMERIC NOT NULL,
  "durationMonths" INT NOT NULL
);

CREATE TABLE nexus_transactions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL,
  "userId" INT REFERENCES nexus_users(id) ON DELETE CASCADE
);

CREATE TABLE nexus_tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  applicant TEXT NOT NULL,
  regarding TEXT NOT NULL,
  time TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE nexus_config (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  "baseInterestRate" NUMERIC NOT NULL DEFAULT 5.4,
  "maxLoanAmount" NUMERIC NOT NULL DEFAULT 500000,
  "kycRequired" BOOLEAN NOT NULL DEFAULT true,
  "autoApproveLimit" NUMERIC NOT NULL DEFAULT 5000
);

-- Seed demo users (passwords are bcrypt hashes of "password123")
INSERT INTO nexus_users (name, email, password, role, verified) VALUES
  ('Demo Customer', 'customer@nexus.com', '$2b$10$S05PE.WBO8ScFsr7cg25I.QU8MlmL1cDtLGZUUcRUVffUnNRS3jZy', 'customer', true),
  ('Demo Loan Officer', 'officer@nexus.com', '$2b$10$HH57B4fcDKZJPdGlJ4B47.rxYICNOzYePaoRhcyJO2io/HmOHguX6', 'loan-officer', true),
  ('Demo Admin', 'admin@nexus.com', '$2b$10$D/.k3eG.wEcAbdGaYOBHDedRq95ZGv6Z7zC81b/E37nrNhq.nWQDG', 'super-admin', true);

-- Seed config
INSERT INTO nexus_config (id, "baseInterestRate", "maxLoanAmount", "kycRequired", "autoApproveLimit")
VALUES (1, 5.4, 500000, true, 5000);

-- Seed tasks
INSERT INTO nexus_tasks (id, title, applicant, regarding, time, completed) VALUES
  ('t1', 'KYC Verification Call', 'Somchai V.', 'SME Loan #77281', '14:00', false),
  ('t2', 'Credit Score Audit', 'Nguyen Khanh', 'Housing Loan #77295', '15:30', false),
  ('t3', 'Collateral Registry Verification', 'Demo Customer', 'Personal Loan', '16:45', false);

-- Seed loans
INSERT INTO nexus_loans (id, "applicantName", "applicantEmail", initials, amount, type, status, urgency, "assignedTo", date, purpose, "creditScore", "monthlyIncome", "durationMonths") VALUES
  ('#77281', 'Somchai V.', 'somchai@mail.com', 'SV', 12500, 'SME Loan', 'Approved', 'Normal', 2, '2026-05-28', 'Business expansion', 720, 6200, 24),
  ('#77295', 'Nguyen Khanh', 'nguyen@mail.com', 'NK', 45000, 'Housing', 'Review', 'Urgent', 2, '2026-05-29', 'House down payment', 685, 8500, 180),
  ('#771649', 'Demo Customer', 'customer@nexus.com', 'DC', 6999, 'Personal', 'Approved', 'Normal', 2, '2026-05-30', 'Home improvement', 767, 1000, 12),
  ('#772677', 'Demo Customer', 'customer@nexus.com', 'DC', 200, 'Personal', 'Approved', 'Normal', 2, '2026-05-30', 'Emergency expenses', 732, 1000, 12),
  ('#773239', 'Demo Customer', 'customer@nexus.com', 'DC', 5000, 'Personal', 'New', 'Normal', NULL, '2026-05-30', 'Test', 700, 4000, 12);

CREATE TABLE nexus_audit_logs (
  id SERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  "userId" INT REFERENCES nexus_users(id) ON DELETE SET NULL,
  "userEmail" TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE nexus_notifications (
  id SERIAL PRIMARY KEY,
  "userId" INT REFERENCES nexus_users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  time TEXT NOT NULL,
  unread BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed transactions
INSERT INTO nexus_transactions (id, title, date, amount, type, "userId") VALUES
  ('tx1', 'Repayment', 'Nov 28, 2023', -250, 'Repayment', 1),
  ('tx2', 'Loan Disbursement', 'Nov 15, 2023', 1200, 'Loan Disbursement', 1);

-- KHQR Transactions Table
CREATE TABLE nexus_khqr_transactions (
  id SERIAL PRIMARY KEY,
  reference_id TEXT UNIQUE NOT NULL,
  khqr_string TEXT NOT NULL,
  merchant_name TEXT NOT NULL,
  merchant_city TEXT DEFAULT 'Phnom Penh',
  currency TEXT NOT NULL DEFAULT '840',
  amount NUMERIC,
  bakong_account_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  transaction_id TEXT,
  deeplink TEXT,
  user_id INT REFERENCES nexus_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_khqr_reference_id ON nexus_khqr_transactions(reference_id);
CREATE INDEX idx_khqr_user_id ON nexus_khqr_transactions(user_id);
