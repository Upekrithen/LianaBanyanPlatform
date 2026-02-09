-- Create enum types for reputation system
CREATE TYPE reputation_status AS ENUM ('pending', 'active', 'disputed', 'overturned', 'corrected');
CREATE TYPE dispute_status AS ENUM ('pending', 'under_review', 'resolved', 'rejected');
CREATE TYPE guild_type AS ENUM ('division', 'industry', 'skill');

-- Project type reputation weights (customizable per project type)
CREATE TABLE public.project_type_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_type TEXT NOT NULL UNIQUE, -- e.g., 'creative', 'manufacturing', 'technical'
  quality_weight NUMERIC NOT NULL DEFAULT 40.0,
  timeliness_weight NUMERIC NOT NULL DEFAULT 20.0,
  professionalism_weight NUMERIC NOT NULL DEFAULT 20.0,
  collaboration_weight NUMERIC NOT NULL DEFAULT 10.0,
  standards_compliance_weight NUMERIC NOT NULL DEFAULT 10.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Individual reputation ratings (interaction-based)
CREATE TABLE public.reputation_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ratee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'contract_completion', 'collaboration', 'review'
  
  -- Rating factors (0-5 scale)
  quality_rating NUMERIC NOT NULL DEFAULT 5.0 CHECK (quality_rating BETWEEN 0 AND 5),
  timeliness_rating NUMERIC NOT NULL DEFAULT 5.0 CHECK (timeliness_rating BETWEEN 0 AND 5),
  professionalism_rating NUMERIC NOT NULL DEFAULT 5.0 CHECK (professionalism_rating BETWEEN 0 AND 5),
  collaboration_rating NUMERIC NOT NULL DEFAULT 5.0 CHECK (collaboration_rating BETWEEN 0 AND 5),
  standards_compliance_rating NUMERIC NOT NULL DEFAULT 5.0 CHECK (standards_compliance_rating BETWEEN 0 AND 5),
  
  -- Composite score (weighted average)
  composite_score NUMERIC NOT NULL DEFAULT 5.0,
  
  -- Weighted impact (adjusted by rater's reputation)
  rater_reputation_weight NUMERIC NOT NULL DEFAULT 1.0,
  weighted_score NUMERIC NOT NULL DEFAULT 5.0,
  
  status reputation_status NOT NULL DEFAULT 'pending',
  is_positive BOOLEAN NOT NULL DEFAULT true, -- Auto-green unless changed
  correction_count INTEGER NOT NULL DEFAULT 0 CHECK (correction_count <= 1), -- Max 1 correction per rating
  
  -- Comments and disputes
  comment TEXT,
  dispute_reason TEXT,
  rebuttal_statement TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  visible_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '48 hours'), -- 48hr grace period
  permanent_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'), -- Permanent after 7 days
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(project_id, rater_id, ratee_id, interaction_type, created_at)
);

-- Aggregated reputation scores per user
CREATE TABLE public.reputation_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL DEFAULT 'individual' CHECK (account_type IN ('individual', 'business')),
  
  -- Interaction counts
  total_interactions INTEGER NOT NULL DEFAULT 0,
  positive_interactions INTEGER NOT NULL DEFAULT 0,
  negative_interactions INTEGER NOT NULL DEFAULT 0,
  corrected_interactions INTEGER NOT NULL DEFAULT 0,
  
  -- Visual scaling levels (calculated from total_interactions)
  level_1_blocks INTEGER NOT NULL DEFAULT 0, -- Individual interactions
  level_2_blocks INTEGER NOT NULL DEFAULT 0, -- 5 Level 1 = 1 Level 2 (5 total)
  level_3_blocks INTEGER NOT NULL DEFAULT 0, -- 5 Level 2 = 1 Level 3 (25 total)
  stars INTEGER NOT NULL DEFAULT 0, -- 5 Level 3 = 1 Star (125 total)
  suns INTEGER NOT NULL DEFAULT 0, -- 5 Stars = 1 Sun (625 total for individual, 6250 for business)
  
  -- Overall reputation score (0-5 scale, weighted average)
  overall_score NUMERIC NOT NULL DEFAULT 5.0 CHECK (overall_score BETWEEN 0 AND 5),
  
  -- Category scores (cross-project standard)
  criteria_quality_score NUMERIC NOT NULL DEFAULT 5.0,
  criteria_timeliness_score NUMERIC NOT NULL DEFAULT 5.0,
  criteria_professionalism_score NUMERIC NOT NULL DEFAULT 5.0,
  criteria_collaboration_score NUMERIC NOT NULL DEFAULT 5.0,
  criteria_standards_score NUMERIC NOT NULL DEFAULT 5.0,
  
  -- Committee eligibility
  eligible_for_committee BOOLEAN NOT NULL DEFAULT false,
  committee_eligible_since TIMESTAMPTZ,
  
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Reputation disputes (when ratings are challenged)
CREATE TABLE public.reputation_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating_id UUID NOT NULL REFERENCES public.reputation_ratings(id) ON DELETE CASCADE,
  dispute_filed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dispute_reason TEXT NOT NULL,
  supporting_evidence JSONB,
  
  status dispute_status NOT NULL DEFAULT 'pending',
  committee_notes TEXT,
  resolution_notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  
  UNIQUE(rating_id)
);

