/**
 * trial-02b-pass-b-fire.mjs — Wave II fire SEG
 * BP089 BLACK MAMBA Marathon Session 3 DAWN RIDE
 *
 * Reads 70 questions from PASS_A_responses.jsonl.
 * Dispatches each to all 4 peers in PARALLEL via relay.lianabanyan.com.
 *
 * LAN-AS-WAN HARD CONSTRAINT: ALL peers routed via relay — NEVER LAN-direct.
 * Architecture (confirmed from src/main/index.ts startRelayRoutePoll):
 *   1. POST wan-relay-route with { target_peer_id, hex_frame, payload_json: { prompt } }
 *   2. Peer's MnemosyneC polls relay_routes (5s interval), picks up, queries localhost:11434
 *   3. Peer writes reply to relay_route_replies: { route_id, answer_json: { answer } }
 *   4. Fire SEG polls relay_route_replies for each route_id → collects answer
 *
 * Output: PASS_B_4PEER_responses.jsonl (280 lines: 70 q × 4 peers)
 */

import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from 'fs';
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
  } catch { /* skip */ }
}

loadEnvFile(resolve(__dirname, 'resources/supabase_public.env'));
loadEnvFile(resolve(__dirname, '.env'));

const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const SUPABASE_URL = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '');
const RELAY_BASE = process.env.RELAY_BASE ?? 'https://relay.lianabanyan.com/functions/v1';

if (!SUPABASE_ANON_KEY || !SUPABASE_URL) {
  console.error('FATAL: SUPABASE_ANON_KEY or SUPABASE_URL not set. Cannot proceed.');
  process.exit(1);
}

// ─── Config ───────────────────────────────────────────────────────────────────

const PASS_A_PATH = resolve('C:/Users/Administrator/Documents/Asteroid-ProofVault/receipts/THUNDERCLAP/Trial_02/PASS_A_responses.jsonl');
const OUTPUT_DIR  = resolve('C:/Users/Administrator/Documents/Asteroid-ProofVault/receipts/THUNDERCLAP/Trial_02b');
const OUTPUT_PATH = resolve(OUTPUT_DIR, 'PASS_B_4PEER_responses.jsonl');
const MODEL       = 'gemma4:12b';
const RELAY_POLL_INTERVAL_MS = 5000; // match MnemosyneC poll interval
const RELAY_POLL_TIMEOUT_MS  = 30_000; // 30 sec — M3 offline per relay_routes check; M0/M2/SON reply ~15s

