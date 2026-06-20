-- BP087 MAMBA-zeta fleet-readiness gate 4: noop_test_results table
-- Logs every noop_test MIC broadcast ack from each peer. gates_check.mjs polls this for poll-until=4 or 5 confirmation.
-- Authored: SEG-T BP087 close-out.
--
CREATE TABLE IF NOT EXISTS public.noop_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id uuid NOT NULL,
  peer_id text NOT NULL,
  acked_at timestamptz NOT NULL DEFAULT now(),
  latency_ms int,
  version text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_noop_test_results_broadcast ON public.noop_test_results(broadcast_id);
CREATE INDEX IF NOT EXISTS idx_noop_test_results_peer ON public.noop_test_results(peer_id, acked_at DESC);
ALTER TABLE public.noop_test_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_noop_test_results_anon_select ON public.noop_test_results;
CREATE POLICY p_noop_test_results_anon_select ON public.noop_test_results FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS p_noop_test_results_anon_insert ON public.noop_test_results;
CREATE POLICY p_noop_test_results_anon_insert ON public.noop_test_results FOR INSERT TO anon WITH CHECK (true);
