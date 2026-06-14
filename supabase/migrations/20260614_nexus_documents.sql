-- NexusFinance: KYC Document Storage
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS nexus_documents (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES nexus_users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_data TEXT NOT NULL, -- base64 encoded file
  doc_category TEXT DEFAULT 'other',
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_nexus_documents_user_id ON nexus_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_nexus_documents_uploaded_at ON nexus_documents(uploaded_at DESC);

-- RLS (Row Level Security) policies
ALTER TABLE nexus_documents ENABLE ROW LEVEL SECURITY;

-- Users can view their own documents
CREATE POLICY "Users can view own documents" ON nexus_documents
  FOR SELECT USING (auth.uid()::text = user_id::text OR auth.jwt() ->> 'role' = 'super-admin');

-- Users can insert their own documents
CREATE POLICY "Users can insert own documents" ON nexus_documents
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can delete their own documents (super-admin can delete any)
CREATE POLICY "Users can delete own documents" ON nexus_documents
  FOR DELETE USING (auth.uid()::text = user_id::text OR auth.jwt() ->> 'role' = 'super-admin');

-- Trigger to auto-set user_id from auth
CREATE OR REPLACE FUNCTION set_document_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := (auth.jwt() ->> 'sub')::int;
  NEW.user_email := auth.jwt() ->> 'email';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_set_document_user_id
  BEFORE INSERT ON nexus_documents
  FOR EACH ROW EXECUTE FUNCTION set_document_user_id();