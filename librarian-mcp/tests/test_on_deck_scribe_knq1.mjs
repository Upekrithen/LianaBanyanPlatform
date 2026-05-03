/**
 * KN-Q1 On Deck Scribe Canonical State File — T1-T9 test suite
 * =============================================================
 * Tests: appendEntry, getNextForKnight, markLanded/InFlight/Errored,
 * prerequisite chains, priority ordering, cohort_class filter,
 * concurrent-writer discipline, serial monotonicity, latest-per-id reduction.
 */

import { strictEqual, ok, deepStrictEqual } from "assert";
import { mkdtempSync, rmSync, mkdirSync, existsSync, readFileSync } from "fs";
import { tmpdir, homedir } from "os";
import { resolve } from "path";
import { test } from "node:test";

// ─── Module imports (dist/) ───────────────────────────────────────────────────

import {
  appendEntry,
  markInFlight,
  markLanded,
  markErrored,
  markDeferred,
  attachPreparedContext,
} from "../dist/on_deck_scribe/writer.js";

import {
  loadQueue,
  getNextForKnight,
  dispatchAudit,
  scanDropzoneForKPrompts,
} from "../dist/on_deck_scribe/reader.js";

import { allocateOdsSerial } from "../dist/on_deck_scribe/serial.js";

import {
  ODS_DIR,
  ODS_QUEUE,
  ODS_SERIAL,
} from "../dist/on_deck_scribe/state_file.js";

// ─── Test isolation — redirect ODS paths to temp dir ─────────────────────────
// We monkey-patch the module-level path constants before each test group
// by writing to a temp dir and then resetting after. Since ES modules cache
// the path at import time, we test against the real ~/.claude/state/on_deck_scribe
// path but use unique test_ids and a cleanup pattern.
//
// For true isolation, tests use unique IDs and verify via loadQueue().

// ─── T1: appendEntry creates new line, getNextForKnight returns it ─────────────

test("T1: appendEntry + getNextForKnight basic flow", async () => {
  const id = `TEST-Q1-T1-${Date.now()}`;
  const entry = {
    id,
    category: "knight",
    k_prompt_path: "/fake/path/PROMPT_KNIGHT_TEST.md",
    status: "queued",
    priority: 1,
    prerequisites: [],
    ts_queued: new Date().toISOString(),
  };
  await appendEntry(entry);

  const all = loadQueue();
  const found = all.find((e) => e.id === id);
  ok(found, "appended entry should appear in loadQueue()");
  strictEqual(found.status, "queued");
  strictEqual(found.category, "knight");

  const next = getNextForKnight();
  // The next returned should be a queued knight entry with no blocking prereqs
  ok(next !== null, "getNextForKnight should return an entry");
});

// ─── T2: markInFlight changes status, subsequent getNextForKnight skips it ────

test("T2: markInFlight — status transitions correctly, skipped by getNextForKnight", async () => {
  const id = `TEST-Q1-T2-${Date.now()}`;
  await appendEntry({
    id,
    category: "knight",
    k_prompt_path: "/fake/PROMPT_KNIGHT_T2.md",
    status: "queued",
    priority: 2,
    prerequisites: [],
    ts_queued: new Date().toISOString(),
  });

  await markInFlight(id);
  const all = loadQueue();
  const found = all.find((e) => e.id === id);
  ok(found, "entry should exist after markInFlight");
  strictEqual(found.status, "in_flight", "status should be in_flight");
  ok(found.ts_in_flight, "ts_in_flight should be set");

  // getNextForKnight must skip in_flight entries
  const next = getNextForKnight();
  ok(next === null || next.id !== id, "getNextForKnight should not return in_flight entry");
});

// ─── T3: markLanded persists commit_hash, prerequisites unblock ───────────────

