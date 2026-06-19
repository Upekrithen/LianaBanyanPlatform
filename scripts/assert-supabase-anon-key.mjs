#!/usr/bin/env node
/**
 * assert-supabase-anon-key.mjs — Build-time invariant guard (v0.5.11+)
 *
 * Root cause locked BP084 §14: Supabase v2 API-key migration introduced a new
 * publishable key format starting with "sb_publi" (~63 chars).  The REST
 * listener at /rest/v1/fleet_broadcast requires the LEGACY JWT anon key
 * (eyJhbGci…, 200+ chars).  Shipping the new-format key silently breaks
 * all fleet_broadcast calls — noop_test lands 0/5.
 *
 * This script reads resources/supabase_public.env and HARD-FAILS the build
 * if SUPABASE_ANON_KEY does not begin with "eyJ" (the base64-JWT magic prefix).
 *
 * Resolution path:
 *   1. Supabase Studio → Project Settings → API
 *   2. Copy the JWT key (eyJhbGci…, ≥ 200 chars) — NOT the new sb_publi… key
 *   3. Paste into resources/supabase_public.env as SUPABASE_ANON_KEY=<jwt>
 *   4. Re-run npm run dist:win (this guard will pass, build proceeds)
 *
 * Exit 0 on pass, exit 1 on any failure.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const envPath = join(root, 'resources', 'supabase_public.env');

const JWT_PREFIX = 'eyJ';
const MIN_JWT_LENGTH = 100; // Real JWTs are 200+ chars; 100 is a conservative floor

function fail(msg) {
  console.error('');
  console.error('┌─────────────────────────────────────────────────────────────────────┐');
  console.error('│  assert-supabase-anon-key  ✗  BUILD BLOCKED                         │');
  console.error('└─────────────────────────────────────────────────────────────────────┘');
  console.error('');
  console.error(`  ${msg}`);
  console.error('');
  console.error('  FIX:');
  console.error('    1. Open Supabase Studio → Project Settings → API');
  console.error('    2. Copy the LEGACY anon key (starts with eyJhbGci…, ≥200 chars)');
  console.error('       NOT the new publishable key (starts with sb_publi…, ~63 chars)');
  console.error('    3. Update resources/supabase_public.env:');
  console.error('         SUPABASE_ANON_KEY=eyJhbGci…<full jwt here>');
  console.error('    4. Re-run: npm run dist:win');
  console.error('');
  process.exit(1);
}

// ── 1. File existence check
if (!existsSync(envPath)) {
  fail(`resources/supabase_public.env NOT FOUND at: ${envPath}`);
}

// ── 2. Parse file — extract SUPABASE_ANON_KEY
let anonKey = null;
const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
for (const raw of lines) {
  const line = raw.trim();
  if (!line || line.startsWith('#')) continue;
  const eq = line.indexOf('=');
  if (eq <= 0) continue;
  const key = line.slice(0, eq).trim();
  if (key === 'SUPABASE_ANON_KEY') {
    let val = line.slice(eq + 1).trim();
    // Strip surrounding quotes
    if (val.length >= 2) {
      const f = val[0], l = val[val.length - 1];
      if ((f === '"' && l === '"') || (f === "'" && l === "'")) val = val.slice(1, -1);
    }
    anonKey = val;
    break;
  }
}

// ── 3. Missing key check
if (!anonKey) {
  fail('SUPABASE_ANON_KEY is missing or empty in resources/supabase_public.env');
}

// ── 4. Placeholder / template value check
if (anonKey.startsWith('<') || anonKey === 'REPLACE_ME' || anonKey === 'TODO') {
  fail(`SUPABASE_ANON_KEY is still a placeholder: "${anonKey.slice(0, 30)}…"`);
}

// ── 5. JWT prefix check (THE CORE INVARIANT)
if (!anonKey.startsWith(JWT_PREFIX)) {
  const preview = anonKey.slice(0, 20);
  fail(
    `SUPABASE_ANON_KEY starts with "${preview}…" — expected JWT prefix "${JWT_PREFIX}…".\n` +
    `  This is the Supabase v2 new-format publishable key (sb_publi…).\n` +
    `  fleet_broadcast requires the LEGACY JWT anon key.  See FIX above.`
  );
}

// ── 6. Minimum length check
if (anonKey.length < MIN_JWT_LENGTH) {
  fail(
    `SUPABASE_ANON_KEY is only ${anonKey.length} chars — expected ≥ ${MIN_JWT_LENGTH}.\n` +
    `  Real Supabase JWT anon keys are 200+ chars.  Paste the full key.`
  );
}

// ── PASS
console.log(
  `[assert-supabase-anon-key] ✓ SUPABASE_ANON_KEY starts with "${JWT_PREFIX}" ` +
  `(${anonKey.length} chars) — JWT format confirmed. Build may proceed.`
);
process.exit(0);
