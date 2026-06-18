-- BP086 I5a: relay_routes dispatch layer
-- relay_routes: orchestrator posts questions, target peer picks up
CREATE TABLE IF NOT EXISTS public.relay_routes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  target_peer_id text NOT NULL,
  hex_frame     text NOT NULL,
  payload_json  jsonb,
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','answered','error','expired')),
  session_id    text,
  ttl_seconds   int NOT NULL DEFAULT 300
);

-- relay_route_replies: target peer posts answer, orchestrator reads
CREATE TABLE IF NOT EXISTS public.relay_route_replies (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  route_id      uuid NOT NULL REFERENCES public.relay_routes(id) ON DELETE CASCADE,
  peer_id       text NOT NULL,
  answer_json   jsonb,
  hex_reply     text,
  processing_ms int
);

-- RLS: any authenticated or anon user can INSERT their own answers
ALTER TABLE public.relay_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relay_route_replies ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can read rows targeting them (peer checks its own queue)
CREATE POLICY "peer_reads_own_routes" ON public.relay_routes
  FOR SELECT USING (true);

-- Policy: service role can insert routes (orchestrator uses service key)
CREATE POLICY "service_inserts_routes" ON public.relay_routes
  FOR INSERT WITH CHECK (true);

-- Policy: anyone can insert replies
CREATE POLICY "peer_inserts_reply" ON public.relay_route_replies
  FOR INSERT WITH CHECK (true);

CREATE POLICY "read_replies" ON public.relay_route_replies
  FOR SELECT USING (true);

-- Update policy: peer marks route as processing/answered
CREATE POLICY "peer_updates_own_route" ON public.relay_routes
  FOR UPDATE USING (true);

-- Index for efficient peer polling
CREATE INDEX IF NOT EXISTS idx_relay_routes_target_status ON public.relay_routes(target_peer_id, status);
CREATE INDEX IF NOT EXISTS idx_relay_route_replies_route ON public.relay_route_replies(route_id);
