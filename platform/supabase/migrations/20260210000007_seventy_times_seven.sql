-- ============================================================================
-- 70 TIMES 7 — Fresh Start System
-- ============================================================================
-- Allows members to reset their reputation counters while keeping their
-- portfolio (owned items, collected cards, IP stakes, physical purchases).
--
-- Philosophy: People who constantly "start fresh" reveal their character
-- over time. A real reputation takes years to build. This system gives
-- everyone infinite chances while making persistence valuable.
--
-- Cost: 1 Mark per reset (makes resets non-trivial but affordable)
-- Limit: 490 total resets (70 × 7 = Biblical forgiveness)
-- ============================================================================

-- Fresh Start Log — Tracks every reset
CREATE TABLE IF NOT EXISTS fresh_start_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reset_number INTEGER NOT NULL DEFAULT 1,
  reset_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  marks_spent INTEGER NOT NULL DEFAULT 1,
  
  -- Snapshot of what was reset (for transparency)
  previous_reputation_score NUMERIC,
  previous_guild_level INTEGER,
  previous_discovery_count INTEGER,
  previous_completed_bounties INTEGER,
  
  -- What they kept
  kept_portfolio_value NUMERIC,
  kept_collected_cards INTEGER,
  kept_ip_stakes INTEGER,
  
  CONSTRAINT max_resets CHECK (reset_number <= 490)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_fresh_start_user ON fresh_start_log(user_id);

-- Add columns to profiles to track fresh start state
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS fresh_start_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_fresh_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS account_age_days INTEGER GENERATED ALWAYS AS (
  EXTRACT(DAY FROM (now() - created_at))
) STORED;

-- Enable RLS
ALTER TABLE fresh_start_log ENABLE ROW LEVEL SECURITY;

-- Users can see their own history
CREATE POLICY "Users can view own fresh start history"
  ON fresh_start_log FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert (trigger the reset)
CREATE POLICY "Users can trigger fresh start"
  ON fresh_start_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- Fresh Start Function — The actual reset logic
-- ============================================================================
CREATE OR REPLACE FUNCTION perform_fresh_start(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_count INTEGER;
  v_marks_balance INTEGER;
  v_result JSON;
  v_previous_rep NUMERIC;
  v_previous_guild INTEGER;
  v_previous_discoveries INTEGER;
  v_previous_bounties INTEGER;
  v_portfolio_value NUMERIC;
  v_cards_count INTEGER;
  v_ip_count INTEGER;
BEGIN
  -- Get current fresh start count
  SELECT COALESCE(fresh_start_count, 0), COALESCE(marks_balance, 0)
  INTO v_current_count, v_marks_balance
  FROM profiles
  WHERE id = p_user_id;

  -- Check limits
  IF v_current_count >= 490 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Maximum resets reached (70 × 7 = 490). Your journey is complete.'
    );
  END IF;

  -- Check if user has at least 1 Mark
  IF v_marks_balance < 1 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Fresh start costs 1 Mark. Earn Marks through platform activity.'
    );
  END IF;

  -- Capture current state for the log
  SELECT 
    COALESCE(reputation_score, 0),
    COALESCE(guild_level, 1),
    (SELECT COUNT(*) FROM user_discovered_cards WHERE user_id = p_user_id),
    (SELECT COUNT(*) FROM bounty_claims WHERE user_id = p_user_id AND status = 'completed')
  INTO v_previous_rep, v_previous_guild, v_previous_discoveries, v_previous_bounties
  FROM profiles WHERE id = p_user_id;

  -- Capture what they keep
  SELECT COALESCE(SUM(current_value), 0) INTO v_portfolio_value
  FROM user_portfolio WHERE user_id = p_user_id;
  
  SELECT COUNT(*) INTO v_cards_count
  FROM user_collected_cards WHERE user_id = p_user_id;
  
  SELECT COUNT(*) INTO v_ip_count
  FROM sponsor_pool_shares WHERE user_id = p_user_id;

  -- Log the fresh start
  INSERT INTO fresh_start_log (
    user_id,
    reset_number,
    marks_spent,
    previous_reputation_score,
    previous_guild_level,
    previous_discovery_count,
    previous_completed_bounties,
    kept_portfolio_value,
    kept_collected_cards,
    kept_ip_stakes
  ) VALUES (
    p_user_id,
    v_current_count + 1,
    1,
    v_previous_rep,
    v_previous_guild,
    v_previous_discoveries,
    v_previous_bounties,
    v_portfolio_value,
    v_cards_count,
    v_ip_count
  );

  -- RESET: Zero out counters (but NOT portfolio)
  UPDATE profiles SET
    marks_balance = marks_balance - 1,  -- Pay the cost
    fresh_start_count = COALESCE(fresh_start_count, 0) + 1,
    last_fresh_start = now(),
    -- Reset these counters
    reputation_score = 0,
    guild_level = 1,
    total_earned = 0,
    referral_count = 0,
    completed_bounties = 0,
    active_streak_days = 0
    -- NOTE: We do NOT reset: credits_balance, joules_balance, medallions_earned
    -- Those represent actual value/collateral
  WHERE id = p_user_id;

  -- Clear discovery progress (cards stay collected, but "new user" experience)
  DELETE FROM user_discovered_cards WHERE user_id = p_user_id;

  -- Build result
  v_result := json_build_object(
    'success', true,
    'reset_number', v_current_count + 1,
    'remaining_resets', 490 - (v_current_count + 1),
    'kept', json_build_object(
      'portfolio_value', v_portfolio_value,
      'collected_cards', v_cards_count,
      'ip_stakes', v_ip_count,
      'credits_balance', (SELECT credits_balance FROM profiles WHERE id = p_user_id),
      'joules_balance', (SELECT joules_balance FROM profiles WHERE id = p_user_id)
    ),
    'message', format('Fresh start #%s complete. You have %s resets remaining. Your portfolio (%s items) remains intact.',
      v_current_count + 1,
      490 - (v_current_count + 1),
      v_cards_count + v_ip_count
    )
  );

  RETURN v_result;
END;
$$;

-- ============================================================================
-- View: Member Tenure and Reputation Stability
-- ============================================================================
-- This reveals the value of a stable reputation over time
CREATE OR REPLACE VIEW member_reputation_stability AS
SELECT 
  p.id,
  p.display_name,
  p.created_at AS member_since,
  p.account_age_days,
  COALESCE(p.fresh_start_count, 0) AS total_resets,
  CASE 
    WHEN p.account_age_days > 365 AND COALESCE(p.fresh_start_count, 0) = 0 THEN 'Bedrock'
    WHEN p.account_age_days > 365 AND COALESCE(p.fresh_start_count, 0) <= 3 THEN 'Established'
    WHEN p.account_age_days > 180 THEN 'Growing'
    WHEN COALESCE(p.fresh_start_count, 0) > 10 THEN 'Wanderer'
    ELSE 'Newcomer'
  END AS reputation_tier,
  p.reputation_score,
  p.guild_level,
  -- Stability score: account age / (resets + 1) - higher = more stable
  ROUND(p.account_age_days::numeric / (COALESCE(p.fresh_start_count, 0) + 1), 2) AS stability_score
FROM profiles p
WHERE p.role = 'member';

COMMENT ON VIEW member_reputation_stability IS 
'Shows the value of consistent reputation vs frequent resets. High stability_score = trustworthy long-term member.';

-- Grant access
GRANT SELECT ON member_reputation_stability TO authenticated;
