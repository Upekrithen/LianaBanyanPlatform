/**
 * member_consult_scribes (K438b Phase C)
 * ======================================
 * Supabase-backed Cathedral consult, the per-member sibling of K436's
 * `consult_scribes` (which reads from the in-repo stitchpunks tablets).
 *
 * Pipeline:
 *   1. Fetch the member's active Scribes (cathedral.member_scribes WHERE
 *      member_id = $1 AND active = true).
 *   2. If include_shared, also fetch shared Scribes from OTHER members at
 *      share_level IN ('guild','tribe','commons'). The cross-member
 *      Guild/Tribe membership join is staged inert in K438a's RLS
 *      (`ms_guild_tribe_select` AND false) — for K438b we read those rows
 *      via the service-role client + an explicit predicate, with a
 *      conservative default that excludes 'guild'/'tribe' until the
 *      group-membership tables land in K438c. 'commons' is always shared.
 *   3. Score each candidate Scribe against the query using the same
 *      primary*1.0 + adjacent*0.5 weighting as registry.scoreScribe (so
 *      Bishop's stitchpunks consult and member's Cathedral consult share
 *      the same retrieval algorithm — #2270 Claim 1(c)).
 *   4. For each Scribe with score > 0, fetch the most recent N entries
 *      from cathedral.scribe_entries (filtered by scribe_id, optionally
 *      since_ts; for shared Scribes also filtered by `shared = true`).
 *   5. Rank entries by Scribe relevance (own first, then shared) and
 *      return up to top_k.
 *
 * Performance notes:
 *   - One round-trip to fetch Scribe rows (small; ≤ ~50 per member).
 *   - One bulk round-trip to fetch entries via .in('scribe_id', […]) so
 *     we don't N+1 across Scribes. We then partition + cap per Scribe
 *     in-process before assembling the response.
 *   - Target latency: p95 < 500ms for a typical 5-15 Scribe Cathedral.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getCathedralClient,
  getCathedralClientError,
  type MemberScribeRow,
  type ScribeEntryRow,
} from "./client.js";
import { scoreScribeAgainstThemes } from "./scoring.js";

export interface MemberConsultEntry {
  scribe_id: string;
  scribe_name: string;
  observation: string;
  ts: string;
  source: string;
  canonical_ref: string | null;
  tags: string[];
  relevance_score: number;
  is_own: boolean;
  shared_level: string;
}

export interface MemberConsultResult {
  ok: true;
  member_id: string;
  query: string;
  scribes_consulted: Array<{
    scribe_id: string;
    scribe_name: string;
    score: number;
    is_own: boolean;
    is_primary: boolean;
    entries_returned: number;
  }>;
  entries: MemberConsultEntry[];
  truncated: boolean;
  elapsed_ms: number;
}

export interface MemberConsultError {
  ok: false;
  error: string;
  hint?: string;
}

export interface MemberConsultInput {
  member_id: string;
  query: string;
  top_k?: number;
  since_ts?: string;
  include_shared?: boolean;
  /** Test seam: inject a stubbed Supabase client. Production callers omit. */
  client?: SupabaseClient;
}

/**
 * #2270 Claim 1(c) primary-first retrieval. The per-Scribe entry cap
 * keeps any one specialist from monopolising the response when the query
 * matches several Scribes' adjacent fields equally.
 */
const PER_SCRIBE_ENTRY_CAP = 5;

