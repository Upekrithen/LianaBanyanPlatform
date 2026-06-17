#!/usr/bin/env node
/**
 * plow-cli-12blade.js — BP084 SEG-1
 * MnemosyneC 12-Blade Epistemic Plow
 * Node.js 18+ (built-in modules only, no npm install required)
 *
 * Usage:
 *   node plow-cli-12blade.js <shard.json> --model <model> --out <output.jsonl>
 *       --telemetry <telemetry.json> [--ollama http://localhost:11434]
 *       [--max-consequence-depth 3] [--vault <path>]
 *
 * Blades:
 *   1  blade_domain_split          — categorize into MMLU-Pro domain
 *   2  blade_question_fanout       — assemble prompt(s) for dispatch
 *   3  blade_model_dispatch        — call Ollama API
 *   4  blade_quarantine_check      — Andon-Cord self-policing
 *   5  blade_adjudicate            — judge correctness vs ground truth
 *   6  blade_eblet_mint            — mint TIC 5-field eblet
 *   7  blade_reputation_update     — update tier reputation
 *   8  blade_vault_write           — write eblet to vault
 *   9  blade_cross_domain_link     — emit cross-domain links
 *  10  blade_consequence_trace     — THEORY_OPEN consequence probing
 *  11  blade_elimination_verify    — ELIMINATED contradiction verification
 *  12  blade_dependency_propagate  — KNOWN downstream dependency flags
 */

'use strict';

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

// ── CLI Argument Parsing ──────────────────────────────────────────────────────

const argv = process.argv.slice(2);

function getArg(flag, def) {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] ?? def : def;
}

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

// Default vault: two levels up from tools/plow-cli/ → workspace root → Asteroid-ProofVault
const DEFAULT_VAULT = path.join(__dirname, '..', '..', 'Asteroid-ProofVault', 'state', 'eblets', 'active');
const VAULT_PATH = getArg('--vault', DEFAULT_VAULT);

const TIMEOUT_MS     = 120000;
const OPTION_LETTERS = 'ABCDEFGHIJ';

// ── Global reputation store (in-memory for this run) ─────────────────────────

const reputationStore = {};

// ─────────────────────────────────────────────────────────────────────────────
// Telemetry helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeTelemetry(bladeN) {
  return { blade: bladeN, start_ms: Date.now(), end_ms: null, success: false, error: null, downstream_count: 0 };
}

function closeTelemetry(t, success, error = null, downstream_count = 0) {
  t.end_ms = Date.now();
  t.success = success;
  t.error   = error;
  t.downstream_count = downstream_count;
  return t;
}

function skippedTelemetry(bladeN, reason) {
  return { blade: bladeN, start_ms: Date.now(), end_ms: Date.now(), success: true, error: null, downstream_count: 0, skipped: true, reason };
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function safeSlug(str) {
  return String(str ?? 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 60);
}

// Internal vault helper — no blade telemetry, used by blades 10/11 for child eblets
function writeToVault(eblet, vaultPath) {
  ensureDir(vaultPath);
  const qSlug  = eblet.question_id ? safeSlug(eblet.question_id) : (eblet.id ?? 'unknown').slice(0, 16);
  const prefix = eblet.type ? `${eblet.type}_` : '';
  const fileName = `${prefix}${qSlug}.json`;
  const filePath = path.join(vaultPath, fileName);
  fs.writeFileSync(filePath, JSON.stringify(eblet, null, 2), 'utf8');
  return filePath;
}

// ─────────────────────────────────────────────────────────────────────────────
// Answer parsing (shared by blades 4, 5, 10)
// ─────────────────────────────────────────────────────────────────────────────

function parseLetterFromResponse(responseText, numOptions) {
  if (!responseText) return null;
  const upper = responseText.trim().toUpperCase();

  const direct = upper.match(/^([A-J])\b/);
  if (direct && OPTION_LETTERS.indexOf(direct[1]) < numOptions) return direct[1];

  const prefix = upper.match(/(?:ANSWER\s*[:\s]+|THE\s+ANSWER\s+IS\s*)([A-J])\b/);
  if (prefix && OPTION_LETTERS.indexOf(prefix[1]) < numOptions) return prefix[1];

  if (upper.length <= 20) {
    const any = upper.match(/([A-J])/);
    if (any && OPTION_LETTERS.indexOf(any[1]) < numOptions) return any[1];
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Ollama raw caller (used by blades 3 and 10)
// ─────────────────────────────────────────────────────────────────────────────

async function callOllamaRaw(prompt, model, ollamaUrl, timeoutMs) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs ?? TIMEOUT_MS);
    const resp = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        options: { temperature: 0.0, num_predict: 2048 },
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      return { response: null, thinking: null, error: `HTTP ${resp.status}: ${body.slice(0, 120)}` };
    }
    const data = await resp.json();
    const content  = data.message?.content?.trim() ?? null;
    const thinking = data.message?.thinking?.trim() ?? null;
    // If content empty but thinking has an answer letter, extract it
    if ((!content || content === '') && thinking) {
      const tailMatch =
        thinking.match(/(?:answer\s+is|final\s+answer|therefore[,:]?\s+)[:\s]*([A-J])\b/i)
        ?? thinking.match(/\b([A-J])\s*(?:is\s+(?:correct|the\s+answer)|\.?\s*$)/i)
        ?? thinking.match(/answer[:\s]+([A-J])\b/i);
      if (tailMatch) return { response: tailMatch[1].toUpperCase(), thinking, error: null };
      const lone = thinking.slice(-100).match(/\b([A-J])\s*\.?\s*$/i);
      if (lone) return { response: lone[1].toUpperCase(), thinking, error: null };
      return { response: null, thinking, error: 'thinking-overflow' };
    }
    return { response: content, thinking, error: null };
  } catch (err) {
    return { response: null, thinking: null, error: err.message ?? String(err) };
  }
}

