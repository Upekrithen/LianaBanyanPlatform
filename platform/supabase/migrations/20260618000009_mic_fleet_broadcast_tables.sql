-- BP086 I7a: MIC fleet_broadcast + fleet_broadcast_ack tables
-- fleet_broadcast: MIC or orchestrator issues broadcast commands to all peers
-- fleet_broadcast_ack: each peer acknowledges receipt + result

CREATE TABLE IF NOT EXISTS public.fleet_broadcast (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  broadcast_type  text NOT NULL CHECK (broadcast_type IN (
                    'auto_update', 'config_set', 'fleet_warmup',
                    'health_snapshot', 'benchmark_run', 'noop_test'
                  )),
  target_tier     text NOT NULL DEFAULT 'all' CHECK (target_tier IN ('all', 'base', 'member', 'premium')),
  target_peer_ids text[] DEFAULT NULL,
  payload_json    jsonb NOT NULL DEFAULT '{}',
  issued_by       text NOT NULL DEFAULT 'orchestrator',
  target_version  text,
  ttl_seconds     int NOT NULL DEFAULT 300,
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','cancelled'))
);

-- fleet_broadcast_ack: each peer acknowledges receipt
CREATE TABLE IF NOT EXISTS public.fleet_broadcast_ack (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  broadcast_id    uuid NOT NULL REFERENCES public.fleet_broadcast(id) ON DELETE CASCADE,
  peer_id         text NOT NULL,
  app_version     text,
  ack_type        text NOT NULL DEFAULT 'received' CHECK (ack_type IN ('received','processing','completed','error','failed','declined')),
  result_json     jsonb,
  UNIQUE(broadcast_id, peer_id)
);

-- RLS
ALTER TABLE public.fleet_broadcast ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_broadcast_ack ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_reads_broadcasts" ON public.fleet_broadcast FOR SELECT USING (true);
CREATE POLICY "service_inserts_broadcasts" ON public.fleet_broadcast FOR INSERT WITH CHECK (true);
CREATE POLICY "service_updates_broadcasts" ON public.fleet_broadcast FOR UPDATE USING (true);
CREATE POLICY "peer_inserts_ack" ON public.fleet_broadcast_ack FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone_reads_acks" ON public.fleet_broadcast_ack FOR SELECT USING (true);
CREATE POLICY "peer_updates_own_ack" ON public.fleet_broadcast_ack FOR UPDATE USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fleet_broadcast_status ON public.fleet_broadcast(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fleet_broadcast_type ON public.fleet_broadcast(broadcast_type);
CREATE INDEX IF NOT EXISTS idx_fleet_broadcast_ack_bid ON public.fleet_broadcast_ack(broadcast_id);
CREATE INDEX IF NOT EXISTS idx_fleet_broadcast_ack_peer ON public.fleet_broadcast_ack(peer_id);

-- Add both tables to supabase_realtime publication so peers receive push notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.fleet_broadcast;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fleet_broadcast_ack;
