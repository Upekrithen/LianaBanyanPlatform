-- Wave 11 Economy Core Tables (BP073 Phase Beta)
-- =================================================
-- S1: shadow_marks_ledger   -- append-only Marks participation ledger
-- S2: bounties + bounty_claims -- open bounty board and claim lifecycle
-- S3: marks_redemptions      -- Marks->Credits conversion log
-- S4: payout_gate_status     -- view reading platform_canonical gate flag
-- S5: marks_allocation_queue -- manual-to-auto payout staging
--
-- SECURITIES-CLEAN: Marks = cooperative participation units.
-- NOT equity, shares, or guaranteed financial return.
-- Cost+20% architecture. 83.3% creator share. $5/year membership.
--
-- RLS enabled on every table. search_path locked. security_invoker views.
-- Rates: HELD FOR FOUNDER (15-language ratification pending).

SET search_path TO public, pg_catalog;

-- ─────────────────────────────────────────────────────────────────────────────
-- S1: shadow_marks_ledger
-- Append-only ledger of every Marks debit/credit event.
-- Balance = SUM(amount) per user_id (signed: credit=positive, debit=negative).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.shadow_marks_ledger (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  amount        numeric     NOT NULL,                       -- positive=credit, negative=debit
  reason        text        NOT NULL CHECK (reason IN (
    'bounty_completion',
    'membership_join',
    'membership_renewal',
    'mesh_participation',
    'referral_credit',
    'governance_vote',
    'content_contribution',
    'marks_redeemed',       -- debit when redeemed for Credits
    'admin_adjustment'
  )),
  ref_id        uuid,                                       -- bounty_id, claim_id, etc.
  note          text        NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.shadow_marks_ledger IS
  'Append-only Marks participation ledger. '
  'SECURITIES-CLEAN: Marks = participation units, NOT equity or financial return. '
  'Balance = SUM(amount) per user_id. Negative amounts = redemptions/debits. '
  'Rates HELD FOR FOUNDER pending 15-language ratification.';

CREATE INDEX IF NOT EXISTS idx_sml_user_created
  ON public.shadow_marks_ledger (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sml_reason
  ON public.shadow_marks_ledger (reason);

ALTER TABLE public.shadow_marks_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sml_select_own ON public.shadow_marks_ledger;
CREATE POLICY sml_select_own
  ON public.shadow_marks_ledger FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS sml_insert_service ON public.shadow_marks_ledger;
CREATE POLICY sml_insert_service
  ON public.shadow_marks_ledger FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS sml_insert_auth ON public.shadow_marks_ledger;
CREATE POLICY sml_insert_auth
  ON public.shadow_marks_ledger FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- No UPDATE or DELETE (append-only)

-- ─────────────────────────────────────────────────────────────────────────────
-- S2a: bounties table
-- Open bounty board entries for all initiatives.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE public.bounty_status AS ENUM (
    'open', 'claimed', 'submitted', 'verified', 'rejected', 'expired'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.bounty_class AS ENUM (
    'translation', 'design', 'development', 'content', 'research'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.bounties (
  id                uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text            NOT NULL,
  description       text            NOT NULL DEFAULT '',
  bounty_class      public.bounty_class NOT NULL DEFAULT 'content',
  marks_reward      integer         NOT NULL DEFAULT 0 CHECK (marks_reward >= 0),
  credits_reward    integer         NOT NULL DEFAULT 0 CHECK (credits_reward >= 0),
  compensation_unit text            NOT NULL DEFAULT 'Marks' CHECK (compensation_unit IN ('Marks','Credits')),
  posted_by         uuid            NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  posted_by_handle  text,
  initiative_ref    text,
  status            public.bounty_status NOT NULL DEFAULT 'open',
  expires_at        timestamptz,
  created_at        timestamptz     NOT NULL DEFAULT now(),
  updated_at        timestamptz     NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.bounties IS
  'Open bounty board for all cooperative initiatives. '
  'SECURITIES-CLEAN: Marks rewards = participation credits, NOT financial return.';

CREATE INDEX IF NOT EXISTS idx_bounties_status
  ON public.bounties (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bounties_class
  ON public.bounties (bounty_class) WHERE status = 'open';

ALTER TABLE public.bounties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bounties_select_all ON public.bounties;
CREATE POLICY bounties_select_all
  ON public.bounties FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS bounties_insert_staff ON public.bounties;
CREATE POLICY bounties_insert_staff
  ON public.bounties FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS bounties_insert_auth ON public.bounties;
CREATE POLICY bounties_insert_auth
  ON public.bounties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = posted_by);

DROP POLICY IF EXISTS bounties_update_service ON public.bounties;
CREATE POLICY bounties_update_service
  ON public.bounties FOR UPDATE
  TO service_role
  USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- S2b: bounty_claims table
-- One claim per bounty per member. Lifecycle: claimed->submitted->verified|rejected.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.bounty_claims (
  id                uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id         uuid            NOT NULL REFERENCES public.bounties(id) ON DELETE RESTRICT,
  claimant_id       uuid            NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status            public.bounty_status NOT NULL DEFAULT 'claimed',
  work_url          text,
  submission_note   text,
  marks_awarded     integer         CHECK (marks_awarded >= 0),
  verified_by       uuid            REFERENCES auth.users(id),
  claimed_at        timestamptz     NOT NULL DEFAULT now(),
  submitted_at      timestamptz,
  verified_at       timestamptz,
  CONSTRAINT bounty_claims_unique UNIQUE (bounty_id, claimant_id)
);

COMMENT ON TABLE public.bounty_claims IS
  'Bounty claim lifecycle: claimed -> submitted -> verified|rejected. '
  'marks_awarded populated on verification. Idempotency: one claim per member per bounty.';

CREATE INDEX IF NOT EXISTS idx_bclaims_claimant
  ON public.bounty_claims (claimant_id, claimed_at DESC);

CREATE INDEX IF NOT EXISTS idx_bclaims_bounty
  ON public.bounty_claims (bounty_id);

ALTER TABLE public.bounty_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bclaims_select_own ON public.bounty_claims;
CREATE POLICY bclaims_select_own
  ON public.bounty_claims FOR SELECT
  TO authenticated
  USING (auth.uid() = claimant_id);

DROP POLICY IF EXISTS bclaims_select_service ON public.bounty_claims;
CREATE POLICY bclaims_select_service
  ON public.bounty_claims FOR SELECT
  TO service_role
  USING (true);

DROP POLICY IF EXISTS bclaims_insert_own ON public.bounty_claims;
CREATE POLICY bclaims_insert_own
  ON public.bounty_claims FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = claimant_id);

DROP POLICY IF EXISTS bclaims_update_service ON public.bounty_claims;
CREATE POLICY bclaims_update_service
  ON public.bounty_claims FOR UPDATE
  TO service_role
  USING (true);

DROP POLICY IF EXISTS bclaims_update_own ON public.bounty_claims;
CREATE POLICY bclaims_update_own
  ON public.bounty_claims FOR UPDATE
  TO authenticated
  USING (auth.uid() = claimant_id AND status IN ('claimed'));

-- ─────────────────────────────────────────────────────────────────────────────
-- S3: marks_redemptions
-- Log of Marks->Credits conversions. Append-only for audit.
-- HELD: conversion rate set in platform_canonical by Founder.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.marks_redemptions (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  marks_spent       integer     NOT NULL CHECK (marks_spent > 0),
  credits_received  integer     NOT NULL CHECK (credits_received >= 0),
  rate_applied      numeric     NOT NULL,                   -- HELD value at redemption time
  purchase_context  text,
  ledger_seq        integer,                                -- ip_ledger sequence_number
  redeemed_at       timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.marks_redemptions IS
  'Append-only Marks->Credits redemption log. '
  'SECURITIES-CLEAN: credits reduce Cost+20% purchases only. NOT financial return. '
  'rate_applied HELD FOR FOUNDER pending 15-language ratification.';

CREATE INDEX IF NOT EXISTS idx_mred_member
  ON public.marks_redemptions (member_id, redeemed_at DESC);

ALTER TABLE public.marks_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mred_select_own ON public.marks_redemptions;
CREATE POLICY mred_select_own
  ON public.marks_redemptions FOR SELECT
  TO authenticated
  USING (auth.uid() = member_id);

DROP POLICY IF EXISTS mred_insert_auth ON public.marks_redemptions;
CREATE POLICY mred_insert_auth
  ON public.marks_redemptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = member_id);

DROP POLICY IF EXISTS mred_service ON public.marks_redemptions;
CREATE POLICY mred_service
  ON public.marks_redemptions FOR ALL
  TO service_role
  USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- S4: payout_gate_status view
-- Reads platform_canonical for MARKS_AUTO_PAYOUT_ENABLED gate flag.
-- Security-invoker: each caller sees only what RLS allows on platform_canonical.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW public.payout_gate_status
  WITH (security_invoker = true)
AS
SELECT
  COALESCE(
    MAX(CASE WHEN key = 'marks_auto_payout_enabled' THEN value END) = 'true',
    false
  )                                    AS auto_payout_enabled,
  COALESCE(
    MAX(CASE WHEN key = 'marks_join_units'    THEN value::numeric END),
    0
  )                                    AS join_marks_units,
  COALESCE(
    MAX(CASE WHEN key = 'marks_renewal_units' THEN value::numeric END),
    0
  )                                    AS renewal_marks_units,
  now()                                AS checked_at
FROM public.platform_canonical
WHERE key IN (
  'marks_auto_payout_enabled',
  'marks_join_units',
  'marks_renewal_units'
);

GRANT SELECT ON public.payout_gate_status TO authenticated;

COMMENT ON VIEW public.payout_gate_status IS
  'Live payout gate status from platform_canonical. '
  'auto_payout_enabled=true only after Founder sets marks_auto_payout_enabled=true. '
  'HELD: join/renewal units default 0 until Founder ratifies rates. '
  'security_invoker: query runs as caller for RLS correctness.';

-- ─────────────────────────────────────────────────────────────────────────────
-- S5: marks_allocation_queue
-- Manual-to-auto payout staging table.
-- Status: pending_approval -> approved | rejected.
-- Founder approves from admin dashboard.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE public.marks_alloc_phase AS ENUM ('manual', 'automatic');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.marks_alloc_status AS ENUM (
    'pending_approval', 'approved', 'rejected', 'processed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.marks_allocation_queue (
  id            uuid                        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     uuid                        NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  reason        text                        NOT NULL,
  marks_units   integer                     NOT NULL CHECK (marks_units >= 0),
  triggered_by  uuid,                       -- event ID (bounty_id, etc.)
  phase         public.marks_alloc_phase    NOT NULL DEFAULT 'manual',
  status        public.marks_alloc_status   NOT NULL DEFAULT 'pending_approval',
  note          text                        NOT NULL DEFAULT '',
  approved_by   uuid                        REFERENCES auth.users(id),
  approved_at   timestamptz,
  created_at    timestamptz                 NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.marks_allocation_queue IS
  'Manual-to-auto payout staging. '
  'Phase=manual: Founder approves from admin dashboard. '
  'Phase=automatic: approved instantly when MARKS_AUTO_PAYOUT_ENABLED=true. '
  'HELD: marks_units for membership events = 0 until Founder sets rates.';

CREATE INDEX IF NOT EXISTS idx_maq_member
  ON public.marks_allocation_queue (member_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_maq_status
  ON public.marks_allocation_queue (status) WHERE status = 'pending_approval';

ALTER TABLE public.marks_allocation_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS maq_select_own ON public.marks_allocation_queue;
CREATE POLICY maq_select_own
  ON public.marks_allocation_queue FOR SELECT
  TO authenticated
  USING (auth.uid() = member_id);

DROP POLICY IF EXISTS maq_service ON public.marks_allocation_queue;
CREATE POLICY maq_service
  ON public.marks_allocation_queue FOR ALL
  TO service_role
  USING (true);

DROP POLICY IF EXISTS maq_insert_auth ON public.marks_allocation_queue;
CREATE POLICY maq_insert_auth
  ON public.marks_allocation_queue FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = member_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Grants
-- ─────────────────────────────────────────────────────────────────────────────

GRANT SELECT, INSERT ON public.shadow_marks_ledger TO authenticated;
GRANT SELECT, INSERT ON public.bounties TO authenticated;
GRANT SELECT, INSERT ON public.bounty_claims TO authenticated;
GRANT SELECT, INSERT ON public.marks_redemptions TO authenticated;
GRANT SELECT, INSERT ON public.marks_allocation_queue TO authenticated;
