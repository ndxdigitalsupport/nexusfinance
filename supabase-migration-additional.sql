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
  ('7 Days Before', 7, '🔔 Upcoming Installment Payment

Dear {customer_name}, this is a reminder for your upcoming loan installment.

📊 LOAN DETAILS
━━━━━━━━━━━━━━━━━━
🆔 Loan ID: #{loan_id}
💰 Amount Due: {amount}
📅 Due Date: {due_date}
⏳ Time Left: {days_remaining} days

Thank you for choosing Nexus Finance. Please ensure your wallet has sufficient funds to avoid any late payment penalties.', 'both', true),
  ('3 Days Before', 3, '🔔 Upcoming Installment Payment

Dear {customer_name}, this is a reminder for your upcoming loan installment.

📊 LOAN DETAILS
━━━━━━━━━━━━━━━━━━
🆔 Loan ID: #{loan_id}
💰 Amount Due: {amount}
📅 Due Date: {due_date}
⏳ Time Left: {days_remaining} days

Thank you for choosing Nexus Finance. Please ensure your wallet has sufficient funds to avoid any late payment penalties.', 'both', true),
  ('1 Day Before', 1, '🔔 Upcoming Installment Payment

Dear {customer_name}, this is a reminder for your upcoming loan installment.

📊 LOAN DETAILS
━━━━━━━━━━━━━━━━━━
🆔 Loan ID: #{loan_id}
💰 Amount Due: {amount}
📅 Due Date: {due_date}
⏳ Time Left: {days_remaining} days

Thank you for choosing Nexus Finance. Please ensure your wallet has sufficient funds to avoid any late payment penalties.', 'both', true),
  ('Due Today', 0, '🚨 Installment Due Today

Dear {customer_name}, your loan installment payment is due today.

📊 LOAN DETAILS
━━━━━━━━━━━━━━━━━━
🆔 Loan ID: #{loan_id}
💰 Amount Due: {amount}
📅 Due Date: Today, {due_date}

Please ensure payment is completed today to maintain a healthy credit score.', 'both', true),
  ('Overdue Payment', -1, '⚠️ Overdue Payment Warning

Dear {customer_name}, your loan installment payment is currently overdue.

📊 LOAN DETAILS
━━━━━━━━━━━━━━━━━━
🆔 Loan ID: #{loan_id}
💰 Amount Due: {amount}
📅 Due Date: {due_date}
🚨 Delay: {days_overdue} days overdue

Please complete your payment immediately to avoid additional penalties or negative credit impact.', 'both', true);
