CREATE TABLE IF NOT EXISTS v2_redesign_tracker_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_key TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_v2_redesign_tracker_audit_log_created_at
  ON v2_redesign_tracker_audit_log (created_at DESC);

ALTER TABLE v2_redesign_tracker_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read v2_redesign_tracker_audit_log" ON v2_redesign_tracker_audit_log;
CREATE POLICY "Public read v2_redesign_tracker_audit_log"
  ON v2_redesign_tracker_audit_log
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Auth write v2_redesign_tracker_audit_log" ON v2_redesign_tracker_audit_log;
CREATE POLICY "Auth write v2_redesign_tracker_audit_log"
  ON v2_redesign_tracker_audit_log
  FOR ALL
  USING (true)
  WITH CHECK (true);

INSERT INTO v2_redesign_tracker_audit_log (audit_key, summary, details)
VALUES (
  'b33_b34_excluded_non_page_research',
  'B33/B34 intentionally excluded from v2_redesign_tracker page seed set.',
  'Audit rationale: B33 and B34 are research batches, not v2 page design spec batches, so no redesign tracker rows were seeded for them. Exact files reviewed: BISHOP_DROPZONE/PAWN_BATCH_33_S_PISTON_REAL_WORLD_EXAMPLES.md (research, not page specs) and BISHOP_DROPZONE/PAWN_BATCH_34_OVERDUE_RESEARCH_CONSOLIDATED.md (research consolidation, not page specs). This preserves canonical scope: 36 page design specs across B30, B31, B32, B35, B36, B37.'
)
ON CONFLICT (audit_key) DO NOTHING;
