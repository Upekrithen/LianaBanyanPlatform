#!/usr/bin/env node
/**
 * run-plow-on-mesh.mjs — BP087 MAMBA-α CLI entry point
 *
 * Fires MMLU-Pro questions through mesh-distributed Plow via wan-relay-route.
 * Peers answer independently; M0 aggregates with Ascending Andon discipline.
 *
 * Usage:
 *   node tools/plow/run-plow-on-mesh.mjs \
 *     [--peers=5] \
 *     [--blades=12] \
 *     [--questions=5] \
 *     [--domain=<name>] \
 *     [--andon-threshold=15] \
 *     [--routing=domain-affinity|round-robin] \
 *     [--mode=smoke|full] \
 *     [--session=<id>]
 *
 * Canon: canon_plow_on_mesh_integration_distributed_12_blade_bp087
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const WORKSPACE_ROOT = resolve(__dirname, '../..');

// ─── Secret loading (no echo) ─────────────────────────────────────────────────

function loadEnvFile(filePath) {
  const out = {};
  try {
    const lines = readFileSync(filePath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      // Strip inline # comments (BP087 I11 fix — same logic as env_loader.ts)
      if (val.length >= 2) {
        const f = val[0], l = val[val.length - 1];
        if ((f === '"' && l === '"') || (f === "'" && l === "'")) {
          val = val.slice(1, -1);
        } else {
          const hashIdx = val.indexOf('#');
          if (hashIdx > -1) val = val.slice(0, hashIdx).trim();
        }
      } else {
        const hashIdx = val.indexOf('#');
        if (hashIdx > -1) val = val.slice(0, hashIdx).trim();
      }
      out[key] = val;
    }
  } catch { /* file absent */ }
  return out;
}

function loadPublicEnv() {
  return loadEnvFile(resolve(WORKSPACE_ROOT, 'resources', 'supabase_public.env'));
}

function loadServiceKey() {
  const secretsPath = resolve(homedir(), '.claude', 'state', 'secrets', '22May2026.env');
  const env = loadEnvFile(secretsPath);
  return env['SUPABASE_SERVICE_ROLE_KEY'] || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

// ─── CLI arg parsing ───────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    peers: 5,
    blades: 12,
    questions: 5,
    domain: null,
    andonThreshold: 15,
    routing: 'round-robin',
    mode: 'smoke',
    session: null,
  };
  for (const arg of args) {
    const [key, val] = arg.replace(/^--/, '').split('=');
    if (!key) continue;
    switch (key) {
      case 'peers':           parsed.peers = parseInt(val, 10); break;
      case 'blades':          parsed.blades = parseInt(val, 10); break;
      case 'questions':       parsed.questions = parseInt(val, 10); break;
      case 'domain':          parsed.domain = val; break;
      case 'andon-threshold': parsed.andonThreshold = parseInt(val, 10); break;
      case 'routing':         parsed.routing = val; break;
      case 'mode':            parsed.mode = val; break;
      case 'session':         parsed.session = val; break;
    }
  }
  if (parsed.mode === 'full' && parsed.questions === 5) parsed.questions = 70;
  if (!parsed.session) {
    parsed.session = `plow-mesh-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`;
  }
  return parsed;
}

// ─── Dataset loading ──────────────────────────────────────────────────────────

const DATASET_BASE = join(WORKSPACE_ROOT, 'lb-reproducibility-pack', 'datasets', 'mmlu_pro_per_domain');
const DOMAINS = [
  'biology', 'business', 'chemistry', 'computer_science',
  'economics', 'engineering', 'health', 'history',
  'law', 'math', 'other', 'philosophy', 'physics', 'psychology',
];
const LETTERS = 'ABCDEFGHIJ';

function loadDomainQuestions(domain) {
  const p = join(DATASET_BASE, domain, 'questions.json');
  if (!existsSync(p)) return [];
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return []; }
}

