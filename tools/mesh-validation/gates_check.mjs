#!/usr/bin/env node
// gates_check.mjs -- THUNDERCLAP Trial 02 pre-fire gate verification
// MAMBA-zeta BP087

import { readFileSync, existsSync, accessSync, constants } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

function loadPublicEnv() {
  const p = resolve(__dirname, '../../resources/supabase_public.env');
  const out = {};
  try {
    const lines = readFileSync(p, 'utf8').split('\n');
    for (const rawLine of lines) {
      const line = rawLine.replace(/\r$/, '');
      const m = line.match(/^([A-Z_]+)=(.+)$/);
      if (m) {
        let val = m[2].trim();
        const hashIdx = val.indexOf('#');
        if (hashIdx > -1) val = val.slice(0, hashIdx).trim();
        out[m[1]] = val;
      }
    }
  } catch { /* absent */ }
  return out;
}

async function supabaseGet(url, anonKey, path) {
  const fullUrl = `${url}/rest/v1/${path}`;
  const headers = {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
  };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(fullUrl, { method: 'GET', headers, signal: controller.signal });
    clearTimeout(timer);
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    return text ? JSON.parse(text) : [];
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// Gate 1: All 5 peers on v0.5.12
async function gate1(url, anonKey) {
  try {
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const rows = await supabaseGet(url, anonKey, `peer_presence?select=peer_id,version&last_seen_at=gte.${since}`);
    if (!rows || rows.length === 0) {
      return { status: 'RED', msg: '0 active peers found (need 5 on v0.5.12)' };
    }
    const count = rows.length;
    const allOnVersion = rows.every(r => r.version === 'v0.5.12');
    const versions = rows.map(r => r.version || 'null').join(', ');
    if (count >= 5 && allOnVersion) {
      return { status: 'GREEN', msg: `${count}/5 peers active, all v0.5.12` };
    }
    if (count < 5) {
      return { status: 'RED', msg: `only ${count} active peers (need 5); versions: ${versions}` };
    }
    return { status: 'RED', msg: `${count} peers but not all v0.5.12; versions: ${versions}` };
  } catch (err) {
    return { status: 'RED', msg: `query failed: ${err.message}` };
  }
}

// Gate 2: gemma4:12b homogenized on all peers
async function gate2(url, anonKey) {
  try {
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const rows = await supabaseGet(url, anonKey, `peer_presence?select=peer_id,capabilities&last_seen_at=gte.${since}`);
    if (!rows || rows.length === 0) {
      return { status: 'RED', msg: '0 active peers found' };
    }
    const models = rows.map(r => {
      const caps = r.capabilities;
      if (!caps) return null;
      try {
        const parsed = typeof caps === 'string' ? JSON.parse(caps) : caps;
        return parsed.active_model ?? null;
      } catch { return null; }
    });
    const gemmaCount = models.filter(m => m === 'gemma4:12b').length;
    const total = rows.length;
    if (gemmaCount >= 5 && gemmaCount === total) {
      return { status: 'GREEN', msg: `${gemmaCount}/${total} peers report gemma4:12b` };
    }
    return { status: 'RED', msg: `only ${gemmaCount}/${total} peers on gemma4:12b; models: ${models.join(', ')}` };
  } catch (err) {
    return { status: 'RED', msg: `query failed: ${err.message}` };
  }
}

// Gate 3: fleet_warmup keep_alive=24h confirmed
async function gate3(url, anonKey) {
  try {
    const since = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    const rows = await supabaseGet(url, anonKey, `fleet_warmup_log?select=id,keep_alive,created_at&created_at=gte.${since}&keep_alive=eq.24h&limit=1`);
    if (rows && rows.length >= 1) {
      return { status: 'GREEN', msg: 'warmup event found within 25h window with keep_alive=24h' };
    }
    return { status: 'RED', msg: 'no fleet_warmup_log entry with keep_alive=24h in last 25h' };
  } catch (err) {
    const msg = err.message || '';
    if (msg.includes('42P01') || msg.includes('does not exist') || msg.includes('relation') || msg.includes('not found')) {
      return { status: 'AMBER', msg: 'table not found; confirm manually' };
    }
    return { status: 'AMBER', msg: `query failed (${msg.slice(0, 80)}); confirm manually` };
  }
}

// Gate 4: noop_test 4/5 GREEN
async function gate4(url, anonKey) {
  try {
    const rows = await supabaseGet(url, anonKey, `noop_test_results?select=id,result,batch_id,created_at&order=created_at.desc&limit=10`);
    if (!rows || rows.length === 0) {
      return { status: 'RED', msg: 'no noop_test_results rows found' };
    }
    const batchId = rows[0].batch_id;
    const batch = batchId ? rows.filter(r => r.batch_id === batchId) : rows.slice(0, 5);
    const greenCount = batch.filter(r => (r.result || '').toUpperCase() === 'GREEN').length;
    if (greenCount >= 4) {
      return { status: 'GREEN', msg: `confirmed_green_count=${greenCount} >= 4 out of ${batch.length}` };
    }
    return { status: 'RED', msg: `only ${greenCount}/${batch.length} GREEN in most recent noop_test batch` };
  } catch (err) {
    const msg = err.message || '';
    if (msg.includes('42P01') || msg.includes('does not exist') || msg.includes('relation') || msg.includes('not found')) {
      return { status: 'AMBER', msg: 'table not found; confirm manually' };
    }
    return { status: 'AMBER', msg: `query failed (${msg.slice(0, 80)}); confirm manually` };
  }
}

// Gate 5: all 5 SQL migrations applied (range 20260619120001-20260619120006)
async function gate5(url, anonKey) {
  const tables = ['schema_migrations', '_migrations', 'migrations'];
  for (const table of tables) {
    try {
      const rows = await supabaseGet(
        url, anonKey,
        `${table}?select=version&version=gte.20260619120001&version=lte.20260619120006`
      );
      if (rows && rows.length >= 5) {
        return { status: 'GREEN', msg: `${rows.length} migrations confirmed in range 20260619120001-20260619120006 (table: ${table})` };
      }
      if (rows) {
        return { status: 'RED', msg: `only ${rows.length}/5 migrations in range 20260619120001-20260619120006 (table: ${table})` };
      }
    } catch (err) {
      const msg = err.message || '';
      if (!msg.includes('42P01') && !msg.includes('does not exist') && !msg.includes('relation') && !msg.includes('not found')) {
        return { status: 'AMBER', msg: `migration table (${table}) query error: ${msg.slice(0, 80)}; confirm manually` };
      }
    }
  }
  return { status: 'AMBER', msg: 'no migration table found (schema_migrations / _migrations / migrations); confirm manually' };
}

// Gate 6: relay.lianabanyan.com reachable
async function gate6() {
  const candidates = [
    'https://relay.lianabanyan.com/health',
    'https://relay.lianabanyan.com/',
  ];
  for (const u of candidates) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(u, { method: 'GET', signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) return { status: 'GREEN', msg: `HTTP ${res.status} from ${u}` };
      return { status: 'RED', msg: `HTTP ${res.status} from ${u}` };
    } catch { /* try next */ }
  }
  return { status: 'RED', msg: 'relay.lianabanyan.com unreachable (both /health and / failed or timed out)' };
}

