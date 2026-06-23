#!/usr/bin/env node
/**
 * round_up_sweep.mjs — Posse Round-Up Sweep
 * BP092 HOTFIX · Caithedral™
 *
 * Reads a validate-relay.mjs JSON receipt, identifies all missed/contested questions,
 * fires Posse decompose+swarm on each, writes a Round-Up receipt with resolutions.
 *
 * Usage:
 *   node round_up_sweep.mjs \
 *     --receipt=<path-to-receipt.json> \
 *     --tier-config="ultra:cb4ef450,full:d0b47bd0+88cbf6bd,core:c532e740+49f3e597" \
 *     [--tier2-budget=0]          # Joules cap for Tier 2 flagship (0 = skip)
 *     [--timeout=120]             # per-question Posse timeout in seconds (default 120)
 *     [--session=<id>]            # override session ID
 *     [--dry-run]                 # print miss-list without firing swarm
 *     [--max-misses=N]            # cap number of misses to process (smoke test)
 *     [--question-bank=<path>]    # path to merged question bank JSON for full question text
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { homedir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Color helpers ────────────────────────────────────────────────────────────
const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const BOLD   = '\x1b[1m';
const RESET  = '\x1b[0m';

// ─── Secret Loading ───────────────────────────────────────────────────────────

function loadEnvFile(filePath) {
  const out = {};
  try {
    const lines = readFileSync(filePath, 'utf8').split('\n');
    for (const rawLine of lines) {
      const line = rawLine.replace(/\r$/, '');
      const m = line.match(/^([A-Z_a-z]+)=(.+)$/);
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

function loadPublicEnv() {
  const p = resolve(__dirname, '../../resources/supabase_public.env');
  return loadEnvFile(p);
}

function loadServiceRoleKey() {
  const secretsPath = resolve(homedir(), '.claude', 'state', 'secrets', '22May2026.env');
  let raw = '';
  try { raw = readFileSync(secretsPath, 'utf8'); } catch { /* absent */ }
  const findKey = (name) => {
    const re = new RegExp('^' + name + '=(.+)$', 'm');
    const m = raw.match(re);
    if (!m) return '';
    let v = m[1].replace(/\r$/, '').trim();
    const hashIdx = v.indexOf('#');
    if (hashIdx > -1) v = v.slice(0, hashIdx).trim();
    return v;
  };
  return (
    findKey('SUPABASE_SERVICE_ROLE_KEY') ||
    findKey('Supabase_Secret_Key') ||
    findKey('Supabase_Service_Role_Key') ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.Supabase_Secret_Key ||
    ''
  );
}

// ─── Arg parsing ──────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    receiptPath: null,
    tierConfig: null,
    tier2Budget: 0,        // Joules; 0 = skip Tier 2 entirely
    timeoutSec: 120,
    session: null,
    dryRun: false,
    maxMisses: Infinity,   // smoke test cap
    questionBank: null,    // optional: path to original question bank for full text lookup
  };
  for (const arg of args) {
    const eqIdx = arg.indexOf('=');
    const key = eqIdx === -1 ? arg.replace(/^--/, '') : arg.slice(2, eqIdx);
    const val = eqIdx === -1 ? null : arg.slice(eqIdx + 1);
    if (key === 'receipt') parsed.receiptPath = val;
    else if (key === 'tier-config') parsed.tierConfig = val;
    else if (key === 'tier2-budget') parsed.tier2Budget = parseInt(val, 10);
    else if (key === 'timeout') parsed.timeoutSec = parseInt(val, 10);
    else if (key === 'session') parsed.session = val;
    else if (key === 'dry-run') parsed.dryRun = true;
    else if (key === 'max-misses') parsed.maxMisses = parseInt(val, 10);
    else if (key === 'question-bank') parsed.questionBank = val;
  }
  if (!parsed.session) {
    parsed.session = `roundup-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`;
  }
  return parsed;
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────

