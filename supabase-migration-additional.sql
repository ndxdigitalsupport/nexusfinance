-- Create reminder settings table
CREATE TABLE IF NOT EXISTS nexus_reminder_settings (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  days_before INT NOT NULL,
  message_template TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  channel TEXT NOT NULL DEFAULT 'both', -- 'telegram', 'in_app', 'both'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create broadcast history table
CREATE TABLE IF NOT EXISTS nexus_broadcasts (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'both', -- 'telegram', 'in_app', 'both'
  target TEXT NOT NULL DEFAULT 'all', -- 'all', 'linked', 'role:customer'
  sent_by INT REFERENCES nexus_users(id) ON DELETE SET NULL,
  sent_count INT NOT NULL DEFAULT 0,
  failed_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default reminder settings
INSERT INTO nexus_reminder_settings (name, days_before, message_template, channel, is_active) VALUES
  ('7 Days Before', 7, '⏰ *Payment Reminder*

Loan #{loan_id} — {amount} installment
📅 Due: {due_date}
⏳ *{days_remaining} days remaining*

Please make your payment on time to avoid late fees.', 'both', true),
  ('3 Days Before', 3, '⏰ *Payment Reminder*

Loan #{loan_id} — {amount} installment
📅 Due: {due_date}
⏳ *{days_remaining} days remaining*

Please make your payment on time to avoid late fees.', 'both', true),
  ('1 Day Before', 1, '⏰ *Payment Reminder*

Loan #{loan_id} — {amount} installment
📅 Due: {due_date}
⏳ *{days_remaining} days remaining*

Please make your payment on time to avoid late fees.', 'both', true),
  ('Due Today', 0, '🔴 *PAYMENT DUE TODAY*

Loan #{loan_id} — {amount} installment
Your payment is due today. Please pay now to avoid late fees.', 'both', true),
  ('Overdue Payment', -1, '🚨 *OVERDUE PAYMENT*

Loan #{loan_id} — {amount} installment
Due date: {due_date}
⚠️ *{days_overdue} days overdue*

Please make your payment as soon as possible.', 'both', true);
