# KNIGHT MARATHON: Cue Deck Card Unified System Gap Closure + Crew/Substrate Network Brochure
**SEG-BH Bishop Compose · BP093 · 2026-06-24**
**Status: QUEUED IN BISHOP_DROPZONE -- Founder releases after 4th wave / MMLU-Pro publish run**

---

## PREAMBLE -- READ BEFORE ANY ACTION

**COMPOSER MODEL: Sonnet 4.6 (claude-sonnet-4-6)**

Knight MUST confirm at session start that it is running Sonnet 4.6. If the model is anything other than Sonnet 4.6, STOP and report to Founder before taking any action.

**use segs** -- use Bishop SEG receipts as the ground truth for wiring state. Do not assume tables exist; verify via information_schema before altering.

**§14 §15 §17 BLOOD** -- three active blood covenants govern this build:
- §14 BLOOD: No fabricated receipts. Every empirical claim in the yoke must come from actual psql/curl/log output, not inference.
- §15 BLOOD: All Supabase schema work (migrations, RPCs, RLS) is applied via psql or REST. No Supabase dashboard clicks.
- §17 BLOOD: No Electron. No Hugo build-and-deploy. This build is web/Supabase only. ELECTRON_TOUCHED: NO.

**READ FIRST -- CANON:**
`C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_cue_deck_card_unified_system_facets_join_my_crew_socceri_network_join_bp093.eblet.md`

Knight reads this canon in full before writing a single line of SQL or TypeScript. Key points:
- 7 facets, ONE unified seed-loop primitive. No separate attribution models.
- Threshold ladder: Pioneer (1-100, 10 Marks) through Ambassador (50,001+, 1 Mark) -- cumulative across all 7 facets.
- One-level-of-separation rule is structural. No chain tables. No upstream referrer columns. EVER.
- SOCCERI address = SHA-512 of peer payload bytes, lowercase hex. Facet (g) only.
- Facet (g) = Crew / Substrate Network brochure form. Toggle ON = SOCCERI network join + MIC designation. Toggle OFF = attribution only.

**READ SECOND -- SPEC:**
`C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\SPEC_JOIN_MY_CREW_SUBSTRATE_NETWORK_REFERRAL_BP093.md`

Knight reads the full spec (sections 1-14) before Phase 2 UI work begins. The spec drives the brochure form shape, toggle behavior, email copy, and backend edge function design.

**Postgres-only SQL canon:** gen_random_uuid() / TIMESTAMPTZ / BIGSERIAL / BYTEA. No SQLite primitives.
**RLS discipline:** EVERY migration that creates a table must also enable RLS and add at least one policy in the SAME migration file. Never split table creation from RLS across separate files.
**Per-table migrations:** one migration file per table. Clean rollback surface. No mega-migration.
**search_path lock:** every SECURITY DEFINER function must set `SET search_path = public` before the function body.

---

## PHASE 1 -- DB Schema Gap Closure (~4.75h)
**§14 §15 §17 BLOOD**

Verify current state first. Before applying any migration, Knight runs:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'member_cue_cards','cue_card_scans','service_units_earned',
    'medallion_qr_codes','sponsor_distribution_pools',
    'influencer_challenge_config','tiered_access_system','referrals'
  );
```

Also verify columns on member_profiles:

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'member_profiles'
  AND column_name IN (
    'referred_by_member_id','referrer_attribution_count',
    'referred_by_referral_id','tier_at_referral_signup',
    'introducer_user_id'
  );
```

Report the pre-apply state in the yoke. Only apply migrations for tables/columns that do NOT already exist.

---

### Migration 1-A: `referred_by_member_id` + `referrer_attribution_count` columns on `member_profiles`
**Estimated: 0.5h**
**File:** `supabase/migrations/20260624000001_member_profiles_referral_cols.sql`

```sql
-- §15 BLOOD: psql apply only
-- Adds referral attribution columns to member_profiles.
-- RLS: member_profiles table already has RLS enabled (verify before applying).
-- No new table, no new RLS block required in this file.
-- Knight verifies existing RLS status: SELECT relrowsecurity FROM pg_class WHERE relname = 'member_profiles';

ALTER TABLE public.member_profiles
  ADD COLUMN IF NOT EXISTS referred_by_member_id       uuid REFERENCES public.member_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS referred_by_referral_id     uuid,   -- FK to referrals added after referrals table created
  ADD COLUMN IF NOT EXISTS referrer_attribution_count  integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tier_at_referral_signup     text;

-- introducer_user_id: BP079 column not yet applied per SEG-BF
ALTER TABLE public.member_profiles
  ADD COLUMN IF NOT EXISTS introducer_user_id uuid REFERENCES public.member_profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.member_profiles.referred_by_member_id IS 'Direct referrer (one-level only, no chain) -- member_profiles.id of the person who sent the invite';
COMMENT ON COLUMN public.member_profiles.referrer_attribution_count IS 'Running total of conversions credited to this member across all 7 Cue Deck Card facets -- drives threshold ladder tier (see canon_cue_deck_card_unified_system_facets_join_my_crew_socceri_network_join_bp093)';
COMMENT ON COLUMN public.member_profiles.introducer_user_id IS 'BP079: the member who issued the welcome-screen Cue Deck Card (may differ from referred_by_member_id if the final conversion came via a different facet)';
```

Gate: Knight confirms columns present via information_schema after apply.

---

### Migration 1-B: `referrals` table
**Estimated: 0.5h (part of §6 spec, renamed from spec for clarity)**
**File:** `supabase/migrations/20260624000002_referrals_table.sql`

