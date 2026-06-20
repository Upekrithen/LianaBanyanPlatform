-- BP087 MAMBA-zeta fleet-readiness gate 3: fleet_warmup_log table
-- Logs every fleet_warmup MIC broadcast: which model, keep_alive, ack from each peer, completion timestamps.
-- Used by gates_check.mjs to verify gemma4:12b keep_alive=24h homogeneity before Trial 02 fire.
-- Authored: SEG-T BP087 close-out.
--
CREATE TABLE IF NOT EXISTS public.fleet_warmup_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id uuid NOT NULL,
  model_id text NOT NULL,
  keep_alive_seconds int NOT NULL,
  peer_id text NOT NULL,
  acked_at timestamptz,
  warmup_completed_at timestamptz,
  vram_mb int,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fleet_warmup_log_broadcast ON public.fleet_warmup_log(broadcast_id);
CREATE INDEX IF NOT EXISTS idx_fleet_warmup_log_peer ON public.fleet_warmup_log(peer_id, acked_at DESC);
ALTER TABLE public.fleet_warmup_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_fleet_warmup_log_anon_select ON public.fleet_warmup_log;
CREATE POLICY p_fleet_warmup_log_anon_select ON public.fleet_warmup_log FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS p_fleet_warmup_log_anon_insert ON public.fleet_warmup_log;
CREATE POLICY p_fleet_warmup_log_anon_insert ON public.fleet_warmup_log FOR INSERT TO anon WITH CHECK (true);
