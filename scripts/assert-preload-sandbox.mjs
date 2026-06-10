#!/usr/bin/env node
// assert-preload-sandbox.mjs
// BP079 bedrock correction -- SEG-FIX-1 (v0.1.32) had wrong premise that
// require() is forbidden in Electron 31 sandboxed preloads -- empirically
// refuted 2026-06-10 via SEG-ESM-TEST CDP probe. The compiled preload.js MUST
// contain require("electron") because tsc compiles:
//   import { contextBridge, ipcRenderer } from 'electron'
// into:
//   const electron_1 = require("electron");
// which is the correct and required acquisition pattern.
//
// This guard now catches the ACTUAL broken pattern introduced by SEG-FIX-1:
//   declare const ipcRenderer: Electron.IpcRenderer
// which is a TypeScript type-only declaration that emits ZERO JavaScript.
// The compiled preload.js then references ipcRenderer without ever acquiring
// it from require('electron'), causing silent ReferenceError at boot and
// window.amplify never being registered (root cause: 5-version P0 v0.1.32-v0.1.37).
//
// Canon: canon_electron_31_sandboxed_preload_must_use_require_electron_not_declare_const_bp078_bp079_correction
// Pearl: pearl_8b0c6fb05fd9f38a
// Run after build:main, before electron-builder.

import { readFileSync, existsSync, writeFileSync, unlinkSync } from 'node:fs';
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

// -----------------------------------------------------------------------
// CHECK 1: ipcRenderer / contextBridge referenced but never acquired
// -----------------------------------------------------------------------
// The broken pattern (SEG-FIX-1 / declare const) emits references to
// ipcRenderer and contextBridge in compiled output but includes NO
// require("electron") acquisition. Any file that references these symbols
// MUST acquire them from require('electron').

// Strip single-line comments so comment text cannot spoof the acquisition check.
// (e.g. a comment saying "must use require('electron')" must not satisfy the guard)
const srcNoLineComments = src.replace(/\/\/.*/g, '');

const referencesIpcRenderer = /\bipcRenderer\b/.test(src);
const referencesContextBridge = /\bcontextBridge\b/.test(src);
// Acquisition must appear as code, not in a comment -- check against stripped source.
// Also require it to be a variable assignment (const/var/let X = require("electron"))
// to distinguish from dynamic calls like someObj.require().
const acquiresElectron = /(?:const|var|let)\s+\w+\s*=\s*require\s*\(\s*['"]electron['"]\s*\)/.test(srcNoLineComments);

if ((referencesIpcRenderer || referencesContextBridge) && !acquiresElectron) {
  console.error('[assert-preload-sandbox] FAIL: preload.js references ipcRenderer/contextBridge');
  console.error('  but never acquires them from require("electron").');
  console.error('');
  console.error('  This is the SEG-FIX-1 (v0.1.32) footprint -- the "declare const" pattern');
  console.error('  that compiles to zero JS and produces silent ReferenceError at runtime,');
  console.error('  leaving window.amplify undefined for 5 consecutive releases.');
  console.error('');
  console.error('  Fix: ensure src/main/preload.ts uses:');
  console.error('    import { contextBridge, ipcRenderer } from \'electron\'');
  console.error('  (NOT "declare const ipcRenderer: Electron.IpcRenderer")');
  console.error('');
  console.error('  Canon: canon_electron_31_sandboxed_preload_must_use_require_electron');
  console.error('         _not_declare_const_bp078_bp079_correction (pearl_8b0c6fb05fd9f38a)');
  process.exit(1);
}

// -----------------------------------------------------------------------
// CHECK 2: __dirname in preload (non-sandbox-safe Node.js global)
// -----------------------------------------------------------------------
const lines = src.split('\n');
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

// -----------------------------------------------------------------------
// PASS
// -----------------------------------------------------------------------
const acquiredSymbol = referencesIpcRenderer || referencesContextBridge
  ? 'electron bridge acquired via require("electron") -- OK'
  : 'no ipcRenderer/contextBridge references (bare preload -- OK)';

console.log('[assert-preload-sandbox] OK: preload.js is sandbox-safe.');
console.log(`  Checked ${lines.length} lines.`);
console.log(`  ${acquiredSymbol}`);
console.log('  Zero __dirname occurrences.');
