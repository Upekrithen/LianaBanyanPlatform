-- ============================================================================
-- CUE CARD CLICK TRACKING & DECK CARD SOCIAL UNLOCK
-- ============================================================================
-- This migration creates the viral loop infrastructure:
-- 1. Track clicks on shared Cue Cards
-- 2. Link Cue Cards to Deck Cards they can unlock
-- 3. Award Frame Lock unlocks based on click thresholds
-- 4. Support both global pools (Special cards) and personal links (Rare cards)
-- ============================================================================

-- ============================================================================
-- PART 1: EXTEND CUE CARD TEMPLATES
-- ============================================================================

-- Add linked Deck Card to cue_card_templates
ALTER TABLE cue_card_templates ADD COLUMN IF NOT EXISTS
  linked_deck_card_id UUID;

-- How many clicks needed to unlock one frame lock (default 5)
ALTER TABLE cue_card_templates ADD COLUMN IF NOT EXISTS
  clicks_per_frame_unlock INTEGER DEFAULT 5;

-- Total clicks needed for full unlock (default 20 = 4 locks × 5 clicks)
ALTER TABLE cue_card_templates ADD COLUMN IF NOT EXISTS
  total_clicks_for_unlock INTEGER DEFAULT 20;

-- Unlock type: 'personal' (your shares unlock YOUR card) or 'global' (all shares contribute to global pool)
ALTER TABLE cue_card_templates ADD COLUMN IF NOT EXISTS
  social_unlock_type TEXT DEFAULT 'personal' CHECK (social_unlock_type IN ('personal', 'global', 'none'));

-- ============================================================================
-- PART 2: DECK CARDS TABLE (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS deck_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🎴',
  card_type TEXT DEFAULT 'location' CHECK (card_type IN ('location', 'ability', 'treasure', 'quest')),
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'special', 'rare', 'legendary')),
  destination_route TEXT,
  unlock_cost_type TEXT DEFAULT 'free' CHECK (unlock_cost_type IN ('free', 'marks', 'joules', 'social')),
  unlock_cost_amount INTEGER DEFAULT 0,
  initiative_slug TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_deck_cards_key;
DROP INDEX IF EXISTS idx_deck_cards_rarity;
DROP INDEX IF EXISTS idx_deck_cards_initiative;

CREATE INDEX idx_deck_cards_key ON deck_cards(card_key);
CREATE INDEX idx_deck_cards_rarity ON deck_cards(rarity);
CREATE INDEX idx_deck_cards_initiative ON deck_cards(initiative_slug);

-- ============================================================================
-- PART 3: CUE CARD SHARE CLICKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS cue_card_share_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The share instance (unique per user+template combo, or unique share link)
  share_id TEXT NOT NULL,

  -- Which Cue Card template was shared
  template_id UUID REFERENCES cue_card_templates(id) ON DELETE CASCADE,

  -- Who shared it (the person trying to unlock)
  sharer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Who clicked (can be null for anonymous/ghost clicks)
  clicker_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  clicker_ghost_id TEXT,

  -- Where the click came from
  platform TEXT DEFAULT 'direct',
  referrer_url TEXT,

  -- Tracking
  clicked_at TIMESTAMPTZ DEFAULT NOW(),

  -- Has this click been counted toward a frame unlock?
  frame_unlock_awarded BOOLEAN DEFAULT false,
  awarded_at TIMESTAMPTZ,

  -- Prevent duplicate clicks from same person on same share
  UNIQUE(share_id, clicker_id),
  UNIQUE(share_id, clicker_ghost_id)
);

DROP INDEX IF EXISTS idx_share_clicks_sharer;
DROP INDEX IF EXISTS idx_share_clicks_template;
DROP INDEX IF EXISTS idx_share_clicks_share;
DROP INDEX IF EXISTS idx_share_clicks_platform;

CREATE INDEX idx_share_clicks_sharer ON cue_card_share_clicks(sharer_id, template_id);
CREATE INDEX idx_share_clicks_template ON cue_card_share_clicks(template_id);
CREATE INDEX idx_share_clicks_share ON cue_card_share_clicks(share_id);
CREATE INDEX idx_share_clicks_platform ON cue_card_share_clicks(platform);

-- ============================================================================
-- PART 4: SOCIAL FRAME LOCKS (User progress toward unlocking Deck Cards)
-- ============================================================================

