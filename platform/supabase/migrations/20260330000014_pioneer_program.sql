-- K184: Cue Card Pioneer Program (#2104)
-- Diminishing-reward system for first adopters of each Cue Card role.

-- Pioneer tier lookup (static reference)
CREATE TABLE IF NOT EXISTS pioneer_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL UNIQUE,
  min_number INTEGER NOT NULL,
  max_number INTEGER NOT NULL,
  monthly_bonus INTEGER NOT NULL,
  duration_months INTEGER NOT NULL,
  requires_real_name BOOLEAN DEFAULT false,
  gets_medallion BOOLEAN DEFAULT false
);

INSERT INTO pioneer_tiers (tier, min_number, max_number, monthly_bonus, duration_months, requires_real_name, gets_medallion) VALUES
  ('founders_circle', 1, 10, 50, 12, true, true),
  ('trailblazer', 11, 100, 25, 6, false, false),
  ('pathfinder', 101, 500, 10, 3, false, false),
  ('early_adopter', 501, 1000, 5, 0, false, false),
  ('standard', 1001, 999999, 0, 0, false, false)
ON CONFLICT (tier) DO NOTHING;

-- Pioneer registry
CREATE TABLE IF NOT EXISTS pioneers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL,
  cue_card_role TEXT NOT NULL,
  pioneer_number INTEGER NOT NULL,
  tier TEXT NOT NULL REFERENCES pioneer_tiers(tier),
  monthly_bonus_marks INTEGER NOT NULL DEFAULT 0,
  bonus_duration_months INTEGER NOT NULL DEFAULT 0,
  bonus_started_at TIMESTAMPTZ DEFAULT now(),
  bonus_expires_at TIMESTAMPTZ,
  opted_in_showcase BOOLEAN DEFAULT false,
  showcase_real_name BOOLEAN DEFAULT false,
  showcase_story TEXT,
  medallion_serial TEXT,
  medallion_shipped BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, cue_card_role),
  UNIQUE(cue_card_role, pioneer_number)
);

CREATE INDEX IF NOT EXISTS idx_pioneers_role ON pioneers(cue_card_role);
CREATE INDEX IF NOT EXISTS idx_pioneers_tier ON pioneers(tier);
CREATE INDEX IF NOT EXISTS idx_pioneers_member ON pioneers(member_id);

-- RLS
ALTER TABLE pioneers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pioneer_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pioneer tiers" ON pioneer_tiers FOR SELECT USING (true);
CREATE POLICY "Anyone can read pioneers" ON pioneers FOR SELECT USING (true);
CREATE POLICY "Members update own pioneer row" ON pioneers FOR UPDATE USING (auth.uid() = member_id);

-- Auto-assignment function: call from Edge Functions or client after first role action
CREATE OR REPLACE FUNCTION assign_pioneer(p_member_id UUID, p_role TEXT)
RETURNS TABLE(pioneer_number INTEGER, tier TEXT, monthly_bonus INTEGER) AS $$
DECLARE
  v_next_number INTEGER;
  v_tier RECORD;
  v_expiry TIMESTAMPTZ;
BEGIN
  -- Already a pioneer for this role?
  IF EXISTS (SELECT 1 FROM pioneers WHERE member_id = p_member_id AND cue_card_role = p_role) THEN
    RETURN QUERY SELECT p2.pioneer_number, p2.tier, p2.monthly_bonus_marks
      FROM pioneers p2 WHERE p2.member_id = p_member_id AND p2.cue_card_role = p_role;
    RETURN;
  END IF;

  -- Next number (serialized via advisory lock)
  PERFORM pg_advisory_xact_lock(hashtext(p_role));
  SELECT COALESCE(MAX(p3.pioneer_number), 0) + 1 INTO v_next_number FROM pioneers p3 WHERE p3.cue_card_role = p_role;

  -- Look up tier
  SELECT * INTO v_tier FROM pioneer_tiers pt
    WHERE pt.min_number <= v_next_number AND pt.max_number >= v_next_number
    LIMIT 1;

  IF v_tier IS NULL THEN
    SELECT * INTO v_tier FROM pioneer_tiers pt WHERE pt.tier = 'standard';
  END IF;

  v_expiry := CASE WHEN v_tier.duration_months > 0
    THEN now() + (v_tier.duration_months || ' months')::INTERVAL
    ELSE NULL END;

  INSERT INTO pioneers (member_id, cue_card_role, pioneer_number, tier, monthly_bonus_marks, bonus_duration_months, bonus_expires_at, medallion_serial)
  VALUES (
    p_member_id, p_role, v_next_number, v_tier.tier, v_tier.monthly_bonus,
    v_tier.duration_months, v_expiry,
    CASE WHEN v_tier.gets_medallion THEN 'PIONEER-' || UPPER(REPLACE(p_role, '_', '-')) || '-' || LPAD(v_next_number::TEXT, 3, '0') ELSE NULL END
  );

  RETURN QUERY SELECT v_next_number, v_tier.tier, v_tier.monthly_bonus;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Innovation log
INSERT INTO innovation_log (innovation_number, title, description, category, status)
VALUES (2108, 'Cue Card Pioneer Program', 'Diminishing-reward system — first 10 get Founders'' Circle with monthly Marks bonuses, medallions, and showcase slots. Rewards taper to zero at 1,000 practitioners.', 'economic_engine', 'implemented')
ON CONFLICT (innovation_number) DO NOTHING;

-- Canonical stats bump
UPDATE platform_canonical SET value = 2108 WHERE key = 'innovation_count';
