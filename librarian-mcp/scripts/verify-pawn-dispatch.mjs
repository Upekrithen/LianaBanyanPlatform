#!/usr/bin/env node
// verify-pawn-dispatch.mjs
//
// Gates Pawn-bound content on canonical number freshness. Run before dispatching
// any prompt, research brief, or paper to Pawn (Perplexity) that cites canonical
// counts. Blocks dispatch if the file cites stale numbers.
//
// Usage:
//   node scripts/verify-pawn-dispatch.mjs <file-path> [<file-path>...]
//   node scripts/verify-pawn-dispatch.mjs --dir <directory>   # scan all .md in dir
//
// Exit codes:
//   0 — all cited numbers match current canonical values
//   1 — at least one file cites a stale number
//   2 — usage error / missing file
//
// The scanner looks for contextual number-noun phrases ("2,267 innovations",
// "225 Crown Jewels", "2412 formal claims", etc.) and checks them against
// librarian-mcp/canonical_values.yaml. Pure numeric matches without context
// are ignored to keep false-positive rate low.

import { readFileSync, existsSync, readdirSync, appendFileSync, mkdirSync } from "node:fs";
import { resolve, dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MCP_ROOT = resolve(__dirname, "..");
const YAML_PATH = resolve(MCP_ROOT, "canonical_values.yaml");
const TIDBITS_PATH = resolve(MCP_ROOT, "stitchpunks/data/tidbits.jsonl");

function loadCanonical() {
  if (!existsSync(YAML_PATH)) {
    console.error(`✗ verify-pawn-dispatch: missing ${YAML_PATH}`);
    process.exit(2);
  }
  const doc = yaml.load(readFileSync(YAML_PATH, "utf-8"));
  const s = doc?.stats;
  if (!s) {
    console.error(`✗ verify-pawn-dispatch: no 'stats' in ${YAML_PATH}`);
    process.exit(2);
  }
  return s;
}

// Each rule says: if the file contains a number followed by this context phrase,
// the number must equal canonical[canonicalKey]. Context phrases are deliberately
// narrow to avoid matching unrelated numbers.
function buildRules(stats) {
  return [
    {
      canonicalKey: "innovation_count",
      canonicalValue: stats.innovation_count,
      contexts: [/innovations?\b/i, /innovation[\s_-]*count/i],
      label: "innovations",
    },
    {
      canonicalKey: "crown_jewels",
      canonicalValue: stats.crown_jewels,
      contexts: [/crown[\s-]*jewels?\b/i, /\bCJs?\b/],
      label: "Crown Jewels",
    },
    {
      canonicalKey: "formal_claims_approximate",
      canonicalValue: stats.formal_claims_approximate,
      contexts: [/formal[\s-]*claims?\b/i, /patent[\s-]*claims?\b/i],
      label: "formal claims",
    },
    {
      canonicalKey: "patent_provisionals_filed",
      canonicalValue: stats.patent_provisionals_filed,
      contexts: [/provisionals?\s+filed\b/i, /provisional[\s-]*apps?\b/i, /provisional[\s-]*patent[\s-]*applications?\b/i],
      label: "provisionals filed",
    },
    {
      canonicalKey: "production_systems",
      canonicalValue: stats.production_systems,
      contexts: [/production[\s-]*systems?\b/i, /live[\s-]*systems?\b/i],
      label: "production systems",
    },
  ];
}

// Match "<number>[,<number>]* <some words up to ~40 chars> <context>"
// Number may have thousands separators or an approx prefix ("~").
function scanFile(path, rules) {
  const content = readFileSync(path, "utf-8");
  const lines = content.split(/\r?\n/);
  const violations = [];

  for (let lineNo = 0; lineNo < lines.length; lineNo++) {
    const line = lines[lineNo];
    if (!line.trim()) continue;

    for (const rule of rules) {
      for (const ctx of rule.contexts) {
        // number-then-context, up to 40 chars of interstitial text
        const re = new RegExp(`(~?\\s*)(\\d{1,3}(?:[,_]\\d{3})+|\\d{3,6})([^\\n]{0,40}?)(${ctx.source})`, "gi");
        let m;
        while ((m = re.exec(line)) !== null) {
          const raw = m[2].replace(/[,_]/g, "");
          const cited = parseInt(raw, 10);
          // Skip implausibly small matches for large canonical values (e.g., "page 5 of 1200")
          if (cited < 10) continue;
          if (cited === rule.canonicalValue) continue;
          // Skip if the cited number is close enough for "~" approximate claims on large values
          if (m[1].includes("~") && rule.canonicalValue > 1000 && Math.abs(cited - rule.canonicalValue) / rule.canonicalValue < 0.02) continue;
          violations.push({
            file: path,
            line: lineNo + 1,
            label: rule.label,
            cited,
            canonical: rule.canonicalValue,
            snippet: line.trim().slice(0, 120),
          });
        }
      }
    }
  }
  return violations;
}

function collectFiles(args) {
  const files = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dir") {
      const dir = args[++i];
      if (!dir || !existsSync(dir)) {
        console.error(`✗ --dir requires an existing directory (got: ${dir})`);
        process.exit(2);
      }
      for (const name of readdirSync(dir)) {
        if (extname(name).toLowerCase() === ".md") files.push(join(dir, name));
      }
    } else {
      files.push(args[i]);
    }
  }
  return files;
}

function logTidbit(entry) {
  try {
    mkdirSync(dirname(TIDBITS_PATH), { recursive: true });
    appendFileSync(TIDBITS_PATH, JSON.stringify(entry) + "\n");
  } catch { /* best-effort */ }
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: verify-pawn-dispatch.mjs <file.md> [<file.md>...] OR --dir <directory>");
  process.exit(2);
}

const stats = loadCanonical();
const rules = buildRules(stats);
const files = collectFiles(args);

if (files.length === 0) {
  console.log("verify-pawn-dispatch: no files to scan.");
  process.exit(0);
}

const allViolations = [];
for (const f of files) {
  if (!existsSync(f)) {
    console.error(`✗ missing file: ${f}`);
    process.exit(2);
  }
  allViolations.push(...scanFile(f, rules));
}

const ts = new Date().toISOString();

if (allViolations.length === 0) {
  console.log(`✓ verify-pawn-dispatch: ${files.length} file(s) clean, no stale canonical citations.`);
  logTidbit({ ts, scribe: "SP-5-SENTINEL", kind: "pawn_dispatch_verify_pass", files: files.length });
  process.exit(0);
}

console.error(`✗ verify-pawn-dispatch: ${allViolations.length} stale citation(s) found across ${files.length} file(s):\n`);
for (const v of allViolations) {
  console.error(`  ${v.file}:${v.line}  ${v.label}: cited ${v.cited}, canonical is ${v.canonical}`);
  console.error(`    > ${v.snippet}`);
}
console.error(`\nFix: update the file to cite the canonical value, or update canonical_values.yaml and rebuild if the canonical changed.`);
logTidbit({
  ts,
  scribe: "SP-5-SENTINEL",
  kind: "pawn_dispatch_verify_fail",
  files: files.length,
  violations: allViolations.length,
  detail: allViolations.slice(0, 5),
});
process.exit(1);
