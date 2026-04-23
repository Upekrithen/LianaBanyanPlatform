#!/usr/bin/env node
// codegen-canonical-hook.mjs
//
// Reads librarian-mcp/canonical_values.yaml and rewrites the five YAML-sourced
// default values in platform/src/hooks/useCanonicalStats.ts. Idempotent.
//
// YAML-sourced fields (codegen-owned, do not hand-edit):
//   innovationCount, crownJewels, patentApplications, patentClaims, productionSystems
//
// All other DEFAULTS fields (founderAge, knightSessions, portfolioValueLow, etc.)
// are hand-maintained and left alone.
//
// Runs before `verify:canonical` in the rebuild chain, so any drift that slipped
// in between rebuilds gets corrected before verification runs.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MCP_ROOT = resolve(__dirname, "..");
const WORKSPACE = resolve(MCP_ROOT, "..");

const YAML_PATH = resolve(MCP_ROOT, "canonical_values.yaml");
const HOOK_PATH = resolve(WORKSPACE, "platform/src/hooks/useCanonicalStats.ts");

const FIELD_MAP = [
  { yamlKey: "innovation_count",          hookKey: "innovationCount" },
  { yamlKey: "crown_jewels",              hookKey: "crownJewels" },
  { yamlKey: "patent_provisionals_filed", hookKey: "patentApplications" },
  { yamlKey: "formal_claims_approximate", hookKey: "patentClaims" },
  { yamlKey: "production_systems",        hookKey: "productionSystems" },
];

if (!existsSync(YAML_PATH)) {
  console.error(`✗ codegen-canonical-hook: missing ${YAML_PATH}`);
  process.exit(2);
}
if (!existsSync(HOOK_PATH)) {
  console.warn(`⚠  codegen-canonical-hook: ${HOOK_PATH} not found — skipping (platform/ may be absent in this checkout)`);
  process.exit(0);
}

const doc = yaml.load(readFileSync(YAML_PATH, "utf-8"));
const stats = doc?.stats;
if (!stats) {
  console.error(`✗ codegen-canonical-hook: ${YAML_PATH} has no 'stats' block`);
  process.exit(2);
}

let src = readFileSync(HOOK_PATH, "utf-8");
const original = src;
const changes = [];

for (const { yamlKey, hookKey } of FIELD_MAP) {
  const value = stats[yamlKey];
  if (typeof value !== "number") {
    console.warn(`⚠  ${yamlKey} missing or non-numeric in YAML — skipping ${hookKey}`);
    continue;
  }
  // Match only inside DEFAULTS: key: <number> (optional underscores) followed by comma
  const pattern = new RegExp(`(\\b${hookKey}\\s*:\\s*)(\\d[\\d_]*)(\\s*,)`);
  const m = src.match(pattern);
  if (!m) {
    console.warn(`⚠  ${hookKey} not found in ${HOOK_PATH} — skipping`);
    continue;
  }
  const currentValue = parseInt(m[2].replace(/_/g, ""), 10);
  if (currentValue === value) continue;
  src = src.replace(pattern, `$1${value}$3`);
  changes.push(`${hookKey}: ${currentValue} → ${value}`);
}

if (src === original) {
  console.log("✓ codegen-canonical-hook: hook already in sync with YAML (no changes)");
  process.exit(0);
}

writeFileSync(HOOK_PATH, src, "utf-8");
console.log(`✓ codegen-canonical-hook: updated ${changes.length} field(s) in useCanonicalStats.ts`);
for (const c of changes) console.log(`  - ${c}`);
process.exit(0);
