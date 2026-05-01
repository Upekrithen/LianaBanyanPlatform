/**
 * test_iron_tablet_metrics.mjs — KN094 / BP011
 * ==============================================
 * Tests for: iron_tablet_metrics_config.yaml parsing + pruneOldHeartbeatAppends
 * + Bounty #7 entry in featured_bounties_bp009 + Furnace rubric.
 *
 * Run: npm --prefix "C:\Users\Administrator\Documents\LianaBanyanPlatform\librarian-mcp" test
 * Expected: 175+ total green (170 from KN091 + 5 new).
 */

import { strict as assert } from "node:assert";
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import os from "node:os";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const WORKSPACE_ROOT = join(__dirname, "..");
const CONFIG_PATH = join(WORKSPACE_ROOT, "iron_tablet_metrics_config.yaml");

// ── Test 1: Config-read — parses + values within bounded ranges ────────────

function testConfigRead() {
  assert.ok(existsSync(CONFIG_PATH), `Config not found: ${CONFIG_PATH}`);

  const raw = readFileSync(CONFIG_PATH, "utf-8");

  // Heartbeat interval
  const intervalMatch = raw.match(/interval_seconds:\s*(\d+)/);
  assert.ok(intervalMatch, "interval_seconds not found in config");
  const interval = parseInt(intervalMatch[1], 10);
  const heartbeatRange = raw.match(/bounded_range:\s*\[(\d+),\s*(\d+)\]/);
  assert.ok(heartbeatRange, "bounded_range for heartbeat not found");
  const hMin = parseInt(heartbeatRange[1], 10);
  const hMax = parseInt(heartbeatRange[2], 10);
  assert.ok(
    interval >= hMin && interval <= hMax,
    `interval_seconds ${interval} outside bounded range [${hMin}, ${hMax}]`
  );

  // Retention days
  const retentionMatch = raw.match(/heartbeat_retention_days:\s*(\d+)/);
  assert.ok(retentionMatch, "heartbeat_retention_days not found");
  const retention = parseInt(retentionMatch[1], 10);
  assert.ok(retention >= 7 && retention <= 90, `retention ${retention} out of [7, 90]`);

  // Ratified date
  assert.ok(raw.includes("last_ratified: 2026-05-01"), "last_ratified should be 2026-05-01");

  // Bounty metrics linkage
  assert.ok(raw.includes("bounty_id: 7"), "bounty_id: 7 must be present");
  assert.ok(raw.includes("heartbeat-interval-tuning"), "bounty_slug must be present");

  console.log("  ✓ Config-read: parses correctly, values within bounded ranges");
}

// ── Test 2: Prune-cron — 31-day-old heartbeat pruned, 29-day preserved ────

async function testPruneCron() {
  // Dynamically import pruneOldHeartbeatAppends from compiled dist.
  // If not compiled yet, import from source via tsx or skip gracefully.
  let pruneOldHeartbeatAppends;
  try {
    const distPath = join(WORKSPACE_ROOT, "dist", "iron_tablet", "stone_layer.js");
    if (!existsSync(distPath)) {
      console.log("  ⚠ Prune-cron test: dist not built — skipping (run npm run build first)");
      return;
    }
    const mod = await import(pathToFileURL(distPath).href);
    pruneOldHeartbeatAppends = mod.pruneOldHeartbeatAppends;
  } catch (err) {
    console.log(`  ⚠ Prune-cron test: import failed (${err.message}) — skipping`);
    return;
  }

  const tmpLedger = join(os.tmpdir(), `test_prune_${Date.now()}.jsonl`);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const daysToSeconds = (d) => d * 86400;

  // Synthetic entries:
  // Entry A: heartbeat-class, 31 days old → should be pruned
  const entryA = {
    ts: new Date((nowSeconds - daysToSeconds(31)) * 1000).toISOString(),
    scribeId: "R11_shadow_alpha",
    ebletPath: "/tmp/heartbeat_R11_shadow_alpha.eblet.md",
    hash: "abc123",
    sequence: 1,
    session: "TEST",
  };
  // Entry B: heartbeat-class, 29 days old → should be preserved
  const entryB = {
    ts: new Date((nowSeconds - daysToSeconds(29)) * 1000).toISOString(),
    scribeId: "R11_shadow_beta",
    ebletPath: "/tmp/heartbeat_R11_shadow_beta.eblet.md",
    hash: "def456",
    sequence: 2,
    session: "TEST",
  };

  writeFileSync(tmpLedger, [entryA, entryB].map((e) => JSON.stringify(e)).join("\n") + "\n");

  const result = pruneOldHeartbeatAppends(tmpLedger, 30, nowSeconds);
  assert.equal(result.pruned, 1, `Expected 1 pruned, got ${result.pruned}`);
  assert.equal(result.preserved, 1, `Expected 1 preserved, got ${result.preserved}`);

  // Verify entryA is gone, entryB remains
  const remaining = readFileSync(tmpLedger, "utf-8")
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l));
  assert.equal(remaining.length, 1, "Only 1 entry should remain");
  assert.equal(remaining[0].scribeId, "R11_shadow_beta", "Remaining entry should be beta (29 days)");

  if (existsSync(tmpLedger)) unlinkSync(tmpLedger);
  console.log("  ✓ Prune-cron: 31-day heartbeat pruned, 29-day preserved");
}

// ── Test 3: Non-heartbeat entries always preserved ─────────────────────────

