-- ================================================================
-- SIDE QUESTS — Universal Flexible Work System
-- ================================================================
-- Innovation #1550: Side Quests System (Session 8B)
--
-- Flexible micro-tasks that anyone can complete for currency rewards.
-- Integrates with: Three-Gear Currency, Position System, HexIsle XP,
-- Boaz Principle (gleaning for credential-poor members).
--
-- SEC-safe: All rewards are service Credits/Marks/Joules, not securities.
-- ================================================================

-- ─────────────────────────────────────────────────────────────────
-- CORE TABLES
-- ─────────────────────────────────────────────────────────────────

-- Quest definitions — what work needs doing
CREATE TABLE IF NOT EXISTS public.side_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_instructions TEXT,

  -- Categorization
  category TEXT NOT NULL DEFAULT 'community'
    CHECK (category IN (
      'harvest', 'navigate', 'engineer', 'battle', 'seek', 'magic',
      'train', 'design', 'marketing', 'documentation', 'testing', 'community'
    )),
  difficulty TEXT NOT NULL DEFAULT 'beginner'
    CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  quest_type TEXT NOT NULL DEFAULT 'one_time'
    CHECK (quest_type IN ('one_time', 'repeatable', 'daily', 'weekly', 'seasonal')),

  -- Rewards (Three-Gear Currency)
  reward_credits NUMERIC DEFAULT 0,    -- Credits earned on completion
  reward_marks NUMERIC DEFAULT 0,      -- Marks cleared on completion
  reward_joules NUMERIC DEFAULT 0,     -- Joules earned on completion
  hexisle_xp INTEGER DEFAULT 0,        -- HexIsle experience points

  -- Constraints
  max_claims INTEGER,                  -- NULL = unlimited
  max_completions_per_user INTEGER DEFAULT 1,
  time_limit_hours INTEGER,            -- NULL = no deadline per claim
  requires_approval BOOLEAN DEFAULT FALSE,  -- Does a reviewer need to approve?

  -- Prerequisites (Boaz Principle: low barriers by default)
  min_reputation_level INTEGER DEFAULT 0,   -- 0 = open to all (gleaning)
  min_membership_days INTEGER DEFAULT 0,    -- 0 = day-one accessible
  required_guild TEXT,                      -- NULL = any guild
  required_skills JSONB DEFAULT '[]',       -- skill tags

  -- Metadata
  initiative_slug TEXT,                -- links to Sweet Sixteen initiative
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  position_category TEXT,              -- links to position system

  -- Status
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  featured BOOLEAN DEFAULT FALSE,

  -- Ownership
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ              -- NULL = never expires
);

-- Quest claims — who's working on what
CREATE TABLE IF NOT EXISTS public.side_quest_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES public.side_quests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Progress tracking
  status TEXT NOT NULL DEFAULT 'claimed'
    CHECK (status IN ('claimed', 'in_progress', 'submitted', 'approved', 'rejected', 'expired', 'abandoned')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),

  -- Deliverable
  proof_url TEXT,                      -- link to completed work
  proof_description TEXT,              -- text description of deliverable
  proof_metadata JSONB DEFAULT '{}',   -- additional structured proof

  -- Review
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,

  -- Reward tracking
  reward_granted BOOLEAN DEFAULT FALSE,
  credits_awarded NUMERIC DEFAULT 0,
  marks_cleared NUMERIC DEFAULT 0,
  joules_awarded NUMERIC DEFAULT 0,
  xp_awarded INTEGER DEFAULT 0,

  -- Timestamps
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,              -- calculated from quest time_limit_hours

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate active claims
  CONSTRAINT unique_active_claim UNIQUE (quest_id, user_id)
);

