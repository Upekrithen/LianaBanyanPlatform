/**
 * test_fresh_index_gate.mjs (K441 Half D)
 * =======================================
 * Tests the fingerprint-based cache-invalidation gate. The gate is the
 * primitive that lets a long-running MCP server pick up `npm run rebuild`
 * results without a client restart. The acceptance criterion from the
 * K441 prompt:
 *
 *     "after `npm run rebuild` completes, a subsequent `search_knowledge`
 *      tool call from any already-running MCP client returns the new
 *      content WITHOUT requiring a client restart."
 *
 * We simulate the rebuild by overwriting the fingerprint file in a temp
 * directory and verifying the gate calls the reload callback exactly once.
 *
 * Run: node --test tests/test_fresh_index_gate.mjs (after `npm run build`).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync, mkdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createFreshIndexGate } from "../dist/indexer/freshIndexGate.js";

function makeTempIndexDir() {
  const dir = mkdtempSync(join(tmpdir(), "k441-fresh-gate-"));
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

function writeFingerprint(dir, treeHash, timestamp = new Date().toISOString()) {
  writeFileSync(
    join(dir, "last_build_fingerprint.json"),
    JSON.stringify({ treeHash, timestamp, mode: "incremental", elapsedMs: 1, fileCount: 1, fileMtimes: {} }, null, 2),
    "utf-8",
  );
}

test("cold-start (no fingerprint, no loaded data): triggers reload", () => {
  const dir = makeTempIndexDir();
  let reloads = 0;
  let loaded = false;
  const gate = createFreshIndexGate(dir, () => { reloads++; loaded = true; }, () => loaded);
  const r = gate.check();
  assert.equal(r.reloaded, true);
  assert.match(r.reason, /cold-start/);
  assert.equal(reloads, 1);
  rmSync(dir, { recursive: true, force: true });
});

test("steady-state with matching fingerprint: NO reload on repeated calls", () => {
  const dir = makeTempIndexDir();
  writeFingerprint(dir, "abc123def456");
  let reloads = 0;
  let loaded = true; // pretend the server already has data cached
  const gate = createFreshIndexGate(dir, () => { reloads++; loaded = true; }, () => loaded);
  for (let i = 0; i < 5; i++) {
    const r = gate.check();
    assert.equal(r.reloaded, false, `call ${i} should not reload`);
    assert.equal(r.reason, "fresh");
  }
  assert.equal(reloads, 0, "no reloads while fingerprint is unchanged");
  rmSync(dir, { recursive: true, force: true });
});

test("rebuild-while-server-running: writing a new fingerprint triggers exactly one reload", () => {
  const dir = makeTempIndexDir();
  writeFingerprint(dir, "before-hash", "2026-04-23T12:00:00Z");
  let reloads = 0;
  let loaded = true;
  const gate = createFreshIndexGate(dir, () => { reloads++; }, () => loaded);

  // Steady-state confirmed.
  assert.equal(gate.check().reloaded, false);
  assert.equal(reloads, 0);

  // Simulate `npm run rebuild` writing a new fingerprint.
  writeFingerprint(dir, "after-hash", "2026-04-23T12:05:00Z");
  const r1 = gate.check();
  assert.equal(r1.reloaded, true, "first call after rebuild should reload");
  assert.match(r1.reason, /fingerprint changed/);
  assert.equal(r1.timestamp, "2026-04-23T12:05:00Z");
  assert.equal(reloads, 1);

  // Subsequent calls (still no rebuild) should NOT reload again.
  const r2 = gate.check();
  assert.equal(r2.reloaded, false);
  assert.equal(reloads, 1, "no second reload until next rebuild");

  rmSync(dir, { recursive: true, force: true });
});

test("multiple consecutive rebuilds: each one triggers one reload", () => {
  const dir = makeTempIndexDir();
  writeFingerprint(dir, "v1");
  let reloads = 0;
  const gate = createFreshIndexGate(dir, () => { reloads++; }, () => true);

  gate.check(); // steady-state, no reload
  writeFingerprint(dir, "v2");
  gate.check();
  writeFingerprint(dir, "v3");
  gate.check();
  writeFingerprint(dir, "v4");
  gate.check();

  assert.equal(reloads, 3, "exactly 3 reloads for 3 rebuilds");
  rmSync(dir, { recursive: true, force: true });
});

test("malformed fingerprint file: keeps cached data instead of crashing", () => {
  const dir = makeTempIndexDir();
  writeFingerprint(dir, "good-hash");
  let reloads = 0;
  const gate = createFreshIndexGate(dir, () => { reloads++; }, () => true);
  gate.check(); // primes the gate

  // Corrupt the fingerprint file mid-flight (e.g. half-written during rebuild).
  writeFileSync(join(dir, "last_build_fingerprint.json"), "{not-json", "utf-8");
  const r = gate.check();
  assert.equal(r.reloaded, false, "should NOT reload on malformed fingerprint when already loaded");
  assert.match(r.reason, /unreadable/);

  rmSync(dir, { recursive: true, force: true });
});

test("priming on construction: existing fingerprint is already 'last seen', no spurious first-call reload", () => {
  const dir = makeTempIndexDir();
  writeFingerprint(dir, "preexisting-hash");
  let reloads = 0;
  const gate = createFreshIndexGate(dir, () => { reloads++; }, () => true);
  // Construction priming should set lastSeenHash to "preexisting-hash" so
  // the first .check() call sees a match and doesn't trigger a reload.
  const r = gate.check();
  assert.equal(r.reloaded, false);
  assert.equal(reloads, 0);
  assert.equal(gate.current().hash, "preexisting-hash");
  rmSync(dir, { recursive: true, force: true });
});

test("fingerprint disappears between calls: keeps cached data", () => {
  const dir = makeTempIndexDir();
  writeFingerprint(dir, "exists-then-gone");
  const gate = createFreshIndexGate(dir, () => {}, () => true);
  gate.check();
  rmSync(join(dir, "last_build_fingerprint.json"));
  const r = gate.check();
  assert.equal(r.reloaded, false);
  assert.match(r.reason, /no fingerprint on disk/);
  rmSync(dir, { recursive: true, force: true });
});