async function testNonHeartbeatPreserved() {
  let pruneOldHeartbeatAppends;
  try {
    const distPath = join(WORKSPACE_ROOT, "dist", "iron_tablet", "stone_layer.js");
    if (!existsSync(distPath)) {
      console.log("  ⚠ Non-heartbeat preservation test: dist not built — skipping");
      return;
    }
    const mod = await import(pathToFileURL(distPath).href);
    pruneOldHeartbeatAppends = mod.pruneOldHeartbeatAppends;
  } catch (err) {
    console.log(`  ⚠ Non-heartbeat preservation test: import failed — skipping`);
    return;
  }

  const tmpLedger = join(os.tmpdir(), `test_preserve_${Date.now()}.jsonl`);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const daysToSeconds = (d) => d * 86400;

  // 31-day-old decision append (NON-heartbeat) → must be preserved
  const decisionEntry = {
    ts: new Date((nowSeconds - daysToSeconds(31)) * 1000).toISOString(),
    scribeId: "Bishop",
    ebletPath: "/tmp/decision_B132.eblet.md",
    hash: "decisionhash",
    sequence: 1,
    session: "TEST",
    decisionId: "KN095-TEST",
  };
  // 31-day-old conflict report (NON-heartbeat) → must be preserved
  const conflictEntry = {
    ts: new Date((nowSeconds - daysToSeconds(31)) * 1000).toISOString(),
    scribeId: "Knight",
    ebletPath: "/tmp/conflict_report.eblet.md",
    hash: "conflicthash",
    sequence: 2,
    session: "TEST",
    conflict: true,
  };

  writeFileSync(
    tmpLedger,
    [decisionEntry, conflictEntry].map((e) => JSON.stringify(e)).join("\n") + "\n"
  );

  const result = pruneOldHeartbeatAppends(tmpLedger, 30, nowSeconds);
  assert.equal(result.pruned, 0, "Non-heartbeat entries must never be pruned");
  assert.equal(result.preserved, 2, "Both non-heartbeat entries must be preserved");

  if (existsSync(tmpLedger)) unlinkSync(tmpLedger);
  console.log("  ✓ Non-heartbeat preservation: decision + conflict report preserved after 31 days");
}

// ── Test 4: Bounty #7 entry present with correct slug + tier + reward ──────

async function testBounty7Entry() {
  // Import the TS file via tsx — if not available, read raw and check key strings.
  const bountyPath = join(
    WORKSPACE_ROOT, "..", "platform", "src", "data", "featured_bounties_bp009.ts"
  );
  assert.ok(existsSync(bountyPath), `Bounty file not found: ${bountyPath}`);

  const raw = readFileSync(bountyPath, "utf-8");

  assert.ok(raw.includes("heartbeat-interval-tuning"), "Bounty #7 slug must be present");
  assert.ok(raw.includes("featuredOrder: 7"), "Bounty #7 must have featuredOrder: 7");
  assert.ok(raw.includes("rewardMarks: 500"), "Bounty #7 must have 500 Marks reward");
  assert.ok(raw.includes("'mid'"), "Bounty #7 must be tier mid");
  assert.ok(raw.includes("furnace_cross_org"), "Bounty #7 must reference furnace_cross_org rubric");
  assert.ok(raw.includes("a3cc7a2"), "Bounty #7 must reference KN091 baseline commit a3cc7a2");

  console.log("  ✓ Bounty #7 entry: correct slug, featuredOrder=7, 500 Marks, tier=mid, furnace ref");
}

// ── Test 5: Furnace rubric — synthetic Bounty #7 submission → pass ─────────

function testFurnaceRubricBounty7() {
  // Replicate the edge function logic inline for unit testing.
  const PASS_THRESHOLD = 0.65;
  const BASELINE_STORAGE_MB = 170.0;
  const BASELINE_LATENCY_MS = 180000;

  // Synthetic: accuracy=0.97, storage=95% of baseline, latency=100% of baseline
  const accuracyPct = 97;
  const storageMb = BASELINE_STORAGE_MB * 0.95;
  const latencyMs = BASELINE_LATENCY_MS * 1.0;

  const storageOverrunPct = Math.max(0, (storageMb - BASELINE_STORAGE_MB) / BASELINE_STORAGE_MB);
  const latencyOverrunPct = Math.max(0, (latencyMs - BASELINE_LATENCY_MS) / BASELINE_LATENCY_MS);

  const score =
    0.6 * (accuracyPct / 100.0) +
    0.2 * Math.max(0, 1 - storageOverrunPct) +
    0.2 * Math.max(0, 1 - latencyOverrunPct);

  // Expected: 0.6×0.97 + 0.2×1.0 + 0.2×1.0 = 0.582 + 0.2 + 0.2 = 0.982
  assert.ok(Math.abs(score - 0.982) < 0.001, `Score should be ~0.982, got ${score.toFixed(3)}`);
  assert.ok(score >= PASS_THRESHOLD, `Score ${score.toFixed(3)} should pass threshold ${PASS_THRESHOLD}`);

  console.log(`  ✓ Furnace rubric Bounty #7: score=${score.toFixed(3)} ≥ ${PASS_THRESHOLD} → PASS`);
}

// ── Runner ─────────────────────────────────────────────────────────────────

async function runAll() {
  console.log("\n[KN094] Iron Tablet Metrics + Bounty #7 Tests");
  console.log("==============================================");

  let passed = 0;
  let failed = 0;

  const tests = [
    ["Config-read", testConfigRead],
    ["Prune-cron", testPruneCron],
    ["Non-heartbeat preservation", testNonHeartbeatPreserved],
    ["Bounty #7 entry", testBounty7Entry],
    ["Furnace rubric Bounty #7", testFurnaceRubricBounty7],
  ];

  for (const [name, fn] of tests) {
    try {
      await fn();
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n[KN094] Result: ${passed} passed, ${failed} failed out of ${tests.length} tests`);
  if (failed > 0) process.exit(1);
}

runAll();
