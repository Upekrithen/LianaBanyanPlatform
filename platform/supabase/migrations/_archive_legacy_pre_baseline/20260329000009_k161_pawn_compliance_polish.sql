-- K161: Pawn Compliance Polish
-- FL FDUTPA compliance monitor + participant_state + guild article clarification

-- ─── FL Compliance Monitor ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fl_compliance_monitor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_id UUID REFERENCES member_scheduled_posts(id),
  platform TEXT NOT NULL,
  content_preview TEXT,
  flagged_words TEXT[],
  disclosure_present BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'clean', 'flagged', 'remediated')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE fl_compliance_monitor ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage compliance" ON fl_compliance_monitor
  FOR ALL USING (public.is_admin());

CREATE INDEX idx_fl_compliance_status ON fl_compliance_monitor(status);
CREATE INDEX idx_fl_compliance_dispatch ON fl_compliance_monitor(dispatch_id);

-- ─── Participant State on Challenge Completions ─────────────────────────────
ALTER TABLE challenge_completions
  ADD COLUMN IF NOT EXISTS participant_state TEXT DEFAULT 'member'
    CHECK (participant_state IN ('member', 'guest', 'anonymous'));

-- ─── Guild Article Clarification ────────────────────────────────────────────
UPDATE cephas_content_registry
  SET content_markdown = REPLACE(
    content_markdown,
    'A Guild is your professional crew on Liana Banyan.',
    'A Guild is your professional crew on Liana Banyan. A member may belong to one Guild at a time (professional focus) but many Tribes simultaneously (personal connections).'
  ),
  updated_at = now()
  WHERE slug = 'why-start-a-guild'
    AND content_markdown LIKE '%A Guild is your professional crew on Liana Banyan.%';
