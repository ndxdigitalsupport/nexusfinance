-- NexusFinance: Multi-Tenancy Migration
-- Adds tenant_id to all tables for SaaS multi-tenant support
-- Run this in Supabase SQL Editor

-- ============================================================
-- 1. CREATE NEW TABLES
-- ============================================================

-- Tenant (company/organization) table
CREATE TABLE IF NOT EXISTS nexus_tenants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT DEFAULT '',
  plan TEXT NOT NULL DEFAULT 'founding', -- founding, basic, standard, premium
  max_users INT NOT NULL DEFAULT 999,
  max_loans INT NOT NULL DEFAULT 999,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tenant membership table (links users to tenants)
CREATE TABLE IF NOT EXISTS nexus_tenant_members (
  id SERIAL PRIMARY KEY,
  tenant_id INT NOT NULL REFERENCES nexus_tenants(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES nexus_users(id) ON DELETE CASCADE,
  role_in_tenant TEXT NOT NULL DEFAULT 'member', -- owner, admin, staff, member
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_members_user_id ON nexus_tenant_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant_id ON nexus_tenant_members(tenant_id);

-- ============================================================
-- 2. ADD tenant_id TO ALL EXISTING TABLES
-- ============================================================

-- nexus_users
ALTER TABLE nexus_users ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES nexus_tenants(id);

-- nexus_loans
ALTER TABLE nexus_loans ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES nexus_tenants(id);

-- nexus_transactions
ALTER TABLE nexus_transactions ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES nexus_tenants(id);

-- nexus_tasks
ALTER TABLE nexus_tasks ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES nexus_tenants(id);

-- nexus_config
ALTER TABLE nexus_config ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES nexus_tenants(id);

-- nexus_audit_logs
ALTER TABLE nexus_audit_logs ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES nexus_tenants(id);

-- nexus_notifications
ALTER TABLE nexus_notifications ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES nexus_tenants(id);

-- nexus_khqr_transactions
ALTER TABLE nexus_khqr_transactions ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES nexus_tenants(id);

-- nexus_documents
ALTER TABLE nexus_documents ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES nexus_tenants(id);

-- nexus_payway_transactions
ALTER TABLE nexus_payway_transactions ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES nexus_tenants(id);

-- nexus_reminder_settings
ALTER TABLE nexus_reminder_settings ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES nexus_tenants(id);

-- nexus_broadcasts
ALTER TABLE nexus_broadcasts ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES nexus_tenants(id);

-- nexus_reminder_logs
ALTER TABLE nexus_reminder_logs ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES nexus_tenants(id);

-- nexus_installments (via loan's tenant)
ALTER TABLE nexus_installments ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES nexus_tenants(id);

-- ============================================================
-- 3. CREATE DEFAULT TENANT (tenant #1)
-- ============================================================

INSERT INTO nexus_tenants (id, name, slug, plan, max_users, max_loans)
VALUES (1, 'Default Organization', 'default', 'founding', 999, 999)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence to 2 so next tenant gets id=2
SELECT setval('nexus_tenants_id_seq', GREATEST((SELECT MAX(id) FROM nexus_tenants), 1));

-- ============================================================
-- 4. BACKFILL ALL EXISTING ROWS TO TENANT #1
-- ============================================================

UPDATE nexus_users SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE nexus_loans SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE nexus_transactions SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE nexus_tasks SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE nexus_config SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE nexus_audit_logs SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE nexus_notifications SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE nexus_khqr_transactions SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE nexus_documents SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE nexus_payway_transactions SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE nexus_reminder_settings SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE nexus_broadcasts SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE nexus_reminder_logs SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE nexus_installments SET tenant_id = 1 WHERE tenant_id IS NULL;

-- ============================================================
-- 5. MAKE tenant_id NOT NULL (after backfill)
-- ============================================================

ALTER TABLE nexus_users ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE nexus_loans ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE nexus_transactions ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE nexus_tasks ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE nexus_config ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE nexus_audit_logs ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE nexus_notifications ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE nexus_khqr_transactions ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE nexus_documents ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE nexus_payway_transactions ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE nexus_reminder_settings ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE nexus_broadcasts ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE nexus_reminder_logs ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE nexus_installments ALTER COLUMN tenant_id SET NOT NULL;

-- ============================================================
-- 6. REMOVE nexus_config SINGLETON CONSTRAINT
-- ============================================================

-- Drop the CHECK (id = 1) constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'nexus_config_id_check'
    AND conrelid = 'nexus_config'::regclass
  ) THEN
    ALTER TABLE nexus_config DROP CONSTRAINT nexus_config_id_check;
  END IF;
END $$;

-- ============================================================
-- 7. ADD INDEXES FOR TENANT QUERIES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON nexus_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_loans_tenant_id ON nexus_loans(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_id ON nexus_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tasks_tenant_id ON nexus_tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_config_tenant_id ON nexus_config(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON nexus_audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON nexus_notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_khqr_tenant_id ON nexus_khqr_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_tenant_id ON nexus_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payway_tenant_id ON nexus_payway_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reminder_settings_tenant_id ON nexus_reminder_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_broadcasts_tenant_id ON nexus_broadcasts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_tenant_id ON nexus_reminder_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_installments_tenant_id ON nexus_installments(tenant_id);

-- ============================================================
-- 8. ENABLE ROW-LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE nexus_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_khqr_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_payway_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_reminder_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_tenant_members ENABLE ROW LEVEL SECURITY;

-- Force RLS (even table owners are subject to policies)
ALTER TABLE nexus_users FORCE ROW LEVEL SECURITY;
ALTER TABLE nexus_loans FORCE ROW LEVEL SECURITY;
ALTER TABLE nexus_transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE nexus_tasks FORCE ROW LEVEL SECURITY;
ALTER TABLE nexus_config FORCE ROW LEVEL SECURITY;
ALTER TABLE nexus_audit_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE nexus_notifications FORCE ROW LEVEL SECURITY;
ALTER TABLE nexus_khqr_transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE nexus_documents FORCE ROW LEVEL SECURITY;
ALTER TABLE nexus_payway_transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE nexus_reminder_settings FORCE ROW LEVEL SECURITY;
ALTER TABLE nexus_broadcasts FORCE ROW LEVEL SECURITY;
ALTER TABLE nexus_reminder_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE nexus_installments FORCE ROW LEVEL SECURITY;
ALTER TABLE nexus_tenants FORCE ROW LEVEL SECURITY;
ALTER TABLE nexus_tenant_members FORCE ROW LEVEL SECURITY;

-- ============================================================
-- 9. CREATE RLS POLICIES
-- ============================================================

-- Helper: check if user belongs to a tenant
CREATE OR REPLACE FUNCTION user_belongs_to_tenant(tenant_id INT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM nexus_tenant_members
    WHERE user_id = (auth.jwt() ->> 'sub')::int
    AND tenant_id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tenant policies (super-admin can see all, others see their own)
DROP POLICY IF EXISTS "tenant_isolation" ON nexus_tenants;
CREATE POLICY "tenant_isolation" ON nexus_tenants
  FOR ALL USING (
    (auth.jwt() ->> 'role') = 'super-admin'
    OR id = (auth.jwt() ->> 'tenant_id')::int
  );

-- Tenant members policies
DROP POLICY IF EXISTS "tenant_members_isolation" ON nexus_tenant_members;
CREATE POLICY "tenant_members_isolation" ON nexus_tenant_members
  FOR ALL USING (
    (auth.jwt() ->> 'role') = 'super-admin'
    OR tenant_id = (auth.jwt() ->> 'tenant_id')::int
  );

-- Data table policies (all use same pattern: tenant_id match or super-admin)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'nexus_users', 'nexus_loans', 'nexus_transactions', 'nexus_tasks',
      'nexus_config', 'nexus_audit_logs', 'nexus_notifications',
      'nexus_khqr_transactions', 'nexus_documents', 'nexus_payway_transactions',
      'nexus_reminder_settings', 'nexus_broadcasts', 'nexus_reminder_logs',
      'nexus_installments'
    ])
  LOOP
    -- Drop existing policies if any
    EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation" ON %I', tbl);
    -- Create tenant isolation policy
    EXECUTE format(
      'CREATE POLICY "tenant_isolation" ON %I
       FOR ALL USING (
         (auth.jwt() ->> ''role'') = ''super-admin''
         OR tenant_id = (auth.jwt() ->> ''tenant_id'')::int
       )', tbl
    );
  END LOOP;
END $$;

-- ============================================================
-- DONE
-- ============================================================
