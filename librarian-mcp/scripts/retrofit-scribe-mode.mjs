#!/usr/bin/env node
/**
 * retrofit-scribe-mode.mjs (K466 / B121)
 * =======================================
 * Idempotent: flags corpus-mode Scribes in both Cathedral registries.
 *
 * Corpus heuristic:
 *   1. Explicit list: R11 is always corpus.
 *   2. Any Scribe whose canonical_keepers contains only static files ending in
 *      .md, .yaml, or .json (no directory references, no glob patterns) is
 *      classified corpus — these are reference artefacts, not live observation streams.
 *
 * Observational heuristic:
 *   All other Scribes default to observational.
 *
 * Running twice produces identical output (idempotent).
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

/**
 * Write updated mode fields back to a registry YAML file using targeted string
 * replacement — preserves comments, section dividers, and formatting exactly.
 *
 * Strategy: for each scribe entry that changed mode, find the line:
 *   '  - id: <ScribeId>' followed immediately by '    mode: <oldMode>' or
 *   '  - id: <ScribeId>' followed by '    primary:' (no mode line yet),
 * and insert or replace accordingly.
 */
function writeRegistryPreservingComments(registryPath, changes) {
  if (changes.length === 0) return;
  let content = readFileSync(registryPath, "utf-8");

  for (const { id, oldMode, newMode } of changes) {
    if (oldMode === undefined || oldMode === null) {
      // No mode line yet — insert after '  - id: <id>\n'
      content = content.replace(
        new RegExp(`(  - id: ${id}\\n)(    primary:)`),
        `$1    mode: ${newMode}\n$2`,
      );
    } else {
      // Replace existing mode line
      content = content.replace(
        new RegExp(`(  - id: ${id}\\n    mode: )${oldMode}(\\n)`),
        `$1${newMode}$2`,
      );
    }
  }

  writeFileSync(registryPath, content, "utf-8");
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const STITCHPUNKS = resolve(__dirname, "..", "stitchpunks");

const BISHOP_REGISTRY = resolve(STITCHPUNKS, "scribes", "registry.yaml");
const KNIGHT_REGISTRY = resolve(STITCHPUNKS, "knight_cathedral", "registry.yaml");

/**
 * Explicit corpus Scribe IDs: static reference corpora that serve all tablets
 * with no recency semantics. Add new corpus Scribes here when instantiating
 * reference material (e.g., canonical_values-derived Scribes).
 *
 * Heuristic extension (future): scan tablet source_document fields for Scribes
 * whose every tablet came from the same single static file (like r11_canonical_corpus.md).
 * For now, explicit list is the correct gate — the canonical_keepers heuristic
 * is too aggressive (classifies observational Scribes with static canonical references).
 */
const EXPLICIT_CORPUS = new Set(["R11"]);

function classifyMode(scribe) {
  if (EXPLICIT_CORPUS.has(scribe.id)) return "corpus";
  return "observational";
}

function processRegistry(registryPath, label) {
  if (!existsSync(registryPath)) {
    console.log(`[retrofit-scribe-mode] SKIP ${label}: file not found at ${registryPath}`);
    return { changed: 0, total: 0, results: [] };
  }

  const raw = readFileSync(registryPath, "utf-8");
  const parsed = yaml.load(raw);

  if (!parsed || !Array.isArray(parsed.scribes)) {
    console.error(`[retrofit-scribe-mode] ERROR ${label}: no 'scribes' array`);
    return { changed: 0, total: 0, results: [] };
  }

  const changes = [];
  const results = [];

  for (const scribe of parsed.scribes) {
    const targetMode = classifyMode(scribe);
    const prevMode = scribe.mode;
    if (prevMode !== targetMode) {
      changes.push({ id: scribe.id, oldMode: prevMode, newMode: targetMode });
    }
    results.push({
      id: scribe.id,
      mode: targetMode,
      was: prevMode ?? "(unset)",
      changed: prevMode !== targetMode,
    });
  }

  if (changes.length > 0) {
    // Use targeted string replacement to preserve comments and YAML formatting
    writeRegistryPreservingComments(registryPath, changes);
    console.log(`[retrofit-scribe-mode] ${label}: updated ${changes.length} Scribe(s)`);
  } else {
    console.log(`[retrofit-scribe-mode] ${label}: already up-to-date (0 changes)`);
  }

  return { changed: changes.length, total: parsed.scribes.length, results };
}

const bishop = processRegistry(BISHOP_REGISTRY, "Bishop's Cathedral");
const knight = processRegistry(KNIGHT_REGISTRY, "Knight's Cathedral");

console.log("\n── Retrofit summary ──────────────────────────────────────");
for (const r of bishop.results) {
  const marker = r.mode === "corpus" ? "CORPUS" : "observ";
  const flag = r.changed ? " ← changed" : "";
  console.log(`  Bishop  ${r.id.padEnd(20)} ${marker}${flag}`);
}
for (const r of knight.results) {
  const marker = r.mode === "corpus" ? "CORPUS" : "observ";
  const flag = r.changed ? " ← changed" : "";
  console.log(`  Knight  ${r.id.padEnd(20)} ${marker}${flag}`);
}

const totalChanged = bishop.changed + knight.changed;
const corpusCount = [...bishop.results, ...knight.results].filter(r => r.mode === "corpus").length;
console.log(`\nTotal Scribes: ${bishop.total + knight.total} | Corpus: ${corpusCount} | Changed: ${totalChanged}`);
if (totalChanged === 0) console.log("(idempotent — no writes performed)");
