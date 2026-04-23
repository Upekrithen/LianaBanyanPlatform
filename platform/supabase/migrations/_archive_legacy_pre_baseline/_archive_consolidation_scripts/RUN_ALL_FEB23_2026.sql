-- ============================================================================
-- CONSOLIDATED MIGRATIONS — February 23, 2026
-- Run this entire file in Supabase SQL Editor
-- ============================================================================
-- ORDER:
-- 1. Cue Card Click Tracking (FIX version - no card_key)
-- 2. Social Plug System
-- 3. Fly on the Wall Transparency
-- ============================================================================


-- ============================================================================
-- MIGRATION 1: CUE CARD CLICK TRACKING (FIX VERSION)
-- ============================================================================

-- PART 1: EXTEND CUE CARD TEMPLATES (if table exists)
ALTER TABLE cue_card_templates ADD COLUMN IF NOT EXISTS linked_deck_card_id UUID;
ALTER TABLE cue_card_templates ADD COLUMN IF NOT EXISTS clicks_per_frame_unlock INTEGER DEFAULT 5;
ALTER TABLE cue_card_templates ADD COLUMN IF NOT EXISTS total_clicks_for_unlock INTEGER DEFAULT 20;
ALTER TABLE cue_card_templates ADD COLUMN IF NOT EXISTS social_unlock_type TEXT DEFAULT 'personal';

-- PART 2: DECK CARDS - Check if exists first, add missing columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'deck_cards') THEN
    CREATE TABLE deck_cards (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT DEFAULT '🎴',
      card_type TEXT DEFAULT 'location',
      rarity TEXT DEFAULT 'common',
      destination_route TEXT,
      unlock_cost_type TEXT DEFAULT 'free',
      unlock_cost_amount INTEGER DEFAULT 0,
      initiative_slug TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- PART 3: CUE CARD SHARE CLICKS
CREATE TABLE IF NOT EXISTS cue_card_share_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id TEXT NOT NULL,
  template_id UUID,
  sharer_id UUID,
  clicker_id UUID,
  clicker_ghost_id TEXT,
  platform TEXT DEFAULT 'direct',
  referrer_url TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  frame_unlock_awarded BOOLEAN DEFAULT false,
  awarded_at TIMESTAMPTZ
);

DROP INDEX IF EXISTS idx_share_clicks_sharer;
DROP INDEX IF EXISTS idx_share_clicks_template;
DROP INDEX IF EXISTS idx_share_clicks_share;
DROP INDEX IF EXISTS idx_share_clicks_platform;

CREATE INDEX idx_share_clicks_sharer ON cue_card_share_clicks(sharer_id, template_id);
CREATE INDEX idx_share_clicks_template ON cue_card_share_clicks(template_id);
CREATE INDEX idx_share_clicks_share ON cue_card_share_clicks(share_id);
CREATE INDEX idx_share_clicks_platform ON cue_card_share_clicks(platform);

-- PART 4: SOCIAL FRAME LOCKS
CREATE TABLE IF NOT EXISTS social_frame_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_card_id UUID,
  user_id UUID,
  is_global_pool BOOLEAN DEFAULT false,
  cue_card_template_id UUID,
  total_clicks INTEGER DEFAULT 0,
  clicks_per_lock INTEGER DEFAULT 5,
  lock_top BOOLEAN DEFAULT true,
  lock_right BOOLEAN DEFAULT true,
  lock_bottom BOOLEAN DEFAULT true,
  lock_left BOOLEAN DEFAULT true,
  is_fully_unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  contributors UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_social_frame_locks_user;
DROP INDEX IF EXISTS idx_social_frame_locks_card;
DROP INDEX IF EXISTS idx_social_frame_locks_global;

CREATE INDEX idx_social_frame_locks_user ON social_frame_locks(user_id);
CREATE INDEX idx_social_frame_locks_card ON social_frame_locks(deck_card_id);
CREATE INDEX idx_social_frame_locks_global ON social_frame_locks(is_global_pool) WHERE is_global_pool = true;

