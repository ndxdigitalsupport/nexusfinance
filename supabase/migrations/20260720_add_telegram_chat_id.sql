-- Add telegram_chat_id to nexus_users for Telegram bot linking
-- Run this in Supabase SQL Editor

ALTER TABLE nexus_users ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT DEFAULT NULL;

-- Create index for faster lookups by telegram_chat_id
CREATE INDEX IF NOT EXISTS idx_users_telegram_chat_id ON nexus_users(telegram_chat_id);