```sql
-- §15 BLOOD: psql apply only
-- Tracks every invite send and its subsequent conversion.
-- Part of the Cue Deck Card unified seed-loop (canon §2 shared mechanics).

CREATE TABLE IF NOT EXISTS public.referrals (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_member_id   uuid        REFERENCES public.member_profiles(id) ON DELETE SET NULL,
  referrer_name_anon   text,
  recipient_email      text        NOT NULL,
  socceri_node_hash    text,
  ref_member_uuid      uuid,
  mode                 text        NOT NULL CHECK (mode IN ('dr-mnemosynec','substrate-network')),
  message_sent         text,
  explainer_sent       text,
  sent_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  signup_member_id     uuid        REFERENCES public.member_profiles(id) ON DELETE SET NULL,
  signed_up_at         TIMESTAMPTZ,
  attribution_expired  boolean     NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer    ON public.referrals (referrer_member_id, signed_up_at);
CREATE INDEX IF NOT EXISTS idx_referrals_recipient   ON public.referrals (recipient_email);
CREATE INDEX IF NOT EXISTS idx_referrals_signup      ON public.referrals (signup_member_id);
CREATE INDEX IF NOT EXISTS idx_referrals_mode_sent   ON public.referrals (mode, sent_at DESC);

-- RLS: enable and lock in same migration per §4 BLOOD discipline
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY referrals_select_own ON public.referrals
  FOR SELECT TO authenticated
  USING (referrer_member_id = auth.uid());

CREATE POLICY referrals_insert_service ON public.referrals
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY referrals_update_service ON public.referrals
  FOR UPDATE TO service_role
  USING (true);

-- Backfill FK now that referrals table exists
ALTER TABLE public.member_profiles
  ADD CONSTRAINT IF NOT EXISTS member_profiles_referred_by_referral_id_fk
  FOREIGN KEY (referred_by_referral_id) REFERENCES public.referrals(id) ON DELETE SET NULL;
```

Gate: confirm table + 3 RLS policies + 4 indexes + FK constraint via information_schema.

---

### Migration 1-C: `member_cue_cards` table
**Estimated: 1h**
**File:** `supabase/migrations/20260624000003_member_cue_cards.sql`

```sql
-- §15 BLOOD: psql apply only
-- Per-member wallet: one row per issued Cue Deck Card (links member to template, carries the QR stamp).
-- Canon: canon_cue_deck_card_unified_system_facets_join_my_crew_socceri_network_join_bp093 §1(b)

CREATE TABLE IF NOT EXISTS public.member_cue_cards (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id            uuid        NOT NULL REFERENCES public.member_profiles(id) ON DELETE CASCADE,
  template_id          uuid        NOT NULL REFERENCES public.cue_card_templates(id) ON DELETE RESTRICT,
  stamped_at           TIMESTAMPTZ,
  qr_code              text        UNIQUE,
  introducer_user_id   uuid        REFERENCES public.member_profiles(id) ON DELETE SET NULL,
  active               boolean     NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mcc_member_id   ON public.member_cue_cards (member_id);
CREATE INDEX IF NOT EXISTS idx_mcc_template_id ON public.member_cue_cards (template_id);
CREATE INDEX IF NOT EXISTS idx_mcc_qr_code     ON public.member_cue_cards (qr_code);

ALTER TABLE public.member_cue_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY mcc_select_own ON public.member_cue_cards
  FOR SELECT TO authenticated
  USING (member_id = auth.uid());

CREATE POLICY mcc_insert_service ON public.member_cue_cards
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY mcc_update_service ON public.member_cue_cards
  FOR UPDATE TO service_role
  USING (true);
```

Gate: table present, RLS on, sample insert succeeds, anon select blocked.

---

### Migration 1-D: `cue_card_scans` table
**Estimated: 0.5h**
**File:** `supabase/migrations/20260624000004_cue_card_scans.sql`

```sql
-- §15 BLOOD: psql apply only
-- Event log: one row per QR scan event.
-- Feeds into referral attribution and conversion tracking.

CREATE TABLE IF NOT EXISTS public.cue_card_scans (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  cue_card_id          uuid        NOT NULL REFERENCES public.member_cue_cards(id) ON DELETE CASCADE,
  scanner_user_id      uuid        REFERENCES public.member_profiles(id) ON DELETE SET NULL,
  scanned_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  referrer_url         text,
  ip_hash              text,
  user_agent           text,
  converted            boolean     NOT NULL DEFAULT false,
  converted_member_id  uuid        REFERENCES public.member_profiles(id) ON DELETE SET NULL,
  conversion_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ccs_cue_card_id ON public.cue_card_scans (cue_card_id);
CREATE INDEX IF NOT EXISTS idx_ccs_scanned_at  ON public.cue_card_scans (scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_ccs_converted   ON public.cue_card_scans (converted, conversion_at);

ALTER TABLE public.cue_card_scans ENABLE ROW LEVEL SECURITY;

-- Scans are service_role write only; no auth read (privacy: scanner identity protected)
CREATE POLICY ccs_insert_service ON public.cue_card_scans
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY ccs_update_service ON public.cue_card_scans
  FOR UPDATE TO service_role
  USING (true);

-- Card owner may read their own card's scans (aggregate, not scanner identity)
CREATE POLICY ccs_select_card_owner ON public.cue_card_scans
  FOR SELECT TO authenticated
  USING (
    cue_card_id IN (
      SELECT id FROM public.member_cue_cards WHERE member_id = auth.uid()
    )
  );
```

