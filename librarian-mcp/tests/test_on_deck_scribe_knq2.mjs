/**
 * KN-Q2 On Deck Scribe MCP Tools — T1-T6 test suite
 * ====================================================
 * Tests the 6 MCP-facing On Deck Scribe tools via direct module calls
 * (same functions the MCP handlers call; no HTTP layer needed).
 *
 * Tools tested:
 *   on_deck_append / on_deck_query / on_deck_mutate /
 *   on_deck_attach_prepared_context / on_deck_promote_from_dropzone /
 *   on_deck_dispatch_audit
 */

import { strictEqual, ok } from "assert";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { tmpdir } from "os";
import { resolve } from "path";
import { test } from "node:test";

// Import the same module functions the MCP tools call
import {
  appendEntry,
  markInFlight,
  markLanded,
  markErrored,
  attachPreparedContext,
} from "../dist/on_deck_scribe/writer.js";

import {
  loadQueue,
  getNextForKnight,
  dispatchAudit,
  scanDropzoneForKPrompts,
} from "../dist/on_deck_scribe/reader.js";

import { allocateOdsSerial } from "../dist/on_deck_scribe/serial.js";

// ─── T1: on_deck_append creates entry, on_deck_query returns it ───────────────

test("T1: on_deck_append + on_deck_query basic flow", async () => {
  const id = await allocateOdsSerial();
  ok(/^LB-ODS-\d{4,}$/.test(id), "serial should match LB-ODS-NNNN");

  const entry = await appendEntry({
    id,
    category: "knight",
    k_prompt_path: "/fake/PROMPT_KNIGHT_KNQ2_T1.md",
    status: "queued",
    priority: 1,
    prerequisites: [],
    ts_queued: new Date().toISOString(),
  });

  strictEqual(entry.id, id);
  strictEqual(entry.status, "queued");

  const all = loadQueue();
  const found = all.find((e) => e.id === id);
  ok(found, "appended entry should be in loadQueue()");

  // on_deck_query logic: getNextForKnight returns a queued knight entry
  const next = getNextForKnight({ category: "knight" });
  ok(next !== null, "getNextForKnight should return something");

  // Clean up
  await markInFlight(id); await markLanded(id);
});

// ─── T2: on_deck_mutate transitions status correctly ─────────────────────────

test("T2: on_deck_mutate status transitions", async () => {
  const id = await allocateOdsSerial();
  await appendEntry({
    id,
    category: "knight",
    k_prompt_path: "/fake/T2_mutate.md",
    status: "queued",
    priority: 2,
    prerequisites: [],
    ts_queued: new Date().toISOString(),
  });

  // queued → in_flight
  await markInFlight(id);
  let all = loadQueue();
  let found = all.find((e) => e.id === id);
  strictEqual(found?.status, "in_flight", "should be in_flight");

  // in_flight → landed with commit_hash
  await markLanded(id, "abc9999");
  all = loadQueue();
  found = all.find((e) => e.id === id);
  strictEqual(found?.status, "landed", "should be landed");
  strictEqual(found?.commit_hash, "abc9999", "commit_hash should be set");
});

// ─── T3: on_deck_attach_prepared_context populates Shadow pre-staging ─────────

test("T3: on_deck_attach_prepared_context", async () => {
  const id = await allocateOdsSerial();
  await appendEntry({
    id,
    category: "knight",
    k_prompt_path: "/fake/T3_prepared.md",
    status: "queued",
    priority: 3,
    prerequisites: [],
    ts_queued: new Date().toISOString(),
  });

  const ctx = {
    shadow_id: "beta",
    prep_ts: new Date().toISOString(),
    wrasse_pre_injections: [
      "~/.claude/state/eblets/CANON/shadow_alternating.eblet.md",
      "~/.claude/state/eblets/CANON/on_deck_phase_2.eblet.md",
    ],
    detective_findings: [
      { trigger: "on deck scribe queue", scribe: "KnightQueue", excerpt: "canonical state file...", score: 0.92 },
    ],
    prerequisite_context_summary: "Pod-G LANDED af1cc47; Pod-J LANDED; Pod-I LANDED.",
  };

  await attachPreparedContext(id, ctx);

  const all = loadQueue();
  const found = all.find((e) => e.id === id);
  ok(found, "entry should exist");
  ok(found.prepared_context, "prepared_context should be set");
  strictEqual(found.prepared_context.shadow_id, "beta");
  strictEqual(found.prepared_context.wrasse_pre_injections.length, 2);
  strictEqual(found.prepared_context.detective_findings.length, 1);

  // Clean up
  await markInFlight(id); await markLanded(id);
});

