/**
 * Supabase client for the librarian-mcp Cathedral surface (K438b)
 * ===============================================================
 * Singleton service-role client used by the member-scoped MCP tools
 * (`member_consult_scribes`, `member_fates_route`).
 *
 * Why service role + explicit `member_id` filtering rather than user-JWT
 * pass-through:
 *   The librarian-mcp runs as a local process attached to the Founder's
 *   MCP client (Claude Desktop, Cursor, etc.). It has no incoming
 *   request/JWT context — it's a Stdio transport. So we can't borrow a
 *   member's session credentials at tool call time.
 *
 *   Instead, every tool requires `member_id` as an explicit parameter and
 *   the tool body filters every query by `member_id = $arg`. RLS still
 *   protects against any direct PostgREST access from the public internet
 *   (where users only have anon/JWT keys). The MCP path is a back-channel
 *   convenience surface; the access boundary lives in the tool layer.
 *
 * This is documented in the K438b prompt under "Access-control" — the tool
 * is callable by any authenticated MCP client but the access discipline
 * (member_id correctness) is on the caller.
 *
 * Env vars (any one pair works, in priority order):
 *   1. LIBRARIAN_SUPABASE_URL          + LIBRARIAN_SUPABASE_SERVICE_ROLE_KEY
 *   2. SUPABASE_URL                    + SUPABASE_SERVICE_ROLE_KEY
 *   3. VITE_SUPABASE_URL               + SUPABASE_SERVICE_ROLE_KEY
 *
 * If neither pair is fully populated, getCathedralClient() returns null
 * and tools surface a clear, actionable error instead of crashing the
 * whole MCP process. (Other librarian tools — get_system_overview,
 * brief_me, etc. — must keep working even without Supabase configured.)
 */
import { type SupabaseClient } from "@supabase/supabase-js";
type AnySupabase = SupabaseClient<any, any, any>;
/**
 * Returns a Supabase client bound to the `cathedral` schema, or null if
 * the environment isn't configured. Idempotent: cached after first call.
 *
 * IMPORTANT: callers MUST handle the null return path with a clear error
 * message — never throw and never crash the MCP server process.
 */
export declare function getCathedralClient(): AnySupabase | null;
/** Returns the last configuration error message, or null if the client is healthy. */
export declare function getCathedralClientError(): string | null;
/**
 * Test-only seam: replace the cached client with a stub (or reset to
 * undefined to force re-init from env). Production code must not call this.
 */
export declare function __setCathedralClientForTest(client: AnySupabase | null | undefined): void;
export type ShareLevel = "private" | "guild" | "tribe" | "commons";
export type ScribeAdjacent = {
    level: number;
    field: string;
};
export interface MemberScribeRow {
    scribe_id: string;
    member_id: string;
    name: string;
    primary_field: string;
    adjacents: ScribeAdjacent[];
    keywords: string[];
    active: boolean;
    share_level: ShareLevel;
    share_target_id: string | null;
    created_at: string;
    updated_at: string;
}
export interface ScribeEntryRow {
    entry_id: string;
    scribe_id: string;
    member_id: string;
    ts: string;
    session_id: string | null;
    observation: string;
    source: string;
    canonical_ref: string | null;
    tags: string[];
    shared_level: ShareLevel;
    shared: boolean;
}
export interface FatesLogInsert {
    member_id: string;
    session_id: string | null;
    content_hash: string;
    themes: unknown;
    scores: unknown;
    dispatches: unknown;
    coverage_gaps: unknown;
}
export {};
