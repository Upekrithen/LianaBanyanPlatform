-- ============================================================================
-- Migration: 20260319000015_creator_draft_pick.sql
-- Session 43 Task A: Creator Draft Pick recruitment system
-- ============================================================================

CREATE TABLE IF NOT EXISTS creator_draft_picks (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_name      text NOT NULL,
  creator_handle    text,
  platform          text,
  specialty         text,
  status            text NOT NULL CHECK (status IN ('undrafted','invited','onboarded','active')) DEFAULT 'undrafted',
  cue_card_sent_at  timestamptz,
  signed_up_at      timestamptz,
  referral_tier     text CHECK (referral_tier IN ('pioneer','vanguard','pathfinder','trailblazer','guide','ambassador')),
  marks_rewarded    numeric DEFAULT 0,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE creator_draft_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cdp_select_auth" ON creator_draft_picks FOR SELECT TO authenticated USING (true);
CREATE POLICY "cdp_insert_own" ON creator_draft_picks FOR INSERT TO authenticated WITH CHECK (auth.uid() = recruiter_user_id);
CREATE POLICY "cdp_update_own" ON creator_draft_picks FOR UPDATE TO authenticated USING (auth.uid() = recruiter_user_id) WITH CHECK (auth.uid() = recruiter_user_id);

-- Seed 10 sample creators
DO $$
DECLARE seed_uid uuid;
BEGIN
  SELECT id INTO seed_uid FROM auth.users LIMIT 1;
  IF seed_uid IS NULL THEN RETURN; END IF;
  INSERT INTO creator_draft_picks (recruiter_user_id, creator_name, creator_handle, platform, specialty, status) VALUES
    (seed_uid, 'Alex Rivera',     '@alexrivera3d',   'instagram', '3d_printing',  'active'),
    (seed_uid, 'Sam Chen',        '@samchenlamps',   'etsy',      'lamp_design',  'onboarded'),
    (seed_uid, 'Jordan Mills',    '@jmillstools',    'instagram', 'tool_making',  'invited'),
    (seed_uid, 'Taylor Brooks',   '@tbrooks_games',  'tiktok',    'game_design',  'undrafted'),
    (seed_uid, 'Morgan Lee',      '@morganleejewel', 'etsy',      'jewelry',      'active'),
    (seed_uid, 'Casey Nguyen',    '@caseywood',      'instagram', 'woodworking',  'onboarded'),
    (seed_uid, 'Riley Patel',     '@rileypots',      'youtube',   'ceramics',     'invited'),
    (seed_uid, 'Avery Thompson',  '@averytextile',   'website',   'textiles',     'undrafted'),
    (seed_uid, 'Quinn Davis',     '@quinndtech',     'youtube',   'electronics',  'active'),
    (seed_uid, 'Dakota West',     '@dakotawest3d',   'instagram', '3d_printing',  'undrafted');
END $$;
