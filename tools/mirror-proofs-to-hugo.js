#!/usr/bin/env node
/**
 * mirror-proofs-to-hugo.js
 * BP094 Session 4 - Mamba 5.2
 * Extracts proof data from ProofsPage.tsx and writes proofs.json for Hugo.
 * Run: node tools/mirror-proofs-to-hugo.js
 */

const fs = require("fs");
const path = require("path");

const PROOFS_PAGE = path.resolve(
  __dirname,
  "../platform/src/pages/ProofsPage.tsx"
);
const OUTPUT_JSON = path.resolve(
  __dirname,
  "../Cephas/cephas-hugo/data/proofs.json"
);

const src = fs.readFileSync(PROOFS_PAGE, "utf8");

// ---------------------------------------------------------------------------
// 1. HEADLINE STATS (hardcoded from the hero section - canonical per BP073)
// ---------------------------------------------------------------------------
const headlineStats = {
  proofs: "28/28",
  tests: "2251/2251",
  waves: "30/30",
  scopes: "900+",
  confidenceThreshold: "83.3%",
  yoke: "2/2",
  program: "30x30 COMPLETE",
};

// ---------------------------------------------------------------------------
// 2. PROOF_RECORDS extraction via regex on JS/TS object literal array
// Strategy: find the PROOF_RECORDS array block and JSON-ish parse each entry
// ---------------------------------------------------------------------------
function extractProofRecords(src) {
  const startIdx = src.indexOf("const PROOF_RECORDS");
  if (startIdx === -1) {
    console.error("WARN: PROOF_RECORDS not found in source");
    return [];
  }
  // Find '= [' (the array literal), NOT the '[' in the type annotation 'ProofRecord[]'
  const eqIdx = src.indexOf("= [", startIdx);
  if (eqIdx === -1) return [];
  // Find the opening '[' of the array
  const bracketOpen = src.indexOf("[", eqIdx);
  if (bracketOpen === -1) return [];

  // Walk forward counting braces to find the matching ']' at depth 0
  let depth = 0;
  let i = bracketOpen;
  while (i < src.length) {
    if (src[i] === "[") depth++;
    else if (src[i] === "]") {
      depth--;
      if (depth === 0) break;
    }
    i++;
  }
  const arrayText = src.slice(bracketOpen, i + 1);

  // Extract individual record blocks { ... } at depth 1
  const records = [];
  let d = 0;
  let recordStart = -1;
  for (let j = 0; j < arrayText.length; j++) {
    if (arrayText[j] === "{") {
      d++;
      if (d === 1) recordStart = j;
    } else if (arrayText[j] === "}") {
      d--;
      if (d === 0 && recordStart !== -1) {
        const block = arrayText.slice(recordStart, j + 1);
        const rec = parseBlock(block);
        if (rec && rec.uuid) records.push(rec);
        recordStart = -1;
      }
    }
  }
  return records;
}