function selectQuestions(totalCount, filterDomain) {
  const selected = [];
  const domains = filterDomain ? [filterDomain] : DOMAINS;
  for (const domain of domains) {
    const bank = loadDomainQuestions(domain);
    const stride = Math.max(1, Math.floor(bank.length / Math.ceil(totalCount / domains.length)));
    for (let i = 0; i < bank.length && selected.length < Math.ceil(totalCount / domains.length); i += stride) {
      const q = bank[i];
      if (!q) continue;
      const correctIdx = q.options?.indexOf(q.correct_answer);
      const sealedLetter = correctIdx >= 0 ? LETTERS[correctIdx] : null;
      selected.push({
        question: q.question,
        options: q.options || [],
        domain,
        sealed_letter: sealedLetter,
      });
    }
    if (selected.length >= totalCount) break;
  }
  return selected.slice(0, totalCount);
}

// ─── Active peer fetch ────────────────────────────────────────────────────────

async function getActivePeers(supabaseUrl, anonKey, maxPeers) {
  try {
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const url = `${supabaseUrl}/rest/v1/peer_presence?select=peer_id,tier,last_seen_at&last_seen_at=gte.${since}&order=last_seen_at.desc&limit=${maxPeers}`;
    const res = await fetch(url, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];
    const rows = await res.json();
    return (rows || []).map(r => ({ peer_id: r.peer_id, domain_affinity: 0.5 }));
  } catch { return []; }
}

// ─── Domain affinity load ─────────────────────────────────────────────────────

