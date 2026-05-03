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
import { createClient } from "@supabase/supabase-js";
let cachedClient = undefined;
let lastConfigError = null;
function readEnv() {
    const url = process.env.LIBRARIAN_SUPABASE_URL ||
        process.env.SUPABASE_URL ||
        process.env.VITE_SUPABASE_URL ||
        null;
    const key = process.env.LIBRARIAN_SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        null;
    const missing = [];
    if (!url)
        missing.push("LIBRARIAN_SUPABASE_URL (or SUPABASE_URL / VITE_SUPABASE_URL)");
    if (!key)
        missing.push("LIBRARIAN_SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_ROLE_KEY)");
    return { url, key, missing };
}
/**
 * Returns a Supabase client bound to the `cathedral` schema, or null if
 * the environment isn't configured. Idempotent: cached after first call.
 *
 * IMPORTANT: callers MUST handle the null return path with a clear error
 * message — never throw and never crash the MCP server process.
 */
export function getCathedralClient() {
    if (cachedClient !== undefined)
        return cachedClient ?? null;
    const { url, key, missing } = readEnv();
    if (!url || !key) {
        lastConfigError =
            `librarian-mcp Supabase client not configured. Missing env: ${missing.join(", ")}. ` +
                `Set these in your MCP server env (e.g. ~/.cursor/mcp.json env block) or ` +
                `Asteroid-ProofVault/LockBox/DOUBLESECRET.env, then restart the MCP server.`;
        cachedClient = null;
        return null;
    }
    try {
        cachedClient = createClient(url, key, {
            db: { schema: "cathedral" },
            auth: { persistSession: false, autoRefreshToken: false },
        });
        lastConfigError = null;
        return cachedClient;
    }
    catch (err) {
        lastConfigError = `Supabase createClient failed: ${err.message}`;
        cachedClient = null;
        return null;
    }
}
/** Returns the last configuration error message, or null if the client is healthy. */
export function getCathedralClientError() {
    return lastConfigError;
}
/**
 * Test-only seam: replace the cached client with a stub (or reset to
 * undefined to force re-init from env). Production code must not call this.
 */
export function __setCathedralClientForTest(client) {
    cachedClient = client;
    lastConfigError = client === null ? "test injection: client set to null" : null;
}
//# sourceMappingURL=client.js.map