const PEERS = [
  { name: 'M0',  peer_id: 'cb4ef450cc4a18c3', vram_gb: 61.6 },
  { name: 'M3',  peer_id: 'd0b47bd08633385b', vram_gb: 31.9 },
  { name: 'M2',  peer_id: '88cbf6bdd6f74587', vram_gb: 31.9 },
  { name: 'SON', peer_id: '49f3e5971518a064', vram_gb: 15.8 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RELAY_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'apikey': SUPABASE_ANON_KEY,
};

function buildPrompt(q) {
  const choices = Object.entries(q.choices).map(([k, v]) => `${k}: ${v}`).join('\n');
  return `Answer this multiple choice question. Reply with ONLY the letter (A, B, C, or D).

Question: ${q.question}

${choices}

Answer:`;
}

function extractAnswer(text) {
  if (!text) return null;
  const m = text.trim().match(/^([A-D])/i);
  if (m) return m[1].toUpperCase();
  const m2 = text.match(/\b([A-D])\b/i);
  if (m2) return m2[1].toUpperCase();
  return null;
}

// ─── Dispatch via wan-relay-route ─────────────────────────────────────────────

async function dispatchToRelay(peer, prompt, sessionId) {
  const hex_frame = Buffer.from(prompt, 'utf8').toString('hex');

  const res = await fetch(`${RELAY_BASE}/wan-relay-route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
    body: JSON.stringify({
      target_peer_id: peer.peer_id,
      hex_frame,
      payload_json: { prompt, model: MODEL, session_id: sessionId, trial_id: 'trial_02b_pass_b' },
      session_id: sessionId,
      ttl_seconds: 600,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`relay-route HTTP ${res.status}: ${body.slice(0, 100)}`);
  }

  const data = await res.json();
  return data.route_id;
}

// ─── Poll relay_route_replies for answer ──────────────────────────────────────

async function pollForReply(routeId, peerName) {
  const start = Date.now();
  const url = `${SUPABASE_URL}/rest/v1/relay_route_replies?route_id=eq.${encodeURIComponent(routeId)}&select=answer_json,processing_ms`;

  while (Date.now() - start < RELAY_POLL_TIMEOUT_MS) {
    await new Promise(r => setTimeout(r, RELAY_POLL_INTERVAL_MS));
    try {
      const res = await fetch(url, { headers: RELAY_HEADERS, signal: AbortSignal.timeout(8_000) });
      if (!res.ok) continue;
      const rows = await res.json();
      if (rows.length > 0) {
        const row = rows[0];
        return {
          response_text: row.answer_json?.answer ?? null,
          processing_ms: row.processing_ms ?? (Date.now() - start),
        };
      }
    } catch { /* retry */ }
  }

  throw new Error(`poll timeout (${RELAY_POLL_TIMEOUT_MS / 1000}s) for route ${routeId.slice(0, 8)} on ${peerName}`);
}

// ─── Query one peer for one question ──────────────────────────────────────────

async function queryPeer(peer, question, questionIdx) {
  const start = Date.now();
  const sessionId = `trial02b_q${questionIdx}_${peer.peer_id.slice(0, 8)}_${Date.now()}`;
  const prompt = buildPrompt(question);

  try {
    const route_id = await dispatchToRelay(peer, prompt, sessionId);
    const { response_text, processing_ms } = await pollForReply(route_id, peer.name);
    return { ok: true, response_text, latency_ms: Date.now() - start, relay_ms: processing_ms, route_id };
  } catch (err) {
    return { ok: false, response_text: null, error: String(err), latency_ms: Date.now() - start };
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n=== trial-02b-pass-b-fire.mjs · BP089 Wave II ===');
  console.log(`RELAY_BASE:  ${RELAY_BASE}`);
  console.log(`MODEL:       ${MODEL}`);
  console.log(`SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY.slice(0, 7)}...`);
  console.log(`PASS_A: ${PASS_A_PATH}`);
  console.log(`OUTPUT: ${OUTPUT_PATH}`);
  console.log(`Fleet: ${PEERS.map(p => p.name).join(' · ')}\n`);

  // Read questions — strip UTF-8 BOM if present
  const questions = readFileSync(PASS_A_PATH, 'utf8')
    .replace(/^\uFEFF/, '')
    .split('\n').filter(l => l.trim()).map(l => JSON.parse(l));
  console.log(`Loaded ${questions.length} questions from PASS_A.\n`);

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_PATH, '', 'utf8'); // clear output

  let totalWritten = 0;
  const startAll = Date.now();

  for (let qi = 0; qi < questions.length; qi++) {
    const q = questions[qi];
    const qId = q.q ?? qi + 1;
    process.stdout.write(`Q${qId}/${questions.length} [${q.domain}] "${q.question.slice(0, 45)}..." → `);

    // Dispatch to all 4 peers in PARALLEL (LAN-AS-WAN via relay)
    const peerResults = await Promise.all(
      PEERS.map(peer => queryPeer(peer, q, qId).then(res => ({ peer, res })))
    );

    for (const { peer, res } of peerResults) {
      const answer = res.ok ? extractAnswer(res.response_text ?? '') : null;
      const correct_yn = answer !== null ? answer === q.correct : null;
      const row = {
        peer_id: peer.peer_id,
        peer_name: peer.name,
        question_id: qId,
        domain: q.domain,
        question: q.question,
        choices: q.choices,
        correct: q.correct,
        model_answer: answer,
        response_text: res.response_text ?? null,
        score: correct_yn ? 1 : 0,
        correct_yn,
        latency_ms: res.latency_ms,
        relay_processing_ms: res.relay_ms ?? null,
        error: res.error ?? null,
        model: MODEL,
        trial_id: 'trial_02b_pass_b',
        pass: 'B',
        ts: new Date().toISOString(),
      };
      appendFileSync(OUTPUT_PATH, JSON.stringify(row) + '\n', 'utf8');
      totalWritten++;
    }

    const peerStatuses = peerResults.map(({ peer, res }) => {
      if (!res.ok) return `${peer.name}:ERR`;
      const a = extractAnswer(res.response_text ?? '') ?? '?';
      const ok = a === q.correct ? '✓' : '✗';
      return `${peer.name}:${a}${ok}`;
    }).join(' | ');
    console.log(peerStatuses);
  }

  const elapsedMin = ((Date.now() - startAll) / 60000).toFixed(1);
  console.log(`\nDone in ${elapsedMin} min. ${totalWritten} rows written to ${OUTPUT_PATH}`);
  console.log(`Expected 280 (70 × 4). Actual: ${totalWritten}.`);

  if (totalWritten === 280) {
    console.log('STATUS: COMPLETE — 280/280 rows written. Proceed to scoring SEG.');
  } else {
    console.log(`STATUS: PARTIAL — ${totalWritten}/280 rows. Check errors above.`);
  }
}

main().catch(e => { console.error('[fire] Fatal:', e); process.exit(1); });