-- Committee votes on disputes
CREATE TABLE public.reputation_committee_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES public.reputation_disputes(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voter_role TEXT NOT NULL, -- 'steward', 'hr', 'high_rep_member'
  vote_weight NUMERIC NOT NULL DEFAULT 1.0, -- Stewards=2, HR=1, Members=1
  vote_decision TEXT NOT NULL CHECK (vote_decision IN ('overturn', 'uphold')),
  vote_comment TEXT,
  
  voted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(dispute_id, voter_id)
);

-- Guild system for reputation and governance
CREATE TABLE public.guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  guild_type guild_type NOT NULL,
  parent_guild_id UUID REFERENCES public.guilds(id) ON DELETE CASCADE,
  
  description TEXT,
  min_reputation_score NUMERIC NOT NULL DEFAULT 3.0,
  min_interactions INTEGER NOT NULL DEFAULT 10,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Guild membership
CREATE TABLE public.guild_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  UNIQUE(guild_id, user_id)
);

-- Guild representatives (elected by reputation + ranked choice)
CREATE TABLE public.guild_representatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  representative_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  election_type TEXT NOT NULL, -- 'ranked_choice'
  elected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  term_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  term_end TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  UNIQUE(guild_id, representative_id, term_start)
);

-- Division councils (representatives from guilds)
CREATE TABLE public.division_councils (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division_name TEXT NOT NULL,
  council_member_id UUID NOT NULL REFERENCES public.guild_representatives(id) ON DELETE CASCADE,
  
  appointed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  UNIQUE(division_name, council_member_id)
);

-- Liana Banyan Board Members (elected from division councils)
CREATE TABLE public.banyan_board_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  council_id UUID NOT NULL REFERENCES public.division_councils(id) ON DELETE CASCADE,
  board_member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  elected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  term_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  term_end TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  UNIQUE(board_member_id, term_start)
);

-- Indexes for performance
CREATE INDEX idx_reputation_ratings_ratee ON public.reputation_ratings(ratee_id);
CREATE INDEX idx_reputation_ratings_project ON public.reputation_ratings(project_id);
CREATE INDEX idx_reputation_ratings_status ON public.reputation_ratings(status);
CREATE INDEX idx_reputation_ratings_visible ON public.reputation_ratings(visible_at);
CREATE INDEX idx_reputation_scores_user ON public.reputation_scores(user_id);
CREATE INDEX idx_guild_members_guild ON public.guild_members(guild_id);
CREATE INDEX idx_guild_members_user ON public.guild_members(user_id);

-- Enable RLS
ALTER TABLE public.project_type_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_committee_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_representatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.division_councils ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banyan_board_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Project type weights (admins manage, everyone views)
CREATE POLICY "Anyone can view project type weights" ON public.project_type_weights FOR SELECT USING (true);
CREATE POLICY "Admins can manage project type weights" ON public.project_type_weights FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Reputation ratings (visible after grace period)
CREATE POLICY "Anyone can view visible ratings" ON public.reputation_ratings 
  FOR SELECT USING (visible_at <= now());
