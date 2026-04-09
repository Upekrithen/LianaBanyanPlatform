import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SPICE_KEYWORDS = {
  garlic: ["cost", "price", "margin", "$", "83.3%", "revenue"],
  cinnamon: ["design", "ui", "layout", "interface", "visual"],
  pepper: ["patent", "legal", "compliance", "policy", "sec"],
  cumin: ["built", "code", "table", "function", "migration", "deploy"],
  paprika: ["veteran", "children", "founded", "vision", "enlisted"],
  ginger: ["innovation", "diagnostic", "blizzard", "vapor", "invention"],
  basil: ["article", "paper", "journal", "publication", "wrote"],
  oregano: ["coordinate", "librarian", "dispatch", "schedule", "session"],
  sugar: ["market", "outreach", "campaign", "letter", "pitch"],
  salt: ["member", "daily", "process", "operations", "system"],
} as const;

type SpiceType = keyof typeof SPICE_KEYWORDS;
type ChapterFallback = { primary: SpiceType; secondary: SpiceType[] };

const CHAPTER_FALLBACKS: Record<number, ChapterFallback> = {
  1: { primary: "paprika", secondary: ["ginger", "cinnamon"] },
  2: { primary: "ginger", secondary: ["cumin", "garlic"] },
  3: { primary: "paprika", secondary: ["basil", "oregano"] },
  4: { primary: "basil", secondary: ["cumin", "ginger"] },
};

type AutoTagPayload = {
  chapter_id?: string;
};

type EpisodeRow = {
  id: string;
  content: string;
  primary_spice: SpiceType | null;
  secondary_spices: SpiceType[] | null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return respond({ error: "Method not allowed" }, 405);
  }

  try {
    const body = (await req.json().catch(() => ({}))) as AutoTagPayload;
    const chapterId = body.chapter_id?.trim();
    if (!chapterId) {
      return respond({ error: "chapter_id is required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: chapterRow } = await supabase
      .from("crewman_chapters")
      .select("chapter_number")
      .eq("id", chapterId)
      .maybeSingle();
    const chapterNumber = Number(chapterRow?.chapter_number ?? 0);
    const chapterFallback = CHAPTER_FALLBACKS[chapterNumber] ?? { primary: "salt", secondary: [] };

    const { data, error } = await supabase
      .from("crewman_episodes")
      .select("id, content, primary_spice, secondary_spices")
      .eq("chapter_id", chapterId)
      .is("primary_spice", null)
      .order("sequence_number", { ascending: true });

    if (error) throw new Error(error.message);

    const episodes = (data ?? []) as EpisodeRow[];
    const updates: Array<{
      episode_id: string;
      primary_spice: SpiceType;
      secondary_spices: SpiceType[];
      matched_keywords: Record<SpiceType, string[]>;
    }> = [];

    for (const episode of episodes) {
      const ranking = rankSpices(episode.content);
      const primarySpice = ranking.length > 0 ? ranking[0].spice : chapterFallback.primary;
      const secondarySpices = ranking.length > 0
        ? ranking.slice(1, 3).map((entry) => entry.spice)
        : chapterFallback.secondary;

      const { error: updateError } = await supabase
        .from("crewman_episodes")
        .update({
          primary_spice: primarySpice,
          secondary_spices: secondarySpices,
        })
        .eq("id", episode.id);
      if (updateError) throw new Error(updateError.message);

      updates.push({
        episode_id: episode.id,
        primary_spice: primarySpice,
        secondary_spices: secondarySpices,
        matched_keywords: Object.fromEntries(
          (ranking.length > 0 ? ranking : [{ spice: primarySpice, score: 0, matches: ["chapter-fallback"] }])
            .map((entry) => [entry.spice, entry.matches]),
        ) as Record<SpiceType, string[]>,
      });
    }

    return respond({
      success: true,
      chapter_id: chapterId,
      episodes_scanned: episodes.length,
      episodes_tagged: updates.length,
      updates,
    });
  } catch (error) {
    return respond({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

function rankSpices(content: string) {
  const text = content.toLowerCase();

  const ranked = (Object.entries(SPICE_KEYWORDS) as Array<[SpiceType, readonly string[]]>)
    .map(([spice, keywords]) => {
      const matches = keywords.filter((keyword) => text.includes(keyword));
      return {
        spice,
        score: matches.length,
        matches,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return ranked;
}

function respond(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
