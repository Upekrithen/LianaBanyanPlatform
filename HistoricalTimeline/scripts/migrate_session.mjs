#!/usr/bin/env node
/**
 * Historical Timeline Migration Tool
 * ====================================
 * Imports a recorded session file into the HistoricalTimeline directory.
 * Auto-detects era from filename / timestamp / participant signatures.
 * Generates frontmatter skeleton (Founder ratifies fields).
 * Canonicalizes filename per BP046 §2 naming convention.
 *
 * Usage:
 *   node migrate_session.mjs <source-file-path> [--era=lovable|jarvis|moneypenny|lb-bp|lb-k|lb-p|lb-r|cathedral]
 *   node migrate_session.mjs --list-rules   # print era auto-detection rules
 *
 * Canon: CANON_HISTORICAL_TIMELINE_SESSION_ARCHIVE_JARVIS_LOVABLE_MONEYPENNY_BP046.md §7
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, basename, extname, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TIMELINE_ROOT = resolve(__dirname, "..");

// ─── Era detection rules ────────────────────────────────────────────────────

const ERA_RULES = [
  {
    era: "lovable",
    dir: "lovable",
    prefix: "LOVABLE_L",
    signals: ["lovable", "lovable.ai", "v0-", "bolt-"],
    desc: "Lovable/Bolt/V0 web-class origin sessions",
  },
  {
    era: "jarvis",
    dir: "jarvis",
    prefix: "JARVIS_J",
    signals: ["jarvis", "voice-sms", "google-voice", "sms-bridge"],
    desc: "Jarvis assistant-class voice/SMS sessions",
  },
  {
    era: "moneypenny",
    dir: "moneypenny",
    prefix: "MONEYPENNY_M",
    signals: ["moneypenny", "money-penny", "pudding", "broadcast"],
    desc: "Moneypenny LB-substrate-emergence sessions",
  },
  {
    era: "lb-bp",
    dir: "lb_bp",
    prefix: "BP_",
    signals: ["bp0", "bp1", "bp2", "bp3", "bp4", "bishop", "white-puma", "ben-"],
    desc: "Bishop (LB era) long-range synth sessions",
  },
  {
    era: "lb-k",
    dir: "lb_k",
    prefix: "K_",
    signals: ["_k4", "_k5", "_k6", "knight", "jaguar", "panther"],
    desc: "Knight (LB era) night-shipper sessions",
  },
  {
    era: "lb-p",
    dir: "lb_p",
    prefix: "P_",
    signals: ["pawn", "perplexity", "_p0", "_p1"],
    desc: "Pawn (LB era) dispatch-class sessions",
  },
  {
    era: "lb-r",
    dir: "lb_r",
    prefix: "R_",
    signals: ["rook", "_r0", "_r1"],
    desc: "Rook (LB era) fortified-perimeter sessions",
  },
  {
    era: "cathedral",
    dir: "cathedral",
    prefix: "CATHEDRAL_",
    signals: ["cathedral", "bp046", "bp047", "bp048", "strain"],
    desc: "Cathedral era (BP046+) sessions",
  },
];

// ─── Date extraction ─────────────────────────────────────────────────────────

function extractDate(content, filename) {
  // Try ISO date in content
  const isoMatch = content.match(/\d{4}-\d{2}-\d{2}/);
  if (isoMatch) return isoMatch[0];
  // Try date in filename
  const fnMatch = filename.match(/\d{4}-\d{2}-\d{2}/);
  if (fnMatch) return fnMatch[0];
  return "circa-unknown";
}

// ─── Era auto-detection ──────────────────────────────────────────────────────

function detectEra(filename, content) {
  const lower = (filename + " " + content.slice(0, 2000)).toLowerCase();
  for (const rule of ERA_RULES) {
    if (rule.signals.some((s) => lower.includes(s))) {
      return rule;
    }
  }
  return ERA_RULES.find((r) => r.era === "lb-bp") || ERA_RULES[3]; // default: lb-bp
}

// ─── Session ID inference ────────────────────────────────────────────────────

function inferSessionId(filename, era) {
  const upper = filename.toUpperCase();
  // Extract common patterns: BP046_W1, K490, M001, etc.
  const bpMatch = upper.match(/BP(\d+)(?:_W(\d+))?/);
  if (bpMatch) return `BP${bpMatch[1]}${bpMatch[2] ? `_W${bpMatch[2]}` : ""}`;
  const kMatch = upper.match(/K(\d+)/);
  if (kMatch) return `K${kMatch[1]}`;
  const pMatch = upper.match(/P(\d+)/);
  if (pMatch) return `P${pMatch[1]}`;
  const rMatch = upper.match(/R(\d+)/);
  if (rMatch) return `R${rMatch[1]}`;
  return `${era.prefix.replace("_", "").toUpperCase()}XXX`;
}

// ─── Frontmatter generator ───────────────────────────────────────────────────

function generateFrontmatter(sessionId, era, date, sourceFile) {
  return `---
session_id: ${sessionId}
era: ${era.era}
date: "${date}"
piece: FILL-IN (e.g. Bishop-Opus-4.7, Knight-Sonnet-4.6, Moneypenny, Jarvis)
participants:
  - Founder
  - FILL-IN
topics:
  - FILL-IN
outcomes:
  - FILL-IN
beacons:
  - FILL-IN (marker_types from Beacon Scribe)
provenance: "${sourceFile}"
---

`;
}

// ─── Filename canonicalization ───────────────────────────────────────────────

function canonicalizeFilename(sessionId, date, eraPrefix) {
  const safeDatePart = date.replace(/[^0-9-]/g, "x");
  const idSlug = sessionId.toLowerCase().replace(/_/g, "-");
  return `${eraPrefix}${sessionId}_${safeDatePart}_session.md`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.includes("--list-rules")) {
  console.log("Era auto-detection rules:\n");
  for (const rule of ERA_RULES) {
    console.log(`  ${rule.era.padEnd(14)} → ${rule.dir}/ · signals: ${rule.signals.join(", ")}`);
    console.log(`                      ${rule.desc}`);
  }
  process.exit(0);
}

if (args.length === 0) {
  console.log("Usage: node migrate_session.mjs <source-file> [--era=ERA]");
  console.log("       node migrate_session.mjs --list-rules");
  process.exit(1);
}

const sourcePath = resolve(args[0]);
if (!existsSync(sourcePath)) {
  console.error(`Source file not found: ${sourcePath}`);
  process.exit(1);
}

const sourceFilename = basename(sourcePath);
const content = readFileSync(sourcePath, "utf-8");

// Era override or auto-detect
let eraRule;
const eraArg = args.find((a) => a.startsWith("--era="));
if (eraArg) {
  const eraName = eraArg.replace("--era=", "");
  eraRule = ERA_RULES.find((r) => r.era === eraName || r.dir === eraName);
  if (!eraRule) {
    console.error(`Unknown era: ${eraName}. Run --list-rules to see options.`);
    process.exit(1);
  }
} else {
  eraRule = detectEra(sourceFilename, content);
  console.log(`Auto-detected era: ${eraRule.era} (use --era=ERA to override)`);
}

const date = extractDate(content, sourceFilename);
const sessionId = inferSessionId(sourceFilename, eraRule);
const destFilename = canonicalizeFilename(sessionId, date, eraRule.prefix);
const destDir = resolve(TIMELINE_ROOT, eraRule.dir);
const destPath = resolve(destDir, destFilename);

if (existsSync(destPath)) {
  console.error(`Destination already exists: ${destPath}`);
  console.error("Rename or remove it before migrating.");
  process.exit(1);
}

mkdirSync(destDir, { recursive: true });

const frontmatter = generateFrontmatter(sessionId, eraRule, date, sourcePath);
const body = content.startsWith("---") ? content : frontmatter + content;

writeFileSync(destPath, body, "utf-8");

console.log(`\nMigration complete:`);
console.log(`  Source: ${sourcePath}`);
console.log(`  Dest:   ${destPath}`);
console.log(`  Era:    ${eraRule.era}`);
console.log(`  Session: ${sessionId}`);
console.log(`  Date:   ${date}`);
console.log(`\nNext: open the file and fill in FILL-IN fields.`);
console.log(`Then: drop a Beacon via mcp__librarian__beacon_drop`);
