-- =============================================================================
-- MIGRATION: 20260328000001_missing_tables_launch_fix
-- PURPOSE:   Create 13 tables referenced by existing hooks that cause runtime
--            crashes when missing. Fully idempotent — safe to re-run.
--            Each table derived from exact columns in the corresponding hook.
-- DATE:      2026-03-28  |  Bishop 037
-- =============================================================================

-- ─── 1. bounties ─────────────────────────────────────────────────────────────
-- Hooks: useKickstarterCampaigns.ts, useManufacturingStatus.ts, useProductionProjects.ts
-- NOTE: Table may already exist from K143 seeding. Add missing columns safely.
CREATE TABLE IF NOT EXISTS public.bounties (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     UUID,
  title           TEXT NOT NULL DEFAULT '',
  description     TEXT NOT NULL DEFAULT '',
  category        TEXT NOT NULL DEFAULT 'general',
  priority        TEXT NOT NULL DEFAULT 'medium',
  difficulty      TEXT NOT NULL DEFAULT 'medium',
  reward_marks    NUMERIC NOT NULL DEFAULT 0,
  reward_amount   NUMERIC NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'open',
  claimed_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add columns that may be missing from existing table
DO $$ BEGIN
  ALTER TABLE public.bounties ADD COLUMN IF NOT EXISTS campaign_id UUID;
  ALTER TABLE public.bounties ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '';
  ALTER TABLE public.bounties ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
  ALTER TABLE public.bounties ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'general';
  ALTER TABLE public.bounties ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'medium';
  ALTER TABLE public.bounties ADD COLUMN IF NOT EXISTS difficulty TEXT NOT NULL DEFAULT 'medium';
  ALTER TABLE public.bounties ADD COLUMN IF NOT EXISTS reward_marks NUMERIC NOT NULL DEFAULT 0;
  ALTER TABLE public.bounties ADD COLUMN IF NOT EXISTS reward_amount NUMERIC NOT NULL DEFAULT 0;
  ALTER TABLE public.bounties ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open';
  ALTER TABLE public.bounties ADD COLUMN IF NOT EXISTS claimed_by UUID;
  ALTER TABLE public.bounties ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
  ALTER TABLE public.bounties ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
END $$;

ALTER TABLE public.bounties ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "bounties_select_authenticated" ON public.bounties FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "bounties_update_owner" ON public.bounties FOR UPDATE TO authenticated USING (claimed_by = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 2. projects ─────────────────────────────────────────────────────────────
-- Hook: useProductionProjects.ts — .select('id, name, description')
CREATE TABLE IF NOT EXISTS public.projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL DEFAULT '',
  description     TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';
  ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
  ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
  ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
END $$;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "projects_select_authenticated" ON public.projects FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 3. products ─────────────────────────────────────────────────────────────
-- Hook: useProductionProjects.ts — .select('id, project_id, name, description')
CREATE TABLE IF NOT EXISTS public.products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name            TEXT NOT NULL DEFAULT '',
  description     TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS project_id UUID;
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
END $$;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "products_select_authenticated" ON public.products FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 4. production_levels ────────────────────────────────────────────────────
-- Hook: useProductionProjects.ts — .select('id, product_id, level_number, level_name, units_count, unit_price')
CREATE TABLE IF NOT EXISTS public.production_levels (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  level_number    INT NOT NULL DEFAULT 1,
  level_name      TEXT NOT NULL DEFAULT '',
  units_count     INT NOT NULL DEFAULT 0,
  unit_price      NUMERIC NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE public.production_levels ADD COLUMN IF NOT EXISTS product_id UUID;
  ALTER TABLE public.production_levels ADD COLUMN IF NOT EXISTS level_number INT NOT NULL DEFAULT 1;
  ALTER TABLE public.production_levels ADD COLUMN IF NOT EXISTS level_name TEXT NOT NULL DEFAULT '';
  ALTER TABLE public.production_levels ADD COLUMN IF NOT EXISTS units_count INT NOT NULL DEFAULT 0;
  ALTER TABLE public.production_levels ADD COLUMN IF NOT EXISTS unit_price NUMERIC NOT NULL DEFAULT 0;
  ALTER TABLE public.production_levels ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
  ALTER TABLE public.production_levels ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
END $$;

ALTER TABLE public.production_levels ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "production_levels_select_authenticated" ON public.production_levels FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 5. pledges ──────────────────────────────────────────────────────────────
-- Hook: useProductionProjects.ts — .select('production_level_id, amount') + .insert({production_level_id, user_id, amount, source})
CREATE TABLE IF NOT EXISTS public.pledges (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_level_id   UUID NOT NULL REFERENCES public.production_levels(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL REFERENCES public.profiles(id),
  amount                NUMERIC NOT NULL DEFAULT 0,
  source                TEXT NOT NULL DEFAULT '',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE public.pledges ADD COLUMN IF NOT EXISTS production_level_id UUID;
  ALTER TABLE public.pledges ADD COLUMN IF NOT EXISTS user_id UUID;
  ALTER TABLE public.pledges ADD COLUMN IF NOT EXISTS amount NUMERIC NOT NULL DEFAULT 0;
  ALTER TABLE public.pledges ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT '';
  ALTER TABLE public.pledges ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
  ALTER TABLE public.pledges ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
END $$;

ALTER TABLE public.pledges ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "pledges_select_authenticated" ON public.pledges FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "pledges_insert_authenticated" ON public.pledges FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 6. hexisle_buildings ────────────────────────────────────────────────────
-- Hooks: useHexIsleWorld.ts, HexIsle.tsx
CREATE TABLE IF NOT EXISTS public.hexisle_buildings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id),
  city_id         UUID,
  building_type   TEXT NOT NULL DEFAULT '',
  hex_x           INT NOT NULL DEFAULT 0,
  hex_y           INT NOT NULL DEFAULT 0,
  is_complete     BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE public.hexisle_buildings ADD COLUMN IF NOT EXISTS user_id UUID;
  ALTER TABLE public.hexisle_buildings ADD COLUMN IF NOT EXISTS city_id UUID;
  ALTER TABLE public.hexisle_buildings ADD COLUMN IF NOT EXISTS building_type TEXT NOT NULL DEFAULT '';
  ALTER TABLE public.hexisle_buildings ADD COLUMN IF NOT EXISTS hex_x INT NOT NULL DEFAULT 0;
  ALTER TABLE public.hexisle_buildings ADD COLUMN IF NOT EXISTS hex_y INT NOT NULL DEFAULT 0;
  ALTER TABLE public.hexisle_buildings ADD COLUMN IF NOT EXISTS is_complete BOOLEAN NOT NULL DEFAULT false;
  ALTER TABLE public.hexisle_buildings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
  ALTER TABLE public.hexisle_buildings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
END $$;

ALTER TABLE public.hexisle_buildings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "hexisle_buildings_select_authenticated" ON public.hexisle_buildings FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "hexisle_buildings_insert_owner" ON public.hexisle_buildings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "hexisle_buildings_update_owner" ON public.hexisle_buildings FOR UPDATE TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 7. hexisle_cities ───────────────────────────────────────────────────────
-- Hook: useHexIsleWorld.ts — HexIsleCity interface
CREATE TABLE IF NOT EXISTS public.hexisle_cities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL DEFAULT '',
  hex_x           INT NOT NULL DEFAULT 0,
  hex_y           INT NOT NULL DEFAULT 0,
  features        JSONB NOT NULL DEFAULT '{}'::jsonb,
  guild_hall      TEXT,
  population      INT NOT NULL DEFAULT 0,
  well_type       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE public.hexisle_cities ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';
  ALTER TABLE public.hexisle_cities ADD COLUMN IF NOT EXISTS hex_x INT NOT NULL DEFAULT 0;
  ALTER TABLE public.hexisle_cities ADD COLUMN IF NOT EXISTS hex_y INT NOT NULL DEFAULT 0;
  ALTER TABLE public.hexisle_cities ADD COLUMN IF NOT EXISTS features JSONB NOT NULL DEFAULT '{}'::jsonb;
  ALTER TABLE public.hexisle_cities ADD COLUMN IF NOT EXISTS guild_hall TEXT;
  ALTER TABLE public.hexisle_cities ADD COLUMN IF NOT EXISTS population INT NOT NULL DEFAULT 0;
  ALTER TABLE public.hexisle_cities ADD COLUMN IF NOT EXISTS well_type TEXT;
  ALTER TABLE public.hexisle_cities ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
  ALTER TABLE public.hexisle_cities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
END $$;

ALTER TABLE public.hexisle_cities ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "hexisle_cities_select_authenticated" ON public.hexisle_cities FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 8. hexisle_player_state ─────────────────────────────────────────────────
-- Hook: useHexIsleWorld.ts — HexIslePlayerState interface
CREATE TABLE IF NOT EXISTS public.hexisle_player_state (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL UNIQUE REFERENCES public.profiles(id),
  current_city_id     UUID,
  current_hex_x       INT NOT NULL DEFAULT 0,
  current_hex_y       INT NOT NULL DEFAULT 0,
  level               INT NOT NULL DEFAULT 1,
  credits             NUMERIC NOT NULL DEFAULT 0,
  water               NUMERIC NOT NULL DEFAULT 0,
  materials           NUMERIC NOT NULL DEFAULT 0,
  food                NUMERIC NOT NULL DEFAULT 0,
  cities_discovered   TEXT[] NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE public.hexisle_player_state ADD COLUMN IF NOT EXISTS user_id UUID;
  ALTER TABLE public.hexisle_player_state ADD COLUMN IF NOT EXISTS current_city_id UUID;
  ALTER TABLE public.hexisle_player_state ADD COLUMN IF NOT EXISTS current_hex_x INT NOT NULL DEFAULT 0;
  ALTER TABLE public.hexisle_player_state ADD COLUMN IF NOT EXISTS current_hex_y INT NOT NULL DEFAULT 0;
  ALTER TABLE public.hexisle_player_state ADD COLUMN IF NOT EXISTS level INT NOT NULL DEFAULT 1;
  ALTER TABLE public.hexisle_player_state ADD COLUMN IF NOT EXISTS credits NUMERIC NOT NULL DEFAULT 0;
  ALTER TABLE public.hexisle_player_state ADD COLUMN IF NOT EXISTS water NUMERIC NOT NULL DEFAULT 0;
  ALTER TABLE public.hexisle_player_state ADD COLUMN IF NOT EXISTS materials NUMERIC NOT NULL DEFAULT 0;
  ALTER TABLE public.hexisle_player_state ADD COLUMN IF NOT EXISTS food NUMERIC NOT NULL DEFAULT 0;
  ALTER TABLE public.hexisle_player_state ADD COLUMN IF NOT EXISTS cities_discovered TEXT[] NOT NULL DEFAULT '{}';
  ALTER TABLE public.hexisle_player_state ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
  ALTER TABLE public.hexisle_player_state ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
END $$;

ALTER TABLE public.hexisle_player_state ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "hexisle_player_state_select_owner" ON public.hexisle_player_state FOR SELECT TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "hexisle_player_state_insert_owner" ON public.hexisle_player_state FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "hexisle_player_state_update_owner" ON public.hexisle_player_state FOR UPDATE TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 9. lb_card_funding_schedules ────────────────────────────────────────────
-- Hook: useLBCardFunding.ts — FundingSchedule interface
CREATE TABLE IF NOT EXISTS public.lb_card_funding_schedules (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funder_id                UUID NOT NULL REFERENCES public.profiles(id),
  recipient_id             UUID NOT NULL REFERENCES public.profiles(id),
  card_serial              TEXT,
  stripe_subscription_id   TEXT,
  amount                   NUMERIC NOT NULL DEFAULT 0,
  currency                 TEXT NOT NULL DEFAULT 'USD',
  frequency                TEXT NOT NULL DEFAULT 'monthly',
  purpose                  TEXT,
  purpose_note             TEXT,
  status                   TEXT NOT NULL DEFAULT 'active',
  next_funding_at          TIMESTAMPTZ,
  last_funded_at           TIMESTAMPTZ,
  total_funded             NUMERIC NOT NULL DEFAULT 0,
  funding_count            INT NOT NULL DEFAULT 0,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE public.lb_card_funding_schedules ADD COLUMN IF NOT EXISTS funder_id UUID;
  ALTER TABLE public.lb_card_funding_schedules ADD COLUMN IF NOT EXISTS recipient_id UUID;
  ALTER TABLE public.lb_card_funding_schedules ADD COLUMN IF NOT EXISTS card_serial TEXT;
  ALTER TABLE public.lb_card_funding_schedules ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
  ALTER TABLE public.lb_card_funding_schedules ADD COLUMN IF NOT EXISTS amount NUMERIC NOT NULL DEFAULT 0;
  ALTER TABLE public.lb_card_funding_schedules ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD';
  ALTER TABLE public.lb_card_funding_schedules ADD COLUMN IF NOT EXISTS frequency TEXT NOT NULL DEFAULT 'monthly';
  ALTER TABLE public.lb_card_funding_schedules ADD COLUMN IF NOT EXISTS purpose TEXT;
  ALTER TABLE public.lb_card_funding_schedules ADD COLUMN IF NOT EXISTS purpose_note TEXT;
  ALTER TABLE public.lb_card_funding_schedules ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
  ALTER TABLE public.lb_card_funding_schedules ADD COLUMN IF NOT EXISTS next_funding_at TIMESTAMPTZ;
  ALTER TABLE public.lb_card_funding_schedules ADD COLUMN IF NOT EXISTS last_funded_at TIMESTAMPTZ;
  ALTER TABLE public.lb_card_funding_schedules ADD COLUMN IF NOT EXISTS total_funded NUMERIC NOT NULL DEFAULT 0;
  ALTER TABLE public.lb_card_funding_schedules ADD COLUMN IF NOT EXISTS funding_count INT NOT NULL DEFAULT 0;
  ALTER TABLE public.lb_card_funding_schedules ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
  ALTER TABLE public.lb_card_funding_schedules ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
END $$;

ALTER TABLE public.lb_card_funding_schedules ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "lb_funding_sched_select_participant" ON public.lb_card_funding_schedules FOR SELECT TO authenticated USING (funder_id = auth.uid() OR recipient_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "lb_funding_sched_insert_funder" ON public.lb_card_funding_schedules FOR INSERT TO authenticated WITH CHECK (funder_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "lb_funding_sched_update_funder" ON public.lb_card_funding_schedules FOR UPDATE TO authenticated USING (funder_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 10. lb_card_funding_sources ─────────────────────────────────────────────
-- Hook: useLBCardFunding.ts — FundingSource interface + .upsert()
CREATE TABLE IF NOT EXISTS public.lb_card_funding_sources (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_owner_id         UUID NOT NULL REFERENCES public.profiles(id),
  authorized_funder_id  UUID NOT NULL REFERENCES public.profiles(id),
  authorized_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (card_owner_id, authorized_funder_id)
);

DO $$ BEGIN
  ALTER TABLE public.lb_card_funding_sources ADD COLUMN IF NOT EXISTS card_owner_id UUID;
  ALTER TABLE public.lb_card_funding_sources ADD COLUMN IF NOT EXISTS authorized_funder_id UUID;
  ALTER TABLE public.lb_card_funding_sources ADD COLUMN IF NOT EXISTS authorized_at TIMESTAMPTZ NOT NULL DEFAULT now();
  ALTER TABLE public.lb_card_funding_sources ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;
  ALTER TABLE public.lb_card_funding_sources ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
  ALTER TABLE public.lb_card_funding_sources ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
END $$;

ALTER TABLE public.lb_card_funding_sources ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "lb_funding_src_select_owner" ON public.lb_card_funding_sources FOR SELECT TO authenticated USING (card_owner_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "lb_funding_src_insert_owner" ON public.lb_card_funding_sources FOR INSERT TO authenticated WITH CHECK (card_owner_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "lb_funding_src_update_owner" ON public.lb_card_funding_sources FOR UPDATE TO authenticated USING (card_owner_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 11. lb_card_funding_transactions ────────────────────────────────────────
-- Hook: useLBCardFunding.ts — FundingTransaction interface
CREATE TABLE IF NOT EXISTS public.lb_card_funding_transactions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id               UUID REFERENCES public.lb_card_funding_schedules(id),
  funder_id                 UUID NOT NULL REFERENCES public.profiles(id),
  recipient_id              UUID NOT NULL REFERENCES public.profiles(id),
  amount                    NUMERIC NOT NULL DEFAULT 0,
  stripe_payment_intent_id  TEXT,
  stripe_transfer_id        TEXT,
  purpose                   TEXT,
  status                    TEXT NOT NULL DEFAULT 'pending',
  error_message             TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at              TIMESTAMPTZ
);

DO $$ BEGIN
  ALTER TABLE public.lb_card_funding_transactions ADD COLUMN IF NOT EXISTS schedule_id UUID;
  ALTER TABLE public.lb_card_funding_transactions ADD COLUMN IF NOT EXISTS funder_id UUID;
  ALTER TABLE public.lb_card_funding_transactions ADD COLUMN IF NOT EXISTS recipient_id UUID;
  ALTER TABLE public.lb_card_funding_transactions ADD COLUMN IF NOT EXISTS amount NUMERIC NOT NULL DEFAULT 0;
  ALTER TABLE public.lb_card_funding_transactions ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
  ALTER TABLE public.lb_card_funding_transactions ADD COLUMN IF NOT EXISTS stripe_transfer_id TEXT;
  ALTER TABLE public.lb_card_funding_transactions ADD COLUMN IF NOT EXISTS purpose TEXT;
  ALTER TABLE public.lb_card_funding_transactions ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
  ALTER TABLE public.lb_card_funding_transactions ADD COLUMN IF NOT EXISTS error_message TEXT;
  ALTER TABLE public.lb_card_funding_transactions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
  ALTER TABLE public.lb_card_funding_transactions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
END $$;

ALTER TABLE public.lb_card_funding_transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "lb_funding_txn_select_participant" ON public.lb_card_funding_transactions FOR SELECT TO authenticated USING (funder_id = auth.uid() OR recipient_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 12. user_credits ────────────────────────────────────────────────────────
-- Hook: useMembershipStatus.ts — .select('membership_stake_paid').eq('user_id', ...)
-- Hook: useRealTimeCalculations.tsx — .select('*').eq('user_id', ...)
CREATE TABLE IF NOT EXISTS public.user_credits (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL UNIQUE REFERENCES public.profiles(id),
  balance                 NUMERIC NOT NULL DEFAULT 0,
  membership_stake_paid   BOOLEAN NOT NULL DEFAULT false,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE public.user_credits ADD COLUMN IF NOT EXISTS user_id UUID;
  ALTER TABLE public.user_credits ADD COLUMN IF NOT EXISTS balance NUMERIC NOT NULL DEFAULT 0;
  ALTER TABLE public.user_credits ADD COLUMN IF NOT EXISTS membership_stake_paid BOOLEAN NOT NULL DEFAULT false;
  ALTER TABLE public.user_credits ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
  ALTER TABLE public.user_credits ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
END $$;

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "user_credits_select_owner" ON public.user_credits FOR SELECT TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "user_credits_update_owner" ON public.user_credits FOR UPDATE TO authenticated USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 13. spotlight_impressions ───────────────────────────────────────────────
-- Hook: useSpotlightCarousel.ts — analytics insert
CREATE TABLE IF NOT EXISTS public.spotlight_impressions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id               TEXT NOT NULL,
  category              TEXT NOT NULL DEFAULT 'all',
  position_in_carousel  INT,
  action                TEXT NOT NULL DEFAULT 'impression',
  session_id            TEXT NOT NULL,
  dwell_ms              INT,
  algorithm_config      JSONB,
  page_context          TEXT NOT NULL DEFAULT 'landing',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE public.spotlight_impressions ADD COLUMN IF NOT EXISTS card_id TEXT NOT NULL DEFAULT '';
  ALTER TABLE public.spotlight_impressions ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'all';
  ALTER TABLE public.spotlight_impressions ADD COLUMN IF NOT EXISTS position_in_carousel INT;
  ALTER TABLE public.spotlight_impressions ADD COLUMN IF NOT EXISTS action TEXT NOT NULL DEFAULT 'impression';
  ALTER TABLE public.spotlight_impressions ADD COLUMN IF NOT EXISTS session_id TEXT NOT NULL DEFAULT '';
  ALTER TABLE public.spotlight_impressions ADD COLUMN IF NOT EXISTS dwell_ms INT;
  ALTER TABLE public.spotlight_impressions ADD COLUMN IF NOT EXISTS algorithm_config JSONB;
  ALTER TABLE public.spotlight_impressions ADD COLUMN IF NOT EXISTS page_context TEXT NOT NULL DEFAULT 'landing';
  ALTER TABLE public.spotlight_impressions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
END $$;

ALTER TABLE public.spotlight_impressions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "spotlight_impressions_insert_auth" ON public.spotlight_impressions FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "spotlight_impressions_select_auth" ON public.spotlight_impressions FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_bounties_campaign_id ON public.bounties(campaign_id);
CREATE INDEX IF NOT EXISTS idx_bounties_status ON public.bounties(status);
CREATE INDEX IF NOT EXISTS idx_bounties_claimed_by ON public.bounties(claimed_by) WHERE claimed_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_project_id ON public.products(project_id);
CREATE INDEX IF NOT EXISTS idx_production_levels_product_id ON public.production_levels(product_id);
CREATE INDEX IF NOT EXISTS idx_pledges_production_level_id ON public.pledges(production_level_id);
CREATE INDEX IF NOT EXISTS idx_pledges_user_id ON public.pledges(user_id);
CREATE INDEX IF NOT EXISTS idx_hexisle_buildings_user_id ON public.hexisle_buildings(user_id);
CREATE INDEX IF NOT EXISTS idx_hexisle_buildings_city_id ON public.hexisle_buildings(city_id);
CREATE INDEX IF NOT EXISTS idx_hexisle_player_state_user_id ON public.hexisle_player_state(user_id);
CREATE INDEX IF NOT EXISTS idx_lb_funding_sched_funder ON public.lb_card_funding_schedules(funder_id);
CREATE INDEX IF NOT EXISTS idx_lb_funding_sched_recipient ON public.lb_card_funding_schedules(recipient_id);
CREATE INDEX IF NOT EXISTS idx_lb_funding_txn_schedule ON public.lb_card_funding_transactions(schedule_id);
CREATE INDEX IF NOT EXISTS idx_lb_funding_txn_funder ON public.lb_card_funding_transactions(funder_id);
CREATE INDEX IF NOT EXISTS idx_lb_funding_src_owner ON public.lb_card_funding_sources(card_owner_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_spotlight_card ON public.spotlight_impressions(card_id);
CREATE INDEX IF NOT EXISTS idx_spotlight_session ON public.spotlight_impressions(session_id);