Gate: table + RLS + 3 policies + 3 indexes confirmed.

---

### Migration 1-E: `service_units_earned` table
**Estimated: 0.5h**
**File:** `supabase/migrations/20260624000005_service_units_earned.sql`

```sql
-- §15 BLOOD: psql apply only
-- Earnings ledger: one row per award event across all 7 Cue Deck Card facets.
-- source_type CHECK enforces valid award origins.
-- Anti-MLM structural note: earner_member_id is always the DIRECT referrer, never an upstream ancestor.

CREATE TABLE IF NOT EXISTS public.service_units_earned (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  earner_member_id  uuid        NOT NULL REFERENCES public.member_profiles(id) ON DELETE CASCADE,
  source_type       text        NOT NULL CHECK (source_type IN ('referral','medallion_unlock','sponsor','influencer')),
  source_id         uuid        NOT NULL,
  credits           numeric     NOT NULL DEFAULT 0,
  marks             numeric     NOT NULL DEFAULT 0,
  joules            numeric     NOT NULL DEFAULT 0,
  tier_at_earn      text        NOT NULL,
  notes             text,
  earned_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sue_earner        ON public.service_units_earned (earner_member_id, earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_sue_source_type   ON public.service_units_earned (source_type, source_id);

ALTER TABLE public.service_units_earned ENABLE ROW LEVEL SECURITY;

CREATE POLICY sue_select_own ON public.service_units_earned
  FOR SELECT TO authenticated
  USING (earner_member_id = auth.uid());

CREATE POLICY sue_insert_service ON public.service_units_earned
  FOR INSERT TO service_role
  WITH CHECK (true);
```

Gate: table + RLS + 2 policies + 2 indexes confirmed.

---

### Migration 1-F: `medallion_qr_codes` table
**Estimated: 0.5h**
**File:** `supabase/migrations/20260624000006_medallion_qr_codes.sql`

```sql
-- §15 BLOOD: psql apply only
-- QR code registry for physical/digital medallion assets.
-- Ties a medallion (from member_medallion_collection) to a scannable QR.
-- Knight verifies member_medallion_collection exists before applying:
--   SELECT table_name FROM information_schema.tables WHERE table_name = 'member_medallion_collection';

CREATE TABLE IF NOT EXISTS public.medallion_qr_codes (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  medallion_id    uuid        NOT NULL REFERENCES public.member_medallion_collection(id) ON DELETE CASCADE,
  qr_code         text        NOT NULL UNIQUE,
  resolved_url    text        NOT NULL,
  scan_count      integer     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mqc_medallion_id ON public.medallion_qr_codes (medallion_id);
CREATE INDEX IF NOT EXISTS idx_mqc_qr_code      ON public.medallion_qr_codes (qr_code);

ALTER TABLE public.medallion_qr_codes ENABLE ROW LEVEL SECURITY;

-- Medallion owner reads their own QR codes
CREATE POLICY mqc_select_owner ON public.medallion_qr_codes
  FOR SELECT TO authenticated
  USING (
    medallion_id IN (
      SELECT id FROM public.member_medallion_collection WHERE member_id = auth.uid()
    )
  );

CREATE POLICY mqc_insert_service ON public.medallion_qr_codes
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY mqc_update_service ON public.medallion_qr_codes
  FOR UPDATE TO service_role
  USING (true);
```

Note: If `member_medallion_collection` does not exist in live schema, Knight substitutes `medallion_id uuid NOT NULL` as a bare column (no FK) and comments: `-- FK pending member_medallion_collection table`. Report in yoke.

Gate: table + RLS + 3 policies + 2 indexes confirmed.

---

### Migration 1-G: `sponsor_distribution_pools` table
**Estimated: 0.5h**
**File:** `supabase/migrations/20260624000007_sponsor_distribution_pools.sql`

```sql
-- §15 BLOOD: psql apply only
-- Tracks sponsor distribution allocations (Johnny Appleseed program §6 of canon).
-- pool_type CHECK matches spec modes: manual / locale / general / requirements.

CREATE TABLE IF NOT EXISTS public.sponsor_distribution_pools (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_member_id    uuid        NOT NULL REFERENCES public.member_profiles(id) ON DELETE CASCADE,
  pool_type            text        NOT NULL CHECK (pool_type IN ('manual','locale','general','requirements')),
  allocation_count     integer     NOT NULL DEFAULT 50,
  allocated_count      integer     NOT NULL DEFAULT 0,
  patent_id            uuid,       -- FK to IP Ledger patent row; nullable if patent not yet selected
  distribution_config  jsonb       NOT NULL DEFAULT '{}',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sdp_sponsor ON public.sponsor_distribution_pools (sponsor_member_id);
CREATE INDEX IF NOT EXISTS idx_sdp_type    ON public.sponsor_distribution_pools (pool_type);

ALTER TABLE public.sponsor_distribution_pools ENABLE ROW LEVEL SECURITY;

CREATE POLICY sdp_select_own ON public.sponsor_distribution_pools
  FOR SELECT TO authenticated
  USING (sponsor_member_id = auth.uid());

CREATE POLICY sdp_insert_service ON public.sponsor_distribution_pools
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY sdp_update_service ON public.sponsor_distribution_pools
  FOR UPDATE TO service_role
  USING (true);
```

Gate: table + RLS + 3 policies + 2 indexes confirmed.

---

### Migration 1-H: `influencer_challenge_config` table
**Estimated: 0.5h**
**File:** `supabase/migrations/20260624000008_influencer_challenge_config.sql`

