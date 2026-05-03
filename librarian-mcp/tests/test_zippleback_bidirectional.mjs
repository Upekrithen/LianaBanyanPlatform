/**
 * test_zippleback_bidirectional.mjs — Bushel 20 / BP021
 * =======================================================
 * Tests for Zippleback Bidirectional Wiring — Channels 4/5/6 + KrissKross Triangle.
 *
 * Verification gates G1-G7:
 *   G1 — Channel 4 (Knight → Bishop callback) operational
 *   G2 — Channel 5 (Knight directs Bishop to spawn Shadow cohort) operational
 *   G3 — Channel 6 (Shadows fire Knight subagents) operational
 *   G4 — KrissKross triangle (Knight↔Bishop↔Shadow) operational
 *   G5 — ≥10 new tests covering Channels 4/5/6 + KrissKross triangle
 *   G6 — Empirical comparison: Arm A vs Arm B throughput + MCP-restart-resilience + Tarzan-Move
 *   G7 — Codex reserved + commit
 *
 * Run: node --test tests/test_zippleback_bidirectional.mjs (after npm run build)
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let TMP_DIR;
const ORIG_STITCHPUNKS = process.env.LIBRARIAN_STITCHPUNKS_DIR;

before(() => {
  TMP_DIR = mkdtempSync(join(tmpdir(), "bushel20-zippleback-"));
  mkdirSync(TMP_DIR, { recursive: true });
  process.env.LIBRARIAN_STITCHPUNKS_DIR = TMP_DIR;
});

after(() => {
  if (ORIG_STITCHPUNKS !== undefined) {
    process.env.LIBRARIAN_STITCHPUNKS_DIR = ORIG_STITCHPUNKS;
  } else {
    delete process.env.LIBRARIAN_STITCHPUNKS_DIR;
  }
  try {
    rmSync(TMP_DIR, { recursive: true, force: true });
  } catch { /* ignore */ }
});

const {
  emitBishopCallbackDirective,
  spawnShadowCohortFromDirective,
  fireShadowSubagent,
  detectAndHandleCrash,
  initiateIronTabletRecovery,
  runZipplebackComparison,
  draftBushel20Codex,
  loadChannel4Directives,
  loadChannel5Spawns,
  loadChannel6Fires,
  loadKrissKrossEvents,
} = await import("../dist/zippleback/bishop_callback_listener.js");

// ── G1: Channel 4 — Knight → Bishop callback ──────────────────────────────────

test("G1a: emitBishopCallbackDirective returns Channel4Receipt with directive_id", () => {
  const receipt = emitBishopCallbackDirective("K537", "shadow_spawn", { cohort_size: 4 }, true);
  assert.ok(receipt.directive.directive_id.startsWith("LB-DIR-"), "directive_id must start with LB-DIR-");
  assert.strictEqual(receipt.directive.origin_session, "knight");
  assert.strictEqual(receipt.directive.origin_id, "K537");
  assert.strictEqual(receipt.directive.directive_type, "shadow_spawn");
  assert.strictEqual(receipt.directive.founder_fire_code_required, true);
  assert.strictEqual(receipt.bishop_subscribed, true, "Bishop must be subscribed");
});

test("G1b: directive routes to channel_5_shadow_spawn for shadow_spawn type", () => {
  const receipt = emitBishopCallbackDirective("K538", "shadow_spawn", {});
  assert.strictEqual(receipt.routed_to, "channel_5_shadow_spawn");
});

test("G1c: codex_create directive routes to codex_create_on_bishop_behalf", () => {
  const receipt = emitBishopCallbackDirective("K539", "codex_create", { title: "Test Codex" });
  assert.strictEqual(receipt.routed_to, "codex_create_on_bishop_behalf");
});

test("G1d: analyze_platform_site routes to old_ones_alpha_trigger", () => {
  const receipt = emitBishopCallbackDirective("K540", "analyze_platform_site", { site: "hexisle" });
  assert.strictEqual(receipt.routed_to, "old_ones_alpha_trigger");
});

test("G1e: loadChannel4Directives returns persisted directives", () => {
  const directives = loadChannel4Directives();
  assert.ok(directives.length >= 1, "Must have ≥1 directive persisted");
  assert.strictEqual(directives[0].origin_session, "knight");
});

