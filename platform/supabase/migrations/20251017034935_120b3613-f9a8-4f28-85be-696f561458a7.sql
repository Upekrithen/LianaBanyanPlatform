-- HexIsle Skill System: Game mode + Real stakes mode with team synergy

-- User skill profile per HexIsle island
CREATE TABLE user_hexisle_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- HexIsle Island (skill category)
  island_name TEXT NOT NULL CHECK (island_name IN (
    'harvest', 'navigate', 'engineer', 'battle', 'seek', 'magic', 'train'
  )),

  -- Progression
  skill_level INTEGER NOT NULL DEFAULT 1 CHECK (skill_level >= 1 AND skill_level <= 100),
  xp_earned INTEGER NOT NULL DEFAULT 0,
  xp_to_next_level INTEGER NOT NULL DEFAULT 100,

  -- Mode tracking
  game_mode_progress INTEGER NOT NULL DEFAULT 0, -- Casual play progress
  real_stakes_progress INTEGER NOT NULL DEFAULT 0, -- Verified project work

  -- Specific skills within this category
  sub_skills JSONB DEFAULT '[]'::jsonb, -- e.g., ['fundraising', 'budgeting'] for harvest

  -- Unlocks and achievements
  island_unlocked BOOLEAN DEFAULT false,
  island_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, island_name)
);

-- Projects can be tagged with HexIsle islands
CREATE TABLE project_hexisle_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Which islands does this project cover?
  primary_island TEXT NOT NULL CHECK (primary_island IN (
    'harvest', 'navigate', 'engineer', 'battle', 'seek', 'magic', 'train'
  )),
  secondary_islands TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Skill requirements
  required_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- e.g., [{"island": "engineer", "min_level": 10, "sub_skills": ["react", "typescript"]}]

  -- Real stakes tracking
  counts_as_real_stakes BOOLEAN DEFAULT false,
  verification_required BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Team skill composition (guild/clan/project teams)
CREATE TABLE team_skill_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Team reference (can be guild, clan, or project-specific)
  team_type TEXT NOT NULL CHECK (team_type IN ('guild', 'clan', 'project_team')),
  team_id UUID NOT NULL, -- References guild_id, clan_id, or project_id

  -- Aggregated team skills across all islands
  skill_coverage JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- e.g., {"harvest": {"total_members": 3, "avg_level": 25, "max_level": 40}}

  -- Team synergy bonuses
  synergy_multiplier NUMERIC DEFAULT 1.0, -- Team gets bonuses when skills complement
  balanced_team BOOLEAN DEFAULT false, -- All 7 islands covered

  -- Weak spots
  skill_gaps TEXT[] DEFAULT ARRAY[]::TEXT[], -- Islands with no coverage

  -- Timestamps
  calculated_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(team_type, team_id)
);

-- User game mode preference
CREATE TABLE user_hexisle_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Mode selection
  preferred_mode TEXT NOT NULL DEFAULT 'casual' CHECK (preferred_mode IN ('casual', 'real_stakes', 'hybrid')),

  -- Casual mode: just playing for fun
  casual_enabled BOOLEAN DEFAULT true,
  show_game_ui BOOLEAN DEFAULT true,

  -- Real stakes: project work counts
  real_stakes_enabled BOOLEAN DEFAULT false,
  require_verification BOOLEAN DEFAULT true, -- Require proof of completion

  -- Privacy
  public_profile BOOLEAN DEFAULT true,
  show_on_leaderboards BOOLEAN DEFAULT true,

  -- Notifications
  notify_on_level_up BOOLEAN DEFAULT true,
  notify_on_unlock BOOLEAN DEFAULT true,
  notify_on_team_achievement BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Skill verification for real stakes mode
CREATE TABLE hexisle_skill_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

  -- What skill/island is being verified?
  island_name TEXT NOT NULL,
  skill_claimed TEXT NOT NULL, -- Specific skill within the island

  -- Evidence
  evidence_type TEXT NOT NULL CHECK (evidence_type IN (
    'project_completion', 'peer_review', 'portfolio', 'contract_completion', 'assessment'
  )),
  evidence_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Verification status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- XP awarded
  xp_awarded INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Unlock achievements when progressing through islands
CREATE TABLE hexisle_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  achievement_type TEXT NOT NULL CHECK (achievement_type IN (
    'island_unlock', 'island_complete', 'skill_mastery', 'team_synergy',
    'guild_achievement', 'cross_island', 'real_stakes_verified'
  )),

  -- Details
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  island_name TEXT, -- Which island if applicable

  -- Rewards
  xp_bonus INTEGER DEFAULT 0,
  credit_bonus NUMERIC DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  earned_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_hexisle_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_hexisle_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_skill_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_hexisle_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE hexisle_skill_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE hexisle_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own skills" ON user_hexisle_skills
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own skills" ON user_hexisle_skills
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Public profiles viewable" ON user_hexisle_skills
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_hexisle_preferences
      WHERE user_id = user_hexisle_skills.user_id
      AND public_profile = true
    )
  );

CREATE POLICY "Anyone can view project mappings" ON project_hexisle_mapping
  FOR SELECT USING (true);

CREATE POLICY "Project owners can manage mappings" ON project_hexisle_mapping
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_hexisle_mapping.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Team members can view team profiles" ON team_skill_profiles
  FOR SELECT USING (
    (team_type = 'guild' AND EXISTS (
      SELECT 1 FROM guild_members
      WHERE guild_id = team_skill_profiles.team_id::uuid
      AND user_id = auth.uid()
    ))
    OR (team_type = 'clan' AND EXISTS (
      SELECT 1 FROM clan_members
      WHERE clan_id = team_skill_profiles.team_id::uuid
      AND user_id = auth.uid()
    ))
    OR (team_type = 'project_team' AND EXISTS (
      SELECT 1 FROM project_member_contracts
      WHERE project_id = team_skill_profiles.team_id::uuid
      AND member_id = auth.uid()
    ))
  );

