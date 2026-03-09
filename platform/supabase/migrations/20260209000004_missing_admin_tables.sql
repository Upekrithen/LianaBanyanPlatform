-- ═══════════════════════════════════════════════════════════════
-- MISSING TABLES FOR ADMIN/DEV PAGES
-- These tables are queried by existing frontend pages but don't
-- exist in the LianaBanyan Supabase yet.
-- ═══════════════════════════════════════════════════════════════

-- ─── TASK MANAGEMENT ───
CREATE TABLE IF NOT EXISTS public.project_tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES public.projects(id),
  title           TEXT NOT NULL,
  description     TEXT,
  assigned_to     UUID REFERENCES auth.users(id),
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'completed', 'cancelled')),
  priority        TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date        TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  credits_reward  NUMERIC DEFAULT 0,
  marks_reward    NUMERIC DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reference_tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT,
  default_credits NUMERIC DEFAULT 0,
  default_marks   NUMERIC DEFAULT 0,
  estimated_hours NUMERIC,
  skill_required  TEXT,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── WITHDRAWAL SYSTEM ───
CREATE TABLE IF NOT EXISTS public.withdrawal_configs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  withdrawal_type TEXT NOT NULL,
  fee_percentage  NUMERIC DEFAULT 0,
  min_amount      NUMERIC DEFAULT 1,
  max_amount      NUMERIC DEFAULT 10000,
  vesting_days    INTEGER DEFAULT 0,
  description     TEXT,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.credit_withdrawals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  amount          NUMERIC NOT NULL,
  withdrawal_type TEXT NOT NULL,
  fee_amount      NUMERIC DEFAULT 0,
  net_amount      NUMERIC NOT NULL,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  payout_method   TEXT,
  payout_reference TEXT,
  requested_at    TIMESTAMPTZ DEFAULT NOW(),
  processed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PROJECT DETAIL PAGES ───
