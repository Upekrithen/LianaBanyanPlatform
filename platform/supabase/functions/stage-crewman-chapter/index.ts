import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type StageEpisodeInput = {
  sequence_number: number;
  content: string;
  source_reference?: string | null;
  tags?: string[] | null;
  platform?: string | null;
  channel?: "bst" | "spoonfuls" | "skipping_stones" | null;
  primary_spice?: string | null;
  secondary_spices?: string[] | null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body = await req.json();
    const {
      chapter_number,
      title,
      source_document,
      cephas_content_key,
      vote_threshold,
      episodes,
    } = body as {
      chapter_number: number;
      title: string;
      source_document?: string;
      cephas_content_key?: string;
      vote_threshold?: number;
      episodes: StageEpisodeInput[];
    };

    if (!chapter_number || !title || !Array.isArray(episodes) || episodes.length === 0) {
      return new Response(
        JSON.stringify({ error: "chapter_number, title, and episodes[] are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const normalizedEpisodes = episodes
      .map((episode) => ({
        sequence_number: episode.sequence_number,
        content: episode.content?.trim(),
        source_reference: episode.source_reference ?? null,
        tags: episode.tags ?? [],
        platform: episode.platform ?? "twitter",
        channel: episode.channel ?? "bst",
        primary_spice: episode.primary_spice ?? null,
        secondary_spices: episode.secondary_spices ?? [],
      }))
      .filter((episode) => episode.sequence_number > 0 && episode.content);

    if (normalizedEpisodes.length === 0) {
      return new Response(
        JSON.stringify({ error: "episodes[] must include valid sequence_number and content" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: chapter, error: chapterError } = await supabase
      .from("crewman_chapters")
      .upsert({
        chapter_number,
        title,
        source_document: source_document ?? null,
        cephas_content_key: cephas_content_key ?? null,
        vote_threshold: vote_threshold ?? 100,
        episode_count: normalizedEpisodes.length,
        status: "staged",
      }, { onConflict: "chapter_number" })
      .select("*")
      .single();

    if (chapterError || !chapter) {
      throw new Error(chapterError?.message ?? "Failed to create chapter");
    }

    // Re-stage chapter episodes from the provided source of truth.
    await supabase.from("crewman_episodes").delete().eq("chapter_id", chapter.id);

    const { data: stagedEpisodes, error: episodeError } = await supabase
      .from("crewman_episodes")
      .insert(
        normalizedEpisodes.map((episode) => ({
          chapter_id: chapter.id,
          sequence_number: episode.sequence_number,
          content: episode.content,
          source_reference: episode.source_reference,
          tags: episode.tags,
          platform: episode.platform,
          channel: episode.channel,
          primary_spice: episode.primary_spice,
          secondary_spices: episode.secondary_spices,
          status: "queued",
        })),
      )
      .select("id, sequence_number, platform, channel");

    if (episodeError) {
      throw new Error(episodeError.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        chapter_id: chapter.id,
        chapter_number: chapter.chapter_number,
        episode_count: stagedEpisodes?.length ?? 0,
        cephas_staged: true,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
