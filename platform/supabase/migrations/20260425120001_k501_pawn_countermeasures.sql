-- K501: Slow Blade V2 Hardening — Apply Pawn Red-Team Countermeasures
-- Closes: B.3 Spark Answer Sharing, D.1 Oscillation, A.1 Quorum Exhaustion,
--         A.2 Mark Inflation, B.2 Trilateral Ring
-- Dispatched B124. Session K501.

-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE A: Puzzle/Codebreaker Rolling 30-Day Rotation
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "public"."puzzle_content_rotation" (
  "id"                          uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  "puzzle_class"                text NOT NULL,
  "content_payload"             jsonb NOT NULL,
  "active_from"                 timestamptz NOT NULL,
  "active_until"                timestamptz NOT NULL,
  "expected_completion_time_seconds" integer NOT NULL DEFAULT 300,
  "created_at"                  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "pcr_active_range_check" CHECK ("active_from" < "active_until")
);

COMMENT ON TABLE "public"."puzzle_content_rotation" IS
  'Rolling puzzle/codebreaker content variants. Exactly one active row per puzzle_class at a time.';
COMMENT ON COLUMN "public"."puzzle_content_rotation"."puzzle_class" IS
  'e.g. "golden_keys_treasure_map", "codebreakers", "six_sparks_path"';
COMMENT ON COLUMN "public"."puzzle_content_rotation"."content_payload" IS
  'Full puzzle content blob (questions, hints, answer-key hash). Never store raw answers here.';

CREATE INDEX IF NOT EXISTS "idx_pcr_class_active"
  ON "public"."puzzle_content_rotation" ("puzzle_class", "active_from", "active_until");

-- ─── Completion-time monitoring column on existing puzzle completions ───────
-- Safe: ADD COLUMN is backward-compatible. Column is nullable until back-filled.
ALTER TABLE "public"."member_puzzle_completions"
  ADD COLUMN IF NOT EXISTS "puzzle_started_at"   timestamptz,
  ADD COLUMN IF NOT EXISTS "puzzle_completed_at" timestamptz,
  ADD COLUMN IF NOT EXISTS "completion_time_seconds" integer GENERATED ALWAYS AS (
    CASE
      WHEN "puzzle_started_at" IS NOT NULL AND "puzzle_completed_at" IS NOT NULL
      THEN EXTRACT(EPOCH FROM ("puzzle_completed_at" - "puzzle_started_at"))::integer
      ELSE NULL
    END
  ) STORED,
  ADD COLUMN IF NOT EXISTS "flagged_for_spark_review" boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN "public"."member_puzzle_completions"."completion_time_seconds" IS
  'Computed: puzzle_completed_at - puzzle_started_at in seconds. NULL if either timestamp missing.';
COMMENT ON COLUMN "public"."member_puzzle_completions"."flagged_for_spark_review" IS
  'True when completion_time_seconds < 5th-percentile for class AND member account age < 30 days.';

-- ─── Spark velocity anomaly view (for /api/admin/spark_velocity_anomalies) ──
CREATE OR REPLACE VIEW "public"."spark_velocity_anomalies" AS
SELECT
  mpc.id                AS completion_id,
  mpc.member_id,
  mpc.puzzle_id,
  mpc.completion_time_seconds,
  mpc.flagged_for_spark_review,
  mpc.puzzle_completed_at,
  mpc.created_at
FROM "public"."member_puzzle_completions" mpc
WHERE mpc.flagged_for_spark_review = true
ORDER BY mpc.puzzle_completed_at DESC;

COMMENT ON VIEW "public"."spark_velocity_anomalies" IS
  'Curator-facing feed of flagged rapid puzzle completions. Human review required before any action.';

-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE B: Trust Match Seasoning Penalty + Multi-Default Tracking
-- ═══════════════════════════════════════════════════════════════════════════

-- Create trust_match schema if not present (may already exist from prior work)
CREATE SCHEMA IF NOT EXISTS "trust_match";

