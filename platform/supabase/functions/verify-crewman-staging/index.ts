import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type VerifyBody = {
  chapter_numbers?: number[];
  include_missing_rows?: boolean;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const body = (await req.json().catch(() => ({}))) as VerifyBody;
    const chapterNumbers = Array.isArray(body.chapter_numbers)
      ? body.chapter_numbers.filter((value) => Number.isInteger(value))
      : [];
    const includeMissingRows = Boolean(body.include_missing_rows);

    if (chapterNumbers.length === 0) {
      return json({ error: "chapter_numbers[] is required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: chapters, error: chapterError } = await supabase
      .from("crewman_chapters")
      .select("id, chapter_number, title")
      .in("chapter_number", chapterNumbers)
      .order("chapter_number", { ascending: true });

    if (chapterError) throw new Error(chapterError.message);
    if (!chapters || chapters.length === 0) {
      return json({ error: "No matching chapters found." }, 404);
    }

    const chapterIds = chapters.map((chapter) => chapter.id);
    const chapterNumberById = new Map(chapters.map((chapter) => [chapter.id, chapter.chapter_number]));

    const { data: episodes, error: episodeError } = await supabase
      .from("crewman_episodes")
      .select("chapter_id, channel, primary_spice, source_reference, sequence_number, content")
      .in("chapter_id", chapterIds);

    if (episodeError) throw new Error(episodeError.message);

    const byChapter = new Map<number, number>();
    const byChannel = new Map<string, number>();
    let spoonfulMissingPrimarySpice = 0;
    let spoonfulWithPrimarySpice = 0;
    const missingPrimarySpiceRows: Array<{
      chapter_number: number;
      chapter_id: string;
      source_reference: string | null;
      sequence_number: number;
      content_preview: string;
    }> = [];

    for (const row of episodes ?? []) {
      const chapterNumber = chapterNumberById.get(row.chapter_id);
      if (chapterNumber !== undefined) {
        byChapter.set(chapterNumber, (byChapter.get(chapterNumber) ?? 0) + 1);
      }

      const channel = String(row.channel ?? "unknown").toLowerCase();
      byChannel.set(channel, (byChannel.get(channel) ?? 0) + 1);

      if (channel === "spoonfuls") {
        if (row.primary_spice) {
          spoonfulWithPrimarySpice += 1;
        } else {
          spoonfulMissingPrimarySpice += 1;
          if (includeMissingRows && chapterNumber !== undefined) {
            missingPrimarySpiceRows.push({
              chapter_number: chapterNumber,
              chapter_id: row.chapter_id,
              source_reference: row.source_reference ?? null,
              sequence_number: Number(row.sequence_number ?? 0),
              content_preview: String(row.content ?? "").slice(0, 120),
            });
          }
        }
      }
    }

    const missingChapters = chapterNumbers.filter((num) => ![...byChapter.keys()].includes(num));
    return json({
      requested_chapters: chapterNumbers,
      matched_chapters: chapters.length,
      total_episodes: (episodes ?? []).length,
      by_channel: Object.fromEntries([...byChannel.entries()].sort()),
      by_chapter_number: Object.fromEntries([...byChapter.entries()].sort((a, b) => a[0] - b[0])),
      spoonful_primary_spice: {
        with_primary_spice: spoonfulWithPrimarySpice,
        missing_primary_spice: spoonfulMissingPrimarySpice,
      },
      missing_primary_spice_rows: includeMissingRows ? missingPrimarySpiceRows : undefined,
      missing_chapters: missingChapters,
    });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500,
    );
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
