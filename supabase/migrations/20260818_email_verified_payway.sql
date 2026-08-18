-- NexusFinance: email verification flag + PayWay payment persistence
-- Run this in Supabase SQL Editor (idempotent)

-- Backwards-compatible: existing users default to verified so nobody is locked out.
-- New registrations insert email_verified = false and must verify before login.
ALTER TABLE nexus_users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT TRUE;

-- Persist PayWay transactions across server restarts
CREATE TABLE IF NOT EXISTS nexus_payway_transactions (
  id BIGSERIAL PRIMARY KEY,
  tran_id TEXT UNIQUE NOT NULL,
  email TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'PENDING',
  apv TEXT,
  loan_id TEXT,
  user_id INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payway_tran_id ON nexus_payway_transactions(tran_id);
CREATE INDEX IF NOT EXISTS idx_payway_user_id ON nexus_payway_transactions(user_id);