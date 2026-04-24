#!/usr/bin/env node
// verify-canonical.mjs
//
// Cross-references three files that carry canonical counts and fails if any drift:
//   1. librarian-mcp/canonical_values.yaml   (source of truth)
//   2. librarian-mcp/index/overview.json     (indexer output, read by MCP)
//   3. platform/src/hooks/useCanonicalStats.ts  (React UI hook — downstream consumer)
//
// Exit codes:
//   0 — all three agree
//   1 — drift detected (prints diff table, logs a Sentinel tidbit)
//   2 — required file missing or unparseable
//
// Wired into `npm run rebuild` so a silent drift can never survive a rebuild.
// Can also run standalone: `npm run verify:canonical`.

import { readFileSync, existsSync, appendFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MCP_ROOT = resolve(__dirname, "..");
const WORKSPACE = resolve(MCP_ROOT, "..");

const YAML_PATH = resolve(MCP_ROOT, "canonical_values.yaml");
const OVERVIEW_PATH = resolve(MCP_ROOT, "index/overview.json");
const HOOK_PATH = resolve(WORKSPACE, "platform/src/hooks/useCanonicalStats.ts");
const TIDBITS_PATH = resolve(MCP_ROOT, "stitchpunks/data/tidbits.jsonl");

const FIELDS = [
  { yamlKey: "innovation_count",            overviewKey: "innovationCount",     hookKey: "innovationCount" },
  { yamlKey: "crown_jewels",                overviewKey: "crownJewelCount",     hookKey: "crownJewels" },
  { yamlKey: "production_systems",          overviewKey: null,                   hookKey: "productionSystems" },
  { yamlKey: "formal_claims_approximate",   overviewKey: "formalClaimsCount",   hookKey: "patentClaims" },
  { yamlKey: "patent_provisionals_filed",   overviewKey: "provisionalApps",     hookKey: "patentApplications" },
];

function fail(code, msg) {
  console.error(`✗ verify:canonical FAILED — ${msg}`);
  process.exit(code);
}

function loadYaml() {
  if (!existsSync(YAML_PATH)) fail(2, `missing ${YAML_PATH}`);
  const doc = yaml.load(readFileSync(YAML_PATH, "utf-8"));
  const stats = doc?.stats;
  if (!stats) fail(2, `${YAML_PATH} has no 'stats' block`);
  return stats;
}

function loadOverview() {
  if (!existsSync(OVERVIEW_PATH)) {
    console.warn(`⚠  ${OVERVIEW_PATH} missing — run \`npm run rebuild:full\` first. Skipping overview check.`);
    return null;
  }
  return JSON.parse(readFileSync(OVERVIEW_PATH, "utf-8"));
}

// Overview-only fields: checked ONLY between overview.json and the hook.
// These are indexer-derived counts (not YAML-sourced), added in K460.
const OVERVIEW_ONLY_FIELDS = [
  { overviewKey: "knightSessionCount", hookKey: "knightSessions" },
  { overviewKey: "bishopSessionCount", hookKey: "bishopSessions" },
];

function loadHook() {
  if (!existsSync(HOOK_PATH)) {
    console.warn(`⚠  ${HOOK_PATH} missing — skipping hook check.`);
    return null;
  }
  const src = readFileSync(HOOK_PATH, "utf-8");
  const values = {};
  const extract = (key) => {
    const m = src.match(new RegExp(`${key}\\s*:\\s*(\\d[\\d_]*)`));
    return m ? parseInt(m[1].replace(/_/g, ""), 10) : null;
  };
  for (const f of FIELDS) {
    values[f.hookKey] = extract(f.hookKey);
  }
  for (const f of OVERVIEW_ONLY_FIELDS) {
    values[f.hookKey] = extract(f.hookKey);
  }
  return values;
}

function logTidbit(entry) {
  try {
    mkdirSync(dirname(TIDBITS_PATH), { recursive: true });
    appendFileSync(TIDBITS_PATH, JSON.stringify(entry) + "\n");
  } catch {
    // tidbits are best-effort — don't fail verify on a logging error
  }
}

const stats = loadYaml();
const overview = loadOverview();
const hook = loadHook();

const rows = [];
const drifts = [];

for (const f of FIELDS) {
  const yamlVal = stats[f.yamlKey];
  const overviewVal = (overview && f.overviewKey) ? overview[f.overviewKey] : "—";
  const hookVal = hook ? hook[f.hookKey] : "—";
  const row = { field: f.yamlKey, yaml: yamlVal, overview: overviewVal, hook: hookVal };
  rows.push(row);

  if (overview && f.overviewKey && overviewVal !== yamlVal) {
    drifts.push(`overview.${f.overviewKey}=${overviewVal} ≠ yaml.${f.yamlKey}=${yamlVal}`);
  }
  if (hook && hookVal !== yamlVal) {
    drifts.push(`hook.${f.hookKey}=${hookVal} ≠ yaml.${f.yamlKey}=${yamlVal}`);
  }
}

// Overview-only drift checks (K460): overview ↔ hook, no YAML counterpart
const overviewOnlyRows = [];
if (overview) {
  for (const f of OVERVIEW_ONLY_FIELDS) {
    const overviewVal = overview[f.overviewKey] ?? "—";
    const hookVal = hook ? (hook[f.hookKey] ?? "—") : "—";
    overviewOnlyRows.push({ field: f.overviewKey, overview: overviewVal, hook: hookVal });
    if (hook && hookVal !== overviewVal && overviewVal !== "—") {
      drifts.push(`hook.${f.hookKey}=${hookVal} ≠ overview.${f.overviewKey}=${overviewVal}`);
    }
  }
}

console.log("Canonical verification — YAML vs overview.json vs useCanonicalStats.ts");
console.log("─".repeat(78));
console.log("field".padEnd(34) + "yaml".padEnd(12) + "overview".padEnd(12) + "hook");
console.log("─".repeat(78));
for (const r of rows) {
  console.log(
    r.field.padEnd(34) +
    String(r.yaml).padEnd(12) +
    String(r.overview).padEnd(12) +
    String(r.hook)
  );
}
if (overviewOnlyRows.length) {
  console.log("─".repeat(78));
  console.log("(overview-only fields — K460 indexer-derived session counts)");
  for (const r of overviewOnlyRows) {
    console.log(r.field.padEnd(34) + "—".padEnd(12) + String(r.overview).padEnd(12) + String(r.hook));
  }
}
console.log("─".repeat(78));

const verifiedAt = new Date().toISOString();

if (drifts.length > 0) {
  console.error(`\n✗ DRIFT DETECTED (${drifts.length}):`);
  for (const d of drifts) console.error(`  - ${d}`);
  console.error(`\nFix: update the trailing files to match canonical_values.yaml, or update the YAML first then rebuild.`);
  logTidbit({
    ts: verifiedAt,
    scribe: "SP-5-SENTINEL",
    kind: "canonical_verify_fail",
    drifts,
    yaml_path: YAML_PATH,
  });
  process.exit(1);
}

console.log("\n✓ All canonical surfaces agree.");
logTidbit({
  ts: verifiedAt,
  scribe: "SP-5-SENTINEL",
  kind: "canonical_verify_pass",
  fields_checked: FIELDS.length,
});
process.exit(0);
