/**
 * radar-ping — Edge function for the RADAR Ping System (K380).
 * POST: Send a ping (location, summon, alert, sos, rally, waypoint).
 * GET:  Fetch active pings for the authenticated member.
 * PATCH: Mark a ping as read.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // ── GET: Fetch active pings for this member ──
    if (req.method === "GET") {
      const url = new URL(req.url);
      const island = url.searchParams.get("island");
      const limit = parseInt(url.searchParams.get("limit") || "50", 10);

      let query = supabase
        .from("radar_pings")
        .select("*")
        .or(`target_id.eq.${user.id},target_type.eq.broadcast`)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(limit);

      if (island) {
        query = query.eq("island_slug", island);
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify({ pings: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── POST: Send a new ping ──
    if (req.method === "POST") {
      const body = await req.json();
      const {
        target_id,
        target_type = "member",
        ping_type = "location",
        message,
        island_slug,
        district_slug,
        map_x,
        map_y,
        metadata = {},
        expires_hours = 24,
      } = body;

      const { data, error } = await supabase.from("radar_pings").insert({
        sender_id: user.id,
        target_id: target_type === "broadcast" ? null : target_id,
        target_type,
        ping_type,
        message: message?.substring(0, 280),
        island_slug,
        district_slug,
        map_x,
        map_y,
        metadata,
        expires_at: new Date(Date.now() + expires_hours * 3600000).toISOString(),
      }).select().single();

      if (error) throw error;

      return new Response(JSON.stringify({ ping: data }), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── PATCH: Mark ping as read ──
    if (req.method === "PATCH") {
      const body = await req.json();
      const { ping_id } = body;

      const { data, error } = await supabase
        .from("radar_pings")
        .update({ read_at: new Date().toISOString() })
        .eq("id", ping_id)
        .eq("target_id", user.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ ping: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