-- Benefits log — audit trail for all rewards distributed
CREATE TABLE IF NOT EXISTS public.side_quest_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.side_quest_claims(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES public.side_quests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- What was awarded
  benefit_type TEXT NOT NULL CHECK (benefit_type IN ('credits', 'marks', 'joules', 'xp', 'badge', 'medallion')),
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT,

  -- Audit
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Transaction reference (links to credit_transactions if applicable)
  transaction_id UUID REFERENCES public.credit_transactions(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_side_quests_status ON public.side_quests(status);
CREATE INDEX IF NOT EXISTS idx_side_quests_category ON public.side_quests(category);
CREATE INDEX IF NOT EXISTS idx_side_quests_difficulty ON public.side_quests(difficulty);
CREATE INDEX IF NOT EXISTS idx_side_quests_featured ON public.side_quests(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_side_quests_initiative ON public.side_quests(initiative_slug) WHERE initiative_slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_side_quest_claims_user ON public.side_quest_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_side_quest_claims_quest ON public.side_quest_claims(quest_id);
CREATE INDEX IF NOT EXISTS idx_side_quest_claims_status ON public.side_quest_claims(status);

CREATE INDEX IF NOT EXISTS idx_side_quest_benefits_user ON public.side_quest_benefits(user_id);
CREATE INDEX IF NOT EXISTS idx_side_quest_benefits_quest ON public.side_quest_benefits(quest_id);

-- ─────────────────────────────────────────────────────────────────
-- RLS POLICIES
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE public.side_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.side_quest_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.side_quest_benefits ENABLE ROW LEVEL SECURITY;

-- Anyone can browse active quests
CREATE POLICY "Anyone can view active quests"
  ON public.side_quests FOR SELECT
  USING (status = 'active');

-- Authenticated users can create quests (subject to approval)
CREATE POLICY "Authenticated users can create quests"
  ON public.side_quests FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Quest creators can update their own quests
CREATE POLICY "Creators can update own quests"
  ON public.side_quests FOR UPDATE
  USING (auth.uid() = created_by);

-- Users can view their own claims
CREATE POLICY "Users can view own claims"
  ON public.side_quest_claims FOR SELECT
  USING (auth.uid() = user_id);

-- Quest creators and reviewers can view claims for their quests
CREATE POLICY "Quest owners can view quest claims"
  ON public.side_quest_claims FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.side_quests q
      WHERE q.id = side_quest_claims.quest_id
      AND q.created_by = auth.uid()
    )
  );

-- Authenticated users can claim quests
CREATE POLICY "Users can claim quests"
  ON public.side_quest_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own claims (submit, abandon)
CREATE POLICY "Users can update own claims"
  ON public.side_quest_claims FOR UPDATE
  USING (auth.uid() = user_id);

-- Reviewers can update claims they're reviewing
CREATE POLICY "Reviewers can update claims"
  ON public.side_quest_claims FOR UPDATE
  USING (auth.uid() = reviewer_id);

-- Users can view their own benefits
CREATE POLICY "Users can view own benefits"
  ON public.side_quest_benefits FOR SELECT
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────
-- AUTO-UPDATE TIMESTAMPS
-- ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_side_quest_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_side_quest_updated ON public.side_quests;
CREATE TRIGGER set_side_quest_updated
  BEFORE UPDATE ON public.side_quests
  FOR EACH ROW EXECUTE FUNCTION public.update_side_quest_timestamp();

DROP TRIGGER IF EXISTS set_side_quest_claim_updated ON public.side_quest_claims;
CREATE TRIGGER set_side_quest_claim_updated
  BEFORE UPDATE ON public.side_quest_claims
  FOR EACH ROW EXECUTE FUNCTION public.update_side_quest_timestamp();

-- ─────────────────────────────────────────────────────────────────
-- AGGREGATE VIEW — Quest completion statistics
-- ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW public.side_quest_stats AS
SELECT
  sq.id AS quest_id,
  sq.title,
  sq.category,
  sq.difficulty,
  sq.reward_credits,
  sq.reward_marks,
  sq.reward_joules,
  sq.hexisle_xp,
  sq.max_claims,
  COUNT(sqc.id) FILTER (WHERE sqc.status NOT IN ('abandoned', 'expired')) AS active_claims,
  COUNT(sqc.id) FILTER (WHERE sqc.status = 'approved') AS completions,
  COALESCE(SUM(sqb.amount) FILTER (WHERE sqb.benefit_type = 'credits'), 0) AS total_credits_distributed,
  sq.status AS quest_status
FROM public.side_quests sq
LEFT JOIN public.side_quest_claims sqc ON sqc.quest_id = sq.id
LEFT JOIN public.side_quest_benefits sqb ON sqb.quest_id = sq.id
GROUP BY sq.id;

-- ─────────────────────────────────────────────────────────────────
-- SEED QUESTS — Starter quests for day-one engagement
-- ─────────────────────────────────────────────────────────────────

INSERT INTO public.side_quests (
  title, description, detailed_instructions, category, difficulty, quest_type,
  reward_credits, hexisle_xp, max_completions_per_user, requires_approval,
  min_reputation_level, initiative_slug, status, featured
) VALUES
(
  'Welcome Tour',
  'Complete your profile and explore three platform features. Your first steps in the cooperative.',
  'Visit your Dashboard, browse Projects, and check out the HexIsle world map. Take a screenshot of each page as proof.',
  'community', 'beginner', 'one_time',
  5, 10, 1, FALSE,
  0, NULL, 'active', TRUE
),
(
  'First Pledge',
  'Back any project with at least 1 Credit. Show the cooperative you believe in something.',
  'Navigate to the Projects page, choose any project, and pledge at least 1 Credit using the Back This Project button.',
  'community', 'beginner', 'one_time',
  3, 15, 1, FALSE,
  0, NULL, 'active', TRUE
),
(
  'Meal Scout',
  'Browse the Let''s Make Dinner page and identify three cuisines you''d like in your neighborhood.',
  'Visit the Let''s Make Dinner page and explore available meals. Report which three cuisine types you''d most like to see offered in your area.',
  'community', 'beginner', 'one_time',
  5, 10, 1, FALSE,
  0, 'lets-make-dinner', 'active', TRUE
),
(
  'Document a Feature',
  'Write a short guide (200+ words) explaining any platform feature to new members.',
  'Choose any feature you''ve used. Write a clear, helpful guide that a new member could follow. Submit as a text document or blog post.',
  'documentation', 'intermediate', 'repeatable',
  10, 25, 5, TRUE,
  0, NULL, 'active', FALSE
),
(
  'Bug Hunter',
  'Find and report a bug with clear reproduction steps.',
  'If you encounter any issue on the platform, document it: (1) What you expected, (2) What happened, (3) Steps to reproduce. Screenshots welcome.',
  'testing', 'intermediate', 'repeatable',
  15, 30, 10, TRUE,
  0, NULL, 'active', FALSE
),
(
  'Design Feedback',
  'Review a page and provide constructive design improvement suggestions.',
  'Pick any page on the platform. Provide at least 3 specific, actionable design suggestions with mockups or detailed descriptions.',
  'design', 'intermediate', 'repeatable',
  10, 20, 5, TRUE,
  0, NULL, 'active', FALSE
)
ON CONFLICT DO NOTHING;
