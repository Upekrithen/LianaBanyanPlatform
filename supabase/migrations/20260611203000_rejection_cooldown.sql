-- SEG-V0153A-P1-REJECTION-COOLDOWN
-- Rejection cooldown anti-spam tables for federation invite system.

-- ── member_rejection_log ──────────────────────────────────────────────────────
-- One row per rejection event. sender_peer_id is the local machine ID from
-- getStablePeerId() (NOT a Supabase user_id). recipient_hash = sha256(sub|'anon').
CREATE TABLE IF NOT EXISTS member_rejection_log (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_peer_id  text        NOT NULL,
  recipient_hash  text        NOT NULL,
  rejected_at     timestamptz NOT NULL DEFAULT now(),
  source          text        NOT NULL CHECK (source IN ('email_link', 'in_app'))
);

CREATE INDEX IF NOT EXISTS idx_rejection_log_sender
  ON member_rejection_log (sender_peer_id);

ALTER TABLE member_rejection_log ENABLE ROW LEVEL SECURITY;

-- No public reads — anti-abuse data is service-role only.
CREATE POLICY "rejection_log_service_only"
  ON member_rejection_log
  USING (false)
  WITH CHECK (false);

-- ── member_rejection_summary ──────────────────────────────────────────────────
-- One row per sender (keyed by peer_id). Updated on each rejection event.
-- cooldown_until = now() + (total_rejections × 5 minutes) — no automatic decay.
-- Founder-selected decay strategy will be applied in a future migration.
CREATE TABLE IF NOT EXISTS member_rejection_summary (
  sender_peer_id   text        PRIMARY KEY,
  total_rejections integer     NOT NULL DEFAULT 0,
  last_rejection_at timestamptz,
  cooldown_until   timestamptz
);

ALTER TABLE member_rejection_summary ENABLE ROW LEVEL SECURITY;

-- No public reads — service-role only.
CREATE POLICY "rejection_summary_service_only"
  ON member_rejection_summary
  USING (false)
  WITH CHECK (false);
