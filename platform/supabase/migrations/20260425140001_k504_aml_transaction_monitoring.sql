-- K504: AML Transaction Monitoring Infrastructure
-- Closes Pawn red-team vector C.2 (Credit On-Ramp as Layering Vehicle)
--
-- GUARDRAILS ENCODED IN SCHEMA:
--   - No auto-suspend column on member tables (curator discretion only)
--   - aml_regulatory_classification defaults 'unclassified' (SAR pathway disabled until counsel confirms)
--   - aml_sar_audit_log is append-only (no UPDATE / DELETE RLS)
--   - All curator activity logged to aml_review_audit_log (immutable)

-- ── Prerequisite: member_credit_transactions must exist ──────────────────────
-- Assumes this table exists with at minimum:
--   id uuid PK, from_member_id uuid, to_member_id uuid,
--   credit_amount numeric, created_at timestamptz

-- ── SECTION 1: Rolling-window indexed views ───────────────────────────────────

-- A.1a: Rolling-30-day Credit-spend per member, broken out by counterparty
CREATE OR REPLACE VIEW "public"."vw_member_credit_velocity_30d" AS
SELECT
  from_member_id                                   AS member_id,
  to_member_id                                     AS counterparty_id,
  COUNT(*)                                          AS transaction_count,
  SUM(credit_amount)                               AS total_credits,
  MIN(created_at)                                  AS first_transaction_at,
  MAX(created_at)                                  AS last_transaction_at
FROM "public"."member_credit_transactions"
WHERE created_at >= (now() - INTERVAL '30 days')
GROUP BY from_member_id, to_member_id;

COMMENT ON VIEW "public"."vw_member_credit_velocity_30d" IS
  'Rolling 30-day Credit-spend per member broken out by counterparty. Used for concentration + velocity AML flag rules.';

-- A.1b: Per-member concentration — percentage to largest single counterparty (30d)
CREATE OR REPLACE VIEW "public"."vw_member_credit_concentration" AS
WITH member_totals AS (
  SELECT
    from_member_id        AS member_id,
    SUM(credit_amount)   AS total_spend_30d
  FROM "public"."member_credit_transactions"
  WHERE created_at >= (now() - INTERVAL '30 days')
  GROUP BY from_member_id
),
counterparty_max AS (
  SELECT
    v.member_id,
    v.counterparty_id,
    v.total_credits        AS counterparty_spend,
    m.total_spend_30d,
    ROUND(
      (v.total_credits / NULLIF(m.total_spend_30d, 0)) * 100,
      2
    )                      AS concentration_pct
  FROM "public"."vw_member_credit_velocity_30d" v
  JOIN member_totals m ON m.member_id = v.member_id
),
ranked AS (
  SELECT *, RANK() OVER (PARTITION BY member_id ORDER BY concentration_pct DESC) AS rnk
  FROM counterparty_max
)
SELECT
  member_id,
  counterparty_id         AS top_counterparty_id,
  concentration_pct,
  counterparty_spend,
  total_spend_30d,
  (SELECT transaction_count FROM "public"."vw_member_credit_velocity_30d" v2
   WHERE v2.member_id = ranked.member_id AND v2.counterparty_id = ranked.counterparty_id) AS transaction_count,
  (SELECT first_transaction_at FROM "public"."vw_member_credit_velocity_30d" v2
   WHERE v2.member_id = ranked.member_id AND v2.counterparty_id = ranked.counterparty_id) AS first_transaction_at,
  (SELECT last_transaction_at FROM "public"."vw_member_credit_velocity_30d" v2
   WHERE v2.member_id = ranked.member_id AND v2.counterparty_id = ranked.counterparty_id) AS last_transaction_at
FROM ranked
WHERE rnk = 1;

COMMENT ON VIEW "public"."vw_member_credit_concentration" IS
  'Per-member rolling-30-day concentration: percentage of Credit-spend going to single largest counterparty.';

-- ── SECTION 2: AML flag types and main flags table ────────────────────────────