CREATE TABLE IF NOT EXISTS public.products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES public.projects(id),
  name            TEXT NOT NULL,
  description     TEXT,
  product_sku     TEXT,
  base_price      NUMERIC,
  status          TEXT DEFAULT 'draft',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.production_levels (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID REFERENCES public.products(id),
  level_name      TEXT NOT NULL,
  level_number    INTEGER NOT NULL,
  current_votes   NUMERIC DEFAULT 0,
  votes_needed    NUMERIC DEFAULT 100,
  unit_price      NUMERIC,
  units_count     INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'open',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_landing_pages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES public.projects(id),
  segment_slug    TEXT,
  is_default      BOOLEAN DEFAULT false,
  is_active       BOOLEAN DEFAULT true,
  headline        TEXT,
  subheadline     TEXT,
  body_content    TEXT,
  call_to_action_text TEXT DEFAULT 'Learn More',
  call_to_action_type TEXT DEFAULT 'browse',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── WORKSHOP/WORKSTATION ───
CREATE TABLE IF NOT EXISTS public.workstations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES public.projects(id),
  name            TEXT NOT NULL,
  description     TEXT,
  station_type    TEXT DEFAULT 'production',
  status          TEXT DEFAULT 'active',
  assigned_to     UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_member_contracts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES public.projects(id),
  user_id         UUID REFERENCES auth.users(id),
  role            TEXT DEFAULT 'contributor',
  status          TEXT DEFAULT 'active',
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  ended_at        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_themes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES public.projects(id),
  theme_name      TEXT NOT NULL,
  theme_data      JSONB DEFAULT '{}',
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── REPUTATION ───
CREATE TABLE IF NOT EXISTS public.reputation_scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  overall_score   NUMERIC DEFAULT 0,
  reliability     NUMERIC DEFAULT 0,
  quality         NUMERIC DEFAULT 0,
  communication   NUMERIC DEFAULT 0,
  total_reviews   INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.reputation_ratings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id      UUID NOT NULL REFERENCES auth.users(id),
  rater_id        UUID NOT NULL REFERENCES auth.users(id),
  rating          INTEGER CHECK (rating >= 1 AND rating <= 5),
  category        TEXT,
  comment         TEXT,
  contract_id     UUID REFERENCES public.contracts(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SIMULATOR ───
CREATE TABLE IF NOT EXISTS public.test_scenarios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  scenario_type   TEXT,
  parameters      JSONB DEFAULT '{}',
  expected_outcome JSONB DEFAULT '{}',
  actual_outcome  JSONB,
  status          TEXT DEFAULT 'draft',
  run_at          TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── LEGAL/STEWARD ───
CREATE TABLE IF NOT EXISTS public.legal_formation_tracking (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_name     TEXT NOT NULL,
  entity_type     TEXT,
  state           TEXT,
  status          TEXT DEFAULT 'planning',
  filing_date     DATE,
  approval_date   DATE,
  ein             TEXT,
  notes           TEXT,
  documents       JSONB DEFAULT '[]',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SUBDOMAIN/DOMAIN MANAGEMENT ───
CREATE TABLE IF NOT EXISTS public.project_domain_mappings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES public.projects(id),
  domain          TEXT NOT NULL,
  subdomain       TEXT,
  is_primary      BOOLEAN DEFAULT false,
  ssl_status      TEXT DEFAULT 'pending',
  dns_configured  BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subdomain_lockbox_configs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_mapping_id UUID REFERENCES public.project_domain_mappings(id),
  lockbox_type    TEXT DEFAULT 'standard',
  config_data     JSONB DEFAULT '{}',
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ASSET LIBRARY ───
CREATE TABLE IF NOT EXISTS public.lb_asset_library (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  file_url        TEXT,
  file_type       TEXT,
  category        TEXT,
  tags            TEXT[] DEFAULT '{}',
  download_cost   NUMERIC DEFAULT 0,
  download_count  INTEGER DEFAULT 0,
  uploaded_by     UUID REFERENCES auth.users(id),
  is_public       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.asset_prototyping_contracts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id        UUID REFERENCES public.lb_asset_library(id),
  requester_id    UUID REFERENCES auth.users(id),
  provider_id     UUID REFERENCES auth.users(id),
  status          TEXT DEFAULT 'requested',
  requirements    TEXT,
  quoted_price    NUMERIC,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TASK LOG (already referenced) ───
CREATE TABLE IF NOT EXISTS public.task_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type       TEXT,
  description     TEXT,
  status          TEXT DEFAULT 'completed',
  agent           TEXT,
  duration_ms     INTEGER,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PRE-BETA RECRUITS ───
CREATE TABLE IF NOT EXISTS public.pre_beta_recruits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT,
  email           TEXT,
  source          TEXT,
  status          TEXT DEFAULT 'interested',
  notes           TEXT,
  invited_at      TIMESTAMPTZ,
  joined_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PROFILE SETTINGS ───
CREATE TABLE IF NOT EXISTS public.profile_visibility_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  show_email      BOOLEAN DEFAULT false,
  show_credits    BOOLEAN DEFAULT false,
  show_marks      BOOLEAN DEFAULT true,
  show_joules     BOOLEAN DEFAULT true,
  show_badges     BOOLEAN DEFAULT true,
  show_guild      BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ═══════════════════════════════════════════════════════════════
-- RLS — Basic policies for all new tables
-- ═══════════════════════════════════════════════════════════════

DO $$ 
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'project_tasks', 'reference_tasks', 'withdrawal_configs', 'credit_withdrawals',
    'products', 'production_levels', 'project_landing_pages',
    'workstations', 'project_member_contracts', 'project_themes',
    'reputation_scores', 'reputation_ratings', 'test_scenarios',
    'legal_formation_tracking', 'project_domain_mappings', 'subdomain_lockbox_configs',
    'lb_asset_library', 'asset_prototyping_contracts', 'task_log',
    'pre_beta_recruits', 'profile_visibility_settings'
  ])
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('CREATE POLICY "Authenticated access %s" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl, tbl);
  END LOOP;
END $$;
