#!/usr/bin/env node
/**
 * retrofit-tablet-scope.mjs (K455c / B121)
 * =========================================
 * Idempotently adds `scope: "public"` to every tablet entry in both
 * Bishop's Cathedral and Knight's Cathedral. Skips header rows
 * (type === "header"). No-op if scope already present.
 *
 * Usage:
 *   node librarian-mcp/scripts/retrofit-tablet-scope.mjs [--dry-run]
 *
 * Reads from:
 *   librarian-mcp/stitchpunks/scribes/         (Bishop's Cathedral)
 *   librarian-mcp/stitchpunks/knight_cathedral/scribes/  (Knight's Cathedral)
 *
 * Writes in-place (atomic per-file via write+rename).
 */
import { readFileSync, writeFileSync, readdirSync, renameSync, existsSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = resolve(__dirname, "..", "..");

const BISHOP_SCRIBES = resolve(WORKSPACE_ROOT, "librarian-mcp", "stitchpunks", "scribes");
const KNIGHT_SCRIBES = resolve(WORKSPACE_ROOT, "librarian-mcp", "stitchpunks", "knight_cathedral", "scribes");

const DRY_RUN = process.argv.includes("--dry-run");

if (DRY_RUN) {
  console.log("[retrofit-tablet-scope] DRY RUN — no files will be written.");
}

/**
 * Process one JSONL file: add scope: "public" to every non-header line
 * that lacks a scope field. Returns { linesTotal, linesModified, linesSkipped }.
 */
function retrofitFile(filePath) {
  const raw = readFileSync(filePath, "utf-8");
  const lines = raw.split("\n");

  let linesTotal = 0;
  let linesModified = 0;
  let linesSkipped = 0;

  const outLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return line; // preserve blank lines (trailing newline)

    let obj;
    try {
      obj = JSON.parse(trimmed);
    } catch {
      // Malformed line — preserve as-is, don't touch
      linesSkipped++;
      return line;
    }

    linesTotal++;

    // Header rows are not observation tablets; skip scope injection
    if (obj.type === "header") {
      return line;
    }

    // Already has scope — idempotent no-op
    if (Object.prototype.hasOwnProperty.call(obj, "scope")) {
      return line;
    }

    // Inject scope: "public"
    obj.scope = "public";
    linesModified++;
    return JSON.stringify(obj);
  });

  if (linesModified > 0 && !DRY_RUN) {
    // Atomic write: write to temp file, then rename over original
    const tmpPath = resolve(tmpdir(), `retrofit-${randomUUID()}.jsonl`);
    writeFileSync(tmpPath, outLines.join("\n"), "utf-8");
    renameSync(tmpPath, filePath);
  }

  return { linesTotal, linesModified, linesSkipped };
}

/**
 * Process all .jsonl files in a directory.
 */
function retrofitDirectory(dir, label) {
  if (!existsSync(dir)) {
    console.log(`[retrofit-tablet-scope] SKIP ${label}: directory not found at ${dir}`);
    return { files: 0, linesTotal: 0, linesModified: 0 };
  }

  const files = readdirSync(dir).filter((f) => f.endsWith(".jsonl"));
  if (files.length === 0) {
    console.log(`[retrofit-tablet-scope] SKIP ${label}: no .jsonl files found.`);
    return { files: 0, linesTotal: 0, linesModified: 0 };
  }

  let totalLines = 0;
  let totalModified = 0;

  for (const file of files) {
    const filePath = resolve(dir, file);
    const { linesTotal, linesModified, linesSkipped } = retrofitFile(filePath);
    totalLines += linesTotal;
    totalModified += linesModified;
    const tag = linesModified > 0 ? `+${linesModified} scope fields added` : "already clean";
    const dryTag = DRY_RUN && linesModified > 0 ? " [DRY RUN — not written]" : "";
    console.log(`  ${basename(file).padEnd(40)} lines=${linesTotal} skipped=${linesSkipped}  ${tag}${dryTag}`);
  }

  return { files: files.length, linesTotal: totalLines, linesModified: totalModified };
}

// ─── Main ──────────────────────────────────────────────────────────────────

console.log("[retrofit-tablet-scope] K455c/B121 — scope field retrofit on both Cathedrals");
console.log();

console.log(`Bishop's Cathedral: ${BISHOP_SCRIBES}`);
const bishop = retrofitDirectory(BISHOP_SCRIBES, "Bishop's Cathedral");
console.log(`  → ${bishop.files} files, ${bishop.linesTotal} observation lines, ${bishop.linesModified} modified`);
console.log();

console.log(`Knight's Cathedral: ${KNIGHT_SCRIBES}`);
const knight = retrofitDirectory(KNIGHT_SCRIBES, "Knight's Cathedral");
console.log(`  → ${knight.files} files, ${knight.linesTotal} observation lines, ${knight.linesModified} modified`);
console.log();

const totalModified = bishop.linesModified + knight.linesModified;
const totalLines = bishop.linesTotal + knight.linesTotal;
console.log(`[retrofit-tablet-scope] COMPLETE`);
console.log(`  Total tablet lines processed: ${totalLines}`);
console.log(`  Total scope fields added:     ${totalModified}`);
if (totalModified === 0) {
  console.log("  (All tablets already had scope — retrofit was a no-op.)");
}
if (DRY_RUN && totalModified > 0) {
  console.log("  DRY RUN: re-run without --dry-run to apply changes.");
}
