/**
 * iron-tablet-prune-cron.mjs — KN094 / BP011
 * ===========================================
 * Reads iron_tablet_metrics_config.yaml → invokes pruneOldHeartbeatAppends
 * on all Stone Tablet ledger files under ~/.claude/state/.
 *
 * Scheduled: 04:00 UTC daily (cron_schedule: "0 4 * * *").
 *
 * Manual fire:  node librarian-mcp/scripts/iron-tablet-prune-cron.mjs
 * Task scheduler: install-task-scheduler.ps1 (Windows); crontab (Linux/macOS).
 *
 * Constitutional: non-heartbeat entries (decisions, conflict reports,
 * cohort_holding signals) are NEVER pruned regardless of age.
 * See stone_layer.ts pruneOldHeartbeatAppends for invariant enforcement.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import os from "node:os";

// ── Config loading ─────────────────────────────────────────────────────────

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const WORKSPACE_ROOT = resolve(__dirname, "..");
const CONFIG_PATH = join(WORKSPACE_ROOT, "iron_tablet_metrics_config.yaml");

function loadConfig() {
  if (!existsSync(CONFIG_PATH)) {
    console.error(`[prune-cron] Config not found: ${CONFIG_PATH}`);
    process.exit(1);
  }
  const raw = readFileSync(CONFIG_PATH, "utf-8");
  // Minimal YAML parser for the fields we need (avoids full yaml dep).
  const match = raw.match(/heartbeat_retention_days:\s*(\d+)/);
  const retentionDays = match ? parseInt(match[1], 10) : 30;

  const rangeMatch = raw.match(/bounded_range:\s*\[(\d+),\s*(\d+)\]/);
  const min = rangeMatch ? parseInt(rangeMatch[1], 10) : 7;
  const max = rangeMatch ? parseInt(rangeMatch[2], 10) : 90;

  // Enforce bounded range
  const clamped = Math.min(Math.max(retentionDays, min), max);
  if (clamped !== retentionDays) {
    console.warn(
      `[prune-cron] heartbeat_retention_days ${retentionDays} out of bounds [${min}, ${max}]; clamping to ${clamped}`
    );
  }
  return { retentionDays: clamped, min, max };
}

// ── Ledger discovery ───────────────────────────────────────────────────────

const LEDGER_FILENAME = "iron_tablet_ledger.jsonl";
const STATE_ROOT = join(os.homedir(), ".claude", "state");

/**
 * Walk ~/.claude/state/ recursively to find all iron_tablet_ledger.jsonl files.
 * Shadow-class ledgers live at ~/.claude/state/federation/ and similar paths.
 */
function findAllLedgers(dir) {
  const ledgers = [];
  if (!existsSync(dir)) return ledgers;
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        ledgers.push(...findAllLedgers(fullPath));
      } else if (entry.name === LEDGER_FILENAME) {
        ledgers.push(fullPath);
      }
    }
  } catch {
    // Skip unreadable dirs.
  }
  return ledgers;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const { retentionDays } = loadConfig();
  console.log(`[prune-cron] Starting. retentionDays=${retentionDays}`);

  // Dynamic import — stone_layer is ESM TypeScript compiled to JS.
  let pruneOldHeartbeatAppends;
  try {
    const distPath = join(WORKSPACE_ROOT, "dist", "iron_tablet", "stone_layer.js");
    const mod = await import(distPath);
    pruneOldHeartbeatAppends = mod.pruneOldHeartbeatAppends;
  } catch (err) {
    console.error(`[prune-cron] Could not load stone_layer from dist: ${err.message}`);
    console.error("[prune-cron] Run 'npm run build' in librarian-mcp first.");
    process.exit(1);
  }

  const ledgers = findAllLedgers(STATE_ROOT);
  console.log(`[prune-cron] Found ${ledgers.length} ledger(s) under ${STATE_ROOT}`);

  let totalPruned = 0;
  let totalPreserved = 0;

  for (const ledgerPath of ledgers) {
    const result = pruneOldHeartbeatAppends(ledgerPath, retentionDays);
    console.log(
      `[prune-cron] ${ledgerPath}: pruned=${result.pruned} preserved=${result.preserved}`
    );
    totalPruned += result.pruned;
    totalPreserved += result.preserved;
  }

  const ts = new Date().toISOString();
  console.log(
    `[prune-cron] DONE ${ts} — total pruned=${totalPruned} preserved=${totalPreserved} retentionDays=${retentionDays}`
  );
}

main().catch((err) => {
  console.error("[prune-cron] Fatal:", err);
  process.exit(1);
});
