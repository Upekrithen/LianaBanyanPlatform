/**
 * buildGate.ts — K448(B118): MCP build-window crossfire gate
 * ===========================================================
 * Reads librarian-mcp/.rebuild.lock to determine whether the MCP server is
 * currently mid-rebuild. Called by every tool handler via the registerTool()
 * wrapper in server.ts before any handler logic runs.
 *
 * Incident context (B118): Bishop called mcp__librarian__run_session_start
 * during a Knight tsc rebuild of src/server.ts. The MCP process was in an
 * inconsistent state and hung silently for ~90s. This module turns that
 * silent hang into a structured error with a retry_after_ms signal.
 *
 * Lock file location: librarian-mcp/.rebuild.lock
 * Written by: scripts/build-guarded.mjs
 * Gitignored: yes (listed in librarian-mcp/.gitignore)
 *
 * Two-phase lock lifecycle (K448 addendum):
 *   Phase 1 "tsc":          Active build → lock has { pid, startedAt, expectedDurationMs, triggeredBy }
 *   Phase 2 "post_build_reload": tsc succeeded, K441 reloading → lock has { status:"post_build_reload", ... }
 *   Cleared:                 New MCP process starts, calls clearPostBuildReloadLock() in main()
 */
/**
 * Path to the lock file. When compiled, dist/buildGate.js lives at
 * librarian-mcp/dist/, so parent dir is librarian-mcp/ root.
 */
export declare const REBUILD_LOCK_PATH: string;
/** Shape of the lock file while a build is actively running (phase: "tsc"). */
export interface RebuildLockActive {
    pid: number;
    startedAt: string;
    expectedDurationMs: number;
    triggeredBy: string;
}
/** Shape written after tsc succeeds but before the new MCP process is ready (phase: "reload"). */
export interface RebuildLockPostBuildReload {
    status: "post_build_reload";
    pid: number;
    tscCompletedAt: string;
    expectedDurationMs: number;
    triggeredBy: string;
}
/** Shape of the lock file after a build failed without cleanup. */
export interface RebuildLockFailed {
    status: "failed";
    error: string;
    failedAt: string;
}
export type RebuildLock = RebuildLockActive | RebuildLockPostBuildReload | RebuildLockFailed;
/** Returned by checkRebuildLock() when the dispatcher should block the call. */
export type BuildGateBlock = {
    error: "server_rebuilding";
    retry_after_ms: number;
    reason: string;
    triggered_by: string;
    /** "tsc" = compiler running; "reload" = tsc done, process restarting */
    phase: "tsc" | "reload";
} | {
    error: "server_build_failed";
    last_error: string;
    since: string;
};
/** Returned when the lock is stale: dispatcher should proceed but log. */
export interface BuildGateStaleWarning {
    warning: "stale_lock";
    age_ms: number;
}
/**
 * What checkRebuildLock() can return:
 *  - null                 → no lock file; proceed normally
 *  - BuildGateBlock       → caller must return error to client
 *  - BuildGateStaleWarning → lock is stale (crashed build); caller should log
 *                            and proceed
 */
export type BuildGateResult = BuildGateBlock | BuildGateStaleWarning | null;
/**
 * Reads and parses the lock file. Returns null if the file is absent or
 * malformed — callers treat either as "no lock in effect".
 */
export declare function readRebuildLock(lockPath: string): RebuildLock | null;
/**
 * Core dispatcher gate.
 *
 * @param lockPath  Path to the lock file (defaults to REBUILD_LOCK_PATH).
 *                  Override in tests to use a temp path.
 * @returns  null if tool call should proceed;
 *           BuildGateBlock if tool call should be rejected with a structured error;
 *           BuildGateStaleWarning if the lock is stale and tool should proceed
 *           (but caller should emit a console.error warning).
 */
export declare function checkRebuildLock(lockPath?: string): BuildGateResult;
/**
 * Called from server.ts main() after server.connect(transport) completes.
 * If a post_build_reload lock exists, deletes it — signalling that the new
 * MCP process is now ready to handle tool calls. No-op if no such lock exists.
 */
export declare function clearPostBuildReloadLock(lockPath?: string): void;
