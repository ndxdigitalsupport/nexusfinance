-- SQL Migration: Add SMS Gateway Configurations to nexus_config
ALTER TABLE nexus_config ADD COLUMN IF NOT EXISTS sms_gateway TEXT NOT NULL DEFAULT 'sandbox';
ALTER TABLE nexus_config ADD COLUMN IF NOT EXISTS twilio_account_sid TEXT;
ALTER TABLE nexus_config ADD COLUMN IF NOT EXISTS twilio_auth_token TEXT;
ALTER TABLE nexus_config ADD COLUMN IF NOT EXISTS twilio_phone_number TEXT;
ALTER TABLE nexus_config ADD COLUMN IF NOT EXISTS vonage_api_key TEXT;
ALTER TABLE nexus_config ADD COLUMN IF NOT EXISTS vonage_api_secret TEXT;
ALTER TABLE nexus_config ADD COLUMN IF NOT EXISTS vonage_from_number TEXT;
ALTER TABLE nexus_config ADD COLUMN IF NOT EXISTS custom_sms_url TEXT;