CREATE POLICY "Users can create ratings" ON public.reputation_ratings 
  FOR INSERT WITH CHECK (rater_id = auth.uid());
CREATE POLICY "Users can update own pending ratings" ON public.reputation_ratings 
  FOR UPDATE USING (rater_id = auth.uid() AND status = 'pending' AND permanent_at > now());

-- Reputation scores (public visibility)
CREATE POLICY "Anyone can view reputation scores" ON public.reputation_scores FOR SELECT USING (true);
CREATE POLICY "Users can view own scores" ON public.reputation_scores FOR SELECT USING (user_id = auth.uid());

-- Disputes
CREATE POLICY "Anyone can view disputes" ON public.reputation_disputes FOR SELECT USING (true);
CREATE POLICY "Users can file disputes" ON public.reputation_disputes 
  FOR INSERT WITH CHECK (dispute_filed_by = auth.uid());

-- Committee votes
CREATE POLICY "Committee members can vote" ON public.reputation_committee_votes 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reputation_scores
      WHERE user_id = auth.uid() AND eligible_for_committee = true
    )
    OR EXISTS (
      SELECT 1 FROM public.project_member_contracts
      WHERE member_id = auth.uid() AND status = 'active' 
        AND (LOWER(contract_title) = 'steward' OR LOWER(contract_title) = 'hr')
    )
  );
CREATE POLICY "Anyone can view committee votes" ON public.reputation_committee_votes FOR SELECT USING (true);

-- Guilds (public visibility)
CREATE POLICY "Anyone can view guilds" ON public.guilds FOR SELECT USING (true);
CREATE POLICY "Admins can manage guilds" ON public.guilds FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Guild members
CREATE POLICY "Anyone can view guild members" ON public.guild_members FOR SELECT USING (true);
CREATE POLICY "Users can join guilds" ON public.guild_members 
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Guild representatives (public visibility)
CREATE POLICY "Anyone can view representatives" ON public.guild_representatives FOR SELECT USING (true);

-- Division councils (public visibility)
CREATE POLICY "Anyone can view division councils" ON public.division_councils FOR SELECT USING (true);

-- Board members (public visibility)
CREATE POLICY "Anyone can view board members" ON public.banyan_board_members FOR SELECT USING (true);

-- Insert default project type weights
INSERT INTO public.project_type_weights (project_type, quality_weight, timeliness_weight, professionalism_weight, collaboration_weight, standards_compliance_weight)
VALUES 
  ('creative', 50.0, 15.0, 15.0, 15.0, 5.0),
  ('manufacturing', 40.0, 25.0, 15.0, 10.0, 10.0),
  ('technical', 35.0, 20.0, 20.0, 15.0, 10.0),
  ('default', 40.0, 20.0, 20.0, 10.0, 10.0);

-- Insert example guild structure (Industry Division → Industry Guild → Skill Guilds)
INSERT INTO public.guilds (name, guild_type, parent_guild_id, description)
VALUES 
  ('Industry Division', 'division', NULL, 'Manufacturing and production division'),
  ('Creative Division', 'division', NULL, 'Creative and design division'),
  ('Technical Division', 'division', NULL, 'Technical and engineering division');

-- Get Industry Division ID for child guilds
DO $$
DECLARE
  industry_div_id UUID;
BEGIN
  SELECT id INTO industry_div_id FROM public.guilds WHERE name = 'Industry Division';
  
  INSERT INTO public.guilds (name, guild_type, parent_guild_id, description)
  VALUES 
    ('Industry Guild', 'industry', industry_div_id, 'General manufacturing and industry'),
    ('Woodworking Guild', 'skill', (SELECT id FROM public.guilds WHERE name = 'Industry Guild'), 'Woodworking and carpentry skills'),
    ('3D Printing Guild', 'skill', (SELECT id FROM public.guilds WHERE name = 'Industry Guild'), '3D printing and additive manufacturing');
END $$;

-- Trigger to update reputation scores timestamp
CREATE TRIGGER update_reputation_scores_updated_at
  BEFORE UPDATE ON public.reputation_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_guilds_updated_at
  BEFORE UPDATE ON public.guilds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();