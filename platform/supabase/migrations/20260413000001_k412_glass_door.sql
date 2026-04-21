-- K412 Glass Door Phase 2 — Member-Voted Outreach Dispatch
-- Innovation #2262 The Glass Door (Bishop B099)
-- Composes with #2238 TouchStone (vote-as-predicate gate)

CREATE TABLE IF NOT EXISTS outreach_letters (
  letter_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  recipient_name TEXT NOT NULL,
  recipient_category TEXT NOT NULL
    CHECK (recipient_category IN (
      'crown_letter', 'research_invitation', 'press_pitch',
      'partnership_ask', 'patron_outreach', 'media_pitch',
      'follow_up', 'apology', 'other'
    )),
  recipient_tier SMALLINT DEFAULT 5,
  state TEXT NOT NULL DEFAULT 'draft'
    CHECK (state IN (
      'draft', 'proposed', 'scheduled', 'dispatched',
      'acknowledged', 'answered', 'no_response', 'withdrawn', 'retracted'
    )),
  full_text TEXT NOT NULL,
  substantive_summary TEXT,
  what_we_are_asking TEXT NOT NULL,
  what_we_are_not_asking TEXT,
  why_this_recipient TEXT,
  source_letter_file TEXT,
  source_innovation_refs INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  scheduled_dispatch TIMESTAMPTZ,
  dispatched_at TIMESTAMPTZ,
  voting_mode TEXT NOT NULL DEFAULT 'advisory'
    CHECK (voting_mode IN ('advisory', 'binding')),
  voting_window_start TIMESTAMPTZ,
  voting_window_end TIMESTAMPTZ,
  vote_threshold_approval_pct NUMERIC DEFAULT 60.0,
  vote_threshold_veto_pct NUMERIC DEFAULT 10.0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_outreach_letters_state ON outreach_letters (state);
CREATE INDEX idx_outreach_letters_scheduled ON outreach_letters (scheduled_dispatch) WHERE state = 'scheduled';
CREATE INDEX idx_outreach_letters_slug ON outreach_letters (slug);

CREATE TABLE IF NOT EXISTS outreach_letter_votes (
  vote_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id UUID NOT NULL REFERENCES outreach_letters(letter_id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL
    CHECK (vote_type IN ('approve', 'request_edit', 'delay', 'redirect', 'veto', 'abstain')),
  comment TEXT,
  proposed_edit TEXT,
  proposed_delay_days INTEGER,
  proposed_redirect_recipient TEXT,
  voted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (letter_id, member_id)
);

CREATE INDEX idx_outreach_votes_letter ON outreach_letter_votes (letter_id);
CREATE INDEX idx_outreach_votes_member ON outreach_letter_votes (member_id);

CREATE TABLE IF NOT EXISTS outreach_letter_responses (
  response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id UUID NOT NULL REFERENCES outreach_letters(letter_id) ON DELETE CASCADE,
  response_received_at TIMESTAMPTZ NOT NULL,
  response_summary TEXT NOT NULL,
  response_full_text_redacted TEXT,
  response_classifier TEXT
    CHECK (response_classifier IN (
      'positive', 'neutral', 'declined', 'asked_followup', 'no_substantive', 'hostile', 'other'
    )),
  platform_downstream_action TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  recorded_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_outreach_responses_letter ON outreach_letter_responses (letter_id);

CREATE TABLE IF NOT EXISTS outreach_letter_retractions (
  retraction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id UUID NOT NULL REFERENCES outreach_letters(letter_id) ON DELETE CASCADE,
  proposed_at TIMESTAMPTZ DEFAULT now(),
  proposed_by UUID REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  vote_threshold_pct NUMERIC DEFAULT 50.0,
  state TEXT NOT NULL DEFAULT 'proposed'
    CHECK (state IN ('proposed', 'approved', 'rejected', 'executed')),
  apology_text TEXT,
  executed_at TIMESTAMPTZ
);

-- Vote tally function: governance verdict computation
CREATE OR REPLACE FUNCTION compute_outreach_letter_verdict(p_letter_id UUID)
RETURNS TABLE(
  total_votes INTEGER,
  approve_count INTEGER,
  veto_count INTEGER,
  approval_pct NUMERIC,
  veto_pct NUMERIC,
  verdict TEXT,
  next_action TEXT
) AS $$
DECLARE
  v_letter outreach_letters%ROWTYPE;
  v_total INTEGER;
  v_approve INTEGER;
  v_veto INTEGER;
  v_approval_pct NUMERIC;
  v_veto_pct NUMERIC;
  v_verdict TEXT;
  v_next_action TEXT;
BEGIN
  SELECT * INTO v_letter FROM outreach_letters WHERE letter_id = p_letter_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'letter not found';
  END IF;

  SELECT COUNT(*),
         COUNT(*) FILTER (WHERE vote_type = 'approve'),
         COUNT(*) FILTER (WHERE vote_type = 'veto')
    INTO v_total, v_approve, v_veto
    FROM outreach_letter_votes
    WHERE letter_id = p_letter_id;

  IF v_total = 0 THEN
    v_approval_pct := 0;
    v_veto_pct := 0;
    v_verdict := 'no_votes';
    v_next_action := 'awaiting_votes';
  ELSE
    v_approval_pct := (v_approve::NUMERIC / v_total) * 100;
    v_veto_pct := (v_veto::NUMERIC / v_total) * 100;

    IF v_veto_pct >= v_letter.vote_threshold_veto_pct THEN
      v_verdict := 'vetoed';
      v_next_action := 'block_dispatch';
    ELSIF v_approval_pct >= v_letter.vote_threshold_approval_pct THEN
      v_verdict := 'approved';
      v_next_action := 'authorize_dispatch';
    ELSE
      v_verdict := 'pending';
      v_next_action := 'awaiting_more_votes';
    END IF;
  END IF;

  RETURN QUERY SELECT v_total, v_approve, v_veto, v_approval_pct, v_veto_pct, v_verdict, v_next_action;
END;
$$ LANGUAGE plpgsql STABLE;

-- RLS: anyone can read non-draft letters; Bishop/Founder can write
ALTER TABLE outreach_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY outreach_letters_public_read ON outreach_letters FOR SELECT
  USING (state != 'draft');
CREATE POLICY outreach_letters_bishop_write ON outreach_letters FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email IN (
      'jonathan@lianabanyan.com', 'bishop@lianabanyan.com'
    )
  ));

ALTER TABLE outreach_letter_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY outreach_votes_public_read ON outreach_letter_votes FOR SELECT USING (true);
CREATE POLICY outreach_votes_member_insert ON outreach_letter_votes FOR INSERT
  WITH CHECK (auth.uid() = member_id);
CREATE POLICY outreach_votes_member_update ON outreach_letter_votes FOR UPDATE
  USING (auth.uid() = member_id);

ALTER TABLE outreach_letter_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY outreach_responses_public_read ON outreach_letter_responses FOR SELECT USING (true);

ALTER TABLE outreach_letter_retractions ENABLE ROW LEVEL SECURITY;
CREATE POLICY outreach_retractions_public_read ON outreach_letter_retractions FOR SELECT USING (true);

-- Service role bypass for edge functions
CREATE POLICY outreach_letters_service_all ON outreach_letters FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY outreach_votes_service_all ON outreach_letter_votes FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY outreach_responses_service_all ON outreach_letter_responses FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY outreach_retractions_service_all ON outreach_letter_retractions FOR ALL
  USING (auth.role() = 'service_role');