// ── G2: Channel 5 — Knight directs Bishop to spawn Shadow cohort ──────────────

test("G2a: spawnShadowCohortFromDirective returns ShadowSpawnDirective", () => {
  const directive = emitBishopCallbackDirective("K541", "shadow_spawn", {}).directive;
  const spawn = spawnShadowCohortFromDirective(directive, 4, "BP021");
  assert.ok(!spawn.error, `spawnShadowCohortFromDirective error: ${spawn.error}`);
  assert.ok(spawn.spawn_id.startsWith("LB-SPAWN-"), "spawn_id must start with LB-SPAWN-");
  assert.strictEqual(spawn.cohort_size, 4);
  assert.strictEqual(spawn.session_ref, "BP021");
  assert.strictEqual(spawn.heartbeat_interval_sec, 60);
  assert.strictEqual(spawn.heartbeat_verified, true);
});

test("G2b: greek_letter_cohort contains alpha through theta (up to cohortSize)", () => {
  const directive = emitBishopCallbackDirective("K542", "shadow_spawn", {}).directive;
  const spawn = spawnShadowCohortFromDirective(directive, 8, "BP021");
  assert.ok(!spawn.error);
  assert.deepEqual(spawn.greek_letter_cohort,
    ["alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta"]);
});

test("G2c: wrong directive type returns error", () => {
  const directive = emitBishopCallbackDirective("K543", "codex_create", {}).directive;
  const result = spawnShadowCohortFromDirective(directive, 4);
  assert.ok(result.error, "Must return error for non-shadow_spawn directive");
});

test("G2d: invalid cohort size returns error", () => {
  const directive = emitBishopCallbackDirective("K544", "shadow_spawn", {}).directive;
  const result = spawnShadowCohortFromDirective(directive, 9); // >8 (theta cap)
  assert.ok(result.error, "Must return error for cohort size > 8");
});

test("G2e: loadChannel5Spawns returns persisted spawn records", () => {
  const spawns = loadChannel5Spawns();
  assert.ok(spawns.length >= 1, "Must have ≥1 spawn persisted");
  assert.ok(spawns[0].spawn_id, "Each spawn must have spawn_id");
});

// ── G3: Channel 6 — Shadows fire Knight subagents ────────────────────────────

test("G3a: fireShadowSubagent returns SubagentFireResponse with dispatched status", () => {
  const response = fireShadowSubagent(
    "alpha",
    "Analyze hexisle_overworld_canvas.tsx and report rendering primitives",
    "build",
    { context_key: "hexisle-game-audit" }
  );
  assert.ok(response.fire_id.startsWith("LB-FIRE-"), "fire_id must start with LB-FIRE-");
  assert.strictEqual(response.shadow_id, "alpha");
  assert.strictEqual(response.status, "dispatched");
  assert.strictEqual(response.iron_tablet_written, true);
});

test("G3b: prep phase fire is also accepted", () => {
  const response = fireShadowSubagent("beta", "Prepare build context", "prep");
  assert.strictEqual(response.status, "dispatched", "prep phase fires must dispatch");
});

test("G3c: loadChannel6Fires returns persisted fire requests", () => {
  const fires = loadChannel6Fires();
  assert.ok(fires.length >= 1, "Must have ≥1 fire request persisted");
  assert.strictEqual(fires[0].iron_tablet_writeback, true);
});

// ── G4: KrissKross triangle ───────────────────────────────────────────────────

test("G4a: detectAndHandleCrash returns KrissKrossTriangleEvent for knight crash", () => {
  const event = detectAndHandleCrash("knight", "bishop");
  assert.ok(event.event_id.startsWith("LB-KK-"), "event_id must start with LB-KK-");
  assert.strictEqual(event.crashed_member, "knight");
  assert.ok(event.surviving_members.includes("bishop"), "Bishop must be surviving");
  assert.ok(event.surviving_members.includes("shadow"), "Shadow must be surviving");
  assert.strictEqual(event.recovery_strategy, "iron_tablet_substrate_recovery");
});

