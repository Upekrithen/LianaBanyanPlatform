import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Slow Blade rate-limit: max 30 reads per minute per user
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// Known substrate ledger paths by Bushel (server-side manifest — not exposed raw to client)
const SUBSTRATE_LEDGER_MANIFEST: Record<string, { path: string; bushelId: string; label: string }[]> = {
  bushel_1: [
    { path: "~/.claude/state/reckoning/knight_1_economics_currency.synthesis.jsonl", bushelId: "bushel_1", label: "Knight 1 — Economics" },
    { path: "~/.claude/state/reckoning/knight_7_eblets_memory.synthesis.jsonl", bushelId: "bushel_1", label: "Knight 7 — Eblets/Memory" },
  ],
  bushel_2: [
    { path: "~/.claude/state/bushel_2/synthesis.jsonl", bushelId: "bushel_2", label: "Bushel 2 Synthesis" },
  ],
  bushel_7: [
    { path: "~/.claude/state/bushel_7/aggregate_scorecard.jsonl", bushelId: "bushel_7", label: "Bushel 7 Scorecard" },
    { path: "~/.claude/state/bushel_7/AUDIT_METHODOLOGY_CORRIGENDUM_BP021.json", bushelId: "bushel_7", label: "Audit Corrigendum" },
  ],
  bushel_8: [
    { path: "~/.claude/state/bushel_8/build_manifest.json", bushelId: "bushel_8", label: "Bushel 8 Build Manifest" },
  ],
  canon: [
    { path: "~/.claude/state/eblets/CANON/substrate_as_immutable_backup_pyramid_indexed_canon_bp020.eblet.md", bushelId: "canon", label: "Substrate-As-Immutable-Backup Canon" },
    { path: "~/.claude/state/eblets/CANON/brittle_vs_fluid_librarian_by_cohort_class_canon_bp016.eblet.md", bushelId: "canon", label: "Brittle vs Fluid Canon" },
    { path: "~/.claude/state/eblets/CANON/lb_frame_ai_agnostic_platform_principle_bp021.eblet.md", bushelId: "canon", label: "AI-Agnostic Principle Canon" },
  ],
};

// ACL filter: which entries is this cohort class allowed to see?
function filterEntriesByCohort(
  cohortClass: string,
  aclPaths: string[],
): typeof SUBSTRATE_LEDGER_MANIFEST[string] {
  const all = Object.values(SUBSTRATE_LEDGER_MANIFEST).flat();
  return all.filter((entry) =>
    aclPaths.some((allowedPath) => entry.path.startsWith(allowedPath))
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!checkRateLimit(user.id)) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Max 30 reads/min." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve cohort class
    const { data: cohortData, error: cohortError } = await supabase
      .rpc("resolve_cohort_class", { p_user_id: user.id });
    const cohortClass: string = cohortData ?? "lone_wolf";

    // Get ACL
    const { data: aclData } = await supabase
      .rpc("get_substrate_acl", { p_cohort_class: cohortClass });
    const acl = aclData?.[0];
    const allowedPaths: string[] = acl?.can_read_paths ?? ["~/.claude/state/eblets/CANON/"];

    // Filter entries
    const visibleEntries = filterEntriesByCohort(cohortClass, allowedPaths);

    // Build response — stream JSONL lines
    const lines = visibleEntries.map((entry) =>
      JSON.stringify({
        path: entry.path,
        bushelId: entry.bushelId,
        label: entry.label,
        cohortClass,
        ts: new Date().toISOString(),
        acl: {
          can_read_codex: acl?.can_read_codex ?? false,
          can_read_bushel_reports: acl?.can_read_bushel_reports ?? false,
          can_read_substrate_health: acl?.can_read_substrate_health ?? false,
          can_read_recovery_pane: acl?.can_read_recovery_pane ?? false,
        },
      })
    );

    return new Response(lines.join("\n") + "\n", {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/x-ndjson",
        "X-Cohort-Class": cohortClass,
        "X-Entry-Count": String(lines.length),
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
