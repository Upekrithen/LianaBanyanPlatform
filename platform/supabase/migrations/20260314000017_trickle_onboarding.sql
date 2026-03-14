-- Trickle Incentive Onboarding — cohorts, Founding Status, testing goals (Session 17)

CREATE TABLE IF NOT EXISTS public.onboarding_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_number INTEGER NOT NULL UNIQUE,
  max_members INTEGER NOT NULL DEFAULT 50,
  current_members INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'full', 'expanded', 'closed')),
  testing_goals_met BOOLEAN DEFAULT FALSE,
  expansion_trigger TEXT,
  expand_after_days INTEGER DEFAULT 3,
  next_cohort_size INTEGER DEFAULT 100,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expanded_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

ALTER TABLE public.onboarding_cohorts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read cohorts" ON public.onboarding_cohorts FOR SELECT USING (true);
CREATE POLICY "Service role manage cohorts" ON public.onboarding_cohorts FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS public.cohort_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES public.onboarding_cohorts(id),
  is_founding_status BOOLEAN DEFAULT FALSE,
  has_testing_goals BOOLEAN DEFAULT FALSE,
  testing_goals_completed INTEGER DEFAULT 0,
  testing_goals_total INTEGER DEFAULT 0,
  feedback_count INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, cohort_id)
);

CREATE INDEX IF NOT EXISTS idx_cohort_members_user ON public.cohort_members(user_id);
CREATE INDEX IF NOT EXISTS idx_cohort_members_cohort ON public.cohort_members(cohort_id);

ALTER TABLE public.cohort_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own cohort membership" ON public.cohort_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manage cohort members" ON public.cohort_members FOR ALL USING (auth.role() = 'service_role');

-- dna_lock feature flags (parameter_key schema)
INSERT INTO public.dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES
  ('vouched_by_delegation', 'true', 'boolean', false, 'SYSTEM', 'Vouched By / Recommended By — Crown letter delegation with unknown needs discovery', 'features'),
  ('xp_score_system', 'true', 'boolean', false, 'SYSTEM', 'XP Score System — multiplicative accomplishment scoring (bounty points x score)', 'features'),
  ('trickle_onboarding', 'true', 'boolean', false, 'SYSTEM', 'Trickle Incentive Onboarding — controlled cohorts, Founding Status, testing goals', 'features'),
  ('stamp_verification', 'true', 'boolean', false, 'SYSTEM', 'STAMP Verification — client/sponsor sign-off on completed work before XP award', 'features'),
  ('founding_status', 'true', 'boolean', false, 'SYSTEM', 'Founding Status — permanent designation for first cohort members', 'features')
ON CONFLICT (parameter_key) DO NOTHING;
