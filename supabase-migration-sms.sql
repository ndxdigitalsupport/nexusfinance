-- SQL Migration: Add Twilio SMS configurations to nexus_config
ALTER TABLE nexus_config ADD COLUMN IF NOT EXISTS twilio_account_sid TEXT;
ALTER TABLE nexus_config ADD COLUMN IF NOT EXISTS twilio_auth_token TEXT;
ALTER TABLE nexus_config ADD COLUMN IF NOT EXISTS twilio_phone_number TEXT;
