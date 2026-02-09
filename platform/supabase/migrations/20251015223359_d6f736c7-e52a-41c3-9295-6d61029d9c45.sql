-- Physical badge tracking and public profile privacy
ALTER TABLE profiles
ADD COLUMN display_moniker TEXT,
ADD COLUMN show_real_name BOOLEAN DEFAULT false,
ADD COLUMN profile_is_public BOOLEAN DEFAULT true,
ADD COLUMN physical_badge_ordered BOOLEAN DEFAULT false,
ADD COLUMN physical_badge_received BOOLEAN DEFAULT false;

-- Physical badge products (members create as one of their first projects)
CREATE TABLE physical_badge_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  design_name TEXT NOT NULL,
  design_file_path TEXT,
  qr_code_data TEXT, -- Link to public profile
  badge_status TEXT DEFAULT 'designing' CHECK (badge_status IN ('designing', 'ready_for_production', 'in_production', 'shipped', 'received')),
  production_partner_id UUID,
  order_date TIMESTAMPTZ,
  shipped_date TIMESTAMPTZ,
  received_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Track member's project milestones
CREATE TABLE member_project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_count INTEGER DEFAULT 0,
  first_10_completed BOOLEAN DEFAULT false,
  physical_badge_reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Public profile visibility settings
CREATE TABLE profile_visibility_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  show_email BOOLEAN DEFAULT false,
  show_full_name BOOLEAN DEFAULT false,
  show_guilds BOOLEAN DEFAULT true,
  show_clans BOOLEAN DEFAULT true,
  show_achievements BOOLEAN DEFAULT true,
  show_reputation_score BOOLEAN DEFAULT true,
  show_skill_levels BOOLEAN DEFAULT true,
  show_project_count BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE physical_badge_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_visibility_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for physical badges
CREATE POLICY "Users can manage own badge designs"
  ON physical_badge_designs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view approved badge designs"
  ON physical_badge_designs FOR SELECT
  USING (badge_status IN ('in_production', 'shipped', 'received'));

-- RLS Policies for milestones
CREATE POLICY "Users can view own milestones"
  ON member_project_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage milestones"
  ON member_project_milestones FOR ALL
  USING (true);

-- RLS Policies for visibility settings
CREATE POLICY "Users can manage own visibility settings"
  ON profile_visibility_settings FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view visibility settings for public profiles"
  ON profile_visibility_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_visibility_settings.user_id
        AND profiles.profile_is_public = true
    )
  );

-- Function to auto-create visibility settings on profile creation
CREATE OR REPLACE FUNCTION create_default_visibility_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profile_visibility_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO member_project_milestones (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER create_visibility_settings_on_profile
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION create_default_visibility_settings();

-- Function to update project milestones
CREATE OR REPLACE FUNCTION update_member_project_count()
RETURNS TRIGGER AS $$
DECLARE
  _project_count INTEGER;
BEGIN
  -- Count completed projects
  SELECT COUNT(*) INTO _project_count
  FROM projects
  WHERE owner_id = NEW.owner_id;
  
  -- Update milestone tracking
  INSERT INTO member_project_milestones (user_id, project_count, first_10_completed)
  VALUES (
    NEW.owner_id,
    _project_count,
    _project_count >= 10
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    project_count = _project_count,
    first_10_completed = _project_count >= 10,
    physical_badge_reminder_sent = CASE
      WHEN _project_count >= 3 AND NOT member_project_milestones.physical_badge_reminder_sent
      THEN false -- Reset to trigger reminder
      ELSE member_project_milestones.physical_badge_reminder_sent
    END,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_project_milestones
AFTER INSERT OR UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_member_project_count();