-- K502: LB Test Frame — test_frame_results telemetry table
-- Privacy contract: anonymous rows have member_id NULL; public rows include member_id.

CREATE TABLE IF NOT EXISTS "public"."test_frame_results" (
  "id"                    uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  "ai_vendor"             text NOT NULL,
  "cold_hot_pct"          numeric(5,2) NOT NULL CHECK (cold_hot_pct BETWEEN 0 AND 100),
  "cathedral_hot_pct"     numeric(5,2) NOT NULL CHECK (cathedral_hot_pct BETWEEN 0 AND 100),
  "lift_pp"               numeric(6,2) NOT NULL,
  "questions_completed"   integer NOT NULL DEFAULT 0 CHECK (questions_completed BETWEEN 0 AND 25),
  "share_preference"      text NOT NULL CHECK (share_preference IN ('anonymous', 'public')),
  "member_id"             uuid,
  "client_timestamp"      timestamptz,
  "created_at"            timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE "public"."test_frame_results" IS
  'Cathedral Effect verification results from member opt-in submissions. Private results are NOT stored here; only anonymous or public shares.';
COMMENT ON COLUMN "public"."test_frame_results"."member_id" IS
  'NULL for anonymous shares. Non-null only when share_preference = ''public''.';

CREATE INDEX IF NOT EXISTS "idx_tfr_vendor"
  ON "public"."test_frame_results" ("ai_vendor");
CREATE INDEX IF NOT EXISTS "idx_tfr_member"
  ON "public"."test_frame_results" ("member_id")
  WHERE "member_id" IS NOT NULL;

-- ── Aggregate view (for public dashboard) ────────────────────────────────────
CREATE OR REPLACE VIEW "public"."test_frame_results_aggregate" AS
SELECT
  COUNT(*)                              AS total_runs,
  COUNT(DISTINCT ai_vendor)             AS vendor_count,
  ROUND(AVG(lift_pp), 1)               AS mean_lift_pp,
  ROUND(MIN(lift_pp), 1)               AS min_lift_pp,
  ROUND(MAX(lift_pp), 1)               AS max_lift_pp,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY lift_pp), 1) AS median_lift_pp,
  ROUND(AVG(cold_hot_pct), 1)          AS mean_cold_hot_pct,
  ROUND(AVG(cathedral_hot_pct), 1)     AS mean_cathedral_hot_pct,
  ROUND(AVG(questions_completed), 1)   AS mean_questions_completed,
  MAX(created_at)                       AS last_submission_at,
  json_agg(
    json_build_object(
      'vendor', ai_vendor,
      'runs', vendor_runs,
      'mean_lift_pp', vendor_mean_lift,
      'mean_cold_pct', vendor_mean_cold,
      'mean_cathedral_pct', vendor_mean_cathedral
    ) ORDER BY vendor_runs DESC
  ) AS by_vendor
FROM (
  SELECT
    ai_vendor,
    COUNT(*)                          AS vendor_runs,
    ROUND(AVG(lift_pp), 1)           AS vendor_mean_lift,
    ROUND(AVG(cold_hot_pct), 1)      AS vendor_mean_cold,
    ROUND(AVG(cathedral_hot_pct), 1) AS vendor_mean_cathedral
  FROM "public"."test_frame_results"
  GROUP BY ai_vendor
) vendor_stats, "public"."test_frame_results";

COMMENT ON VIEW "public"."test_frame_results_aggregate" IS
  'Aggregate stats for the public community-empirical dashboard at librarian.the2ndsecond.com/community-empirical';

-- ── RLS: anyone can read aggregate; only edge function (service role) can write ─
ALTER TABLE "public"."test_frame_results" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_anonymous_results"
  ON "public"."test_frame_results"
  FOR SELECT
  USING (share_preference IN ('anonymous', 'public'));

CREATE POLICY "service_role_insert"
  ON "public"."test_frame_results"
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "member_delete_own"
  ON "public"."test_frame_results"
  FOR DELETE
  USING (member_id = auth.uid());
