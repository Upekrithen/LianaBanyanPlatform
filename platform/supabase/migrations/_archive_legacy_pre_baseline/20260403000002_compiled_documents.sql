CREATE TABLE IF NOT EXISTS compiled_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  family_name TEXT NOT NULL,
  section TEXT,
  category TEXT,
  section_librarian INTEGER,
  compiled_markdown TEXT,
  source_count INTEGER DEFAULT 0,
  source_files JSONB DEFAULT '[]'::jsonb,
  unique_variants INTEGER DEFAULT 0,
  compilation_notes TEXT,
  compiled_by TEXT,
  compiled_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'reviewed', 'canonical', 'superseded')),
  supersedes TEXT[],
  superseded_by TEXT,
  founder_corrections_applied TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE compiled_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read compiled_documents" ON compiled_documents;
CREATE POLICY "Public read compiled_documents"
  ON compiled_documents
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Auth insert compiled_documents" ON compiled_documents;
CREATE POLICY "Auth insert compiled_documents"
  ON compiled_documents
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Auth update compiled_documents" ON compiled_documents;
CREATE POLICY "Auth update compiled_documents"
  ON compiled_documents
  FOR UPDATE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_compiled_documents_family ON compiled_documents (family_name);
CREATE INDEX IF NOT EXISTS idx_compiled_documents_section ON compiled_documents (section);
CREATE INDEX IF NOT EXISTS idx_compiled_documents_status ON compiled_documents (status);
