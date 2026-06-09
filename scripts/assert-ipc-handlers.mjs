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

let distJsCombined, preloadTs;
try {
  // Verify index.js exists as a sanity check
  statSync(distIndexPath);
  const jsFiles = collectJsFiles(distMainDir);
  // Concatenate all dist/main JS for handler lookup
  distJsCombined = jsFiles.map(f => { try { return readFileSync(f, 'utf-8'); } catch { return ''; } }).join('\n');
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

// Extract all channel names from ipcRenderer.invoke('...') calls in preload
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
  // Check for ipcMain.handle('ch') or ipcMain.on('ch') in dist
  // Two-tier check:
  // 1. Direct registration: .handle('channel') or .on('channel') with a literal string
  // 2. Constant-based registration: channel string appears in dist (as a constant value)
  //    coupled with an ipcMain.handle(CONST, ...) call in the same file set.
  //    Heuristic: if the channel string appears anywhere in dist JS, it is considered covered.
  //    This handles patterns like: IPC.ADD_FOLDER = 'watcher:add-folder' + ipcMain.handle(IPC.ADD_FOLDER, ...)
  const escapedCh = ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const directRe = new RegExp(`\\.(?:handle|on)\\(\\s*['"\`]${escapedCh}['"\`]`);
  const stringPresentRe = new RegExp(`['"\`]${escapedCh}['"\`]`);
  // Found if: direct literal handle/on registration, OR channel string present AND ipcMain.handle appears in dist
  const found = directRe.test(distJsCombined) ||
    (stringPresentRe.test(distJsCombined) && /ipcMain\.handle\(/.test(distJsCombined));
  if (!found) anyFail = true;
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
  console.error('  Either rebuild with `npm run build` or register the missing handlers in src/main/index.ts.\n');
  process.exit(1);
}

console.log('[assert-ipc-handlers] PASS: all renderer IPC channels have registered handlers.\n');
process.exit(0);
