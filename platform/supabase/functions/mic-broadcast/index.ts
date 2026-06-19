// BP086 I7b + BP087 MAMBA-β1: mic-broadcast Edge Function
// POST: issue a fleet-wide broadcast command (MIC/orchestrator only via service_role)
// GET ?broadcast_id=<uuid>: fetch ack status for a broadcast

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-service-role',
};

// MAMBA-β1: pheromone_sync added — mesh peers receive and apply pheromone weighting
const VALID_TYPES = ['auto_update', 'config_set', 'fleet_warmup', 'health_snapshot', 'benchmark_run', 'noop_test', 'pheromone_sync', 'eblet_sync'];
const VALID_TIERS = ['all', 'base', 'member', 'premium'];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const broadcastId = url.searchParams.get('broadcast_id');
      if (!broadcastId) {
        return new Response(JSON.stringify({ error: 'broadcast_id required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: acks, error: ackErr } = await supabase
        .from('fleet_broadcast_ack')
        .select('peer_id, ack_type, created_at, result_json')
        .eq('broadcast_id', broadcastId);

      if (ackErr) throw ackErr;

      const { data: broadcast } = await supabase
        .from('fleet_broadcast')
        .select('broadcast_type, status, issued_by, created_at')
        .eq('id', broadcastId)
        .single();

      return new Response(
        JSON.stringify({ ok: true, broadcast_id: broadcastId, broadcast, acks: acks ?? [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const {
        broadcast_type,
        payload_json = {},
        issued_by = 'orchestrator',
        target_version = null,
        target_tier = 'all',
        target_peer_ids = null,
        ttl_seconds = 300,
      } = body;

      if (!VALID_TYPES.includes(broadcast_type)) {
        return new Response(
          JSON.stringify({ error: `invalid broadcast_type: ${broadcast_type}. Valid: ${VALID_TYPES.join(', ')}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      if (!VALID_TIERS.includes(target_tier)) {
        return new Response(
          JSON.stringify({ error: `invalid target_tier: ${target_tier}. Valid: ${VALID_TIERS.join(', ')}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      const { data, error } = await supabase
        .from('fleet_broadcast')
        .insert({
          broadcast_type,
          payload_json,
          issued_by,
          target_version,
          target_tier,
          target_peer_ids,
          ttl_seconds,
          status: 'active',
        })
        .select('id, created_at')
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ ok: true, broadcast_id: data.id, created_at: data.created_at, status: 'active' }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(JSON.stringify({ error: 'method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[mic-broadcast] error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