export async function memberConsultScribes(
  input: MemberConsultInput,
): Promise<MemberConsultResult | MemberConsultError> {
  const t0 = Date.now();

  const client = input.client ?? getCathedralClient();
  if (!client) {
    return {
      ok: false,
      error: "supabase_not_configured",
      hint:
        getCathedralClientError() ||
        "Cathedral Supabase client unavailable. See librarian-mcp/src/cathedral_supabase/client.ts.",
    };
  }

  if (!isUuid(input.member_id)) {
    return { ok: false, error: "invalid_member_id", hint: "member_id must be a UUID." };
  }

  const top_k = clamp(input.top_k ?? 10, 1, 50);
  const include_shared = input.include_shared ?? true;

  // 1. Fetch member's own active Scribes.
  const ownRes = await client
    .from("member_scribes")
    .select(
      "scribe_id, member_id, name, primary_field, adjacents, keywords, active, share_level, share_target_id, created_at, updated_at",
    )
    .eq("member_id", input.member_id)
    .eq("active", true);
  if (ownRes.error) {
    return { ok: false, error: "member_scribes_query_failed", hint: ownRes.error.message };
  }
  const ownScribes = (ownRes.data ?? []) as MemberScribeRow[];

  // 2. Fetch shared Scribes from other members (commons by default; guild/tribe
  //    deferred to K438c when the membership join exists).
  let sharedScribes: MemberScribeRow[] = [];
  if (include_shared) {
    const sharedRes = await client
      .from("member_scribes")
      .select(
        "scribe_id, member_id, name, primary_field, adjacents, keywords, active, share_level, share_target_id, created_at, updated_at",
      )
      .eq("active", true)
      .eq("share_level", "commons")
      .neq("member_id", input.member_id);
    if (sharedRes.error) {
      return { ok: false, error: "shared_scribes_query_failed", hint: sharedRes.error.message };
    }
    sharedScribes = (sharedRes.data ?? []) as MemberScribeRow[];
  }

  // 3. Score every candidate. Treat the query as the single theme — Lachesis
  //    handles substring matching in both directions for keyword tolerance.
  const themes = [input.query];
  type Ranked = {
    scribe: MemberScribeRow;
    score: number;
    primaryMatches: string[];
    adjacentMatches: string[];
    is_own: boolean;
  };
  const ranked: Ranked[] = [];
  for (const s of ownScribes) {
    const r = scoreScribeAgainstThemes(s, themes);
    if (r.score > 0) ranked.push({ scribe: s, ...r, is_own: true });
  }
  for (const s of sharedScribes) {
    const r = scoreScribeAgainstThemes(s, themes);
    if (r.score > 0) ranked.push({ scribe: s, ...r, is_own: false });
  }
  // Member's own Scribes always rank ahead of equivalent-score shared Scribes
  // (#2268 promise: a member's own specialists are never crowded out by
  // commons noise on their own queries).
  ranked.sort((a, b) => {
    if (a.is_own !== b.is_own) return a.is_own ? -1 : 1;
    return b.score - a.score;
  });

  if (ranked.length === 0) {
    return {
      ok: true,
      member_id: input.member_id,
      query: input.query,
      scribes_consulted: [],
      entries: [],
      truncated: false,
      elapsed_ms: Date.now() - t0,
    };
  }

  // 4. Bulk-fetch entries for ranked Scribes in one round-trip.
  const ownScribeIds = new Set(ranked.filter((r) => r.is_own).map((r) => r.scribe.scribe_id));
  const sharedScribeIds = new Set(ranked.filter((r) => !r.is_own).map((r) => r.scribe.scribe_id));
  const allScribeIds = [...ownScribeIds, ...sharedScribeIds];

  let entriesQuery = client
    .from("scribe_entries")
    .select(
      "entry_id, scribe_id, member_id, ts, session_id, observation, source, canonical_ref, tags, shared_level, shared",
    )
    .in("scribe_id", allScribeIds)
    .order("ts", { ascending: false })
    // Generous over-fetch so per-Scribe capping has fresh entries to choose from.
    .limit(top_k * 5 + PER_SCRIBE_ENTRY_CAP * allScribeIds.length);

  if (input.since_ts) {
    entriesQuery = entriesQuery.gt("ts", input.since_ts);
  }
  const entriesRes = await entriesQuery;
  if (entriesRes.error) {
    return { ok: false, error: "scribe_entries_query_failed", hint: entriesRes.error.message };
  }
  const allEntries = (entriesRes.data ?? []) as ScribeEntryRow[];

  // 5. Partition by Scribe, drop entries from shared Scribes that aren't
  //    materialized as shared (defense in depth; RLS already enforces this
  //    for non-service-role callers).
  const byScribe = new Map<string, ScribeEntryRow[]>();
  for (const e of allEntries) {
    if (sharedScribeIds.has(e.scribe_id) && !e.shared) continue;
    const arr = byScribe.get(e.scribe_id) ?? [];
    if (arr.length < PER_SCRIBE_ENTRY_CAP) arr.push(e);
    byScribe.set(e.scribe_id, arr);
  }

  // 6. Assemble response in Scribe-rank order, capping at top_k entries.
  const scribesConsulted: MemberConsultResult["scribes_consulted"] = [];
  const entries: MemberConsultEntry[] = [];
  for (const r of ranked) {
    if (entries.length >= top_k) break;
    const ents = byScribe.get(r.scribe.scribe_id) ?? [];
    if (ents.length === 0) continue;
    const taken = ents.slice(0, Math.max(0, top_k - entries.length));
    for (const e of taken) {
      entries.push({
        scribe_id: r.scribe.scribe_id,
        scribe_name: r.scribe.name,
        observation: e.observation,
        ts: e.ts,
        source: e.source,
        canonical_ref: e.canonical_ref,
        tags: e.tags ?? [],
        relevance_score: round2(r.score),
        is_own: r.is_own,
        shared_level: e.shared_level,
      });
    }
    scribesConsulted.push({
      scribe_id: r.scribe.scribe_id,
      scribe_name: r.scribe.name,
      score: round2(r.score),
      is_own: r.is_own,
      is_primary: r.primaryMatches.length > 0,
      entries_returned: taken.length,
    });
  }

  return {
    ok: true,
    member_id: input.member_id,
    query: input.query,
    scribes_consulted: scribesConsulted,
    entries,
    truncated: entries.length >= top_k,
    elapsed_ms: Date.now() - t0,
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