// ─── T4: on_deck_promote_from_dropzone bulk-imports K-prompt files ────────────

test("T4: on_deck_promote_from_dropzone", async () => {
  // Create a temp dropzone with 3 K-prompt files
  const tmpDir = mkdtempSync(resolve(tmpdir(), "ods-dropzone-"));
  const files = [
    "PROMPT_KNIGHT_KNQ2_A.md",
    "PROMPT_KNIGHT_KNQ2_B.md",
    "PROMPT_KNIGHT_KNQ2_C.md",
    "NOT_A_PROMPT.txt",  // should be ignored
  ];
  for (const f of files) {
    writeFileSync(resolve(tmpDir, f), `# Test K-prompt: ${f}\n`);
  }

  // Simulate on_deck_promote_from_dropzone
  const stubs = scanDropzoneForKPrompts(tmpDir);
  strictEqual(stubs.length, 3, "should detect exactly 3 K-prompt files (not .txt)");

  const imported = [];
  for (const stub of stubs) {
    const id = await allocateOdsSerial();
    await appendEntry({ ...stub, id, ts_queued: new Date().toISOString() });
    imported.push(id);
  }

  strictEqual(imported.length, 3, "should import 3 entries");
  for (const id of imported) {
    ok(/^LB-ODS-\d{4,}$/.test(id), `${id} should be valid serial`);
    const all = loadQueue();
    const found = all.find((e) => e.id === id);
    ok(found, `imported entry ${id} should exist in queue`);
  }

  // Clean up
  for (const id of imported) { await markInFlight(id); await markLanded(id); }
});

// ─── T5: on_deck_dispatch_audit aggregates counts correctly ──────────────────

test("T5: on_deck_dispatch_audit aggregate counts", async () => {
  // Append a few entries and land one to get known state
  const tsId1 = await allocateOdsSerial();
  const tsId2 = await allocateOdsSerial();
  await appendEntry({ id: tsId1, category: "knight", k_prompt_path: "/a.md", status: "queued", priority: 10, prerequisites: [], ts_queued: new Date().toISOString() });
  await appendEntry({ id: tsId2, category: "bishop", k_prompt_path: "/b.md", status: "queued", priority: 10, prerequisites: [], ts_queued: new Date().toISOString() });
  await markInFlight(tsId1); await markLanded(tsId1);

  const audit = dispatchAudit();
  ok(typeof audit.total === "number" && audit.total > 0, "total should be positive");
  ok(typeof audit.landed === "number", "landed count should exist");
  ok(typeof audit.queued === "number", "queued count should exist");
  ok(audit.by_category && typeof audit.by_category === "object", "by_category should exist");
  ok(audit.by_category["knight"] >= 1, "knight category should have at least 1");
  ok(audit.by_category["bishop"] >= 1, "bishop category should have at least 1");

  // Clean up
  await markInFlight(tsId2); await markLanded(tsId2);
});

// ─── T6: filter by cohort_class works ────────────────────────────────────────

test("T6: on_deck_query cohort_class filter", async () => {
  const ts = Date.now();
  const excalId = await allocateOdsSerial();
  const wolfId = await allocateOdsSerial();

  await appendEntry({ id: excalId, category: "knight", k_prompt_path: "/excal.md", status: "queued", priority: 5, prerequisites: [], cohort_class: "excalibur_subscriber", ts_queued: new Date().toISOString() });
  await appendEntry({ id: wolfId, category: "knight", k_prompt_path: "/wolf.md", status: "queued", priority: 5, prerequisites: [], cohort_class: "lone_wolf", ts_queued: new Date().toISOString() });

  // Filter for excalibur only
  const all = loadQueue();
  const excal = all.filter((e) => e.cohort_class === "excalibur_subscriber" && e.status === "queued");
  ok(excal.some((e) => e.id === excalId), "excalibur entry should appear in filter");
  ok(!excal.some((e) => e.id === wolfId), "lone_wolf entry should not appear in excalibur filter");

  // Clean up
  await markInFlight(excalId); await markLanded(excalId);
  await markInFlight(wolfId); await markLanded(wolfId);
});
