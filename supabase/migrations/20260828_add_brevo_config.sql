-- Add Brevo SMS settings columns to platform config table
ALTER TABLE public.nexus_config 
ADD COLUMN IF NOT EXISTS brevo_api_key TEXT,
ADD COLUMN IF NOT EXISTS brevo_sender_name TEXT;
