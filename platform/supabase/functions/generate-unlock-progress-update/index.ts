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
    const minPercent = Number.isFinite(Number(body?.min_percent)) ? Number(body.min_percent) : 50;
    const maxPercent = Number.isFinite(Number(body?.max_percent)) ? Number(body.max_percent) : 99;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: rows, error } = await supabase
      .from("chapter_unlock_progress")
      .select("chapter_id, chapter_number, chapter_title, percent_unlocked, unlocked")
      .eq("unlocked", false)
      .gte("percent_unlocked", minPercent)
      .lte("percent_unlocked", maxPercent)
      .order("percent_unlocked", { ascending: false })
      .limit(3);
    if (error) throw new Error(error.message);

    const progressRows = (rows ?? []) as Array<{
      chapter_id: string;
      chapter_number: number;
      chapter_title: string;
      percent_unlocked: number;
      unlocked: boolean;
    }>;

    if (progressRows.length === 0) {
      return jsonResponse({
        success: true,
        skipped: true,
        reason: "no_chapters_in_progress_range",
        date: requestedDate,
      });
    }

    const primary = progressRows[0];
    const content = `Chapter ${primary.chapter_number} (${primary.chapter_title}) is ${
      Math.round(primary.percent_unlocked)
    }% unlocked. Help us cross the line - every like, comment, share, and save counts.`;

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
      source_chapters: progressRows,
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500,
    );
  }
});

function todayUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