CREATE TYPE IF NOT EXISTS "public"."aml_flag_type" AS ENUM (
  'aml_concentration_high',
  'aml_velocity_spike',
  'aml_new_account_high_velocity',
  'aml_coordinated_ring',
  'aml_trust_match_crossref'
);

CREATE TYPE IF NOT EXISTS "public"."aml_verdict" AS ENUM (
  'pending',
  'legitimate',
  'escalate',
  'dispatch_sar'
);

CREATE TABLE IF NOT EXISTS "public"."aml_flags" (
  "id"              uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  "member_id"       uuid NOT NULL,
  "flag_type"       "public"."aml_flag_type" NOT NULL,
  "triggered_at"    timestamptz NOT NULL DEFAULT now(),
  "evidence_json"   jsonb NOT NULL,
  "reviewed_at"     timestamptz,
  "reviewer_id"     uuid,
  "verdict"         "public"."aml_verdict" NOT NULL DEFAULT 'pending',
  "notes"           text,
  "created_at"      timestamptz NOT NULL DEFAULT now(),
  -- Soft-dedup: active flags of same type+member until resolved
  "resolved_at"     timestamptz,
  CONSTRAINT "fk_aml_flags_member" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE
);

COMMENT ON TABLE "public"."aml_flags" IS
  'AML monitoring flags. Internal-only. No auto-action; all verdicts require curator review. SAR-dispatch verdict additionally gated on aml_regulatory_classification.';
COMMENT ON COLUMN "public"."aml_flags"."verdict" IS
  'dispatch_sar is only enabled in the UI when aml_regulatory_classification != unclassified AND != not_msb. Schema does not enforce this — the TypeScript + UI layer enforces the gate.';

CREATE INDEX IF NOT EXISTS "idx_aml_flags_member"
  ON "public"."aml_flags" ("member_id");
CREATE INDEX IF NOT EXISTS "idx_aml_flags_verdict"
  ON "public"."aml_flags" ("verdict")
  WHERE verdict = 'pending';
CREATE INDEX IF NOT EXISTS "idx_aml_flags_type_member_active"
  ON "public"."aml_flags" ("flag_type", "member_id")
  WHERE resolved_at IS NULL;

-- ── SECTION 3: AML transaction cycles (Phase B) ──────────────────────────────

CREATE TABLE IF NOT EXISTS "public"."aml_transaction_cycles" (
  "id"                uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  "cycle_members"     uuid[] NOT NULL,
  "cycle_length"      integer NOT NULL CHECK (cycle_length BETWEEN 3 AND 5),
  "cumulative_volume" numeric(12,2) NOT NULL,
  "first_detected_at" timestamptz NOT NULL DEFAULT now(),
  "last_seen_at"      timestamptz NOT NULL DEFAULT now(),
  "canonical_key"     text NOT NULL UNIQUE,
  -- cross-reference with K501 Trust Match cycles
  "trust_match_cycle_crossref" boolean NOT NULL DEFAULT false,
  "aml_flag_id"       uuid REFERENCES "public"."aml_flags"("id")
);

COMMENT ON TABLE "public"."aml_transaction_cycles" IS
  'Credit-transaction graph cycles detected by coordinated_detector.ts. Cross-referenced with K501 trust_match_cycles_audit for elevated confidence.';

-- ── SECTION 4: AML review audit log (immutable) ──────────────────────────────