// Gate 7: validate-relay.mjs exists and is readable
async function gate7() {
  const vpath = 'C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\tools\\mesh-validation\\validate-relay.mjs';
  try {
    if (!existsSync(vpath)) return { status: 'RED', msg: `file not found: ${vpath}` };
    accessSync(vpath, constants.R_OK);
    return { status: 'GREEN', msg: 'file present and readable' };
  } catch (err) {
    return { status: 'RED', msg: `file access error: ${err.message}` };
  }
}

const C_GREEN = '\x1b[32m';
const C_AMBER = '\x1b[33m';
const C_RED = '\x1b[31m';
const C_RESET = '\x1b[0m';
const C_BOLD = '\x1b[1m';

function colorStatus(status) {
  if (status === 'GREEN') return `${C_GREEN}${status}${C_RESET}`;
  if (status === 'AMBER') return `${C_AMBER}${status}${C_RESET}`;
  return `${C_RED}${status}${C_RESET}`;
}

function printGate(n, result) {
  console.log(`GATE ${n}: ${colorStatus(result.status)} -- ${result.msg}`);
}

async function main() {
  const pub = loadPublicEnv();
  const url = SUPABASE_URL || pub.SUPABASE_URL || '';
  const anonKey = SUPABASE_ANON_KEY || pub.SUPABASE_ANON_KEY || '';

  if (!url || !anonKey) {
    console.error('ERROR: SUPABASE_URL and SUPABASE_ANON_KEY must be set (env vars or resources/supabase_public.env)');
    process.exit(1);
  }

  console.log(`\nTHUNDERCLAP Trial 02 -- gate verification -- ${new Date().toISOString()}\n`);

  const gates = [
    { n: 1, fn: () => gate1(url, anonKey) },
    { n: 2, fn: () => gate2(url, anonKey) },
    { n: 3, fn: () => gate3(url, anonKey) },
    { n: 4, fn: () => gate4(url, anonKey) },
    { n: 5, fn: () => gate5(url, anonKey) },
    { n: 6, fn: () => gate6() },
    { n: 7, fn: () => gate7() },
  ];

  let allGreen = true;
  for (const gate of gates) {
    const result = await gate.fn();
    printGate(gate.n, result);
    if (result.status !== 'GREEN') allGreen = false;
  }

  console.log('');
  if (allGreen) {
    console.log(`${C_GREEN}${C_BOLD}GATE CHECK: 7/7 GREEN -- ready to fire${C_RESET}`);
    process.exit(0);
  } else {
    console.log(`${C_RED}${C_BOLD}GATE CHECK: FAILED -- one or more gates not GREEN${C_RESET}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
