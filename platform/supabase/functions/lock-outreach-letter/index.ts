/**
 * LOCK-OUTREACH-LETTER — Founder transitions letter state
 * =========================================================
 * K537 / B131 — Glass Door Open Outreach
 * Innovation #2262 The Glass Door + A&A #2327 candidate
 *
 * Founder-only action. Transitions a letter through its state machine:
 *   draft → locked  (prose-passed; letter becomes visible on Glass Door)
 *   locked → proposed  (open for member voting)
 *   proposed → scheduled  (voting complete; Founder schedules dispatch)
 *   dispatched → pre_responded  (recipient found + responded before formal dispatch)
 *   pre_responded → formally_dispatched  (formal dispatch fires after pre-response)
 *
 * POST body: { letter_id: string, target_state: string }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify Founder auth (must be authenticated)
    const userSupabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userSupabase.auth.getUser();
    if (userErr || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Check admin role
    const serviceSupabase = createClient(supabaseUrl, serviceKey);
    const { data: roleRow } = await serviceSupabase
      .from("member_roles")
      .select("role")
      .eq("member_id", user.id)
      .in("role", ["admin", "founder"])
      .limit(1)
      .single();

    if (!roleRow) {
      return new Response(
        JSON.stringify({ error: "Forbidden — admin/founder role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { letter_id, target_state } = await req.json();

    if (!letter_id || !target_state) {
      return new Response(
        JSON.stringify({ error: "letter_id and target_state are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const VALID_TARGET_STATES = [
      "locked", "proposed", "scheduled",
      "pre_responded", "formally_dispatched",
    ];

    if (!VALID_TARGET_STATES.includes(target_state)) {
      return new Response(
        JSON.stringify({ error: `Invalid target_state: ${target_state}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Call the DB helper which enforces allowed transitions
    const { data, error } = await serviceSupabase.rpc("lock_outreach_letter", {
      p_letter_id: letter_id,
      p_target_state: target_state,
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`[lock-outreach-letter] ${user.email} transitioned ${letter_id} → ${target_state}`);

    // BP077 Scope 3 -- Pedestal Forum seeding on draft → locked transition
    // Creates a paper_pedestal_forum_additions anchor row so the Pedestal Forum
    // surface is immediately available for member Decree-Composition additions.
    // Graceful degrade: failure here does NOT block the publish -- logged only.
    if (target_state === "locked") {
      await (async () => {
        try {
          // Fetch letter data for the pedestal anchor
          const { data: letter, error: letterErr } = await serviceSupabase
            .from("outreach_letters")
            .select("slug, recipient_name, substantive_summary, what_we_are_asking, wave_label")
            .eq("letter_id", letter_id)
            .single();

          if (letterErr || !letter) {
            console.warn("[lock-outreach-letter] Pedestal seed: could not fetch letter", letterErr?.message);
            return;
          }

          // Guard: skip if a pedestal row already exists for this letter's slug
          const { count } = await serviceSupabase
            .from("paper_pedestal_forum_additions")
            .select("id", { count: "exact", head: true })
            .eq("paper_id", letter.slug);

          if (count && count > 0) {
            console.log(`[lock-outreach-letter] Pedestal already seeded for ${letter.slug} -- skipping`);
            return;
          }

          const pedestalTitle = letter.recipient_name
            ? `Letter to ${letter.recipient_name}${letter.wave_label ? ` (${letter.wave_label})` : ""}`
            : "Open Outreach Letter";

          const pedestalBody = (letter.substantive_summary || letter.what_we_are_asking || "")
            .trim()
            .slice(0, 2000) || "Founder open-outreach letter published to the Glass Door.";

          const { error: insertErr } = await serviceSupabase
            .from("paper_pedestal_forum_additions")
            .insert({
              paper_id: letter.slug,
              member_user_id: user.id,
              author_display_name: "Founder",
              addition_class: "extending",
              title: pedestalTitle,
              body: pedestalBody,
            });

          if (insertErr) {
            console.warn("[lock-outreach-letter] Pedestal seed insert failed (non-blocking):", insertErr.message);
          } else {
            console.log(`[lock-outreach-letter] Pedestal seeded for ${letter.slug} at ${new Date().toISOString()}`);
          }
        } catch (pedestalErr) {
          console.warn("[lock-outreach-letter] Pedestal seed error (non-blocking):", String(pedestalErr));
        }
      })();
    }

    return new Response(
      JSON.stringify({ ok: true, letter: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[lock-outreach-letter] Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
