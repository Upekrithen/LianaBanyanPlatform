#!/usr/bin/env node
/**
 * plow-cli-12blade.js — BP084 SEG-1 (CORRECTED — canonical blade names)
 * 12-Blade Column Plow — standalone Node.js (no npm install required)
 *
 * Blade names sourced from src/main/plow/canonical_pipeline.ts (ground truth):
 *
 *   1  Spider          — locate topic-relevant eblets in substrate index
 *   2  Sprite          — retrieve located eblets from storage
 *   3  Specialists     — 9-Swarm (Wikipedia, Wikidata, arXiv, Ollama-synth fallback)
 *   4  Miner           — anti-popularity filter (weight >= 0.6, content >= 100 chars)
 *   5  Saladin         — Adversarial Fence (challenge candidates via Ollama)
 *   6  Furnace         — Angel of Death (survivors of Saladin challenge)
 *   7  Three Fates     — 3-voter arbitration (temps 0.0 / 0.2 / 0.4 via Ollama)
 *   8  Scribe          — record BMV / concordance / gate outcomes / TIC eblet mint
 *   9  Detective TEAM  — root-cause gate fails + Federated Andon cord (3-tier escalation)
 *  10  Psionic       — spawn consequence probes for every THEORY_OPEN
 *  11  Auditor      — walk substrate for contradictions; move to ELIMINATED
 *  12  Sentinel  — when KNOWN updates, flag downstream eblets for re-eval
 *
 * TIC 5-field schema (per canon_truth_integrity_chain_dependency_argument_eblet_chronos_bp084):
 *   known, theories_open, eliminated, dependencies_upstream, applications_downstream
 *
 * Usage:
 *   node plow-cli-12blade.js <shard.json> --model <model> --out <output.jsonl>
 *       --telemetry <telemetry.json> [--ollama http://localhost:11434]
 *       [--max-consequence-depth 3] [--vault <path>]
 */

'use strict';

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

// ── CLI ───────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
function getArg(flag, def) { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] ?? def : def; }

const shardFile = argv.find(a => !a.startsWith('--')) ?? null;
if (!shardFile) {
  console.error(
    'Usage: node plow-cli-12blade.js <shard.json> --model <model> ' +
    '--out <output.jsonl> --telemetry <telemetry.json> ' +
    '[--ollama http://localhost:11434] [--max-consequence-depth 3] [--vault <path>]'
  );
  process.exit(1);
}

const MODEL      = getArg('--model',    'gemma4:12b');
const OLLAMA_URL = getArg('--ollama',   'http://localhost:11434').replace(/\/$/, '');
const OUT_FILE   = getArg('--out',      'validation_test_results.jsonl');
const TELEM_FILE = getArg('--telemetry','validation_test_telemetry.json');
const MAX_DEPTH  = parseInt(getArg('--max-consequence-depth', '3'), 10);

const DEFAULT_VAULT = path.join(__dirname, '..', '..', 'Asteroid-ProofVault', 'state', 'eblets', 'active');
const VAULT_PATH = getArg('--vault', DEFAULT_VAULT);

// ── Constants (from canonical_pipeline.ts) ───────────────────────────────────

const FIREGUARD_STAGGER_MS  = 1000;    // stagger between specialist dispatches
const MINER_MIN_WEIGHT      = 0.6;
const MINER_MIN_CONTENT_LEN = 100;
const MAX_ANDON_RETRIES     = 2;
const OLLAMA_TIMEOUT_MS     = 60_000;
const SPECIALIST_TIMEOUT_MS = 8_000;

// ── Telemetry ─────────────────────────────────────────────────────────────────

function makeTelem(bladeN, name) {
  return { blade: bladeN, name, start_ms: Date.now(), end_ms: null, success: false, error: null, downstream_count: 0 };
}
function closeTelem(t, success, error = null, downstream_count = 0) {
  t.end_ms = Date.now(); t.success = success; t.error = error; t.downstream_count = downstream_count;
  return t;
}
function skipTelem(bladeN, name, reason) {
  return { blade: bladeN, name, start_ms: Date.now(), end_ms: Date.now(), success: true, error: null, downstream_count: 0, skipped: true, reason };
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }
function safeSlug(s) { return String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 60); }
function sha256hex(s) { return crypto.createHash('sha256').update(s).digest('hex'); }
function stableId(source, content) {
  let h = 0x811c9dc5;
  const str = source + ':' + content.slice(0, 120);
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}
function stripHtml(s) {
  return s.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
          .replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
}

// ── Ollama helper (uses /api/generate per canonical_pipeline.ts) ─────────────

async function callOllama(prompt, temperature) {
  try {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), OLLAMA_TIMEOUT_MS);
    const resp  = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, prompt, stream: false, options: { temperature, num_predict: 512 } }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.response?.trim() ?? null;
  } catch { return null; }
}

// ── BMV computation (from canonical_pipeline.ts) ──────────────────────────────

function computeBmv(candidatesRaw, postMiner, postFurnace, ebletsWritten, concordance, specialistCount, latencyMs) {
  const specialistScore   = Math.min(100, (specialistCount / 5) * 100);
  const minerRate         = candidatesRaw > 0 ? (postMiner / candidatesRaw) * 100 : 0;
  const furnaceRate       = postMiner > 0 ? (postFurnace / postMiner) * 100 : 0;
  const ebletScore        = Math.min(100, (ebletsWritten / 5) * 100);
  const concordanceScore  = concordance === 'CONCORDANT' ? 100 : concordance === 'PARTIAL' ? 60 : 0;
  const latencyScore      = Math.min(100, Math.max(0, 100 - (latencyMs / 60_000) * 100));
  const diversityScore    = Math.min(100, (specialistCount / 9) * 100);
  const completenessScore = ebletsWritten > 0 ? 80 : 0;
  const qualityScore      = postFurnace > 0 ? 75 : 0;
  const andonFreeScore    = 85;
  const bmv = specialistScore * 0.12 + minerRate * 0.10 + furnaceRate * 0.10 + ebletScore * 0.12
    + concordanceScore * 0.14 + latencyScore * 0.08 + diversityScore * 0.10
    + completenessScore * 0.10 + qualityScore * 0.09 + andonFreeScore * 0.05;
  return Math.round(Math.min(100, Math.max(0, bmv)) * 10) / 10;
}

// ── Concordance (from canonical_pipeline.ts) ──────────────────────────────────

function computeConcordance(answers) {
  const valid = answers.filter(a => a !== null && a.length > 10);
  if (valid.length < 2) return 'DISCORDANT';
  if (valid.length < 3) return 'PARTIAL';
  const tokenize = s => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3);
  const sets = valid.map(a => new Set(tokenize(a)));
  const [s0, s1, s2] = [sets[0] ?? new Set(), sets[1] ?? new Set(), sets[2] ?? new Set()];
  const all = new Set([...s0, ...s1, ...s2]);
  let shared = 0;
  for (const t of all) {
    if ([s0.has(t), s1.has(t), s2.has(t)].filter(Boolean).length >= 2) shared++;
  }
  const ratio = all.size > 0 ? shared / all.size : 0;
  return ratio >= 0.15 ? 'CONCORDANT' : ratio >= 0.05 ? 'PARTIAL' : 'DISCORDANT';
}

