import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Codex HMAC registry — known bound Codex IDs with their stored HMACs
// In production these come from the Supabase codex_bindings table
const KNOWN_CODEX_HMACS: Record<string, { hmac: string; edition: string; title: string; chapters: number }> = {
  "LB-CODEX-0025": {
    hmac: "9cb23584e95922c7",
    edition: "BP021-0.9",
    title: "Bushel 7 — 3-Layer Taxonomy Coverage Audit (BP021)",
    chapters: 10,
  },
  "LB-CODEX-0026": {
    hmac: "PENDING_BIND",
    edition: "BP021-1.0",
    title: "Bushel 8 — LB Frame Substrate UI (BP021)",
    chapters: 10,
  },
};

async function computeHMAC(secret: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const codexId: string = body.codex_id ?? "";
    const contentPayload: string = body.content_payload ?? "";

    if (!codexId) {
      return new Response(JSON.stringify({ error: "codex_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const known = KNOWN_CODEX_HMACS[codexId];

    if (!known) {
      return new Response(
        JSON.stringify({
          codex_id: codexId,
          status: "missing",
          message: "No HMAC record found for this Codex ID",
          ts: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (known.hmac === "PENDING_BIND") {
      return new Response(
        JSON.stringify({
          codex_id: codexId,
          status: "pending",
          edition: known.edition,
          title: known.title,
          message: "Codex not yet bound — HMAC pending",
          ts: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If content_payload provided, compute and compare
    if (contentPayload) {
      const hmacSecret = Deno.env.get("CODEX_HMAC_SECRET") ?? "lb-frame-codex-hmac-dev";
      const computed = await computeHMAC(hmacSecret, contentPayload);

      const match = computed === known.hmac;
      return new Response(
        JSON.stringify({
          codex_id: codexId,
          status: match ? "verified" : "tampered",
          stored_hmac: known.hmac,
          computed_hmac: computed,
          edition: known.edition,
          title: known.title,
          chapters: known.chapters,
          ts: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // No payload — just return known record status
    return new Response(
      JSON.stringify({
        codex_id: codexId,
        status: "bound",
        stored_hmac: known.hmac,
        edition: known.edition,
        title: known.title,
        chapters: known.chapters,
        ts: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
