-- K114: Cooperative Buying Coalitions
-- Separate from the existing business_coalitions / coalition_members tables which handle business-level alliances.
-- These tables track cooperative buying groups where individual members pool purchasing power.

CREATE TABLE IF NOT EXISTS buying_coalitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT,
  creator_id UUID REFERENCES auth.users(id) NOT NULL,
  min_members INT DEFAULT 5,
  current_members INT DEFAULT 1,
  discount_tier NUMERIC(4,2) DEFAULT 0,
  treasury_credits INT DEFAULT 0,
  status TEXT DEFAULT 'forming' CHECK (status IN ('forming', 'active', 'paused', 'dissolved')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS buying_coalition_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coalition_id UUID REFERENCES buying_coalitions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  role TEXT DEFAULT 'member' CHECK (role IN ('founder', 'officer', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(coalition_id, user_id)
);

ALTER TABLE buying_coalitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE buying_coalition_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view buying coalitions"
  ON buying_coalitions FOR SELECT USING (true);

CREATE POLICY "Creator manages buying coalition"
  ON buying_coalitions FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "Anyone can view buying coalition members"
  ON buying_coalition_members FOR SELECT USING (true);

CREATE POLICY "Members manage own buying coalition membership"
  ON buying_coalition_members FOR ALL USING (auth.uid() = user_id);

-- Auto-update coalition member count + discount tier on membership changes
CREATE OR REPLACE FUNCTION update_buying_coalition_stats() RETURNS TRIGGER AS $$
DECLARE
  member_count INT;
  new_discount NUMERIC(4,2);
BEGIN
  SELECT COUNT(*) INTO member_count
  FROM buying_coalition_members
  WHERE coalition_id = COALESCE(NEW.coalition_id, OLD.coalition_id);

  IF member_count >= 50 THEN new_discount := 20.00;
  ELSIF member_count >= 25 THEN new_discount := 15.00;
  ELSIF member_count >= 10 THEN new_discount := 10.00;
  ELSIF member_count >= 5 THEN new_discount := 5.00;
  ELSE new_discount := 0;
  END IF;

  UPDATE buying_coalitions SET
    current_members = member_count,
    discount_tier = new_discount,
    status = CASE
      WHEN member_count >= (SELECT min_members FROM buying_coalitions WHERE id = COALESCE(NEW.coalition_id, OLD.coalition_id))
      THEN 'active' ELSE 'forming' END
  WHERE id = COALESCE(NEW.coalition_id, OLD.coalition_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_buying_coalition_member_stats ON buying_coalition_members;
CREATE TRIGGER trg_buying_coalition_member_stats
  AFTER INSERT OR DELETE ON buying_coalition_members
  FOR EACH ROW EXECUTE FUNCTION update_buying_coalition_stats();