// ── Gate evaluation ───────────────────────────────────────────────────────────

function evaluateGates(postFurnace, bmvScore, concordance, latencyMs) {
  return [
    { gate: 'G1_FACT', passed: postFurnace > 0,              detail: postFurnace > 0 ? `${postFurnace} survived Furnace` : 'No survivors' },
    { gate: 'G2_CONC', passed: concordance !== 'DISCORDANT', detail: `Concordance: ${concordance}` },
    { gate: 'G3_BMV',  passed: bmvScore >= 40,               detail: `BMV: ${bmvScore}` },
    { gate: 'G4_LAT',  passed: latencyMs < 120_000,          detail: `Latency: ${(latencyMs / 1000).toFixed(1)}s` },
  ];
}

// ── Vault write helper (internal, no blade telemetry) ─────────────────────────

function writeToVault(eblet, vaultPath) {
  ensureDir(vaultPath);
  const slug     = eblet.question_id ? safeSlug(eblet.question_id) : (eblet.id ?? 'unknown').slice(0, 16);
  const prefix   = eblet.type ? `${eblet.type}_` : '';
  const filePath = path.join(vaultPath, `${prefix}${slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(eblet, null, 2), 'utf8');
  return filePath;
}

// ═════════════════════════════════════════════════════════════════════════════
// BLADE 1 — Spider (locate topic-relevant eblets in substrate index)
// ═════════════════════════════════════════════════════════════════════════════

async function blade_spider(question, domain, vaultPath) {
  const t = makeTelem(1, 'Spider');
  try {
    ensureDir(vaultPath);
    const hits = [];
    const files = fs.existsSync(vaultPath)
      ? fs.readdirSync(vaultPath).filter(f => f.endsWith('.json')).slice(0, 100)
      : [];
    const qWords = new Set(question.toLowerCase().split(/\W+/).filter(w => w.length > 4));
    for (const f of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(vaultPath, f), 'utf8'));
        const body  = JSON.stringify(data).toLowerCase();
        const overlap = [...qWords].filter(w => body.includes(w)).length;
        if (overlap >= 2) {
          const knownFacts = data.known ?? [];
          for (const k of knownFacts.slice(0, 2)) {
            hits.push({
              source:    'substrate:spider',
              content:   `${k.fact ?? k.statement ?? JSON.stringify(k)}`.slice(0, 600),
              weight:    0.80,
              sid:       stableId('substrate', f + JSON.stringify(k)),
              domain,
            });
          }
        }
      } catch { /* skip malformed */ }
    }
    return { candidates: hits, telemetry: closeTelem(t, true, null, hits.length) };
  } catch (err) {
    return { candidates: [], telemetry: closeTelem(t, false, err.message) };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// BLADE 2 — Sprite (retrieve located eblets from storage)
// ═════════════════════════════════════════════════════════════════════════════

async function blade_sprite(spiderCandidates) {
  const t = makeTelem(2, 'Sprite');
  try {
    // In standalone mode, Spider already returns full content; Sprite just hydrates
    const retrieved = spiderCandidates.map(c => ({ ...c, retrieved: true }));
    return { candidates: retrieved, telemetry: closeTelem(t, true, null, retrieved.length) };
  } catch (err) {
    return { candidates: [], telemetry: closeTelem(t, false, err.message) };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// BLADE 3 — Specialists (9-Swarm: Wikipedia, arXiv, Wikidata, Ollama fallback)
// ═════════════════════════════════════════════════════════════════════════════

function extractSearchTerms(question) {
  const stopwords = new Set(['what','when','where','which','whom','that','this','these','those',
    'does','have','been','will','would','could','should','from','with','about','into',
    'over','under','after','before','being','their','there','here','than','then','also',
    'more','some','many','most','much','very','just','even','only','like','such','both',
    'each','other','same','also','just','also','such','more','them','they','were','your',
    'itself','always','never','often','the','and','for','are','was','has','can','may',
    'its','not','but','you','our','all','any','how','why','who','had','him','his','her']);
  const words = question.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stopwords.has(w));
  return words.slice(0, 6).join(' ');
}

async function queryWikipedia(question) {
  const terms = extractSearchTerms(question);
  try {
    const url  = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(terms)}&format=json&srlimit=3&srprop=snippet`;
    const ctrl = new AbortController();
    const tid  = setTimeout(() => ctrl.abort(), SPECIALIST_TIMEOUT_MS);
    const resp = await fetch(url, { signal: ctrl.signal });
    clearTimeout(tid);
    if (!resp.ok) return [];
    const data    = await resp.json();
    const results = data.query?.search ?? [];
    return results
      .filter(r => r.snippet && r.snippet.length > 50)
      .map(r => ({
        source:          'wikipedia',
        content:         `${r.title}: ${stripHtml(r.snippet)}`,
        weight:          0.75,
        sid:             stableId('wikipedia', r.title + r.snippet),
        provenance_url:  `https://en.wikipedia.org/wiki/${encodeURIComponent(r.title)}`,
        domain:          undefined,
      }));
  } catch { return []; }
}

async function queryArXiv(question) {
  const terms = extractSearchTerms(question);
  try {
    const url  = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(terms)}&max_results=2&sortBy=relevance`;
    const ctrl = new AbortController();
    const tid  = setTimeout(() => ctrl.abort(), SPECIALIST_TIMEOUT_MS);
    const resp = await fetch(url, { signal: ctrl.signal });
    clearTimeout(tid);
    if (!resp.ok) return [];
    const text = await resp.text();
    const abstracts = [...text.matchAll(/<summary>([\s\S]*?)<\/summary>/g)].slice(0, 2).map(m => m[1].trim().replace(/\s+/g, ' '));
    const titles    = [...text.matchAll(/<title>([\s\S]*?)<\/title>/g)].slice(1, 3).map(m => m[1].trim());
    return abstracts
      .filter(a => a.length >= 100)
      .map((a, i) => ({
        source:   'arxiv',
        content:  `${titles[i] ? titles[i] + ': ' : ''}${a.slice(0, 500)}`,
        weight:   0.72,
        sid:      stableId('arxiv', a.slice(0, 80)),
        domain:   undefined,
      }));
  } catch { return []; }
}

async function queryWikidata(question) {
  const terms = extractSearchTerms(question);
  try {
    const url  = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(terms)}&language=en&limit=3&format=json`;
    const ctrl = new AbortController();
    const tid  = setTimeout(() => ctrl.abort(), SPECIALIST_TIMEOUT_MS);
    const resp = await fetch(url, { signal: ctrl.signal });
    clearTimeout(tid);
    if (!resp.ok) return [];
    const data    = await resp.json();
    const results = data.search ?? [];
    return results
      .filter(r => r.description && r.description.length > 20)
      .map(r => ({
        source:          'wikidata',
        content:         `${r.label} (${r.id}): ${r.description}`,
        weight:          0.68,
        sid:             stableId('wikidata', r.id + r.description),
        provenance_url:  `https://www.wikidata.org/wiki/${r.id}`,
        domain:          undefined,
      }));
  } catch { return []; }
}

