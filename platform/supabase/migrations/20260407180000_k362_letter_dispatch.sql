-- K362: Letter Dispatch Queue — Opening Gambit Pipeline
-- Session: K362 / B086 | April 7, 2026
-- Founder MUST lock each letter before it can be queued — NO auto-send

CREATE TABLE IF NOT EXISTS letter_dispatch_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_name TEXT NOT NULL,
  recipient_email TEXT,
  recipient_org TEXT,
  recipient_slug TEXT,

  phase INTEGER NOT NULL CHECK (phase BETWEEN 1 AND 4),
  wave_position INTEGER DEFAULT 0,
  dispatch_method TEXT DEFAULT 'email' CHECK (dispatch_method IN ('email', 'physical', 'both')),

  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'locked', 'queued', 'sent', 'delivered', 'bounced', 'responded'
  )),
  locked_at TIMESTAMPTZ,
  locked_by UUID REFERENCES auth.users(id),
  queued_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  response_received_at TIMESTAMPTZ,

  subject_line TEXT,
  custom_intro TEXT,
  letter_body TEXT,
  red_carpet_slug TEXT,
  letter_category TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,

  email_message_id TEXT,
  open_tracked BOOLEAN DEFAULT false,
  click_tracked BOOLEAN DEFAULT false,

  response_category TEXT CHECK (response_category IN (
    'interested', 'meeting_request', 'declined', 'forwarded', 'no_response', NULL
  )),
  response_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ldq_phase ON letter_dispatch_queue(phase, wave_position);
CREATE INDEX idx_ldq_status ON letter_dispatch_queue(status);
CREATE INDEX idx_ldq_recipient_slug ON letter_dispatch_queue(recipient_slug);

ALTER TABLE letter_dispatch_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY ldq_admin_all ON letter_dispatch_queue
  FOR ALL USING (public.is_admin());

CREATE OR REPLACE FUNCTION update_ldq_timestamp()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER ldq_updated_at
  BEFORE UPDATE ON letter_dispatch_queue
  FOR EACH ROW EXECUTE FUNCTION update_ldq_timestamp();

-- Rate limiting table for letter sends
CREATE TABLE IF NOT EXISTS letter_send_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_id UUID REFERENCES letter_dispatch_queue(id),
  sent_at TIMESTAMPTZ DEFAULT now(),
  email_message_id TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT
);

ALTER TABLE letter_send_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY lsl_admin_all ON letter_send_log
  FOR ALL USING (public.is_admin());

-- Seed from red_carpet_registry: map categories to phases
-- Phase 1: Crown + Academics (first wave — people who already know the vision)
-- Phase 2: Media + Investors (industry reach)
-- Phase 3: Partnerships + Political (institutional)
-- Phase 4: Blessing + Pitches (patron outreach)
INSERT INTO letter_dispatch_queue (
  recipient_name, recipient_email, recipient_org, recipient_slug,
  phase, wave_position, subject_line, red_carpet_slug, letter_category, status
)
SELECT
  r.name,
  CASE WHEN array_length(r.known_emails, 1) > 0 THEN r.known_emails[1] ELSE NULL END,
  r.organization,
  r.slug,
  CASE
    WHEN 'crown' = ANY(r.categories) THEN 1
    WHEN 'academic' = ANY(r.categories) THEN 1
    WHEN 'media' = ANY(r.categories) THEN 2
    WHEN 'investor' = ANY(r.categories) THEN 2
    WHEN 'partnership' = ANY(r.categories) THEN 3
    WHEN 'political' = ANY(r.categories) THEN 3
    ELSE 4
  END,
  ROW_NUMBER() OVER (
    PARTITION BY CASE
      WHEN 'crown' = ANY(r.categories) THEN 1
      WHEN 'academic' = ANY(r.categories) THEN 1
      WHEN 'media' = ANY(r.categories) THEN 2
      WHEN 'investor' = ANY(r.categories) THEN 2
      WHEN 'partnership' = ANY(r.categories) THEN 3
      WHEN 'political' = ANY(r.categories) THEN 3
      ELSE 4
    END
    ORDER BY r.created_at
  ),
  'A personal letter from the Founder of Liana Banyan — for ' || r.name,
  r.slug,
  COALESCE(r.category_label, r.categories[1], 'general'),
  'draft'
FROM red_carpet_registry r
WHERE r.is_active = true
ON CONFLICT DO NOTHING;
