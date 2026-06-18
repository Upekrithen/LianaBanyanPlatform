// BP086 I5b: wan-relay-route Edge Function
// Accepts POST from orchestrator with { target_peer_id, hex_frame, payload_json, session_id, ttl_seconds? }
// INSERTs a row into relay_routes. Returns route id so orchestrator can poll for reply.
// Architecture: cross-WAN peers cannot expose port 11434. Both sides use Supabase tables as message bus.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-service-role',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const body = await req.json();
    const { target_peer_id, hex_frame, payload_json, session_id, ttl_seconds = 300 } = body;

    if (!target_peer_id || !hex_frame) {
      return new Response(
        JSON.stringify({ error: 'target_peer_id and hex_frame are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Optional: verify target peer is online (last_seen_at < 5 min ago)
    const { data: presence } = await supabase
      .from('peer_presence')
      .select('peer_id, last_seen_at')
      .eq('peer_id', target_peer_id)
      .single();

    if (presence) {
      const lastSeen = new Date(presence.last_seen_at).getTime();
      const fiveMinAgo = Date.now() - 5 * 60 * 1000;
      if (lastSeen < fiveMinAgo) {
        return new Response(
          JSON.stringify({ status: 'peer_offline', peer_id: target_peer_id }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const { data, error } = await supabase
      .from('relay_routes')
      .insert({
        target_peer_id,
        hex_frame,
        payload_json: payload_json ?? null,
        session_id: session_id ?? null,
        ttl_seconds,
        status: 'pending',
      })
      .select('id, created_at')
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ ok: true, route_id: data.id, created_at: data.created_at }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
