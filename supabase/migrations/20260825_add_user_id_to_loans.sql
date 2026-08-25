-- Add user_id to nexus_loans so loans are tied to the user record, not just email.
-- This prevents ghost loans when a user is deleted and recreated with the same phone/email.

ALTER TABLE nexus_loans ADD COLUMN user_id INT REFERENCES nexus_users(id) ON DELETE SET NULL;

-- Backfill existing loans by matching applicantEmail to nexus_users.email
UPDATE nexus_loans l
SET user_id = u.id
FROM nexus_users u
WHERE l."applicantEmail" = u.email
  AND l.user_id IS NULL;

-- Create an index for fast lookups
CREATE INDEX idx_nexus_loans_user_id ON nexus_loans(user_id);
