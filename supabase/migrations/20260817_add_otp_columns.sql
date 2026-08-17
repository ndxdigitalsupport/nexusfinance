-- Add OTP columns to nexus_users for email verification (replaces Appwrite OTP)
-- Run this in Supabase SQL Editor

ALTER TABLE nexus_users ADD COLUMN IF NOT EXISTS otp_code TEXT DEFAULT NULL;
ALTER TABLE nexus_users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE nexus_users ADD COLUMN IF NOT EXISTS otp_verified_at TIMESTAMPTZ DEFAULT NULL;