```sql
-- §15 BLOOD: psql apply only
-- Per-contest configuration for influencer content contest (canon §7).
-- prize_structure and judging_rubric stored as jsonb with canon-ratified defaults.

CREATE TABLE IF NOT EXISTS public.influencer_challenge_config (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_name   text        NOT NULL,
  prize_structure  jsonb       NOT NULL DEFAULT '{"1st":500,"2nd":300,"3rd":200,"category":100}',
  judging_rubric   jsonb       NOT NULL DEFAULT '{"clarity":30,"creativity":25,"engagement":25,"authenticity":20}',
  entrance_fee     numeric     NOT NULL DEFAULT 0,
  start_at         TIMESTAMPTZ,
  end_at           TIMESTAMPTZ,
  status           text        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','judging','closed')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_icc_status   ON public.influencer_challenge_config (status);
CREATE INDEX IF NOT EXISTS idx_icc_start_at ON public.influencer_challenge_config (start_at DESC);

ALTER TABLE public.influencer_challenge_config ENABLE ROW LEVEL SECURITY;

-- Any authenticated member can read active/closed contests
CREATE POLICY icc_select_active ON public.influencer_challenge_config
  FOR SELECT TO authenticated
  USING (status IN ('active','closed'));

CREATE POLICY icc_insert_service ON public.influencer_challenge_config
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY icc_update_service ON public.influencer_challenge_config
  FOR UPDATE TO service_role
  USING (true);
```

Gate: table + RLS + 3 policies + 2 indexes + default jsonb values confirmed via sample insert.

---

### Migration 1-I: `tiered_access_system` table
**Estimated: 0.5h**
**File:** `supabase/migrations/20260624000009_tiered_access_system.sql`

```sql
-- §15 BLOOD: psql apply only
-- Tier definitions and unlock multipliers (canon §5 Tiered Access Viral Mechanic).
-- Pre-seed with 5 canonical tiers after table creation.

CREATE TABLE IF NOT EXISTS public.tiered_access_system (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name         text        NOT NULL UNIQUE CHECK (tier_name IN ('founder','medallion','early_backer','preview','basic')),
  unlock_multiplier integer     NOT NULL DEFAULT 0,
  voting_power      numeric     NOT NULL DEFAULT 1.0,
  description       text,
  active            boolean     NOT NULL DEFAULT true
);

ALTER TABLE public.tiered_access_system ENABLE ROW LEVEL SECURITY;

-- All authenticated members may read tier definitions (public reference data)
CREATE POLICY tas_select_all ON public.tiered_access_system
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY tas_insert_service ON public.tiered_access_system
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY tas_update_service ON public.tiered_access_system
  FOR UPDATE TO service_role
  USING (true);

-- Pre-seed canonical tiers (idempotent via ON CONFLICT)
INSERT INTO public.tiered_access_system (tier_name, unlock_multiplier, voting_power, description)
VALUES
  ('founder',       100, 3.0, 'Founder -- 100 memberships unlockable, 3x voting'),
  ('medallion',      50, 2.0, 'Medallion holder -- 50 memberships unlockable, 2x voting'),
  ('early_backer',   10, 1.5, 'Early backer -- 10 memberships unlockable, 1.5x voting'),
  ('preview',         5, 1.0, 'Preview tier -- 5 memberships unlockable, no voting bonus'),
  ('basic',           0, 1.0, 'Basic member -- 0 memberships unlockable, no voting bonus')
ON CONFLICT (tier_name) DO NOTHING;
```

Gate: table + 5 rows seeded + RLS + 3 policies confirmed.

---

### Migration 1-J: `record_crew_referral_signup` RPC
**Estimated: 0.5h (included in Phase 1 total)**
**File:** `supabase/migrations/20260624000010_record_crew_referral_signup_rpc.sql`

