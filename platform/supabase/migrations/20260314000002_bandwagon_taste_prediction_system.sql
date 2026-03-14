-- =============================================================================
-- BandWagon Taste-Prediction Influence System (Session 12)
-- =============================================================================
-- Design: BISHOP_DROPZONE/BANDWAGON_DESIGN_DOCUMENT.md
-- SEC language: earned allocation authority, allocation budget, no investment/return language

-- Table 1: taste_ranger_profiles
CREATE TABLE IF NOT EXISTS public.taste_ranger_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  ranger_tier TEXT NOT NULL DEFAULT 'scout'
    CHECK (ranger_tier IN ('scout', 'ranger', 'curator', 'tastemaker', 'patron', 'luminary')),
  saa_score NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_backings INTEGER NOT NULL DEFAULT 0,
  successful_backings INTEGER NOT NULL DEFAULT 0,
  trust_score NUMERIC(5,4) DEFAULT 0.0000,
  allocation_budget NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_taste_ranger_user ON public.taste_ranger_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_taste_ranger_tier ON public.taste_ranger_profiles(ranger_tier);
ALTER TABLE public.taste_ranger_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own profile" ON public.taste_ranger_profiles;
CREATE POLICY "Users view own profile" ON public.taste_ranger_profiles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own profile" ON public.taste_ranger_profiles;
CREATE POLICY "Users update own profile" ON public.taste_ranger_profiles FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Public read for leaderboard" ON public.taste_ranger_profiles;
CREATE POLICY "Public read for leaderboard" ON public.taste_ranger_profiles FOR SELECT USING (true);

COMMENT ON TABLE public.taste_ranger_profiles IS 'Service Allocation Authority (SAA) and Taste Ranger tier per member; allocation_budget = Backed Marks available to direct';

-- Table 2: backed_marks_ledger
CREATE TABLE IF NOT EXISTS public.backed_marks_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('credit', 'debit')),
  source TEXT NOT NULL CHECK (source IN ('saa_allocation', 'backing_spent', 'backing_refund', 'surplus_distribution')),
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_backed_marks_user ON public.backed_marks_ledger(user_id);
ALTER TABLE public.backed_marks_ledger ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own ledger" ON public.backed_marks_ledger;
CREATE POLICY "Users view own ledger" ON public.backed_marks_ledger FOR SELECT USING (auth.uid() = user_id);

-- Table 3: project_backings
CREATE TABLE IF NOT EXISTS public.project_backings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL,
  project_type TEXT NOT NULL,
  amount_backed NUMERIC(12,2) NOT NULL CHECK (amount_backed > 0),
  currency_type TEXT NOT NULL DEFAULT 'backed_marks' CHECK (currency_type IN ('backed_marks')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'succeeded', 'failed', 'withdrawn')),
  backer_sequence INTEGER,
  backed_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  saa_earned NUMERIC(12,2) DEFAULT 0.00
);

CREATE INDEX IF NOT EXISTS idx_backings_backer ON public.project_backings(backer_id);
CREATE INDEX IF NOT EXISTS idx_backings_project ON public.project_backings(project_id, project_type);
CREATE INDEX IF NOT EXISTS idx_backings_status ON public.project_backings(status);
ALTER TABLE public.project_backings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own backings" ON public.project_backings;
CREATE POLICY "Users view own backings" ON public.project_backings FOR SELECT USING (auth.uid() = backer_id);
DROP POLICY IF EXISTS "Public read for project stats" ON public.project_backings;
CREATE POLICY "Public read for project stats" ON public.project_backings FOR SELECT USING (true);

-- Table 4: trust_chains
CREATE TABLE IF NOT EXISTS public.trust_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  originator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL,
  project_type TEXT NOT NULL,
  chain_depth INTEGER NOT NULL DEFAULT 1 CHECK (chain_depth >= 1 AND chain_depth <= 5),
  parent_link_id UUID REFERENCES public.trust_chains(id),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attribution_share NUMERIC(5,4) NOT NULL,
  follow_type TEXT NOT NULL DEFAULT 'direct' CHECK (follow_type IN ('direct', 'branch')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, project_type, follower_id)
);

CREATE INDEX IF NOT EXISTS idx_trust_chains_originator ON public.trust_chains(originator_id);
CREATE INDEX IF NOT EXISTS idx_trust_chains_follower ON public.trust_chains(follower_id);
CREATE INDEX IF NOT EXISTS idx_trust_chains_project ON public.trust_chains(project_id, project_type);
ALTER TABLE public.trust_chains ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own chains" ON public.trust_chains;
CREATE POLICY "Users view own chains" ON public.trust_chains FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = originator_id);
DROP POLICY IF EXISTS "Public read for trust display" ON public.trust_chains;
CREATE POLICY "Public read for trust display" ON public.trust_chains FOR SELECT USING (true);

-- DNA Lock: BandWagon config
INSERT INTO public.dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES
  ('bandwagon_first_100_threshold', '100', 'integer', false, 'SYSTEM', 'Number of early backers who share influence proportionally', 'bandwagon'),
  ('bandwagon_trust_chain_max_depth', '5', 'integer', false, 'SYSTEM', 'Max links in a TasteMaker Trust Chain', 'bandwagon'),
  ('bandwagon_attribution_decay', '0.40,0.25,0.15,0.10,0.10', 'text', false, 'SYSTEM', 'Attribution shares by chain depth (originator, 1st follower, 2nd, 3rd, 4th+)', 'bandwagon'),
  ('bandwagon_saa_base_per_success', '10', 'integer', false, 'SYSTEM', 'Base SAA points earned per successful project backing', 'bandwagon'),
  ('bandwagon_tier_thresholds', '0,50,200,500,1500,5000', 'text', false, 'SYSTEM', 'SAA thresholds for Scout/Ranger/Curator/TasteMaker/Patron/Luminary', 'bandwagon'),
  ('bandwagon_backed_marks_pct_of_surplus', '20', 'integer', false, 'SYSTEM', 'Percent of operational surplus allocated to Backed Marks pool', 'bandwagon')
ON CONFLICT (parameter_key) DO NOTHING;

-- Palate Guild fix: insert using same schema as seed_official_guilds (name, display_name, custom_name, guild_type, description, is_official, min_reputation_score, min_interactions)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'guilds'
    AND column_name IN ('name', 'display_name', 'custom_name', 'guild_type', 'description', 'is_official', 'min_reputation_score', 'min_interactions')
    GROUP BY table_schema, table_name
    HAVING COUNT(*) = 8
  ) THEN
    INSERT INTO public.guilds (
      name, display_name, custom_name, guild_type, description, is_official,
      min_reputation_score, min_interactions
    ) VALUES (
      'palate-guild',
      'Palate Guild',
      'guild',
      'skill',
      'Food reviewers who test recipes and provide quality feedback. Rank progression: Nibbler → Taster → Sampler → Connoisseur → Sommelier → Grand Palate.',
      true,
      0,
      0
    ) ON CONFLICT (name) DO UPDATE SET
      description = EXCLUDED.description,
      display_name = EXCLUDED.display_name,
      is_official = true;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Palate Guild seed skipped (schema or conflict): %', SQLERRM;
END $$;
