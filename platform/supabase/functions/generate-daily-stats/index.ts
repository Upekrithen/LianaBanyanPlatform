import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const requestedDate = typeof body?.date === "string" ? body.date : todayUtcDate();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: existing } = await supabase
      .from("distribution_news_slots")
      .select("id, content_type, status")
      .eq("scheduled_date", requestedDate)
      .eq("status", "scheduled")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      return jsonResponse({
        success: true,
        skipped: true,
        reason: "scheduled_slot_already_exists",
        date: requestedDate,
      });
    }

    const stats = await loadPlatformStats(supabase);
    const content = buildStatsPost(stats);

    const { data: inserted, error: insertError } = await supabase
      .from("distribution_news_slots")
      .insert({
        scheduled_date: requestedDate,
        slot_time: "17:00:00",
        content_type: "stats",
        content,
        status: "scheduled",
      })
      .select("id, scheduled_date, slot_time, content")
      .single();

    if (insertError) throw new Error(insertError.message);

    return jsonResponse({
      success: true,
      date: requestedDate,
      slot: inserted,
      stats,
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500,
    );
  }
});

async function loadPlatformStats(supabase: ReturnType<typeof createClient>) {
  const [innovationCount, memberCount, episodeCount, chapterCount] = await Promise.all([
    safeCount(supabase, "innovations"),
    safeCount(supabase, "members"),
    safeCount(supabase, "crewman_episodes"),
    safeCount(supabase, "crewman_chapters"),
  ]);

  return {
    innovation_count: innovationCount,
    member_count: memberCount,
    crewman_episode_count: episodeCount,
    crewman_chapter_count: chapterCount,
  };
}

function buildStatsPost(stats: {
  innovation_count: number;
  member_count: number;
  crewman_episode_count: number;
  crewman_chapter_count: number;
}) {
  const segments = [
    `Platform update: ${fmt(stats.innovation_count)} innovations`,
    `${fmt(stats.member_count)} members`,
    `${fmt(stats.crewman_episode_count)} Crewman episodes`,
    `${fmt(stats.crewman_chapter_count)} chapters`,
    "$5/year to join.",
  ];
  return segments.join(", ");
}

async function safeCount(supabase: ReturnType<typeof createClient>, table: string) {
  const { count } = await supabase
    .from(table)
    .select("id", { head: true, count: "exact" });
  return count ?? 0;
}

function fmt(value: number) {
  return Number(value ?? 0).toLocaleString("en-US");
}

function todayUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
