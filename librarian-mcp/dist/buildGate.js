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
import { existsSync, readFileSync, unlinkSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * Path to the lock file. When compiled, dist/buildGate.js lives at
 * librarian-mcp/dist/, so parent dir is librarian-mcp/ root.
 */
export const REBUILD_LOCK_PATH = resolve(__dirname, "..", ".rebuild.lock");
/** Slack added to expectedDurationMs before treating an active lock as stale. */
const ACTIVE_SLACK_MS = 10_000;
/**
 * Reads and parses the lock file. Returns null if the file is absent or
 * malformed — callers treat either as "no lock in effect".
 */
export function readRebuildLock(lockPath) {
    if (!existsSync(lockPath))
        return null;
    try {
        const raw = readFileSync(lockPath, "utf-8");
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
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
export function checkRebuildLock(lockPath = REBUILD_LOCK_PATH) {
    const lock = readRebuildLock(lockPath);
    if (!lock)
        return null;
    // ── Phase 2: post-build reload (tsc done, process restarting) ────────────
    if ("status" in lock && lock.status === "post_build_reload") {
        const reloadLock = lock;
        const startMs = new Date(reloadLock.tscCompletedAt).getTime();
        const ageMs = Date.now() - startMs;
        const windowMs = reloadLock.expectedDurationMs + ACTIVE_SLACK_MS;
        if (ageMs < windowMs) {
            return {
                error: "server_rebuilding",
                retry_after_ms: Math.max(0, windowMs - ageMs),
                reason: `MCP process reloading since ${reloadLock.tscCompletedAt}`,
                triggered_by: reloadLock.triggeredBy,
                phase: "reload",
            };
        }
        // Lock is stale (new process never started after expected window).
        return { warning: "stale_lock", age_ms: ageMs };
    }
    // ── Failed build state ───────────────────────────────────────────────────
    if ("status" in lock && lock.status === "failed") {
        return {
            error: "server_build_failed",
            last_error: lock.error,
            since: lock.failedAt,
        };
    }
    // ── Phase 1: active build (tsc running) ──────────────────────────────────
    const active = lock;
    const startMs = new Date(active.startedAt).getTime();
    const ageMs = Date.now() - startMs;
    const windowMs = active.expectedDurationMs + ACTIVE_SLACK_MS;
    if (ageMs < windowMs) {
        return {
            error: "server_rebuilding",
            retry_after_ms: Math.max(0, windowMs - ageMs),
            reason: `MCP rebuild in progress since ${active.startedAt}`,
            triggered_by: active.triggeredBy,
            phase: "tsc",
        };
    }
    // Age has exceeded the window → stale lock (crashed build, no cleanup).
    return {
        warning: "stale_lock",
        age_ms: ageMs,
    };
}
/**
 * Called from server.ts main() after server.connect(transport) completes.
 * If a post_build_reload lock exists, deletes it — signalling that the new
 * MCP process is now ready to handle tool calls. No-op if no such lock exists.
 */
export function clearPostBuildReloadLock(lockPath = REBUILD_LOCK_PATH) {
    const lock = readRebuildLock(lockPath);
    if (!lock)
        return;
    if ("status" in lock && lock.status === "post_build_reload") {
        try {
            unlinkSync(lockPath);
            console.error("[build-gate] post_build_reload lock cleared. Server is ready.");
        }
        catch {
            // Ignore — race condition if another process cleared it first.
        }
    }
}
//# sourceMappingURL=buildGate.js.map
