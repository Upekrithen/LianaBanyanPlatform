-- ============================================================================
-- SOCIAL PLUG SYSTEM
-- Universal plug management for social platform integrations
-- ============================================================================

-- PART 1: USER SOCIAL PLUGS
-- Tracks which social platforms a user has connected and enabled
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
-- Tracks pairing between users for the 9→10→2x progression
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
-- Tracks shares across all platforms for analytics and rewards
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
-- Global feature flags for social plug capabilities
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

-- PART 5: ROW LEVEL SECURITY
ALTER TABLE user_social_plugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candle_burst_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_plug_features ENABLE ROW LEVEL SECURITY;

-- Policies for user_social_plugs
DROP POLICY IF EXISTS view_own_plugs ON user_social_plugs;
DROP POLICY IF EXISTS manage_own_plugs ON user_social_plugs;
CREATE POLICY view_own_plugs ON user_social_plugs FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY manage_own_plugs ON user_social_plugs FOR ALL
  USING (auth.uid() = user_id);

-- Policies for candle_burst_pairs
DROP POLICY IF EXISTS view_own_pairs ON candle_burst_pairs;
DROP POLICY IF EXISTS manage_own_pairs ON candle_burst_pairs;
DROP POLICY IF EXISTS join_pairs ON candle_burst_pairs;
CREATE POLICY view_own_pairs ON candle_burst_pairs FOR SELECT
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);
CREATE POLICY manage_own_pairs ON candle_burst_pairs FOR ALL
  USING (auth.uid() = user_a_id);
CREATE POLICY join_pairs ON candle_burst_pairs FOR UPDATE
  USING (user_b_id IS NULL AND status = 'pending');

-- Policies for social_shares
DROP POLICY IF EXISTS view_own_shares ON social_shares;
DROP POLICY IF EXISTS manage_own_shares ON social_shares;
CREATE POLICY view_own_shares ON social_shares FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY manage_own_shares ON social_shares FOR ALL
  USING (auth.uid() = user_id);

-- Policies for social_plug_features (public read)
DROP POLICY IF EXISTS view_plug_features ON social_plug_features;
CREATE POLICY view_plug_features ON social_plug_features FOR SELECT
  USING (true);

-- PART 6: HELPER FUNCTIONS

-- Get user's enabled plugs
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

-- Toggle a plug on/off
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

-- Create or join a pair
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

-- DONE!
SELECT 'Social Plug System migration complete!' as status;
