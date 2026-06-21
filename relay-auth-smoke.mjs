/**
 * relay-auth-smoke.mjs — I-A smoke test SEG
 * BP089 BLACK MAMBA Marathon Session 3 DAWN RIDE
 *
 * POSTs a noop dispatch to all 4 relay peer endpoints via relay.lianabanyan.com.
 * Logs per-peer HTTP status code + response body.
 * Expected: 200 or 202 on each → I-A GREEN.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Load env ─────────────────────────────────────────────────────────────────

function loadEnvFile(filePath) {
  try {
    const raw = readFileSync(filePath, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch { /* file may not exist */ }
}

loadEnvFile(resolve(__dirname, 'resources/supabase_public.env'));
loadEnvFile(resolve(__dirname, '.env'));

const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const RELAY_BASE = process.env.RELAY_BASE ?? 'https://relay.lianabanyan.com/functions/v1';

// ─── Fleet ────────────────────────────────────────────────────────────────────

const PEERS = [
  { name: 'M0', machine_id: 'cb4ef450cc4a18c3', vram_gb: 61.6 },
  { name: 'M3', machine_id: 'd0b47bd08633385b', vram_gb: 31.9 },
  { name: 'M2', machine_id: '88cbf6bdd6f74587', vram_gb: 31.9 },
  { name: 'SON', machine_id: '49f3e5971518a064', vram_gb: 15.8 },
];

// Minimal valid hex_frame for noop test (16 zero bytes = valid even-length hex >= 28 chars)
const NOOP_HEX_FRAME = '00'.repeat(16); // 32-char hex

// ─── Dispatch ─────────────────────────────────────────────────────────────────

async function dispatchNoop(peer) {
  const url = `${RELAY_BASE}/wan-relay-route`;
  const headers = {
    'Content-Type': 'application/json',
    ...(SUPABASE_ANON_KEY ? { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } : {}),
  };
  const body = JSON.stringify({
    target_peer_id: peer.machine_id,
    hex_frame: NOOP_HEX_FRAME,
    payload_json: JSON.stringify({ type: 'noop_test', ts: new Date().toISOString() }),
    session_id: `smoke-${Date.now()}`,
    ttl_seconds: 60,
  });

  try {
    const res = await fetch(url, { method: 'POST', headers, body, signal: AbortSignal.timeout(15_000) });
    const text = await res.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = text; }
    return { peer: peer.name, machine_id: peer.machine_id, status: res.status, body: parsed };
  } catch (err) {
    return { peer: peer.name, machine_id: peer.machine_id, status: 0, body: String(err) };
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n=== relay-auth-smoke.mjs · BP089 I-A smoke test ===`);
  console.log(`RELAY_BASE: ${RELAY_BASE}`);
  console.log(`SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.slice(0, 7) + '...' : '(NOT SET — will 401)'}\n`);

  const results = await Promise.all(PEERS.map(dispatchNoop));

  let allGreen = true;
  for (const r of results) {
    const ok = r.status === 200 || r.status === 202;
    if (!ok) allGreen = false;
    const flag = ok ? '✓ GREEN' : '✗ RED  ';
    console.log(`[${flag}] ${r.peer} (${r.machine_id.slice(0, 8)}) → HTTP ${r.status}`);
    console.log(`        body: ${JSON.stringify(r.body).slice(0, 120)}`);
  }

  console.log('\n─────────────────────────────────────────────────');
  if (allGreen) {
    console.log('I-A RESULT: GREEN — all 4 peers returned 200/202. Wave II can fire.');
  } else {
    console.log('I-A RESULT: AMBER — one or more peers returned non-200/202. Fix before Wave II.');
  }
  console.log('─────────────────────────────────────────────────\n');

  process.exit(allGreen ? 0 : 1);
}

main().catch((e) => { console.error('[smoke] Fatal:', e); process.exit(1); });