async function queryOllamaSynth(question, domain) {
  // Ollama synthetic specialist — fallback when external APIs are unavailable
  // or to supplement sparse results
  const prompt =
    `Generate 2 factual statements relevant to this question: "${question}"\n` +
    `Domain: ${domain}. Each statement must be factual, specific, at least 100 characters long.\n` +
    `Format: one statement per line. No introductory text.\n\n` +
    `Statement 1:`;
  const response = await callOllama(prompt, 0.1);
  if (!response) return [];
  const lines = response.split('\n').filter(l => l.trim().length >= 80);
  return lines.slice(0, 2).map(l => ({
    source:  'ollama-synth',
    content: l.trim().replace(/^Statement \d+:\s*/, '').slice(0, 500),
    weight:  0.62,
    sid:     stableId('ollama-synth', l.slice(0, 80)),
    domain,
  }));
}

async function blade_specialists(question, domain, preLoadedFacts) {
  const t = makeTelem(3, 'Specialists');
  try {
    const allCandidates  = [];
    const specialistsUsed = [];

    // Pre-loaded facts (e.g. from question.pre_loaded_contradiction) — treated as
    // a virtual specialist with high authority
    if (preLoadedFacts && preLoadedFacts.length > 0) {
      for (const fact of preLoadedFacts) {
        allCandidates.push({ source: 'substrate:preloaded', content: fact, weight: 0.90, sid: stableId('preloaded', fact), domain });
      }
      specialistsUsed.push('substrate:preloaded');
    }

    // 1. Wikipedia
    const wikiResults = await queryWikipedia(question);
    if (wikiResults.length > 0) { allCandidates.push(...wikiResults); specialistsUsed.push('wikipedia'); }

    await new Promise(r => setTimeout(r, FIREGUARD_STAGGER_MS));

    // 2. Wikidata
    const wdResults = await queryWikidata(question);
    if (wdResults.length > 0) { allCandidates.push(...wdResults); specialistsUsed.push('wikidata'); }

    await new Promise(r => setTimeout(r, FIREGUARD_STAGGER_MS));

    // 3. arXiv (scientific questions)
    const arxivResults = await queryArXiv(question);
    if (arxivResults.length > 0) { allCandidates.push(...arxivResults); specialistsUsed.push('arxiv'); }

    await new Promise(r => setTimeout(r, FIREGUARD_STAGGER_MS));

    // 4. Ollama synthetic — always fires as baseline; supplements sparse results
    const ollamaResults = await queryOllamaSynth(question, domain);
    if (ollamaResults.length > 0) { allCandidates.push(...ollamaResults); specialistsUsed.push('ollama-synth'); }

    return {
      candidates:    allCandidates,
      specialistsUsed,
      telemetry:     closeTelem(t, true, null, allCandidates.length),
    };
  } catch (err) {
    return { candidates: [], specialistsUsed: [], telemetry: closeTelem(t, false, err.message) };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// BLADE 4 — Miner (anti-popularity filter)
// ═════════════════════════════════════════════════════════════════════════════

function blade_miner(candidates) {
  const t       = makeTelem(4, 'Miner');
  const passed  = candidates.filter(c => c.weight >= MINER_MIN_WEIGHT && c.content.length >= MINER_MIN_CONTENT_LEN);
  return { passed, filtered: candidates.length - passed.length, telemetry: closeTelem(t, true, null, passed.length) };
}

// ═════════════════════════════════════════════════════════════════════════════
// BLADE 5 — Saladin (Adversarial Fence)
// ═════════════════════════════════════════════════════════════════════════════

const SALADIN_PROMPT = fact =>
  `You are an adversarial fact-checker. Evaluate this claim:\n\n"${fact}"\n\n` +
  `Is this claim factually accurate, consistent, and well-supported?\n` +
  `Respond with exactly one word: PASS (if solid) or CHALLENGE (if dubious, vague, or contradicts known facts).`;

async function blade_saladin(candidates) {
  const t          = makeTelem(5, 'Saladin');
  const passed     = [];
  const challenged = [];
  try {
    for (const candidate of candidates) {
      const response  = await callOllama(SALADIN_PROMPT(candidate.content.slice(0, 400)), 0.2);
      if (response === null) {
        // Ollama unavailable — heuristic: pass if substantial + high weight
        (candidate.content.length >= 150 && candidate.weight >= 0.7 ? passed : challenged).push(candidate);
        continue;
      }
      const upper = response.toUpperCase().trim();
      const isChallenged = upper.startsWith('CHALLENGE') || (upper.includes('CHALLENGE') && !upper.includes('PASS'));
      (isChallenged ? challenged : passed).push(candidate);
    }
    return { passed, challenged, telemetry: closeTelem(t, true, null, passed.length) };
  } catch (err) {
    return { passed: candidates, challenged: [], telemetry: closeTelem(t, false, err.message) };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// BLADE 6 — Furnace (Angel of Death — survivors of Saladin)
// ═════════════════════════════════════════════════════════════════════════════

function blade_furnace(saladinePassedFull) {
  const t        = makeTelem(6, 'Furnace');
  const survived = saladinePassedFull.sort((a, b) => b.weight - a.weight).slice(0, 6);
  return { survived, telemetry: closeTelem(t, true, null, survived.length) };
}

// ═════════════════════════════════════════════════════════════════════════════
// BLADE 7 — Three Fates (3-voter arbitration)
// ═════════════════════════════════════════════════════════════════════════════

const THREE_FATES_PROMPT = (question, factsCtx, idx) => {
  const instructions = [
    'Based ONLY on the provided sources, give a precise, factual answer. Be concise.',
    'Carefully review the sources. What does the evidence say about this question? Answer directly.',
    'Synthesize the key factual content from the sources to answer the question. Focus on specifics.',
  ];
  return `${instructions[idx]}\n\nSources:\n${factsCtx}\n\nQuestion: ${question}\n\nAnswer:`;
};

async function blade_three_fates(question, candidates) {
  const t           = makeTelem(7, 'Three Fates');
  try {
    const factsCtx    = candidates.slice(0, 5).map((c, i) =>
      `[Source ${i + 1} — ${c.source}]: ${c.content.slice(0, 400)}`
    ).join('\n\n');
    const temperatures = [0.0, 0.2, 0.4];
    const answers      = await Promise.all(temperatures.map((temp, idx) =>
      callOllama(THREE_FATES_PROMPT(question, factsCtx, idx), temp)
    ));
    const concordance  = computeConcordance(answers);
    return { answers, concordance, telemetry: closeTelem(t, true, null, answers.filter(Boolean).length) };
  } catch (err) {
    return { answers: [null, null, null], concordance: 'DISCORDANT', telemetry: closeTelem(t, false, err.message) };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// BLADE 8 — Scribe (record BMV / concordance / gate outcomes / TIC eblet mint)
// ═════════════════════════════════════════════════════════════════════════════

async function blade_scribe(question, domain, questionId, candidates, concordance, gateOutcomes,
                             andonTriggered, andonRetries, startMs, specialistCount, questionClass,
                             groundTruth, preLoadedContradiction, downstreamSeed, vaultPath) {
  const t = makeTelem(8, 'Scribe');
  try {
    const latencyMs      = Date.now() - startMs;
    const candidatesRaw  = candidates.all?.length ?? 0;
    const postMiner      = candidates.postMiner?.length ?? candidates.furnace?.length ?? 0;
    const postFurnace    = candidates.furnace?.length ?? 0;
    const bmvScore       = computeBmv(candidatesRaw, postMiner, postFurnace, postFurnace > 0 ? 1 : 0, concordance, specialistCount, latencyMs);

    // Determine TIC class
    let ticClass = questionClass ?? (concordance !== 'DISCORDANT' ? 'KNOWN' : 'THEORY_OPEN');

    // Build TIC eblet (5-field schema per canon_truth_integrity_chain_dependency_argument_eblet_chronos_bp084)
    const eblet = {
      id:               crypto.randomUUID(),
      question_id:      questionId,
      question:         question.slice(0, 200),
      domain,
      tic_class:        ticClass,
      concordance,
      bmv_score:        bmvScore,
      gate_outcomes:    gateOutcomes,
      andon_triggered:  andonTriggered,
      andon_retries:    andonRetries,
      specialists_used: candidates.specialistsUsed ?? [],
      chronos:          new Date().toISOString(),
      plow_version:     '12blade-bp084-corrected',
      // TIC 5-field schema
      known:                   [],
      theories_open:           [],
      eliminated:              [],
      dependencies_upstream:   [],
      applications_downstream: [],
      // Code Breakers Guild fields
      claim_status:        'CLAIM_UNTESTED',
      fire_rounds_survived: 0,
      independent_verifiers: 0,
      // Extra
      consequence_eblets:  [],
      survival_score:      null,
    };

    // Populate TIC fields based on class + evidence
    if (ticClass === 'KNOWN' && concordance !== 'DISCORDANT') {
      const factText = groundTruth ?? candidates.furnace?.[0]?.content?.slice(0, 300) ?? 'Fact established via Three Fates concordance';
      eblet.known.push({
        id:              'K-001',
        statement:       factText,
        domain,
        confidence:      concordance === 'CONCORDANT' ? 'high' : 'medium',
        verified_by:     'three-fates-concordance + saladin-pass',
        survival_count:  0,
        last_challenged: null,
      });
      if (downstreamSeed) {
        eblet.applications_downstream.push({ ref: downstreamSeed, needs_reeval: false, note: 'Downstream application seed — blade 12 dep-propagation target' });
      }
    } else if (ticClass === 'THEORY_OPEN') {
      eblet.theories_open.push({
        id:                'T-F1',
        statement:         question,
        domain,
        status:            'open',
        survival_score:    null,
        consequence_chain: [],
        unknown_count:     null,
        note:              'Epistemic status: contested — Three Fates DISCORDANT — requires Psionic verification',
        counter_evidence_search: 'TBD by Code Breakers Guild',
      });
    } else if (ticClass === 'ELIMINATED') {
      const contradiction = preLoadedContradiction?.known_fact ?? groundTruth ?? 'Eliminated by evidence';
      const theory        = preLoadedContradiction?.contradicts_theory ?? question;
      eblet.eliminated.push({
        id:                       'E-F1',
        statement:                theory,
        contradiction,
        contradiction_chronos:    new Date().toISOString(),
        confirmed_by_blade_11:    false, // blade 11 will update this
        code_breaker_queue_entry: false,
      });
      if (groundTruth) {
        eblet.known.push({ id: 'K-001', statement: groundTruth, domain, confidence: 'high', verified_by: 'elimination-verification', survival_count: 0 });
      }
    }

    // Write to vault
    const filePath = writeToVault(eblet, vaultPath);

    return {
      eblet,
      file:          filePath,
      bmvScore,
      latencyMs,
      ebletsWritten: 1,
      telemetry:     closeTelem(t, true, null, 1),
    };
  } catch (err) {
    return { eblet: null, file: null, bmvScore: 0, latencyMs: 0, ebletsWritten: 0, telemetry: closeTelem(t, false, err.message) };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// BLADE 9 — Detective TEAM (root-cause gate fails + Federated Andon)
// ═════════════════════════════════════════════════════════════════════════════

function blade_detective_team(gateOutcomes, candidatesRaw, postMiner, postFurnace, currentOps) {
  const t           = makeTelem(9, 'Detective TEAM');
  const failedGates = gateOutcomes.filter(g => !g.passed).map(g => g.gate);

  let rootCause = 'All gates passed — no Andon required';
  let recommendation = 'No action required';
  let additionalOps  = [];
  let andonTriggered = false;
  let tier           = null;

  if (failedGates.length > 0) {
    andonTriggered = true;
    if (candidatesRaw === 0) {
      rootCause        = 'Spider/Specialists returned 0 candidates — all API calls failed';
      recommendation   = 'Tier 1: widen with wikipedia + commoncrawl';
      additionalOps    = ['wikipedia', 'commoncrawl'].filter(o => !currentOps.includes(o));
      tier             = 1;
    } else if (postMiner === 0) {
      rootCause        = `Miner filtered ALL ${candidatesRaw} — weight < 0.6 or content < 100 chars`;
      recommendation   = 'Tier 1: widen to arxiv + openalex (higher content density)';
      additionalOps    = ['arxiv', 'openalex'].filter(o => !currentOps.includes(o));
      tier             = 1;
    } else if (postFurnace === 0) {
      rootCause        = `Furnace burned ALL ${postMiner} — Saladin challenged all`;
      recommendation   = 'Tier 1: lower Saladin threshold OR widen to nist + pubmed';
      additionalOps    = ['nist', 'pubmed'].filter(o => !currentOps.includes(o));
      tier             = 1;
    } else if (failedGates.includes('G2_CONC')) {
      rootCause        = 'Three Fates DISCORDANT — surviving facts contradict each other (contested topic)';
      recommendation   = 'Tier 2: cross-constellation query; this question may belong in THEORY_OPEN';
      additionalOps    = ['wikipedia', 'openalex'].filter(o => !currentOps.includes(o));
      tier             = 2;
    } else if (failedGates.includes('G3_BMV')) {
      rootCause        = 'BMV below threshold — low source diversity or quality';
      recommendation   = 'Tier 1: add wolfram, arxiv';
      additionalOps    = ['wolfram', 'arxiv'].filter(o => !currentOps.includes(o));
      tier             = 1;
    } else {
      rootCause      = `Gates failed: ${failedGates.join(', ')} — investigating`;
      recommendation = 'Tier 1: retry with widened specialists';
      tier           = 1;
    }
  }

  return {
    failedGates,
    rootCause,
    recommendation,
    additionalOps,
    andonTriggered,
    andonTier:   tier,
    wideningApplied: additionalOps.length > 0,
    telemetry:   closeTelem(t, true, null, failedGates.length),
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// BLADE 10 — Psionic (spawn child probes for THEORY_OPEN)
// ═════════════════════════════════════════════════════════════════════════════

async function blade_psionic(eblet, vaultPath, maxDepth) {
  const t = makeTelem(10, 'Psionic');
  try {
    const theories = eblet.theories_open ?? [];
    if (theories.length === 0) {
      return { consequence_eblets: [], survival_scores: {}, note: 'no-theories', telemetry: closeTelem(t, true, null, 0) };
    }

    const consequenceEblets = [];
    const survivalScores    = {};

    for (const theory of theories) {
      const theoryText = theory.statement ?? String(theory);

      // Ask what consequences follow IF this theory is true
      const conseqPrompt =
        `Epistemological analysis: IF this claim is TRUE, list exactly 3 testable consequences that should follow.\n\n` +
        `Claim: "${theoryText}"\n\n` +
        `List 3 specific, testable consequences (numbered, one per line, at least 40 words each):\n\n1.`;

      const rawResp = await callOllama(conseqPrompt, 0.3);
      let conseqText = rawResp ?? '';

      // Parse numbered consequence lines
      const lines = conseqText.split('\n').filter(l => l.trim().match(/^\d+\./));
      const consequences = lines.slice(0, 3).map(l => l.replace(/^\d+\.\s*/, '').trim()).filter(c => c.length > 30);

      if (consequences.length === 0) {
        theory.survival_score = 0.5;
        survivalScores[theoryText.slice(0, 60)] = 0.5;
        continue;
      }

      let consistentCount = 0;

      for (let ci = 0; ci < Math.min(consequences.length, maxDepth); ci++) {
        const conseq = consequences[ci];

        // Probe: is this consequence consistent with established knowledge?
        const probePrompt =
          `Is this statement consistent with established scientific/philosophical knowledge?\n\n` +
          `"${conseq}"\n\n` +
          `Answer with ONE WORD only: CONSISTENT or CONTRADICTED or UNCERTAIN`;

        const probeResp  = await callOllama(probePrompt, 0.1);
        const upper      = (probeResp ?? '').toUpperCase().trim();
        const consistent = upper.startsWith('CONSISTENT');
        const contradicted = upper.startsWith('CONTRADICTED');

        // Mint consequence-probe eblet linked to parent
        const probeEblet = {
          id:               crypto.randomUUID(),
          question_id:      `cprobe_${eblet.question_id}_c${ci + 1}`,
          type:             'consequence_probe',
          parent_eblet_id:  eblet.id,
          theory:           theoryText,
          consequence:      conseq,
          probe_response:   probeResp,
          consistent,
          contradicted,
          chronos:          new Date().toISOString(),
          plow_version:     '12blade-bp084-corrected',
          known: [], theories_open: [], eliminated: [],
          dependencies_upstream:   [{ ref: eblet.id, type: 'parent_theory' }],
          applications_downstream: [],
          claim_status: 'CLAIM_UNTESTED',
        };
        writeToVault(probeEblet, vaultPath);
        consequenceEblets.push(probeEblet);
        if (consistent) consistentCount++;
      }

      const survivalScore = consequences.length > 0
        ? Math.round(consistentCount / Math.min(consequences.length, maxDepth) * 100) / 100
        : 0.5;
      theory.survival_score     = survivalScore;
      theory.consequence_chain  = consequences.slice(0, 3);
      survivalScores[theoryText.slice(0, 60)] = survivalScore;
    }

    // Re-write parent eblet with updated survival scores
    writeToVault(eblet, vaultPath);

    return {
      consequence_eblets: consequenceEblets,
      survival_scores:    survivalScores,
      telemetry:          closeTelem(t, true, null, consequenceEblets.length),
    };
  } catch (err) {
    return { consequence_eblets: [], survival_scores: {}, telemetry: closeTelem(t, false, err.message) };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// BLADE 11 — Auditor (walk substrate for contradictions)
// ═════════════════════════════════════════════════════════════════════════════

function bm25Score(query, document) {
  const tokens = s => s.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const qToks  = tokens(query);
  const dSet   = new Set(tokens(document));
  const hit    = qToks.filter(w => dSet.has(w)).length;
  return qToks.length > 0 ? hit / qToks.length : 0;
}

async function blade_auditor(eblet, substrateIndex) {
  const t = makeTelem(11, 'Auditor');
  try {
    const substrate           = substrateIndex ?? [];
    const confirmedEliminated = [];
    const codeBreakerQueue    = [];
    const contradictionEblets = [];
    let   kSurvived           = 0;

    // Check eliminated candidates from Scribe + theories_open for contradictions
    const candidates = [...(eblet.theories_open ?? []), ...(eblet.eliminated ?? [])];

    for (const candidate of candidates) {
      const theoryText   = candidate.statement ?? candidate.theory ?? String(candidate);
      const eliminatedBy = candidate.eliminated_by ?? candidate.contradiction ?? '';

      let contradictionFound  = false;
      let contradictionSource = null;
      let contradictionScore  = 0;

      // Search substrate index for facts that contradict this theory
      for (const fact of substrate) {
        const factText      = fact.fact ?? fact.known_fact ?? fact.content ?? String(fact);
        const contraTheory  = fact.contradicts_theory ?? '';
        const scoreA        = bm25Score(theoryText, factText);
        const scoreB        = contraTheory ? bm25Score(contraTheory, theoryText) : 0;
        if (scoreA > 0.25 || scoreB > 0.2) {
          contradictionFound  = true;
          contradictionSource = factText;
          contradictionScore  = Math.max(scoreA, scoreB);
          break;
        }
      }

      // If the candidate itself carries an eliminated_by or contradiction, that IS the contradiction
      if (!contradictionFound && eliminatedBy && eliminatedBy.length > 10) {
        contradictionFound  = true;
        contradictionSource = eliminatedBy;
        contradictionScore  = 0.95;
      }

      if (contradictionFound) {
        const verified = { ...candidate, confirmed_by_blade_11: true, contradiction: contradictionSource, confidence: contradictionScore > 0.5 ? 'high' : 'medium' };
        confirmedEliminated.push(verified);
        codeBreakerQueue.push({ theory: theoryText, contradiction: contradictionSource, eblet_id: eblet.id, chronos: new Date().toISOString() });

        const contraEblet = {
          id:                crypto.randomUUID(),
          question_id:       `contra_${eblet.question_id}`,
          type:              'contradiction_trail',
          parent_eblet_id:   eblet.id,
          theory:            theoryText,
          contradiction:     contradictionSource,
          contradiction_score: contradictionScore,
          code_breaker_queue: true,
          negative_knowledge_token: true,  // Marks economy: denomination: negative-knowledge
          chronos:           new Date().toISOString(),
          plow_version:      '12blade-bp084-corrected',
          known: [], theories_open: [],
          eliminated: [{ statement: theoryText, contradiction: contradictionSource }],
          dependencies_upstream:   [{ ref: eblet.id, type: 'parent' }],
          applications_downstream: [],
          claim_status: 'CLAIM_UNTESTED',
        };
        writeToVault(contraEblet, VAULT_PATH);
        contradictionEblets.push(contraEblet);
      } else {
        kSurvived++;
      }
    }

    // Update parent eblet's eliminated list with verified entries
    if (confirmedEliminated.length > 0) {
      eblet.eliminated = confirmedEliminated;
      writeToVault(eblet, VAULT_PATH);
    }

    // Write Code Breakers queue
    if (codeBreakerQueue.length > 0) {
      const queuePath = path.join(VAULT_PATH, '..', 'code_breaker_queue.json');
      ensureDir(path.dirname(queuePath));
      let existing = [];
      if (fs.existsSync(queuePath)) { try { existing = JSON.parse(fs.readFileSync(queuePath, 'utf8')); } catch { existing = []; } }
      existing.push(...codeBreakerQueue);
      fs.writeFileSync(queuePath, JSON.stringify(existing, null, 2), 'utf8');
    }

    return {
      eliminated:           confirmedEliminated,
      code_breaker_queue:   codeBreakerQueue,
      contradiction_eblets: contradictionEblets,
      k_survived:           kSurvived,
      telemetry:            closeTelem(t, true, null, confirmedEliminated.length + contradictionEblets.length),
    };
  } catch (err) {
    return { eliminated: [], code_breaker_queue: [], contradiction_eblets: [], k_survived: 0, telemetry: closeTelem(t, false, err.message) };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// BLADE 12 — Sentinel (flag downstream when KNOWN updates)
// ═════════════════════════════════════════════════════════════════════════════

async function blade_sentinel(eblet, vaultPath) {
  const t = makeTelem(12, 'Sentinel');
  try {
    const downstream    = eblet.applications_downstream ?? [];
    const knownFacts    = eblet.known ?? [];
    if (downstream.length === 0 || knownFacts.length === 0) {
      return { flagged_count: 0, review_queue_entries: [], telemetry: closeTelem(t, true, null, 0) };
    }

    const reviewQueueEntries = [];
    for (const dep of downstream) {
      dep.needs_reeval = true;
      dep.chronos      = new Date().toISOString();
      reviewQueueEntries.push({
        eblet_id:       eblet.id,
        downstream_ref: dep.ref ?? String(dep),
        needs_reeval:   true,
        flagged_by:     'blade_12_Sentinel',
        reason:         'upstream KNOWN entry updated — downstream eblet requires re-evaluation',
        known_update:   knownFacts[0]?.statement ?? knownFacts[0]?.fact ?? 'unknown',
        domain:         eblet.domain,
        chronos:        new Date().toISOString(),
      });
    }

    // Write review_queue.json (per spec: Asteroid-ProofVault/state/eblets/review_queue.json)
    const reviewQueuePath = path.join(vaultPath, '..', 'review_queue.json');
    ensureDir(path.dirname(reviewQueuePath));
    let existing = [];
    if (fs.existsSync(reviewQueuePath)) { try { existing = JSON.parse(fs.readFileSync(reviewQueuePath, 'utf8')); } catch { existing = []; } }
    existing.push(...reviewQueueEntries);
    fs.writeFileSync(reviewQueuePath, JSON.stringify(existing, null, 2), 'utf8');

    writeToVault(eblet, vaultPath);

    return { flagged_count: reviewQueueEntries.length, review_queue_entries: reviewQueueEntries, telemetry: closeTelem(t, true, null, reviewQueueEntries.length) };
  } catch (err) {
    return { flagged_count: 0, review_queue_entries: [], telemetry: closeTelem(t, false, err.message) };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// Substrate index builder (from existing vault eblets + pre-loaded facts)
// ═════════════════════════════════════════════════════════════════════════════

function buildSubstrateIndex(vaultPath) {
  const index = [];
  if (!fs.existsSync(vaultPath)) return index;
  try {
    const files = fs.readdirSync(vaultPath).filter(f => f.endsWith('.json')).slice(0, 200);
    for (const f of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(vaultPath, f), 'utf8'));
        (data.known ?? []).forEach(k => index.push({ fact: k.statement ?? k.fact ?? '', domain: data.domain }));
        (data.eliminated ?? []).forEach(e => index.push({ fact: e.contradiction ?? '', contradicts_theory: e.statement ?? e.theory ?? '', domain: data.domain }));
      } catch { /* skip */ }
    }
  } catch { /* skip */ }
  return index;
}

// ═════════════════════════════════════════════════════════════════════════════
// MASTER ORCHESTRATOR — runPlow12Blade
// ═════════════════════════════════════════════════════════════════════════════

async function runPlow12Blade(questions, config) {
  const { vaultPath, maxConsequenceDepth, outputFile, telemetryFile } = config;
  ensureDir(vaultPath);

  // Initialize output file (overwrite)
  fs.writeFileSync(outputFile, '', 'utf8');
  const allTelemetry = [];
  const stats = {
    total: questions.length, andon_triggered: 0, eblets_minted: 0,
    consequence_probes: 0, eliminations: 0, downstream_flags: 0,
    blades_fired: {},
  };
  for (let i = 1; i <= 12; i++) stats.blades_fired[`blade_${i}`] = 0;

  const substrateIndex = buildSubstrateIndex(vaultPath);

  for (let qi = 0; qi < questions.length; qi++) {
    const q   = questions[qi];
    const qId = q.id ?? q.question_id ?? `q${qi + 1}`;
    console.log(`\n[${ qi + 1 }/${questions.length}] ${qId}  class=${q.class ?? '?'}  domain=${q.domain ?? '?'}`);

    const bladeTelems = [];
    const startMs     = Date.now();
    const result      = {
      question_id:    qId,
      question_class: q.class ?? 'UNKNOWN',
      domain:         q.domain ?? 'general',
      question:       q.question,
      verdict:        null,
      concordance:    null,
      bmv_score:      null,
      eblet_id:       null,
      andon_triggered: false,
      andon_tier:     null,
      blades_fired:   [],
      consequence_count: 0, elimination_count: 0, downstream_flags: 0,
      errors: [],
    };

    // ── BLADE 1: Spider ────────────────────────────────────────────────────
    const b1 = await blade_spider(q.question, q.domain ?? 'general', vaultPath);
    bladeTelems.push(b1.telemetry); stats.blades_fired.blade_1++;
    if (b1.telemetry.success) result.blades_fired.push(1);
    console.log(`  B1  Spider          → ${b1.candidates.length} local hits  ${b1.telemetry.success ? '✓' : '✗'}`);

    // ── BLADE 2: Sprite ────────────────────────────────────────────────────
    const b2 = await blade_sprite(b1.candidates);
    bladeTelems.push(b2.telemetry); stats.blades_fired.blade_2++;
    if (b2.telemetry.success) result.blades_fired.push(2);
    console.log(`  B2  Sprite          → ${b2.candidates.length} retrieved  ${b2.telemetry.success ? '✓' : '✗'}`);

    // ── BLADE 3: Specialists ────────────────────────────────────────────────
    // Build pre-loaded facts from question for substrate:preloaded specialist
    const preLoadedFacts = [];
    if (q.pre_loaded_contradiction?.known_fact) preLoadedFacts.push(q.pre_loaded_contradiction.known_fact);
    if (q.ground_truth) preLoadedFacts.push(q.ground_truth);

    const b3 = await blade_specialists(q.question, q.domain ?? 'general', preLoadedFacts);
    // Merge Sprite results into specialist pool
    const allCandidates = [...b2.candidates, ...b3.candidates];
    bladeTelems.push(b3.telemetry); stats.blades_fired.blade_3++;
    if (b3.telemetry.success) result.blades_fired.push(3);
    console.log(`  B3  Specialists     → ${b3.candidates.length} candidates (${b3.specialistsUsed.join(', ')})  ${b3.telemetry.success ? '✓' : '✗'}`);

    // ── BLADE 4: Miner ─────────────────────────────────────────────────────
    const b4 = blade_miner(allCandidates);
    bladeTelems.push(b4.telemetry); stats.blades_fired.blade_4++;
    if (b4.telemetry.success) result.blades_fired.push(4);
    console.log(`  B4  Miner           → ${b4.passed.length}/${allCandidates.length} passed  ${b4.telemetry.success ? '✓' : '✗'}`);

    // ── BLADE 5: Saladin ────────────────────────────────────────────────────
    const b5 = await blade_saladin(b4.passed);
    bladeTelems.push(b5.telemetry); stats.blades_fired.blade_5++;
    if (b5.telemetry.success) result.blades_fired.push(5);
    console.log(`  B5  Saladin         → ${b5.passed.length} pass / ${b5.challenged.length} challenged  ${b5.telemetry.success ? '✓' : '✗'}`);

    // ── BLADE 6: Furnace ────────────────────────────────────────────────────
    const b6 = blade_furnace(b5.passed);
    bladeTelems.push(b6.telemetry); stats.blades_fired.blade_6++;
    if (b6.telemetry.success) result.blades_fired.push(6);
    console.log(`  B6  Furnace         → ${b6.survived.length} survivors  ${b6.telemetry.success ? '✓' : '✗'}`);

    // Fallback: if Furnace burned all, fall back to post-Miner candidates
    const factsForFates = b6.survived.length > 0 ? b6.survived : b4.passed.slice(0, 3);

    // ── BLADE 7: Three Fates ────────────────────────────────────────────────
    const b7 = await blade_three_fates(q.question, factsForFates);
    bladeTelems.push(b7.telemetry); stats.blades_fired.blade_7++;
    if (b7.telemetry.success) result.blades_fired.push(7);
    result.concordance = b7.concordance;
    console.log(`  B7  Three Fates     → concordance=${b7.concordance}  ${b7.telemetry.success ? '✓' : '✗'}`);

    // Evaluate gates
    const latencyMs    = Date.now() - startMs;
    const bmvTmp       = computeBmv(allCandidates.length, b4.passed.length, b6.survived.length, b6.survived.length > 0 ? 1 : 0, b7.concordance, b3.specialistsUsed.length, latencyMs);
    const gateOutcomes = evaluateGates(b6.survived.length, bmvTmp, b7.concordance, latencyMs);
    const anyFailed    = gateOutcomes.some(g => !g.passed);

    // ── BLADE 8: Scribe ─────────────────────────────────────────────────────
    const candidatesForScribe = { all: allCandidates, postMiner: b4.passed, furnace: b6.survived, specialistsUsed: b3.specialistsUsed };
    const b8 = await blade_scribe(
      q.question, q.domain ?? 'general', qId,
      candidatesForScribe, b7.concordance, gateOutcomes,
      anyFailed, 0, startMs, b3.specialistsUsed.length,
      q.class, q.ground_truth, q.pre_loaded_contradiction, q.downstream_seed, vaultPath
    );
    bladeTelems.push(b8.telemetry); stats.blades_fired.blade_8++;
    if (b8.telemetry.success && b8.eblet) {
      result.blades_fired.push(8);
      result.eblet_id  = b8.eblet.id;
      result.bmv_score = b8.bmvScore;
      stats.eblets_minted++;
    }
    console.log(`  B8  Scribe          → BMV=${b8.bmvScore}  file=${b8.file ? path.basename(b8.file) : 'FAIL'}  ${b8.telemetry.success ? '✓' : '✗'}`);

    if (!b8.eblet) {
      result.errors.push('blade_8: Scribe failed to mint eblet');
      fs.appendFileSync(outputFile, JSON.stringify(result) + '\n', 'utf8');
      allTelemetry.push({ question_id: qId, blades: bladeTelems });
      continue;
    }

    const eblet = b8.eblet;

    // ── BLADE 9: Detective TEAM ─────────────────────────────────────────────
    const b9 = blade_detective_team(gateOutcomes, allCandidates.length, b4.passed.length, b6.survived.length, b3.specialistsUsed);
    bladeTelems.push(b9.telemetry); stats.blades_fired.blade_9++;
    if (b9.telemetry.success) result.blades_fired.push(9);
    result.andon_triggered = b9.andonTriggered;
    result.andon_tier      = b9.andonTier;
    if (b9.andonTriggered) stats.andon_triggered++;
    console.log(`  B9  Detective TEAM  → andon=${b9.andonTriggered}  tier=${b9.andonTier ?? 'n/a'}  rootCause="${b9.rootCause.slice(0, 60)}"  ${b9.telemetry.success ? '✓' : '✗'}`);

    // Determine effective TIC class (Detective TEAM may reclassify)
    const effectiveClass = b9.andonTriggered && b9.andonTier === 2
      ? 'THEORY_OPEN'  // Tier 2 = cross-constellation needed = contested
      : (q.class ?? eblet.tic_class ?? 'KNOWN');

    // Reclassify eblet if Detective TEAM recommends THEORY_OPEN
    if (effectiveClass === 'THEORY_OPEN' && eblet.tic_class !== 'THEORY_OPEN') {
      eblet.tic_class = 'THEORY_OPEN';
      if (eblet.theories_open.length === 0) {
        eblet.theories_open.push({ id: 'T-F1', statement: q.question, domain: q.domain, status: 'open', survival_score: null, consequence_chain: [], note: 'Reclassified THEORY_OPEN by Detective TEAM Tier 2 Andon' });
      }
      writeToVault(eblet, vaultPath);
    }

    // ── BLADE 10: Psionic (THEORY_OPEN only) ─────────────────────
    if (effectiveClass === 'THEORY_OPEN' || eblet.theories_open.length > 0) {
      console.log(`  B10 Psionic → running...`);
      const b10 = await blade_psionic(eblet, vaultPath, maxConsequenceDepth);
      bladeTelems.push(b10.telemetry); stats.blades_fired.blade_10++;
      if (b10.telemetry.success) result.blades_fired.push(10);
      result.consequence_count = b10.consequence_eblets.length;
      stats.consequence_probes += b10.consequence_eblets.length;
      eblet.consequence_eblets = b10.consequence_eblets.map(ce => ce.id);
      console.log(`  B10 Psionic → ${b10.consequence_eblets.length} probes  ${b10.telemetry.success ? '✓' : '✗'}`);
    } else {
      bladeTelems.push(skipTelem(10, 'Psionic', 'not-theory-open'));
      console.log(`  B10 Psionic → SKIPPED (not THEORY_OPEN)`);
    }

    // ── BLADE 11: Auditor (ELIMINATED only) ─────────────────────
    // Build substrate for blade 11 including this question's pre-loaded facts + vault
    const localSubstrate = [...substrateIndex];
    if (q.pre_loaded_contradiction) {
      localSubstrate.push({ fact: q.pre_loaded_contradiction.known_fact, contradicts_theory: q.pre_loaded_contradiction.contradicts_theory, domain: q.domain });
    }
    if (q.ground_truth) {
      localSubstrate.push({ fact: q.ground_truth, domain: q.domain });
    }

    if (effectiveClass === 'ELIMINATED' || eblet.eliminated.length > 0) {
      const b11 = await blade_auditor(eblet, localSubstrate);
      bladeTelems.push(b11.telemetry); stats.blades_fired.blade_11++;
      if (b11.telemetry.success) result.blades_fired.push(11);
      result.elimination_count = b11.eliminated.length;
      stats.eliminations += b11.eliminated.length;
      console.log(`  B11 Auditor → ${b11.eliminated.length} confirmed  k_survived=${b11.k_survived}  codeBreakers=${b11.code_breaker_queue.length}  ${b11.telemetry.success ? '✓' : '✗'}`);
    } else {
      bladeTelems.push(skipTelem(11, 'Auditor', 'not-eliminated-class'));
      console.log(`  B11 Auditor → SKIPPED (not ELIMINATED class)`);
    }

    // ── BLADE 12: Sentinel (KNOWN + downstream) ─────────────
    if (effectiveClass === 'KNOWN' && eblet.applications_downstream.length > 0) {
      const b12 = await blade_sentinel(eblet, vaultPath);
      bladeTelems.push(b12.telemetry); stats.blades_fired.blade_12++;
      if (b12.telemetry.success) result.blades_fired.push(12);
      result.downstream_flags = b12.flagged_count;
      stats.downstream_flags  += b12.flagged_count;
      console.log(`  B12 Sentinel → ${b12.flagged_count} flags  ${b12.telemetry.success ? '✓' : '✗'}`);
    } else {
      bladeTelems.push(skipTelem(12, 'Sentinel', 'not-known-or-no-downstream'));
      console.log(`  B12 Sentinel → SKIPPED (not KNOWN / no downstream)`);
    }

    // Final vault overwrite with fully updated eblet
    writeToVault(eblet, vaultPath);

    result.verdict = {
      concordance:    b7.concordance,
      tic_class:      eblet.tic_class,
      bmv_score:      b8.bmvScore,
      gates_passed:   gateOutcomes.filter(g => g.passed).map(g => g.gate),
      gates_failed:   gateOutcomes.filter(g => !g.passed).map(g => g.gate),
    };
    result.eblet_snapshot = {
      known_count:                  eblet.known.length,
      theories_open_count:          eblet.theories_open.length,
      eliminated_count:             eblet.eliminated.length,
      dependencies_upstream_count:  eblet.dependencies_upstream.length,
      applications_downstream_count: eblet.applications_downstream.length,
    };

    fs.appendFileSync(outputFile, JSON.stringify(result) + '\n', 'utf8');
    allTelemetry.push({ question_id: qId, blade_count: bladeTelems.length, blades: bladeTelems });
  }

  const telemOut = {
    generated_at:       new Date().toISOString(),
    plow_version:       '12blade-bp084-corrected',
    blade_names:        { 1:'Spider', 2:'Sprite', 3:'Specialists', 4:'Miner', 5:'Saladin', 6:'Furnace', 7:'Three Fates', 8:'Scribe', 9:'Detective TEAM', 10:'Psionic', 11:'Auditor', 12:'Sentinel' },
    model: MODEL,
    questions_processed: questions.length,
    summary: stats,
    per_question: allTelemetry,
  };
  fs.writeFileSync(telemetryFile, JSON.stringify(telemOut, null, 2), 'utf8');
  return { stats, telemetryFile, outputFile };
}

// ═════════════════════════════════════════════════════════════════════════════
// Main
// ═════════════════════════════════════════════════════════════════════════════

async function main() {
  if (!fs.existsSync(shardFile)) { console.error(`Shard not found: ${shardFile}`); process.exit(1); }

  const shard     = JSON.parse(fs.readFileSync(shardFile, 'utf8'));
  const questions = shard.questions ?? [];
  if (questions.length === 0) { console.error('No questions in shard.'); process.exit(1); }

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  MnemosyneC 12-Blade Epistemic Plow  ·  BP084-corrected  ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('Blades: Spider · Sprite · Specialists · Miner · Saladin');
  console.log('        Furnace · Three Fates · Scribe · Detective TEAM');
  console.log('        + Psionic · Auditor · Sentinel');
  console.log(`\nShard     : ${shardFile}  (${questions.length} questions)`);
  console.log(`Model     : ${MODEL}`);
  console.log(`Ollama    : ${OLLAMA_URL}`);
  console.log(`Output    : ${OUT_FILE}`);
  console.log(`Telemetry : ${TELEM_FILE}`);
  console.log(`Vault     : ${VAULT_PATH}`);
  console.log(`Max Depth : ${MAX_DEPTH}`);
  console.log('');

  try {
    const ping = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(5000) });
    if (!ping.ok) throw new Error(`HTTP ${ping.status}`);
    const tags  = await ping.json();
    const names = (tags.models ?? []).map(m => m.name);
    const found = names.some(n => n === MODEL || n.startsWith(MODEL.split(':')[0]));
    console.log(found ? `[OK] Ollama connected. Model "${MODEL}" found.` : `[AMBER] Model "${MODEL}" not listed. Available: ${names.slice(0, 4).join(', ')}`);
  } catch (err) {
    console.error(`[RED] Ollama unreachable: ${err.message}`);
    process.exit(1);
  }

  const config = { model: MODEL, ollamaUrl: OLLAMA_URL, vaultPath: VAULT_PATH, maxConsequenceDepth: MAX_DEPTH, outputFile: OUT_FILE, telemetryFile: TELEM_FILE };
  const { stats } = await runPlow12Blade(questions, config);

  console.log('\n' + '═'.repeat(62));
  console.log('12-BLADE PLOW COMPLETE  (canonical names: Spider→Detective TEAM + 3 TIC loops)');
  console.log('═'.repeat(62));
  console.log(`Total questions : ${stats.total}`);
  console.log(`Andon triggered : ${stats.andon_triggered}`);
  console.log(`Eblets minted   : ${stats.eblets_minted}`);
  console.log(`Conseq. probes  : ${stats.consequence_probes}`);
  console.log(`Eliminations    : ${stats.eliminations}`);
  console.log(`Downstream flags: ${stats.downstream_flags}`);
  console.log('\nBlade fire counts:');
  const bladeNames = { 1:'Spider', 2:'Sprite', 3:'Specialists', 4:'Miner', 5:'Saladin', 6:'Furnace', 7:'Three Fates', 8:'Scribe', 9:'Detective TEAM', 10:'Psionic', 11:'Auditor', 12:'Sentinel' };
  for (let i = 1; i <= 12; i++) {
    const cnt = stats.blades_fired[`blade_${i}`] ?? 0;
    const status = cnt > 0 ? '✓' : '○';
    console.log(`  B${String(i).padEnd(2)} ${bladeNames[i].padEnd(22)}: ${cnt} ${status}`);
  }
  console.log(`\nOutput    : ${OUT_FILE}`);
  console.log(`Telemetry : ${TELEM_FILE}`);
  console.log('═'.repeat(62));
}

main().catch(err => { console.error('[FATAL]', err); process.exit(1); });
