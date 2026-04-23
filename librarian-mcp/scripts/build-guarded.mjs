#!/usr/bin/env node
/**
 * build-guarded.mjs — K448(B118): lock-writing build wrapper
 * ===========================================================
 * Wraps `tsc` (or BUILD_TSC_CMD override) with a .rebuild.lock file so
 * the dispatcher gate in src/server.ts can surface a structured error
 * to concurrent tool callers instead of silently hanging.
 *
 * Usage:
 *   npm run build-guarded          ← normal use; always prefer over raw build
 *   BUILD_TSC_CMD="node -e 'process.exit(0)'" node scripts/build-guarded.mjs
 *                                  ← test/CI override
 *
 * Lock lifecycle:
 *   1. On start: write .rebuild.lock with { pid, startedAt, expectedDurationMs, triggeredBy }
 *      If a lock already exists and is older than STALE_THRESHOLD_MS, warn + overwrite.
 *   2. On tsc success: delete .rebuild.lock
 *   3. On tsc failure: rewrite .rebuild.lock with { status:"failed", error, failedAt }
 *
 * The lock path is librarian-mcp/.rebuild.lock (gitignored).
 * Clients (Bishop, Knight, Cursor) should honor retry_after_ms from the
 * dispatcher's server_rebuilding response.
 */

import { existsSync, writeFileSync, unlinkSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = resolve(__dirname, "..");           // librarian-mcp/
const LOCK_PATH = resolve(ROOT, ".rebuild.lock");
const EXPECTED_DURATION_MS = 30_000;             // 30s covers tsc (~10-15s) + K441 reload startup
const STALE_THRESHOLD_MS = 60_000;               // 60s: lock older than this = crashed build

// ── Helpers ──────────────────────────────────────────────────────────────────

function writeLock(data) {
  writeFileSync(LOCK_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function removeLock() {
  if (existsSync(LOCK_PATH)) {
    try { unlinkSync(LOCK_PATH); } catch { /* ignore race condition on delete */ }
  }
}

function log(msg) {
  process.stderr.write(`[build-guarded] ${msg}\n`);
}

// ── Stale lock check ─────────────────────────────────────────────────────────

if (existsSync(LOCK_PATH)) {
  let staleMsgSuffix = "";
  try {
    const existing = JSON.parse(readFileSync(LOCK_PATH, "utf-8"));
    const refTime = existing.startedAt ?? existing.failedAt;
    if (refTime) {
      const ageMs = Date.now() - new Date(refTime).getTime();
      staleMsgSuffix = ` (age ${Math.round(ageMs / 1000)}s)`;
      if (ageMs > STALE_THRESHOLD_MS) {
        log(`Stale .rebuild.lock found${staleMsgSuffix}. Previous build crashed without cleanup. Overwriting.`);
      } else {
        log(`.rebuild.lock already exists${staleMsgSuffix}. Overwriting.`);
      }
    } else {
      log("Malformed .rebuild.lock (no timestamp). Overwriting.");
    }
  } catch {
    log("Could not parse existing .rebuild.lock. Overwriting.");
  }
}

// ── Write fresh lock ──────────────────────────────────────────────────────────

const triggeredBy =
  process.env.npm_lifecycle_script ??
  process.env.npm_lifecycle_event ??
  "build-guarded";

writeLock({
  pid: process.pid,
  startedAt: new Date().toISOString(),
  expectedDurationMs: EXPECTED_DURATION_MS,
  triggeredBy,
});

log(`Lock written (pid=${process.pid}, expectedDurationMs=${EXPECTED_DURATION_MS}). Running tsc...`);

// ── Run tsc (or override) ─────────────────────────────────────────────────────

const tscCmd = process.env.BUILD_TSC_CMD ?? "npx tsc";

try {
  execSync(tscCmd, { cwd: ROOT, stdio: "inherit" });

  // Two-phase lock lifecycle (K448 addendum):
  // Don't delete the lock yet. Rewrite it to "post_build_reload" so the
  // dispatcher gate continues to block tool calls during the K441 auto-reload
  // window (typically 2-5s) before the new MCP process is ready.
  // The new process clears this lock in main() via clearPostBuildReloadLock().
  writeLock({
    status: "post_build_reload",
    pid: process.pid,
    tscCompletedAt: new Date().toISOString(),
    expectedDurationMs: 10_000,
    triggeredBy,
  });
  log("Build succeeded. post_build_reload lock written. MCP startup will clear it once the new process is ready.");
  process.exit(0);
} catch (err) {
  const rawMsg = err?.message ?? String(err);
  // Keep the error message compact — strip noisy node path lines
  const errorMsg = rawMsg.slice(0, 500);

  writeLock({
    status: "failed",
    error: errorMsg,
    failedAt: new Date().toISOString(),
  });

  log("Build FAILED. Lock updated with failure state.");
  log("Clients calling MCP tools will receive { error: 'server_build_failed' } until a successful build clears this.");
  process.exit(1);
}
