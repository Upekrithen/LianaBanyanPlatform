import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type BeaconWalletRow = {
  member_id: string | null;
  user_id: string | null;
  beacon_id: string;
  reading_paper_key: string | null;
  reading_ref_code: string | null;
  reading_position: number | null;
  reading_depth: number | null;
  reading_completed_at: string | null;
  started_at: string | null;
  last_read_at: string | null;
  percent_complete: number | null;
  coverage_minutes: number | null;
  golden_keys: number | null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabase
      .from("beacon_wallet")
      .select("*")
      .or(`member_id.eq.${user.id},user_id.eq.${user.id}`)
      .order("last_read_at", { ascending: false });
    if (error) throw error;

    const rows = ((data ?? []) as BeaconWalletRow[]).filter((row) => row.reading_paper_key);

    const active_reads = rows.filter((row) => Number(row.reading_depth ?? 0) < 4);
    const completed_reads = rows.filter((row) => Number(row.reading_depth ?? 0) >= 4);

    const grouped_by_paper = rows.reduce<Record<string, BeaconWalletRow[]>>((acc, row) => {
      const key = row.reading_paper_key ?? "unknown";
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    }, {});

    const stats = {
      total_beacons: rows.length,
      papers_started: Object.keys(grouped_by_paper).length,
      papers_completed: new Set(completed_reads.map((row) => row.reading_paper_key)).size,
      coverage_minutes: rows.reduce((sum, row) => sum + Number(row.coverage_minutes ?? 0), 0),
    };

    return new Response(
      JSON.stringify({
        success: true,
        stats,
        active_reads,
        completed_reads,
        grouped_by_paper,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
