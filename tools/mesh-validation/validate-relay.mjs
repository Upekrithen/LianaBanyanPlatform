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
//   --exclude-peer: peer_id prefix or full peer_id to exclude from active pool (can be repeated)

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { homedir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Secret Loading (never logged) ──────────────────────────────────────────

function loadEnvFile(filePath) {
  const out = {};
  try {
    // BP087 fix: strip CRLF + inline # comments at parse time (matches env_loader.ts I11)
    const lines = readFileSync(filePath, 'utf8').split('\n');
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
  const secretsPath = resolve(homedir(), '.claude', 'state', 'secrets', '22May2026.env');
  // BP087 fix: secrets file uses mixed-case keys; loadEnvFile only matches ALL_CAPS.
  // Read raw + match all variants the Founder-canonical secrets file uses.
  let raw = '';
  try {
    raw = readFileSync(secretsPath, 'utf8');
  } catch { /* file absent */ }
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

// ─── CLI Argument Parsing ────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  // MAMBA-γ: added routing, andon-escalate, wire, plow flags
  // BP087 Trial-02: added exclude-peer flag for fleet-management discipline
  // BP087 MAMBA-GEMMA: added flagship-tier, trial-id, pass flags
  // BP090 TRIPLE-MAMBA: added per-domain-timeout, question-bank flags; default timeout 180→900
  const parsed = {
    questions: 5,
    mode: 'smoke',
    timeout: 900,                   // BP090: raised from 180→900 for backwards compat
    session: null,
    routing: 'round-robin',         // 'domain-affinity' | 'round-robin'
    andonEscalate: 'none',          // 'star-chamber' | 'none'
    wire: 'json-legacy',            // 'hex-mcode' | 'json-legacy'
    plow: 'none',                   // 'mesh-12-blade' | 'none'
    andonThreshold: 15,             // variance threshold for Ascending Andon
    excludePeers: [],               // array of peer_id prefixes/full IDs to exclude from pool
    flagshipTier: 'claude',         // 'claude' | 'gemma' | 'qwen' | 'mistral' -- brain override
    trialId: null,                  // paired trial ID (THUNDERCLAP receipt)
    pass: null,                     // 'A' | 'B' -- which pass in the paired trial
    perDomainTimeout: null,         // BP090: path to per_domain_timeout_config.json
    questionBank: null,             // BP090: path to custom question bank JSON
    // BP091 Ah Hayelped tier-aware routing
    tierConfig: null,               // 'ultra:cb4ef450,full:d0b47bd0+88cbf6bd,core:c532e740+49f3e597'
    questionDifficultyRouting: null, // 'hard:ultra+full,medium:ultra+full+core,short:all'
    tier2Flagship: true,            // BP092 M24 Block 3: ENABLED by default -- use --tier2-flagship=false to disable
  };

  for (const arg of args) {
    const eqIdx = arg.indexOf('=');
    const key = eqIdx === -1 ? arg.replace(/^--/, '') : arg.slice(2, eqIdx);
    const val = eqIdx === -1 ? null : arg.slice(eqIdx + 1);
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
    // --exclude-peer may appear multiple times; each val is a full peer_id or unambiguous prefix
    else if (key === 'exclude-peer' && val) parsed.excludePeers.push(val.trim());
    // BP087 MAMBA-GEMMA flags
    else if (key === 'flagship-tier' && val) parsed.flagshipTier = val.toLowerCase().trim();
    else if (key === 'trial-id' && val) parsed.trialId = val.trim();
    else if (key === 'pass' && val) parsed.pass = val.toUpperCase().trim();
    // BP090 TRIPLE-MAMBA flags
    else if (key === 'per-domain-timeout' && val) parsed.perDomainTimeout = val.trim();
    else if (key === 'question-bank' && val) parsed.questionBank = val.trim();
    // BP091 Ah Hayelped tier-aware routing flags
    else if (key === 'tier-config' && val) parsed.tierConfig = val.trim();
    else if (key === 'question-difficulty-routing' && val) parsed.questionDifficultyRouting = val.trim();
    else if (key === 'tier2-flagship') parsed.tier2Flagship = val === 'true';
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

// ─── BP090: Per-Domain Timeout Config ────────────────────────────────────────

/**
 * Load and validate per_domain_timeout_config.json.
 * Tries path as-is, then relative to __dirname, then relative to cwd.
 * Returns null if file absent or invalid.
 */
function loadPerDomainTimeoutConfig(configPath) {
  const candidates = [
    configPath,
    join(__dirname, configPath),
    join(process.cwd(), configPath),
    resolve(configPath),
  ];
  for (const candidate of candidates) {
    try {
      const raw = readFileSync(candidate, 'utf8');
      const parsed = JSON.parse(raw);
      // Validate shape: skip comment/meta keys (starting with _); each real key must have
      // { domains: string[], timeout_s: number }
      const validConfig = {};
      for (const [cat, data] of Object.entries(parsed)) {
        if (cat.startsWith('_')) continue; // skip meta/comment keys
        if (typeof data !== 'object' || data === null) continue;
        if (!Array.isArray(data.domains) || typeof data.timeout_s !== 'number') {
          throw new Error(`Invalid category "${cat}" in per-domain timeout config`);
        }
        validConfig[cat] = data;
      }
      if (Object.keys(validConfig).length === 0) throw new Error('No valid categories in config');
      return validConfig;
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Look up the timeout for a given domain in the per-domain config.
 * Case-insensitive match. Falls back to low_disagreement, then fallbackSec.
 * @param {string} domain - question domain
 * @param {object|null} perDomainConfig - loaded config or null
 * @param {number} fallbackSec - global --timeout value to use when config absent
 * @returns {number} timeout in seconds
 */
function getDomainTimeout(domain, perDomainConfig, fallbackSec) {
  if (!perDomainConfig) return fallbackSec;
  const domainLower = (domain || '').toLowerCase().trim();
  for (const [, categoryData] of Object.entries(perDomainConfig)) {
    if (Array.isArray(categoryData.domains) && categoryData.domains.includes(domainLower)) {
      return categoryData.timeout_s;
    }
  }
  // Domain not found in any category → use low_disagreement as default per spec
  return perDomainConfig.low_disagreement?.timeout_s ?? fallbackSec;
}

// ─── BP090: Custom Question Bank ─────────────────────────────────────────────

/**
 * Load a custom question bank from a JSON file.
 * Tries path as-is, then relative to __dirname, then cwd.
 * Expected format: array of { domain, question, options, correct_answer, source_id }
 * @param {string} bankPath
 * @returns {Array} questions array
 */
function loadQuestionBank(bankPath) {
  const candidates = [
    bankPath,
    join(__dirname, bankPath),
    join(process.cwd(), bankPath),
    resolve(bankPath),
  ];
  for (const candidate of candidates) {
    try {
      const raw = readFileSync(candidate, 'utf8');
      const qs = JSON.parse(raw);
      if (!Array.isArray(qs)) throw new Error('Question bank must be a JSON array');
      // BP091: normalize domain field — MMLU-Pro per-domain banks use source_category; ensure domain is populated
      return qs.map(q => ({
        ...q,
        domain: q.domain ?? q.source_category ?? 'other',
      }));
    } catch {
      continue;
    }
  }
  throw new Error(`Could not load question bank from any candidate path for: ${bankPath}`);
}

// ─── BP090: Variance Helper ───────────────────────────────────────────────────

/**
 * Compute vote variance as a percentage (0–100).
 * peerAnswers: { peer_id: letter|null }
 * Returns 0 when all answered peers agree; 100 when maximally contested.
 */
function computeAnswerVariancePct(peerAnswers) {
  const answered = Object.values(peerAnswers).filter(a => a !== null);
  if (answered.length === 0) return 100;
  const counts = {};
  for (const letter of answered) counts[letter] = (counts[letter] ?? 0) + 1;
  const maxCount = Math.max(...Object.values(counts));
  return (1 - maxCount / answered.length) * 100;
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
  const excludePeers = args.excludePeers ?? [];

  // BP087 MAMBA-GEMMA: flagship-tier flag
  const flagshipTier = args.flagshipTier ?? 'claude';
  const trialId = args.trialId ?? null;
  const passLabel = args.pass ?? null;
  const isGemmaMode = flagshipTier !== 'claude';

  // BP091 Ah Hayelped: tier-aware routing flags
  const isTierAwareRouting = routing === 'tier-aware';
  const tier2Flagship = args.tier2Flagship === true;

  // BP091 Ah Hayelped: classify domain difficulty for tier-aware routing
  // HARD  → intense multi-step quantitative reasoning (ULTRA + FULL handles primary)
  // MEDIUM → mixed conceptual + factual (all tiers participate)
  // SHORT  → factual retrieval, shorter reasoning (CORE handles well)
  function classifyDomainDifficulty(domain) {
    const HARD_DOMAINS = new Set(['math', 'physics', 'engineering', 'chemistry']);
    const SHORT_DOMAINS = new Set(['business', 'history', 'other']);
    if (HARD_DOMAINS.has(domain)) return 'hard';
    if (SHORT_DOMAINS.has(domain)) return 'short';
    return 'medium';
  }

  // BP090 TRIPLE-MAMBA: per-domain timeout config
  let perDomainConfig = null;
  if (args.perDomainTimeout) {
    perDomainConfig = loadPerDomainTimeoutConfig(args.perDomainTimeout);
    if (perDomainConfig) {
      console.log(`Per-domain timeout config loaded from: ${args.perDomainTimeout}`);
    } else {
      console.warn(`${YELLOW}WARNING: Could not load per-domain timeout config from "${args.perDomainTimeout}" — falling back to global --timeout=${timeoutSec}s${RESET}`);
    }
  }

  // BP090 Plow Loop wiring: derive plow_max_iterations from --plow flag
  // 'mesh-12-blade' → 12 iterations; any other value or 'none' → 0 (baseline single-shot)
  const plowMaxIterations = args.plow === 'mesh-12-blade' ? 12 : 0;

  console.log(`\n${BOLD}${CYAN}5-PEER RELAY ORCHESTRATOR · BP090 TRIPLE-MAMBA · CROSS-VENDOR${RESET}`);
  console.log(`Session: ${sessionId}`);
  console.log(`Mode: ${mode.toUpperCase()} · Questions: ${questionCount} · DefaultTimeout: ${timeoutSec}s · PerDomainTimeout: ${perDomainConfig ? 'ACTIVE' : 'off'}`);
  console.log(`Routing: ${routing} · Wire: ${wire} · Andon-escalate: ${andonEscalate} · Andon-threshold: ${andonThreshold}%`);
  if (trialId) console.log(`Trial ID: ${trialId} · Pass: ${passLabel ?? 'unset'}`);
  if (isGemmaMode) {
    console.log(`${YELLOW}flagship-tier=${flagshipTier}: Anthropic API DISABLED -- all calls routed local${RESET}`);
    console.log(`[flagship-tier=${flagshipTier}] Anthropic API SKIPPED`);
  }
  // BP090: log plow configuration so it appears in orchestrator output
  if (plowMaxIterations > 0) {
    console.log(`${BOLD}Plow: ${args.plow} · maxIterations=${plowMaxIterations} · peer Minor Council active (3 judges per iteration)${RESET}`);
  } else {
    console.log(`Plow: ${args.plow ?? 'none'} · peer inference = single-shot baseline`);
  }
  console.log(`Topology: Supabase relay_routes dispatch -- no direct Ollama IPs\n`);

  // Load credentials
  const pub = loadPublicEnv();
  const SUPABASE_URL = process.env.SUPABASE_URL || pub.SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || pub.SUPABASE_ANON_KEY || '';
  const SERVICE_KEY = loadServiceRoleKey();

  if (!SUPABASE_URL) { console.error('ERROR: SUPABASE_URL not found'); process.exit(2); }
  if (!SUPABASE_ANON_KEY) { console.error('ERROR: SUPABASE_ANON_KEY not found'); process.exit(2); }
  if (!SERVICE_KEY) { console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY not found'); process.exit(2); }
  console.log(`Supabase URL loaded (${SUPABASE_URL.length > 0 ? 'OK' : 'MISSING'})`);
  console.log(`Service key loaded (length=${SERVICE_KEY.length})`);
  if (isGemmaMode) {
    console.log(`[flagship-tier=${flagshipTier}] Anthropic API SKIPPED -- using local model via peer Ollama`);
  }
  console.log('');

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

  // BP087 Trial-02: apply --exclude-peer filter before routing logic
  // Matches on full peer_id or any unambiguous prefix (e.g. c532e740 matches c532e74069e137bc)
  if (excludePeers.length > 0) {
    const beforeCount = peers.length;
    peers = peers.filter(p => !excludePeers.some(ex => p.peer_id.startsWith(ex)));
    const removed = beforeCount - peers.length;
    if (removed > 0) {
      console.log(`\n${YELLOW}EXCLUDE-PEER filter: removed ${removed} peer(s) — ${excludePeers.join(', ')}${RESET}`);
    } else {
      console.log(`\n${YELLOW}EXCLUDE-PEER filter: no matching peers found for — ${excludePeers.join(', ')} (continuing with all ${beforeCount} peers)${RESET}`);
    }
    if (peers.length === 0) {
      console.error('ERROR: --exclude-peer filter removed ALL peers. Aborting.');
      process.exit(2);
    }
  }

  // M14 Block 1 structural residual: identify M0 as orchestrator peer
  const orchestratorLanPrefix = '192.168.86.';
  const m0Peer = peers?.find(p => p.lan_addresses && p.lan_addresses.some(addr => addr.startsWith(orchestratorLanPrefix)));
  const m0PeerId = m0Peer?.peer_id ?? 'cb4ef450';
  console.log(`[M14] Orchestrator peer identified: ${m0PeerId.slice(0,8)}`);

  // BP091 Ah Hayelped: build tier → peer_id maps from --tier-config
  // tierPeerMap: { 'ultra': ['cb4ef450'], 'full': ['d0b47bd0','88cbf6bd'], 'core': ['c532e740','49f3e597'] }
  // peerTierMap: { 'cb4ef450...': 'ultra', 'd0b47bd0...': 'full', ... }
  const tierPeerMap = {};  // tier label → array of peer_id prefixes
  const peerTierMap = {};  // full peer_id → tier label
  if (args.tierConfig) {
    for (const segment of args.tierConfig.split(',')) {
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
    console.log(`\nBP091 Tier-aware routing — tier config parsed:`);
    for (const [tier, prefixes] of Object.entries(tierPeerMap)) {
      const tierPeers = peers.filter(p => peerTierMap[p.peer_id] === tier);
      const models = [...new Set(tierPeers.map(p => p.capabilities?.ollamaModel ?? 'unknown'))].join('+');
      console.log(`  ${tier.toUpperCase()}: ${prefixes.join('+')} → ${tierPeers.length} peer(s) · model=${models}`);
    }
  }

  // BP091 Ah Hayelped: build difficulty → tier list map from --question-difficulty-routing
  // difficultyTierMap: { 'hard': ['ultra','full'], 'medium': ['ultra','full','core'], 'short': ['ultra','full','core'] }
  const difficultyTierMap = {};
  if (args.questionDifficultyRouting) {
    for (const segment of args.questionDifficultyRouting.split(',')) {
      const colonIdx = segment.indexOf(':');
      if (colonIdx < 0) continue;
      const diffLabel = segment.slice(0, colonIdx).toLowerCase().trim();
      const tierListStr = segment.slice(colonIdx + 1).trim();
      const tiers = tierListStr === 'all'
        ? Object.keys(tierPeerMap)
        : tierListStr.split('+').map(t => t.trim()).filter(Boolean);
      difficultyTierMap[diffLabel] = tiers;
    }
    console.log(`\nDifficulty routing: ${JSON.stringify(difficultyTierMap)}`);
  }

  // Identify Son: peer whose lan_addresses does NOT contain 192.168.
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

  // Load questions — custom bank takes precedence over default domain dataset
  console.log(`\nLoading ${questionCount} questions...`);
  let questions;
  try {
    if (args.questionBank) {
      console.log(`Custom question bank: ${args.questionBank}`);
      const bankAll = loadQuestionBank(args.questionBank);
      questions = bankAll.slice(0, questionCount);
      if (questions.length < questionCount) {
        console.warn(`${YELLOW}WARNING: question bank has ${bankAll.length} questions, requested ${questionCount}${RESET}`);
      }
    } else {
      questions = selectQuestionsSpreadAcrossDomains(questionCount);
    }
  } catch (err) {
    console.error(`ERROR loading questions: ${err.message}`);
    process.exit(2);
  }
  console.log(`Loaded ${questions.length} questions from domains: ${[...new Set(questions.map(q => q.domain))].join(', ')}\n`);

  // Pre-warm: send a keep_alive ping via relay to ensure models stay loaded
  // (relay-based — peers handle on their end; orchestrator just dispatches)

  // MAMBA-zeta: staggered-then-connected routing -- Phase 1 staggered, Phase 2 connected
  // When routing === 'staggered-then-connected': run Phase 1 (one domain at a time, sequentially),
  // then fall through to existing loop as Phase 2 (connected, all domains simultaneously).
  const staggeredPhaseResults = {};
  if (routing === 'staggered-then-connected') {
    console.log(`\n${BOLD}${CYAN}ROUTING: staggered-then-connected -- Phase 1: Staggered (domain-by-domain)${RESET}\n`);

    // Group loaded questions by domain for sequential domain testing
    const byDomain = {};
    for (const q of questions) {
      if (!byDomain[q.domain]) byDomain[q.domain] = [];
      byDomain[q.domain].push(q);
    }

    for (const domain of DOMAINS) {
      const domainQs = byDomain[domain] || [];
      if (domainQs.length === 0) {
        staggeredPhaseResults[domain] = { status: 'AMBER', score: 0, total: 0, latencyMs: 0 };
        console.log(`  ${domain}: ${YELLOW}AMBER${RESET} -- no questions loaded for this domain`);
        continue;
      }

      const domainStart = Date.now();
      let domainCorrect = 0;

      for (const q of domainQs) {
        const correctLetter = getCorrectLetter(q);
        const prompt = buildPrompt(q);
        const questionId = `${sessionId}-stagger-${domain}-${domainCorrect}`;

        const routeInserts = peers.map(p => insertRoute(SUPABASE_URL, SERVICE_KEY, {
          target_peer_id: p.peer_id,
          hex_frame: Buffer.from(prompt, 'utf8').toString('base64'),
          payload_json: {
            prompt, question_id: questionId,
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
          console.error(`  Stagger [${domain}] route insert failed: ${err.message}`);
          continue;
        }

        const routeIds = insertedRoutes.map(r => r.id);
        const routeToPeerS = {};
        for (let j = 0; j < peers.length; j++) routeToPeerS[routeIds[j]] = peers[j].peer_id;

        const repliesByRouteId = await pollReplies(SUPABASE_URL, SUPABASE_ANON_KEY, routeIds, timeoutMs);

        const peerAnswers = {};
        for (const p of peers) peerAnswers[p.peer_id] = null;
        for (const [routeId, reply] of Object.entries(repliesByRouteId)) {
          const peerId = routeToPeerS[routeId];
          if (!peerId) continue;
          let rawText = null;
          if (reply.hex_reply) {
            try { rawText = Buffer.from(reply.hex_reply, 'base64').toString('utf8'); } catch { rawText = reply.hex_reply; }
          }
          if (!rawText && reply.answer_json) {
            rawText = typeof reply.answer_json === 'string'
              ? reply.answer_json
              : (reply.answer_json.response ?? reply.answer_json.answer ?? JSON.stringify(reply.answer_json));
          }
          peerAnswers[peerId] = extractLetter(rawText, q.options.length);
        }
        const { answer: ensembleAnswer } = ensembleVote(peerAnswers);
        if (ensembleAnswer !== null && ensembleAnswer === correctLetter) domainCorrect++;
      }

      const domainLatency = Date.now() - domainStart;
      const domainTotal = domainQs.length;
      const domainStatus = domainCorrect >= Math.ceil(domainTotal * 0.6) ? 'GREEN'
        : domainCorrect >= Math.ceil(domainTotal * 0.4) ? 'AMBER' : 'RED';
      const statusColor = domainStatus === 'GREEN' ? GREEN : domainStatus === 'AMBER' ? YELLOW : RED;
      staggeredPhaseResults[domain] = { status: domainStatus, score: domainCorrect, total: domainTotal, latencyMs: domainLatency };
      console.log(`  ${domain}: ${statusColor}${domainStatus}${RESET} -- ${domainCorrect}/${domainTotal} correct -- ${domainLatency}ms`);
    }

    console.log(`\n${BOLD}${CYAN}ROUTING: staggered-then-connected -- Phase 1 complete -- starting Phase 2: Connected${RESET}\n`);
  }

  // Run questions
  const results = [];
  const peerCorrect = {};
  const peerAnswered = {};
  const peerRouted = {};   // BP091 Ah Hayelped: questions dispatched per peer (may differ from answered)
  for (const p of peers) { peerCorrect[p.peer_id] = 0; peerAnswered[p.peer_id] = 0; peerRouted[p.peer_id] = 0; }
  let ensembleCorrect = 0;
  let ensembleContested = 0;

  // BP090: track total escalation counts across all questions
  let totalEscalationFired = 0;

  // BP092 M24 Block 4: joulesRemainingRef -- shared mutable Joules budget across all questions
  const joulesRemainingRef = { value: 5000 }; // 5000 Joules = $5 USD default

  // BP092 M24 Block 4: logEscalation -- persist tier escalation to escalation_log
  async function logEscalation(supaUrl, svcKey, row) {
    try {
      await supabaseRequest(supaUrl, svcKey, 'POST', 'escalation_log', {
        ...row,
        escalated_at: new Date().toISOString(),
      });
    } catch { /* non-fatal */ }
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const qNum = `Q${pad2(i + 1)}/${pad2(questions.length)}`;
    const correctLetter = getCorrectLetter(q);
    const prompt = buildPrompt(q);
    const questionId = `${sessionId}-q${pad2(i + 1)}`;

    // BP090: per-domain timeout — getDomainTimeout falls back to global timeoutSec if no config
    const qTimeoutSec = getDomainTimeout(q.domain, perDomainConfig, timeoutSec);
    const qTimeoutMs = qTimeoutSec * 1000;
    const approachThresholdMs = Math.floor(qTimeoutMs * 0.8);

    console.log(`[${qNum}] source_id=${q.source_id} (${q.domain}) correct=${correctLetter ?? '?'} timeout=${qTimeoutSec}s`);
    if (isGemmaMode) {
      console.log(`[flagship-tier=${flagshipTier}] Anthropic API SKIPPED`);
    }

    // MAMBA-γ: load domain affinity and sort peer pool
    let peerPool = [...peers];
    if (routing === 'domain-affinity') {
      const affinityMap = await getDomainAffinity(SUPABASE_URL, SUPABASE_ANON_KEY, peers.map(p => p.peer_id), q.domain);
      peerPool = [...peers].sort((a, b) => (affinityMap[b.peer_id] ?? 0.5) - (affinityMap[a.peer_id] ?? 0.5));
    }

    // BP091 Ah Hayelped: tier-aware routing — filter peer pool by question difficulty
    if (isTierAwareRouting && Object.keys(tierPeerMap).length > 0) {
      const difficulty = classifyDomainDifficulty(q.domain);
      const allowedTiers = difficultyTierMap[difficulty] ?? Object.keys(tierPeerMap);
      const tierFiltered = peers.filter(p => {
        const peerTier = peerTierMap[p.peer_id];
        return allowedTiers.includes(peerTier);
      });
      if (tierFiltered.length > 0) {
        peerPool = tierFiltered;
        console.log(`  [tier-routing] ${q.domain} → difficulty=${difficulty} → tiers=[${allowedTiers.join('+')}] → ${peerPool.map(p => (peerTierMap[p.peer_id]??'?').toUpperCase()+':'+p.peer_id.slice(0,8)).join(', ')}`);
      } else {
        // Fallback — use all peers (config mismatch; should not happen)
        console.warn(`  [tier-routing] WARNING: no peers matched tiers=[${allowedTiers.join('+')}] for difficulty=${difficulty} — falling back to full pool`);
      }
    }

    // Track routing per peer for fleet_composition receipt (BP091)
    for (const p of peerPool) {
      if (peerRouted[p.peer_id] !== undefined) peerRouted[p.peer_id]++;
    }

    // INSERT one relay_route per peer (all concurrently)
    // MAMBA-δ: include wire_format field in payload when hex-mcode requested
    // BP090: include plow_max_iterations + allotted_timeout_ms for peer-side approaching_timeout detection
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
        plow_max_iterations: plowMaxIterations,
        allotted_timeout_ms: qTimeoutMs,           // BP090: for peer-side 80% threshold detection
      },
      status: 'pending',
      session_id: sessionId,
      ttl_seconds: qTimeoutSec + 60,
    }));

    let insertedRoutes;
    try {
      insertedRoutes = await Promise.all(routeInserts);
    } catch (err) {
      console.error(`  ERROR inserting relay_routes: ${err.message}`);
      results.push({ index: i + 1, source_id: q.source_id, domain: q.domain, error: 'insert_failed',
        escalation_fired: false, escalation_peer_count: 0, final_answer_source: 'insert_failed' });
      continue;
    }

    const routeIds = insertedRoutes.map(r => r.id);
    const routeToPeer = {};
    for (let j = 0; j < peerPool.length; j++) {
      routeToPeer[routeIds[j]] = peerPool[j].peer_id;
    }

    console.log(`  Dispatched ${routeIds.length} routes — polling replies (timeout ${qTimeoutSec}s · approach@${Math.floor(qTimeoutSec * 0.8)}s)...`);

    // ── BP090 TRIPLE-MAMBA: escalation-aware polling loop ──────────────────────
    const qStartMs = Date.now();
    const qDeadline = qStartMs + qTimeoutMs;
    const pollIntervalMs = 3000;
    const collectedReplies = {};    // routeId → reply row
    let escalationFired = false;
    let escalationPeerCount = 0;
    let escalationRouteIds = [];
    const routeToPeerEsc = {};      // escalation routeId → peer_id
    let _abstainForcedEscalation = false;  // M14 Block 2: set true when ABSTAIN reply forces escalation

    while (Date.now() < qDeadline) {
      // BP090 FIX v2: Compute elapsed FIRST.  Poll ONLY if pending routes exist.
      // Escalation check runs BEFORE any exit-point guard so it always gets a chance
      // at the 80% threshold even when all original routes have already replied.
      const elapsed = Date.now() - qStartMs;

      const allRouteIds = [...routeIds, ...escalationRouteIds];
      const pending = allRouteIds.filter(id => !collectedReplies[id]);

      // Poll pending routes (skip query if nothing pending — avoids empty IN() error)
      if (pending.length > 0) {
        const idList = pending.map(id => `"${id}"`).join(',');
        let rows = [];
        try {
          rows = (await supabaseRequest(
            SUPABASE_URL, SUPABASE_ANON_KEY, 'GET',
            `relay_route_replies?select=route_id,peer_id,answer_json,hex_reply,processing_ms&route_id=in.(${idList})`
          )) ?? [];
        } catch { /* poll error — continue */ }

        for (const row of rows) {
          // Skip approaching_timeout signal rows (reply_type marker from peer-side index.ts)
          const aj = (row.answer_json && typeof row.answer_json === 'object') ? row.answer_json : {};
          if (aj.reply_type === 'approaching_timeout') continue;
          if (!collectedReplies[row.route_id]) {
            collectedReplies[row.route_id] = row;
          }
        }
      }

      // -- BP092 M24 Block 4: ABSTAIN PRE-SCAN (runs each poll iteration) --
      // Fix: _abstainForcedEscalation set BEFORE escalation threshold check fires.
      for (const [_scanRouteId, _scanReply] of Object.entries(collectedReplies)) {
        if (!_abstainForcedEscalation && !escalationFired) {
          const ajScan = (_scanReply.answer_json && typeof _scanReply.answer_json === 'object')
            ? _scanReply.answer_json : {};
          const isAbstainScan = ajScan.answer === 'ABSTAIN';
          const isLegacyNullScan = !isAbstainScan
            && (ajScan.answer === null || ajScan.answer === undefined)
            && !_scanReply.hex_reply;
          if ((isAbstainScan && ajScan.escalation_eligible === true) || isLegacyNullScan) {
            _abstainForcedEscalation = true;
            console.log(`  [ABSTAIN-PRE-SCAN] routeId=${_scanRouteId.slice(0,8)} set _abstainForcedEscalation=true`);
          }
        }
      }
      // -- END ABSTAIN PRE-SCAN --

      // ── ESCALATION CHECK — runs before any exit so it always executes at threshold ──
      if (!escalationFired && elapsed >= approachThresholdMs && andonEscalate === 'star-chamber') {
        console.log(`\n  [escalation-trigger] elapsed=${Math.floor(elapsed/1000)}s >= ${Math.floor(approachThresholdMs/1000)}s — building partial answers`);
        // Build partial answer map from what we've collected so far
        const partialAnswers = {};
        for (const p of peerPool) {
          partialAnswers[p.peer_id] = null;
          const rid = routeIds[peerPool.indexOf(p)];
          if (rid && collectedReplies[rid]) {
            const reply = collectedReplies[rid];
            let rawText = null;
            if (reply.hex_reply) {
              try { rawText = Buffer.from(reply.hex_reply, 'base64').toString('utf8'); } catch { rawText = reply.hex_reply; }
            }
            if (!rawText && reply.answer_json) {
              const aj2 = reply.answer_json;
              rawText = typeof aj2 === 'string' ? aj2 : (aj2.response ?? aj2.answer ?? JSON.stringify(aj2));
            }
            partialAnswers[p.peer_id] = extractLetter(rawText, q.options.length);
          }
        }

        // BP090 escalation trigger: fire on variance OR quorum shortfall.
        // If fewer than 50% of peers have answered at 80% elapsed, treat as
        // maximum uncertainty — escalate even without inter-peer disagreement.
        const answeredCountAtApproach = Object.values(partialAnswers).filter(a => a !== null).length;
        const minQuorumPeers = Math.ceil(peerPool.length / 2);
        let variancePct;
        if (answeredCountAtApproach < minQuorumPeers) {
          variancePct = 100; // quorum shortfall → maximum uncertainty
          console.log(`  [escalation-check] quorum shortfall: ${answeredCountAtApproach}/${peerPool.length} peers answered at ${Math.floor(elapsed/1000)}s (< ${minQuorumPeers} quorum) → treating variance as 100%`);
        } else {
          variancePct = computeAnswerVariancePct(partialAnswers);
        }
        // M14 Block 2: ABSTAIN-forced escalation
        if (_abstainForcedEscalation) variancePct = 100;
        if (variancePct > andonThreshold) {
          escalationFired = true;
          totalEscalationFired++;
          const partialCouncilVotes = peerPool
            .filter(p => partialAnswers[p.peer_id] !== null)
            .map(p => ({ peer_id: p.peer_id, answer: partialAnswers[p.peer_id], confidence: 0.5 }));
          const { answer: bestGuessAnswer } = ensembleVote(partialAnswers);
          const remainingMs = qDeadline - Date.now();

          console.log(`  ${YELLOW}ANDON: elapsed=${Math.floor(elapsed/1000)}s ≥ 80% of ${qTimeoutSec}s · variance=${variancePct.toFixed(1)}% > ${andonThreshold}% · firing Star Chamber escalation${RESET}`);
          console.log(`  partial_council_votes: [${partialCouncilVotes.map(v => `${v.peer_id.slice(0,8)}:${v.answer}`).join(', ')}] best_guess=${bestGuessAnswer ?? 'null'}`);

          // Dispatch escalation routes to all peers with priming context
          const escInserts = peerPool.map(p => insertRoute(SUPABASE_URL, SERVICE_KEY, {
            target_peer_id: p.peer_id,
            hex_frame: Buffer.from(prompt, 'utf8').toString('base64'),
            payload_json: {
              prompt,
              question_id: `${questionId}-esc`,
              correct_answer_letter: correctLetter,
              source_id: q.source_id,
              wire_format: wire,
              domain: q.domain,
              session_id: sessionId,
              plow_max_iterations: Math.min(plowMaxIterations, 4), // shorter pass for escalation
              allotted_timeout_ms: remainingMs,
              is_star_chamber: true,
              priming_context: {
                partial_council_votes: partialCouncilVotes,
                best_guess_answer: bestGuessAnswer,
                plow_loop_iteration: -1,     // escalation context
                elapsed_ms: elapsed,
                allotted_timeout_ms: qTimeoutMs,
              },
            },
            status: 'pending',
            session_id: sessionId,
            ttl_seconds: Math.ceil(remainingMs / 1000) + 30,
          }));

          try {
            const escRoutes = await Promise.all(escInserts);
            escalationRouteIds = escRoutes.map(r => r.id);
            escalationPeerCount = escalationRouteIds.length;
            for (let ej = 0; ej < peerPool.length; ej++) {
              routeToPeerEsc[escalationRouteIds[ej]] = peerPool[ej].peer_id;
            }
            console.log(`  Star Chamber escalation: dispatched ${escalationPeerCount} routes — ${escalationRouteIds.map(id => id.slice(0,8)).join(', ')}`);
          } catch (escErr) {
            console.error(`  Escalation dispatch failed: ${escErr.message}`);
            escalationFired = false; // revert flag since dispatch failed
          }
        }
      }

      // ── EXIT CHECK — runs AFTER escalation so escalation always gets first shot ──
      // All original + escalation routes must have replied, AND either:
      //   (a) escalation already fired AND all escalation routes replied, or
      //   (b) we've passed the approach threshold (so escalation had its chance), or
      //   (c) BP091 fast-consensus: all original routes replied + variance below threshold (early exit)
      const allRouteIdsPost = [...routeIds, ...escalationRouteIds];
      const allReplied = allRouteIdsPost.every(id => !!collectedReplies[id]);
      if (allReplied && (escalationFired || elapsed >= approachThresholdMs)) break;
      // BP091 fast-consensus early exit: if all original routes replied before approach threshold,
      // check variance — if consensus reached (low variance), exit without waiting for threshold.
      // Preserves escalation: if variance is above threshold, continue to approach threshold.
      if (!escalationFired && allReplied && elapsed < approachThresholdMs) {
        const fastAnswers = {};
        for (const p of peerPool) {
          const rid = routeIds[peerPool.indexOf(p)];
          if (rid && collectedReplies[rid]) {
            const r = collectedReplies[rid];
            let raw = null;
            if (r.hex_reply) try { raw = Buffer.from(r.hex_reply, 'base64').toString('utf8'); } catch { raw = r.hex_reply; }
            if (!raw && r.answer_json) {
              const aj4 = r.answer_json;
              raw = typeof aj4 === 'string' ? aj4 : (aj4.response ?? aj4.answer ?? JSON.stringify(aj4));
            }
            fastAnswers[p.peer_id] = extractLetter(raw, q.options.length);
          } else {
            fastAnswers[p.peer_id] = null;
          }
        }
        const fastVariancePct = computeAnswerVariancePct(fastAnswers);
        if (fastVariancePct <= andonThreshold) {
          console.log(`  [fast-consensus] all routes replied · variance=${fastVariancePct.toFixed(1)}% ≤ ${andonThreshold}% · exiting early (elapsed=${Math.floor(elapsed/1000)}s)`);
          break;
        }
        // High variance even though all replied — wait for approach threshold to fire escalation
      }

      await new Promise(r => setTimeout(r, pollIntervalMs));
    }

    // ── Collect per-peer answers from all collected replies ───────────────────
    const peerAnswers = {};
    for (const p of peers) peerAnswers[p.peer_id] = null;

    const repliesByRouteId = collectedReplies;

    // Original routes
    for (const [routeId, reply] of Object.entries(collectedReplies)) {
      const peerId = routeToPeer[routeId] ?? routeToPeerEsc[routeId];
      if (!peerId) continue;

      let rawText = null;
      if (reply.hex_reply) {
        try { rawText = Buffer.from(reply.hex_reply, 'base64').toString('utf8'); } catch { rawText = reply.hex_reply; }
      }
      if (!rawText && reply.answer_json) {
        const aj3 = reply.answer_json;
        rawText = typeof aj3 === 'string' ? aj3 : (aj3.response ?? aj3.answer ?? JSON.stringify(aj3));
      }

      // M14 Block 2: detect structured ABSTAIN response
      const aj3 = typeof reply.answer_json === 'object' && reply.answer_json !== null
        ? reply.answer_json : {};
      const isAbstain = aj3.answer === 'ABSTAIN';
      const isLegacyNull = !isAbstain && (aj3.answer === null || aj3.answer === undefined) && !rawText;

      if (isAbstain || isLegacyNull) {
        peerAnswers[peerId] = null;
        const abstainTag = isAbstain
          ? `ABSTAIN(${aj3.abstain_reason ?? 'unknown'})`
          : 'ABSTAIN(null_protocol_violation)';
        console.log(`  [${peerId.slice(0,8)}] ${abstainTag} — escalation_eligible=${aj3.escalation_eligible ?? false}`);
        if ((aj3.escalation_eligible === true || isLegacyNull) && !escalationFired) {
          _abstainForcedEscalation = true;
        }
        continue;
      }

      const letter = extractLetter(rawText, q.options.length);
      // Escalation routes may update a peer's answer; last write wins
      if (routeToPeerEsc[routeId]) {
        peerAnswers[peerId] = letter; // escalation always overwrites
      } else if (peerAnswers[peerId] === null) {
        peerAnswers[peerId] = letter;
      }

      if (letter !== null) {
        peerAnswered[peerId]++;
        if (letter === correctLetter) peerCorrect[peerId]++;
      }

      const isCorrect = letter !== null && letter === correctLetter;
      const shortId = peerId.slice(0, 8);
      const escTag = routeToPeerEsc[routeId] ? `${CYAN}[ESC]${RESET}` : '';
      console.log(`  [${shortId}]${escTag} ${letter ?? 'TIMEOUT/EMPTY'} [${mark(isCorrect)}]`);
    }

    // Peers that got no reply from any route
    for (const p of peers) {
      const rid = routeIds[peerPool.indexOf(p)];
      const escRid = escalationRouteIds[peerPool.indexOf(p)];
      if (!collectedReplies[rid] && (!escRid || !collectedReplies[escRid])) {
        console.log(`  [${p.peer_id.slice(0, 8)}] TIMEOUT — no reply within ${qTimeoutSec}s`);
      }
    }

    // Determine final_answer_source
    const answeredCount = Object.values(peerAnswers).filter(a => a !== null).length;
    const { answer: ensembleAnswer, contested } = ensembleVote(peerAnswers);
    let finalAnswerSource;
    if (answeredCount === 0) {
      finalAnswerSource = 'no_answers';
    } else if (answeredCount === 1) {
      finalAnswerSource = 'single_peer_fallback';
    } else if (escalationFired) {
      finalAnswerSource = contested ? 'escalation_consensus' : 'escalation_consensus';
    } else if (!contested) {
      const allSame = new Set(Object.values(peerAnswers).filter(a => a !== null)).size === 1;
      finalAnswerSource = allSame ? 'council_unanimous' : 'council_majority';
    } else {
      finalAnswerSource = 'council_majority';
    }

    const ensembleIsCorrect = ensembleAnswer !== null && ensembleAnswer === correctLetter;

    // M14 Block 3: Contested resolution tiers
    let contestedResolutionTier = null;
    let tier1FallbackFired = false;
    let tier2FallbackFired = false;

    if (contested) {
      contestedResolutionTier = 'pending';

      // ── Tier 1: extended council — tiebreaker via qwen2.5:7b ──
      try {
        const tiebreakerPeerId = m0PeerId ?? 'cb4ef450';
        const tier1Route = await insertRoute(SUPABASE_URL, SERVICE_KEY, {
          target_peer_id: tiebreakerPeerId,
          hex_frame: Buffer.from(prompt, 'utf8').toString('base64'),
          payload_json: {
            prompt,
            question_id: `${questionId}-tier1`,
            correct_answer_letter: correctLetter,
            source_id: q.source_id,
            wire_format: wire,
            domain: q.domain,
            session_id: sessionId,
            plow_max_iterations: 4,
            allotted_timeout_ms: Math.min(120000, qDeadline - Date.now()),
            is_tiebreaker: true,
            tiebreaker_model: 'qwen2.5:7b',
            priming_context: {
              contested_answers: Object.values(peerAnswers).filter(a => a !== null),
              per_peer_breakdown: peerAnswers,
            },
          },
          status: 'pending',
          session_id: sessionId,
          ttl_seconds: 180,
        });
        tier1FallbackFired = true;

        const tier1RepliesMap = await pollReplies(
          SUPABASE_URL, SUPABASE_ANON_KEY,
          [tier1Route.id],
          Math.min(120000, qDeadline - Date.now())
        );
        const tier1Reply = tier1RepliesMap[tier1Route.id];

        if (tier1Reply) {
          let tier1Raw = null;
          if (tier1Reply.hex_reply) {
            try { tier1Raw = Buffer.from(tier1Reply.hex_reply, 'base64').toString('utf8'); } catch { tier1Raw = tier1Reply.hex_reply; }
          }
          if (!tier1Raw && tier1Reply.answer_json) {
            const aj4 = tier1Reply.answer_json;
            tier1Raw = typeof aj4 === 'string' ? aj4 : (aj4.response ?? aj4.answer ?? JSON.stringify(aj4));
          }

          const tier1Letter = extractLetter(tier1Raw, q.options.length);
          if (tier1Letter !== null && tier1Letter !== 'ABSTAIN') {
            peerAnswers[`${tiebreakerPeerId}-tier1`] = tier1Letter;
            const { answer: resolvedAnswer, contested: stillContested } = ensembleVote(peerAnswers);
            if (!stillContested && resolvedAnswer !== null) {
              contestedResolutionTier = 'tier_1';
              const tier1Correct = resolvedAnswer === correctLetter;
              if (tier1Correct) ensembleCorrect++;
              ensembleContested++;
              console.log(`  [CONTESTED → TIER1 RESOLVED] tiebreaker=${tier1Letter} qwen2.5:7b | correct=${tier1Correct}`);
              results.push({
                index: i + 1,
                source_id: q.source_id,
                domain: q.domain,
                question_preview: q.question.slice(0, 120) + (q.question.length > 120 ? '...' : ''),
                num_options: q.options.length,
                correct_letter: correctLetter,
                correct_answer_text: q.correct_answer,
                allotted_timeout_s: qTimeoutSec,
                route_ids: routeIds,
                escalation_fired: escalationFired,
                escalation_peer_count: escalationPeerCount,
                escalation_route_ids: escalationRouteIds,
                final_answer_source: 'tier_1_tiebreaker',
                per_peer: Object.fromEntries(
                  peerPool.map((p, j) => [p.peer_id, {
                    route_id: routeIds[j],
                    escalation_route_id: escalationRouteIds[j] ?? null,
                    answer: peerAnswers[p.peer_id],
                    replied: !!collectedReplies[routeIds[j]] || !!collectedReplies[escalationRouteIds[j]],
                    correct: peerAnswers[p.peer_id] !== null && peerAnswers[p.peer_id] === correctLetter,
                  }])
                ),
                ensemble: { answer: resolvedAnswer, contested: false, correct: tier1Correct },
                contested_resolution_tier: 'tier_1',
                tier_1_fallback_fired: true,
                tier_2_fallback_fired: false,
              });
              continue;  // next question
            }
          }
        }
      } catch (tier1Err) {
        console.warn(`  [TIER1] tiebreaker dispatch failed: ${tier1Err.message}`);
      }

      // -- BP092 M24 Step 2: POSSE decompose + swarm (if Tier 1 did not resolve) --
      let posseAnswerLetter = null;
      if (!contestedResolutionTier || contestedResolutionTier === 'pending') {
        try {
          console.log(`  [POSSE] decomposing question ${questionId} -> sub-claims...`);
          const { decomposeQuestion } = await import('../../dist/main/army_ants/posse_decompose.js');
          const { swarmDispatch } = await import('../../dist/main/army_ants/posse_swarm.js');
          const decomp = await decomposeQuestion(
            questionId, q.question, q.options, q.domain,
            SUPABASE_URL, SERVICE_KEY,
            m0PeerId,
            Math.min(90000, qDeadline - Date.now()),
          );
          if (decomp.sub_claims.length > 0) {
            const swarmResult = await swarmDispatch(
              decomp.sub_claims, questionId, q.question, q.options,
              {
                supabaseUrl: SUPABASE_URL, serviceKey: SERVICE_KEY, anonKey: SUPABASE_ANON_KEY,
                sessionId, domain: q.domain, wireFormat: wire,
                tierPeerMap, peerTierMap, peers: peerPool,
                timeoutMs: Math.min(120000, qDeadline - Date.now()),
                maxDepth: 2, varianceThreshold: andonThreshold,
              }
            );
            posseAnswerLetter = swarmResult.aggregate_answer;
            if (posseAnswerLetter !== null && !swarmResult.contested_after_swarm) {
              contestedResolutionTier = 'posse';
              const posseCorrect = posseAnswerLetter === correctLetter;
              if (posseCorrect) ensembleCorrect++;
              ensembleContested++;
              await logEscalation(SUPABASE_URL, SERVICE_KEY, {
                session_id: sessionId, question_id: questionId, domain: q.domain,
                tier: 'posse', answer: posseAnswerLetter, correct: posseCorrect,
                detail: `swarm run_id=${swarmResult.run_id}`,
              });
              console.log(`  [CONTESTED -> POSSE RESOLVED] answer=${posseAnswerLetter} correct=${posseCorrect}`);
              results.push({
                index: i + 1, source_id: q.source_id, domain: q.domain,
                question_preview: q.question.slice(0, 120) + (q.question.length > 120 ? '...' : ''),
                num_options: q.options.length, correct_letter: correctLetter,
                correct_answer_text: q.correct_answer, allotted_timeout_s: qTimeoutSec,
                route_ids: routeIds, escalation_fired: escalationFired,
                escalation_peer_count: escalationPeerCount, escalation_route_ids: escalationRouteIds,
                final_answer_source: 'posse_swarm',
                per_peer: Object.fromEntries(peerPool.map((p, j) => [p.peer_id, {
                  route_id: routeIds[j], escalation_route_id: escalationRouteIds[j] ?? null,
                  answer: peerAnswers[p.peer_id],
                  replied: !!collectedReplies[routeIds[j]] || !!collectedReplies[escalationRouteIds[j]],
                  correct: peerAnswers[p.peer_id] !== null && peerAnswers[p.peer_id] === correctLetter,
                }])),
                ensemble: { answer: posseAnswerLetter, contested: false, correct: posseCorrect },
                contested_resolution_tier: 'posse',
                tier_1_fallback_fired: tier1FallbackFired, tier_2_fallback_fired: false,
              });
              continue; // next question
            }
            console.log(`  [POSSE] swarm did not converge -- escalating to Tier 2`);
          }
        } catch (posseErr) {
          console.warn(`  [POSSE] dispatch failed: ${posseErr.message} -- escalating to Tier 2`);
        }
      }

      // -- BP092 M24 Step 3: Tier 2 flagship escalation --
      if (tier2Flagship && (!contestedResolutionTier || contestedResolutionTier === 'pending')) {
        try {
          tier2FallbackFired = true;
          const { tier2FlagshipEscalate } = await import('../../src/main/tier2/flagship_escalate.js');
          const t2Result = await tier2FlagshipEscalate(
            questionId, prompt, q.options.length, q.domain,
            {
              anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
              openaiApiKey: process.env.OPENAI_API_KEY ?? '',
              joulesRemainingRef,
              joulesCapPerRun: 5000,
              joulesPerQuestion: 120,
              supabaseUrl: SUPABASE_URL,
              serviceKey: SERVICE_KEY,
              sessionId,
            }
          );
          if (t2Result.answer !== null && t2Result.vendor !== 'skipped') {
            contestedResolutionTier = 'tier_2';
            const t2Correct = t2Result.answer === correctLetter;
            if (t2Correct) ensembleCorrect++;
            ensembleContested++;
            await logEscalation(SUPABASE_URL, SERVICE_KEY, {
              session_id: sessionId, question_id: questionId, domain: q.domain,
              tier: 'tier_2', answer: t2Result.answer, correct: t2Correct,
              detail: `${t2Result.vendor}/${t2Result.model} cost=${t2Result.cost_joules}J`,
            });
            console.log(`  [CONTESTED -> TIER2 RESOLVED] vendor=${t2Result.vendor} answer=${t2Result.answer} correct=${t2Correct}`);
            results.push({
              index: i + 1, source_id: q.source_id, domain: q.domain,
              question_preview: q.question.slice(0, 120) + (q.question.length > 120 ? '...' : ''),
              num_options: q.options.length, correct_letter: correctLetter,
              correct_answer_text: q.correct_answer, allotted_timeout_s: qTimeoutSec,
              route_ids: routeIds, escalation_fired: escalationFired,
              escalation_peer_count: escalationPeerCount, escalation_route_ids: escalationRouteIds,
              final_answer_source: 'tier_2_flagship',
              per_peer: Object.fromEntries(peerPool.map((p, j) => [p.peer_id, {
                route_id: routeIds[j], escalation_route_id: escalationRouteIds[j] ?? null,
                answer: peerAnswers[p.peer_id],
                replied: !!collectedReplies[routeIds[j]] || !!collectedReplies[escalationRouteIds[j]],
                correct: peerAnswers[p.peer_id] !== null && peerAnswers[p.peer_id] === correctLetter,
              }])),
              ensemble: { answer: t2Result.answer, contested: false, correct: t2Correct },
              contested_resolution_tier: 'tier_2',
              tier_1_fallback_fired: tier1FallbackFired, tier_2_fallback_fired: true,
            });
            continue; // next question
          }
        } catch (t2Err) {
          console.warn(`  [TIER2] flagship escalation threw: ${t2Err.message}`);
        }
      }

      // -- BP092 M24 Step 4: Tier 3 -- record + flag for human review --
      contestedResolutionTier = 'tier_3_contested';
      await logEscalation(SUPABASE_URL, SERVICE_KEY, {
        session_id: sessionId, question_id: questionId, domain: q.domain,
        tier: 'tier_3_human', answer: null, correct: false,
        detail: 'all tiers exhausted -- requires human review',
      });
      console.log(`  [CONTESTED -> TIER3] all tiers exhausted -- flagged for human review`);

      ensembleContested++;
      console.log(`  Ensemble: ${YELLOW}CONTESTED${RESET} | escalation_fired=${escalationFired} | source=${finalAnswerSource} | resolution=${contestedResolutionTier}`);
    } else {
      if (ensembleIsCorrect) ensembleCorrect++;
      console.log(`  Ensemble: ${ensembleAnswer ?? 'NULL'} [${mark(ensembleIsCorrect)}] | escalation_fired=${escalationFired} | source=${finalAnswerSource}`);
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
      allotted_timeout_s: qTimeoutSec,
      route_ids: routeIds,
      escalation_fired: escalationFired,
      escalation_peer_count: escalationPeerCount,
      escalation_route_ids: escalationRouteIds,
      final_answer_source: finalAnswerSource,
      per_peer: Object.fromEntries(
        peerPool.map((p, j) => {
          const replyRow = collectedReplies[routeIds[j]] || collectedReplies[escalationRouteIds[j]] || null;
          const replyAj = (replyRow && typeof replyRow.answer_json === 'object' && replyRow.answer_json !== null)
            ? replyRow.answer_json : {};
          return [p.peer_id, {
            route_id: routeIds[j],
            escalation_route_id: escalationRouteIds[j] ?? null,
            answer: peerAnswers[p.peer_id],
            replied: !!collectedReplies[routeIds[j]] || !!collectedReplies[escalationRouteIds[j]],
            correct: peerAnswers[p.peer_id] !== null && peerAnswers[p.peer_id] === correctLetter,
            // BP093 Phase 3: Minor Council receipt fields
            iterations_run: replyAj.iterations_run ?? null,
            council_votes_per_iteration: replyAj.council_votes_per_iteration ?? null,
          }];
        })
      ),
      ensemble: { answer: ensembleAnswer, contested, correct: ensembleIsCorrect },
      contested_resolution_tier: contestedResolutionTier,
      tier_1_fallback_fired: tier1FallbackFired,
      tier_2_fallback_fired: tier2FallbackFired,
    });
  }

  // Summary
  const ensemblePct = questions.length > 0 ? ((ensembleCorrect / questions.length) * 100).toFixed(1) : '0.0';
  const border = '══════════════════════════════════════════════════════════════';

  console.log(border);
  console.log(`${BOLD}5-PEER RELAY ORCHESTRATOR · BP090 TRIPLE-MAMBA · CROSS-VENDOR${RESET}`);
  console.log(border);
  console.log(`Ensemble Score:  ${ensembleCorrect}/${questions.length} = ${ensemblePct}%`);
  console.log(`Contested:       ${ensembleContested}`);
  console.log(`Escalation fired: ${totalEscalationFired}/${questions.length} questions`);
  console.log(`Topology:        Supabase relay_routes table dispatch · 4 LAN-adjacent + 1 real-WAN-hop (Son)`);
  console.log(`Dispatch method: wan-relay-route (no direct IP routing)`);
  // BP091 Ah Hayelped: dynamic model_families string
  const modelFamiliesStr = isTierAwareRouting && Object.keys(peerTierMap).length > 0
    ? (() => {
        const groups = {};
        for (const peer of peers) {
          const tier = (peerTierMap[peer.peer_id] ?? 'unknown').toUpperCase();
          const model = peer.capabilities?.ollamaModel ?? 'unknown';
          if (!groups[tier]) groups[tier] = { model, peers: [] };
          groups[tier].peers.push(peer.peer_id.slice(0,8));
        }
        return Object.entries(groups).map(([tier, g]) => `${g.model} (${g.peers.join('+')} ${tier})`).join(' + ')
          + ' — TIERED BY CAPACITY · Ah Hayelped BP091';
      })()
    : 'gemma4:12b (M0, M1, M2, M3) × qwen2.5:7b (Son) — CROSS-VENDOR HETEROGENEOUS';

  console.log(`Model families:  ${modelFamiliesStr}`);
  console.log('');
  console.log('Per-peer accuracy (BP091 fleet_composition):');
  for (const p of peers) {
    const routed = peerRouted[p.peer_id] ?? 0;
    const ans = peerAnswered[p.peer_id];
    const cor = peerCorrect[p.peer_id];
    const pct = ans > 0 ? ((cor / ans) * 100).toFixed(1) : '—';
    const tierLabel = (peerTierMap[p.peer_id] ?? p.tier ?? '?').toUpperCase();
    const modelLabel = p.capabilities?.ollamaModel ?? 'unknown';
    const sonTag = p.peer_id === sonPeerId ? ' ← Son (WAN)' : '';
    console.log(`  ${p.peer_id.slice(0, 16)} | ${tierLabel}/${modelLabel} | routed=${routed} answered=${ans} correct=${cor} | ${pct}%${sonTag}`);
  }
  console.log(border);

  // MAMBA-zeta: staggered-then-connected marker line + per-domain breakdown
  if (routing === 'staggered-then-connected') {
    console.log(`\nROUTING: staggered-then-connected -- Phase 1 complete -- Phase 2 complete`);
    console.log('\nPhase 1 per-domain breakdown:');
    for (const [domain, res] of Object.entries(staggeredPhaseResults)) {
      const statusColor = res.status === 'GREEN' ? GREEN : res.status === 'AMBER' ? YELLOW : RED;
      console.log(`  ${domain}: ${statusColor}${res.status}${RESET} -- ${res.score}/${res.total} -- ${res.latencyMs}ms`);
    }
    console.log('');
  }

  // Write JSON receipt
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  // BP091 Ah Hayelped: write to THUNDERCLAP receipt dir when trial-id is set, else BISHOP_DROPZONE
  const THUNDERCLAP_BASE = 'C:\\Users\\Administrator\\Documents\\Asteroid-ProofVault\\receipts\\THUNDERCLAP';
  const DROPZONE_DIR = 'C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\BISHOP_DROPZONE\\00_FOUNDER_REVIEW';
  const receiptDir = trialId
    ? join(THUNDERCLAP_BASE, trialId)
    : DROPZONE_DIR;
  const receiptPath = trialId
    ? join(receiptDir, `${trialId}_RECEIPT_${timestamp}.json`)
    : join(receiptDir, `VALIDATION_RUN_RECEIPT_RELAY_${timestamp}.json`);

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

  // BP091 Ah Hayelped: fleet_composition block — per-peer model + accuracy (binding §3.3)
  const fleetComposition = (() => {
    const hasTierConfig = Object.keys(tierPeerMap).length > 0;
    const peerEntries = peers.map(peer => {
      const tierLabel = (peerTierMap[peer.peer_id] ?? peer.capabilities?.ramTier ?? peer.tier ?? 'unknown').toUpperCase();
      const model = peer.capabilities?.ollamaModel ?? 'unknown';
      const routed = peerRouted[peer.peer_id] ?? 0;
      const correct = peerCorrect[peer.peer_id] ?? 0;
      const answered = peerAnswered[peer.peer_id] ?? 0;
      return {
        peer_id: peer.peer_id.slice(0, 8),
        ramTier: tierLabel,
        ollamaModel: model,
        questions_routed: routed,
        questions_answered: answered,
        questions_correct: correct,
        accuracy_pct: answered > 0 ? parseFloat(((correct / answered) * 100).toFixed(1)) : null,
      };
    });

    // Per-tier aggregate accuracy
    const perTierAccuracy = {};
    for (const [tier, prefixes] of Object.entries(tierPeerMap)) {
      const tierLabel = tier.toUpperCase();
      const tierPeers = peers.filter(p => peerTierMap[p.peer_id] === tier);
      const tierAnswered = tierPeers.reduce((s, p) => s + (peerAnswered[p.peer_id] ?? 0), 0);
      const tierCorrect = tierPeers.reduce((s, p) => s + (peerCorrect[p.peer_id] ?? 0), 0);
      perTierAccuracy[tierLabel] = `${tierCorrect}/${tierAnswered} (${tierAnswered > 0 ? ((tierCorrect/tierAnswered)*100).toFixed(1) : '0.0'}%)`;
    }

    return {
      peers: peerEntries,
      per_tier_accuracy: Object.keys(perTierAccuracy).length > 0 ? perTierAccuracy : null,
      fleet_ensemble_accuracy: `${ensembleCorrect}/${questions.length} (${ensemblePct}%)`,
      model_families: modelFamiliesStr,
      tier_aware_routing: hasTierConfig,
      ah_hayelped_bp091: hasTierConfig,
    };
  })();

  const receipt = {
    run_type: '5-peer-relay-orchestrator',
    canonical: isTierAwareRouting,
    topology: 'Supabase relay_routes table dispatch -- 4 LAN-adjacent + 1 real-WAN-hop (Son)',
    dispatch_method: 'wan-relay-route (no direct IP routing)',
    model_families: modelFamiliesStr,
    session_id: sessionId,
    run_timestamp: new Date().toISOString(),
    mode,
    routing,
    flagship_tier: flagshipTier,
    trial_id: trialId,
    pass: passLabel,
    anthropic_api_skipped: isGemmaMode || isTierAwareRouting,
    question_count: questions.length,
    peer_count: peers.length,
    son_peer_id: sonPeerId,
    fleet_composition: fleetComposition,   // BP091 §3.3 binding — per-peer model + accuracy
    peers: peerSummary,
    staggered_phase_results: Object.keys(staggeredPhaseResults).length > 0 ? staggeredPhaseResults : null,
    // BP090 TRIPLE-MAMBA: per-domain timeout + escalation metadata
    per_domain_timeout_config: perDomainConfig ?? null,
    escalation_summary: {
      andon_threshold_pct: andonThreshold,
      andon_escalate: andonEscalate,
      total_escalation_fired: totalEscalationFired,
      escalation_fired_pct: questions.length > 0 ? parseFloat(((totalEscalationFired / questions.length) * 100).toFixed(1)) : 0,
    },
    ensemble_score: {
      correct: ensembleCorrect,
      total: questions.length,
      pct: parseFloat(ensemblePct),
      contested: ensembleContested,
    },
    questions: results,
    truth_always_note: isTierAwareRouting
      ? 'BP091 Ah Hayelped tiered cooperative substrate · per-peer-tier-aware routing · llama3.3:70b ULTRA + gemma4:12b FULL + gemma2:9b CORE · fleet_composition block is canonical per-peer receipt.'
      : 'Pre-canonical relay diagnostic run. Canonical 5-peer cooperative substrate run requires lan_addresses population and verified peer identity mapping.',
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