function parseBlock(block) {
  const rec = {};
  // Extract string fields: fieldName: "value" or fieldName: `value`
  const strField = /(\w+)\s*:\s*["'`]([^"'`]*?)["'`]/g;
  let m;
  while ((m = strField.exec(block)) !== null) {
    rec[m[1]] = m[2].replace(/\\n/g, " ").trim();
  }
  // Extract boolean fields
  const boolField = /(\w+)\s*:\s*(true|false)/g;
  while ((m = boolField.exec(block)) !== null) {
    rec[m[1]] = m[2] === "true";
  }
  // Extract numeric fields
  const numField = /(\w+)\s*:\s*(\d+),/g;
  while ((m = numField.exec(block)) !== null) {
    if (!rec[m[1]]) rec[m[1]] = parseInt(m[2], 10);
  }
  return rec;
}

// ---------------------------------------------------------------------------
// 3. PROGRAM_30x30_RECORDS extraction
// ---------------------------------------------------------------------------
function extract30x30Records(src) {
  const startIdx = src.indexOf("const PROGRAM_30x30_RECORDS");
  if (startIdx === -1) {
    console.error("WARN: PROGRAM_30x30_RECORDS not found in source");
    return [];
  }
  const eqIdx = src.indexOf("= [", startIdx);
  if (eqIdx === -1) return [];
  const bracketOpen = src.indexOf("[", eqIdx);
  if (bracketOpen === -1) return [];

  let depth = 0;
  let i = bracketOpen;
  while (i < src.length) {
    if (src[i] === "[") depth++;
    else if (src[i] === "]") {
      depth--;
      if (depth === 0) break;
    }
    i++;
  }
  const arrayText = src.slice(bracketOpen, i + 1);

  const records = [];
  let d = 0;
  let recordStart = -1;
  for (let j = 0; j < arrayText.length; j++) {
    if (arrayText[j] === "{") {
      d++;
      if (d === 1) recordStart = j;
    } else if (arrayText[j] === "}") {
      d--;
      if (d === 0 && recordStart !== -1) {
        const block = arrayText.slice(recordStart, j + 1);
        const rec = parseBlock(block);
        if (rec && rec.receiptId) records.push(rec);
        recordStart = -1;
      }
    }
  }
  return records;
}

// ---------------------------------------------------------------------------
// 4. WAVE_MILESTONES extraction
// ---------------------------------------------------------------------------
function extractWaveMilestones(src) {
  const startIdx = src.indexOf("const WAVE_MILESTONES");
  if (startIdx === -1) {
    console.error("WARN: WAVE_MILESTONES not found in source");
    return [];
  }
  const eqIdx = src.indexOf("= [", startIdx);
  if (eqIdx === -1) return [];
  const bracketOpen = src.indexOf("[", eqIdx);
  if (bracketOpen === -1) return [];

  let depth = 0;
  let i = bracketOpen;
  while (i < src.length) {
    if (src[i] === "[") depth++;
    else if (src[i] === "]") {
      depth--;
      if (depth === 0) break;
    }
    i++;
  }
  const arrayText = src.slice(bracketOpen, i + 1);

  const records = [];
  let d = 0;
  let recordStart = -1;
  for (let j = 0; j < arrayText.length; j++) {
    if (arrayText[j] === "{") {
      d++;
      if (d === 1) recordStart = j;
    } else if (arrayText[j] === "}") {
      d--;
      if (d === 0 && recordStart !== -1) {
        const block = arrayText.slice(recordStart, j + 1);
        const rec = parseBlock(block);
        if (rec && rec.waves) records.push(rec);
        recordStart = -1;
      }
    }
  }
  return records;
}

// ---------------------------------------------------------------------------
// 5. BP074 Retrospective tile - static values extracted from the page
// ---------------------------------------------------------------------------
const bp074Retro = {
  title: "BP074 Marathon Retrospective",
  subtitle: "30+ Waves. 900+ Scopes. 2251/2251 Tests.",
  body: "Wave 27 / Phase epsilon launch proof. Marathon proof on the site. 30+ waves. 900+ scopes. 2044/2044 tests. 0 TypeScript errors. Yoke 2/2. 0 production CVEs.",
  confirmedAt: "2026-06-03",
};

// ---------------------------------------------------------------------------
// Run extraction
// ---------------------------------------------------------------------------
const proofRecords = extractProofRecords(src);
const program30x30 = extract30x30Records(src);
const waveMilestones = extractWaveMilestones(src);

const output = {
  _generated: new Date().toISOString(),
  _source: "platform/src/pages/ProofsPage.tsx",
  _session: "BP094-S4",
  headline_stats: headlineStats,
  proof_records: proofRecords,
  program_30x30_records: program30x30,
  wave_milestones: waveMilestones,
  bp074_retro: bp074Retro,
};

// Ensure output directory exists
fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2), "utf8");

console.log("=== mirror-proofs-to-hugo extraction summary ===");
console.log("  proof_records:          " + proofRecords.length);
console.log("  program_30x30_records:  " + program30x30.length);
console.log("  wave_milestones:        " + waveMilestones.length);
console.log("  Output written to:      " + OUTPUT_JSON);
console.log("=================================================");
