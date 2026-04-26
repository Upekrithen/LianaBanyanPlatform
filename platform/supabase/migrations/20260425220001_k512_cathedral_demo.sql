-- K512: LB Frame Public Web Demo — telemetry schema additions
-- Adds source column to test_frame_results + demo rate-limit + spend-cap tracking tables.

-- ── Extend test_frame_results for web demo source tracking ──────────────────
ALTER TABLE "public"."test_frame_results"
  ADD COLUMN IF NOT EXISTS "source"       text    NOT NULL DEFAULT 'extension'
    CHECK (source IN ('extension', 'public_web_demo')),
  ADD COLUMN IF NOT EXISTS "question_id"  text,
  ADD COLUMN IF NOT EXISTS "question_text" text,
  ADD COLUMN IF NOT EXISTS "session_uuid" uuid;

COMMENT ON COLUMN "public"."test_frame_results"."source" IS
  'Origin: extension (LB Test Frame browser extension) or public_web_demo (frame.lianabanyan.com).';
COMMENT ON COLUMN "public"."test_frame_results"."question_id" IS
  'Canonical question ID from fallback_bank.json (q01..q25) when a preset question was used; NULL for custom.';
COMMENT ON COLUMN "public"."test_frame_results"."question_text" IS
  'Verbatim question text (first 500 chars). NULL for extension-submitted aggregates.';
COMMENT ON COLUMN "public"."test_frame_results"."session_uuid" IS
  'Anonymous per-session identifier for the web demo. UUID v4, discarded after rate-limit window.';

-- Index on source for dashboard filtering
CREATE INDEX IF NOT EXISTS "idx_tfr_source"
  ON "public"."test_frame_results" ("source");

-- ── Rate-limit tracking table ────────────────────────────────────────────────
-- One row per (ip_hash, query_date). Call count is incremented on each cathedral call.
-- ip_hash = SHA-256(IP + daily-rotating-salt), stored as hex. Raw IP never stored.
CREATE TABLE IF NOT EXISTS "public"."demo_rate_limits" (
  "id"          uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  "ip_hash"     text    NOT NULL,
  "query_date"  date    NOT NULL DEFAULT CURRENT_DATE,
  "call_count"  integer NOT NULL DEFAULT 0,
  "updated_at"  timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("ip_hash", "query_date")
);

COMMENT ON TABLE "public"."demo_rate_limits" IS
  'Rate-limit counter for the cathedral-demo edge function. 5 cathedral calls per IP per 24 hours. IP stored as SHA-256 hash only — raw IP is never persisted.';

CREATE INDEX IF NOT EXISTS "idx_drl_date"
  ON "public"."demo_rate_limits" ("query_date");

-- RLS: edge function (service role) manages all operations; no public read
ALTER TABLE "public"."demo_rate_limits" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_rate_limits"
  ON "public"."demo_rate_limits"
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- ── Daily spend-cap tracking ─────────────────────────────────────────────────
-- One row per date. Edge function checks + increments atomically.
CREATE TABLE IF NOT EXISTS "public"."demo_spend_tracking" (
  "id"                    uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  "spend_date"            date    NOT NULL DEFAULT CURRENT_DATE UNIQUE,
  "total_cathedral_calls" integer NOT NULL DEFAULT 0,
  "estimated_usd_spend"   numeric(10,6) NOT NULL DEFAULT 0
);

COMMENT ON TABLE "public"."demo_spend_tracking" IS
  'Daily spend accumulator for the cathedral-demo edge function. Kill switch fires at $50/day (configurable via DEMO_DAILY_SPEND_CAP env var). Estimated at $0.0003/call (Haiku 4.5 with ~1,500 combined tokens).';

ALTER TABLE "public"."demo_spend_tracking" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_spend"
  ON "public"."demo_spend_tracking"
  FOR ALL
  USING (false)
  WITH CHECK (false);
