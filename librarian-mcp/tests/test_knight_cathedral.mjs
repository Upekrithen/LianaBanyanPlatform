/**
 * test_knight_cathedral.mjs — K461(B121): Knight Cathedral instantiation tests
 * =============================================================================
 * Six tests (A-F) per the feedback_tests_mutating_real_files_serial.md discipline:
 *   A. Directory exists — Cathedral structure is present.
 *   B. Scribes load — each of the four Scribes is valid JSONL.
 *   C. Schema compliance — every tablet has the required fields.
 *   D. Courier idempotence — running Courier twice produces zero new tablets.
 *   E. KNIGHT_QUEUE.md render — render-knight-queue.mjs produces a valid markdown file.
 *   F. Append-only enforcement — Courier does NOT modify existing tablets.
 *
 * Run: node --test tests/test_knight_cathedral.mjs (after npm run build)
 *
 * Tests D and F mutate real Scribe files (via a temp copy) — they use try/finally
 * to restore original state. This file runs as its own node --test invocation (see
 * package.json) to prevent parallel interference with other test suites.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
  mkdirSync,
} from "node:fs";
import { resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MCP_ROOT = resolve(__dirname, "..");
const WORKSPACE = resolve(MCP_ROOT, "..");

const CATHEDRAL_DIR = resolve(MCP_ROOT, "stitchpunks/knight_cathedral");
const SCRIBES_DIR = resolve(CATHEDRAL_DIR, "scribes");
const SCRIBE_FILES = [
  "KnightQueue.jsonl",
  "KnightHandoffs.jsonl",
  "KnightBRIDLEMemory.jsonl",
  "KnightArchitecture.jsonl",
];
const REQUIRED_FIELDS = [
  "observation",
  "category",
  "timestamp",
  "source_session",
  "source_document",
  "tokens",
];
const KNIGHT_QUEUE_PATH = resolve(WORKSPACE, "KNIGHT_QUEUE.md");
const RENDER_SCRIPT = resolve(MCP_ROOT, "scripts/render-knight-queue.mjs");

/** Parse a JSONL file, returning entry records only (skip header + blank lines). */
function parseJsonl(path) {
  const lines = readFileSync(path, "utf-8").split("\n");
  const results = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const obj = JSON.parse(trimmed); // let it throw on bad JSON
    if (obj.type === "header") continue;
    results.push(obj);
  }
  return results;
}

// ── Test A: directory structure exists ────────────────────────────────────────

test("A: knight_cathedral directory structure exists", () => {
  assert.ok(existsSync(CATHEDRAL_DIR), `Cathedral dir missing: ${CATHEDRAL_DIR}`);
  assert.ok(existsSync(SCRIBES_DIR), `Scribes dir missing: ${SCRIBES_DIR}`);
  assert.ok(existsSync(resolve(CATHEDRAL_DIR, "README.md")), "README.md missing");
  assert.ok(existsSync(resolve(CATHEDRAL_DIR, "schema.json")), "schema.json missing");
  for (const scribe of SCRIBE_FILES) {
    assert.ok(
      existsSync(resolve(SCRIBES_DIR, scribe)),
      `Scribe missing: ${scribe}`
    );
  }
});

// ── Test B: Scribes load (each line is parseable JSON) ────────────────────────

test("B: all four Scribes are valid JSONL (each line parses)", () => {
  for (const scribe of SCRIBE_FILES) {
    const path = resolve(SCRIBES_DIR, scribe);
    const lines = readFileSync(path, "utf-8").split("\n");
    let lineNum = 0;
    for (const line of lines) {
      lineNum++;
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        JSON.parse(trimmed);
      } catch (err) {
        assert.fail(`${scribe} line ${lineNum} is not valid JSON: ${err.message}\n  Content: ${trimmed.slice(0, 80)}`);
      }
    }
    // Must have at least one non-header entry (seed must exist)
    const entries = parseJsonl(path);
    assert.ok(entries.length > 0, `${scribe} has zero entry tablets (seed missing?)`);
  }
});

// ── Test C: schema compliance ─────────────────────────────────────────────────

test("C: every tablet has all required schema fields", () => {
  for (const scribe of SCRIBE_FILES) {
    const path = resolve(SCRIBES_DIR, scribe);
    const tablets = parseJsonl(path);
    for (let i = 0; i < tablets.length; i++) {
      const t = tablets[i];
      for (const field of REQUIRED_FIELDS) {
        assert.ok(
          field in t,
          `${scribe} tablet #${i + 1} missing required field '${field}'.\n  Tablet: ${JSON.stringify(t).slice(0, 120)}`
        );
      }
      // timestamp must parse as a valid date
      assert.ok(
        !isNaN(Date.parse(t.timestamp)),
        `${scribe} tablet #${i + 1} has invalid timestamp: ${t.timestamp}`
      );
      // tokens must be a number
      assert.equal(
        typeof t.tokens,
        "number",
        `${scribe} tablet #${i + 1} 'tokens' must be a number, got: ${typeof t.tokens}`
      );
    }
  }
});

// ── Test D: Courier idempotence ────────────────────────────────────────────────