CREATE TABLE IF NOT EXISTS "trust_match"."member_trust_state" (
  "id"                          uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  "member_id"                   uuid NOT NULL UNIQUE,
  "seasoning_penalty_until"     timestamptz,
  "trust_match_defaults_90d_count" integer NOT NULL DEFAULT 0,
  "last_default_at"             timestamptz,
  "good_standing_review_triggered" boolean NOT NULL DEFAULT false,
  "created_at"                  timestamptz NOT NULL DEFAULT now(),
  "updated_at"                  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE "trust_match"."member_trust_state" IS
  'One row per member. Tracks Seasoning penalty windows and rolling default counts.';
COMMENT ON COLUMN "trust_match"."member_trust_state"."seasoning_penalty_until" IS
  'When set, member''s effective Seasoning age = current_age_days - 30 until this timestamp.';
COMMENT ON COLUMN "trust_match"."member_trust_state"."trust_match_defaults_90d_count" IS
  'Rolling count of defaults within any 90-day window. Recomputed by the seasoning_penalty job.';

CREATE INDEX IF NOT EXISTS "idx_mts_member_id"
  ON "trust_match"."member_trust_state" ("member_id");
CREATE INDEX IF NOT EXISTS "idx_mts_penalty_until"
  ON "trust_match"."member_trust_state" ("seasoning_penalty_until")
  WHERE "seasoning_penalty_until" IS NOT NULL;

-- ─── Trust Match defaults audit log ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "trust_match"."member_defaults_log" (
  "id"                          uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  "member_id"                   uuid NOT NULL,
  "trust_match_bond_id"         uuid NOT NULL,
  "defaulted_at"                timestamptz NOT NULL DEFAULT now(),
  "penalty_applied_until"       timestamptz,
  "gsr_triggered"               boolean NOT NULL DEFAULT false,
  "created_at"                  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE "trust_match"."member_defaults_log" IS
  'Immutable audit log of Trust Match defaults. One row per default event.';

CREATE INDEX IF NOT EXISTS "idx_mdl_member_id_defaulted_at"
  ON "trust_match"."member_defaults_log" ("member_id", "defaulted_at");

-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE C: Governance Quorum Floor
-- ═══════════════════════════════════════════════════════════════════════════

CREATE SCHEMA IF NOT EXISTS "governance";

CREATE TABLE IF NOT EXISTS "governance"."quorum_baseline" (
  "id"                          uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  "computed_at"                 timestamptz NOT NULL DEFAULT now(),
  "trailing_90d_mean_rep_votes" numeric(18,4) NOT NULL DEFAULT 0,
  "floor_threshold"             numeric(18,4) NOT NULL DEFAULT 0,
  "baseline_provisional"        boolean NOT NULL DEFAULT false,
  "days_of_data_used"           integer NOT NULL DEFAULT 0,
  "proposal_count_used"         integer NOT NULL DEFAULT 0
);

COMMENT ON TABLE "governance"."quorum_baseline" IS
  'Latest rolling 90-day Rep-weighted participation baseline. floor_threshold = mean × 0.70.';
COMMENT ON COLUMN "governance"."quorum_baseline"."baseline_provisional" IS
  'True when < 90 days of data available. Floor still enforced but flagged.';

CREATE TABLE IF NOT EXISTS "governance"."proposal_quorum_checks" (
  "id"                          uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  "proposal_id"                 uuid NOT NULL,
  "baseline_id"                 uuid NOT NULL REFERENCES "governance"."quorum_baseline"("id"),
  "rep_weighted_votes_cast"     numeric(18,4) NOT NULL DEFAULT 0,
  "floor_at_time"               numeric(18,4) NOT NULL DEFAULT 0,
  "is_low_visibility_window"    boolean NOT NULL DEFAULT false,
  "passed_quorum_floor"         boolean NOT NULL DEFAULT false,
  "checked_at"                  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE "governance"."proposal_quorum_checks" IS
  'Per-proposal quorum floor check results. Recorded when a proposal closes.';

CREATE INDEX IF NOT EXISTS "idx_pqc_proposal_id"
  ON "governance"."proposal_quorum_checks" ("proposal_id");

-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE D: Mark Quality Audits
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TYPE "public"."mark_audit_verdict" AS ENUM (
  'pending',
  'legitimate',
  'inflated',
  'disputed'
);

CREATE TABLE IF NOT EXISTS "public"."mark_quality_audits" (
  "id"                          uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  "transaction_id"              uuid NOT NULL,
  "auditor_member_id"           uuid,
  "verdict"                     "public"."mark_audit_verdict" NOT NULL DEFAULT 'pending',
  "notes"                       text,
  "audit_seasoning_penalty_applied" boolean NOT NULL DEFAULT false,
  "assigned_at"                 timestamptz NOT NULL DEFAULT now(),
  "completed_at"                timestamptz,
  "created_at"                  timestamptz NOT NULL DEFAULT now(),
  "updated_at"                  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE "public"."mark_quality_audits" IS
  'Audit records for randomly-sampled Mark transactions. All verdicts require human curator review — no auto-action.';
COMMENT ON COLUMN "public"."mark_quality_audits"."verdict" IS
  'pending: awaiting auditor. legitimate: no action. inflated: Marks reversed + 30d penalty. disputed: escalate to GSR.';
COMMENT ON COLUMN "public"."mark_quality_audits"."audit_seasoning_penalty_applied" IS
  'True only after an auditor submits "inflated" verdict AND curator confirms. Never auto-set.';

CREATE INDEX IF NOT EXISTS "idx_mqa_transaction_id"
  ON "public"."mark_quality_audits" ("transaction_id");
CREATE INDEX IF NOT EXISTS "idx_mqa_auditor_verdict"
  ON "public"."mark_quality_audits" ("auditor_member_id", "verdict");
CREATE INDEX IF NOT EXISTS "idx_mqa_pending"
  ON "public"."mark_quality_audits" ("verdict", "assigned_at")
  WHERE "verdict" = 'pending';

-- ─── Auditor panel opt-in ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "public"."mark_audit_panel_members" (
  "id"                          uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  "member_id"                   uuid NOT NULL UNIQUE,
  "opted_in_at"                 timestamptz NOT NULL DEFAULT now(),
  "opted_out_at"                timestamptz,
  "audits_completed_count"      integer NOT NULL DEFAULT 0,
  "audit_xp_earned"             integer NOT NULL DEFAULT 0,
  "audits_this_week"            integer NOT NULL DEFAULT 0,
  "week_reset_at"               timestamptz NOT NULL DEFAULT date_trunc('week', now()),
  "is_active"                   boolean NOT NULL DEFAULT true
);

COMMENT ON TABLE "public"."mark_audit_panel_members" IS
  'High-Rep members who have opted into the audit panel. Cap: 5 audits/auditor/week.';

CREATE INDEX IF NOT EXISTS "idx_mapm_active"
  ON "public"."mark_audit_panel_members" ("is_active", "audits_this_week")
  WHERE "is_active" = true;

-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE E: Trust Match Cycle Detection
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TYPE "trust_match"."cycle_curator_verdict" AS ENUM (
  'pending',
  'legitimate_collaboration',
  'under_investigation',
  'coordinated_ring'
);

CREATE TABLE IF NOT EXISTS "trust_match"."trust_match_cycles_audit" (
  "id"                          uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  "cycle_member_ids"            uuid[] NOT NULL,
  "cycle_trust_match_ids"       uuid[] NOT NULL,
  "cycle_length"                integer NOT NULL,
  "total_stake_marks"           numeric(18,4) NOT NULL DEFAULT 0,
  "first_detected_at"           timestamptz NOT NULL DEFAULT now(),
  "last_seen_at"                timestamptz NOT NULL DEFAULT now(),
  "curator_verdict"             "trust_match"."cycle_curator_verdict" NOT NULL DEFAULT 'pending',
  "curator_member_id"           uuid,
  "curator_reviewed_at"         timestamptz,
  "curator_notes"               text,
  "consequences_applied"        boolean NOT NULL DEFAULT false,
  "created_at"                  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "cycle_length_cap" CHECK ("cycle_length" BETWEEN 3 AND 5)
);

COMMENT ON TABLE "trust_match"."trust_match_cycles_audit" IS
  'Detected closed cycles (length 3-5) in Trust Match bond graph. All actions require curator review.';
COMMENT ON COLUMN "trust_match"."trust_match_cycles_audit"."cycle_member_ids" IS
  'Ordered array of member UUIDs forming the cycle: [A, B, C, ...A].';
COMMENT ON COLUMN "trust_match"."trust_match_cycles_audit"."cycle_length" IS
  'Must be 3, 4, or 5. Cycles ≥ 6 are not flagged (architectural constraint).';
COMMENT ON COLUMN "trust_match"."trust_match_cycles_audit"."consequences_applied" IS
  'True only after curator verdict "coordinated_ring" and Founder-confirms. Never auto-set.';

CREATE INDEX IF NOT EXISTS "idx_tmca_verdict"
  ON "trust_match"."trust_match_cycles_audit" ("curator_verdict", "first_detected_at");
CREATE INDEX IF NOT EXISTS "idx_tmca_pending"
  ON "trust_match"."trust_match_cycles_audit" ("curator_verdict")
  WHERE "curator_verdict" = 'pending';
