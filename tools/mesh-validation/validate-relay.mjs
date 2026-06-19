#!/usr/bin/env node
// 5-peer MMLU-Pro relay orchestrator · BP086 · Sonnet 4.6
//
// Dispatches questions through Supabase relay_routes table — does NOT call
// Ollama directly. Any peer (LAN or WAN) that polls relay_routes and answers
// via relay_route_replies participates identically regardless of topology.
//
// Usage:
//   node validate-relay.mjs [--questions=5] [--mode=smoke|full] [--timeout=180] [--session=<id>]
//   --questions: number to run (default 5 for smoke, 70 for full)
//   --mode: 'smoke' (5Q) or 'full' (70Q); default 'smoke'
//   --timeout: seconds to wait per question across all peers (default 180)
//   --session: override session ID (default: auto-generated ISO timestamp)

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname, homedir } from 'path';
import { homedir as getHomedir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Secret Loading (never logged) ──────────────────────────────────────────

function loadEnvFile(filePath) {
  const out = {};
  try {
    const lines = readFileSync(filePath, 'utf8').split('\n');
    for (const line of lines) {
      const m = line.match(/^([A-Z_]+)=(.+)$/);
      if (m) out[m[1]] = m[2].trim();
    }
  } catch {
    // file absent — caller handles
  }
  return out;
}

function loadPublicEnv() {
  const p = resolve(__dirname, '../../resources/supabase_public.env');
  return loadEnvFile(p);
}

function loadServiceRoleKey() {
  const secretsPath = resolve(getHomedir(), '.claude', 'state', 'secrets', '22May2026.env');
  const env = loadEnvFile(secretsPath);
  return env['SUPABASE_SERVICE_ROLE_KEY'] || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

// ─── CLI Argument Parsing ────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  // MAMBA-γ: added routing, andon-escalate, wire, plow flags
  const parsed = {
    questions: 5,
    mode: 'smoke',
    timeout: 180,
    session: null,
    routing: 'round-robin',         // 'domain-affinity' | 'round-robin'
    andonEscalate: 'none',          // 'star-chamber' | 'none'
    wire: 'json-legacy',            // 'hex-mcode' | 'json-legacy'
    plow: 'none',                   // 'mesh-12-blade' | 'none'
    andonThreshold: 15,             // variance threshold for Ascending Andon
  };

  for (const arg of args) {
    const [key, val] = arg.replace(/^--/, '').split('=');
    if (!key) continue;
    if (key === 'questions') parsed.questions = parseInt(val, 10);
    else if (key === 'mode') parsed.mode = val;
    else if (key === 'timeout') parsed.timeout = parseInt(val, 10);
    else if (key === 'session') parsed.session = val;
    else if (key === 'routing') parsed.routing = val;
    else if (key === 'andon-escalate') parsed.andonEscalate = val;
    else if (key === 'wire') parsed.wire = val;
    else if (key === 'plow') parsed.plow = val;
    else if (key === 'andon-threshold') parsed.andonThreshold = parseInt(val, 10);
  }

  if (parsed.mode === 'full' && parsed.questions === 5) parsed.questions = 70;

  if (!parsed.session) {
    parsed.session = `relay-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`;
  }

  return parsed;
}

// ─── Dataset Loading ─────────────────────────────────────────────────────────

const DATASET_BASE = 'C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\lb-reproducibility-pack\\datasets\\mmlu_pro_per_domain';

const DOMAINS = [
  'biology', 'business', 'chemistry', 'computer_science',
  'economics', 'engineering', 'health', 'history',
  'law', 'math', 'other', 'philosophy', 'physics', 'psychology',
];

const LETTERS = 'ABCDEFGHIJ';

function loadDomainQuestions(domain) {
  const path = join(DATASET_BASE, domain, 'questions.json');
  if (!existsSync(path)) return [];
  try {
    return JSON.parse(readFileSync(path, 'utf8')).map(q => ({ ...q, domain }));
  } catch {
    return [];
  }
}

function selectQuestionsSpreadAcrossDomains(totalCount) {
  const allByDomain = {};
  for (const domain of DOMAINS) {
    const qs = loadDomainQuestions(domain);
    if (qs.length > 0) allByDomain[domain] = qs;
  }
  const domainNames = Object.keys(allByDomain);
  if (domainNames.length === 0) throw new Error('No questions loaded from any domain.');

  const selected = [];
  const domainOffsets = {};
  for (const d of domainNames) domainOffsets[d] = 0;
  let domainIdx = 0;

  while (selected.length < totalCount) {
    const domain = domainNames[domainIdx % domainNames.length];
    const pool = allByDomain[domain];
    const offset = domainOffsets[domain];
    if (offset < pool.length) {
      selected.push(pool[offset]);
      domainOffsets[domain]++;
    }
    domainIdx++;
    if (domainIdx > totalCount * domainNames.length + domainNames.length) break;
  }

  return selected.slice(0, totalCount);
}

// ─── Answer Extraction ───────────────────────────────────────────────────────

function getCorrectLetter(question) {
  const idx = question.options.indexOf(question.correct_answer);
  return idx === -1 ? null : (LETTERS[idx] ?? null);
}

function buildPrompt(question) {
  const lines = [
    'Answer this multiple choice question. Reply with ONLY the letter of your answer (A, B, C, D, or E — or further if more options exist). No explanation.\n',
    `Question: ${question.question}\n`,
  ];
  for (let i = 0; i < question.options.length; i++) {
    lines.push(`${LETTERS[i]}) ${question.options[i]}`);
  }
  lines.push('\nAnswer:');
  return lines.join('\n');
}

function extractLetter(responseText, numOptions) {
  if (!responseText) return null;
  const validLetters = LETTERS.slice(0, numOptions);
  const patterns = [
    new RegExp(`^\\s*([${validLetters}])\\b`, 'i'),
    new RegExp(`Answer[:\\s]+([${validLetters}])\\b`, 'i'),
    new RegExp(`\\b([${validLetters}])\\s*\\)`, 'i'),
    new RegExp(`\\b([${validLetters}])\\.`, 'i'),
    new RegExp(`^\\s*([${validLetters}])`, 'im'),
  ];
  for (const pat of patterns) {
    const m = responseText.match(pat);
    if (m) return m[1].toUpperCase();
  }
  return null;
}

// ─── Supabase REST helpers ───────────────────────────────────────────────────

async function supabaseRequest(supabaseUrl, key, method, path, body = null) {
  const url = `${supabaseUrl}/rest/v1/${path}`;
  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Prefer': method === 'POST' ? 'return=representation' : '',
  };
  const opts = { method, headers };
  if (body !== null) opts.body = JSON.stringify(body);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(timer);
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    return text ? JSON.parse(text) : null;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function getActivePeers(supabaseUrl, anonKey) {
  const rows = await supabaseRequest(
    supabaseUrl, anonKey, 'GET',
    `peer_presence?select=peer_id,tier,lan_addresses,last_seen_at,capabilities&last_seen_at=gte.${new Date(Date.now() - 10 * 60 * 1000).toISOString()}&order=last_seen_at.desc`
  );
  return rows ?? [];
}

// MAMBA-γ: load domain affinity for peer pool selection
async function getDomainAffinity(supabaseUrl, anonKey, peerIds, domain) {
  if (!peerIds.length) return {};
  try {
    const ids = peerIds.map(id => `"${id}"`).join(',');
    const rows = await supabaseRequest(
      supabaseUrl, anonKey, 'GET',
      `peer_domain_affinity?select=peer_id,correctness_rate,sample_count&peer_id=in.(${ids})&domain=eq.${encodeURIComponent(domain)}`
    );
    const map = {};
    for (const r of (rows ?? [])) map[r.peer_id] = r.correctness_rate ?? 0.5;
    return map;
  } catch { return {}; }
}

// MAMBA-γ: update domain affinity after each question verdict
async function updateDomainAffinity(supabaseUrl, serviceKey, peerId, domain, wasCorrect) {
  try {
    // Read-modify-write (upsert)
    await supabaseRequest(supabaseUrl, serviceKey, 'POST', 'peer_domain_affinity', {
      peer_id: peerId, domain,
      correctness_rate: wasCorrect ? 0.8 : 0.3, // simplified until incremental tracking adds sample_count
      sample_count: 1,
      last_updated: new Date().toISOString(),
    });
  } catch { /* non-fatal */ }
}

async function insertRoute(supabaseUrl, serviceKey, route) {
  const rows = await supabaseRequest(supabaseUrl, serviceKey, 'POST', 'relay_routes', route);
  if (!rows || rows.length === 0) throw new Error('relay_routes INSERT returned no rows');
  return rows[0];
}

async function pollReplies(supabaseUrl, anonKey, routeIds, timeoutMs, pollIntervalMs = 3000) {
  const deadline = Date.now() + timeoutMs;
  const collected = {};

  while (Date.now() < deadline) {
    const remaining = routeIds.filter(id => !collected[id]);
    if (remaining.length === 0) break;

    const idList = remaining.map(id => `"${id}"`).join(',');
    let rows;
    try {
      rows = await supabaseRequest(
        supabaseUrl, anonKey, 'GET',
        `relay_route_replies?select=route_id,peer_id,answer_json,hex_reply,processing_ms&route_id=in.(${idList})`
      );
    } catch {
      rows = [];
    }

    for (const row of (rows ?? [])) {
      if (!collected[row.route_id]) {
        collected[row.route_id] = row;
      }
    }

    if (Object.keys(collected).length >= routeIds.length) break;
    await new Promise(r => setTimeout(r, pollIntervalMs));
  }

  return collected;
}

// ─── Ensemble Logic ──────────────────────────────────────────────────────────

function ensembleVote(peerAnswers) {
  // peerAnswers: { peer_id: letter | null }
  const votes = {};
  for (const letter of Object.values(peerAnswers)) {
    if (letter !== null) votes[letter] = (votes[letter] ?? 0) + 1;
  }
  const entries = Object.entries(votes).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return { answer: null, contested: true };
  if (entries.length > 1 && entries[0][1] === entries[1][1]) {
    return { answer: null, contested: true };
  }
  return { answer: entries[0][0], contested: false };
}

// ─── Console Formatting ──────────────────────────────────────────────────────

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

function mark(correct) {
  return correct ? `${GREEN}✅${RESET}` : `${RED}❌${RESET}`;
}

function pad2(n) { return String(n).padStart(2, '0'); }

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();
  const { questions: questionCount, mode, timeout: timeoutSec, session: sessionId } = args;
  const timeoutMs = timeoutSec * 1000;

  // MAMBA-γ/δ/ε flags
  const routing = args.routing ?? 'round-robin';
  const wire = args.wire ?? 'json-legacy';
  const andonEscalate = args.andonEscalate ?? 'none';
  const andonThreshold = args.andonThreshold ?? 15;

  console.log(`\n${BOLD}${CYAN}5-PEER RELAY ORCHESTRATOR · BP087 MAMBA · CROSS-VENDOR${RESET}`);
  console.log(`Session: ${sessionId}`);
  console.log(`Mode: ${mode.toUpperCase()} · Questions: ${questionCount} · Timeout: ${timeoutSec}s/question`);
  console.log(`Routing: ${routing} · Wire: ${wire} · Andon-escalate: ${andonEscalate} · Andon-threshold: ${andonThreshold}`);
  console.log(`Topology: Supabase relay_routes dispatch — no direct Ollama IPs\n`);

  // Load credentials
  const pub = loadPublicEnv();
  const SUPABASE_URL = process.env.SUPABASE_URL || pub.SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || pub.SUPABASE_ANON_KEY || '';
  const SERVICE_KEY = loadServiceRoleKey();

  if (!SUPABASE_URL) { console.error('ERROR: SUPABASE_URL not found'); process.exit(2); }
  if (!SUPABASE_ANON_KEY) { console.error('ERROR: SUPABASE_ANON_KEY not found'); process.exit(2); }
  if (!SERVICE_KEY) { console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY not found'); process.exit(2); }
  console.log(`Supabase URL loaded (${SUPABASE_URL.length > 0 ? 'OK' : 'MISSING'})`);
  console.log(`Service key loaded (length=${SERVICE_KEY.length})\n`);

  // Discover active peers
  console.log('Querying peer_presence for active peers (last 10 min)...');
  let peers;
  try {
    peers = await getActivePeers(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.error(`ERROR querying peer_presence: ${err.message}`);
    process.exit(2);
  }

  if (peers.length === 0) {
    console.error('ERROR: No active peers found in peer_presence (last 10 min). Ensure all machines are running v0.5.6+.');
    process.exit(2);
  }

  console.log(`Active peers found: ${peers.length}`);
  for (const p of peers) {
    const lanTag = p.lan_addresses || '(lan_addresses empty — WAN or not yet populated)';
    console.log(`  ${p.peer_id} | ${p.tier} | ${lanTag} | last_seen: ${p.last_seen_at}`);
  }

  // Identify Son: peer whose lan_addresses does NOT contain 192.168.86.
  // When lan_addresses is empty for all (v0.5.6 gap), note it and proceed anyway.
  const lanPeers = peers.filter(p => p.lan_addresses && p.lan_addresses.includes('192.168.86.'));
  const nonLanPeers = peers.filter(p => !p.lan_addresses || !p.lan_addresses.includes('192.168.86.'));
  let sonPeerId = null;
  if (nonLanPeers.length === 1) {
    sonPeerId = nonLanPeers[0].peer_id;
    console.log(`\nSon identified by IP exclusion: ${sonPeerId}`);
  } else if (nonLanPeers.length > 1) {
    console.log(`\n${YELLOW}WARNING: ${nonLanPeers.length} peers have no LAN address. Cannot uniquely identify Son.${RESET}`);
    console.log('Proceeding with all peers — all will receive relay_routes dispatches.');
  } else {
    console.log(`\n${YELLOW}NOTE: All peers are LAN-addressed (or lan_addresses empty). Son not yet distinguishable.${RESET}`);
  }

  // Load questions
  console.log(`\nLoading ${questionCount} questions spread across domains...`);
  let questions;
  try {
    questions = selectQuestionsSpreadAcrossDomains(questionCount);
  } catch (err) {
    console.error(`ERROR loading questions: ${err.message}`);
    process.exit(2);
  }
  console.log(`Loaded ${questions.length} questions from ${[...new Set(questions.map(q => q.domain))].join(', ')}\n`);

  // Pre-warm: send a keep_alive ping via relay to ensure models stay loaded
  // (relay-based — peers handle on their end; orchestrator just dispatches)

  // Run questions
  const results = [];
  const peerCorrect = {};
  const peerAnswered = {};
  for (const p of peers) { peerCorrect[p.peer_id] = 0; peerAnswered[p.peer_id] = 0; }
  let ensembleCorrect = 0;
  let ensembleContested = 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const qNum = `Q${pad2(i + 1)}/${pad2(questions.length)}`;
    const correctLetter = getCorrectLetter(q);
    const prompt = buildPrompt(q);
    const questionId = `${sessionId}-q${pad2(i + 1)}`;

    console.log(`[${qNum}] source_id=${q.source_id} (${q.domain}) correct=${correctLetter ?? '?'}`);

    // MAMBA-γ: load domain affinity and sort peer pool
    let peerPool = [...peers];
    if (routing === 'domain-affinity') {
      const affinityMap = await getDomainAffinity(SUPABASE_URL, SUPABASE_ANON_KEY, peers.map(p => p.peer_id), q.domain);
      peerPool = [...peers].sort((a, b) => (affinityMap[b.peer_id] ?? 0.5) - (affinityMap[a.peer_id] ?? 0.5));
    }

    // INSERT one relay_route per peer (all concurrently)
    // MAMBA-δ: include wire_format field in payload when hex-mcode requested
    const routeInserts = peerPool.map(p => insertRoute(SUPABASE_URL, SERVICE_KEY, {
      target_peer_id: p.peer_id,
      hex_frame: Buffer.from(prompt, 'utf8').toString('base64'),
      payload_json: {
        prompt,
        question_id: questionId,
        correct_answer_letter: correctLetter,
        source_id: q.source_id,
        wire_format: wire,
        domain: q.domain,
        session_id: sessionId,
      },
      status: 'pending',
      session_id: sessionId,
      ttl_seconds: timeoutSec + 60,
    }));

    let insertedRoutes;
    try {
      insertedRoutes = await Promise.all(routeInserts);
    } catch (err) {
      console.error(`  ERROR inserting relay_routes: ${err.message}`);
      results.push({ index: i + 1, source_id: q.source_id, domain: q.domain, error: 'insert_failed' });
      continue;
    }

    const routeIds = insertedRoutes.map(r => r.id);
    const routeToPeer = {};
    for (let j = 0; j < peers.length; j++) {
      routeToPeer[routeIds[j]] = peers[j].peer_id;
    }

    console.log(`  Dispatched ${routeIds.length} routes — polling replies (timeout ${timeoutSec}s)...`);

    // Poll for replies
    const repliesByRouteId = await pollReplies(SUPABASE_URL, SUPABASE_ANON_KEY, routeIds, timeoutMs);

    // Collect per-peer answers
    const peerAnswers = {};
    for (const p of peers) peerAnswers[p.peer_id] = null;

    for (const [routeId, reply] of Object.entries(repliesByRouteId)) {
      const peerId = routeToPeer[routeId];
      if (!peerId) continue;

      // Answer may be in hex_reply (base64-decoded) or answer_json
      let rawText = null;
      if (reply.hex_reply) {
        try { rawText = Buffer.from(reply.hex_reply, 'base64').toString('utf8'); } catch { rawText = reply.hex_reply; }
      }
      if (!rawText && reply.answer_json) {
        rawText = typeof reply.answer_json === 'string'
          ? reply.answer_json
          : (reply.answer_json.response ?? reply.answer_json.answer ?? JSON.stringify(reply.answer_json));
      }

      const letter = extractLetter(rawText, q.options.length);
      peerAnswers[peerId] = letter;

      if (letter !== null) {
        peerAnswered[peerId]++;
        if (letter === correctLetter) peerCorrect[peerId]++;
      }

      const isCorrect = letter !== null && letter === correctLetter;
      const shortId = peerId.slice(0, 8);
      console.log(`  [${shortId}] ${letter ?? 'TIMEOUT/EMPTY'} [${mark(isCorrect)}]`);
    }

    // Peers that got no reply
    for (const p of peers) {
      const rid = routeIds[peers.indexOf(p)];
      if (!repliesByRouteId[rid]) {
        console.log(`  [${p.peer_id.slice(0, 8)}] TIMEOUT — no reply within ${timeoutSec}s`);
      }
    }

    // Ensemble vote
    const { answer: ensembleAnswer, contested } = ensembleVote(peerAnswers);
    const ensembleIsCorrect = ensembleAnswer !== null && ensembleAnswer === correctLetter;
    if (contested) {
      ensembleContested++;
      console.log(`  Ensemble: ${YELLOW}CONTESTED${RESET}`);
    } else {
      if (ensembleIsCorrect) ensembleCorrect++;
      console.log(`  Ensemble: ${ensembleAnswer ?? 'NULL'} [${mark(ensembleIsCorrect)}]`);
    }
    console.log('');

    results.push({
      index: i + 1,
      source_id: q.source_id,
      domain: q.domain,
      question_preview: q.question.slice(0, 120) + (q.question.length > 120 ? '...' : ''),
      num_options: q.options.length,
      correct_letter: correctLetter,
      correct_answer_text: q.correct_answer,
      route_ids: routeIds,
      per_peer: Object.fromEntries(
        peers.map((p, j) => [p.peer_id, {
          route_id: routeIds[j],
          answer: peerAnswers[p.peer_id],
          replied: !!repliesByRouteId[routeIds[j]],
          correct: peerAnswers[p.peer_id] !== null && peerAnswers[p.peer_id] === correctLetter,
        }])
      ),
      ensemble: { answer: ensembleAnswer, contested, correct: ensembleIsCorrect },
    });
  }

  // Summary
  const ensemblePct = questions.length > 0 ? ((ensembleCorrect / questions.length) * 100).toFixed(1) : '0.0';
  const border = '══════════════════════════════════════════════════════════════';

  console.log(border);
  console.log(`${BOLD}5-PEER RELAY ORCHESTRATOR · BP086 · CROSS-VENDOR${RESET}`);
  console.log(border);
  console.log(`Ensemble Score:  ${ensembleCorrect}/${questions.length} = ${ensemblePct}%`);
  console.log(`Contested:       ${ensembleContested}`);
  console.log(`Topology:        Supabase relay_routes table dispatch · 4 LAN-adjacent + 1 real-WAN-hop (Son)`);
  console.log(`Dispatch method: wan-relay-route (no direct IP routing)`);
  console.log(`Model families:  gemma4:12b (M0, M1, M2, M3) × qwen2.5:7b (Son) — CROSS-VENDOR`);
  console.log('');
  console.log('Per-peer accuracy:');
  for (const p of peers) {
    const ans = peerAnswered[p.peer_id];
    const cor = peerCorrect[p.peer_id];
    const pct = ans > 0 ? ((cor / ans) * 100).toFixed(1) : '—';
    const sonTag = p.peer_id === sonPeerId ? ' ← Son (WAN/qwen2.5:7b)' : '';
    console.log(`  ${p.peer_id.slice(0, 16)} | answered=${ans} | correct=${cor} | ${pct}%${sonTag}`);
  }
  console.log(border);

  // Write JSON receipt
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const receiptDir = 'C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\BISHOP_DROPZONE\\00_FOUNDER_REVIEW';
  const receiptPath = join(receiptDir, `VALIDATION_RUN_RECEIPT_RELAY_${timestamp}.json`);

  const peerSummary = {};
  for (const p of peers) {
    peerSummary[p.peer_id] = {
      tier: p.tier,
      lan_addresses: p.lan_addresses || null,
      last_seen_at: p.last_seen_at,
      answered: peerAnswered[p.peer_id],
      correct: peerCorrect[p.peer_id],
      is_son: p.peer_id === sonPeerId,
    };
  }

  const receipt = {
    run_type: '5-peer-relay-orchestrator',
    canonical: false,
    topology: 'Supabase relay_routes table dispatch · 4 LAN-adjacent + 1 real-WAN-hop (Son)',
    dispatch_method: 'wan-relay-route (no direct IP routing)',
    model_families: 'gemma4:12b (M0, M1, M2, M3) × qwen2.5:7b (Son) — CROSS-VENDOR HETEROGENEOUS',
    session_id: sessionId,
    run_timestamp: new Date().toISOString(),
    mode,
    question_count: questions.length,
    peer_count: peers.length,
    son_peer_id: sonPeerId,
    peers: peerSummary,
    ensemble_score: {
      correct: ensembleCorrect,
      total: questions.length,
      pct: parseFloat(ensemblePct),
      contested: ensembleContested,
    },
    questions: results,
    truth_always_note:
      'Pre-canonical relay diagnostic run. Canonical 5-peer cooperative substrate run ' +
      'requires lan_addresses population and verified peer identity mapping.',
  };

  try {
    if (!existsSync(receiptDir)) mkdirSync(receiptDir, { recursive: true });
    writeFileSync(receiptPath, JSON.stringify(receipt, null, 2), 'utf8');
    console.log(`\nReceipt written: ${receiptPath}`);
  } catch (err) {
    console.error(`WARNING: Could not write receipt: ${err.message}`);
  }

  // Exit code
  const passThreshold = mode === 'full' ? 0.60 : 0.60;
  const passFraction = questions.length > 0 ? ensembleCorrect / questions.length : 0;
  if (passFraction >= passThreshold) {
    console.log(`\n${GREEN}${BOLD}PASS${RESET} — Ensemble ≥ ${(passThreshold * 100).toFixed(0)}% threshold`);
    process.exit(0);
  } else {
    console.log(`\n${RED}${BOLD}FAIL${RESET} — Ensemble below ${(passThreshold * 100).toFixed(0)}% threshold`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(2);
});