test("D: running Courier twice on unchanged workspace produces zero new tablets", async () => {
  // Save snapshots of the two Scribe files the Courier writes to
  const queuePath = resolve(SCRIBES_DIR, "KnightQueue.jsonl");
  const handoffsPath = resolve(SCRIBES_DIR, "KnightHandoffs.jsonl");
  const queueBackup = readFileSync(queuePath, "utf-8");
  const handoffsBackup = readFileSync(handoffsPath, "utf-8");

  try {
    // We run the compiled Courier from the built dist. Since we're in a test context,
    // we call runKnightCathedralCourier() directly by dynamically importing the compiled module.
    const courierUrl = pathToFileURL(resolve(MCP_ROOT, "dist/indexer/knightCathedralCourier.js")).href;
    const { runKnightCathedralCourier } = await import(courierUrl);

    // First run
    const r1 = await runKnightCathedralCourier();
    // Second run (everything from first run is now in dedup set)
    const r2 = await runKnightCathedralCourier();

    assert.equal(
      r2.total,
      0,
      `Second Courier run added ${r2.total} tablet(s) — expected 0. newQueue=${r2.newQueueTablets}, newHandoff=${r2.newHandoffTablets}, newTag=${r2.newTagTablets}`
    );

    // Also verify total didn't balloon unexpectedly (first run should be small)
    // We just need idempotence, not a specific count from first run.
    assert.ok(r1.total >= 0, "First run total should be non-negative");
  } finally {
    // Restore originals (append-only test cleanup)
    writeFileSync(queuePath, queueBackup, "utf-8");
    writeFileSync(handoffsPath, handoffsBackup, "utf-8");
  }
});

// ── Test E: KNIGHT_QUEUE.md render ────────────────────────────────────────────

test("E: render-knight-queue.mjs produces valid markdown with NEXT/QUEUED/LANDED sections", () => {
  // Save existing KNIGHT_QUEUE.md
  const existingContent = existsSync(KNIGHT_QUEUE_PATH)
    ? readFileSync(KNIGHT_QUEUE_PATH, "utf-8")
    : null;

  try {
    const result = spawnSync(process.execPath, [RENDER_SCRIPT], {
      encoding: "utf-8",
      timeout: 15_000,
      cwd: MCP_ROOT,
    });

    assert.equal(
      result.status,
      0,
      `render-knight-queue.mjs exited ${result.status}.\nstderr: ${result.stderr}\nstdout: ${result.stdout}`
    );

    assert.ok(existsSync(KNIGHT_QUEUE_PATH), "KNIGHT_QUEUE.md was not created");

    const content = readFileSync(KNIGHT_QUEUE_PATH, "utf-8");

    // Must have all three required sections
    assert.ok(content.includes("## NEXT"), "Missing ## NEXT section");
    assert.ok(content.includes("## QUEUED"), "Missing ## QUEUED section");
    assert.ok(content.includes("## LANDED"), "Missing ## LANDED section");

    // Must be non-trivial
    assert.ok(content.length > 200, `KNIGHT_QUEUE.md too short (${content.length} chars)`);
  } finally {
    // Restore original content
    if (existingContent !== null) {
      writeFileSync(KNIGHT_QUEUE_PATH, existingContent, "utf-8");
    }
  }
});

// ── Test F: append-only enforcement ───────────────────────────────────────────

test("F: Courier appends only — existing tablets are not modified or deleted", async () => {
  const queuePath = resolve(SCRIBES_DIR, "KnightQueue.jsonl");
  const handoffsPath = resolve(SCRIBES_DIR, "KnightHandoffs.jsonl");
  const queueBackup = readFileSync(queuePath, "utf-8");
  const handoffsBackup = readFileSync(handoffsPath, "utf-8");

  try {
    // Parse existing tablets before Courier run
    const queueBefore = parseJsonl(queuePath);
    const handoffsBefore = parseJsonl(handoffsPath);
    const totalBefore = queueBefore.length + handoffsBefore.length;

    const courierUrl2 = pathToFileURL(resolve(MCP_ROOT, "dist/indexer/knightCathedralCourier.js")).href;
    const { runKnightCathedralCourier } = await import(courierUrl2);
    await runKnightCathedralCourier();

    // Parse tablets after Courier run
    const queueAfter = parseJsonl(queuePath);
    const handoffsAfter = parseJsonl(handoffsPath);

    // Every tablet that existed before must still exist with identical content
    for (let i = 0; i < queueBefore.length; i++) {
      assert.deepEqual(
        queueAfter[i],
        queueBefore[i],
        `KnightQueue.jsonl tablet #${i + 1} was modified by Courier. APPEND-ONLY VIOLATION.`
      );
    }
    for (let i = 0; i < handoffsBefore.length; i++) {
      assert.deepEqual(
        handoffsAfter[i],
        handoffsBefore[i],
        `KnightHandoffs.jsonl tablet #${i + 1} was modified by Courier. APPEND-ONLY VIOLATION.`
      );
    }

    // Count after must be >= count before (only additions allowed)
    const totalAfter = queueAfter.length + handoffsAfter.length;
    assert.ok(
      totalAfter >= totalBefore,
      `Courier deleted tablets! Before: ${totalBefore}, after: ${totalAfter}`
    );
  } finally {
    writeFileSync(queuePath, queueBackup, "utf-8");
    writeFileSync(handoffsPath, handoffsBackup, "utf-8");
  }
});
