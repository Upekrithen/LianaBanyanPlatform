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
    const breakingNewsContent = String(body?.breaking_news_content ?? "").trim();
    const source = String(body?.source ?? "manual").trim();
    const requestedDate = typeof body?.date === "string" ? body.date : todayUtcDate();
    if (!breakingNewsContent) {
      return jsonResponse({ error: "breaking_news_content is required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: existingSlot, error: existingError } = await supabase
      .from("distribution_news_slots")
      .select("id, scheduled_date, content_type, content, status, original_date")
      .eq("scheduled_date", requestedDate)
      .eq("status", "scheduled")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existingError) throw new Error(existingError.message);

    if (existingSlot?.id) {
      const { error: deferError } = await supabase
        .from("distribution_news_slots")
        .update({
          status: "deferred",
          original_date: existingSlot.original_date ?? existingSlot.scheduled_date,
        })
        .eq("id", existingSlot.id);
      if (deferError) throw new Error(deferError.message);
    }

    const { data: breakingSlot, error: breakingError } = await supabase
      .from("distribution_news_slots")
      .insert({
        scheduled_date: requestedDate,
        slot_time: "17:00:00",
        content_type: "breaking_news",
        content: breakingNewsContent,
        breaking_news_source: source,
        status: "scheduled",
      })
      .select("id, scheduled_date, slot_time, content_type, content, status")
      .single();
    if (breakingError) throw new Error(breakingError.message);

    const deferredPrefix = existingSlot?.content
      ? `Deferred from ${requestedDate}: ${existingSlot.content}`
      : null;
    const tomorrow = addDaysIso(requestedDate, 1);
    const baseTomorrowStats = await buildStatsPost(supabase);
    const mergedTomorrowContent = deferredPrefix
      ? `${deferredPrefix} | ${baseTomorrowStats}`
      : baseTomorrowStats;

    const { data: tomorrowExisting } = await supabase
      .from("distribution_news_slots")
      .select("id, content")
      .eq("scheduled_date", tomorrow)
      .eq("status", "scheduled")
      .eq("content_type", "stats")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tomorrowExisting?.id) {
      const alreadyMerged = deferredPrefix && tomorrowExisting.content?.includes(`Deferred from ${requestedDate}:`);
      if (!alreadyMerged) {
        const { error: updateTomorrowError } = await supabase
          .from("distribution_news_slots")
          .update({ content: mergedTomorrowContent })
          .eq("id", tomorrowExisting.id);
        if (updateTomorrowError) throw new Error(updateTomorrowError.message);
      }
    } else {
      const { error: insertTomorrowError } = await supabase
        .from("distribution_news_slots")
        .insert({
          scheduled_date: tomorrow,
          slot_time: "17:00:00",
          content_type: "stats",
          content: mergedTomorrowContent,
          status: "scheduled",
          original_date: deferredPrefix ? requestedDate : null,
        });
      if (insertTomorrowError) throw new Error(insertTomorrowError.message);
    }

    return jsonResponse({
      success: true,
      date: requestedDate,
      deferred_slot_id: existingSlot?.id ?? null,
      breaking_slot: breakingSlot,
      tomorrow_date: tomorrow,
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500,
    );
  }
});

async function buildStatsPost(supabase: ReturnType<typeof createClient>) {
  const [innovationCount, memberCount, episodeCount, chapterCount] = await Promise.all([
    safeCount(supabase, "innovations"),
    safeCount(supabase, "members"),
    safeCount(supabase, "crewman_episodes"),
    safeCount(supabase, "crewman_chapters"),
  ]);

  return [
    `Platform update: ${fmt(innovationCount)} innovations`,
    `${fmt(memberCount)} members`,
    `${fmt(episodeCount)} Crewman episodes`,
    `${fmt(chapterCount)} chapters`,
    "$5/year to join.",
  ].join(", ");
}

async function safeCount(supabase: ReturnType<typeof createClient>, table: string) {
  const { count } = await supabase
    .from(table)
    .select("id", { head: true, count: "exact" });
  return count ?? 0;
}

function addDaysIso(dateIso: string, deltaDays: number) {
  const date = new Date(`${dateIso}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + deltaDays);
  return date.toISOString().slice(0, 10);
}

function todayUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

function fmt(value: number) {
  return Number(value ?? 0).toLocaleString("en-US");
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