-- PART 5: GLOBAL UNLOCK POOLS
CREATE TABLE IF NOT EXISTS global_unlock_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_card_id UUID,
  cue_card_template_id UUID,
  total_clicks INTEGER DEFAULT 0,
  clicks_needed INTEGER DEFAULT 20,
  lock_top BOOLEAN DEFAULT true,
  lock_right BOOLEAN DEFAULT true,
  lock_bottom BOOLEAN DEFAULT true,
  lock_left BOOLEAN DEFAULT true,
  is_unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  contributors UUID[] DEFAULT '{}',
  campaign_name TEXT,
  campaign_description TEXT,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PART 6: CANDLE BURST REWARDS
CREATE TABLE IF NOT EXISTS candle_burst_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  trigger_type TEXT NOT NULL,
  trigger_id UUID,
  reward_choice TEXT,
  candle_uses INTEGER DEFAULT 3,
  pair_code TEXT UNIQUE,
  paired_with_user_id UUID,
  pair_stage INTEGER DEFAULT 0,
  is_claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_candle_burst_user;
DROP INDEX IF EXISTS idx_candle_burst_pair;

CREATE INDEX idx_candle_burst_user ON candle_burst_rewards(user_id);
CREATE INDEX idx_candle_burst_pair ON candle_burst_rewards(pair_code) WHERE pair_code IS NOT NULL;

-- PART 7: PROCESS CLICK FUNCTION
CREATE OR REPLACE FUNCTION process_cue_card_click(
  p_share_id TEXT,
  p_template_id UUID,
  p_sharer_id UUID,
  p_clicker_id UUID DEFAULT NULL,
  p_clicker_ghost_id TEXT DEFAULT NULL,
  p_platform TEXT DEFAULT 'direct'
) RETURNS JSONB AS $$
DECLARE
  v_click_id UUID;
  v_template RECORD;
  v_frame_lock RECORD;
  v_click_count INTEGER;
  v_locks_to_unlock INTEGER;
BEGIN
  SELECT * INTO v_template FROM cue_card_templates WHERE id = p_template_id;

  IF v_template IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Template not found');
  END IF;

  INSERT INTO cue_card_share_clicks (share_id, template_id, sharer_id, clicker_id, clicker_ghost_id, platform)
  VALUES (p_share_id, p_template_id, p_sharer_id, p_clicker_id, p_clicker_ghost_id, p_platform)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_click_id;

  IF v_click_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Duplicate click');
  END IF;

  SELECT COUNT(*) INTO v_click_count
  FROM cue_card_share_clicks
  WHERE sharer_id = p_sharer_id AND template_id = p_template_id;

  IF v_template.linked_deck_card_id IS NOT NULL THEN
    INSERT INTO social_frame_locks (deck_card_id, user_id, cue_card_template_id, clicks_per_lock)
    VALUES (v_template.linked_deck_card_id, p_sharer_id, p_template_id, COALESCE(v_template.clicks_per_frame_unlock, 5))
    ON CONFLICT DO NOTHING;

    SELECT * INTO v_frame_lock FROM social_frame_locks
    WHERE deck_card_id = v_template.linked_deck_card_id AND user_id = p_sharer_id;

    IF v_frame_lock IS NOT NULL THEN
      v_locks_to_unlock := LEAST(4, v_click_count / COALESCE(v_template.clicks_per_frame_unlock, 5));

      UPDATE social_frame_locks
      SET
        total_clicks = v_click_count,
        lock_top = CASE WHEN v_locks_to_unlock >= 1 THEN false ELSE lock_top END,
        lock_right = CASE WHEN v_locks_to_unlock >= 2 THEN false ELSE lock_right END,
        lock_bottom = CASE WHEN v_locks_to_unlock >= 3 THEN false ELSE lock_bottom END,
        lock_left = CASE WHEN v_locks_to_unlock >= 4 THEN false ELSE lock_left END,
        is_fully_unlocked = CASE WHEN v_locks_to_unlock >= 4 THEN true ELSE false END,
        unlocked_at = CASE WHEN v_locks_to_unlock >= 4 AND unlocked_at IS NULL THEN NOW() ELSE unlocked_at END,
        updated_at = NOW()
      WHERE id = v_frame_lock.id
      RETURNING * INTO v_frame_lock;
    END IF;
  ELSE
    v_locks_to_unlock := 0;
  END IF;

  UPDATE cue_card_share_clicks
  SET frame_unlock_awarded = true, awarded_at = NOW()
  WHERE id = v_click_id;

  RETURN jsonb_build_object(
    'success', true,
    'click_id', v_click_id,
    'total_clicks', v_click_count,
    'locks_unlocked', v_locks_to_unlock,
    'is_fully_unlocked', COALESCE(v_frame_lock.is_fully_unlocked, false)
  );
