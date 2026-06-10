#!/usr/bin/env node
// assert-preload-source-no-declare-const.mjs
// BP079 SEG-G-4: Source-side guard that scans src/main/preload.ts for the
// "declare const" pattern that caused the 5-version P0 (v0.1.32-v0.1.37).
//
// TypeScript "declare const ipcRenderer: Electron.IpcRenderer" is a
// type-only ambient declaration. It emits ZERO JavaScript. When the compiled
// preload.js then references ipcRenderer, it gets a silent ReferenceError
// at runtime because no acquisition from require("electron") was emitted.
//
// This guard runs BEFORE compilation (add to dist:win pre-steps) so the
// bug is caught at source level, not just at compiled output level.
//
// The compiled-output guard (assert-preload-sandbox.mjs) remains the last
// line of defense -- both guards are defense-in-depth.
//
// Canon: canon_electron_31_sandboxed_preload_must_use_require_electron_not_declare_const_bp078_bp079_correction
// Pearl: pearl_8b0c6fb05fd9f38a

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const preloadSrcPath = join(__dirname, '..', 'src', 'main', 'preload.ts');

if (!existsSync(preloadSrcPath)) {
  // Preload source not present -- could be a monorepo partial checkout.
  // Warn but do not block (the compiled-output guard will still run).
  console.warn('[assert-preload-source-no-declare-const] WARN: src/main/preload.ts not found.');
  console.warn('  Compiled-output guard (assert-preload-sandbox.mjs) remains active.');
  process.exit(0);
}

const src = readFileSync(preloadSrcPath, 'utf8');
const lines = src.split('\n');

// Patterns that indicate the broken "declare const" ambient declaration.
// These are TypeScript-only type declarations that emit zero JavaScript.
const BANNED_PATTERNS = [
  { re: /^\s*declare\s+const\s+ipcRenderer\s*:/,   label: 'declare const ipcRenderer' },
  { re: /^\s*declare\s+const\s+contextBridge\s*:/, label: 'declare const contextBridge' },
];

const hits = [];
for (let i = 0; i < lines.length; i++) {
  for (const { re, label } of BANNED_PATTERNS) {
    if (re.test(lines[i])) {
      hits.push({ line: i + 1, label, content: lines[i].trim().slice(0, 120) });
    }
  }
}

if (hits.length > 0) {
  console.error('[assert-preload-source-no-declare-const] FAIL: preload.ts contains forbidden');
  console.error('  "declare const" ambient declarations for Electron bridge symbols.');
  console.error('');
  console.error('  TypeScript "declare const X: T" emits ZERO JavaScript. After compilation');
  console.error('  the preload references ipcRenderer/contextBridge without ever acquiring');
  console.error('  them from require("electron"), producing a silent ReferenceError at boot');
  console.error('  and leaving window.amplify undefined (5-version P0 v0.1.32-v0.1.37).');
  console.error('');
  for (const hit of hits) {
    console.error(`  Line ${hit.line} [${hit.label}]: ${hit.content}`);
  }
  console.error('');
  console.error('  Fix: replace with a real import that TypeScript will compile to JS:');
  console.error('    import { contextBridge, ipcRenderer } from \'electron\'');
  console.error('');
  console.error('  Canon: canon_electron_31_sandboxed_preload_must_use_require_electron');
  console.error('         _not_declare_const_bp078_bp079_correction (pearl_8b0c6fb05fd9f38a)');
  process.exit(1);
}

console.log('[assert-preload-source-no-declare-const] OK: src/main/preload.ts is clean.');
console.log('  No "declare const ipcRenderer" or "declare const contextBridge" found.');
console.log(`  Scanned ${lines.length} lines.`);