async function supabasePost(url, key, table, body) {
  const res = await fetch(`${url}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: key, Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json', Prefer: 'return=representation',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`POST ${table} HTTP ${res.status}: ${text.slice(0,200)}`);
  const rows = JSON.parse(text);
  return Array.isArray(rows) ? rows[0] : rows;
}

async function supabaseGet(url, key, path) {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return [];
  return JSON.parse(await res.text()) ?? [];
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Tier config parser ───────────────────────────────────────────────────────

function parseTierConfig(tierConfig, peers) {
  const tierPeerMap = {};
  const peerTierMap = {};
  if (!tierConfig) return { tierPeerMap, peerTierMap };
  for (const segment of tierConfig.split(',')) {
    const colonIdx = segment.indexOf(':');
    if (colonIdx < 0) continue;
    const tierLabel = segment.slice(0, colonIdx).toLowerCase().trim();
    const peerPrefixes = segment.slice(colonIdx + 1).split('+').map(p => p.trim()).filter(Boolean);
    tierPeerMap[tierLabel] = peerPrefixes;
    for (const peer of peers) {
      if (peerPrefixes.some(prefix => peer.peer_id.startsWith(prefix))) {
        peerTierMap[peer.peer_id] = tierLabel;
      }
    }
  }
  return { tierPeerMap, peerTierMap };
}

// ─── Miss-list identification ─────────────────────────────────────────────────

/**
 * Identify missed questions from a validate-relay.mjs JSON receipt.
 *
 * Per Round-Up canon: a question is a "miss" if ANY of:
 *   (a) ensemble.contested === true   (peers disagreed — includes 6/7 cases)
 *   (b) Any peer's answer is null     (ABSTAIN or protocol violation)
 *   (c) Any peer's replied is false   (timeout — peer never answered)
 *   (d) ensemble.answer is null       (no_answers / complete miss)
 *
 * "We aren't done answering until we get it right." — Founder BP092
 */
function buildMissList(receipt) {
  const misses = [];
  for (const q of (receipt.questions ?? [])) {
    const reasons = [];
    if (q.ensemble?.contested === true) reasons.push('contested');
    if (q.ensemble?.answer === null) reasons.push('no_answer');
    const peerVals = q.per_peer ? Object.values(q.per_peer) : [];
    if (peerVals.some(p => p.answer === null)) reasons.push('peer_abstain');
    if (peerVals.some(p => p.replied === false)) reasons.push('peer_timeout');
    if (reasons.length > 0) {
      misses.push({
        source_id: q.source_id,
        correct_letter: q.correct_letter,
        domain: q.domain,
        question_preview: q.question_preview ?? '',
        num_options: q.num_options ?? 4,
        options: q.options ?? [],
        original_answer: q.ensemble?.answer ?? null,
        original_correct: q.ensemble?.correct ?? false,
        miss_reason: reasons,
        per_peer: q.per_peer ?? {},
      });
    }
  }
  return misses;
}

// ─── Per-miss Posse fire ──────────────────────────────────────────────────────

/**
 * Fire Posse decompose+swarm on a single miss.
 * Returns round-up resolution object.
 */
async function firePosse(miss, config) {
  const {
    supabaseUrl, serviceKey, ultraPeerId, peers,
    tierPeerMap, peerTierMap, sessionId, timeoutMs, wireFormat,
  } = config;

  const questionId = `${sessionId}-roundup-${miss.source_id}`;

  // Reconstruct options array from question preview if original receipt lacked them.
  let options = miss.options;
  if (!options || options.length === 0) {
    if (config.questionBank) {
      const bankQ = config.questionBank.find(q => q.source_id === miss.source_id);
      if (bankQ) options = bankQ.options;
    }
    if (!options || options.length === 0) {
      options = Array.from({ length: miss.num_options || 4 }, (_, i) =>
        `[Option ${String.fromCharCode(65 + i)} — load question bank for full text]`
      );
    }
  }

  // Reconstruct full question text
  let questionText = miss.question_preview ?? '';
  if (config.questionBank) {
    const bankQ = config.questionBank.find(q => q.source_id === miss.source_id);
    if (bankQ) questionText = bankQ.question;
  }
  const questionTruncated = questionText.endsWith('...');

  const t0 = Date.now();

  // Step 1: Decompose via ULTRA peer
  let subClaims = [];
  let decompositionModel = 'none';
  try {
    const { decomposeQuestion } = await import(
      pathToFileURL(resolve(__dirname, '../../dist/main/army_ants/posse_decompose.js')).href
    );
    const decomp = await decomposeQuestion(
      questionId,
      questionText,
      options,
      miss.domain,
      supabaseUrl,
      serviceKey,
      ultraPeerId,
      Math.min(90000, timeoutMs),
    );
    subClaims = decomp.sub_claims;
    decompositionModel = decomp.decomposition_model;
  } catch (err) {
    console.warn(`  [ROUND-UP][${miss.source_id}] decompose failed: ${err.message}`);
  }

  if (subClaims.length === 0) {
    return {
      source_id: miss.source_id,
      correct_letter: miss.correct_letter,
      domain: miss.domain,
      miss_reason: miss.miss_reason,
      original_answer: miss.original_answer,
      original_correct: miss.original_correct,
      round_up_answer: null,
      round_up_correct: false,
      resolution_tier: 'decompose_failed',
      swarm_run_id: null,
      sub_claim_count: 0,
      decomposition_model: decompositionModel,
      contested_after_swarm: true,
      elapsed_ms: Date.now() - t0,
      question_truncated: questionTruncated,
    };
  }

  // Step 2: Swarm dispatch — fan each sub-claim through cooperative mesh
  let swarmResult = null;
  try {
    const { swarmDispatch } = await import(
      pathToFileURL(resolve(__dirname, '../../dist/main/army_ants/posse_swarm.js')).href
    );
    swarmResult = await swarmDispatch(
      subClaims,
      questionId,
      questionText,
      options,
      {
        supabaseUrl,
        serviceKey,
        sessionId,
        domain: miss.domain,
        wireFormat,
        tierPeerMap,
        peerTierMap,
        peers,
        timeoutMs: Math.min(120000, timeoutMs),
        maxDepth: 2,
        varianceThreshold: 15,
      }
    );
  } catch (err) {
    console.warn(`  [ROUND-UP][${miss.source_id}] swarm failed: ${err.message}`);
  }

  let roundUpAnswer = swarmResult?.aggregate_answer ?? null;
  let resolutionTier = 'posse';
  const contestedAfterSwarm = swarmResult?.contested_after_swarm ?? true;

  // Step 3: Tier 2 flagship escalation (only if contested AND budget available AND API key present)
  // --tier2-budget=0 skips entirely (default for pure-Posse hotfix run)
  if (contestedAfterSwarm && config.tier2Budget > 0 && process.env.ANTHROPIC_API_KEY) {
    try {
      const { tier2FlagshipEscalate } = await import(
        pathToFileURL(resolve(__dirname, '../../dist/main/tier2/flagship_escalate.js')).href
      );
      const prompt = buildFallbackPrompt(questionText, options, miss.domain);
      const t2Result = await tier2FlagshipEscalate(
        questionId,
        prompt,
        options.length,
        miss.domain,
        {
          anthropicApiKey: process.env.ANTHROPIC_API_KEY,
          openaiApiKey: process.env.OPENAI_API_KEY ?? '',
          joulesRemainingRef: config.joulesRemainingRef,
          joulesCapPerRun: config.tier2Budget,
          joulesPerQuestion: 120,
          supabaseUrl,
          serviceKey,
          sessionId,
        }
      );
      if (t2Result.answer !== null && t2Result.vendor !== 'skipped') {
        roundUpAnswer = t2Result.answer;
        resolutionTier = `tier_2_${t2Result.vendor}`;
        console.log(`  [ROUND-UP][${miss.source_id}] Tier 2 ${t2Result.vendor} → ${roundUpAnswer}`);
      }
    } catch (err) {
      console.warn(`  [ROUND-UP][${miss.source_id}] Tier 2 failed: ${err.message}`);
    }
  } else if (contestedAfterSwarm && config.tier2Budget === 0) {
    resolutionTier = 'posse_best_effort';
  }

  const roundUpCorrect = roundUpAnswer !== null && roundUpAnswer === miss.correct_letter;
  const elapsed = Date.now() - t0;

  const statusEmoji = roundUpCorrect ? '✅' : roundUpAnswer !== null ? '❌' : '⚪';
  console.log(`  [ROUND-UP][${miss.source_id}] ${statusEmoji} correct=${miss.correct_letter} original=${miss.original_answer ?? 'null'} roundup=${roundUpAnswer ?? 'null'} tier=${resolutionTier} elapsed=${Math.round(elapsed/1000)}s`);

  return {
    source_id: miss.source_id,
    correct_letter: miss.correct_letter,
    domain: miss.domain,
    miss_reason: miss.miss_reason,
    original_answer: miss.original_answer,
    original_correct: miss.original_correct,
    round_up_answer: roundUpAnswer,
    round_up_correct: roundUpCorrect,
    resolution_tier: resolutionTier,
    swarm_run_id: swarmResult?.run_id ?? null,
    sub_claim_count: subClaims.length,
    decomposition_model: decompositionModel,
    contested_after_swarm: contestedAfterSwarm,
    elapsed_ms: elapsed,
    question_truncated: questionTruncated,
  };
}

function buildFallbackPrompt(question, options, domain) {
  const optText = options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join('\n');
  return `Answer this ${domain} multiple-choice question. Reply with ONLY the letter of your answer.\n\nQuestion: ${question}\n\n${optText}\n\nAnswer:`;
}

// ─── Active peer lookup ───────────────────────────────────────────────────────

async function getActivePeers(supabaseUrl, anonKey) {
  try {
    const rows = await fetch(
      `${supabaseUrl}/rest/v1/peer_presence?select=peer_id,tier,lan_addresses,last_seen_at,capabilities&last_seen_at=gte.${new Date(Date.now() - 10 * 60 * 1000).toISOString()}&order=last_seen_at.desc`,
      { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` }, signal: AbortSignal.timeout(10000) }
    ).then(r => r.json());
    return rows ?? [];
  } catch { return []; }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();

  console.log(`\n${BOLD}${CYAN}POSSE ROUND-UP SWEEP · BP092 HOTFIX · Caithedral™${RESET}`);
  console.log(`Session: ${args.session}`);

  if (!args.receiptPath) {
    console.error('ERROR: --receipt=<path> is required');
    process.exit(2);
  }

  // Load receipt
  let receipt;
  try {
    receipt = JSON.parse(readFileSync(args.receiptPath, 'utf8'));
  } catch (err) {
    console.error(`ERROR: Cannot read receipt at ${args.receiptPath}: ${err.message}`);
    process.exit(2);
  }

  console.log(`Receipt loaded: session=${receipt.session_id} · questions=${receipt.question_count ?? receipt.questions?.length ?? 0}`);
  console.log(`Original score: ${receipt.ensemble_score?.correct ?? '?'}/${receipt.ensemble_score?.total ?? '?'} = ${receipt.ensemble_score?.pct ?? '?'}%`);

  // Build miss-list
  const allMisses = buildMissList(receipt);
  const missList = isFinite(args.maxMisses) ? allMisses.slice(0, args.maxMisses) : allMisses;

  console.log(`\nMiss-list: ${missList.length}${isFinite(args.maxMisses) ? ` (capped at ${args.maxMisses} of ${allMisses.length})` : ''} questions`);

  for (const miss of missList) {
    console.log(`  ${miss.source_id} | ${miss.domain ?? '?'} | correct=${miss.correct_letter} original=${miss.original_answer ?? 'null'} | reason=[${miss.miss_reason.join('+')}]`);
  }

  if (args.dryRun) {
    console.log(`\n[DRY-RUN] Would fire Posse on ${missList.length} questions. Exiting without firing.`);
    process.exit(0);
  }

  if (missList.length === 0) {
    console.log(`\n${GREEN}No misses found — nothing to round up. Original score is final.${RESET}`);
    process.exit(0);
  }

  // Load credentials
  const pub = loadPublicEnv();
  const SUPABASE_URL = process.env.SUPABASE_URL || pub.SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || pub.SUPABASE_ANON_KEY || '';
  const SERVICE_KEY = loadServiceRoleKey();

  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('ERROR: SUPABASE_URL or service key missing — cannot fire Posse relay');
    process.exit(2);
  }

  // Discover active peers
  console.log('\nQuerying active peers...');
  const peers = await getActivePeers(SUPABASE_URL, SUPABASE_ANON_KEY);
  if (peers.length === 0) {
    console.error('ERROR: No active peers found. Ensure fleet is running.');
    process.exit(2);
  }
  console.log(`Active peers: ${peers.length}`);
  for (const p of peers) console.log(`  ${p.peer_id.slice(0,8)} | db_tier=${p.tier ?? 'unknown'}`);

  // Parse tier config
  const { tierPeerMap, peerTierMap } = parseTierConfig(args.tierConfig, peers);
  if (args.tierConfig) {
    console.log('Tier assignments from --tier-config:');
    for (const p of peers) console.log(`  ${p.peer_id.slice(0,8)} | assigned_tier=${peerTierMap[p.peer_id] ?? 'unmatched'}`);
  }

  // Identify ULTRA peer (for decomposition — routes to llama3.3:70b)
  const ultraPeer = peers.find(p => peerTierMap[p.peer_id] === 'ultra')
    ?? peers.find(p => (p.tier ?? '').toLowerCase() === 'ultra')
    ?? peers[0];
  const ultraPeerId = ultraPeer?.peer_id ?? 'cb4ef450cc4a18c3';
  console.log(`ULTRA peer for decomposition: ${ultraPeerId.slice(0,8)}`);

  // Optional: load question bank for full question text + options
  let questionBank = null;
  if (args.questionBank) {
    try {
      questionBank = JSON.parse(readFileSync(args.questionBank, 'utf8'));
      console.log(`Question bank loaded: ${questionBank.length} questions`);
    } catch (err) {
      console.warn(`WARNING: Could not load question bank: ${err.message} — will use truncated previews`);
    }
  }

  const joulesRemainingRef = { value: args.tier2Budget };

  const fireConfig = {
    supabaseUrl: SUPABASE_URL,
    serviceKey: SERVICE_KEY,
    ultraPeerId,
    peers,
    tierPeerMap,
    peerTierMap,
    sessionId: args.session,
    timeoutMs: args.timeoutSec * 1000,
    wireFormat: 'json-legacy',
    tier2Budget: args.tier2Budget,
    joulesRemainingRef,
    questionBank,
  };

  // Fire Posse on each miss — SEQUENTIAL to avoid relay table saturation
  console.log(`\n${BOLD}Firing Posse Round-Up on ${missList.length} misses (--tier2-budget=${args.tier2Budget})...${RESET}\n`);
  const roundUpResults = [];
  for (let i = 0; i < missList.length; i++) {
    const miss = missList[i];
    console.log(`[${i+1}/${missList.length}] ${miss.source_id} (${miss.domain ?? '?'}) correct=${miss.correct_letter}`);
    const result = await firePosse(miss, fireConfig);
    roundUpResults.push(result);
  }

  // Compute delta summary
  const originalCorrect = receipt.ensemble_score?.correct ?? 0;
  const originalTotal   = receipt.ensemble_score?.total ?? receipt.questions?.length ?? 0;
  const newlyResolved   = roundUpResults.filter(r => r.round_up_correct && !r.original_correct).length;
  const stillMissed     = roundUpResults.filter(r => !r.round_up_correct).length;
  const newTotal        = originalCorrect + newlyResolved;
  const newPct          = originalTotal > 0 ? ((newTotal / originalTotal) * 100).toFixed(1) : '0.0';

  console.log(`\n${BOLD}${'═'.repeat(60)}${RESET}`);
  console.log(`${BOLD}ROUND-UP SWEEP COMPLETE · BP092 · Caithedral™${RESET}`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`Original score:      ${originalCorrect}/${originalTotal} = ${receipt.ensemble_score?.pct ?? '?'}%`);
  console.log(`Newly resolved:      ${newlyResolved}`);
  console.log(`Still missed:        ${stillMissed}`);
  console.log(`Est. new score:      ${newTotal}/${originalTotal} = ${newPct}%`);
  console.log(`Joules spent (T2):   ${args.tier2Budget - joulesRemainingRef.value}`);

  if (stillMissed > 0) {
    console.log(`\n${YELLOW}Still-missed questions:${RESET}`);
    for (const r of roundUpResults.filter(r => !r.round_up_correct)) {
      console.log(`  ${r.source_id} | ${r.domain} | correct=${r.correct_letter} roundup=${r.round_up_answer ?? 'null'} | ${r.resolution_tier}`);
    }
  }

  // Write Round-Up receipt JSON alongside original receipt
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const receiptDir = dirname(resolve(args.receiptPath));
  const roundUpReceiptPath = join(receiptDir, `ROUND_UP_RECEIPT_${args.session}_${timestamp}.json`);

  const roundUpReceipt = {
    run_type: 'posse-round-up-sweep',
    bp: 'BP092',
    caithedral: true,
    session_id: args.session,
    source_receipt: args.receiptPath,
    source_session_id: receipt.session_id,
    run_timestamp: new Date().toISOString(),
    original_score: receipt.ensemble_score,
    miss_count: missList.length,
    newly_resolved: newlyResolved,
    still_missed: stillMissed,
    estimated_new_score: {
      correct: newTotal,
      total: originalTotal,
      pct: parseFloat(newPct),
    },
    tier2_joules_budget: args.tier2Budget,
    tier2_joules_spent: args.tier2Budget - joulesRemainingRef.value,
    round_up_results: roundUpResults,
    truth_always_note: "Estimated new score adds newly-resolved Round-Up Q's to original correct count. Final authoritative score requires re-running full validate-relay.mjs with Round-Up answers submitted.",
  };

  try {
    writeFileSync(roundUpReceiptPath, JSON.stringify(roundUpReceipt, null, 2), 'utf8');
    console.log(`\nRound-Up receipt written: ${roundUpReceiptPath}`);
  } catch (err) {
    console.error(`WARNING: Could not write receipt: ${err.message}`);
  }

  process.exit(stillMissed === 0 ? 0 : 1);
}

export function healthCheck() {
  return { ok: true, module: 'tools/mesh-validation/round_up_sweep' };
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(2);
});
