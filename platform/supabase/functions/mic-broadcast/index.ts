// BP086 I7b + BP087 MAMBA-β1: mic-broadcast Edge Function
// POST: issue a fleet-wide broadcast command (MIC/orchestrator only via service_role)
// GET ?broadcast_id=<uuid>: fetch ack status for a broadcast

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-service-role',
};

// MAMBA-beta1: pheromone_sync added -- mesh peers receive and apply pheromone weighting
// MAMBA-beta2: pearl_sync added -- mesh peers upsert pearl_share on receive
// BP087 Wave 3: eblit_emit added -- fans eblit payload to peers via fleet_broadcast record
const VALID_TYPES = ['auto_update', 'config_set', 'fleet_warmup', 'health_snapshot', 'benchmark_run', 'noop_test', 'pheromone_sync', 'eblet_sync', 'pearl_sync', 'eblit_emit'];
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

      // MAMBA-beta2: pearl_sync handler -- upsert received pearl into pearl_share for local caching
      if (broadcast_type === 'pearl_sync') {
        const ps = payload_json as {
          pearl_id?: string;
          soccerball_sid?: string;
          payload_b64?: string;
          authored_at?: string;
          origin_peer_id?: string;
        };
        if (ps.pearl_id && ps.soccerball_sid && ps.payload_b64 && ps.origin_peer_id) {
          const { error: pearlErr } = await supabase
            .from('pearl_share')
            .upsert(
              {
                pearl_id: ps.pearl_id,
                soccerball_sid: ps.soccerball_sid,
                payload_b64: ps.payload_b64,
                authored_at: ps.authored_at ?? new Date().toISOString(),
                last_synced_at: new Date().toISOString(),
                origin_peer_id: ps.origin_peer_id,
              },
              { onConflict: 'pearl_id' },
            );
          if (pearlErr) {
            console.error('[mic-broadcast] pearl_sync upsert error:', pearlErr);
          }
        } else {
          console.warn('[mic-broadcast] pearl_sync missing required fields -- skipping upsert');
        }
      }

      // BP087 Wave 3: eblit_emit handler - fans eblit payload to peers via broadcast record
      if (broadcast_type === 'eblit_emit') {
        console.log('[mic-broadcast] eblit_emit broadcast received, fanning to peers via fleet_broadcast record');
        // The fleet_broadcast insert already records the broadcast; peers will receive it on next poll
        // No special upsert needed - eblit_emit is purely record-and-fan
      }

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