```sql
-- §15 BLOOD: psql apply only
-- Atomically attributes a new signup to an inviter.
-- Anti-MLM structural note (canon §9): ONE hop only. No recursive lookup.
--   A comment documenting this rule is embedded in the function body below.
-- Marks awarded per threshold ladder (canon §3):
--   Pioneer 1-100: 10 Marks | Vanguard 101-500: 5 | Pathfinder 501-2000: 3
--   Trailblazer 2001-10000: 2 | Guide 10001-50000: 1.5 | Ambassador 50001+: 1

CREATE OR REPLACE FUNCTION public.record_crew_referral_signup(
  p_recipient_user_id   uuid,
  p_introducer_user_id  uuid,
  p_socceri_address     text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_count    integer;
  v_marks_award  numeric;
  v_tier_name    text;
BEGIN
  -- ANTI-MLM STRUCTURAL LOCK (canon §9):
  -- This function attributes ONE hop only: p_introducer_user_id gets credit.
  -- There is no upstream walk, no ancestor lookup, no recursive CTE.
  -- Adding any upstream propagation to this function is a canon violation.

  -- Guard: do not attribute if recipient already has a referrer
  IF EXISTS (
    SELECT 1 FROM public.member_profiles
    WHERE id = p_recipient_user_id
      AND referred_by_member_id IS NOT NULL
  ) THEN
    RETURN jsonb_build_object('status','already_attributed');
  END IF;

  -- Stamp the new member's profile
  UPDATE public.member_profiles
  SET
    referred_by_member_id = p_introducer_user_id,
    tier_at_referral_signup = (
      SELECT tier_name FROM public.tiered_access_system
      WHERE active = true
      LIMIT 1  -- Founder replaces with actual tier lookup against dna_lock config at wiring time
    )
  WHERE id = p_recipient_user_id;

  -- Increment inviter's attribution count and capture new total
  UPDATE public.member_profiles
  SET referrer_attribution_count = referrer_attribution_count + 1
  WHERE id = p_introducer_user_id
  RETURNING referrer_attribution_count INTO v_new_count;

  -- Determine Marks award per threshold ladder (canon §3, dna_lock config table as authoritative source)
  -- Knight reads dna_lock config keyed creator_referral_tier_* for live values.
  -- Fallback ladder below used only if dna_lock query returns null.
  v_marks_award := CASE
    WHEN v_new_count <= 100   THEN 10
    WHEN v_new_count <= 500   THEN 5
    WHEN v_new_count <= 2000  THEN 3
    WHEN v_new_count <= 10000 THEN 2
    WHEN v_new_count <= 50000 THEN 1.5
    ELSE 1
  END;

  v_tier_name := CASE
    WHEN v_new_count <= 100   THEN 'Pioneer'
    WHEN v_new_count <= 500   THEN 'Vanguard'
    WHEN v_new_count <= 2000  THEN 'Pathfinder'
    WHEN v_new_count <= 10000 THEN 'Trailblazer'
    WHEN v_new_count <= 50000 THEN 'Guide'
    ELSE 'Ambassador'
  END;

  -- Write to earnings ledger
  INSERT INTO public.service_units_earned
    (earner_member_id, source_type, source_id, marks, tier_at_earn, notes)
  VALUES
    (p_introducer_user_id, 'referral', p_recipient_user_id,
     v_marks_award, v_tier_name,
     'Crew referral signup attribution -- one-level only');

  RETURN jsonb_build_object(
    'status',        'attributed',
    'new_count',     v_new_count,
    'tier',          v_tier_name,
    'marks_awarded', v_marks_award,
    'socceri_wired', p_socceri_address IS NOT NULL
  );
END;
$$;

-- Grant exec to authenticated (called from edge function with user context)
GRANT EXECUTE ON FUNCTION public.record_crew_referral_signup(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_crew_referral_signup(uuid, uuid, text) TO service_role;
```

Gate: Knight calls RPC with dummy UUIDs via psql and confirms jsonb return. Confirm SECURITY DEFINER + search_path lock present.

---

## PHASE 1 GATE -- Empirical Confirm

After all 1-A through 1-J applied, Knight runs this verification block and pastes output verbatim in yoke:

```sql
-- Phase 1 gate: one block, paste full output
SELECT
  t.table_name,
  t.row_security
FROM (
  SELECT table_name,
         (SELECT relrowsecurity FROM pg_class WHERE relname = tables.table_name) AS row_security
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'member_cue_cards','cue_card_scans','service_units_earned',
      'medallion_qr_codes','sponsor_distribution_pools',
      'influencer_challenge_config','tiered_access_system','referrals'
    )
) t
ORDER BY t.table_name;

-- Column confirm on member_profiles
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'member_profiles'
  AND column_name IN (
    'referred_by_member_id','referrer_attribution_count',
    'referred_by_referral_id','tier_at_referral_signup',
    'introducer_user_id'
  );

-- RLS policy count per new table
SELECT schemaname, tablename, COUNT(*) AS policy_count
FROM pg_policies
WHERE tablename IN (
  'member_cue_cards','cue_card_scans','service_units_earned',
  'medallion_qr_codes','sponsor_distribution_pools',
  'influencer_challenge_config','tiered_access_system','referrals'
)
GROUP BY schemaname, tablename
ORDER BY tablename;
```

**Founder ratify checkpoint 1:** Founder reviews Phase 1 yoke output (table list, RLS counts, RPC test) before Knight proceeds to Phase 2.

---

## PHASE 2 -- Edge Function: `crew-invite-send` (~3-4h)
**§14 §15 §17 BLOOD**

**File:** `supabase/functions/crew-invite-send/index.ts`
**Replaces or supersedes:** existing `share-from-mnemosynec` edge function (Knight reads existing function first, then decides replace vs extend).

### Function contract

```typescript
// Payload shape sent from brochure form
interface CrewInvitePayload {
  recipients:      string[];           // max 10, validated email format
  message:         string;             // editable by sender
  explainer:       string;             // editable by sender
  mode:            'dr-mnemosynec' | 'substrate-network';
  sender_name?:    string;             // mode = dr-mnemosynec only
  socceri_hash?:   string;             // mode = substrate-network only (SHA-512 hex)
  ref_member_id?:  string;             // mode = substrate-network only (inviter uuid)
  bounty_poster_url?: string;          // optional (Phase 5)
}

// Response shape
interface CrewInviteResponse {
  sent:            number;
  referral_rows:   string[];           // UUIDs of created referral rows
  mailto_payload?: string;             // mode = substrate-network: base64 mailto: body for client
  errors:          string[];
}
```

### Rate limiting

- Max 10 recipients per request (validate in edge function, return 400 if exceeded).
- Max 50 sends per user per day: Knight checks existing `referrals` rows where `referrer_member_id = caller_uuid AND sent_at > now() - interval '24 hours'`.
- If limit exceeded: return 429 with `{"error":"daily_limit_exceeded","limit":50}`.

### Mode A -- Toggle OFF (Dr. MnemosyneC sender)

