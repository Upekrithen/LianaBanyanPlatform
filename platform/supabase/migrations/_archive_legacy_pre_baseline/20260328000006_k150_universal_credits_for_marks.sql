-- =============================================================================
-- MIGRATION: 20260328000006_k150_universal_credits_for_marks
-- PURPOSE:   K150 — Universal Credits-for-Marks payment rail.
--            Adds paid_in_credits + sponsor columns to all bounty tables.
--            Creates bounty_sponsorships table for project-level sponsorship.
-- DATE:      2026-03-28  |  Knight 150
-- SEC:       All four Howey prongs FAIL. See K150 spec for analysis.
-- =============================================================================

-- ─── Step 1: Universal paid_in_credits on bounties table ──────────────────
ALTER TABLE public.bounties
  ADD COLUMN IF NOT EXISTS paid_in_credits BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sponsor_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS sponsor_project_id UUID;

-- ─── Step 2: paid_in_credits on error_bounties ────────────────────────────
ALTER TABLE public.error_bounties
  ADD COLUMN IF NOT EXISTS paid_in_credits BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sponsor_id UUID REFERENCES auth.users(id);

-- ─── Step 3: accept_credits on matchtrade_offers ──────────────────────────
ALTER TABLE public.matchtrade_offers
  ADD COLUMN IF NOT EXISTS accept_credits BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sponsor_id UUID REFERENCES auth.users(id);

-- ─── Step 4: accept_credits on lmd_meal_requests ──────────────────────────
ALTER TABLE public.lmd_meal_requests
  ADD COLUMN IF NOT EXISTS accept_credits BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sponsor_id UUID REFERENCES auth.users(id);

-- ─── Step 5: bounty_sponsorships table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bounty_sponsorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID REFERENCES auth.users(id) NOT NULL,

  bounty_type TEXT NOT NULL CHECK (bounty_type IN (
    'brand_bounty', 'engineering_bounty', 'xray_bounty',
    'matchtrade', 'meal_request', 'community_bounty'
  )),
  bounty_id UUID NOT NULL,

  project_id UUID,
  project_type TEXT,

  amount_credits NUMERIC(10,2) NOT NULL,
  amount_marks_equivalent INT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('credits', 'fiat_stripe', 'lb_card')),

  ownership_transfer BOOLEAN DEFAULT false,
  license_type TEXT DEFAULT 'platform_use' CHECK (license_type IN (
    'platform_use', 'exclusive', 'non_exclusive', 'work_for_hire'
  )),

  ambassador_chain_id UUID,
  captain_tier TEXT,
  plant_a_seed_id UUID,

  status TEXT DEFAULT 'pledged' CHECK (status IN (
    'pledged', 'escrowed', 'released', 'refunded', 'disputed'
  )),

  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ─── RLS ──────────────────────────────────────────────────────────────────
ALTER TABLE public.bounty_sponsorships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sponsorships"
  ON public.bounty_sponsorships FOR SELECT
  USING (auth.uid() = sponsor_id);

CREATE POLICY "Users can create sponsorships"
  ON public.bounty_sponsorships FOR INSERT
  WITH CHECK (auth.uid() = sponsor_id);

CREATE POLICY "Users can update their own sponsorships"
  ON public.bounty_sponsorships FOR UPDATE
  USING (auth.uid() = sponsor_id);

-- ─── Indexes ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_bounty_sponsorships_sponsor
  ON public.bounty_sponsorships(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_bounty_sponsorships_bounty
  ON public.bounty_sponsorships(bounty_type, bounty_id);
CREATE INDEX IF NOT EXISTS idx_bounty_sponsorships_project
  ON public.bounty_sponsorships(project_id) WHERE project_id IS NOT NULL;
