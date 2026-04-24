#!/usr/bin/env node
/**
 * ingest-r11-corpus-knight.mjs (K455a / B121)
 * ============================================
 * Ingest the R11 canonical corpus into Knight's Cathedral as a corpus-mode Scribe.
 * Creates: librarian-mcp/stitchpunks/knight_cathedral/scribes/KnightR11.jsonl
 * Adds:    KnightR11 entry to knight_cathedral/registry.yaml (mode: corpus)
 *
 * Idempotent: checks for existing entries by fact_id before appending.
 * Running twice produces zero new writes.
 *
 * This enables K455a Multi-Cathedral replication arm:
 *   Haiku/Opus + consult_scribes(cathedral="knight") → should HOT on R11 questions
 *   once KnightR11 scribe is loaded (unlike K455c Arm1 control where Knight had no R11).
 *
 * Source_session: K455a  (distinct from Bishop's K455c ingestion)
 * Usage:
 *   node librarian-mcp/scripts/ingest-r11-corpus-knight.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, existsSync, appendFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = resolve(__dirname, "..", "..");

const CORPUS_PATH = resolve(WORKSPACE_ROOT, "librarian-mcp", "r10_cross_vendor", "r11_canonical_corpus.md");
const KNIGHT_SCRIBES_DIR = resolve(WORKSPACE_ROOT, "librarian-mcp", "stitchpunks", "knight_cathedral", "scribes");
const KNIGHT_REGISTRY_PATH = resolve(WORKSPACE_ROOT, "librarian-mcp", "stitchpunks", "knight_cathedral", "registry.yaml");
const TABLET_PATH = resolve(KNIGHT_SCRIBES_DIR, "KnightR11.jsonl");

const DRY_RUN = process.argv.includes("--dry-run");
const SESSION = "K455a";
const SOURCE_DOC = "r10_cross_vendor/r11_canonical_corpus.md";
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

const lines = corpus.split("\n").map((l) => l.replace(/\r$/, ""));

const headings = {};
const HEADING_RE = /^###\s+((?:CS|AM|EG|MJ|RC|HP)-\d+)\s+[—–]\s+(.+)$/;
for (const line of lines) {
  const m = line.match(HEADING_RE);
  if (m) headings[m[1]] = m[2].trim();
}

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

console.log(`[ingest-r11-corpus-knight] Parsed ${facts.length} canonical facts from corpus.`);
if (facts.length !== 50) {
  console.warn(`  WARNING: expected 50 facts, got ${facts.length}. Check corpus parse.`);
}

// ─── Check idempotency ─────────────────────────────────────────────────────
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
  console.log(`  KnightR11 tablet exists with ${existingFactIds.size} already-ingested fact IDs.`);
}

const toIngest = facts.filter((f) => !existingFactIds.has(f.fact_id));
console.log(`  Facts to ingest: ${toIngest.length} (${facts.length - toIngest.length} already present, skipped)`);

// ─── Write header if tablet doesn't exist ─────────────────────────────────
if (!existsSync(TABLET_PATH)) {
  const header = {
    type: "header",
    scribe_id: "KnightR11",
    primary_level: 1,
    primary_field: "R11 canonical corpus — cooperative AI platform benchmark fixture (50 facts, 6 categories) [Knight's Cathedral copy, K455a multi-Cathedral replication arm]",
    adjacents: [
      { level: 2, field: "Verdania cooperative platform statistics" },
      { level: 2, field: "Thornwick architecture mechanics" },
      { level: 3, field: "cooperative governance economics" },
      { level: 3, field: "member journey and lifecycle" },
      { level: 4, field: "regulatory compliance protocols" },
      { level: 4, field: "historical precedent and case law" },
    ],
    opened: NOW,
    opened_by: `${SESSION} (K455a multi-Cathedral replication — R11 ingestion into Knight's Cathedral)`,
    spec: "../SP22_SP23_THREE_FATES_AND_SCRIBES_CATHEDRAL_SPEC.md",
    corpus_id: "R11-CANONICAL-K444-v2",
    source_document: SOURCE_DOC,
    source_session: SESSION,
    note: "This is the Knight's Cathedral copy of Bishop's scribe_R11 corpus. Ingested K455a for multi-Cathedral replication arm. Bishop Cathedral is the primary; this is a parity replica for the benchmark.",
  };
  if (!DRY_RUN) {
    writeFileSync(TABLET_PATH, JSON.stringify(header) + "\n", "utf-8");
    console.log("  Created KnightR11 tablet header.");
  } else {
    console.log("  [DRY RUN] Would create KnightR11 tablet header.");
  }
}

// ─── Append new facts ─────────────────────────────────────────────────────
let appended = 0;
for (const fact of toIngest) {
  // Knight Cathedral tablet schema: observation/category/timestamp/source_session/source_document/tokens
  const entry = {
    observation: fact.observation,
    category: fact.category,
    timestamp: NOW,
    source_session: SESSION,
    source_document: SOURCE_DOC,
    tokens: fact.tokens,
    fact_id: fact.fact_id,
    scope: "public",
    // Also include Bishop-compat fields for cross-Cathedral normalization
    ts: NOW,
    session: SESSION,
    source: "r10_cross_vendor/r11_canonical_corpus.md",
    canonical_ref: SOURCE_DOC,
  };

  if (!DRY_RUN) {
    appendFileSync(TABLET_PATH, JSON.stringify(entry) + "\n", "utf-8");
  }
  appended++;

  const dryTag = DRY_RUN ? "[DRY RUN] " : "";
  console.log(`  ${dryTag}${fact.fact_id} (${fact.category}) — "${fact.observation.slice(0, 80)}..."`);
}

console.log(`\n[ingest-r11-corpus-knight] ${DRY_RUN ? "Would ingest" : "Ingested"} ${appended} facts into ${TABLET_PATH}`);

// ─── Update Knight Cathedral registry.yaml ────────────────────────────────
if (!existsSync(KNIGHT_REGISTRY_PATH)) {
  console.error(`FATAL: Knight registry not found at ${KNIGHT_REGISTRY_PATH}`);
  process.exit(1);
}

const regRaw = readFileSync(KNIGHT_REGISTRY_PATH, "utf-8");
const parsed = yaml.load(regRaw);

const alreadyHasKnightR11 = parsed.scribes.some((s) => s.id === "KnightR11");
if (alreadyHasKnightR11) {
  console.log("\n[ingest-r11-corpus-knight] KnightR11 already in registry.yaml — skipping registry update (idempotent).");
} else {
  // Build the YAML block to append for KnightR11
  const newScribeYaml = `
  - id: KnightR11
    mode: corpus
    primary:
      level: 1
      field: R11 canonical corpus — cooperative AI platform benchmark fixture (50 facts, 6 categories) [Knight Cathedral copy, K455a]
      canonical_keepers:
        - librarian-mcp/r10_cross_vendor/r11_canonical_corpus.md
    adjacents:
      - level: 2
        field: Verdania cooperative platform statistics
      - level: 2
        field: Thornwick architecture mechanics
      - level: 3
        field: cooperative governance economics
      - level: 3
        field: member journey and lifecycle
      - level: 4
        field: regulatory compliance protocols
      - level: 4
        field: historical precedent and case law
    keywords:
      - Verdania
      - Thornwick
      - Cairnfield
      - cooperative
      - R11
      - benchmark
      - canonical
      - corpus
      - statistics
      - member
      - governance
      - compliance
      - historical
      - precedent
      - architecture
      - mechanics
      - CS-01
      - AM-01
      - EG-01
      - MJ-01
      - RC-01
      - HP-01
    activation_threshold: any R11 benchmark fact query about cooperative platform statistics, governance, or architecture
`;

  const updatedReg = regRaw.trimEnd() + "\n" + newScribeYaml + "\n";
  if (!DRY_RUN) {
    writeFileSync(KNIGHT_REGISTRY_PATH, updatedReg, "utf-8");
    console.log("\n[ingest-r11-corpus-knight] Added KnightR11 entry to registry.yaml.");
  } else {
    console.log("\n[DRY RUN] Would add KnightR11 entry to registry.yaml.");
  }
}

if (toIngest.length === 0 && alreadyHasKnightR11) {
  console.log("\n[ingest-r11-corpus-knight] Nothing to do — fully idempotent.");
} else if (!DRY_RUN) {
  console.log("\n[ingest-r11-corpus-knight] Done. Run 'cd librarian-mcp && npm run build' to recompile.");
}