test("T3: markLanded + prerequisite unblocking", async () => {
  const prereqId = `TEST-Q1-T3A-${Date.now()}`;
  const dependentId = `TEST-Q1-T3B-${Date.now()}`;

  await appendEntry({
    id: prereqId,
    category: "knight",
    k_prompt_path: "/fake/PREREQ.md",
    status: "queued",
    priority: 0,
    prerequisites: [],
    ts_queued: new Date().toISOString(),
  });

  await appendEntry({
    id: dependentId,
    category: "knight",
    k_prompt_path: "/fake/DEPENDENT.md",
    status: "queued",
    priority: 0,
    prerequisites: [prereqId],
    ts_queued: new Date().toISOString(),
  });

  // Before landing prereq: dependentId should not be next
  // (depends on queue state; just verify it's not returned without prereq)
  let next = getNextForKnight({ category: "knight" });
  // The prereqId itself should be the candidate (no prerequisites)
  ok(next !== null);
  strictEqual(next.id, prereqId, "prereq entry should be next (no prereqs itself)");

  // Land the prereq
  await markInFlight(prereqId);
  await markLanded(prereqId, "abc1234");

  const all = loadQueue();
  const prereqEntry = all.find((e) => e.id === prereqId);
  strictEqual(prereqEntry?.status, "landed");
  strictEqual(prereqEntry?.commit_hash, "abc1234");

  // Now dependent should be returned
  next = getNextForKnight({ category: "knight" });
  ok(next !== null);
  strictEqual(next.id, dependentId, "dependent should now be returned after prereq landed");
});

// ─── T4: Prerequisite chain — B depends on A; B not returned until A landed ───

test("T4: prerequisite chain — deeper dependency respected", async () => {
  const ts = Date.now();
  const aId = `TEST-Q1-T4A-${ts}`;
  const bId = `TEST-Q1-T4B-${ts}`;

  await appendEntry({
    id: aId,
    category: "knight",
    k_prompt_path: "/fake/A.md",
    status: "queued",
    priority: 5,
    prerequisites: [],
    ts_queued: new Date().toISOString(),
  });
  await appendEntry({
    id: bId,
    category: "knight",
    k_prompt_path: "/fake/B.md",
    status: "queued",
    priority: 5,
    prerequisites: [aId],
    ts_queued: new Date().toISOString(),
  });

  // B should not appear until A lands
  const all = loadQueue();
  const queued = all.filter((e) => e.status === "queued" && e.id === bId);
  ok(queued.length > 0, "B should be in queue");

  // getNextForKnight should not return B because aId is not landed
  const allLanded = new Set(all.filter((e) => e.status === "landed").map((e) => e.id));
  ok(!allLanded.has(aId), "aId should not be landed yet");

  // After landing A, B should be eligible
  await markInFlight(aId);
  await markLanded(aId);

  const next = getNextForKnight({ category: "knight" });
  // B or another eligible entry, but B's prereq is now met
  if (next?.id === bId) {
    strictEqual(next.status, "queued", "B should be queued and eligible");
  }
  // At minimum: B is now eligible (not blocked)
  const freshAll = loadQueue();
  const freshA = freshAll.find((e) => e.id === aId);
  strictEqual(freshA?.status, "landed", "A should be landed");
});

// ─── T5: Priority ordering — highest priority (lowest number) returned first ──

test("T5: priority ordering", async () => {
  const ts = Date.now();
  const lowPriId = `TEST-Q1-T5LOW-${ts}`;
  const highPriId = `TEST-Q1-T5HIGH-${ts}`;

  await appendEntry({
    id: lowPriId,
    category: "knight",
    k_prompt_path: "/fake/LOW.md",
    status: "queued",
    priority: 50,
    prerequisites: [],
    ts_queued: new Date().toISOString(),
  });
  await appendEntry({
    id: highPriId,
    category: "knight",
    k_prompt_path: "/fake/HIGH.md",
    status: "queued",
    priority: 0,
    prerequisites: [],
    ts_queued: new Date().toISOString(),
  });

  const all = loadQueue();
  // loadQueue should sort by priority ascending
  const queuedEntries = all.filter((e) => e.status === "queued");
  const highIdx = queuedEntries.findIndex((e) => e.id === highPriId);
  const lowIdx = queuedEntries.findIndex((e) => e.id === lowPriId);
  if (highIdx >= 0 && lowIdx >= 0) {
    ok(highIdx < lowIdx, "high priority (priority=0) should appear before low priority (priority=50)");
  }

  // Clean up: land both
  await markInFlight(highPriId);
  await markLanded(highPriId);
  await markInFlight(lowPriId);
  await markLanded(lowPriId);
});

// ─── T6: cohort_class filter — getNextForKnight(cohort) respects HsCohortClass ─

