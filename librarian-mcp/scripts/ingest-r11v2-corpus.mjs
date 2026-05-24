#!/usr/bin/env node
/**
 * ingest-r11v2-corpus.mjs (K528-followup / B130)
 * ===============================================
 * Ingest the R11-v2 canonical corpus (150 facts) into Bishop's Cathedral scribe_R11.jsonl.
 * Idempotent: checks for existing entries by fact_id before appending. The v1 ingestion
 * (K455c, 50 facts) already populated CS-01..HP-08; this run adds the 100 new v2 facts
 * (CS-09..HP-30 etc. depending on category distribution in the v2 corpus).
 *
 * Companion to K528 closeout. Lifts Cathedral coverage from 50/150 → 150/150 facts so
 * all 6 lb_cathedral_* conditions move from ~30% HOT (current K528 ceiling) toward the
 * projected ~90% HOT validated by claude_projects vendor-native baselines.
 *
 * Each new fact becomes one JSONL entry:
 *   { ts, session, observation, source, canonical_ref, category, scope, tokens, source_session, source_document, corpus_version: "v2" }
 *
 * Usage:
 *   node librarian-mcp/scripts/ingest-r11v2-corpus.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, existsSync, appendFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = resolve(__dirname, "..", "..");

const CORPUS_PATH = resolve(WORKSPACE_ROOT, "librarian-mcp", "r10_cross_vendor", "r11v2_canonical_corpus_100k.md");
const TABLET_PATH = resolve(WORKSPACE_ROOT, "librarian-mcp", "stitchpunks", "scribes", "scribe_R11.jsonl");

const DRY_RUN = process.argv.includes("--dry-run");
const SESSION = "K528-followup-B130";
const SOURCE_DOC = "r10_cross_vendor/r11v2_canonical_corpus_100k.md";
const NOW = new Date().toISOString();

if (!existsSync(CORPUS_PATH)) {
  console.error(`FATAL: corpus not found at ${CORPUS_PATH}`);
  process.exit(1);
}

const corpus = readFileSync(CORPUS_PATH, "utf-8");

// ─── Parse canonical facts ─────────────────────────────────────────────────
const CATEGORY_MAP = {
  CS: "canonical_statistics",
  AM: "architecture_mechanics",
  EG: "economic_governance",
  MJ: "member_journey",
  RC: "regulatory_compliance",
  HP: "historical_precedent",
};

// Split corpus into lines for sequential parsing (strip \r for CRLF compatibility)
const lines = corpus.split("\n").map((l) => l.replace(/\r$/, ""));

// Extract section headings: "### CS-01 — Verdania Membership" (optional in v2)
const headings = {};
const HEADING_RE = /^###\s+((?:CS|AM|EG|MJ|RC|HP)-\d+)\s+[—–]\s+(.+)$/;
for (const line of lines) {
  const m = line.match(HEADING_RE);
  if (m) headings[m[1]] = m[2].trim();
}

// Extract canonical fact sentences: lines starting with "**XX-NN.**"
const facts = [];
const FACT_START_RE = /^\*\*((?:CS|AM|EG|MJ|RC|HP)-\d+)\.\*\*\s+(.*)/;

for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(FACT_START_RE);
  if (!m) continue;

  const factId = m[1];
  const factLines = [m[2].trim()];
  for (let j = i + 1; j < lines.length; j++) {
    const next = lines[j];
    if (next.trim() === "") break;
    if (next.startsWith("---") || next.startsWith("##") || next.startsWith("**")) break;
    factLines.push(next.trim());
  }

  const rawText = factLines.join(" ").replace(/\s+/g, " ").trim();
  const prefix = factId.slice(0, 2);
  const category = CATEGORY_MAP[prefix] || "unknown";
  const heading = headings[factId] || factId;

  facts.push({
    fact_id: factId,
    category,
    heading,
    observation: `[${factId} — ${heading}] ${rawText}`,
    tokens: Math.round(rawText.split(/\s+/).length),
  });
}

console.log(`[ingest-r11v2-corpus] Parsed ${facts.length} canonical facts from v2 corpus.`);
if (facts.length !== 150) {
  console.warn(`  WARNING: expected 150 facts, got ${facts.length}. Check corpus parse.`);
}

// ─── Load existing tablet to check idempotency ────────────────────────────
let existingFactIds = new Set();
if (existsSync(TABLET_PATH)) {
  const existing = readFileSync(TABLET_PATH, "utf-8");
  for (const line of existing.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const obj = JSON.parse(trimmed);
      if (obj.fact_id) existingFactIds.add(obj.fact_id);
      if (obj.observation && typeof obj.observation === "string") {
        const bracket = obj.observation.match(/^\[((CS|AM|EG|MJ|RC|HP)-\d+)/);
        if (bracket) existingFactIds.add(bracket[1]);
      }
    } catch {
      // Skip malformed
    }
  }
  console.log(`  Tablet exists with ${existingFactIds.size} already-ingested fact IDs.`);
}

// ─── Filter to new facts only ──────────────────────────────────────────────
const toIngest = facts.filter((f) => !existingFactIds.has(f.fact_id));
console.log(`  Facts to ingest: ${toIngest.length} (${facts.length - toIngest.length} already present, skipped)`);

if (toIngest.length === 0) {
  console.log("[ingest-r11v2-corpus] Nothing to do — all v2 facts already ingested.");
  process.exit(0);
}

// ─── Write header if tablet doesn't exist (defensive — tablet should exist post-K455c) ─
if (!existsSync(TABLET_PATH)) {
  console.warn("  WARNING: tablet missing; writing header. v1 K455c ingestion appears not to have run.");
  const header = {
    type: "header",
    scribe_id: "R11",
    primary_level: 1,
    primary_field: "R11 canonical corpus — cooperative AI platform benchmark fixture (150 facts, 6 categories) — v2 expansion B130",
    adjacents: [
      { level: 2, field: "Verdania cooperative platform statistics" },
      { level: 2, field: "Thornwick architecture mechanics" },
      { level: 3, field: "cooperative governance economics" },
      { level: 3, field: "member journey and lifecycle" },
      { level: 4, field: "regulatory compliance protocols" },
      { level: 4, field: "historical precedent and case law" },
    ],
    opened: NOW,
    opened_by: `${SESSION} (K528-followup R11-v2 ingestion)`,
    spec: "../SP22_SP23_THREE_FATES_AND_SCRIBES_CATHEDRAL_SPEC.md",
    corpus_id: "R11-CANONICAL-K528-v2",
    source_document: SOURCE_DOC,
  };
  if (!DRY_RUN) {
    writeFileSync(TABLET_PATH, JSON.stringify(header) + "\n", "utf-8");
    console.log("  Created tablet header.");
  } else {
    console.log("  [DRY RUN] Would create tablet header.");
  }
}

// ─── Append new facts ─────────────────────────────────────────────────────
let appended = 0;
for (const fact of toIngest) {
  const entry = {
    ts: NOW,
    session: SESSION,
    observation: fact.observation,
    source: "knight_ship",
    canonical_ref: SOURCE_DOC,
    category: fact.category,
    fact_id: fact.fact_id,
    tokens: fact.tokens,
    scope: "public",
    source_session: SESSION,
    source_document: SOURCE_DOC,
    corpus_version: "v2",
  };

  if (!DRY_RUN) {
    appendFileSync(TABLET_PATH, JSON.stringify(entry) + "\n", "utf-8");
  }
  appended++;

  const dryTag = DRY_RUN ? "[DRY RUN] " : "";
  console.log(`  ${dryTag}${fact.fact_id} (${fact.category}) — "${fact.observation.slice(0, 80)}..."`);
}

console.log(`\n[ingest-r11v2-corpus] ${DRY_RUN ? "Would ingest" : "Ingested"} ${appended} v2 facts into ${TABLET_PATH}`);
if (DRY_RUN) {
  console.log("Re-run without --dry-run to apply.");
}
