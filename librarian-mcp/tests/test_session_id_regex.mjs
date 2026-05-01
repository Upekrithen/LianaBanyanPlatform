/**
 * test_session_id_regex.mjs — KN076 / OG-017 regression tests
 * ============================================================
 * Tests the shared SESSION_ID_REGEX + parseSessionId utility from
 * src/schemas/sessionId.ts (compiled to dist/schemas/sessionId.js).
 *
 * These tests document the OG-017 fix: BP-prefix (and other pod-era compound
 * prefixes) must be accepted by all Librarian tool session validators.
 *
 * Run: node --test tests/test_session_id_regex.mjs   (after npm run build)
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const { SESSION_ID_REGEX, parseSessionId } = await import(
  pathToFileURL(resolve(__dirname, "../dist/schemas/sessionId.js")).href
);

// ── Happy path — legacy single-letter prefixes ──────────────────────────────

test("accepts B009 (Bishop legacy)", () => {
  assert.equal(parseSessionId("B009"), "B009");
});

test("accepts K436 (Knight legacy)", () => {
  assert.equal(parseSessionId("K436"), "K436");
});

test("accepts P007 (Pawn legacy)", () => {
  assert.equal(parseSessionId("P007"), "P007");
});

test("accepts R003 (Rook legacy)", () => {
  assert.equal(parseSessionId("R003"), "R003");
});

// ── Happy path — pod-era compound prefixes (the OG-017 fix) ─────────────────

test("accepts BP009 (Bishop-Pod era — OG-017 root cause)", () => {
  assert.equal(parseSessionId("BP009"), "BP009");
});

test("accepts KP024 (Knight-Pod era)", () => {
  assert.equal(parseSessionId("KP024"), "KP024");
});

test("accepts KN076 (Knight session prefix)", () => {
  assert.equal(parseSessionId("KN076"), "KN076");
});

test("accepts PP001 (Pawn-Pod era)", () => {
  assert.equal(parseSessionId("PP001"), "PP001");
});

test("accepts RR010 (Rook-doubled era)", () => {
  assert.equal(parseSessionId("RR010"), "RR010");
});

// ── Happy path — digit count flexibility ────────────────────────────────────

test("accepts single digit: B1", () => {
  assert.equal(parseSessionId("B1"), "B1");
});

test("accepts four-digit: K1200", () => {
  assert.equal(parseSessionId("K1200"), "K1200");
});

// ── Reject path ──────────────────────────────────────────────────────────────

test("rejects bare digits (no prefix)", () => {
  assert.throws(() => parseSessionId("9"), /Invalid session ID/);
});

test("rejects lowercase bp009", () => {
  assert.throws(() => parseSessionId("bp009"), /Invalid session ID/);
});

test("rejects lowercase b009", () => {
  assert.throws(() => parseSessionId("b009"), /Invalid session ID/);
});

test("rejects empty string", () => {
  assert.throws(() => parseSessionId(""), /Invalid session ID/);
});

test("rejects unknown prefix ZZ001", () => {
  assert.throws(() => parseSessionId("ZZ001"), /Invalid session ID/);
});

test("rejects prefix only with no digits (BP)", () => {
  assert.throws(() => parseSessionId("BP"), /Invalid session ID/);
});

// ── Regex direct tests ───────────────────────────────────────────────────────

test("SESSION_ID_REGEX matches BP009", () => {
  assert.ok(SESSION_ID_REGEX.test("BP009"));
});

test("SESSION_ID_REGEX does not match bp009 (lowercase)", () => {
  assert.ok(!SESSION_ID_REGEX.test("bp009"));
});
