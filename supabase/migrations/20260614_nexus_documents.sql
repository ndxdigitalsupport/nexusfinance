-- NexusFinance: KYC Document Storage (idempotent)
-- Run in Supabase SQL Editor

-- Create table if not exists
CREATE TABLE IF NOT EXISTS nexus_documents (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  user_email TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_data TEXT NOT NULL,
  doc_category TEXT DEFAULT 'other',
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'nexus_documents_user_id_fkey'
    AND table_name = 'nexus_documents'
  ) THEN
    ALTER TABLE nexus_documents
      ADD CONSTRAINT nexus_documents_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES nexus_users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_nexus_documents_user_id ON nexus_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_nexus_documents_uploaded_at ON nexus_documents(uploaded_at DESC);

-- RLS
ALTER TABLE nexus_documents ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own documents" ON nexus_documents;
CREATE POLICY "Users can view own documents" ON nexus_documents
  FOR SELECT USING (auth.uid()::text = user_id::text OR auth.jwt() ->> 'role' = 'super-admin');

DROP POLICY IF EXISTS "Users can insert own documents" ON nexus_documents;
CREATE POLICY "Users can insert own documents" ON nexus_documents
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete own documents" ON nexus_documents;
CREATE POLICY "Users can delete own documents" ON nexus_documents
  FOR DELETE USING (auth.uid()::text = user_id::text OR auth.jwt() ->> 'role' = 'super-admin');

-- Trigger function
CREATE OR REPLACE FUNCTION set_document_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := (auth.jwt() ->> 'sub')::int;
  NEW.user_email := auth.jwt() ->> 'email';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS trigger_set_document_user_id ON nexus_documents;
CREATE TRIGGER trigger_set_document_user_id
  BEFORE INSERT ON nexus_documents
  FOR EACH ROW EXECUTE FUNCTION set_document_user_id();