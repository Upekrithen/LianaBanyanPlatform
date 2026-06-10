#!/usr/bin/env node
// assert-ipc-handlers.mjs
// Reads dist/main/index.js and src/main/preload.ts after build.
// Extracts every ipcRenderer.invoke('channel') from preload, then verifies
// ipcMain.handle('channel') or ipcMain.on('channel') exists in the compiled dist.
// Exits 1 if any renderer-used channel is unregistered. Prevents stale-dist P0s.

import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const distMainDir = resolve(root, 'dist', 'main');
const distIndexPath = resolve(distMainDir, 'index.js');
const preloadPath = resolve(root, 'src', 'main', 'preload.ts');
const srcMainIndexPath = resolve(root, 'src', 'main', 'index.ts');

// Recursively collect all .js files under dist/main/
function collectJsFiles(dir) {
  const results = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) {
        results.push(...collectJsFiles(full));
      } else if (entry.endsWith('.js') && !entry.endsWith('.map')) {
        results.push(full);
      }
    }
  } catch { /* skip unreadable dirs */ }
  return results;
}

// Files that contain ipcRenderer calls (not ipcMain registrations) and must not
// contribute to handler detection.
function isHandlerArtifact(filePath) {
  const base = filePath.replace(/\\/g, '/').split('/').pop();
  return /preload/i.test(base) || /webview/i.test(base);
}

let distJsCombined, distIndexJs, preloadTs;
try {
  // FIX 3: Build freshness check -- compare mtime of dist/main/index.js vs src/main/index.ts
  const distIndexStat = statSync(distIndexPath);
  try {
    const srcMainStat = statSync(srcMainIndexPath);
    if (distIndexStat.mtimeMs < srcMainStat.mtimeMs) {
      console.warn('\n[assert-ipc-handlers] WARNING: dist/main/index.js may be stale (older than src/main/index.ts). Run npm run build:main before packaging.\n');
    }
  } catch { /* src/main/index.ts not readable -- skip freshness check */ }

  // Read dist/main/index.js directly for the SKU hard check (FIX 2)
  distIndexJs = readFileSync(distIndexPath, 'utf-8');

  const jsFiles = collectJsFiles(distMainDir);
  // Exclude preload.js / *preload*.js / *webview*.js -- these contain ipcRenderer
  // calls, not ipcMain registrations, and would produce false-positive matches.
  const handlerFiles = jsFiles.filter(f => !isHandlerArtifact(f));
  // Concatenate non-preload dist/main JS for handler lookup
  distJsCombined = handlerFiles.map(f => { try { return readFileSync(f, 'utf-8'); } catch { return ''; } }).join('\n');
} catch (e) {
  console.error(`[assert-ipc-handlers] FATAL: cannot read dist/main/ -- ${e.message}`);
  console.error('  Run `npm run build` before packaging.');
  process.exit(1);
}
try {
  preloadTs = readFileSync(preloadPath, 'utf-8');
} catch (e) {
  console.error(`[assert-ipc-handlers] FATAL: cannot read ${preloadPath}`);
  process.exit(1);
}

// Channels discovered from source preload.ts.
// Handler verification uses compiled dist/main (excluding preload artifacts).
const invokeRe = /ipcRenderer\.invoke\(\s*['"`]([^'"`]+)['"`]/g;
const channels = new Set();
let m;
while ((m = invokeRe.exec(preloadTs)) !== null) {
  channels.add(m[1]);
}

if (channels.size === 0) {
  console.warn('[assert-ipc-handlers] WARNING: no ipcRenderer.invoke channels found in preload. Check regex.');
  process.exit(0);
}

// For each channel, check dist/main/index.js
const results = [];
let anyFail = false;

for (const ch of [...channels].sort()) {
  // Tier-1: literal ipcMain.handle/ipcMain.on or safeHandle wrapper in non-preload dist/main JS.
  // safeHandle is the main-process-only wrapper around ipcMain.handle used in index.ts to guard
  // against duplicate registrations. It is NOT present in preload artifacts (which use ipcRenderer),
  // so matching it does not re-introduce the false-positive Tier-2 problem.
  const escapedCh = ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const directRe = new RegExp(`(?:\\.(?:handle|on)|\\bsafeHandle)\\(\\s*['"\`]${escapedCh}['"\`]`);
  const found = directRe.test(distJsCombined);
  if (!found) {
    anyFail = true;
    console.error(`[assert-ipc-handlers] FAIL: no ipcMain.handle/on registration found for '${ch}' in dist/main (excluding preload)`);
  }
  results.push({ channel: ch, status: found ? 'PASS' : 'FAIL' });
}

// Print table
const colW = Math.max(...results.map(r => r.channel.length), 7);
const header = `  ${'CHANNEL'.padEnd(colW)}  STATUS`;
const sep = `  ${'-'.repeat(colW)}  ------`;
console.log('\n[assert-ipc-handlers] IPC Channel Coverage Report');
console.log(sep);
console.log(header);
console.log(sep);
for (const r of results) {
  const mark = r.status === 'PASS' ? 'PASS  ' : 'FAIL <-- MISSING HANDLER';
  console.log(`  ${r.channel.padEnd(colW)}  ${mark}`);
}
console.log(sep);

const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status !== 'PASS').length;
console.log(`\n  ${passed} passed, ${failed} failed out of ${results.length} channels.\n`);

if (anyFail) {
    console.error('[assert-ipc-handlers] FAIL: one or more renderer channels have no main-process handler in dist.');
  console.error('  Either rebuild with `npm run build` or register the missing handlers (ipcMain.handle or safeHandle) in src/main/index.ts.\n');
  process.exit(1);
}

console.log('[assert-ipc-handlers] PASS: all renderer IPC channels have registered handlers.\n');

// FIX 2: Hard check for SKU handler presence in dist/main/index.js specifically.
// These four channels are P0 -- their absence caused the v0.1.30 shipping incident.
// This block greps dist/main/index.js (not the combined set) for literal
// ipcMain.handle or safeHandle registrations and fails if any are missing.
const SKU_CHANNELS = ['sku-check-model', 'sku-upgrade-to', 'sku-cancel-upgrade', 'sku-current-tier'];
let skuAnyFail = false;
console.log('[assert-ipc-handlers] SKU Hard Check (dist/main/index.js only):');
for (const ch of SKU_CHANNELS) {
  const escapedCh = ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const skuRe = new RegExp(`(?:ipcMain\\.handle|\\bsafeHandle)\\(\\s*['"\`]${escapedCh}['"\`]`);
  const found = skuRe.test(distIndexJs);
  if (found) {
    console.log(`  [SKU HARD CHECK] PASS  '${ch}' found in dist/main/index.js`);
  } else {
    console.error(`  [SKU HARD CHECK] FAIL  '${ch}' is ABSENT from dist/main/index.js -- ipcMain.handle('${ch}') not found`);
    skuAnyFail = true;
  }
}
if (skuAnyFail) {
  console.error('\n[assert-ipc-handlers] SKU HARD CHECK FAILED: one or more SKU channels are missing from dist/main/index.js.');
  console.error('  This is a P0 condition. Rebuild with `npm run build:main` before packaging.\n');
  process.exit(1);
}
console.log('[assert-ipc-handlers] SKU Hard Check PASSED: all 4 SKU channels present in dist/main/index.js.\n');
process.exit(0);