CREATE TABLE IF NOT EXISTS social_frame_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Which Deck Card is being unlocked
  deck_card_id UUID REFERENCES deck_cards(id) ON DELETE CASCADE,

  -- For personal unlocks: which user is unlocking
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- For global pools: null user_id, track all contributors
  is_global_pool BOOLEAN DEFAULT false,

  -- Which Cue Card template drives this unlock
  cue_card_template_id UUID REFERENCES cue_card_templates(id) ON DELETE CASCADE,

  -- Progress tracking
  total_clicks INTEGER DEFAULT 0,
  clicks_per_lock INTEGER DEFAULT 5,

  -- Lock states (true = locked, false = unlocked)
  lock_top BOOLEAN DEFAULT true,
  lock_right BOOLEAN DEFAULT true,
  lock_bottom BOOLEAN DEFAULT true,
  lock_left BOOLEAN DEFAULT true,

  -- Completion
  is_fully_unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMPTZ,

  -- For global pools: who contributed
  contributors UUID[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One record per user per deck card (or one global pool per deck card)
  UNIQUE(deck_card_id, user_id)
);

DROP INDEX IF EXISTS idx_social_frame_locks_user;
DROP INDEX IF EXISTS idx_social_frame_locks_card;
DROP INDEX IF EXISTS idx_social_frame_locks_global;

CREATE INDEX idx_social_frame_locks_user ON social_frame_locks(user_id);
CREATE INDEX idx_social_frame_locks_card ON social_frame_locks(deck_card_id);
CREATE INDEX idx_social_frame_locks_global ON social_frame_locks(is_global_pool) WHERE is_global_pool = true;

-- ============================================================================
-- PART 5: GLOBAL POOL TRACKING (for Special/Rare cards everyone contributes to)
-- ============================================================================

CREATE TABLE IF NOT EXISTS global_unlock_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Which Deck Card this pool unlocks
  deck_card_id UUID REFERENCES deck_cards(id) ON DELETE CASCADE UNIQUE,

  -- Which Cue Card template drives contributions
  cue_card_template_id UUID REFERENCES cue_card_templates(id) ON DELETE CASCADE,

  -- Progress
  total_clicks INTEGER DEFAULT 0,
  clicks_needed INTEGER DEFAULT 20,

  -- Lock states
  lock_top BOOLEAN DEFAULT true,
  lock_right BOOLEAN DEFAULT true,
  lock_bottom BOOLEAN DEFAULT true,
  lock_left BOOLEAN DEFAULT true,

  -- Completion
  is_unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMPTZ,

  -- Everyone who contributed (gets the card when unlocked)
  contributors UUID[] DEFAULT '{}',

  -- Campaign info
  campaign_name TEXT,
  campaign_description TEXT,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 6: CANDLE BURST REWARDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS candle_burst_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who earned the reward
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- What triggered the reward
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('social_unlock', 'beacon_run', 'golden_key', 'pair_bonus')),
  trigger_id UUID,

  -- Reward choice: 'burst' (3 uses), 'store' (save toward Babylon), 'pair' (find partner)
  reward_choice TEXT CHECK (reward_choice IN ('burst', 'store', 'pair')),

  -- Value
  candle_uses INTEGER DEFAULT 3,

  -- For pairing
  pair_code TEXT UNIQUE,
  paired_with_user_id UUID REFERENCES profiles(id),
  pair_stage INTEGER DEFAULT 0, -- 0=unpaired, 1=paired(9 each), 2=completed(10 each), 3=bonus(2x)

  -- Status
  is_claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_candle_burst_user;
DROP INDEX IF EXISTS idx_candle_burst_pair;

CREATE INDEX idx_candle_burst_user ON candle_burst_rewards(user_id);
CREATE INDEX idx_candle_burst_pair ON candle_burst_rewards(pair_code) WHERE pair_code IS NOT NULL;

-- ============================================================================
-- PART 7: FUNCTIONS
-- ============================================================================

-- Function to process a click and potentially unlock a frame
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
  v_result JSONB;