// Prompt builder for MCQ
function buildMCQPrompt(q) {
  const choices = q.choices ?? q.options ?? [];
  const opts     = choices.map((o, i) => `${OPTION_LETTERS[i]}. ${o}`).join('\n');
  const valid    = OPTION_LETTERS.slice(0, choices.length).split('').join(', ');
  return (
    `Answer this multiple-choice question. Your response must be EXACTLY ONE letter (${valid}) — nothing else.\n\n` +
    `Question: ${q.question}\n\n${opts}\n\nLetter:`
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// BLADE 1 — DOMAIN_SPLIT
// ═════════════════════════════════════════════════════════════════════════════

const DOMAIN_KEYWORDS = {
  math:        ['calcul','algebra','geometr','statistic','probabilit','theorem','equat','integral','derivative','proof'],
  chemistry:   ['element','compound','reaction','molecule','atom','bond','oxidation','acid','base','solut','boiling','melting'],
  physics:     ['force','energy','momentum','wave','quantum','relativity','light','electron','proton','gravity','velocity','faster','vacuum','speed'],
  biology:     ['cell','gene','dna','protein','evolut','organism','species','metabol','enzyme','tissue'],
  history:     ['war','century','empire','revolution','dynasty','president','battle','treaty','coloniz','ancient'],
  philosophy:  ['ethics','moral','consciousness','metaphysic','epistem','truth','existence','free will','mind','brain','solely'],
  law:         ['legal','statute','court','constitutional','liability','contract','tort','jurisdiction','evidence','crime'],
  economics:   ['market','supply','demand','inflation','gdp','fiscal','monetary','trade','capital','labor'],
  engineering: ['circuit','voltage','current','thermodynamic','structural','mechanical','fluid','material','design'],
  cs:          ['algorithm','complexity','data structure','sorting','recursion','compiler','network','operating system','database'],
  business:    ['revenue','profit','strategy','management','marketing','finance','organization','leadership'],
  psychology:  ['behavior','cognitive','perception','emotion','personality','mental','memory','learning','motivation'],
};

async function blade_domain_split(question) {
  const t = makeTelemetry(1);
  try {
    if (question.domain) {
      return { domain: question.domain, confidence: 'preset', telemetry: closeTelemetry(t, true) };
    }
    const text = ((question.question ?? '') + ' ' + (question.choices ?? question.options ?? []).join(' ')).toLowerCase();
    const scores = {};
    for (const [dom, kws] of Object.entries(DOMAIN_KEYWORDS)) {
      scores[dom] = kws.filter(k => text.includes(k)).length;
    }
    const best  = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    const domain = best && best[1] > 0 ? best[0] : 'general';
    return { domain, confidence: 'inferred', telemetry: closeTelemetry(t, true) };
  } catch (err) {
    return { domain: 'unknown', confidence: 'error', telemetry: closeTelemetry(t, false, err.message) };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// BLADE 2 — QUESTION_FANOUT
// ═════════════════════════════════════════════════════════════════════════════

async function blade_question_fanout(question, domain) {
  const t = makeTelemetry(2);
  try {
    const primary = { type: 'primary', prompt: buildMCQPrompt(question), domain };
    const prompts = [primary];
    return { prompts, telemetry: closeTelemetry(t, true, null, prompts.length) };
  } catch (err) {
    return { prompts: [], telemetry: closeTelemetry(t, false, err.message) };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// BLADE 3 — MODEL_DISPATCH
// ═════════════════════════════════════════════════════════════════════════════

async function blade_model_dispatch(prompt, model, ollamaUrl) {
  const t = makeTelemetry(3);
  try {
    const raw = await callOllamaRaw(prompt, model, ollamaUrl, TIMEOUT_MS);
    return {
      raw_response: raw.response,
      thinking:     raw.thinking,
      error:        raw.error,
      telemetry:    closeTelemetry(t, raw.error === null, raw.error),
    };
  } catch (err) {
    return { raw_response: null, thinking: null, error: err.message, telemetry: closeTelemetry(t, false, err.message) };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// BLADE 4 — QUARANTINE_CHECK (Andon-Cord)
// ═════════════════════════════════════════════════════════════════════════════

const UNCERTAINTY_PHRASES = [
  "i don't know","i'm not sure","i am not sure","uncertain","cannot determine",
  "unclear","it depends","debatable","no clear answer","hard to say",
  "impossible to know","context-dependent","impossible to determine",
];

async function blade_quarantine_check(response, question) {
  const t = makeTelemetry(4);
  try {
    if (!response || response.trim() === '') {
      return { quarantined: true, reason: 'no-response', telemetry: closeTelemetry(t, true) };
    }
    const lower = (response ?? '').toLowerCase();
    const unc = UNCERTAINTY_PHRASES.find(p => lower.includes(p));
    if (unc) {
      return { quarantined: true, reason: `uncertainty-phrase: "${unc}"`, telemetry: closeTelemetry(t, true) };
    }
    if (response.length > 50) {
      const numOpts = (question.choices ?? question.options ?? []).length;
      if (!parseLetterFromResponse(response, numOpts)) {
        return { quarantined: true, reason: 'unparseable-long-response', telemetry: closeTelemetry(t, true) };
      }
    }
    // Andon-Cord: THEORY_OPEN class always quarantined (epistemic self-policing)
    if (question.class === 'THEORY_OPEN') {
      return { quarantined: true, reason: 'theory-open-class: andon-cord epistemic self-policing', telemetry: closeTelemetry(t, true) };
    }
    return { quarantined: false, reason: null, telemetry: closeTelemetry(t, true) };
  } catch (err) {
    return { quarantined: true, reason: `blade-error: ${err.message}`, telemetry: closeTelemetry(t, false, err.message) };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// BLADE 5 — ADJUDICATE
// ═════════════════════════════════════════════════════════════════════════════

async function blade_adjudicate(response, question, isQuarantined) {
  const t = makeTelemetry(5);
  try {
    const numOpts      = (question.choices ?? question.options ?? []).length;
    const modelLetter  = parseLetterFromResponse(response, numOpts);
    const correctLetter = ((question.answer ?? question.answer_letter ?? '')).toUpperCase().trim();

    let verdict;
    if (isQuarantined)       verdict = 'QUARANTINED';
    else if (!modelLetter)   verdict = 'UNPARSEABLE';
    else if (modelLetter === correctLetter) verdict = 'CORRECT';
    else                     verdict = 'INCORRECT';

    return {
      verdict,
      correct:        verdict === 'CORRECT',
      model_letter:   modelLetter,
      correct_letter: correctLetter,
      telemetry:      closeTelemetry(t, true),
    };
  } catch (err) {
    return { verdict: 'ERROR', correct: false, model_letter: null, correct_letter: null, telemetry: closeTelemetry(t, false, err.message) };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// BLADE 6 — EBLET_MINT (TIC 5-field schema)
// ═════════════════════════════════════════════════════════════════════════════

async function blade_eblet_mint(question, response, verdict, domain) {
  const t = makeTelemetry(6);
  try {
    const choices      = question.choices ?? question.options ?? [];
    const correctIdx   = OPTION_LETTERS.indexOf((question.answer ?? question.answer_letter ?? 'A').toUpperCase());
    const correctText  = choices[correctIdx] ?? '';
    const qClass       = question.class ?? (verdict.verdict === 'CORRECT' ? 'KNOWN' : 'THEORY_OPEN');

    const eblet = {
      id:              crypto.randomUUID(),
      question_id:     question.id ?? question.question_id ?? 'unknown',
      domain,
      question_text:   question.question,
      correct_answer:  correctText,
      model_letter:    verdict.model_letter,
      correct_letter:  verdict.correct_letter,
      verdict:         verdict.verdict,
      question_class:  qClass,
      chronos:         new Date().toISOString(),
      plow_version:    '12blade-bp084',
      // TIC 5-field schema
      known:                   [],
      theories_open:           [],
      eliminated:              [],
      dependencies_upstream:   [],
      applications_downstream: [],
      // Runtime fields
      survival_score:    null,
      needs_reeval:      false,
      consequence_eblets: [],
    };

    if (qClass === 'KNOWN' && verdict.verdict === 'CORRECT') {
      eblet.known.push({
        fact:        correctText,
        domain,
        confidence:  'high',
        verified_by: 'model_consensus',
        source:      question.question,
      });
    } else if (qClass === 'THEORY_OPEN') {
      eblet.theories_open.push({
        theory:         question.question,
        domain,
        status:         'open',
        survival_score: null,
        note:           'Epistemic status: contested — requires consequence-trace verification',
      });
    } else if (qClass === 'ELIMINATED') {
      const preContra = question.pre_loaded_contradiction;
      eblet.eliminated.push({
        theory:       preContra?.contradicts_theory ?? 'competing hypothesis',
        eliminated_by: preContra?.known_fact ?? correctText,
        confidence:   'high',
        domain,
      });
      if (verdict.verdict === 'CORRECT') {
        eblet.known.push({
          fact:        correctText,
          domain,
          confidence:  'high',
          verified_by: 'elimination_verification',
        });
      }
    }

    if (question.downstream_seed) {
      eblet.applications_downstream.push({
        ref:        question.downstream_seed,
        needs_reeval: false,
        note:       'Downstream application seed — flagged for dependency propagation',
      });
    }

    const fieldCount = eblet.known.length + eblet.theories_open.length + eblet.eliminated.length;
    return { eblet, telemetry: closeTelemetry(t, true, null, fieldCount) };
  } catch (err) {
    return { eblet: null, telemetry: closeTelemetry(t, false, err.message) };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// BLADE 7 — REPUTATION_UPDATE
// ═════════════════════════════════════════════════════════════════════════════

async function blade_reputation_update(modelTier, verdict) {
  const t = makeTelemetry(7);
  try {
    const tier = modelTier ?? 'unknown';
    if (!reputationStore[tier]) reputationStore[tier] = { correct: 0, total: 0, quarantined: 0, incorrect: 0 };
    const store = reputationStore[tier];
    store.total++;
    if      (verdict.verdict === 'CORRECT')    store.correct++;
    else if (verdict.verdict === 'QUARANTINED') store.quarantined++;
    else                                        store.incorrect++;
    const acc = store.total > 0 ? (store.correct / store.total * 100).toFixed(1) : '0.0';
    return { tier, updated: { ...store }, accuracy_pct: acc, telemetry: closeTelemetry(t, true) };
  } catch (err) {
    return { tier: modelTier, updated: null, accuracy_pct: null, telemetry: closeTelemetry(t, false, err.message) };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// BLADE 8 — VAULT_WRITE
// ═════════════════════════════════════════════════════════════════════════════

async function blade_vault_write(eblet, vaultPath) {
  const t = makeTelemetry(8);
  try {
    const filePath = writeToVault(eblet, vaultPath);
    return { file: filePath, telemetry: closeTelemetry(t, true, null, 1) };
  } catch (err) {
    return { file: null, telemetry: closeTelemetry(t, false, err.message) };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// BLADE 9 — CROSS_DOMAIN_LINK
// ═════════════════════════════════════════════════════════════════════════════

const DOMAIN_GRAPH = {
  chemistry:   ['physics','biology'],
  physics:     ['chemistry','engineering','math'],
  biology:     ['chemistry','psychology'],
  math:        ['physics','cs','engineering'],
  cs:          ['math','engineering'],
  philosophy:  ['psychology','law','history'],
  law:         ['philosophy','economics'],
  economics:   ['law','business'],
  history:     ['law','philosophy'],
  engineering: ['physics','cs','math'],
  psychology:  ['biology','philosophy'],
  business:    ['economics','law'],
};

async function blade_cross_domain_link(eblet, domain) {
  const t = makeTelemetry(9);
  try {
    const linked = DOMAIN_GRAPH[domain] ?? [];
    const links  = linked.map(target => ({
      source_domain: domain,
      target_domain: target,
      eblet_id:      eblet.id,
      link_type:     'domain_adjacency',
      chronos:       new Date().toISOString(),
    }));
    if (linked.length > 0) {
      eblet.dependencies_upstream.push(...linked.map(d => ({ domain: d, type: 'adjacent' })));
    }
    return { links, domains_linked: linked, telemetry: closeTelemetry(t, true, null, links.length) };
  } catch (err) {
    return { links: [], domains_linked: [], telemetry: closeTelemetry(t, false, err.message) };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// BLADE 10 — CONSEQUENCE_TRACE
// ═════════════════════════════════════════════════════════════════════════════

async function blade_consequence_trace(eblet, model, ollamaUrl, vaultPath, maxDepth) {
  const t = makeTelemetry(10);
  try {
    const theories = eblet.theories_open ?? [];
    if (theories.length === 0) {
      return { consequence_eblets: [], survival_scores: {}, note: 'no-theories', telemetry: closeTelemetry(t, true, null, 0) };
    }

    const consequenceEblets = [];
    const survivalScores    = {};

    for (const theory of theories) {
      const theoryText = theory.theory ?? String(theory);

      // Ask model: what testable consequences follow if this theory is true?
      const conseqPrompt =
        `You are an epistemic reasoner.\n\n` +
        `Contested claim: "${theoryText}"\n\n` +
        `IF this claim is TRUE, list exactly 3 SHORT testable consequences that should follow. ` +
        `Format: numbered list. One sentence each. Be concrete.\n\n` +
        `1.`;

      const conseqRaw = await callOllamaRaw(`Answer this multiple-choice question. Your response must be EXACTLY ONE letter — nothing else.\n\n` + conseqPrompt, model, ollamaUrl, 90000);

      // Fall back to a simpler prompt if the first produced a single-letter answer
      let conseqText = conseqRaw.response ?? conseqRaw.thinking ?? '';
      if (conseqText.length < 20) {
        const fallback = await callOllamaRaw(
          `List 3 testable consequences that would follow IF this were true: "${theoryText}"\nFormat as 1. ... 2. ... 3. ...`,
          model, ollamaUrl, 90000
        );
        conseqText = (fallback.response ?? fallback.thinking ?? '').trim();
      }

      // Parse consequence lines
      const rawLines  = conseqText.split('\n');
      const consequences = rawLines
        .filter(l => l.trim().match(/^(\d+\.|[-*•])/))
        .map(l => l.replace(/^(\d+\.|-|\*|•)\s*/, '').trim())
        .filter(c => c.length > 10)
        .slice(0, 3);

      if (consequences.length === 0) {
        theory.survival_score = 0.5;
        survivalScores[theoryText] = 0.5;
        continue;
      }

      let consistentCount = 0;

      for (let ci = 0; ci < consequences.length; ci++) {
        const conseq = consequences[ci];

        // Build probe pseudo-question — run blades 3-6 on it
        const probeQ = {
          id:            `probe_${eblet.question_id ?? eblet.id.slice(0, 8)}_c${ci + 1}`,
          question_id:   `probe_${eblet.question_id ?? eblet.id.slice(0, 8)}_c${ci + 1}`,
          question:      `Is this statement consistent with established knowledge? "${conseq}"`,
          choices:       ['Yes, consistent with established knowledge', 'No, contradicted by established knowledge', 'Insufficient evidence to determine'],
          options:       ['Yes, consistent with established knowledge', 'No, contradicted by established knowledge', 'Insufficient evidence to determine'],
          answer:        'A',
          answer_letter: 'A',
          domain:        eblet.domain,
          class:         'THEORY_OPEN',
        };

        const probePrompt = buildMCQPrompt(probeQ);
        const pb3 = await blade_model_dispatch(probePrompt, model, ollamaUrl);
        const pb4 = await blade_quarantine_check(pb3.raw_response, probeQ);
        // Don't propagate THEORY_OPEN quarantine for probe — check actual response only
        const probeIsQuar = !pb3.raw_response || pb3.raw_response.trim() === '';
        const pb5 = await blade_adjudicate(pb3.raw_response, probeQ, probeIsQuar);
        const pb6 = await blade_eblet_mint(probeQ, pb3.raw_response, pb5, eblet.domain);

        if (pb6.eblet) {
          pb6.eblet.type            = 'consequence_probe';
          pb6.eblet.parent_eblet_id = eblet.id;
          pb6.eblet.theory          = theoryText;
          pb6.eblet.consequence     = conseq;
          pb6.eblet.probe_letter    = pb5.model_letter;
          pb6.eblet.consistent      = (pb5.model_letter === 'A');
          pb6.eblet.contradicted    = (pb5.model_letter === 'B');
          writeToVault(pb6.eblet, vaultPath);
          consequenceEblets.push(pb6.eblet);
          if (pb5.model_letter === 'A') consistentCount++;
        }
      }

      const survivalScore = consequences.length > 0
        ? Math.round(consistentCount / consequences.length * 100) / 100
        : 0.5;
      theory.survival_score = survivalScore;
      survivalScores[theoryText] = survivalScore;
    }

    return {
      consequence_eblets: consequenceEblets,
      survival_scores:    survivalScores,
      telemetry:          closeTelemetry(t, true, null, consequenceEblets.length),
    };
  } catch (err) {
    return { consequence_eblets: [], survival_scores: {}, telemetry: closeTelemetry(t, false, err.message) };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// BLADE 11 — ELIMINATION_VERIFICATION
// ═════════════════════════════════════════════════════════════════════════════

function bm25Score(query, document) {
  // Simplified TF-IDF/keyword overlap (no npm required)
  const tokens = s => s.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const qToks = tokens(query);
  const dSet  = new Set(tokens(document));
  const hit   = qToks.filter(w => dSet.has(w)).length;
  return qToks.length > 0 ? hit / qToks.length : 0;
}

async function blade_elimination_verification(eblet, substrateIndex) {
  const t = makeTelemetry(11);
  try {
    const substrate         = substrateIndex ?? [];
    const confirmedEliminated = [];
    const codeBreakerQueue  = [];
    const contradictionEblets = [];
    let   kSurvived         = 0;

    // Check eliminated candidates (already in eblet.eliminated from blade 6)
    const candidates = [...(eblet.theories_open ?? []), ...(eblet.eliminated ?? [])];

    for (const candidate of candidates) {
      const theoryText   = candidate.theory ?? String(candidate);
      const eliminatedBy = candidate.eliminated_by ?? '';
      let contradictionFound  = false;
      let contradictionSource = null;
      let contradictionScore  = 0;

      // Search substrate for contradictions
      for (const knownFact of substrate) {
        const factText = knownFact.fact ?? knownFact.known_fact ?? String(knownFact);
        const score    = bm25Score(theoryText, factText);
        const contraScore = knownFact.contradicts_theory
          ? bm25Score(knownFact.contradicts_theory, theoryText)
          : 0;
        if (score > 0.3 || contraScore > 0.2) {
          contradictionFound  = true;
          contradictionSource = factText;
          contradictionScore  = Math.max(score, contraScore);
          break;
        }
      }

      // If candidate has eliminated_by text → that IS the contradiction
      if (!contradictionFound && eliminatedBy && eliminatedBy.length > 10) {
        contradictionFound  = true;
        contradictionSource = eliminatedBy;
        contradictionScore  = 0.95;
      }

      if (contradictionFound) {
        const verified = {
          ...candidate,
          contradicted_by:   contradictionSource,
          confidence:        contradictionScore > 0.5 ? 'high' : 'medium',
          verified_by_blade: 11,
        };
        confirmedEliminated.push(verified);
        codeBreakerQueue.push({
          theory:       theoryText,
          contradiction: contradictionSource,
          eblet_id:     eblet.id,
          chronos:      new Date().toISOString(),
        });

        const contraEblet = {
          id:              crypto.randomUUID(),
          type:            'contradiction_trail',
          parent_eblet_id: eblet.id,
          question_id:     `contra_${eblet.question_id ?? 'unknown'}`,
          theory:          theoryText,
          contradicted_by: contradictionSource,
          contradiction_score: contradictionScore,
          chronos:         new Date().toISOString(),
          plow_version:    '12blade-bp084',
          known:           [],
          theories_open:   [],
          eliminated:      [{ theory: theoryText, eliminated_by: contradictionSource }],
          dependencies_upstream:   [{ ref: eblet.id, type: 'parent' }],
          applications_downstream: [],
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
    }

    return {
      eliminated:           confirmedEliminated,
      code_breaker_queue:   codeBreakerQueue,
      contradiction_eblets: contradictionEblets,
      k_survived:           kSurvived,
      telemetry:            closeTelemetry(t, true, null, confirmedEliminated.length + contradictionEblets.length),
    };
  } catch (err) {
    return {
      eliminated: [], code_breaker_queue: [], contradiction_eblets: [], k_survived: 0,
      telemetry: closeTelemetry(t, false, err.message),
    };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// BLADE 12 — DEPENDENCY_PROPAGATION
// ═════════════════════════════════════════════════════════════════════════════

async function blade_dependency_propagate(eblet, vaultPath) {
  const t = makeTelemetry(12);
  try {
    const downstream = eblet.applications_downstream ?? [];
    const knownFacts = eblet.known ?? [];

    if (downstream.length === 0 || knownFacts.length === 0) {
      return { flagged_count: 0, review_queue_entries: [], telemetry: closeTelemetry(t, true, null, 0) };
    }

    const reviewQueueEntries = [];
    for (const dep of downstream) {
      dep.needs_reeval = true;
      dep.chronos      = new Date().toISOString();
      reviewQueueEntries.push({
        eblet_id:      eblet.id,
        downstream_ref: dep.ref ?? String(dep),
        needs_reeval:  true,
        flagged_by:    'blade_12_dependency_propagation',
        reason:        'upstream KNOWN entry updated',
        known_update:  knownFacts[0]?.fact ?? 'unknown',
        domain:        eblet.domain,
        chronos:       new Date().toISOString(),
      });
    }

    // Write review_queue.json one level above the active/ directory
    const reviewQueuePath = path.join(vaultPath, '..', 'review_queue.json');
    ensureDir(path.dirname(reviewQueuePath));
    let existing = [];
    if (fs.existsSync(reviewQueuePath)) {
      try { existing = JSON.parse(fs.readFileSync(reviewQueuePath, 'utf8')); } catch { existing = []; }
    }
    existing.push(...reviewQueueEntries);
    fs.writeFileSync(reviewQueuePath, JSON.stringify(existing, null, 2), 'utf8');

    return {
      flagged_count:        reviewQueueEntries.length,
      review_queue_entries: reviewQueueEntries,
      telemetry:            closeTelemetry(t, true, null, reviewQueueEntries.length),
    };
  } catch (err) {
    return { flagged_count: 0, review_queue_entries: [], telemetry: closeTelemetry(t, false, err.message) };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// Substrate index builder (from existing vault eblets)
// ═════════════════════════════════════════════════════════════════════════════

function buildSubstrateFromVault(vaultPath) {
  const substrate = [];
  if (!fs.existsSync(vaultPath)) return substrate;
  try {
    const files = fs.readdirSync(vaultPath).filter(f => f.endsWith('.json')).slice(0, 200);
    for (const f of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(vaultPath, f), 'utf8'));
        (data.known ?? []).forEach(k => substrate.push(k));
        (data.eliminated ?? []).forEach(e => substrate.push({
          fact: e.eliminated_by ?? '',
          contradicts_theory: e.theory ?? '',
          domain: data.domain,
        }));
      } catch { /* skip malformed */ }
    }
  } catch { /* skip */ }
  return substrate;
}

// ═════════════════════════════════════════════════════════════════════════════
// MASTER ORCHESTRATOR — runPlow12Blade
// ═════════════════════════════════════════════════════════════════════════════

async function runPlow12Blade(questions, config) {
  const { model, ollamaUrl, vaultPath, maxConsequenceDepth, outputFile, telemetryFile } = config;

  ensureDir(vaultPath);

  const outStream  = fs.createWriteStream(outputFile, { flags: 'w' });
  const allTelemetry = [];

  const stats = {
    total: questions.length,
    correct: 0, quarantined: 0, incorrect: 0,
    eblets_minted: 0, consequence_probes: 0, eliminations: 0, downstream_flags: 0,
    blades_fired: {},
  };
  for (let i = 1; i <= 12; i++) stats.blades_fired[`blade_${i}`] = 0;

  // Build substrate index from vault
  const substrateIndex = buildSubstrateFromVault(vaultPath);

  for (let qi = 0; qi < questions.length; qi++) {
    const q   = questions[qi];
    const qId = q.id ?? q.question_id ?? `q${qi + 1}`;
    console.log(`\n[${ qi + 1 }/${questions.length}] ${qId}  class=${q.class ?? '?'}  domain=${q.domain ?? '?'}`);

    const bladeTelems = [];
    const result = {
      question_id:     qId,
      question_class:  q.class ?? 'UNKNOWN',
      domain:          null,
      model_letter:    null,
      correct_letter:  q.answer ?? q.answer_letter,
      verdict:         null,
      quarantined:     false,
      eblet_id:        null,
      blades_fired:    [],
      consequence_count: 0, elimination_count: 0, downstream_flags: 0,
      errors:          [],
    };

    // ── BLADE 1 ────────────────────────────────────────────────────────────
    const b1 = await blade_domain_split(q);
    bladeTelems.push(b1.telemetry); stats.blades_fired.blade_1++;
    if (b1.telemetry.success) result.blades_fired.push(1);
    result.domain = b1.domain;
    console.log(`  B1 domain_split       → ${b1.domain} (${b1.confidence})  ${b1.telemetry.success ? '✓' : '✗'}`);

    // ── BLADE 2 ────────────────────────────────────────────────────────────
    const b2 = await blade_question_fanout(q, b1.domain);
    bladeTelems.push(b2.telemetry); stats.blades_fired.blade_2++;
    if (b2.telemetry.success) result.blades_fired.push(2);
    console.log(`  B2 question_fanout    → ${b2.prompts.length} prompt(s)  ${b2.telemetry.success ? '✓' : '✗'}`);

    const primaryPrompt = b2.prompts[0]?.prompt;
    if (!primaryPrompt) {
      result.errors.push('blade_2: no prompt generated');
      outStream.write(JSON.stringify(result) + '\n');
      allTelemetry.push({ question_id: qId, blades: bladeTelems });
      continue;
    }

    // Inject pre_loaded_contradiction into substrate BEFORE blade 4+
    if (q.pre_loaded_contradiction) {
      substrateIndex.push({
        fact:              q.pre_loaded_contradiction.known_fact,
        contradicts_theory: q.pre_loaded_contradiction.contradicts_theory,
        domain:            q.domain,
      });
    }

    // ── BLADE 3 ────────────────────────────────────────────────────────────
    const b3 = await blade_model_dispatch(primaryPrompt, model, ollamaUrl);
    bladeTelems.push(b3.telemetry); stats.blades_fired.blade_3++;
    if (b3.telemetry.success) result.blades_fired.push(3);
    console.log(`  B3 model_dispatch     → "${(b3.raw_response ?? 'null').slice(0, 40)}"  ${b3.telemetry.success ? '✓' : '✗'}`);

    // ── BLADE 4 ────────────────────────────────────────────────────────────
    const b4 = await blade_quarantine_check(b3.raw_response, q);
    bladeTelems.push(b4.telemetry); stats.blades_fired.blade_4++;
    if (b4.telemetry.success) result.blades_fired.push(4);
    result.quarantined = b4.quarantined;
    if (b4.quarantined) stats.quarantined++;
    console.log(`  B4 quarantine_check   → quarantined=${b4.quarantined}  reason="${b4.reason ?? 'clean'}"  ${b4.telemetry.success ? '✓' : '✗'}`);

    // ── BLADE 5 ────────────────────────────────────────────────────────────
    const b5 = await blade_adjudicate(b3.raw_response, q, b4.quarantined);
    bladeTelems.push(b5.telemetry); stats.blades_fired.blade_5++;
    if (b5.telemetry.success) result.blades_fired.push(5);
    result.verdict      = b5.verdict;
    result.model_letter = b5.model_letter;
    if (b5.verdict === 'CORRECT')   stats.correct++;
    if (b5.verdict === 'INCORRECT') stats.incorrect++;
    console.log(`  B5 adjudicate         → ${b5.verdict}  model=${b5.model_letter}  correct=${b5.correct_letter}  ${b5.telemetry.success ? '✓' : '✗'}`);

    // ── BLADE 6 ────────────────────────────────────────────────────────────
    const b6 = await blade_eblet_mint(q, b3.raw_response, b5, b1.domain);
    bladeTelems.push(b6.telemetry); stats.blades_fired.blade_6++;
    if (b6.telemetry.success && b6.eblet) {
      result.blades_fired.push(6);
      result.eblet_id = b6.eblet.id;
      stats.eblets_minted++;
    }
    console.log(`  B6 eblet_mint         → id=${b6.eblet?.id?.slice(0, 8) ?? 'FAIL'}  ${b6.telemetry.success ? '✓' : '✗'}`);

    if (!b6.eblet) {
      result.errors.push('blade_6: eblet mint failed');
      outStream.write(JSON.stringify(result) + '\n');
      allTelemetry.push({ question_id: qId, blades: bladeTelems });
      continue;
    }
    const eblet = b6.eblet;

    // ── BLADE 7 ────────────────────────────────────────────────────────────
    const modelTier = model.replace(':', '_');
    const b7 = await blade_reputation_update(modelTier, b5);
    bladeTelems.push(b7.telemetry); stats.blades_fired.blade_7++;
    if (b7.telemetry.success) result.blades_fired.push(7);
    console.log(`  B7 reputation_update  → ${modelTier} acc=${b7.accuracy_pct}%  ${b7.telemetry.success ? '✓' : '✗'}`);

    // ── BLADE 8 ────────────────────────────────────────────────────────────
    const b8 = await blade_vault_write(eblet, vaultPath);
    bladeTelems.push(b8.telemetry); stats.blades_fired.blade_8++;
    if (b8.telemetry.success) result.blades_fired.push(8);
    console.log(`  B8 vault_write        → ${b8.file ? path.basename(b8.file) : 'FAILED'}  ${b8.telemetry.success ? '✓' : '✗'}`);

    // ── BLADE 9 ────────────────────────────────────────────────────────────
    const b9 = await blade_cross_domain_link(eblet, b1.domain);
    bladeTelems.push(b9.telemetry); stats.blades_fired.blade_9++;
    if (b9.telemetry.success) result.blades_fired.push(9);
    console.log(`  B9 cross_domain_link  → linked=[${b9.domains_linked.join(', ')}]  ${b9.telemetry.success ? '✓' : '✗'}`);

    // ── BLADE 10 (THEORY_OPEN only) ────────────────────────────────────────
    if (q.class === 'THEORY_OPEN' || eblet.theories_open.length > 0) {
      console.log(`  B10 consequence_trace  → running (theory_open)...`);
      const b10 = await blade_consequence_trace(eblet, model, ollamaUrl, vaultPath, maxConsequenceDepth);
      bladeTelems.push(b10.telemetry); stats.blades_fired.blade_10++;
      if (b10.telemetry.success) result.blades_fired.push(10);
      result.consequence_count = b10.consequence_eblets.length;
      stats.consequence_probes += b10.consequence_eblets.length;
      eblet.consequence_eblets = b10.consequence_eblets.map(ce => ce.id);
      console.log(`  B10 consequence_trace  → ${b10.consequence_eblets.length} probes  survival=${JSON.stringify(b10.survival_scores).slice(0, 60)}  ${b10.telemetry.success ? '✓' : '✗'}`);
    } else {
      bladeTelems.push(skippedTelemetry(10, 'not-theory-open'));
      console.log(`  B10 consequence_trace  → SKIPPED (not THEORY_OPEN)`);
    }

    // ── BLADE 11 (ELIMINATED only) ─────────────────────────────────────────
    if (q.class === 'ELIMINATED' || eblet.eliminated.length > 0) {
      const b11 = await blade_elimination_verification(eblet, substrateIndex);
      bladeTelems.push(b11.telemetry); stats.blades_fired.blade_11++;
      if (b11.telemetry.success) result.blades_fired.push(11);
      result.elimination_count = b11.eliminated.length;
      stats.eliminations += b11.eliminated.length;
      console.log(`  B11 elimination_verify → ${b11.eliminated.length} confirmed  k_survived=${b11.k_survived}  ${b11.telemetry.success ? '✓' : '✗'}`);
    } else {
      bladeTelems.push(skippedTelemetry(11, 'not-eliminated-class'));
      console.log(`  B11 elimination_verify → SKIPPED (not ELIMINATED class)`);
    }

    // ── BLADE 12 (KNOWN + downstream) ─────────────────────────────────────
    if (q.class === 'KNOWN' || eblet.applications_downstream.length > 0) {
      const b12 = await blade_dependency_propagate(eblet, vaultPath);
      bladeTelems.push(b12.telemetry); stats.blades_fired.blade_12++;
      if (b12.telemetry.success) result.blades_fired.push(12);
      result.downstream_flags = b12.flagged_count;
      stats.downstream_flags += b12.flagged_count;
      console.log(`  B12 dependency_prop    → ${b12.flagged_count} downstream flags  ${b12.telemetry.success ? '✓' : '✗'}`);
    } else {
      bladeTelems.push(skippedTelemetry(12, 'not-known-or-no-downstream'));
      console.log(`  B12 dependency_prop    → SKIPPED (not KNOWN / no downstream)`);
    }

    // Final vault overwrite with fully updated eblet
    writeToVault(eblet, vaultPath);

    result.eblet_snapshot = {
      known_count:                  eblet.known.length,
      theories_open_count:          eblet.theories_open.length,
      eliminated_count:             eblet.eliminated.length,
      dependencies_upstream_count:  eblet.dependencies_upstream.length,
      applications_downstream_count: eblet.applications_downstream.length,
    };

    outStream.write(JSON.stringify(result) + '\n');
    allTelemetry.push({
      question_id:  qId,
      blade_count:  bladeTelems.length,
      blades:       bladeTelems,
    });
  }

  outStream.end();

  const telemetryOut = {
    generated_at:       new Date().toISOString(),
    plow_version:       '12blade-bp084',
    model,
    questions_processed: questions.length,
    summary:            stats,
    reputation:         reputationStore,
    per_question:       allTelemetry,
  };
  fs.writeFileSync(telemetryFile, JSON.stringify(telemetryOut, null, 2), 'utf8');

  return { stats, telemetryFile, outputFile };
}

// ═════════════════════════════════════════════════════════════════════════════
// Main entry point
// ═════════════════════════════════════════════════════════════════════════════

async function main() {
  if (!fs.existsSync(shardFile)) {
    console.error(`Shard file not found: ${shardFile}`);
    process.exit(1);
  }

  const shard     = JSON.parse(fs.readFileSync(shardFile, 'utf8'));
  const questions = shard.questions ?? [];

  if (questions.length === 0) {
    console.error('No questions found in shard.');
    process.exit(1);
  }

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   MnemosyneC 12-Blade Epistemic Plow  ·  BP084           ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`Shard     : ${shardFile}  (${questions.length} questions)`);
  console.log(`Model     : ${MODEL}`);
  console.log(`Ollama    : ${OLLAMA_URL}`);
  console.log(`Output    : ${OUT_FILE}`);
  console.log(`Telemetry : ${TELEM_FILE}`);
  console.log(`Vault     : ${VAULT_PATH}`);
  console.log(`Max Depth : ${MAX_DEPTH}`);
  console.log('');

  // Verify Ollama
  try {
    const pingResp = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(5000) });
    if (!pingResp.ok) throw new Error(`HTTP ${pingResp.status}`);
    const tags       = await pingResp.json();
    const modelNames = (tags.models ?? []).map(m => m.name);
    const present    = modelNames.some(n => n === MODEL || n.startsWith(MODEL.split(':')[0]));
    if (present) {
      console.log(`[OK] Ollama connected. Model "${MODEL}" found.`);
    } else {
      console.warn(`[AMBER] Model "${MODEL}" not listed. Available: ${modelNames.slice(0, 5).join(', ')}`);
    }
  } catch (err) {
    console.error(`[RED] Ollama unreachable at ${OLLAMA_URL}: ${err.message}`);
    process.exit(1);
  }

  const config = {
    model: MODEL, ollamaUrl: OLLAMA_URL, vaultPath: VAULT_PATH,
    maxConsequenceDepth: MAX_DEPTH, outputFile: OUT_FILE, telemetryFile: TELEM_FILE,
  };

  const { stats } = await runPlow12Blade(questions, config);

  console.log('\n' + '═'.repeat(62));
  console.log('12-BLADE PLOW COMPLETE');
  console.log('═'.repeat(62));
  console.log(`Total     : ${stats.total}`);
  console.log(`Correct   : ${stats.correct}`);
  console.log(`Quarantined: ${stats.quarantined}`);
  console.log(`Incorrect : ${stats.incorrect}`);
  console.log(`Eblets    : ${stats.eblets_minted}`);
  console.log(`Conseq.   : ${stats.consequence_probes}`);
  console.log(`Eliminations: ${stats.eliminations}`);
  console.log(`Downstream: ${stats.downstream_flags}`);
  console.log('\nBlade fire counts:');
  for (const [bl, cnt] of Object.entries(stats.blades_fired)) {
    console.log(`  ${bl.padEnd(10)}: ${cnt}`);
  }
  console.log(`\nOutput    : ${OUT_FILE}`);
  console.log(`Telemetry : ${TELEM_FILE}`);
  console.log(`Vault     : ${VAULT_PATH}`);
  console.log('═'.repeat(62));
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
