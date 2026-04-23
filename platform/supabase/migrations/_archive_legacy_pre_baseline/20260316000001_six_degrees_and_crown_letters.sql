-- ============================================================================
-- Session 25B: Six Degrees system tables + Crown Letter dispatch seed
-- ============================================================================

-- ═══════════════════════════════════════════════════════════════
-- SIX DEGREES BOUNTY SYSTEM
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.six_degrees_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_name TEXT NOT NULL,
  target_role TEXT,
  initiative TEXT,
  description TEXT,
  bounty_pool_credits NUMERIC DEFAULT 0,
  bounty_pool_marks NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','active','milestone_1','milestone_2','milestone_3','completed','expired','cooldown')),
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  cooldown_until TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.six_degrees_hunters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES six_degrees_campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  degree_claimed INT CHECK (degree_claimed BETWEEN 1 AND 6),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','succeeded','failed','withdrawn')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.six_degrees_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES six_degrees_campaigns(id) ON DELETE CASCADE,
  milestone_level INT NOT NULL CHECK (milestone_level BETWEEN 1 AND 4),
  achieved_by UUID NOT NULL,
  degree_path JSONB DEFAULT '[]',
  verification_type TEXT CHECK (verification_type IN ('email_reply','meeting_confirm','qr_scan','platform_action','signed_ack')),
  verification_proof TEXT,
  stamp_verified BOOLEAN DEFAULT false,
  payout_credits NUMERIC DEFAULT 0,
  payout_marks NUMERIC DEFAULT 0,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.six_degrees_backers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES six_degrees_campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount_credits NUMERIC DEFAULT 0,
  amount_marks NUMERIC DEFAULT 0,
  saa_earned NUMERIC DEFAULT 0,
  backed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.six_degrees_referral_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES six_degrees_campaigns(id),
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  degree_position INT NOT NULL CHECK (degree_position BETWEEN 1 AND 6),
  chain_hash TEXT,
  reward_cue_card NUMERIC DEFAULT 0,
  reward_bounty_share NUMERIC DEFAULT 0,
  reward_xp NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE six_degrees_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE six_degrees_hunters ENABLE ROW LEVEL SECURITY;
ALTER TABLE six_degrees_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE six_degrees_backers ENABLE ROW LEVEL SECURITY;
ALTER TABLE six_degrees_referral_chains ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Authenticated read campaigns" ON six_degrees_campaigns FOR SELECT USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated read hunters" ON six_degrees_hunters FOR SELECT USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated read milestones" ON six_degrees_milestones FOR SELECT USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated read backers" ON six_degrees_backers FOR SELECT USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated read chains" ON six_degrees_referral_chains FOR SELECT USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- SEED: Initial bounty campaigns for Crown Letter recipients
-- ═══════════════════════════════════════════════════════════════

INSERT INTO six_degrees_campaigns (target_name, target_role, initiative, description, status) VALUES
('Alexandria Ocasio-Cortez', 'Door-Opener (Left)', 'Power to the People', 'Deliver Crown Letter for Initiative #15 Political Expedition — Door-Opening Crown (Left)', 'proposed'),
('Arnold Schwarzenegger', 'Door-Opener (Right)', 'Power to the People', 'Deliver Crown Letter for Initiative #15 Political Expedition — Door-Opening Crown (Right)', 'proposed'),
('Keanu Reeves', 'Builder (Culture)', 'Power to the People', 'Deliver Crown Letter for Initiative #15 Political Expedition — Builder Crown (Culture)', 'proposed'),
('Sandra Bullock', 'Builder (Action)', 'Power to the People', 'Deliver Crown Letter for Initiative #15 Political Expedition — Builder Crown (Action)', 'proposed');

-- ═══════════════════════════════════════════════════════════════
-- SEED: Crown Letters as email dispatches in outbound_dispatch
-- ═══════════════════════════════════════════════════════════════

INSERT INTO outbound_dispatch (title, type, status, priority, content_body, content_summary, channels, created_by, tags, content_type, content_path, metadata) VALUES
(
  'Crown Letter: Keanu Reeves — Builder (Culture)',
  'crown_letter', 'draft', 'high',
  'See BISHOP_DROPZONE/CROWN_LETTER_KEANU_REEVES_POLITICAL_EXPEDITION.md',
  'Crown Letter for Builder Crown (Culture) — Power to the People. Civic engagement through lived example.',
  ARRAY['email'],
  'bishop',
  ARRAY['crown-letter', 'political-expedition', 'keanu-reeves', 'culture'],
  'crown_letter',
  'BISHOP_DROPZONE/CROWN_LETTER_KEANU_REEVES_POLITICAL_EXPEDITION.md',
  '{"recipient": "Keanu Reeves", "crown_type": "Builder (Culture)", "initiative": "Power to the People", "initiative_number": 15}'::jsonb
),
(
  'Crown Letter: Sandra Bullock — Builder (Action)',
  'crown_letter', 'draft', 'high',
  'See BISHOP_DROPZONE/CROWN_LETTER_SANDRA_BULLOCK_POLITICAL_EXPEDITION.md',
  'Crown Letter for Builder Crown (Action) — Power to the People. Operational civic infrastructure.',
  ARRAY['email'],
  'bishop',
  ARRAY['crown-letter', 'political-expedition', 'sandra-bullock', 'action'],
  'crown_letter',
  'BISHOP_DROPZONE/CROWN_LETTER_SANDRA_BULLOCK_POLITICAL_EXPEDITION.md',
  '{"recipient": "Sandra Bullock", "crown_type": "Builder (Action)", "initiative": "Power to the People", "initiative_number": 15}'::jsonb
),
(
  'Crown Letter: Alexandria Ocasio-Cortez — Door-Opener (Left)',
  'crown_letter', 'draft', 'high',
  'See BISHOP_DROPZONE/CROWN_LETTER_AOC_POLITICAL_EXPEDITION.md',
  'Crown Letter for Door-Opening Crown (Left) — Power to the People. Civic participation as economic participation.',
  ARRAY['email'],
  'bishop',
  ARRAY['crown-letter', 'political-expedition', 'aoc', 'door-opener'],
  'crown_letter',
  'BISHOP_DROPZONE/CROWN_LETTER_AOC_POLITICAL_EXPEDITION.md',
  '{"recipient": "Alexandria Ocasio-Cortez", "crown_type": "Door-Opener (Left)", "initiative": "Power to the People", "initiative_number": 15}'::jsonb
),
(
  'Crown Letter: Arnold Schwarzenegger — Door-Opener (Right)',
  'crown_letter', 'draft', 'high',
  'See BISHOP_DROPZONE/CROWN_LETTER_SCHWARZENEGGER_POLITICAL_EXPEDITION.md',
  'Crown Letter for Door-Opening Crown (Right) — Power to the People. Interdependence is not partisan.',
  ARRAY['email'],
  'bishop',
  ARRAY['crown-letter', 'political-expedition', 'schwarzenegger', 'door-opener'],
  'crown_letter',
  'BISHOP_DROPZONE/CROWN_LETTER_SCHWARZENEGGER_POLITICAL_EXPEDITION.md',
  '{"recipient": "Arnold Schwarzenegger", "crown_type": "Door-Opener (Right)", "initiative": "Power to the People", "initiative_number": 15}'::jsonb
);
