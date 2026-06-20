// BP087 MAMBA-Row3: substrace-wake Edge Function
// Accepts a re-weave wake request from any peer, inserts a substrace_wake_routes record,
// and forwards a substrace_wake message to the target peer via the relay_routes table.
// Target peer picks up the relay message, fetches manifest items, and emits
// substrace_wake_complete back through the mesh.
//
// Architecture decision (SEG-A): standalone function chosen over a new route in
// wan-relay-route because wan-relay-route is tightly coupled to hex_frame + relay_routes
// insertion (MAMBA-delta4 wire format detection, peer_presence check, wire_format column).
// substrace-wake has a distinct contract: manifest JSONB, wake_id primary key, and a
// separate substrace_wake_routes audit table. Co-locating would require special-casing the
// route path inside a function that has no URL-based routing logic. Option B is cleaner.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-service-role, x-peer-id, x-session-id',
};

export type ManifestItemType = 'pearl_id' | 'eblet_slug' | 'substrate_address';

export interface ManifestItem {
  type: ManifestItemType;
  ref: string;
}

interface WakeRequestBody {
  target_peer_id: string;
  origin_peer_id: string;
  manifest: ManifestItem[];
}

function generateWakeId(): string {
  return crypto.randomUUID();
}

function encodeHexFrame(payload: unknown): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  try {
    const body = (await req.json()) as WakeRequestBody;

    const { target_peer_id, origin_peer_id, manifest } = body;

    if (!target_peer_id || !origin_peer_id || !Array.isArray(manifest)) {
      return new Response(
        JSON.stringify({ error: 'target_peer_id, origin_peer_id, and manifest are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (manifest.length === 0) {
      return new Response(
        JSON.stringify({ error: 'manifest must contain at least one item' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const wake_id = generateWakeId();

    // Insert substrace_wake_routes tracking row
    const { error: insertError } = await supabase
      .from('substrace_wake_routes')
      .insert({
        wake_id,
        origin_peer_id,
        target_peer_id,
        manifest,
        ack_status: 'pending',
      });

    if (insertError) {
      return new Response(
        JSON.stringify({ error: `substrace_wake_routes insert failed: ${insertError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Build substrace_wake relay payload and hex-encode for relay_routes
    const wakePayload = {
      type: 'substrace_wake',
      peerId: origin_peer_id,
      payload: {
        wake_id,
        origin_peer_id,
        manifest,
      },
      ts: new Date().toISOString(),
    };

    const hexFrame = encodeHexFrame(wakePayload);

    // Forward to target peer via relay_routes table (same mechanism as wan-relay-route)
    const { error: relayError } = await supabase
      .from('relay_routes')
      .insert({
        target_peer_id,
        hex_frame: hexFrame,
        payload_json: JSON.stringify(wakePayload),
        session_id: wake_id,
        ttl_seconds: 300,
        status: 'pending',
        wire_format: 'hex-mcode-v1',
      });

    if (relayError) {
      // Route insertion failed: still return wake_id; row is tracked in substrace_wake_routes
      console.error(`[substrace-wake] relay_routes insert failed: ${relayError.message}`);
      return new Response(
        JSON.stringify({ wake_id, relay_forwarded: false, relay_error: relayError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ wake_id, relay_forwarded: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
