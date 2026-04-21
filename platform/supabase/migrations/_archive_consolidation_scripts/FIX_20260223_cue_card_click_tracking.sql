-- ============================================================================
-- FIX: CUE CARD CLICK TRACKING
-- Run this instead of the full migration if you got card_key errors
-- ============================================================================

-- PART 1: EXTEND CUE CARD TEMPLATES (if table exists)
ALTER TABLE cue_card_templates ADD COLUMN IF NOT EXISTS linked_deck_card_id UUID;
ALTER TABLE cue_card_templates ADD COLUMN IF NOT EXISTS clicks_per_frame_unlock INTEGER DEFAULT 5;
ALTER TABLE cue_card_templates ADD COLUMN IF NOT EXISTS total_clicks_for_unlock INTEGER DEFAULT 20;
ALTER TABLE cue_card_templates ADD COLUMN IF NOT EXISTS social_unlock_type TEXT DEFAULT 'personal';

-- PART 2: DECK CARDS - Check if exists first, add missing columns
DO $$
BEGIN
  -- If deck_cards doesn't exist, create it
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
  -- Get template info
  SELECT * INTO v_template FROM cue_card_templates WHERE id = p_template_id;

  IF v_template IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Template not found');
  END IF;

  -- Insert the click
  INSERT INTO cue_card_share_clicks (share_id, template_id, sharer_id, clicker_id, clicker_ghost_id, platform)
  VALUES (p_share_id, p_template_id, p_sharer_id, p_clicker_id, p_clicker_ghost_id, p_platform)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_click_id;

  IF v_click_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Duplicate click');
  END IF;

  -- Count total clicks
  SELECT COUNT(*) INTO v_click_count
  FROM cue_card_share_clicks
  WHERE sharer_id = p_sharer_id AND template_id = p_template_id;

  -- Get or create frame lock record
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

  -- Mark click as processed
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

-- PART 8: ROW LEVEL SECURITY
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

-- DONE!
SELECT 'Cue Card Click Tracking migration complete!' as status;
