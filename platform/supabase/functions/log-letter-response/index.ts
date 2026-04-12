/**
 * Edge Function: log-letter-response
 * ====================================
 * Logs a Crown letter response event to the response_tracking table.
 * K409 / B097 — Pitfall 3 response playbook wiring.
 *
 * POST body:
 *   recipient_name: string (required)
 *   response_type: "yes" | "curious" | "no_thanks" | "needs_clarification" | "delegation" | "meeting_scheduled" | "other"
 *   summary: string (short free text)
 *   received_at?: string (ISO-8601, defaults to now)
 *   event_kind?: "response_received" | "followup_sent" | "letter_dispatched"
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VALID_RESPONSE_TYPES = [
  "yes", "curious", "no_thanks", "needs_clarification",
  "delegation", "meeting_scheduled", "other",
] as const;

const VALID_EVENT_KINDS = [
  "letter_dispatched", "response_received", "followup_sent",
] as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(jwt);
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      recipient_name,
      response_type = "other",
      summary = "",
      received_at,
      event_kind = "response_received",
    } = body;

    if (!recipient_name) {
      return new Response(JSON.stringify({ error: "recipient_name is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!VALID_EVENT_KINDS.includes(event_kind)) {
      return new Response(JSON.stringify({ error: `Invalid event_kind: ${event_kind}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const timestamp = received_at || new Date().toISOString();

    const { data, error } = await supabase
      .from("crown_letter_response_log")
      .insert({
        logged_by: user.id,
        recipient_name,
        event_kind,
        response_type: event_kind === "response_received" ? response_type : null,
        summary,
        event_at: timestamp,
      })
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, entry: data }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