BEGIN
  -- Get template info
  SELECT * INTO v_template FROM cue_card_templates WHERE id = p_template_id;

  IF v_template IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Template not found');
  END IF;

  -- Insert the click (will fail on duplicate due to unique constraint)
  INSERT INTO cue_card_share_clicks (share_id, template_id, sharer_id, clicker_id, clicker_ghost_id, platform)
  VALUES (p_share_id, p_template_id, p_sharer_id, p_clicker_id, p_clicker_ghost_id, p_platform)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_click_id;

  IF v_click_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Duplicate click');
  END IF;

  -- Count total clicks for this sharer on this template
  SELECT COUNT(*) INTO v_click_count
  FROM cue_card_share_clicks
  WHERE sharer_id = p_sharer_id AND template_id = p_template_id;

  -- Get or create frame lock record
  IF v_template.linked_deck_card_id IS NOT NULL THEN
    INSERT INTO social_frame_locks (deck_card_id, user_id, cue_card_template_id, clicks_per_lock)
    VALUES (v_template.linked_deck_card_id, p_sharer_id, p_template_id, COALESCE(v_template.clicks_per_frame_unlock, 5))
    ON CONFLICT (deck_card_id, user_id) DO UPDATE SET updated_at = NOW()
    RETURNING * INTO v_frame_lock;

    -- Update click count
    UPDATE social_frame_locks
    SET total_clicks = v_click_count,
        updated_at = NOW()
    WHERE id = v_frame_lock.id;

    -- Calculate how many locks should be unlocked
    v_locks_to_unlock := LEAST(4, v_click_count / COALESCE(v_template.clicks_per_frame_unlock, 5));

    -- Unlock locks in order: top, right, bottom, left
    UPDATE social_frame_locks
    SET
      lock_top = CASE WHEN v_locks_to_unlock >= 1 THEN false ELSE lock_top END,
      lock_right = CASE WHEN v_locks_to_unlock >= 2 THEN false ELSE lock_right END,
      lock_bottom = CASE WHEN v_locks_to_unlock >= 3 THEN false ELSE lock_bottom END,
      lock_left = CASE WHEN v_locks_to_unlock >= 4 THEN false ELSE lock_left END,
      is_fully_unlocked = CASE WHEN v_locks_to_unlock >= 4 THEN true ELSE false END,
      unlocked_at = CASE WHEN v_locks_to_unlock >= 4 AND unlocked_at IS NULL THEN NOW() ELSE unlocked_at END
    WHERE id = v_frame_lock.id
    RETURNING * INTO v_frame_lock;
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

-- ============================================================================
-- PART 8: ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE deck_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE cue_card_share_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_frame_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_unlock_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE candle_burst_rewards ENABLE ROW LEVEL SECURITY;

-- Deck cards: anyone can view
DROP POLICY IF EXISTS view_deck_cards ON deck_cards;
CREATE POLICY view_deck_cards ON deck_cards FOR SELECT USING (true);

-- Share clicks: anyone can view, system can insert
DROP POLICY IF EXISTS view_share_clicks ON cue_card_share_clicks;
DROP POLICY IF EXISTS insert_share_clicks ON cue_card_share_clicks;
CREATE POLICY view_share_clicks ON cue_card_share_clicks FOR SELECT USING (true);
CREATE POLICY insert_share_clicks ON cue_card_share_clicks FOR INSERT WITH CHECK (true);

-- Frame locks: users see their own, global pools visible to all
DROP POLICY IF EXISTS view_frame_locks ON social_frame_locks;
DROP POLICY IF EXISTS manage_own_frame_locks ON social_frame_locks;
CREATE POLICY view_frame_locks ON social_frame_locks FOR SELECT
  USING (user_id = auth.uid() OR is_global_pool = true);
CREATE POLICY manage_own_frame_locks ON social_frame_locks FOR ALL
  USING (user_id = auth.uid());

-- Global pools: anyone can view
DROP POLICY IF EXISTS view_global_pools ON global_unlock_pools;
CREATE POLICY view_global_pools ON global_unlock_pools FOR SELECT USING (true);

-- Candle rewards: users see their own
DROP POLICY IF EXISTS view_own_candle_rewards ON candle_burst_rewards;
DROP POLICY IF EXISTS manage_own_candle_rewards ON candle_burst_rewards;
CREATE POLICY view_own_candle_rewards ON candle_burst_rewards FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY manage_own_candle_rewards ON candle_burst_rewards FOR ALL
  USING (user_id = auth.uid());

-- ============================================================================
-- PART 9: SEED SOME INITIAL DECK CARDS
-- ============================================================================

INSERT INTO deck_cards (card_key, title, description, icon, card_type, rarity, initiative_slug, unlock_cost_type)
VALUES
  ('welcome_explorer', 'Welcome Explorer', 'Your first step into the Liana Banyan ecosystem', '🌱', 'location', 'common', NULL, 'free'),
  ('lets_make_dinner_intro', 'Let''s Make Dinner', 'Discover the flagship initiative', '🍽️', 'location', 'common', 'lets-make-dinner', 'free'),
  ('crown_jewel_maneet', 'Crown Jewel: Maneet Chauhan', 'The culinary visionary leading Let''s Make Dinner', '👑', 'treasure', 'special', 'lets-make-dinner', 'social'),
  ('beacon_master', 'Beacon Master', 'Complete 10 beacon runs to earn this quest card', '🏃', 'quest', 'rare', NULL, 'social'),
  ('golden_key_finder', 'Golden Key Finder', 'Discover your first Golden Key in Cephas', '🔑', 'treasure', 'rare', NULL, 'social'),
  ('babylon_traveler', 'Babylon Traveler', 'Unlock Black Babylon Candles', '🕯️', 'ability', 'legendary', NULL, 'social')
ON CONFLICT (card_key) DO NOTHING;

-- ============================================================================
-- DONE
-- ============================================================================
