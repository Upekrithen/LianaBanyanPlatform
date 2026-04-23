-- Helm Content Command Center
-- K190: Master registry of ALL outbound content with Founder review workflow

CREATE TABLE IF NOT EXISTS helm_content_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN (
    'crown_letter', 'outreach_letter', 'academic_letter', 'blessing_letter',
    'sponsorship_letter', 'patron_letter', 'political_letter',
    'academic_paper', 'pudding_essay', 'cephas_article', 'cue_card',
    'publication_pitch', 'media_post', 'press_material', 'partnership_letter',
    'social_dispatch', 'red_carpet_config'
  )),

  -- Content
  content_markdown TEXT,
  source_file_path TEXT,

  -- Destination
  destination TEXT NOT NULL DEFAULT 'review',
  recipient_name TEXT,
  recipient_email TEXT,
  recipient_handle TEXT,

  -- Scheduling
  send_when TEXT DEFAULT 'opening_gambit',
  send_frequency TEXT,
  send_format TEXT DEFAULT 'digital',

  -- Review workflow
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'in_review', 'approved', 'rejected', 'sent', 'published', 'archived'
  )),
  founder_reviewed BOOLEAN DEFAULT false,
  founder_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,

  -- Metadata
  tags TEXT[],
  priority INTEGER DEFAULT 5,
  wave INTEGER,
  attachments JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE helm_content_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read content queue"
  ON helm_content_queue FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update content queue"
  ON helm_content_queue FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert content queue"
  ON helm_content_queue FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Service role full access content queue"
  ON helm_content_queue FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX idx_helm_content_status ON helm_content_queue(status);
CREATE INDEX idx_helm_content_type ON helm_content_queue(content_type);
CREATE INDEX idx_helm_content_wave ON helm_content_queue(wave);
CREATE INDEX idx_helm_content_priority ON helm_content_queue(priority);
