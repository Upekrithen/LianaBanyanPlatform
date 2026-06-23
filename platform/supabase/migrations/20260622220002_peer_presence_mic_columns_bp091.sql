-- peer_presence MIC columns for M22 §A + §A.6 + §A.7 FireGuard
-- BP091 · M22 · 2026-06-22
-- Adds: role, wave_id, mic_load_hours to peer_presence

ALTER TABLE peer_presence
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'worker'
    CHECK (role IN ('worker','MIC','stale')),
  ADD COLUMN IF NOT EXISTS wave_id UUID NULL,
  ADD COLUMN IF NOT EXISTS mic_load_hours NUMERIC(10,4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS machine_label TEXT;

-- Index for fast MIC election queries
CREATE INDEX IF NOT EXISTS idx_peer_presence_role ON peer_presence (role) WHERE role = 'MIC';
CREATE INDEX IF NOT EXISTS idx_peer_presence_mic_load ON peer_presence (mic_load_hours ASC);
