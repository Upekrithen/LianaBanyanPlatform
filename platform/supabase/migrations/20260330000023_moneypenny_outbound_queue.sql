-- ============================================================================
-- Migration: 20260330000023_moneypenny_outbound_queue.sql
-- Knight Session 191 / Bishop B050: MoneyPenny Outbound Queue
-- Connects Content Command Center to outreach pipeline
-- IDEMPOTENT: Safe to re-run (handles partial prior execution)
-- ============================================================================

-- Clean up partial state from any prior failed run
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'moneypenny_outbound' AND table_schema = 'public') THEN
    TRUNCATE moneypenny_outbound;
  END IF;
END $$;

-- =====================
-- PART A: moneypenny_outbound — queued outreach items
-- =====================
CREATE TABLE IF NOT EXISTS moneypenny_outbound (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_queue_id  uuid,        -- FK to helm_content_queue (when sourced from CCC)
  recipient_name    text NOT NULL,
  recipient_email   text,
  recipient_handle  text,        -- for social/DM outreach
  destination       text NOT NULL DEFAULT 'email'
    CHECK (destination IN ('email','social','press','physical','manual')),
  subject           text,
  body_preview      text,        -- first ~500 chars or summary
  cue_card_url      text,        -- link to their personalized cue card
  red_carpet_url    text,        -- their personalized Red Carpet landing URL
  wave              integer DEFAULT 1,
  priority          text DEFAULT 'normal'
    CHECK (priority IN ('urgent','high','normal','low')),
  status            text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued','approved','sending','sent','failed','skipped')),
  founder_notes     text,
  approved_at       timestamptz,
  sent_at           timestamptz,
  failed_reason     text,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE moneypenny_outbound ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users manage outbound"
  ON moneypenny_outbound FOR ALL
  USING (auth.role() = 'authenticated');

CREATE INDEX idx_mp_outbound_status ON moneypenny_outbound(status);
CREATE INDEX idx_mp_outbound_dest   ON moneypenny_outbound(destination);
CREATE INDEX idx_mp_outbound_wave   ON moneypenny_outbound(wave, priority);


-- =====================
-- PART B: Seed outbound queue from red_carpet_recipients
-- Every recipient gets an outbound record with their Red Carpet URL
-- =====================
INSERT INTO moneypenny_outbound (recipient_name, recipient_email, destination, subject, body_preview, red_carpet_url, wave, priority, status)
SELECT
  r.recipient_name,
  NULL,
  CASE
    WHEN r.walkthrough_type = 'creator' THEN 'social'
    WHEN r.walkthrough_type = 'media' THEN 'press'
    ELSE 'email'
  END,
  'Liana Banyan — ' || COALESCE(r.role_offered, 'Invitation'),
  LEFT(r.personalized_greeting, 500),
  CASE
    WHEN r.invite_code IS NOT NULL
      THEN 'https://lianabanyan.com/welcome/' || r.invite_code
    ELSE 'https://lianabanyan.com/RedCarpet'
  END,
  r.wave,
  CASE
    WHEN r.wave <= 2 THEN 'high'
    WHEN r.wave <= 4 THEN 'normal'
    ELSE 'low'
  END,
  'queued'
FROM red_carpet_recipients r
WHERE r.is_active = true
ON CONFLICT DO NOTHING;


-- =====================
-- PART C: Seed outbound queue for Instagram creators
-- =====================
INSERT INTO moneypenny_outbound (recipient_name, recipient_handle, destination, subject, body_preview, red_carpet_url, cue_card_url, wave, priority, status)
SELECT
  c.creator_name,
  c.creator_handle,
  'social',
  'Liana Banyan Creator Program — ' || c.creator_name,
  'You were selected for the Liana Banyan Creator Program. Keep 83.3% of everything you earn. $5/year membership.',
  'https://lianabanyan.com/welcome/creator/' || REPLACE(REPLACE(c.creator_handle, '@', ''), '.', ''),
  'https://lianabanyan.com/welcome/creator/' || REPLACE(REPLACE(c.creator_handle, '@', ''), '.', ''),
  3,
  'normal',
  'queued'
FROM creator_draft_picks c
WHERE c.status = 'undrafted'
ON CONFLICT DO NOTHING;


-- =====================
-- PART D: Seed personalized cue cards into helm_content_queue
-- One cue card per DISTINCT recipient (some have multiple domain rows)
-- =====================
INSERT INTO helm_content_queue (slug, title, content_type, destination, recipient_name, status, priority, wave, tags)
SELECT DISTINCT ON (recipient_name)
  'cue-card-' || LOWER(REPLACE(REPLACE(r.recipient_name, ' ', '-'), '''', '')),
  r.recipient_name || ' — Cue Card',
  'cue_card',
  CASE
    WHEN r.walkthrough_type = 'creator' THEN 'social'
    WHEN r.walkthrough_type = 'media' THEN 'press'
    ELSE 'physical'
  END,
  r.recipient_name,
  'draft',
  CASE WHEN r.wave <= 2 THEN 1 ELSE 3 END,
  r.wave,
  ARRAY['cue_card', 'outreach', COALESCE(r.walkthrough_type, 'crown')]
FROM red_carpet_recipients r
WHERE r.is_active = true
ORDER BY r.recipient_name, r.wave
ON CONFLICT (slug) DO NOTHING;


-- =====================
-- PART E: Seed cue cards for Instagram creators
-- =====================
INSERT INTO helm_content_queue (slug, title, content_type, destination, recipient_name, status, priority, wave, tags)
SELECT
  'cue-card-creator-' || REPLACE(REPLACE(c.creator_handle, '@', ''), '.', '-'),
  c.creator_name || ' — Creator Cue Card',
  'cue_card',
  'social',
  c.creator_name,
  'draft',
  3,
  3,
  ARRAY['cue_card', 'creator', 'instagram']
FROM creator_draft_picks c
WHERE c.status = 'undrafted'
ON CONFLICT (slug) DO NOTHING;