END;
$$ LANGUAGE plpgsql;

-- PART 8: ROW LEVEL SECURITY FOR CLICK TRACKING
ALTER TABLE cue_card_share_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_frame_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_unlock_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE candle_burst_rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS view_share_clicks ON cue_card_share_clicks;
DROP POLICY IF EXISTS insert_share_clicks ON cue_card_share_clicks;
CREATE POLICY view_share_clicks ON cue_card_share_clicks FOR SELECT USING (true);
CREATE POLICY insert_share_clicks ON cue_card_share_clicks FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS view_frame_locks ON social_frame_locks;
DROP POLICY IF EXISTS manage_frame_locks ON social_frame_locks;
CREATE POLICY view_frame_locks ON social_frame_locks FOR SELECT USING (true);
CREATE POLICY manage_frame_locks ON social_frame_locks FOR ALL USING (true);

DROP POLICY IF EXISTS view_global_pools ON global_unlock_pools;
CREATE POLICY view_global_pools ON global_unlock_pools FOR SELECT USING (true);

DROP POLICY IF EXISTS view_candle_rewards ON candle_burst_rewards;
DROP POLICY IF EXISTS manage_candle_rewards ON candle_burst_rewards;
CREATE POLICY view_candle_rewards ON candle_burst_rewards FOR SELECT USING (true);
CREATE POLICY manage_candle_rewards ON candle_burst_rewards FOR ALL USING (true);

SELECT 'Migration 1: Cue Card Click Tracking complete!' as status;


-- ============================================================================
-- MIGRATION 2: SOCIAL PLUG SYSTEM
-- ============================================================================

-- PART 1: USER SOCIAL PLUGS
CREATE TABLE IF NOT EXISTS user_social_plugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  connection_data JSONB DEFAULT '{}',
  plug_features JSONB DEFAULT '{}',
  oauth_token TEXT,
  oauth_refresh_token TEXT,
  oauth_expires_at TIMESTAMPTZ,
  platform_user_id TEXT,
  platform_username TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_social_plugs_user ON user_social_plugs(user_id);
CREATE INDEX IF NOT EXISTS idx_social_plugs_platform ON user_social_plugs(platform);
CREATE INDEX IF NOT EXISTS idx_social_plugs_enabled ON user_social_plugs(user_id, is_enabled) WHERE is_enabled = true;

-- PART 2: CANDLE BURST PAIRS
CREATE TABLE IF NOT EXISTS candle_burst_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_code TEXT UNIQUE NOT NULL,
  user_a_id UUID NOT NULL,
  user_b_id UUID,
  status TEXT DEFAULT 'pending',
  stage INTEGER DEFAULT 1,
  rewards_a JSONB DEFAULT '{}',
  rewards_b JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paired_at TIMESTAMPTZ,
  stage_2_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_pairs_code ON candle_burst_pairs(pair_code);
