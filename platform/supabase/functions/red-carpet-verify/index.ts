/**
 * red-carpet-verify — Supabase Edge Function
 * ===========================================
 * Wave 1 Crown Letter Red Carpet verification endpoint.
 * Returns per-recipient config for a given slug.
 *
 * K-Red-Carpet-Wave-1-Verification-BP010 (Founder direct BP010 turn 25)
 * Cohort: 30 recipients (22 PLOW-AHEAD + 8 WORTH-IT per B131)
 * Bill Gates: excluded (Epstein-indefinite block)
 * Melinda French Gates: IN (Priority 2 PLOW-AHEAD)
 *
 * Usage:
 *   GET /red-carpet-verify?slug=buffett_w
 *   → 200 { recipient_slug, display_name, tier_class, frame_strategy, wave_class, share_link, status }
 *   GET /red-carpet-verify?slug=unknown-person
 *   → 404 { error: "recipient not found" }
 *
 * Slug convention: <lastname>_<firstinitial> — matches letter scaffold filenames.
 * Source of truth: platform/src/data/red_carpet_recipients/index.ts
 * (hardcoded here; edge functions cannot import from platform/src/)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────

interface Wave1RecipientConfig {
  recipient_slug: string;
  display_name: string;
  tier_class: string;
  frame_strategy: string;
  wave_class: "PLOW-AHEAD" | "WORTH-IT";
  priority: number;
  share_link: string;
  status: string;
  legacy_registry_id?: string;
}

// ─────────────────────────────────────────────────────────
// CORS HEADERS
// ─────────────────────────────────────────────────────────

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

// ─────────────────────────────────────────────────────────
// WAVE 1 REGISTRY — 30 RECIPIENTS
// Mirrored from platform/src/data/red_carpet_recipients/index.ts
// ─────────────────────────────────────────────────────────

const BASE_URL = "https://lianabanyan.com/red-carpet";
const STATUS = "scaffold-ready";

const WAVE1_REGISTRY: Record<string, Wave1RecipientConfig> = {
  // PLOW-AHEAD — Sub-Wave 1a: Foundational Allies (Priority 1)
  buffett_w: { recipient_slug: "buffett_w", display_name: "Warren Buffett", tier_class: "enterprise", frame_strategy: "biology-roots-trunk", wave_class: "PLOW-AHEAD", priority: 1, share_link: `${BASE_URL}/buffett_w`, status: STATUS, legacy_registry_id: "warren-buffett" },
  doctorow_c: { recipient_slug: "doctorow_c", display_name: "Cory Doctorow", tier_class: "cooperative", frame_strategy: "dual-frame", wave_class: "PLOW-AHEAD", priority: 1, share_link: `${BASE_URL}/doctorow_c`, status: STATUS, legacy_registry_id: "cory-doctorow" },
  schneider_n: { recipient_slug: "schneider_n", display_name: "Nathan Schneider", tier_class: "cooperative", frame_strategy: "biology-roots-trunk", wave_class: "PLOW-AHEAD", priority: 1, share_link: `${BASE_URL}/schneider_n`, status: STATUS, legacy_registry_id: "nathan-schneider" },
  brynjolfsson_e: { recipient_slug: "brynjolfsson_e", display_name: "Erik Brynjolfsson", tier_class: "academic", frame_strategy: "dual-frame", wave_class: "PLOW-AHEAD", priority: 1, share_link: `${BASE_URL}/brynjolfsson_e`, status: STATUS, legacy_registry_id: "erik-brynjolfsson" },

  // PLOW-AHEAD — Sub-Wave 1b: High-Amplification (Priority 2)
  khan_s: { recipient_slug: "khan_s", display_name: "Sal Khan", tier_class: "edu", frame_strategy: "biology-roots-trunk", wave_class: "PLOW-AHEAD", priority: 2, share_link: `${BASE_URL}/khan_s`, status: STATUS, legacy_registry_id: "sal-khan" },
  scott_m: { recipient_slug: "scott_m", display_name: "MacKenzie Scott", tier_class: "cooperative", frame_strategy: "biology-roots-trunk", wave_class: "PLOW-AHEAD", priority: 2, share_link: `${BASE_URL}/scott_m`, status: STATUS, legacy_registry_id: "mackenzie-scott" },
  scholz_t: { recipient_slug: "scholz_t", display_name: "Trebor Scholz", tier_class: "cooperative", frame_strategy: "biology-roots-trunk", wave_class: "PLOW-AHEAD", priority: 2, share_link: `${BASE_URL}/scholz_t`, status: STATUS, legacy_registry_id: "trebor-scholz" },
  frenchgates_m: { recipient_slug: "frenchgates_m", display_name: "Melinda French Gates", tier_class: "cooperative", frame_strategy: "biology-roots-trunk", wave_class: "PLOW-AHEAD", priority: 2, share_link: `${BASE_URL}/frenchgates_m`, status: STATUS },

  // PLOW-AHEAD — Sub-Wave 1c: Academic / Intellectual Layer (Priority 3)
  benkler_y: { recipient_slug: "benkler_y", display_name: "Yochai Benkler", tier_class: "academic", frame_strategy: "dual-frame", wave_class: "PLOW-AHEAD", priority: 3, share_link: `${BASE_URL}/benkler_y`, status: STATUS, legacy_registry_id: "yochai-benkler" },
  marks_h: { recipient_slug: "marks_h", display_name: "Howard Marks", tier_class: "enterprise", frame_strategy: "biology-roots-trunk", wave_class: "PLOW-AHEAD", priority: 3, share_link: `${BASE_URL}/marks_h`, status: STATUS, legacy_registry_id: "howard-marks" },
  raworth_k: { recipient_slug: "raworth_k", display_name: "Kate Raworth", tier_class: "academic", frame_strategy: "biology-roots-trunk", wave_class: "PLOW-AHEAD", priority: 3, share_link: `${BASE_URL}/raworth_k`, status: STATUS, legacy_registry_id: "kate-raworth" },
  perel_e: { recipient_slug: "perel_e", display_name: "Esther Perel", tier_class: "media", frame_strategy: "biology-roots-trunk", wave_class: "PLOW-AHEAD", priority: 3, share_link: `${BASE_URL}/perel_e`, status: STATUS, legacy_registry_id: "esther-perel" },
  godin_s: { recipient_slug: "godin_s", display_name: "Seth Godin", tier_class: "media", frame_strategy: "dual-frame", wave_class: "PLOW-AHEAD", priority: 3, share_link: `${BASE_URL}/godin_s`, status: STATUS, legacy_registry_id: "seth-godin" },
  rushkoff_d: { recipient_slug: "rushkoff_d", display_name: "Douglas Rushkoff", tier_class: "media", frame_strategy: "dual-frame", wave_class: "PLOW-AHEAD", priority: 3, share_link: `${BASE_URL}/rushkoff_d`, status: STATUS, legacy_registry_id: "douglas-rushkoff" },
  newmark_c: { recipient_slug: "newmark_c", display_name: "Craig Newmark", tier_class: "media", frame_strategy: "biology-roots-trunk", wave_class: "PLOW-AHEAD", priority: 3, share_link: `${BASE_URL}/newmark_c`, status: STATUS, legacy_registry_id: "craig-newmark" },

  // PLOW-AHEAD — Sub-Wave 1d: Commentariat + Cultural (Priority 4–7)
  white_m: { recipient_slug: "white_m", display_name: "Molly White", tier_class: "media", frame_strategy: "ultravision", wave_class: "PLOW-AHEAD", priority: 4, share_link: `${BASE_URL}/white_m`, status: STATUS, legacy_registry_id: "molly-white" },
  green_h: { recipient_slug: "green_h", display_name: "Hank Green", tier_class: "media", frame_strategy: "dual-frame", wave_class: "PLOW-AHEAD", priority: 4, share_link: `${BASE_URL}/green_h`, status: STATUS, legacy_registry_id: "hank-green" },
  poo_aj: { recipient_slug: "poo_aj", display_name: "Ai-jen Poo", tier_class: "cooperative", frame_strategy: "biology-roots-trunk", wave_class: "PLOW-AHEAD", priority: 4, share_link: `${BASE_URL}/poo_aj`, status: STATUS, legacy_registry_id: "ai-jen-poo" },
  carter_m: { recipient_slug: "carter_m", display_name: "Majora Carter", tier_class: "cooperative", frame_strategy: "biology-roots-trunk", wave_class: "PLOW-AHEAD", priority: 4, share_link: `${BASE_URL}/carter_m`, status: STATUS, legacy_registry_id: "majora-carter" },
  parton_d: { recipient_slug: "parton_d", display_name: "Dolly Parton", tier_class: "media", frame_strategy: "biology-roots-trunk", wave_class: "PLOW-AHEAD", priority: 5, share_link: `${BASE_URL}/parton_d`, status: STATUS, legacy_registry_id: "dolly-parton" },
  mcafee_a: { recipient_slug: "mcafee_a", display_name: "Andrew McAfee", tier_class: "academic", frame_strategy: "dual-frame", wave_class: "PLOW-AHEAD", priority: 7, share_link: `${BASE_URL}/mcafee_a`, status: STATUS },
  mollick_e: { recipient_slug: "mollick_e", display_name: "Ethan Mollick", tier_class: "academic", frame_strategy: "dual-frame", wave_class: "PLOW-AHEAD", priority: 7, share_link: `${BASE_URL}/mollick_e`, status: STATUS },

  // WORTH-IT (8) — Measured-posture dispatch
  acemoglu_d: { recipient_slug: "acemoglu_d", display_name: "Daron Acemoglu", tier_class: "academic", frame_strategy: "biology-roots-trunk", wave_class: "WORTH-IT", priority: 3, share_link: `${BASE_URL}/acemoglu_d`, status: STATUS, legacy_registry_id: "daron-acemoglu" },
  mazzucato_m: { recipient_slug: "mazzucato_m", display_name: "Mariana Mazzucato", tier_class: "academic", frame_strategy: "biology-roots-trunk", wave_class: "WORTH-IT", priority: 3, share_link: `${BASE_URL}/mazzucato_m`, status: STATUS, legacy_registry_id: "mariana-mazzucato" },
  giridharadas_a: { recipient_slug: "giridharadas_a", display_name: "Anand Giridharadas", tier_class: "media", frame_strategy: "biology-roots-trunk", wave_class: "WORTH-IT", priority: 3, share_link: `${BASE_URL}/giridharadas_a`, status: STATUS, legacy_registry_id: "anand-giridharadas" },
  klein_e: { recipient_slug: "klein_e", display_name: "Ezra Klein", tier_class: "media", frame_strategy: "biology-roots-trunk", wave_class: "WORTH-IT", priority: 4, share_link: `${BASE_URL}/klein_e`, status: STATUS, legacy_registry_id: "ezra-klein" },
  patel_n: { recipient_slug: "patel_n", display_name: "Nilay Patel", tier_class: "media", frame_strategy: "dual-frame", wave_class: "WORTH-IT", priority: 4, share_link: `${BASE_URL}/patel_n`, status: STATUS, legacy_registry_id: "nilay-patel" },
  sinek_s: { recipient_slug: "sinek_s", display_name: "Simon Sinek", tier_class: "media", frame_strategy: "biology-roots-trunk", wave_class: "WORTH-IT", priority: 5, share_link: `${BASE_URL}/sinek_s`, status: STATUS, legacy_registry_id: "simon-sinek" },
  pitbull: { recipient_slug: "pitbull", display_name: "Pitbull", tier_class: "media", frame_strategy: "biology-roots-trunk", wave_class: "WORTH-IT", priority: 5, share_link: `${BASE_URL}/pitbull`, status: STATUS, legacy_registry_id: "pitbull" },
  ocasiocortez_a: { recipient_slug: "ocasiocortez_a", display_name: "Alexandria Ocasio-Cortez", tier_class: "cooperative", frame_strategy: "biology-roots-trunk", wave_class: "WORTH-IT", priority: 6, share_link: `${BASE_URL}/ocasiocortez_a`, status: STATUS, legacy_registry_id: "alexandria-ocasio-cortez" },
};

// ─────────────────────────────────────────────────────────
// HANDLER
// ─────────────────────────────────────────────────────────

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  const url = new URL(req.url);
  const slug = (url.searchParams.get("slug") || "").toLowerCase().trim();

  if (!slug) {
    return new Response(
      JSON.stringify({ error: "slug parameter required", example: "?slug=buffett_w" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  const config = WAVE1_REGISTRY[slug];

  if (!config) {
    return new Response(
      JSON.stringify({ error: "recipient not found", slug }),
      { status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify(config),
    { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
  );
});
