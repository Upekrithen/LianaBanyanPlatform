-- Steward System — Session 13
-- steward_profiles, pledged_marks_escrow, dna_lock config for tiers and limits

-- Table: steward_profiles
CREATE TABLE IF NOT EXISTS public.steward_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  steward_tier TEXT NOT NULL DEFAULT 'apprentice'
    CHECK (steward_tier IN ('apprentice', 'journeyman', 'master_steward', 'grand_steward')),
  total_projects_managed INTEGER NOT NULL DEFAULT 0,
  successful_projects INTEGER NOT NULL DEFAULT 0,
  total_pledged NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_earned NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  trust_score NUMERIC(5,4) DEFAULT 0.0000,
  concurrent_limit INTEGER NOT NULL DEFAULT 1,
  max_pledge_limit NUMERIC(12,2) NOT NULL DEFAULT 500.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_steward_user ON public.steward_profiles(user_id);
ALTER TABLE public.steward_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own steward profile" ON public.steward_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own steward profile" ON public.steward_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public read for steward discovery" ON public.steward_profiles FOR SELECT USING (true);

-- Table: pledged_marks_escrow
CREATE TABLE IF NOT EXISTS public.pledged_marks_escrow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pledger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL,
  project_type TEXT NOT NULL,
  amount_pledged NUMERIC(12,2) NOT NULL CHECK (amount_pledged > 0),
  status TEXT NOT NULL DEFAULT 'held'
    CHECK (status IN ('held', 'released', 'absorbed', 'partial_release')),
  pledged_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  released_amount NUMERIC(12,2) DEFAULT 0.00,
  surplus_share NUMERIC(12,2) DEFAULT 0.00,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_pledged_escrow_pledger ON public.pledged_marks_escrow(pledger_id);
CREATE INDEX IF NOT EXISTS idx_pledged_escrow_project ON public.pledged_marks_escrow(project_id, project_type);
CREATE INDEX IF NOT EXISTS idx_pledged_escrow_status ON public.pledged_marks_escrow(status);
ALTER TABLE public.pledged_marks_escrow ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own pledges" ON public.pledged_marks_escrow FOR SELECT USING (auth.uid() = pledger_id);
CREATE POLICY "Public read for project transparency" ON public.pledged_marks_escrow FOR SELECT USING (true);

-- DNA Lock entries for Steward system
INSERT INTO public.dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES
  ('steward_apprentice_max_projects', '1', 'integer', false, 'SYSTEM', 'Max concurrent projects for Apprentice tier', 'steward'),
  ('steward_journeyman_max_projects', '3', 'integer', false, 'SYSTEM', 'Max concurrent projects for Journeyman tier', 'steward'),
  ('steward_master_max_projects', '5', 'integer', false, 'SYSTEM', 'Max concurrent projects for Master Steward tier', 'steward'),
  ('steward_grand_max_projects', '999', 'integer', false, 'SYSTEM', 'Max concurrent projects for Grand Steward (unlimited)', 'steward'),
  ('steward_apprentice_max_pledge', '500', 'integer', false, 'SYSTEM', 'Max Pledged Marks per project for Apprentice', 'steward'),
  ('steward_journeyman_max_pledge', '2000', 'integer', false, 'SYSTEM', 'Max Pledged Marks per project for Journeyman', 'steward'),
  ('steward_master_max_pledge', '10000', 'integer', false, 'SYSTEM', 'Max Pledged Marks per project for Master Steward', 'steward'),
  ('steward_grand_max_pledge', '100000', 'integer', false, 'SYSTEM', 'Max Pledged Marks per project for Grand Steward', 'steward'),
  ('steward_promotion_journeyman', '3', 'integer', false, 'SYSTEM', 'Successful projects needed for Journeyman', 'steward'),
  ('steward_promotion_master', '10', 'integer', false, 'SYSTEM', 'Successful projects needed for Master Steward (+ trust >= 0.80)', 'steward'),
  ('steward_promotion_grand', '25', 'integer', false, 'SYSTEM', 'Successful projects needed for Grand Steward (+ community nomination)', 'steward'),
  ('steward_surplus_share_pct', '100', 'integer', false, 'SYSTEM', 'Surplus share proportional to pledge ratio (100 = exact match)', 'steward'),
  ('pizza_oven_concurrent_bonus_pct', '5', 'integer', false, 'SYSTEM', 'Percent bonus to SAA for each concurrent project managed', 'steward')
ON CONFLICT (parameter_key) DO NOTHING;