CREATE INDEX IF NOT EXISTS idx_pairs_user_a ON candle_burst_pairs(user_a_id);
CREATE INDEX IF NOT EXISTS idx_pairs_user_b ON candle_burst_pairs(user_b_id) WHERE user_b_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pairs_status ON candle_burst_pairs(status);

-- PART 3: SOCIAL SHARE TRACKING
CREATE TABLE IF NOT EXISTS social_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  share_type TEXT NOT NULL,
  content_id UUID,
  content_type TEXT,
  share_url TEXT,
  platform_post_id TEXT,
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shares_user ON social_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_platform ON social_shares(platform);
CREATE INDEX IF NOT EXISTS idx_shares_content ON social_shares(content_id, content_type);

-- PART 4: PLUG FEATURE FLAGS
CREATE TABLE IF NOT EXISTS social_plug_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  features JSONB DEFAULT '{}',
  oauth_config JSONB DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  approval_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial platforms
INSERT INTO social_plug_features (platform, display_name, icon, color, features, is_available, approval_status)
VALUES
  ('tiktok', 'TikTok', '♪', 'bg-pink-500',
   '{"login": true, "share": true, "mini_game": false}',
   true, 'pending'),
  ('facebook', 'Facebook', 'f', 'bg-blue-500',
   '{"login": true, "share": true, "pages": true}',
   true, 'approved'),
  ('twitter', 'Twitter/X', '𝕏', 'bg-black',
   '{"login": true, "share": true, "threads": false}',
   true, 'approved'),
  ('linkedin', 'LinkedIn', 'in', 'bg-blue-600',
   '{"login": true, "share": true, "company_pages": false}',
   true, 'approved'),
  ('instagram', 'Instagram', '📷', 'bg-gradient-to-br from-purple-500 to-pink-500',
   '{"login": false, "share": true, "stories": false}',
   true, 'pending'),
  ('youtube', 'YouTube', '▶', 'bg-red-600',
   '{"login": true, "share": false, "upload": false}',
   true, 'pending'),
  ('bluesky', 'Bluesky', '🦋', 'bg-sky-500',
   '{"login": true, "share": true}',
   true, 'approved'),
  ('threads', 'Threads', '@', 'bg-gray-800',
   '{"login": true, "share": true}',
   true, 'pending'),
  ('mastodon', 'Mastodon', '🐘', 'bg-purple-600',
   '{"login": true, "share": true}',
   true, 'approved'),
  ('discord', 'Discord', '🎮', 'bg-indigo-500',
   '{"login": true, "share": false, "webhooks": true}',
   true, 'pending')
ON CONFLICT (platform) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  features = EXCLUDED.features,
  updated_at = NOW();

-- PART 5: ROW LEVEL SECURITY FOR SOCIAL PLUGS
ALTER TABLE user_social_plugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candle_burst_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_plug_features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS view_own_plugs ON user_social_plugs;
DROP POLICY IF EXISTS manage_own_plugs ON user_social_plugs;
CREATE POLICY view_own_plugs ON user_social_plugs FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY manage_own_plugs ON user_social_plugs FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS view_own_pairs ON candle_burst_pairs;
DROP POLICY IF EXISTS manage_own_pairs ON candle_burst_pairs;
DROP POLICY IF EXISTS join_pairs ON candle_burst_pairs;
CREATE POLICY view_own_pairs ON candle_burst_pairs FOR SELECT
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);
CREATE POLICY manage_own_pairs ON candle_burst_pairs FOR ALL
  USING (auth.uid() = user_a_id);
CREATE POLICY join_pairs ON candle_burst_pairs FOR UPDATE
  USING (user_b_id IS NULL AND status = 'pending');

