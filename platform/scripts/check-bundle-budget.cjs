#!/usr/bin/env node
// Wave 17 — Bundle budget check script.
// Reads dist/ directory, measures chunk sizes, compares against budget.json.
// Exits 1 if any named chunk exceeds its budget limit.
// Called by CI job "budget-check" in platform-ci.yml.

'use strict';

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.resolve(__dirname, '../dist');
const BUDGET_FILE = path.resolve(__dirname, '../budget.json');

// ── Load budget ───────────────────────────────────────────────────────────────

if (!fs.existsSync(BUDGET_FILE)) {
  console.error('FAIL: budget.json not found at', BUDGET_FILE);
  process.exit(1);
}

const budget = JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf-8'));
const chunkLimits = budget[0]?.chunkSizeLimits || {};

// ── Scan dist/assets/*.js ─────────────────────────────────────────────────────

const assetsDir = path.join(DIST_DIR, 'assets');

if (!fs.existsSync(assetsDir)) {
  console.error('FAIL: dist/assets not found -- run npm run build first.');
  process.exit(1);
}

const jsFiles = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.js'));

// Map chunk name prefix -> total size (kB)
const chunkSizes = {};

for (const file of jsFiles) {
  const stat = fs.statSync(path.join(assetsDir, file));
  const sizeKb = stat.size / 1024;

  // Vite names chunks like: vendor-react-BxYj3kA9.js
  // Extract the logical name (everything before the last hyphen+hash)
  const match = file.match(/^(.+?)-[A-Za-z0-9]{8,}\.js$/);
  const chunkName = match ? match[1] : file.replace('.js', '');

  chunkSizes[chunkName] = (chunkSizes[chunkName] || 0) + sizeKb;
}

// ── Compare against budget ────────────────────────────────────────────────────

let anyFail = false;

console.log('\n=== Wave 17 Bundle Budget Check ===\n');
console.log(
  'Chunk'.padEnd(30),
  'Size (kB)'.padStart(12),
  'Limit (kB)'.padStart(12),
  'Status'.padStart(10)
);
console.log('-'.repeat(66));

for (const [chunk, limitKb] of Object.entries(chunkLimits)) {
  if (chunk === 'comment') continue;
  const size = chunkSizes[chunk] ?? null;
  if (size === null) {
    // Chunk not found in dist -- may not be emitted if no pages use it (OK)
    console.log(
      chunk.padEnd(30),
      'N/A'.padStart(12),
      String(limitKb).padStart(12),
      'SKIP'.padStart(10)
    );
    continue;
  }
  const ok = size <= limitKb;
  if (!ok) anyFail = true;
  console.log(
    chunk.padEnd(30),
    size.toFixed(1).padStart(12),
    String(limitKb).padStart(12),
    (ok ? 'OK' : 'OVER-BUDGET').padStart(10)
  );
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log('\n=== All chunks ===\n');
const sorted = Object.entries(chunkSizes).sort(([, a], [, b]) => b - a);
for (const [name, size] of sorted) {
  const limit = chunkLimits[name];
  const flag = limit && size > limit ? ' *** OVER BUDGET' : '';
  console.log(`  ${name.padEnd(35)} ${size.toFixed(1).padStart(8)} kB${flag}`);
}

const totalJs = Object.values(chunkSizes).reduce((a, b) => a + b, 0);
const totalLimit = budget[0]?.resourceSizes?.find((r) => r.resourceType === 'script')?.budget ?? null;
console.log(`\n  ${'TOTAL JS'.padEnd(35)} ${totalJs.toFixed(1).padStart(8)} kB`);

if (totalLimit && totalJs > totalLimit) {
  console.error(`\nFAIL: Total JS ${totalJs.toFixed(1)} kB exceeds script budget ${totalLimit} kB`);
  anyFail = true;
}

if (anyFail) {
  console.error('\nFAIL: One or more chunks exceed budget. Reduce bundle size before merging.');
  process.exit(1);
}

console.log('\nPASS: All chunks within budget.');