1. Validate payload: recipients array not empty, all valid email format, max 10.
2. Rate check: caller uuid from `supabase.auth.getUser()`.
3. For each recipient: INSERT row into `referrals` (mode='dr-mnemosynec', referrer_member_id=caller, recipient_email, message_sent, explainer_sent, sent_at=now()).
4. Send via Resend API (preferred) or SendGrid if existing account found. From: `dr.mnemosynec@mnemosynec.org`. Reply-to: none. Subject: "Someone thought you should see this."
5. Return sent count + referral row UUIDs.

Knight reads `supabase/functions/share-from-mnemosynec/index.ts` first. If a Resend or SendGrid API key is already wired in env vars, use that service. Do not introduce a second email vendor. Report which service is wired in yoke.

### Mode B -- Toggle ON (Substrate Network join)

Per spec section 5, v1 recommendation is B2 (mailto: handoff). Knight implements B2 for v1:

1. Validate payload: socceri_hash present and is 128-char hex string, ref_member_id valid uuid.
2. Rate check (same as Mode A).
3. For each recipient: INSERT row into `referrals` (mode='substrate-network', referrer_member_id=caller, socceri_node_hash, ref_member_uuid, recipient_email, sent_at=now()).
4. Compose mailto: payload:
   - To: comma-joined recipient list
   - Subject: "Join my Crew on MnemosyneC"
   - Body: message text + explainer + ref link `https://mnemosynec.org/?ref_node={socceri_hash}&ref_member={ref_member_id}` + optional bounty poster URL
5. Return referral row UUIDs + mailto_payload (base64-encoded mailto: URI string for client to open).

### Smoke test gate

Knight sends a curl to the deployed function with a test payload (mode='dr-mnemosynec', one test recipient) and confirms:
- HTTP 200
- referral row exists in DB
- Email received (or SendGrid/Resend delivery log confirms queued)

**Founder ratify checkpoint 2:** Founder reviews Phase 2 yoke output (smoke test curl, delivery confirm) before Phase 3 begins.

---

## PHASE 3 -- Brochure UI Form (~4-6h)
**§14 §15 §17 BLOOD**
**ELECTRON_TOUCHED: NO**
**Hugo build: NO -- static-blob direct edit only**

Knight reads the spec section 2 visual layout and section 3 toggle behavior in full before touching any HTML.

### Target files

- `public-mnemosynec/index.html` (lines 922-970 per spec -- existing Share This widget)
- `public-mnemosynec-ai/index.html` (same widget, same replacement)

Knight finds the exact line range via grep before editing:

```
grep -n "share-from-mnemosynec\|Share This\|shareWidget\|share_widget" public-mnemosynec/index.html
```

### Widget structure (HTML/JS inline)

Replace the existing widget with this structure (Knight adapts exact class names to match surrounding stylesheet):

```html
<!-- JOIN MY CREW widget -- BP093 -- replaces share-from-mnemosynec -->
<div class="join-my-crew-widget" id="joinMyCrew">
  <h3>Join My Crew</h3>

  <!-- Toggle -->
  <label class="toggle-row">
    <input type="checkbox" id="crewToggle" />
    <span class="toggle-label-off">Send via Dr. MnemosyneC</span>
    <span class="toggle-label-on">Send from my address / Join my Substrate Network</span>
  </label>

  <!-- Mode A: name/handle (hidden in Toggle ON) -->
  <div id="senderNameRow">
    <label>Your name or handle
      <input type="text" id="senderName" placeholder="How you want to appear in the message" />
    </label>
  </div>

  <!-- Message textarea -->
  <label>Message
    <textarea id="inviteMessage" rows="4"></textarea>
  </label>

  <!-- Explainer textarea -->
  <label>Explainer
    <textarea id="inviteExplainer" rows="3"></textarea>
  </label>

  <!-- Recipient email list (max 10) -->
  <div id="recipientList">
    <label>To: <input type="email" class="recipient-email" placeholder="email@example.com" /></label>
  </div>
  <button type="button" id="addRecipient">+ Add another (max 10)</button>

  <!-- Substrate Network note (visible only Toggle ON) -->
  <p id="substrateNote" style="display:none;">
    Your node address is embedded. Recipients who sign up join your Substrate Network.
  </p>

  <!-- Send button -->
  <button type="button" id="sendInvites" disabled>Send Invites</button>

  <!-- Status message -->
  <p id="crewStatus"></p>
</div>
```

### JavaScript logic (inline script block)

