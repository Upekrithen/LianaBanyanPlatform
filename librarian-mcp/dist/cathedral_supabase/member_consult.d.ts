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
export declare function memberConsultScribes(input: MemberConsultInput): Promise<MemberConsultResult | MemberConsultError>;
