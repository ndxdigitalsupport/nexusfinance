-- Migration: Add emailVerificationRequired to nexus_config
ALTER TABLE nexus_config ADD COLUMN IF NOT EXISTS "emailVerificationRequired" BOOLEAN NOT NULL DEFAULT true;
