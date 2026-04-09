import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type BstPayload = {
  type: "bst_episode";
  chapter_id: string;
  base_url?: string;
};

type StoneInput = {
  section_anchor: string;
  title: string;
  hook_text: string;
};

type StonePayload = {
  type: "skipping_stone";
  paper_key: string;
  stones: StoneInput[];
  base_url?: string;
};

type GeneratePayload = BstPayload | StonePayload;

const truncate = (value: string, max: number) => {
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length <= max ? normalized : `${normalized.slice(0, max - 1).trimEnd()}…`;
};

const normalizeBaseUrl = (baseUrl?: string) => {
  const fallback = "https://lianabanyan.com";
  const candidate = (baseUrl ?? fallback).trim() || fallback;
  return candidate.endsWith("/") ? candidate.slice(0, -1) : candidate;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const parseAnchorFromReference = (sourceReference: string | null, fallback: string) => {
  if (!sourceReference) return fallback;
  const hashIndex = sourceReference.indexOf("#");
  if (hashIndex >= 0 && hashIndex < sourceReference.length - 1) {
    return slugify(sourceReference.slice(hashIndex + 1)) || fallback;
  }
  return fallback;
};

const buildDeepLink = (baseUrl: string, paperKey: string, sectionAnchor: string, refCode: string) => {
  const url = new URL(`${baseUrl}/read/${paperKey}`);
  url.searchParams.set("ref", refCode);
  url.hash = sectionAnchor;
  return url.toString();
};

const createCardCode = (prefix: string, index: number) => {
  const shortId = crypto.randomUUID().split("-")[0].toUpperCase();
  return `${prefix}-${String(index + 1).padStart(4, "0")}-${shortId}`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Server is missing Supabase service credentials" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const body = (await req.json()) as GeneratePayload;
    const baseUrl = normalizeBaseUrl(body.base_url);

    if (body.type === "bst_episode") {
      const chapterId = body.chapter_id?.trim();
      if (!chapterId) {
        return new Response(JSON.stringify({ error: "chapter_id is required for bst_episode generation" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: chapter, error: chapterError } = await supabaseAdmin
        .from("crewman_chapters")
        .select("id, chapter_number, title, cephas_content_key, source_document")
        .eq("id", chapterId)
        .single();
      if (chapterError) throw chapterError;

      const { data: episodes, error: episodesError } = await supabaseAdmin
        .from("crewman_episodes")
        .select("id, sequence_number, content, source_reference")
        .eq("chapter_id", chapterId)
        .order("sequence_number", { ascending: true });
      if (episodesError) throw episodesError;

      const paperKey = slugify(chapter.cephas_content_key ?? chapter.source_document ?? `chapter-${chapter.chapter_number}`) ||
        `chapter-${chapter.chapter_number}`;

      const rows = (episodes ?? []).map((episode, index) => {
        const refCode = createCardCode(`BST${chapter.chapter_number}`, index);
        const sectionAnchor = parseAnchorFromReference(
          episode.source_reference,
          `episode-${episode.sequence_number}`,
        );
        const title = `BST Episode ${episode.sequence_number}`;
        const hookText = truncate(episode.content ?? "", 280);
        const deepLinkUrl = buildDeepLink(baseUrl, paperKey, sectionAnchor, refCode);

        return {
          card_code: refCode,
          card_type: "bst_episode",
          episode_id: episode.id,
          paper_key: paperKey,
          section_anchor: sectionAnchor,
          title,
          hook_text: hookText,
          deep_link_url: deepLinkUrl,
          qr_code_data: deepLinkUrl,
          card_template: "bst_episode",
          logo_variant: "standard",
          status: "generated",
          name: title,
          description: hookText,
          front_title: title,
          front_subtitle: `Chapter ${chapter.chapter_number}`,
          back_title: "Scan to read the full story",
          back_instructions: "#CrewmanSix",
          back_destination: deepLinkUrl,
        };
      });

      if (!rows.length) {
        return new Response(JSON.stringify({ success: true, generated_count: 0, cards: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: inserted, error: insertError } = await supabaseAdmin
        .from("deck_cards")
        .insert(rows)
        .select("id, card_code, card_type, episode_id, paper_key, section_anchor, title, hook_text, deep_link_url, qr_code_data, created_at");
      if (insertError) throw insertError;

      return new Response(
        JSON.stringify({
          success: true,
          generated_count: inserted?.length ?? 0,
          cards: inserted ?? [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (body.type === "skipping_stone") {
      const paperKey = slugify(body.paper_key ?? "");
      const stones = Array.isArray(body.stones) ? body.stones : [];
      if (!paperKey) {
        return new Response(JSON.stringify({ error: "paper_key is required for skipping_stone generation" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!stones.length) {
        return new Response(JSON.stringify({ error: "stones[] is required for skipping_stone generation" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const rows = stones.map((stone, index) => {
        const sectionAnchor = slugify(stone.section_anchor || `stone-${index + 1}`) || `stone-${index + 1}`;
        const refCode = createCardCode(`STONE-${paperKey.toUpperCase()}`, index);
        const title = truncate(stone.title || `Skipping Stone ${index + 1}`, 96);
        const hookText = truncate(stone.hook_text || "The Proof is in the Pudding.", 140);
        const deepLinkUrl = buildDeepLink(baseUrl, paperKey, sectionAnchor, refCode);

        return {
          card_code: refCode,
          card_type: "skipping_stone",
          paper_key: paperKey,
          section_anchor: sectionAnchor,
          title,
          hook_text: hookText,
          deep_link_url: deepLinkUrl,
          qr_code_data: deepLinkUrl,
          card_template: "skipping_stone",
          logo_variant: "skipping_stone",
          status: "generated",
          name: title,
          description: hookText,
          front_title: title,
          front_subtitle: paperKey,
          back_title: "The Proof is in the Pudding",
          back_instructions: "Scan to open the source passage.",
          back_destination: deepLinkUrl,
        };
      });

      const { data: inserted, error: insertError } = await supabaseAdmin
        .from("deck_cards")
        .insert(rows)
        .select("id, card_code, card_type, paper_key, section_anchor, title, hook_text, deep_link_url, qr_code_data, created_at");
      if (insertError) throw insertError;

      return new Response(
        JSON.stringify({
          success: true,
          generated_count: inserted?.length ?? 0,
          cards: inserted ?? [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ error: "Invalid payload type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
