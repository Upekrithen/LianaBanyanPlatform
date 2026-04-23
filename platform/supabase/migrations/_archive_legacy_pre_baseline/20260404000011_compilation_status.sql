CREATE TABLE IF NOT EXISTS compilation_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name TEXT NOT NULL UNIQUE,
  section TEXT,
  variant_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'compiled', 'skipped', 'needs_review')),
  compiled_document_id UUID REFERENCES compiled_documents(id) ON DELETE SET NULL,
  assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_compilation_status_status
  ON compilation_status (status);

CREATE INDEX IF NOT EXISTS idx_compilation_status_section
  ON compilation_status (section);

ALTER TABLE compilation_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read compilation_status" ON compilation_status;
CREATE POLICY "Public read compilation_status"
  ON compilation_status
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Auth write compilation_status" ON compilation_status;
CREATE POLICY "Auth write compilation_status"
  ON compilation_status
  FOR ALL
  USING (true)
  WITH CHECK (true);