async function loadDomainAffinity(supabaseUrl, anonKey, peerIds, domain) {
  if (!peerIds.length) return {};
  try {
    const ids = peerIds.map(id => `"${id}"`).join(',');
    const url = `${supabaseUrl}/rest/v1/peer_domain_affinity?select=peer_id,correctness_rate&peer_id=in.(${ids})&domain=eq.${encodeURIComponent(domain)}`;
    const res = await fetch(url, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return {};
    const rows = await res.json() || [];
    const map = {};
    for (const r of rows) map[r.peer_id] = r.correctness_rate;
    return map;
  } catch { return {}; }
}

// ─── Domain affinity update ───────────────────────────────────────────────────

async function updateDomainAffinity(supabaseUrl, serviceKey, peerId, domain, wasCorrect) {
  try {
    const upsertUrl = `${supabaseUrl}/rest/v1/peer_domain_affinity`;
    // Read current rate first
    const getRes = await fetch(
      `${upsertUrl}?peer_id=eq.${peerId}&domain=eq.${encodeURIComponent(domain)}&select=correctness_rate,sample_count`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }, signal: AbortSignal.timeout(5_000) }
    );
    let currentRate = 0.5, currentCount = 0;
    if (getRes.ok) {
      const rows = await getRes.json();
      if (rows && rows.length > 0) {
        currentRate = rows[0].correctness_rate ?? 0.5;
        currentCount = rows[0].sample_count ?? 0;
      }
    }
    // Incremental update
    const newCount = currentCount + 1;
    const newRate = ((currentRate * currentCount) + (wasCorrect ? 1 : 0)) / newCount;
    await fetch(upsertUrl, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        peer_id: peerId,
        domain,
        correctness_rate: newRate,
        sample_count: newCount,
        last_updated: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(5_000),
    });
  } catch { /* non-fatal */ }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();
  const pubEnv = loadPublicEnv();
  const serviceKey = loadServiceKey();

  const supabaseUrl = pubEnv['SUPABASE_URL'] || process.env.SUPABASE_URL || '';
  const anonKey = pubEnv['SUPABASE_ANON_KEY'] || process.env.SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !anonKey) {
    console.error('[run-plow-on-mesh] ERROR: SUPABASE_URL or SUPABASE_ANON_KEY not found in resources/supabase_public.env');
    process.exit(1);
  }
  if (!serviceKey) {
    console.error('[run-plow-on-mesh] ERROR: SUPABASE_SERVICE_ROLE_KEY not found');
    process.exit(1);
  }

  console.log(`[run-plow-on-mesh] SESSION=${args.session} mode=${args.mode} questions=${args.questions} routing=${args.routing} andon-threshold=${args.andonThreshold}`);

  // Load questions
  const questions = selectQuestions(args.questions, args.domain);
  if (questions.length === 0) {
    console.error('[run-plow-on-mesh] No questions loaded — check DATASET_BASE path');
    process.exit(1);
  }
  console.log(`[run-plow-on-mesh] Loaded ${questions.length} questions across ${[...new Set(questions.map(q => q.domain))].length} domains`);

  // Get active peers
  let peers = await getActivePeers(supabaseUrl, anonKey, args.peers);
  if (peers.length === 0) {
    console.warn('[run-plow-on-mesh] WARNING: No active peers found in peer_presence (last 10min). Proceeding with 0 peers — results will be empty.');
  }
  console.log(`[run-plow-on-mesh] ${peers.length} active peer(s) found`);

  // Results accumulator
  const allResults = [];
  let totalCorrect = 0;
  let totalScored = 0;
  let andonFires = 0;
  const startTime = Date.now();

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const domain = q.domain;

    // Load domain affinity for this domain (MAMBA-γ)
    if (args.routing === 'domain-affinity' && peers.length > 0) {
      const affinityMap = await loadDomainAffinity(supabaseUrl, anonKey, peers.map(p => p.peer_id), domain);
      peers = peers.map(p => ({
        ...p,
        domain_affinity: affinityMap[p.peer_id] ?? 0.5,
      }));
    }

    process.stdout.write(`  Q[${i + 1}/${questions.length}] domain=${domain} dispatching...`);

    // Dynamically import mesh_plow_dispatcher (built TypeScript, loaded from dist)
    // At runtime in packaged app, this is dist/main/plow/mesh_plow_dispatcher.js
    // In dev (node tools/plow/run-plow-on-mesh.mjs), ts-node or tsx needed;
    // here we use the REST API directly since this script runs as plain ESM.
    // Note: We call the underlying Supabase relay directly rather than importing
    // the compiled TS file, for portability as a standalone .mjs tool.
    const { dispatchQuestionToMesh } = await importMeshDispatcher();

    const result = await dispatchQuestionToMesh(q, {
      supabase_url: supabaseUrl,
      supabase_anon_key: anonKey,
      supabase_service_key: serviceKey,
      peers,
      andon_threshold: args.andonThreshold,
      routing: args.routing,
    });

    allResults.push(result);
    if (result.andon_triggered) andonFires++;

    // Score if sealed_letter present
    const seal = q.sealed_letter;
    if (seal && result.consensus_letter !== null) {
      totalScored++;
      const correct = result.consensus_letter === seal;
      if (correct) totalCorrect++;

      // Update domain affinity for each responding peer (MAMBA-γ §4)
      for (const pr of result.peer_responses) {
        const peerCorrect = pr.answer_letter === seal;
        await updateDomainAffinity(supabaseUrl, serviceKey, pr.peer_id, domain, peerCorrect);
      }

      process.stdout.write(` consensus=${result.consensus_letter} sealed=${seal} ${correct ? '✓' : '✗'} peers=${result.peers_responded}/${result.peers_queried} ${result.andon_triggered ? 'ANDON' : ''}\n`);
    } else {
      process.stdout.write(` consensus=${result.consensus_letter ?? 'null'} peers=${result.peers_responded}/${result.peers_queried} ${result.andon_triggered ? 'ANDON' : ''}\n`);
    }
  }

  const elapsed = Date.now() - startTime;
  const accuracy = totalScored > 0 ? ((totalCorrect / totalScored) * 100).toFixed(1) : 'N/A';

  console.log('');
  console.log('═'.repeat(60));
  console.log(`[run-plow-on-mesh] COMPLETE — session=${args.session}`);
  console.log(`  Questions:   ${questions.length}`);
  console.log(`  Scored:      ${totalScored}`);
  console.log(`  Correct:     ${totalCorrect}`);
  console.log(`  Accuracy:    ${accuracy}%`);
  console.log(`  Andon fires: ${andonFires}`);
  console.log(`  Elapsed:     ${(elapsed / 1000).toFixed(1)}s`);
  console.log(`  Routing:     ${args.routing}`);
  console.log('');

  // δ6 wire format summary
  const totalHex = allResults.reduce((s, r) => s + r.wire_format_receipt.total_hex_bytes, 0);
  const totalJson = allResults.reduce((s, r) => s + r.wire_format_receipt.total_json_bytes, 0);
  const delta = totalHex - totalJson;
  const deltaPct = totalJson > 0 ? ((delta / totalJson) * 100).toFixed(1) : 'N/A';
  console.log(`  [δ6] Wire format: hex=${totalHex}B json=${totalJson}B delta=${delta > 0 ? '+' : ''}${delta}B (${deltaPct}%)`);
  console.log('═'.repeat(60));

  // Write receipt JSON
  const receiptDir = resolve(homedir(), 'Documents', 'Asteroid-ProofVault', 'receipts', 'THUNDERCLAP');
  try {
    if (!existsSync(receiptDir)) mkdirSync(receiptDir, { recursive: true });
    const receiptPath = join(receiptDir, `plow-mesh-${args.session}.json`);
    writeFileSync(receiptPath, JSON.stringify({
      session: args.session,
      mode: args.mode,
      routing: args.routing,
      total_questions: questions.length,
      total_scored: totalScored,
      total_correct: totalCorrect,
      accuracy_pct: totalScored > 0 ? totalCorrect / totalScored : null,
      andon_fires: andonFires,
      elapsed_ms: elapsed,
      wire_format_receipt: { total_hex_bytes: totalHex, total_json_bytes: totalJson, byte_delta: delta, delta_pct: deltaPct },
      results: allResults,
      generated_at: new Date().toISOString(),
      generator: 'run-plow-on-mesh.mjs · BP087 MAMBA-α · Sonnet 4.6',
    }, null, 2), 'utf8');
    console.log(`  Receipt: ${receiptPath}`);
  } catch (err) {
    console.warn(`  [run-plow-on-mesh] Receipt write failed (non-fatal):`, err.message);
  }
}