DROP POLICY IF EXISTS view_own_shares ON social_shares;
DROP POLICY IF EXISTS manage_own_shares ON social_shares;
CREATE POLICY view_own_shares ON social_shares FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY manage_own_shares ON social_shares FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS view_plug_features ON social_plug_features;
CREATE POLICY view_plug_features ON social_plug_features FOR SELECT
  USING (true);

-- PART 6: HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION get_user_plugs(p_user_id UUID)
RETURNS TABLE (
  platform TEXT,
  is_enabled BOOLEAN,
  platform_username TEXT,
  features JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.platform,
    up.is_enabled,
    up.platform_username,
    up.plug_features
  FROM user_social_plugs up
  WHERE up.user_id = p_user_id
  ORDER BY up.platform;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION toggle_social_plug(
  p_user_id UUID,
  p_platform TEXT,
  p_enabled BOOLEAN
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_social_plugs
  SET is_enabled = p_enabled, updated_at = NOW()
  WHERE user_id = p_user_id AND platform = p_platform;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION join_candle_pair(
  p_pair_code TEXT,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_pair RECORD;
BEGIN
  SELECT * INTO v_pair FROM candle_burst_pairs WHERE pair_code = p_pair_code;

  IF v_pair IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid pair code');
  END IF;

  IF v_pair.user_b_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Pair code already used');
  END IF;

  IF v_pair.user_a_id = p_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot pair with yourself');
  END IF;

  UPDATE candle_burst_pairs
  SET
    user_b_id = p_user_id,
    status = 'paired',
    paired_at = NOW()
  WHERE id = v_pair.id;

  RETURN jsonb_build_object(
    'success', true,
    'pair_id', v_pair.id,
    'user_a_id', v_pair.user_a_id,
    'candle_uses_each', 9
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Migration 2: Social Plug System complete!' as status;


-- ============================================================================
-- MIGRATION 3: FLY ON THE WALL TRANSPARENCY
-- ============================================================================

-- DROP OLD VIEW FIRST (it has different columns)
DROP VIEW IF EXISTS v_current_transparency_metrics;

-- PART 1: TRANSPARENCY METRICS TABLE
CREATE TABLE IF NOT EXISTS transparency_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Member metrics
  total_members INTEGER DEFAULT 0,
  active_members_30_day INTEGER DEFAULT 0,
  newcomers_this_period INTEGER DEFAULT 0,

  -- Transaction metrics
  total_transactions INTEGER DEFAULT 0,
  total_transaction_volume NUMERIC(15,2) DEFAULT 0,
  avg_transaction_value NUMERIC(10,2) DEFAULT 0,

  -- Financial metrics
  treasury_balance NUMERIC(15,2) DEFAULT 0,
  charitable_fund_balance NUMERIC(15,2) DEFAULT 0,
  creator_payout_total NUMERIC(15,2) DEFAULT 0,
  platform_margin_total NUMERIC(15,2) DEFAULT 0,

  -- Newcomer health (Boaz Principle)
  avg_time_to_first_transaction_hours NUMERIC(10,2),
  newcomer_30_day_retention NUMERIC(5,4),
  active_gleaners_count INTEGER DEFAULT 0,
  gleaning_credits_distributed NUMERIC(15,2) DEFAULT 0,

  -- Ghost economy
  ghost_credits_total_distributed NUMERIC(15,2) DEFAULT 0,
  ghost_credits_total_used NUMERIC(15,2) DEFAULT 0,
  ghost_credits_conversion_rate NUMERIC(5,4),
  ghost_to_member_conversion_count INTEGER DEFAULT 0,

  -- Industry comparison
  our_time_to_first_transaction_days NUMERIC(10,2),
  etsy_avg_time_to_first_sale_days NUMERIC(10,2) DEFAULT 30,
  our_project_success_rate NUMERIC(5,4),
  kickstarter_avg_project_success_rate NUMERIC(5,4) DEFAULT 0.38,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transparency_period ON transparency_metrics(period_end DESC);

-- PART 2: CREATE THE VIEW
CREATE OR REPLACE VIEW v_current_transparency_metrics AS
SELECT * FROM transparency_metrics
ORDER BY period_end DESC
LIMIT 1;

-- PART 3: SEED INITIAL DATA
INSERT INTO transparency_metrics (
  period_start,
  period_end,
  total_members,
  active_members_30_day,
  newcomers_this_period,
  total_transactions,
  treasury_balance,
  charitable_fund_balance,
  ghost_credits_total_distributed,
  ghost_credits_total_used,
  etsy_avg_time_to_first_sale_days,
  kickstarter_avg_project_success_rate
) VALUES (
  NOW() - INTERVAL '30 days',
  NOW(),
  1,
  1,
  0,
  0,
  0,
  0,
  0,
  0,
  30,
  0.38
);

-- PART 4: FUNCTION TO UPDATE METRICS
CREATE OR REPLACE FUNCTION update_transparency_metrics()
RETURNS void AS $$
DECLARE
  v_total_members INTEGER;
  v_active_30d INTEGER;
  v_total_transactions INTEGER;
  v_treasury NUMERIC;
BEGIN
  SELECT COUNT(*) INTO v_total_members FROM profiles WHERE is_active = true;

  SELECT COUNT(*) INTO v_active_30d
  FROM profiles
  WHERE last_login_at > NOW() - INTERVAL '30 days';

  BEGIN
    SELECT COUNT(*) INTO v_total_transactions FROM transactions;
  EXCEPTION WHEN undefined_table THEN
    v_total_transactions := 0;
  END;

  SELECT metric_value INTO v_treasury
  FROM current_metrics
  WHERE metric_key = 'treasury_balance';

  INSERT INTO transparency_metrics (
    period_start,
    period_end,
    total_members,
    active_members_30_day,
    total_transactions,
    treasury_balance
  ) VALUES (
    NOW() - INTERVAL '1 day',
    NOW(),
    COALESCE(v_total_members, 0),
    COALESCE(v_active_30d, 0),
    COALESCE(v_total_transactions, 0),
    COALESCE(v_treasury, 0)
  );
END;
$$ LANGUAGE plpgsql;

-- PART 5: ENSURE CURRENT_METRICS TABLE EXISTS AND HAS KEY VALUES
-- First ensure the table exists with correct schema
CREATE TABLE IF NOT EXISTS current_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_key TEXT NOT NULL UNIQUE,
  metric_value NUMERIC NOT NULL,
  metric_label TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Now insert key values
INSERT INTO current_metrics (metric_key, metric_value, metric_label)
VALUES
  ('innovation_count', 1244, 'Total documented innovations'),
  ('crown_jewel_patents', 8, 'Patents with no prior art found'),
  ('charitable_initiatives', 16, 'Sweet Sixteen initiatives'),
  ('creator_share_percent', 83.3, 'Creator keeps this percentage'),
  ('platform_margin_percent', 20, 'Cost plus this percentage'),
  ('membership_fee_annual', 5, 'Annual membership cost in USD')
ON CONFLICT (metric_key) DO UPDATE SET
  metric_value = EXCLUDED.metric_value,
  updated_at = NOW();

-- PART 6: ROW LEVEL SECURITY
ALTER TABLE transparency_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS view_transparency ON transparency_metrics;
CREATE POLICY view_transparency ON transparency_metrics FOR SELECT USING (true);

-- PART 7: GRANT ACCESS TO THE VIEW
GRANT SELECT ON v_current_transparency_metrics TO anon, authenticated;
GRANT SELECT ON transparency_metrics TO anon, authenticated;

SELECT 'Migration 3: Fly on the Wall Transparency complete!' as status;


-- ============================================================================
-- ALL MIGRATIONS COMPLETE!
-- ============================================================================
SELECT 'ALL 3 MIGRATIONS COMPLETE - February 23, 2026' as final_status;