CREATE POLICY "Users manage own preferences" ON user_hexisle_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own verifications" ON hexisle_skill_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can submit verifications" ON hexisle_skill_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can verify skills" ON hexisle_skill_verifications
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users view own achievements" ON hexisle_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Function to calculate team skill coverage
CREATE OR REPLACE FUNCTION calculate_team_skills(_team_type TEXT, _team_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _member_ids UUID[];
  _coverage JSONB := '{}'::jsonb;
  _island RECORD;
  _balanced BOOLEAN := true;
BEGIN
  -- Get team member IDs based on team type
  IF _team_type = 'guild' THEN
    SELECT ARRAY_AGG(user_id) INTO _member_ids
    FROM guild_members WHERE guild_id = _team_id AND is_active = true;
  ELSIF _team_type = 'clan' THEN
    SELECT ARRAY_AGG(user_id) INTO _member_ids
    FROM clan_members WHERE clan_id = _team_id AND is_active = true;
  ELSIF _team_type = 'project_team' THEN
    SELECT ARRAY_AGG(member_id) INTO _member_ids
    FROM project_member_contracts WHERE project_id = _team_id AND status = 'active';
  END IF;

  -- Calculate coverage for each island
  FOR _island IN
    SELECT
      island_name,
      COUNT(DISTINCT user_id) as member_count,
      ROUND(AVG(skill_level)) as avg_level,
      MAX(skill_level) as max_level,
      SUM(xp_earned) as total_xp
    FROM user_hexisle_skills
    WHERE user_id = ANY(_member_ids)
    GROUP BY island_name
  LOOP
    _coverage := _coverage || jsonb_build_object(
      _island.island_name,
      jsonb_build_object(
        'member_count', _island.member_count,
        'avg_level', _island.avg_level,
        'max_level', _island.max_level,
        'total_xp', _island.total_xp
      )
    );

    -- Check if island is missing
    IF _island.member_count = 0 THEN
      _balanced := false;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'coverage', _coverage,
    'balanced', _balanced
  );
END;
$$;

-- Function to award XP and level up
CREATE OR REPLACE FUNCTION award_hexisle_xp(
  _user_id UUID,
  _island_name TEXT,
  _xp_amount INTEGER,
  _is_real_stakes BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _skill RECORD;
  _leveled_up BOOLEAN := false;
  _new_level INTEGER;
BEGIN
  -- Get current skill state
  SELECT * INTO _skill
  FROM user_hexisle_skills
  WHERE user_id = _user_id AND island_name = _island_name;

  IF NOT FOUND THEN
    -- Create new skill entry
    INSERT INTO user_hexisle_skills (user_id, island_name, xp_earned)
    VALUES (_user_id, _island_name, _xp_amount)
    RETURNING * INTO _skill;
  ELSE
    -- Add XP
    UPDATE user_hexisle_skills
    SET
      xp_earned = xp_earned + _xp_amount,
      game_mode_progress = CASE WHEN NOT _is_real_stakes THEN game_mode_progress + _xp_amount ELSE game_mode_progress END,
      real_stakes_progress = CASE WHEN _is_real_stakes THEN real_stakes_progress + _xp_amount ELSE real_stakes_progress END
    WHERE user_id = _user_id AND island_name = _island_name
    RETURNING * INTO _skill;
  END IF;

  -- Check for level up
  WHILE _skill.xp_earned >= _skill.xp_to_next_level LOOP
    _leveled_up := true;
    _new_level := _skill.skill_level + 1;

    UPDATE user_hexisle_skills
    SET
      skill_level = _new_level,
      xp_to_next_level = xp_to_next_level + (100 * _new_level), -- Exponential scaling
      updated_at = now()
    WHERE user_id = _user_id AND island_name = _island_name
    RETURNING * INTO _skill;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'xp_awarded', _xp_amount,
    'new_xp_total', _skill.xp_earned,
    'leveled_up', _leveled_up,
    'current_level', _skill.skill_level
  );
END;
$$;

-- Trigger to update team profiles when member skills change
CREATE OR REPLACE FUNCTION update_team_skill_profiles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update guild team profiles
  UPDATE team_skill_profiles
  SET
    skill_coverage = calculate_team_skills('guild', team_id::uuid),
    updated_at = now()
  WHERE team_type = 'guild'
    AND team_id::uuid IN (
      SELECT guild_id FROM guild_members WHERE user_id = NEW.user_id
    );

  -- Update clan team profiles
  UPDATE team_skill_profiles
  SET
    skill_coverage = calculate_team_skills('clan', team_id::uuid),
    updated_at = now()
  WHERE team_type = 'clan'
    AND team_id::uuid IN (
      SELECT clan_id FROM clan_members WHERE user_id = NEW.user_id
    );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_hexisle_skill_update
  AFTER INSERT OR UPDATE ON user_hexisle_skills
  FOR EACH ROW
  EXECUTE FUNCTION update_team_skill_profiles();

COMMENT ON TABLE user_hexisle_skills IS 'Individual user progress across 7 HexIsle skill islands';
COMMENT ON TABLE project_hexisle_mapping IS 'Maps real projects to HexIsle islands for real stakes mode';
COMMENT ON TABLE team_skill_profiles IS 'Aggregated skill coverage for guilds, clans, and project teams';
COMMENT ON TABLE user_hexisle_preferences IS 'User preferences for casual vs real stakes gameplay';
COMMENT ON TABLE hexisle_skill_verifications IS 'Verification system for real stakes skill claims';