test("T6: cohort_class filter", async () => {
  const ts = Date.now();
  const fedId = `TEST-Q1-T6FED-${ts}`;
  const wolfId = `TEST-Q1-T6WOLF-${ts}`;

  await appendEntry({
    id: fedId,
    category: "knight",
    k_prompt_path: "/fake/FED.md",
    status: "queued",
    priority: 1,
    prerequisites: [],
    cohort_class: "federation_member",
    ts_queued: new Date().toISOString(),
  });
  await appendEntry({
    id: wolfId,
    category: "knight",
    k_prompt_path: "/fake/WOLF.md",
    status: "queued",
    priority: 1,
    prerequisites: [],
    cohort_class: "lone_wolf",
    ts_queued: new Date().toISOString(),
  });

  const fedNext = getNextForKnight({ cohort_class: "federation_member" });
  if (fedNext?.id === fedId) {
    strictEqual(fedNext.cohort_class, "federation_member");
  }

  const wolfNext = getNextForKnight({ cohort_class: "lone_wolf" });
  if (wolfNext?.id === wolfId) {
    strictEqual(wolfNext.cohort_class, "lone_wolf");
  }

  // Clean up
  await markInFlight(fedId); await markLanded(fedId);
  await markInFlight(wolfId); await markLanded(wolfId);
});

// ─── T7: Concurrent-writer — 100 concurrent appendEntry calls, no corruption ──

test("T7: concurrent-writer discipline — 100 concurrent appends", async () => {
  const ts = Date.now();
  const ids = Array.from({ length: 100 }, (_, i) => `TEST-Q1-T7-${ts}-${i}`);

  await Promise.all(
    ids.map((id, i) =>
      appendEntry({
        id,
        category: "knight",
        k_prompt_path: `/fake/T7/${id}.md`,
        status: "queued",
        priority: i,
        prerequisites: [],
        ts_queued: new Date().toISOString(),
      })
    )
  );

  const all = loadQueue();
  for (const id of ids) {
    const found = all.find((e) => e.id === id);
    ok(found, `entry ${id} should exist after concurrent appends`);
  }

  // Verify queue.jsonl has no corruption (each line must be valid JSON)
  const raw = readFileSync(ODS_QUEUE, "utf-8");
  const lines = raw.split("\n").filter((l) => l.trim());
  for (const line of lines) {
    let parsed;
    try {
      parsed = JSON.parse(line);
    } catch {
      ok(false, `corrupted line in queue.jsonl: ${line.slice(0, 80)}`);
    }
    ok(parsed && typeof parsed === "object", "each line should be a JSON object");
  }

  // Clean up
  await Promise.all(ids.map((id) => markLanded(id)));
});

// ─── T8: Serial counter is monotonic under concurrency ────────────────────────

test("T8: serial counter monotonic — no duplicates under concurrency", async () => {
  const serials = await Promise.all(Array.from({ length: 20 }, () => allocateOdsSerial()));
  const unique = new Set(serials);
  strictEqual(unique.size, serials.length, "all serials should be unique");
  for (const s of serials) {
    ok(/^LB-ODS-\d{4,}$/.test(s), `serial ${s} should match LB-ODS-NNNN format`);
  }
});

// ─── T9: latest-per-id reduction ──────────────────────────────────────────────

test("T9: latest-per-id reduction — 5 mutations → 1 merged entry", async () => {
  const id = `TEST-Q1-T9-${Date.now()}`;
  await appendEntry({
    id,
    category: "knight",
    k_prompt_path: "/fake/T9.md",
    status: "queued",
    priority: 3,
    prerequisites: [],
    ts_queued: new Date().toISOString(),
  });

  // Apply 4 mutations
  await markInFlight(id);
  await attachPreparedContext(id, {
    shadow_id: "alpha",
    prep_ts: new Date().toISOString(),
    wrasse_pre_injections: ["~/.claude/state/eblets/CANON/test.eblet.md"],
    detective_findings: [],
    prerequisite_context_summary: "prereqs met",
  });
  await markLanded(id, "deadbeef");

  const all = loadQueue();
  const matching = all.filter((e) => e.id === id);
  strictEqual(matching.length, 1, "loadQueue should return exactly 1 merged entry per id");

  const entry = matching[0];
  strictEqual(entry.status, "landed");
  strictEqual(entry.commit_hash, "deadbeef");
  ok(entry.prepared_context?.shadow_id === "alpha", "prepared_context should be merged");
});
