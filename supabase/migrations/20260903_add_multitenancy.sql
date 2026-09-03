-- NexusFinance: Multi-Tenancy Migration
-- Adds tenant_id to all tables for SaaS multi-tenant support
-- Run this in Supabase SQL Editor

-- 1. CREATE NEW TABLES
CREATE TABLE IF NOT EXISTS nexus_tenants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT DEFAULT '',
  plan TEXT NOT NULL DEFAULT 'founding',
  max_users INT NOT NULL DEFAULT 999,
  max_loans INT NOT NULL DEFAULT 999,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nexus_tenant_members (
  id SERIAL PRIMARY KEY,
  tenant_id INT NOT NULL REFERENCES nexus_tenants(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES nexus_users(id) ON DELETE CASCADE,
  role_in_tenant TEXT NOT NULL DEFAULT 'member',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_members_user_id ON nexus_tenant_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant_id ON nexus_tenant_members(tenant_id);

-- 2. ADD tenant_id TO EXISTING TABLES
DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'nexus_users','nexus_loans','nexus_transactions','nexus_tasks',
    'nexus_config','nexus_audit_logs','nexus_notifications',
    'nexus_khqr_transactions','nexus_documents','nexus_payway_transactions',
    'nexus_reminder_settings','nexus_broadcasts','nexus_reminder_logs',
    'nexus_installments'
  ]) LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) THEN
      EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS tenant_id INT REFERENCES nexus_tenants(id)', tbl);
    END IF;
  END LOOP;
END $$;

-- 3. CREATE DEFAULT TENANT
INSERT INTO nexus_tenants (id, name, slug, plan, max_users, max_loans)
VALUES (1, 'Default Organization', 'default', 'founding', 999, 999)
ON CONFLICT (id) DO NOTHING;
SELECT setval('nexus_tenants_id_seq', GREATEST((SELECT MAX(id) FROM nexus_tenants), 1));

-- 4. BACKFILL ALL ROWS TO TENANT #1
DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'nexus_users','nexus_loans','nexus_transactions','nexus_tasks',
    'nexus_config','nexus_audit_logs','nexus_notifications',
    'nexus_khqr_transactions','nexus_documents','nexus_payway_transactions',
    'nexus_reminder_settings','nexus_broadcasts','nexus_reminder_logs',
    'nexus_installments'
  ]) LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) THEN
      EXECUTE format('UPDATE %I SET tenant_id = 1 WHERE tenant_id IS NULL', tbl);
    END IF;
  END LOOP;
END $$;

-- 5. MAKE tenant_id NOT NULL
DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'nexus_users','nexus_loans','nexus_transactions','nexus_tasks',
    'nexus_config','nexus_audit_logs','nexus_notifications',
    'nexus_khqr_transactions','nexus_documents','nexus_payway_transactions',
    'nexus_reminder_settings','nexus_broadcasts','nexus_reminder_logs',
    'nexus_installments'
  ]) LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) THEN
      EXECUTE format('ALTER TABLE %I ALTER COLUMN tenant_id SET NOT NULL', tbl);
    END IF;
  END LOOP;
END $$;

-- 6. REMOVE nexus_config SINGLETON CONSTRAINT
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'nexus_config_id_check' AND conrelid = 'nexus_config'::regclass) THEN
    ALTER TABLE nexus_config DROP CONSTRAINT nexus_config_id_check;
  END IF;
END $$;

-- 7. ADD INDEXES
DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'nexus_users','nexus_loans','nexus_transactions','nexus_tasks',
    'nexus_config','nexus_audit_logs','nexus_notifications',
    'nexus_khqr_transactions','nexus_documents','nexus_payway_transactions',
    'nexus_reminder_settings','nexus_broadcasts','nexus_reminder_logs',
    'nexus_installments'
  ]) LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) THEN
      EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_tenant_id ON %I(tenant_id)', tbl, tbl);
    END IF;
  END LOOP;
END $$;

-- DONE (no RLS — tenant isolation handled by backend queries)
