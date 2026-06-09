#!/usr/bin/env node
/**
 * Floor model assertion guard -- block dist if FLOOR != qwen2.5:0.5b
 *
 * Run before electron-builder to ensure the NANO bundled installer never
 * silently includes a large model (e.g. gemma4:12b at 7 GB).
 *
 * Checks two sources of truth and asserts they agree:
 *   1. scripts/prepare-floor-model.mjs  (FLOOR constant, sets what gets pulled)
 *   2. src/shared/floor-model.ts        (FLOOR_MODEL export, drives runtime logic)
 *
 * Exit 0 on pass, exit 1 on any mismatch.
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const EXPECTED = 'qwen2.5:0.5b';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// ── Extract FLOOR from prepare-floor-model.mjs via regex (no dynamic import
//    needed; the constant is a simple string literal assignment).
function extractPrepareFloor() {
  const src = readFileSync(join(root, 'scripts', 'prepare-floor-model.mjs'), 'utf8');
  const match = src.match(/^\s*const\s+FLOOR\s*=\s*['"]([^'"]+)['"]/m);
  if (!match) {
    console.error('[assert-floor-model] FATAL: Could not locate FLOOR constant in scripts/prepare-floor-model.mjs');
    process.exit(1);
  }
  return match[1];
}

// ── Extract FLOOR_MODEL from floor-model.ts via regex (no TypeScript runtime).
function extractSharedFloorModel() {
  const src = readFileSync(join(root, 'src', 'shared', 'floor-model.ts'), 'utf8');
  const match = src.match(/^\s*export\s+const\s+FLOOR_MODEL\s*=\s*['"]([^'"]+)['"]/m);
  if (!match) {
    console.error('[assert-floor-model] FATAL: Could not locate FLOOR_MODEL constant in src/shared/floor-model.ts');
    process.exit(1);
  }
  return match[1];
}

const prepareFloor = extractPrepareFloor();
const sharedFloor = extractSharedFloorModel();

let failed = false;

if (prepareFloor !== EXPECTED) {
  console.error(
    `FLOOR MODEL MISMATCH: expected ${EXPECTED}, got ${prepareFloor}. ` +
    `NANO build cannot include a 7 GB model. ` +
    `Fix scripts/prepare-floor-model.mjs and src/shared/floor-model.ts before building.`
  );
  failed = true;
}

if (sharedFloor !== EXPECTED) {
  console.error(
    `FLOOR MODEL MISMATCH: expected ${EXPECTED}, got ${sharedFloor}. ` +
    `NANO build cannot include a 7 GB model. ` +
    `Fix scripts/prepare-floor-model.mjs and src/shared/floor-model.ts before building.`
  );
  failed = true;
}

if (prepareFloor !== sharedFloor) {
  console.error(
    `FLOOR MODEL DISAGREEMENT: prepare-floor-model.mjs has "${prepareFloor}" but ` +
    `src/shared/floor-model.ts has "${sharedFloor}". Both files must agree. ` +
    `Fix them to both equal ${EXPECTED} before building.`
  );
  failed = true;
}

if (failed) {
  process.exit(1);
}

console.log(`[assert-floor-model] OK: FLOOR=${prepareFloor}, FLOOR_MODEL=${sharedFloor} -- both equal ${EXPECTED}. Build may proceed.`);
process.exit(0);
