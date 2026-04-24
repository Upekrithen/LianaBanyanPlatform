#!/usr/bin/env node
/**
 * rebuild_auto_keywords.mjs — K474/B122 Self-Indexing Scribes (updated K475/B122)
 * ==================================================================================
 * CLI: reads Bishop, Knight, and Pawn Cathedral registries, runs corpus-derived
 * keyword extraction for each Scribe, and writes sidecar YAMLs:
 *   Bishop:  stitchpunks/scribes/auto_keywords/<scribe_id>.yaml
 *   Knight:  stitchpunks/knight_cathedral/auto_keywords/<scribe_id>.yaml
 *   Pawn:    stitchpunks/pawn_cathedral/auto_keywords/<scribe_id>.yaml
 *
 * Idempotent: safe to re-run. Re-running overwrites sidecar files with fresh results.
 *
 * Usage:
 *   node scripts/rebuild_auto_keywords.mjs [--verbose]
 *
 * Must run from the librarian-mcp/ directory (or with npm run rebuild:auto_keywords).
 * Requires: tsc already run (reads dist/scribes/autoExtract.js).
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LIBRARIAN_ROOT = resolve(__dirname, "..");
const STITCHPUNKS_DIR = resolve(LIBRARIAN_ROOT, "stitchpunks");

const verbose = process.argv.includes("--verbose");

// Import autoExtract from compiled dist
const {
  extractAllAutoKeywords,
  writeAutoKeywordSidecar,
  getAutoKeywordsDirForBase,
  EXTRACTOR_VERSION,
} = await import("../dist/scribes/autoExtract.js");

function log(msg) {
  console.log(msg);
}

function vlog(msg) {
  if (verbose) console.log("  " + msg);
}

// ─── Load a registry YAML ────────────────────────────────────────────────────

function loadRegistry(yamlPath) {
  if (!existsSync(yamlPath)) {
    log(`[rebuild_auto_keywords] WARNING: Registry not found at ${yamlPath} — skipping`);
    return null;
  }
  const raw = readFileSync(yamlPath, "utf-8");
  const parsed = yaml.load(raw);
  if (!parsed || !Array.isArray(parsed.scribes)) {
    log(`[rebuild_auto_keywords] WARNING: Registry malformed at ${yamlPath} — skipping`);
    return null;
  }
  // Defensive defaults (same as registry.ts)
  for (const s of parsed.scribes) {
    s.adjacents = s.adjacents || [];
    s.keywords = (s.keywords || []).filter((k) => typeof k === "string");
  }
  return parsed;
}

// ─── Run extraction for one cathedral ────────────────────────────────────────

async function processRegistry(registryPath, scribesDir, cathedralName) {
  const registry = loadRegistry(registryPath);
  if (!registry) return null;

  log(`\n[${cathedralName}] Processing ${registry.scribes.length} Scribes...`);
  const autoDir = getAutoKeywordsDirForBase(scribesDir);

  const results = extractAllAutoKeywords(registry);
  const summary = [];

  for (const [scribeId, result] of results) {
    writeAutoKeywordSidecar(result, autoDir);

    const top5 = result.keywords.slice(0, 5);
    const status = result.fileCount === 0 ? "EMPTY (no corpus)" : `${result.keywords.length} keywords, ${result.fileCount} files`;

    log(`  [${cathedralName}] ${scribeId}: ${status}`);
    if (result.keywords.length > 0) {
      vlog(`Top-5: ${top5.map((k) => `"${k}"`).join(", ")}`);
    }

    summary.push({
      scribeId,
      keywordCount: result.keywords.length,
      fileCount: result.fileCount,
      keeperCount: result.keeperCount,
      sourceHash: result.sourceHash,
      top5,
    });
  }

  return summary;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

log(`\n=== rebuild_auto_keywords.mjs (extractor v${EXTRACTOR_VERSION}) ===`);
log(`Workspace root: ${resolve(LIBRARIAN_ROOT, "..")}`);

const bishopRegistryPath = resolve(STITCHPUNKS_DIR, "scribes", "registry.yaml");
const bishopScribesDir = resolve(STITCHPUNKS_DIR, "scribes");

const knightRegistryPath = resolve(STITCHPUNKS_DIR, "knight_cathedral", "registry.yaml");
const knightScribesDir = resolve(STITCHPUNKS_DIR, "knight_cathedral");

const pawnRegistryPath = resolve(STITCHPUNKS_DIR, "pawn_cathedral", "registry.yaml");
const pawnScribesDir = resolve(STITCHPUNKS_DIR, "pawn_cathedral");

const bishopSummary = await processRegistry(bishopRegistryPath, bishopScribesDir, "Bishop");
const knightSummary = await processRegistry(knightRegistryPath, knightScribesDir, "Knight");
const pawnSummary = await processRegistry(pawnRegistryPath, pawnScribesDir, "Pawn");

// ─── Print summary table ──────────────────────────────────────────────────────

log("\n=== SUMMARY ===");
log("Cathedral | Scribe           | Keywords | Files | Top-5 Distinctive Terms");
log("----------|------------------|----------|-------|------------------------");

function printSummary(entries, cathedralName) {
  if (!entries) {
    log(`${cathedralName.padEnd(9)} | (registry not found)`);
    return;
  }
  for (const e of entries) {
    const cath = cathedralName.padEnd(9);
    const id = e.scribeId.padEnd(16);
    const kwCount = String(e.keywordCount).padStart(8);
    const fCount = String(e.fileCount).padStart(5);
    const top5str = e.top5.slice(0, 3).map((k) => `"${k}"`).join(", ");
    log(`${cath} | ${id} | ${kwCount} | ${fCount} | ${top5str}`);
  }
}

printSummary(bishopSummary, "Bishop");
printSummary(knightSummary, "Knight");
printSummary(pawnSummary, "Pawn");

log("\nDone. Sidecar YAMLs written. Run 'npm run build' + 'npm test' to verify.");
