#!/usr/bin/env node
// assert-preload-sandbox.mjs
// SEG-FIX-2 BP078: Build-time guardrail that fails dist:win if the compiled
// preload.js contains require() calls. require('electron') in a sandboxed
// preload silently prevents window.amplify from being set (4-version P0 root cause).
// Run after build:main, before electron-builder.

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const preloadPath = join(__dirname, '..', 'dist', 'main', 'preload.js');

if (!existsSync(preloadPath)) {
  console.error('[assert-preload-sandbox] FAIL: dist/main/preload.js not found.');
  console.error('  Run npm run build:main before dist:win.');
  process.exit(1);
}

const src = readFileSync(preloadPath, 'utf8');
const lines = src.split('\n');

const requireHits = [];
for (let i = 0; i < lines.length; i++) {
  if (/require\s*\(/.test(lines[i])) {
    requireHits.push({ line: i + 1, content: lines[i].trim().slice(0, 120) });
  }
}

if (requireHits.length > 0) {
  console.error('[assert-preload-sandbox] FAIL: preload.js contains require() calls.');
  console.error('  These are FORBIDDEN in sandbox:true preloads and will silently');
  console.error('  prevent window.amplify from being set (root cause: BP078 P0).');
  console.error('');
  for (const hit of requireHits) {
    console.error(`  Line ${hit.line}: ${hit.content}`);
  }
  console.error('');
  console.error('  Fix: ensure src/main/preload.ts uses declare const for electron');
  console.error('  globals instead of import { ... } from \'electron\'.');
  process.exit(1);
}

// Also check __dirname (indicates non-sandbox-safe Node.js path APIs)
const dirnameHits = [];
for (let i = 0; i < lines.length; i++) {
  if (/__dirname/.test(lines[i])) {
    dirnameHits.push({ line: i + 1, content: lines[i].trim().slice(0, 120) });
  }
}

if (dirnameHits.length > 0) {
  console.error('[assert-preload-sandbox] FAIL: preload.js contains __dirname references.');
  console.error('  __dirname is a Node.js CommonJS global not available in sandbox mode.');
  for (const hit of dirnameHits) {
    console.error(`  Line ${hit.line}: ${hit.content}`);
  }
  process.exit(1);
}

console.log('[assert-preload-sandbox] OK: preload.js is sandbox-safe.');
console.log(`  Checked ${lines.length} lines. Zero require() or __dirname occurrences.`);
