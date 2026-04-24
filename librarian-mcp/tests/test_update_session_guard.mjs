/**
 * test_update_session_guard.mjs — K460: regression tests for sessionGuard.ts
 * ============================================================================
 * Tests the pure validateSessionId() function (imported from compiled dist/).
 *
 * Test cases:
 *   A. Happy path — valid current-max-adjacent IDs are accepted
 *   B. Reject path — implausibly-high IDs rejected with structured error
 *   C. Escape hatch — TEST_-prefixed IDs are accepted regardless of magnitude
 *   D. Boundary cases — edge of adaptive buffer (MAX+200 passes, MAX+201 rejects)
 *   E. Hard cap — IDs with numeric component > 9999 rejected by hard_cap rule
 *   F. Idempotence — re-writing an existing session ID skips the guard
 *   G. Non-canonical formats — compound/legacy IDs pass through unchanged
 *   H. Staleness.py escape hatch — TEST_ IDs excluded from detect_session_gaps
 *
 * Run: node --test tests/test_update_session_guard.mjs (after npm run build)
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import from compiled dist/ — requires `npm run build` first.
// Use pathToFileURL so Windows absolute paths become valid file:// URLs.
const { validateSessionId, TEST_SESSION_PREFIX, SESSION_HARD_CAP, SESSION_ADAPTIVE_BUFFER } =
  await import(pathToFileURL(resolve(__dirname, "../dist/sessionGuard.js")).href);

// ── Shared fixture: a realistic sessions array mirroring the live store ────────
// Real max as of K460 / B121: K422, B113. Used in boundary tests.
const MOCK_SESSIONS = [
  { id: "K420" }, { id: "K421" }, { id: "K422" },
  { id: "B110" }, { id: "B111" }, { id: "B112" }, { id: "B113" },
  { id: "K394-K395-K396" },  // compound — should not affect K-prefix max computation
  { id: "knight-153" },      // non-canonical — should not affect any prefix max
];

// ── Test A: Happy path — adjacent IDs are accepted ───────────────────────────

test("happy path: K423 (one above max) is accepted", () => {
  const result = validateSessionId("K423", MOCK_SESSIONS);
  assert.equal(result.rejected, false, `K423 should be accepted. Got: ${JSON.stringify(result)}`);
});

test("happy path: B114 (one above B max) is accepted", () => {
  const result = validateSessionId("B114", MOCK_SESSIONS);
  assert.equal(result.rejected, false, `B114 should be accepted. Got: ${JSON.stringify(result)}`);
});

test("happy path: K461 (current session +39 from max) is accepted", () => {
  const result = validateSessionId("K461", MOCK_SESSIONS);
  assert.equal(result.rejected, false, `K461 should be accepted. Got: ${JSON.stringify(result)}`);
});

test("happy path: new prefix with no history (e.g., R1) is accepted", () => {
  const result = validateSessionId("R1", MOCK_SESSIONS);
  assert.equal(result.rejected, false, `R1 (new prefix, no max) should be accepted. Got: ${JSON.stringify(result)}`);
});

// ── Test B: Reject path — implausibly-high IDs are rejected ──────────────────

test("reject: K999 rejected (> K422 + 200 buffer)", () => {
  const result = validateSessionId("K999", MOCK_SESSIONS);
  assert.equal(result.rejected, true, "K999 should be rejected");
  assert.equal(result.rule_fired, "adaptive_buffer");
  assert.ok(typeof result.message === "string" && result.message.length > 0);
  assert.ok(typeof result.how_to_proceed === "string" && result.how_to_proceed.includes(TEST_SESSION_PREFIX));
});

test("reject: K9999 rejected (> K422 + 200 buffer, also tests near-hard-cap)", () => {
  const result = validateSessionId("K9999", MOCK_SESSIONS);
  assert.equal(result.rejected, true, "K9999 should be rejected");
  // May fire either rule; adaptive_buffer fires first since 9999 > 622
  assert.ok(["adaptive_buffer", "hard_cap"].includes(result.rule_fired));
});

test("reject: B99999 rejected by hard_cap (99999 > 9999)", () => {
  const result = validateSessionId("B99999", MOCK_SESSIONS);
  assert.equal(result.rejected, true, "B99999 should be rejected");
  assert.equal(result.rule_fired, "hard_cap");
  assert.equal(result.offending_id, "B99999");
});

// ── Test C: Escape hatch — TEST_-prefixed IDs bypass all checks ──────────────

test("escape hatch: TEST_K999 is accepted", () => {
  const result = validateSessionId("TEST_K999", MOCK_SESSIONS);
  assert.equal(result.rejected, false, `TEST_K999 should be accepted via escape hatch. Got: ${JSON.stringify(result)}`);
});

test("escape hatch: TEST_K99999 is accepted (even above hard cap)", () => {
  const result = validateSessionId("TEST_K99999", MOCK_SESSIONS);
  assert.equal(result.rejected, false, `TEST_K99999 should be accepted via escape hatch. Got: ${JSON.stringify(result)}`);
});

// ── Test D: Boundary cases — exact buffer edge ────────────────────────────────
// K422 is the max. Buffer is SESSION_ADAPTIVE_BUFFER (200).
// K622 = 422 + 200 → PASSES (not strictly greater than)
// K623 = 422 + 201 → REJECTS

test(`boundary: K${422 + SESSION_ADAPTIVE_BUFFER} (exact buffer edge) is accepted`, () => {
  const edgeId = `K${422 + SESSION_ADAPTIVE_BUFFER}`;
  const result = validateSessionId(edgeId, MOCK_SESSIONS);
  assert.equal(result.rejected, false, `${edgeId} at exact buffer edge should be accepted. Got: ${JSON.stringify(result)}`);
});

test(`boundary: K${422 + SESSION_ADAPTIVE_BUFFER + 1} (one over buffer) is rejected`, () => {
  const overId = `K${422 + SESSION_ADAPTIVE_BUFFER + 1}`;
  const result = validateSessionId(overId, MOCK_SESSIONS);
  assert.equal(result.rejected, true, `${overId} one over buffer should be rejected`);
  assert.equal(result.rule_fired, "adaptive_buffer");
});

// ── Test E: Hard cap — numeric part > SESSION_HARD_CAP ───────────────────────

test(`hard cap: K${SESSION_HARD_CAP + 1} rejected on empty session store`, () => {
  const result = validateSessionId(`K${SESSION_HARD_CAP + 1}`, []);
  assert.equal(result.rejected, true, "Hard cap should fire on empty store");
  assert.equal(result.rule_fired, "hard_cap");
});

test(`hard cap: K${SESSION_HARD_CAP} (exactly at cap) is accepted`, () => {
  // K9999 on empty store — no adaptive buffer fires (no currentMax), hard cap
  // checks > 9999 strictly, so K9999 (= 9999) should pass the hard cap check.
  const result = validateSessionId(`K${SESSION_HARD_CAP}`, []);
  assert.equal(result.rejected, false, `K${SESSION_HARD_CAP} is AT the hard cap (not above) and should be accepted on empty store`);
});

// ── Test F: Idempotence — re-writing an existing ID skips the guard ───────────

test("idempotence: re-writing existing K422 skips guard (returns accepted)", () => {
  // K422 is already in MOCK_SESSIONS; if someone calls update_session("K422", ...)
  // again with updated metadata, the guard should not block it.
  const result = validateSessionId("K422", MOCK_SESSIONS);
  assert.equal(result.rejected, false, "Existing K422 should pass idempotence check");
});

test("idempotence: re-writing existing B113 skips guard", () => {
  const result = validateSessionId("B113", MOCK_SESSIONS);
  assert.equal(result.rejected, false, "Existing B113 should pass idempotence check");
});

// ── Test G: Non-canonical formats pass through unchanged ─────────────────────

test("non-canonical: K394-K395-K396 compound ID passes through", () => {
  const result = validateSessionId("K394-K395-K396", MOCK_SESSIONS);
  assert.equal(result.rejected, false, "Compound ID should not be subject to guard");
});

test("non-canonical: knight-153 legacy format passes through", () => {
  const result = validateSessionId("knight-153", MOCK_SESSIONS);
  assert.equal(result.rejected, false, "Legacy format should not be subject to guard");
});

test("non-canonical: K-B058-Stats passes through", () => {
  const result = validateSessionId("K-B058-Stats", MOCK_SESSIONS);
  assert.equal(result.rejected, false, "Cross-role compound format should pass through");
});

// ── Test H: staleness.py escape hatch — TEST_ IDs excluded from gap count ────
// We verify this by running staleness.py as a subprocess and checking that
// inserting TEST_K999 into a mock sessions input does not create spurious gaps.

test("staleness.py: TEST_K999 excluded from detect_session_gaps (no phantom gap created)", () => {
  // Build a minimal sessions list where K421 and K423 are present, and TEST_K999
  // is also present. Without the filter, detect_session_gaps would include K422
  // as a gap AND potentially weird gaps around 999. With the filter, TEST_K999 is
  // invisible to gap detection, and only K422 shows as a gap.
  const sessionsInput = JSON.stringify([
    { id: "K421", date: "2026-04-10", summary: "test" },
    { id: "K423", date: "2026-04-10", summary: "test" },
    { id: "TEST_K999", date: "2026-04-23", summary: "test escape hatch" },
  ]);

  const scramblerPath = resolve(__dirname, "../scrambler").replace(/\\/g, "\\\\");
  const pyScript = `
import sys, json
sys.path.insert(0, '${scramblerPath}')
from staleness import detect_session_gaps
sessions = json.loads(${JSON.stringify(sessionsInput)})
gaps = detect_session_gaps(sessions)
gap_ids = [g['missing_id'] for g in gaps]
assert all('999' not in g for g in gap_ids), "Unexpected 999-related gap in: " + str(gap_ids)
assert 'K422' in gap_ids, "Expected K422 as gap, got: " + str(gap_ids)
print("OK:", gap_ids)
`;

  const result = spawnSync("python", ["-c", pyScript], {
    encoding: "utf-8",
    timeout: 15_000,
    cwd: resolve(__dirname, ".."),
  });

  // If python is not available, skip gracefully
  if (result.error && result.error.code === "ENOENT") {
    // Try python3
    const result3 = spawnSync("python3", ["-c", pyScript], {
      encoding: "utf-8",
      timeout: 15_000,
      cwd: resolve(__dirname, ".."),
    });
    if (result3.error && result3.error.code === "ENOENT") {
      console.warn("  ⚠ Python not found — skipping staleness.py subprocess test");
      return;
    }
    assert.equal(result3.status, 0, `staleness.py test failed.\nstdout: ${result3.stdout}\nstderr: ${result3.stderr}`);
    return;
  }
  assert.equal(result.status, 0, `staleness.py test failed.\nstdout: ${result.stdout}\nstderr: ${result.stderr}`);
});