// Dynamic import shim — at runtime this will resolve the compiled mesh_plow_dispatcher.js
// Callers that run via tsx/ts-node will get the TypeScript source directly.
async function importMeshDispatcher() {
  // Try compiled JS first (packaged electron or npm run build)
  const compiledPath = resolve(WORKSPACE_ROOT, 'dist', 'main', 'plow', 'mesh_plow_dispatcher.js');
  // Fall back to tsx-runnable path (dev mode)
  // In pure ESM .mjs context we can't import .ts files directly without tsx.
  // Provide a graceful inline fallback using direct Supabase REST if compiled not available.
  if (existsSync(compiledPath)) {
    return await import(`file://${compiledPath}`);
  }
  // Inline fallback: minimal dispatch that posts hex frame to wan-relay-route
  return {
    dispatchQuestionToMesh: async (question, config) => {
      const { createHash, randomUUID } = await import('crypto');
      const dispatchId = randomUUID();
      const payload = { question: question.question, options: question.options, domain: question.domain, dispatch_id: dispatchId };
      const jsonStr = JSON.stringify(payload);
      // Minimal hex encoding without the full encoder (fallback for dev-mode)
      const hexBody = Buffer.from(jsonStr, 'utf8').toString('hex');
      const hexFrame = `${'0'.repeat(16)}0001${hexBody}${'0'.repeat(8)}`;
      for (const peer of config.peers) {
        try {
          await fetch(`${config.supabase_url}/functions/v1/wan-relay-route`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.supabase_service_key}`, apikey: config.supabase_service_key },
            body: JSON.stringify({ target_peer_id: peer.peer_id, hex_frame: hexFrame, payload_json: jsonStr, session_id: dispatchId }),
            signal: AbortSignal.timeout(10_000),
          });
        } catch { /* non-fatal */ }
      }
      return {
        dispatch_id: dispatchId, domain: question.domain, question: question.question,
        peers_queried: config.peers.length, peers_responded: 0,
        consensus_letter: null, confidence_variance: 0, andon_triggered: false,
        peer_responses: [], elapsed_ms: 0,
        wire_format_receipt: { total_hex_bytes: hexFrame.length, total_json_bytes: jsonStr.length, byte_delta: hexFrame.length - jsonStr.length, delta_pct: 0 },
        routing: config.routing ?? 'round-robin',
      };
    },
  };
}

main().catch(err => {
  console.error('[run-plow-on-mesh] FATAL:', err);
  process.exit(1);
});
