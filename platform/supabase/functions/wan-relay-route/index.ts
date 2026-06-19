// BP086 I5b + BP087 MAMBA-δ4: wan-relay-route Edge Function
// Accepts POST from orchestrator with { target_peer_id, hex_frame, payload_json, session_id, ttl_seconds? }
// INSERTs a row into relay_routes. Returns route id so orchestrator can poll for reply.
// Architecture: cross-WAN peers cannot expose port 11434. Both sides use Supabase tables as message bus.
//
// δ4 (MAMBA-δ): accepts BOTH application/json (legacy) AND application/x-hex-mcode (v1).
// When Content-Type is application/x-hex-mcode, body is treated as a raw hex frame string;
// target_peer_id and session_id are extracted from a companion X-Peer-Id / X-Session-Id header.
// Auto-detect: if body starts with hex chars and length > 28 with no { prefix, treat as hex-mcode.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-service-role, x-peer-id, x-session-id',
};

/** Detect application/x-hex-mcode: hex string, even length, >= 28 chars, no JSON { prefix */
function isHexMcodeBody(raw: string): boolean {
  const trimmed = raw.trim();
  return (
    trimmed.length >= 28 &&
    trimmed.length % 2 === 0 &&
    !trimmed.startsWith('{') &&
    /^[0-9a-f]+$/i.test(trimmed.slice(0, 28))
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const contentType = req.headers.get('content-type') ?? '';
    const isHexMcode = contentType.includes('application/x-hex-mcode');

    let target_peer_id: string;
    let hex_frame: string;
    let payload_json: string | null = null;
    let session_id: string | null = null;
    let ttl_seconds = 300;

    if (isHexMcode) {
      // δ4: raw hex frame body — peer_id + session in headers
      const rawBody = await req.text();
      hex_frame = rawBody.trim();
      target_peer_id = req.headers.get('x-peer-id') ?? '';
      session_id = req.headers.get('x-session-id') ?? null;
    } else {
      // Legacy JSON body — also handles auto-detect for hex payload embedded in JSON
      const body = await req.json();
      target_peer_id = body.target_peer_id;
      hex_frame = body.hex_frame;
      payload_json = body.payload_json ?? null;
      session_id = body.session_id ?? null;
      ttl_seconds = body.ttl_seconds ?? 300;

      // Auto-detect: if hex_frame absent but body itself looks like hex-mcode
      if (!hex_frame && isHexMcodeBody(JSON.stringify(body))) {
        hex_frame = JSON.stringify(body);
      }
    }

    if (!target_peer_id || !hex_frame) {
      return new Response(
        JSON.stringify({ error: 'target_peer_id and hex_frame are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // δ4: annotate wire_format in the route row for receipt logging
    const wire_format = isHexMcode ? 'hex-mcode-v1' : 'json-legacy';

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
        wire_format,
      })
      .select('id, created_at')
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ ok: true, route_id: data.id, created_at: data.created_at, wire_format }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
