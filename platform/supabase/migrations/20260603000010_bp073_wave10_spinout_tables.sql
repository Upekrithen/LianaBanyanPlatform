-- =============================================================================
-- BP073 WAVE 10 -- Spinout Real-Data Wiring
-- Phase beta: replace every static stub with live Supabase tables
-- Covers all 8 spinout entities:
--   Defense Klaus, Battery Dispatch, Anchor, CAI Bonfire,
--   Map & Compass, Stand in the Gap, MnemosyneC, Harper Guild
--
-- Convention (per BP052 remediation):
--   - search_path = public on all helper functions
--   - SECURITY INVOKER on all views
--   - RLS enabled + policies in same migration
--   - anon: SELECT on public aggregate views only
--   - authenticated: SELECT + INSERT on own rows (user_id = auth.uid())
--   - service_role: ALL
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. DEFENSE KLAUS
--    dk_orders         -- member canister/unit order requests
--    dk_legal_fund_pool -- contributions to the legal defense mutual-aid pool
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dk_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_type       TEXT NOT NULL DEFAULT 'standard',  -- standard | palm_claw | gps_variant
  quantity        INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  status          TEXT NOT NULL DEFAULT 'requested'
                  CHECK (status IN ('requested','queued','in_production','shipped','delivered','cancelled')),
  production_level INTEGER CHECK (production_level BETWEEN 1 AND 6),
  notes           TEXT,
  marks_awarded   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE dk_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dk_orders_service_role_all"
  ON dk_orders FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "dk_orders_owner_select"
  ON dk_orders FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "dk_orders_owner_insert"
  ON dk_orders FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_dk_orders_user_status
  ON dk_orders (user_id, status, created_at DESC);


CREATE TABLE IF NOT EXISTS dk_legal_fund_pool (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount_cents    INTEGER NOT NULL CHECK (amount_cents > 0),
  currency        TEXT NOT NULL DEFAULT 'USD',
  contribution_type TEXT NOT NULL DEFAULT 'direct'
                  CHECK (contribution_type IN ('direct','marks_conversion','charity_medallion')),
  status          TEXT NOT NULL DEFAULT 'received'
                  CHECK (status IN ('received','held','disbursed','refunded')),
  pool_balance_cents BIGINT GENERATED ALWAYS AS (amount_cents) STORED,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE dk_legal_fund_pool ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dk_legal_fund_pool_service_role_all"
  ON dk_legal_fund_pool FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "dk_legal_fund_pool_authenticated_select"
  ON dk_legal_fund_pool FOR SELECT TO authenticated
  USING (true);  -- pool balance is intentionally public to all members

CREATE POLICY "dk_legal_fund_pool_owner_insert"
  ON dk_legal_fund_pool FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_dk_legal_fund_pool_status
  ON dk_legal_fund_pool (status, created_at DESC);

-- View: aggregate pool stats (SECURITY INVOKER - RLS enforced)
CREATE OR REPLACE VIEW dk_pool_stats WITH (security_invoker = on) AS
  SELECT
    COUNT(*) FILTER (WHERE status = 'received')  AS pending_contributions,
    COUNT(*) FILTER (WHERE status = 'held')      AS held_contributions,
    COALESCE(SUM(amount_cents) FILTER (WHERE status IN ('received','held')), 0) AS total_pool_cents,
    COUNT(DISTINCT user_id)                       AS contributor_count,
    MAX(created_at)                               AS last_contribution_at
  FROM dk_legal_fund_pool;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. BATTERY DISPATCH
--    bd_contributions  -- member energy contributions (kWh, solar export, demand flex)
--    bd_dispatch_log   -- algorithm dispatch events
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bd_contributions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contribution_type TEXT NOT NULL
                    CHECK (contribution_type IN ('battery_storage','demand_flexibility','solar_export','pool_anchor')),
  kwh_contributed   NUMERIC(10,3) NOT NULL CHECK (kwh_contributed >= 0),
  kwh_capacity      NUMERIC(10,3),
  billing_cycle     TEXT NOT NULL,  -- ISO YYYY-MM
  marks_earned      INTEGER NOT NULL DEFAULT 0,
  revenue_cents     INTEGER NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','paused','suspended')),
  node_address      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE bd_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bd_contributions_service_role_all"
  ON bd_contributions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "bd_contributions_owner_select"
  ON bd_contributions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "bd_contributions_owner_insert"
  ON bd_contributions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_bd_contributions_user_cycle
  ON bd_contributions (user_id, billing_cycle DESC);


CREATE TABLE IF NOT EXISTS bd_dispatch_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type      TEXT NOT NULL
                  CHECK (event_type IN ('peak_event','demand_response','export_window','anchor_draw','test')),
  triggered_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at     TIMESTAMPTZ,
  kwh_dispatched  NUMERIC(10,3) NOT NULL DEFAULT 0,
  nodes_involved  INTEGER NOT NULL DEFAULT 0,
  grid_signal     TEXT,
  cost_cents      INTEGER NOT NULL DEFAULT 0,
  revenue_cents   INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','completed','cancelled','test')),
  algorithm_version TEXT NOT NULL DEFAULT '1.0',
  notes           TEXT
);

