-- Add clan status tracking and charter enforcement
ALTER TABLE clans
ADD COLUMN status TEXT DEFAULT 'forming' CHECK (status IN ('forming', 'charter_pending', 'active', 'inactive')),
ADD COLUMN charter_required_signatures INTEGER DEFAULT 2,
ADD COLUMN charter_current_signatures INTEGER DEFAULT 0,
ADD COLUMN activated_at TIMESTAMPTZ;

-- Create clan achievement badges table
CREATE TABLE clan_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id UUID REFERENCES clans(id) ON DELETE CASCADE NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  awarded_at TIMESTAMPTZ DEFAULT now(),
  icon_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create unified badge achievements table for users
CREATE TABLE user_badge_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_category TEXT NOT NULL, -- 'lb_achievement', 'guild', 'lone_wolf', 'skill', 'clan'
  achievement_level INTEGER,
  achievement_name TEXT NOT NULL,
  achievement_icon TEXT,
  awarded_at TIMESTAMPTZ DEFAULT now(),
  visible_on_badge BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Update charter signatories to track which charter
ALTER TABLE charter_signatories
ADD COLUMN charter_type TEXT DEFAULT 'guild',
ADD CONSTRAINT charter_unique UNIQUE(charter_id, user_id);

-- Create clan agreement beneficiaries tracking
CREATE TABLE clan_agreement_beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID REFERENCES clan_member_agreements(id) ON DELETE CASCADE NOT NULL,
  beneficiary_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(agreement_id, beneficiary_user_id)
);

-- Enable RLS
ALTER TABLE clan_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badge_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE clan_agreement_beneficiaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clan achievements
CREATE POLICY "Anyone can view clan achievements"
  ON clan_achievements FOR SELECT
  USING (true);

CREATE POLICY "Clan members can manage achievements"
  ON clan_achievements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM clan_members
      WHERE clan_members.clan_id = clan_achievements.clan_id
        AND clan_members.user_id = auth.uid()
    )
  );

-- RLS Policies for user badge achievements
CREATE POLICY "Users can view own badge achievements"
  ON user_badge_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view visible badges"
  ON user_badge_achievements FOR SELECT
  USING (visible_on_badge = true);

CREATE POLICY "Users can manage own achievements"
  ON user_badge_achievements FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for agreement beneficiaries
CREATE POLICY "Clan members can view agreement beneficiaries"
  ON clan_agreement_beneficiaries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clan_member_agreements cma
      JOIN clan_members cm ON cm.clan_id = cma.clan_id
      WHERE cma.id = clan_agreement_beneficiaries.agreement_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Agreement creators can manage beneficiaries"
  ON clan_agreement_beneficiaries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM clan_member_agreements
      WHERE clan_member_agreements.id = clan_agreement_beneficiaries.agreement_id
        AND clan_member_agreements.created_by = auth.uid()
    )
  );

-- Function to update clan status when charter is signed
CREATE OR REPLACE FUNCTION update_clan_charter_status()
RETURNS TRIGGER AS $$
DECLARE
  _clan_id UUID;
  _required_sigs INTEGER;
  _current_sigs INTEGER;
BEGIN
  -- Get clan_id from charter
  SELECT clan_id INTO _clan_id
  FROM clan_charters
  WHERE id = NEW.charter_id;

  IF _clan_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Count current signatures
  SELECT COUNT(*) INTO _current_sigs
  FROM charter_signatories
  WHERE charter_id = NEW.charter_id;

  -- Get required signatures
  SELECT charter_required_signatures INTO _required_sigs
  FROM clans
  WHERE id = _clan_id;

  -- Update clan
  UPDATE clans
  SET charter_current_signatures = _current_sigs,
      status = CASE
        WHEN _current_sigs >= _required_sigs THEN 'charter_pending'
        ELSE status
      END
  WHERE id = _clan_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_clan_charter_on_signature
AFTER INSERT ON charter_signatories
FOR EACH ROW
EXECUTE FUNCTION update_clan_charter_status();

-- Function to activate clan when charter is approved
CREATE OR REPLACE FUNCTION activate_clan_on_charter_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true AND OLD.is_active = false THEN
    UPDATE clans
    SET status = 'active',
        activated_at = now()
    WHERE charter_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER activate_clan_on_charter
AFTER UPDATE ON clan_charters
FOR EACH ROW
EXECUTE FUNCTION activate_clan_on_charter_approval();