CREATE TABLE IF NOT EXISTS "public"."aml_review_audit_log" (
  "id"             uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  "flag_id"        uuid NOT NULL REFERENCES "public"."aml_flags"("id"),
  "curator_id"     uuid NOT NULL,
  "action"         text NOT NULL,   -- 'verdict_set', 'note_added', 'escalated', 'sar_draft_generated'
  "action_data"    jsonb,
  "created_at"     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE "public"."aml_review_audit_log" IS
  'Immutable append-only log of all curator AML review actions. No UPDATE/DELETE allowed per RLS.';

-- ── SECTION 5: SAR audit log (immutable, Phase D) ────────────────────────────

CREATE TABLE IF NOT EXISTS "public"."aml_sar_audit_log" (
  "id"                      uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  "flag_id"                 uuid NOT NULL REFERENCES "public"."aml_flags"("id"),
  "verdict_set_at"          timestamptz NOT NULL DEFAULT now(),
  "curator_id"              uuid NOT NULL,
  "counsel_review_status"   text NOT NULL DEFAULT 'pending',   -- 'pending'|'approved'|'declined'
  "filing_status"           text NOT NULL DEFAULT 'draft',     -- 'draft'|'filed'|'declined'
  "filing_confirmation"     text,
  "created_at"              timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE "public"."aml_sar_audit_log" IS
  'Immutable record of SAR-dispatch verdicts. Reviewable by counsel + Founder. Filing requires counsel manual dispatch — no auto-filing ever.';

-- ── SECTION 6: AML curator role eligibility ──────────────────────────────────

CREATE TABLE IF NOT EXISTS "public"."aml_curator_roles" (
  "member_id"              uuid PRIMARY KEY REFERENCES "public"."members"("id"),
  "opted_in_at"            timestamptz NOT NULL DEFAULT now(),
  "agreement_accepted_at"  timestamptz NOT NULL,
  "training_complete"      boolean NOT NULL DEFAULT false,
  "weekly_review_count"    integer NOT NULL DEFAULT 0,
  "weekly_reset_at"        timestamptz NOT NULL DEFAULT date_trunc('week', now()),
  "active"                 boolean NOT NULL DEFAULT true
);

COMMENT ON TABLE "public"."aml_curator_roles" IS
  'Members opted in to AML-review curator role. Requires >=2000 XP, agreement + training completion. Cap: 10 reviews/week.';

-- ── SECTION 7: platform_canonical AML classification row ─────────────────────

-- Insert the regulatory classification key (default: unclassified = SAR disabled)
INSERT INTO "public"."platform_canonical" ("key", "value", "notes")
VALUES (
  'aml_regulatory_classification',
  'unclassified',
  'Set by counsel after MSB/money-transmitter determination. Values: unclassified|not_msb|msb_state_only|msb_federal. SAR-dispatch verdict in curator UI only enables when value IN (msb_state_only, msb_federal).'
)
ON CONFLICT ("key") DO NOTHING;

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE "public"."aml_flags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."aml_review_audit_log" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."aml_sar_audit_log" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."aml_curator_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."aml_transaction_cycles" ENABLE ROW LEVEL SECURITY;

-- aml_flags: curators + service role read/write; members cannot see own flags (until notified post-verdict)
CREATE POLICY "aml_flags_curator_read"
  ON "public"."aml_flags" FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM "public"."aml_curator_roles" r WHERE r.member_id = auth.uid() AND r.active)
    OR auth.role() = 'service_role'
  );

CREATE POLICY "aml_flags_service_role_write"
  ON "public"."aml_flags" FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "aml_flags_curator_update"
  ON "public"."aml_flags" FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM "public"."aml_curator_roles" r WHERE r.member_id = auth.uid() AND r.active)
  );

-- aml_review_audit_log: append-only; curators can insert; nobody deletes/updates
CREATE POLICY "aml_review_log_insert"
  ON "public"."aml_review_audit_log" FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM "public"."aml_curator_roles" r WHERE r.member_id = auth.uid() AND r.active)
    OR auth.role() = 'service_role'
  );

CREATE POLICY "aml_review_log_curator_read"
  ON "public"."aml_review_audit_log" FOR SELECT
  USING (auth.role() = 'service_role'
    OR EXISTS (SELECT 1 FROM "public"."aml_curator_roles" r WHERE r.member_id = auth.uid() AND r.active)
  );

-- aml_sar_audit_log: service_role write; curators read; NO delete/update for anyone
CREATE POLICY "sar_log_insert"
  ON "public"."aml_sar_audit_log" FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "sar_log_curator_read"
  ON "public"."aml_sar_audit_log" FOR SELECT
  USING (auth.role() = 'service_role'
    OR EXISTS (SELECT 1 FROM "public"."aml_curator_roles" r WHERE r.member_id = auth.uid() AND r.active)
  );