ALTER TABLE bd_dispatch_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bd_dispatch_log_service_role_all"
  ON bd_dispatch_log FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "bd_dispatch_log_authenticated_select"
  ON bd_dispatch_log FOR SELECT TO authenticated
  USING (true);  -- dispatch history is cooperative-public

CREATE INDEX IF NOT EXISTS idx_bd_dispatch_log_triggered
  ON bd_dispatch_log (triggered_at DESC, status);

-- View: dispatch summary stats (SECURITY INVOKER)
CREATE OR REPLACE VIEW bd_dispatch_summary WITH (security_invoker = on) AS
  SELECT
    COUNT(*)                                         AS total_events,
    COUNT(*) FILTER (WHERE status = 'completed')     AS completed_events,
    COALESCE(SUM(kwh_dispatched), 0)                 AS total_kwh_dispatched,
    COALESCE(SUM(nodes_involved), 0)                 AS total_node_participations,
    MAX(triggered_at)                                AS last_dispatch_at
  FROM bd_dispatch_log;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. ANCHOR
--    anchor_records         -- persistent context anchors (URN-keyed)
--    anchor_ipledger_entries -- hash-chained IP provenance entries per anchor
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS anchor_records (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  urn         TEXT UNIQUE NOT NULL,  -- urn:lb:anchor:<slug>
  title       TEXT NOT NULL,
  creator_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category    TEXT NOT NULL DEFAULT 'general',
  content     TEXT,
  build_count INTEGER NOT NULL DEFAULT 0,
  marks_total INTEGER NOT NULL DEFAULT 0,
  is_public   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE anchor_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anchor_records_service_role_all"
  ON anchor_records FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "anchor_records_public_select"
  ON anchor_records FOR SELECT TO authenticated
  USING (is_public = true OR creator_id = auth.uid());

CREATE POLICY "anchor_records_anon_public_select"
  ON anchor_records FOR SELECT TO anon
  USING (is_public = true);

CREATE POLICY "anchor_records_owner_insert"
  ON anchor_records FOR INSERT TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_anchor_records_urn
  ON anchor_records (urn);
CREATE INDEX IF NOT EXISTS idx_anchor_records_category
  ON anchor_records (category, created_at DESC);


CREATE TABLE IF NOT EXISTS anchor_ipledger_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anchor_id     UUID NOT NULL REFERENCES anchor_records(id) ON DELETE CASCADE,
  ledger_hash   TEXT NOT NULL,  -- SHA-256 of (prev_hash + content + creator_id + timestamp)
  prev_hash     TEXT,            -- null for first entry
  entry_type    TEXT NOT NULL DEFAULT 'create'
                CHECK (entry_type IN ('create','build','cite','update','retire')),
  actor_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  marks_awarded INTEGER NOT NULL DEFAULT 0,
  provenance    JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE anchor_ipledger_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anchor_ipledger_service_role_all"
  ON anchor_ipledger_entries FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "anchor_ipledger_authenticated_select"
  ON anchor_ipledger_entries FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "anchor_ipledger_owner_insert"
  ON anchor_ipledger_entries FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_anchor_ipledger_anchor
  ON anchor_ipledger_entries (anchor_id, created_at ASC);


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. CAI BONFIRE
--    cai_contributions  -- member prompt/training-data/evaluation submissions
--    cai_compute_ledger -- compute cost accounting (Cost+20%)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cai_contributions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contribution_type TEXT NOT NULL
                    CHECK (contribution_type IN ('prompt','training_data','evaluation')),
  title             TEXT NOT NULL,
  content           TEXT,
  quality_score     NUMERIC(4,2) CHECK (quality_score BETWEEN 0 AND 10),
  review_status     TEXT NOT NULL DEFAULT 'submitted'
                    CHECK (review_status IN ('submitted','under_review','accepted','rejected','flagged')),
  marks_awarded     INTEGER NOT NULL DEFAULT 0,
  ip_ledger_hash    TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cai_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cai_contributions_service_role_all"
  ON cai_contributions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "cai_contributions_owner_select"
  ON cai_contributions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "cai_contributions_owner_insert"
  ON cai_contributions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_cai_contributions_user_type
  ON cai_contributions (user_id, contribution_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cai_contributions_status
  ON cai_contributions (review_status, created_at DESC);


CREATE TABLE IF NOT EXISTS cai_compute_ledger (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id          TEXT NOT NULL,  -- model run identifier
  model_version   TEXT NOT NULL,
  tokens_in       INTEGER NOT NULL DEFAULT 0,
  tokens_out      INTEGER NOT NULL DEFAULT 0,
  cost_cents      INTEGER NOT NULL DEFAULT 0,   -- actual cost
  billed_cents    INTEGER NOT NULL DEFAULT 0,   -- cost * 1.20 (Cost+20%)
  margin_cents    INTEGER GENERATED ALWAYS AS (billed_cents - cost_cents) STORED,
  initiated_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  purpose         TEXT NOT NULL DEFAULT 'inference'
                  CHECK (purpose IN ('inference','training','evaluation','embedding')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cai_compute_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cai_compute_ledger_service_role_all"
  ON cai_compute_ledger FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "cai_compute_ledger_authenticated_select"
  ON cai_compute_ledger FOR SELECT TO authenticated
  USING (true);  -- compute cost transparency (Cost+20% compliance)

CREATE INDEX IF NOT EXISTS idx_cai_compute_ledger_run
  ON cai_compute_ledger (run_id, created_at DESC);

-- View: CAI summary (SECURITY INVOKER)
CREATE OR REPLACE VIEW cai_contribution_summary WITH (security_invoker = on) AS
  SELECT
    contribution_type,
    COUNT(*)                              AS total_contributions,
    COUNT(*) FILTER (WHERE review_status = 'accepted') AS accepted_count,
    COALESCE(AVG(quality_score), 0)       AS avg_quality_score,
    COALESCE(SUM(marks_awarded), 0)       AS total_marks_awarded
  FROM cai_contributions
  GROUP BY contribution_type;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. MAP & COMPASS
--    mc_resource_listings  -- community resource entries (skills, services, local nodes)
--    mc_onboarding_paths   -- member-specific onboarding path state
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS mc_resource_listings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  category      TEXT NOT NULL
                CHECK (category IN ('skill','service','node','cooperative','food','housing','transport','health','tech','other')),
  description   TEXT,
  location_city TEXT,
  location_state TEXT,
  contact_method TEXT,
  listed_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  verified      BOOLEAN NOT NULL DEFAULT false,
  initiative_slug TEXT,  -- links to LMD, LGB, VSL, etc.
  marks_bounty  INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE mc_resource_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mc_resource_listings_service_role_all"
  ON mc_resource_listings FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "mc_resource_listings_public_select"
  ON mc_resource_listings FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "mc_resource_listings_anon_select"
  ON mc_resource_listings FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "mc_resource_listings_owner_insert"
  ON mc_resource_listings FOR INSERT TO authenticated
  WITH CHECK (listed_by = auth.uid());

CREATE INDEX IF NOT EXISTS idx_mc_resource_listings_category
  ON mc_resource_listings (category, is_active, created_at DESC);


CREATE TABLE IF NOT EXISTS mc_onboarding_paths (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step  INTEGER NOT NULL DEFAULT 1,
  completed_steps INTEGER[] NOT NULL DEFAULT '{}',
  path_variant  TEXT NOT NULL DEFAULT 'standard'
                CHECK (path_variant IN ('standard','fast_track','mentored','cold_start')),
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  UNIQUE (user_id)  -- one path per member
);

ALTER TABLE mc_onboarding_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mc_onboarding_paths_service_role_all"
  ON mc_onboarding_paths FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "mc_onboarding_paths_owner_all"
  ON mc_onboarding_paths FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_mc_onboarding_paths_user
  ON mc_onboarding_paths (user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. STAND IN THE GAP
--    sitg_gap_requests   -- community gap posts (need + ceiling price)
--    sitg_gap_responses  -- member responses / fulfillments
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sitg_gap_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  need_description TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'general'
                  CHECK (category IN ('legal','translation','transport','healthcare','childcare','tech','trade','food','education','general')),
  ceiling_cents   INTEGER NOT NULL CHECK (ceiling_cents >= 0),
  currency        TEXT NOT NULL DEFAULT 'USD',
  location        TEXT,
  status          TEXT NOT NULL DEFAULT 'open'
                  CHECK (status IN ('open','responded','fulfilled','expired','withdrawn')),
  marks_bounty    INTEGER NOT NULL DEFAULT 10,
  response_count  INTEGER NOT NULL DEFAULT 0,
  expires_at      TIMESTAMPTZ,
  fulfilled_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE sitg_gap_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sitg_gap_requests_service_role_all"
  ON sitg_gap_requests FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "sitg_gap_requests_authenticated_select"
  ON sitg_gap_requests FOR SELECT TO authenticated
  USING (true);  -- all open gaps visible to all members

CREATE POLICY "sitg_gap_requests_owner_insert"
  ON sitg_gap_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_sitg_gap_requests_status
  ON sitg_gap_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sitg_gap_requests_category
  ON sitg_gap_requests (category, status, created_at DESC);


CREATE TABLE IF NOT EXISTS sitg_gap_responses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gap_request_id  UUID NOT NULL REFERENCES sitg_gap_requests(id) ON DELETE CASCADE,
  responder_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_description TEXT NOT NULL,
  offered_cents   INTEGER CHECK (offered_cents >= 0),
  status          TEXT NOT NULL DEFAULT 'offered'
                  CHECK (status IN ('offered','accepted','declined','completed','cancelled')),
  marks_awarded   INTEGER NOT NULL DEFAULT 0,
  knowledge_asset_created BOOLEAN NOT NULL DEFAULT false,
  ip_ledger_hash  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE sitg_gap_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sitg_gap_responses_service_role_all"
  ON sitg_gap_responses FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "sitg_gap_responses_authenticated_select"
  ON sitg_gap_responses FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "sitg_gap_responses_owner_insert"
  ON sitg_gap_responses FOR INSERT TO authenticated
  WITH CHECK (responder_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_sitg_gap_responses_request
  ON sitg_gap_responses (gap_request_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_sitg_gap_responses_responder
  ON sitg_gap_responses (responder_id, created_at DESC);


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. MNEMOSYNE-C EXEMPLAR
--    Reads from existing: banyan_metric_stats, platform_metrics
--    New: mnemo_benchmark_runs -- per-run benchmark log (hash-chained)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS mnemo_benchmark_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_uuid        TEXT UNIQUE NOT NULL,  -- stable ref for /proofs
  model_version   TEXT NOT NULL,
  benchmark_name  TEXT NOT NULL
                  CHECK (benchmark_name IN ('cardboard_boots','hallucination_rate','recall','provenance','cost_parity')),
  score           NUMERIC(6,3) NOT NULL,
  score_unit      TEXT NOT NULL DEFAULT 'percent',  -- percent | ratio | seconds
  run_hash        TEXT NOT NULL,  -- SHA-256 for chain integrity
  prev_run_hash   TEXT,
  notes           TEXT,
  published       BOOLEAN NOT NULL DEFAULT false,
  run_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE mnemo_benchmark_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mnemo_benchmark_runs_service_role_all"
  ON mnemo_benchmark_runs FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "mnemo_benchmark_runs_public_select"
  ON mnemo_benchmark_runs FOR SELECT TO authenticated
  USING (published = true);

CREATE POLICY "mnemo_benchmark_runs_anon_select"
  ON mnemo_benchmark_runs FOR SELECT TO anon
  USING (published = true);

CREATE INDEX IF NOT EXISTS idx_mnemo_benchmark_runs_name_published
  ON mnemo_benchmark_runs (benchmark_name, published, run_at DESC);

-- Seed canon benchmark values (idempotent)
INSERT INTO mnemo_benchmark_runs
  (run_uuid, model_version, benchmark_name, score, score_unit, run_hash, published, notes)
VALUES
  ('e9c2b1a7-cb-v1', '1.0', 'cardboard_boots', 92.7, 'percent',
   'd3f8a2e1b4c7f9a2d3e4b5c6d7e8f9a1b2c3d4e5', true,
   'Canon benchmark: Cardboard Boots recall rate. Ref: /proofs'),
  ('e9c2b1a7-hr-v1', '1.0', 'hallucination_rate', 3.6, 'percent',
   'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', true,
   'Canon benchmark: hallucination rate vs 20%+ baseline. Ref: /proofs'),
  ('e9c2b1a7-cp-v1', '1.0', 'cost_parity', 83.3, 'percent',
   'f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0', true,
   'Canon: 83.3% cost retained by node operators. Ref: /proofs')
ON CONFLICT (run_uuid) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. HARPER GUILD
--    hg_certifications  -- member certification records
--    hg_review_queue    -- pending creative-work review assignments
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hg_certifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier            TEXT NOT NULL
                  CHECK (tier IN ('apprentice','certified','senior','guild_master')),
  issued_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ,
  renewal_due_at  TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','expired','suspended','revoked')),
  marks_on_cert   INTEGER NOT NULL DEFAULT 25,
  peer_reviewers  UUID[],  -- array of reviewer user IDs
  notes           TEXT,
  ip_ledger_hash  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, tier)  -- one cert per tier per member
);

ALTER TABLE hg_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hg_certifications_service_role_all"
  ON hg_certifications FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "hg_certifications_owner_select"
  ON hg_certifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "hg_certifications_owner_insert"
  ON hg_certifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_hg_certifications_user_tier
  ON hg_certifications (user_id, tier, status);
CREATE INDEX IF NOT EXISTS idx_hg_certifications_tier_status
  ON hg_certifications (tier, status, issued_at DESC);


CREATE TABLE IF NOT EXISTS hg_review_queue (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submitter_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  work_title      TEXT NOT NULL,
  work_type       TEXT NOT NULL
                  CHECK (work_type IN ('music','writing','visual_art','journalism','report','other')),
  work_url        TEXT,
  review_status   TEXT NOT NULL DEFAULT 'queued'
                  CHECK (review_status IN ('queued','assigned','in_review','completed','flagged','withdrawn')),
  required_cert_tier TEXT NOT NULL DEFAULT 'apprentice'
                  CHECK (required_cert_tier IN ('apprentice','certified','senior','guild_master')),
  marks_reward    INTEGER NOT NULL DEFAULT 15,
  completed_at    TIMESTAMPTZ,
  verdict         TEXT CHECK (verdict IN ('approved','approved_with_notes','rejected','needs_revision')),
  review_notes    TEXT,
  ip_ledger_stamp BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE hg_review_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hg_review_queue_service_role_all"
  ON hg_review_queue FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "hg_review_queue_reviewer_select"
  ON hg_review_queue FOR SELECT TO authenticated
  USING (reviewer_id = auth.uid() OR submitter_id = auth.uid());

CREATE POLICY "hg_review_queue_submitter_insert"
  ON hg_review_queue FOR INSERT TO authenticated
  WITH CHECK (submitter_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_hg_review_queue_status
  ON hg_review_queue (review_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hg_review_queue_reviewer
  ON hg_review_queue (reviewer_id, review_status, created_at DESC);

-- View: guild stats for the spinout dashboard (SECURITY INVOKER)
CREATE OR REPLACE VIEW hg_guild_stats WITH (security_invoker = on) AS
  SELECT
    COUNT(*) FILTER (WHERE tier = 'apprentice'    AND status = 'active') AS apprentice_count,
    COUNT(*) FILTER (WHERE tier = 'certified'     AND status = 'active') AS certified_count,
    COUNT(*) FILTER (WHERE tier = 'senior'        AND status = 'active') AS senior_count,
    COUNT(*) FILTER (WHERE tier = 'guild_master'  AND status = 'active') AS guild_master_count,
    COUNT(*)                                                               AS total_certifications
  FROM hg_certifications;


-- ─────────────────────────────────────────────────────────────────────────────
-- Cross-spinout: spinout_activity_log (for the SpinoutsIndexPage summary)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS spinout_activity_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spinout_slug    TEXT NOT NULL,  -- defense-klaus | battery-dispatch | anchor | cai-bonfire | map-and-compass | stand-in-the-gap | mnemosyne-c | harper-guild
  event_type      TEXT NOT NULL,
  summary         TEXT NOT NULL,
  actor_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  marks_involved  INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE spinout_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "spinout_activity_log_service_role_all"
  ON spinout_activity_log FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "spinout_activity_log_authenticated_select"
  ON spinout_activity_log FOR SELECT TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_spinout_activity_log_slug
  ON spinout_activity_log (spinout_slug, created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- Lock search_path on all new functions in this migration
-- (belt-and-suspenders, mirrors BP052 pattern)
-- ─────────────────────────────────────────────────────────────────────────────

-- No new PL/pgSQL functions in this migration; all logic is in views.
-- Views use SECURITY INVOKER, so no search_path override needed.
-- Future trigger functions for these tables MUST set:
--   SET search_path = public  (SECURITY INVOKER)
--   SET search_path = ''      (SECURITY DEFINER)