```javascript
(function () {
  var BASE_URL = 'https://<SUPABASE_PROJECT_REF>.supabase.co/functions/v1/crew-invite-send';
  var SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '';  // Knight reads from existing env pattern

  var toggle       = document.getElementById('crewToggle');
  var senderRow    = document.getElementById('senderNameRow');
  var senderName   = document.getElementById('senderName');
  var msgArea      = document.getElementById('inviteMessage');
  var explArea     = document.getElementById('inviteExplainer');
  var recipList    = document.getElementById('recipientList');
  var addBtn       = document.getElementById('addRecipient');
  var subNote      = document.getElementById('substrateNote');
  var sendBtn      = document.getElementById('sendInvites');
  var statusEl     = document.getElementById('crewStatus');

  var MSG_OFF = "I use MnemosyneC to give my AI a real memory. It works on your own computer, free, no account required. I thought you should see it.";
  var MSG_ON  = "I'm building out my Substrate Network on MnemosyneC. If you join through this link, you'll be part of my crew -- and that makes the whole network a little smarter for all of us.";
  var EXPLAINER = "MnemosyneC is a free, local-first AI memory layer. SHA-256 stamped. No cloud. No ads. Optionally join the cooperative for $5/year. Learn more at mnemosynec.org";

  msgArea.value  = MSG_OFF;
  explArea.value = EXPLAINER;

  toggle.addEventListener('change', function () {
    if (toggle.checked) {
      senderRow.style.display  = 'none';
      subNote.style.display    = 'block';
      msgArea.value            = MSG_ON;
    } else {
      senderRow.style.display  = 'block';
      subNote.style.display    = 'none';
      msgArea.value            = MSG_OFF;
    }
    validateForm();
  });

  addBtn.addEventListener('click', function () {
    var inputs = recipList.querySelectorAll('.recipient-email');
    if (inputs.length >= 10) {
      statusEl.textContent = 'Maximum 10 recipients.';
      return;
    }
    var label = document.createElement('label');
    label.innerHTML = 'To: <input type="email" class="recipient-email" placeholder="email@example.com" />';
    recipList.appendChild(label);
    label.querySelector('input').addEventListener('input', validateForm);
  });

  recipList.addEventListener('input', validateForm);

  function validateForm() {
    var emails = Array.from(recipList.querySelectorAll('.recipient-email'))
      .map(function (i) { return i.value.trim(); })
      .filter(function (v) { return v.length > 0; });
    sendBtn.disabled = emails.length === 0;
  }

  sendBtn.addEventListener('click', function () {
    var emails = Array.from(recipList.querySelectorAll('.recipient-email'))
      .map(function (i) { return i.value.trim(); })
      .filter(function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); });

    if (emails.length === 0) {
      statusEl.textContent = 'Add at least one valid email address.';
      return;
    }

    var payload = {
      recipients:  emails,
      message:     msgArea.value,
      explainer:   explArea.value,
      mode:        toggle.checked ? 'substrate-network' : 'dr-mnemosynec'
    };

    if (!toggle.checked && senderName.value.trim()) {
      payload.sender_name = senderName.value.trim();
    }

    // Toggle ON: read socceriHash from session/local storage (populated during MnemosyneC login)
    if (toggle.checked) {
      var sHash  = window.sessionStorage.getItem('socceriHash')  || '';
      var refId  = window.sessionStorage.getItem('memberUuid')   || '';
      if (!sHash || !refId) {
        statusEl.textContent = 'Login and confirm your email to use Substrate Network mode.';
        return;
      }
      payload.socceri_hash  = sHash;
      payload.ref_member_id = refId;
    }

    sendBtn.disabled       = true;
    statusEl.textContent   = 'Sending...';

    fetch(BASE_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY,
                 'Authorization': 'Bearer ' + (window.sessionStorage.getItem('accessToken') || SUPABASE_ANON_KEY) },
      body:    JSON.stringify(payload)
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.mailto_payload) {
        // Mode B2: open mailto: in client email app
        window.location.href = atob(data.mailto_payload);
        statusEl.textContent = 'Your email client is opening. Check your outbox after sending.';
      } else {
        statusEl.textContent = 'Sent to ' + (data.sent || 0) + ' recipient(s). Thank you.';
      }
      sendBtn.disabled = false;
    })
    .catch(function (err) {
      statusEl.textContent = 'Error: ' + err.message;
      sendBtn.disabled     = false;
    });
  });
})();
```

Knight adapts SUPABASE_PROJECT_REF and SUPABASE_ANON_KEY from the pattern used by the rest of index.html (grep for existing fetch calls to Supabase to find the pattern).

### Mobile breakpoint

Within the existing `@media (max-width: 600px)` block, add:

```css
.join-my-crew-widget { padding: 12px; }
.join-my-crew-widget textarea { width: 100%; }
.join-my-crew-widget input[type="email"] { width: 100%; }
```

Gate: Knight takes a screenshot (or curl + grep output length) confirming the widget is present in the rendered HTML. If Claude Preview tool is available, use it. Otherwise paste the grep of the inserted HTML block.

**Founder ratify checkpoint 3:** Founder visually reviews brochure on at least one device (desktop + mobile) before Phase 4 begins.

---

## PHASE 4 -- Signup Attribution Wiring (~2-3h)
**§14 §15 §17 BLOOD**

### Where signup attribution fires

Knight locates the existing Supabase auth signup hook or post-signup trigger. Search:

```
grep -r "record_referral_signup\|onAuthStateChange\|handle_new_user\|after insert.*auth.users" supabase/ --include="*.sql" --include="*.ts"
```

If a `handle_new_user` trigger function already exists on `auth.users`, add attribution call there. If not, wire in the new-member edge function or RLS-free trigger.

### Attribution logic

1. On new member signup: read `ref_node` and `ref_member` from signup URL params (passed via `supabase.auth.signUp({ options: { data: { ref_node, ref_member } } })`).
2. If both params present: call `public.record_crew_referral_signup(new_member_id, ref_member, ref_node)`.
3. If only `ref_member` present (Mode A / Toggle OFF path): call `public.record_crew_referral_signup(new_member_id, ref_member, NULL)`.
4. If neither: organic signup, no attribution, no RPC call.

### MIC designation (Toggle ON path only)

Per canon §8 Crew facet unique behavior 4 + BP091 MIC amendment:

- When `ref_node` (socceriHash) is present: the new peer's initial MIC target is set to the inviter's socceriHash.
- Staggered scheme: alternate at 2 peers, alternate + shadow at 3.
- MIC is rotatable; `referrals` row persists for attribution regardless of later MIC rotation.

Knight locates the BP091 MIC rotation/escalation cascade implementation and adds `ref_node` as initial MIC seed parameter. If not yet wired, Knight stubs the call and notes it in yoke: "MIC initial seed stubbed -- requires BP091 wiring confirmation before activation."

