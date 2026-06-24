-- Referral Codes — stub schema · BP092 Block 6
-- Empress Campaign influencer referral tracking.
-- Postgres-only syntax per canon_knight_sql_target_postgres_syntax_only_no_sqlite_primitives_bp089

CREATE TABLE IF NOT EXISTS referral_codes (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id        UUID NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
  code             TEXT NOT NULL UNIQUE,
  source_type      TEXT,
  campaign_id      TEXT,
  click_count      INT DEFAULT 0 NOT NULL,
  conversion_count INT DEFAULT 0 NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: member owns their own codes; public can read for leaderboard
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY referral_codes_public_read ON referral_codes
  FOR SELECT USING (true);

CREATE POLICY referral_codes_member_own ON referral_codes
  FOR ALL USING (auth.uid() = member_id);

CREATE POLICY referral_codes_service_all ON referral_codes
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referral_codes_member ON referral_codes (member_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_campaign ON referral_codes (campaign_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_referral_codes_member_campaign ON referral_codes (member_id, campaign_id);

COMMENT ON TABLE referral_codes IS 'Influencer referral tracking — stub BP092. Empress Campaign initial. Extend for future campaigns.';