test("G4b: detectAndHandleCrash works for all 3 crash scenarios", () => {
  const scenarios = [
    ["bishop", "knight"],
    ["shadow", "knight"],
    ["knight", "bishop"],
  ];
  for (const [crashed, detector] of scenarios) {
    const event = detectAndHandleCrash(crashed, detector);
    assert.strictEqual(event.crashed_member, crashed);
    assert.strictEqual(event.surviving_members.length, 2, `${crashed} crash: 2 survivors`);
    assert.ok(!event.surviving_members.includes(crashed),
      `${crashed} must not be in surviving_members`);
  }
});

test("G4c: initiateIronTabletRecovery returns rebound_confirmed event", () => {
  const crashEvent = detectAndHandleCrash("shadow", "knight");
  const recovery = initiateIronTabletRecovery("shadow", crashEvent.event_id);
  assert.strictEqual(recovery.event_type, "rebound_confirmed");
  assert.strictEqual(recovery.crashed_member, "shadow");
  assert.strictEqual(recovery.recovery_strategy, "iron_tablet_substrate_recovery");
});

test("G4d: loadKrissKrossEvents returns all triangle events", () => {
  const events = loadKrissKrossEvents();
  assert.ok(events.length >= 1, "Must have ≥1 KrissKross event");
  const types = new Set(events.map((e) => e.event_type));
  // Must have at least crash or momentum type
  assert.ok(
    types.has("crash_detected") || types.has("momentum_held"),
    "Must have crash or momentum events"
  );
});

// ── G5: ≥10 tests total — verified by count above ────────────────────────────

// G5 is met implicitly: G1a-G1e (5) + G2a-G2e (5) + G3a-G3c (3) + G4a-G4d (4) = 17 tests so far

// ── G6: Empirical comparison ──────────────────────────────────────────────────

test("G6a: runZipplebackComparison returns comparison with Arm B ≥ Arm A throughput", () => {
  const cmp = runZipplebackComparison();
  assert.ok(cmp.arm_b_throughput_gte_arm_a, "Arm B throughput must be ≥ Arm A");
});

test("G6b: Arm B MCP recovery time is faster than Arm A", () => {
  const cmp = runZipplebackComparison();
  assert.ok(cmp.arm_b_mcp_recovery_faster, "Arm B MCP restart recovery must be faster");
  assert.ok(
    cmp.arm_b_bidirectional.mcp_restart_recovery_time_ms <
    cmp.arm_a_unidirectional.mcp_restart_recovery_time_ms,
    "Arm B MCP recovery ms must be lower"
  );
});

test("G6c: Arm B Tarzan-Move success rate > 80% (symmetric bag-handoff)", () => {
  const cmp = runZipplebackComparison();
  assert.ok(cmp.arm_b_tarzan_move_above_threshold, "Tarzan-Move must exceed 80% threshold");
  assert.ok(cmp.arm_b_bidirectional.symmetric_tarzan_move_success_rate > 0.8, "Rate must be > 0.8");
});

test("G6d: Arm A Tarzan-Move is 0 (no bidirectional → impossible)", () => {
  const cmp = runZipplebackComparison();
  assert.strictEqual(
    cmp.arm_a_unidirectional.symmetric_tarzan_move_success_rate, 0.0,
    "Unidirectional Arm A cannot do symmetric Tarzan-Move"
  );
});

test("G6e: channels_newly_wired = [4, 5, 6]", () => {
  const cmp = runZipplebackComparison();
  assert.deepEqual(cmp.channels_newly_wired, [4, 5, 6], "Must report channels 4, 5, 6 as newly wired");
});

// ── G7: Codex ─────────────────────────────────────────────────────────────────

test("G7a: draftBushel20Codex allocates LB-CODEX-NNNN", () => {
  const cmp = runZipplebackComparison();
  const codexId = draftBushel20Codex(cmp);
  assert.match(codexId, /^LB-CODEX-\d{4}$/, "Codex serial format LB-CODEX-NNNN");
});

test("G7b: Bushel 29 unblocked: comparison shows all 3 channels wired", () => {
  const cmp = runZipplebackComparison();
  assert.strictEqual(cmp.channels_newly_wired.length, 3, "All 3 new channels must be wired");
  assert.ok(cmp.arm_b_throughput_gte_arm_a, "Throughput must not regress");
  assert.ok(cmp.arm_b_mcp_recovery_faster, "MCP restart must be faster");
  // All gates met → Bushel 29 draftable
});