### Attribution expiry sweep

```sql
-- File: supabase/migrations/20260624000011_referral_expiry_sweep.sql
-- Marks referrals as expired when attribution window passes.
-- Default window: 90 days (Founder ratifies before activation).

CREATE OR REPLACE FUNCTION public.sweep_referral_expiry()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.referrals
  SET attribution_expired = true
  WHERE attribution_expired = false
    AND signup_member_id IS NULL
    AND sent_at < now() - INTERVAL '90 days';
END;
$$;

-- Supabase pg_cron (requires pg_cron extension enabled on project)
-- Knight verifies pg_cron availability:
--   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
-- If available:
SELECT cron.schedule(
  'referral-expiry-sweep',
  '0 3 * * *',   -- 03:00 UTC daily
  'SELECT public.sweep_referral_expiry();'
);
```

Gate: Knight simulates expiry by setting a test referral's `sent_at` to `now() - interval '91 days'` and calling `sweep_referral_expiry()` manually. Confirm row's `attribution_expired` flips to true.

---

## PHASE 5 -- Bounty Poster Integration (~2h)
**§14 §15 §17 BLOOD**

Reference SEG-BD outputs:
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\BOUNTY_POSTER_12_CITIES_COMPETITION_BP093.md`
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\BOUNTY_POSTER_MNEMOSYNEC_DEVELOPER_TEAM_NOIDS_BP093.md`

### Form addition

In the Join My Crew widget (Toggle ON section only), add below the `substrateNote` paragraph:

```html
<div id="bountyPosterRow" style="display:none;">
  <label>Include a bounty poster link (optional)
    <input type="url" id="bountyPosterUrl" placeholder="https://lianabanyan.com/bounty/..." />
  </label>
  <small>Paste your city or developer bounty poster URL to include in the invite.</small>
</div>
```

Show/hide `bountyPosterRow` with the toggle (visible only when Toggle ON).

In the JS send handler, add to the Toggle ON branch:

```javascript
var posterUrl = document.getElementById('bountyPosterUrl').value.trim();
if (posterUrl) { payload.bounty_poster_url = posterUrl; }
```

The edge function already accepts `bounty_poster_url` in the payload (Phase 2 spec). Knight confirms it is included in the mailto: body as a linked callout line.

### Email callout line (Toggle ON mailto: body only)

```
Here's what we're building: {bounty_poster_url}
```

Gate: Knight sends a test invite with a bounty poster URL in Toggle ON mode. Confirm URL appears in the mailto: body before the send button is clicked.

**Founder ratify checkpoint 4:** Founder reviews Phase 5 yoke -- end-to-end test: form loads, toggle switches, recipients added, send fires, referral row created in DB, mailto: opens with correct body including poster URL.

---

## YOKE RETURN FORMAT

Knight returns a single yoke document at close of each Phase with the following structure:

```
PHASE [N] YOKE -- BP093 -- [timestamp]

ELECTRON_TOUCHED: NO
COMPOSER MODEL CONFIRM: Sonnet 4.6 (claude-sonnet-4-6)

MIGRATIONS APPLIED:
  [filename] -- applied at [timestamp] -- rows confirmed: [N]

RLS CONFIRM:
  [table] -- RLS enabled: YES -- policies: [N]

RPC CONFIRM:
  [function_name] -- callable: YES -- test output: [paste psql output]

GATE STATUS:
  [description of each gate check and empirical result]

OPEN ITEMS:
  [any stubs, deferred wiring, or Founder questions]
```

---

## WALL-CLOCK ESTIMATE

| Phase | Description | Estimate |
|-------|-------------|----------|
| 1 | DB schema gap closure (9 migrations + 1 RPC) | ~4.75h |
| 2 | Edge function crew-invite-send | ~3-4h |
| 3 | Brochure UI form on .org | ~4-6h |
| 4 | Signup attribution wiring + expiry sweep | ~2-3h |
| 5 | Bounty poster integration | ~2h |
| **Total** | | **~16-20h across 2-3 Marathons** |

Recommended split: Marathon 1 = Phase 1 + 2 (schema solid before UI). Marathon 2 = Phase 3 + 4. Marathon 3 = Phase 5 + full integration test.

---

## CANON EBLET TO MINT AT CLOSE

When Phase 5 yoke is empirically confirmed, Bishop mints based on Knight's receipt:

**Slug:** `canon_cue_deck_card_unified_system_FOURTH_WAVE_WIRED_BP093`

Contents: empirical confirmation that all 7 facets have corresponding schema, at least one RPC callable, brochure form live, signup attribution firing, and Bounty Poster embed working. Bishop drafts; Founder ratifies.

---

## FOUNDER ACTION

This paste sits queued. Founder releases after 4th wave / MMLU-Pro publish run. No Knight action until Founder says go.

Open questions for Founder before Knight starts (answer inline or in Dropzone note):
1. Attribution window: 90 days confirmed, or different?
2. Email sender for Toggle OFF: use existing email service (what service/API key is already wired?), or wire Resend fresh?
3. Toggle ON v1: B2 mailto: handoff confirmed for v1 (per spec recommendation)?
4. Placeholder message copy in Section 4 of spec: approved verbatim, or Founder wants to redraft?

---

*SEG-BH · BP093 · Sonnet 4.6 · Composer confirmed: claude-sonnet-4-6*
*§14 §15 §17 BLOOD inline at each phase.*
*Read canon first. Read spec second. Verify before applying. Yoke all gates.*
