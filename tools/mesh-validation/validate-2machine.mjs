#!/usr/bin/env node
// 2-machine pre-canonical LAN-direct Ollama validation
// BP086 · Truth-Always: labeled as pre-canonical, NOT 4-machine LAN-as-WAN THUNDERCLAP
//
// Usage:
//   node validate-2machine.mjs --m3ip=192.168.86.XX [--questions=5] [--mode=smoke|full]
//   --m3ip: M3's LAN IP (required)
//   --questions: number to run (5 for A6 smoke, 70 for A7; default 5)
//   --mode: 'smoke' (5Q, A6) or 'full' (70Q, A7)

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── CLI Argument Parsing ───────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = { m3ip: null, questions: 5, mode: 'smoke', timeout: 120 };

  for (const arg of args) {
    const [key, val] = arg.replace(/^--/, '').split('=');
    if (key === 'm3ip') parsed.m3ip = val;
    else if (key === 'questions') parsed.questions = parseInt(val, 10);
    else if (key === 'mode') parsed.mode = val;
    else if (key === 'timeout') parsed.timeout = parseInt(val, 10);
  }

  if (!parsed.m3ip) {
    console.error('ERROR: --m3ip=<ip> is required.');
    console.error('Usage: node validate-2machine.mjs --m3ip=192.168.86.XX [--questions=5] [--mode=smoke|full]');
    process.exit(2);
  }

  if (parsed.mode === 'smoke' && parsed.questions === 5) parsed.questions = 5;
  if (parsed.mode === 'full' && parsed.questions === 5) parsed.questions = 70;

  return parsed;
}

// ─── Dataset Loading ────────────────────────────────────────────────────────

const DATASET_BASE = 'C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\lb-reproducibility-pack\\datasets\\mmlu_pro_per_domain';

const DOMAINS = [
  'biology', 'business', 'chemistry', 'computer_science',
  'economics', 'engineering', 'health', 'history',
  'law', 'math', 'other', 'philosophy', 'physics', 'psychology'
];

const LETTERS = 'ABCDEFGHIJ';

function loadDomainQuestions(domain) {
  const path = join(DATASET_BASE, domain, 'questions.json');
  if (!existsSync(path)) return [];
  try {
    const raw = readFileSync(path, 'utf8');
    const questions = JSON.parse(raw);
    return questions.map(q => ({ ...q, domain }));
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
  let domainIdx = 0;
  const domainOffsets = {};
  for (const d of domainNames) domainOffsets[d] = 0;

  while (selected.length < totalCount) {
    const domain = domainNames[domainIdx % domainNames.length];
    const pool = allByDomain[domain];
    const offset = domainOffsets[domain];
    if (offset < pool.length) {
      selected.push(pool[offset]);
      domainOffsets[domain]++;
    }
    domainIdx++;
    // Safety: if we've cycled all domains and still not enough, break
    if (domainIdx > totalCount * domainNames.length + domainNames.length) break;
  }

  return selected.slice(0, totalCount);
}

// ─── Answer Extraction Helpers ──────────────────────────────────────────────

function getCorrectLetter(question) {
  const idx = question.options.indexOf(question.correct_answer);
  if (idx === -1) return null;
  return LETTERS[idx] ?? null;
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
  // Look for a standalone letter answer: "A", "B.", "(C)", "Answer: D", etc.
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

// ─── Ollama API ─────────────────────────────────────────────────────────────

async function detectModel(ip, port = 11434) {
  try {
    const url = `http://${ip}:${port}/api/tags`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return 'unknown';
    const data = await res.json();
    const models = data.models ?? [];
    if (models.length === 0) return 'unknown';
    return models[0].name ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

async function queryOllama(ip, model, prompt, timeoutMs = 60000) {
  const url = `http://${ip}:11434/api/generate`;
  const body = JSON.stringify({ model, prompt, stream: false });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const errText = await res.text().catch(() => 'unknown error');
      return { success: false, error: `HTTP ${res.status}: ${errText}`, response: null };
    }
    const data = await res.json();
    return { success: true, error: null, response: data.response ?? '' };
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') return { success: false, error: `TIMEOUT (${Math.round(timeoutMs/1000)}s)`, response: null };
    return { success: false, error: err.message, response: null };
  }
}

// ─── Console Formatting ─────────────────────────────────────────────────────

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
  const { m3ip, questions: questionCount, mode, timeout: timeoutSec } = args;
  const timeoutMs = timeoutSec * 1000;

  console.log(`\n${BOLD}${CYAN}2-MACHINE PRE-CANONICAL VALIDATION · BP086${RESET}`);
  console.log(`Mode: ${mode.toUpperCase()} · Questions: ${questionCount}`);
  console.log(`M0: 127.0.0.1:11434 (gemma4:12b)  |  M3: ${m3ip}:11434`);
  console.log(`Truth-Always: This is PRE-CANONICAL. Not the 4-machine THUNDERCLAP run.\n`);

  // Detect M3 model
  console.log('Detecting M3 model...');
  const m3Model = await detectModel(m3ip);
  console.log(`M3 model detected: ${m3Model}\n`);

  const M0_MODEL = 'gemma4:12b';
  const M0_IP = '127.0.0.1';

  // Load questions
  console.log(`Loading ${questionCount} questions spread across domains...`);
  let questions;
  try {
    questions = selectQuestionsSpreadAcrossDomains(questionCount);
  } catch (err) {
    console.error(`ERROR loading questions: ${err.message}`);
    process.exit(2);
  }
  console.log(`Loaded ${questions.length} questions from ${[...new Set(questions.map(q => q.domain))].join(', ')}\n`);

  // Run validation
  const results = [];
  let m0Correct = 0, m3Correct = 0, ensembleCorrect = 0, contested = 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const qNum = `Q${pad2(i + 1)}/${pad2(questions.length)}`;
    const correctLetter = getCorrectLetter(q);
    const prompt = buildPrompt(q);

    console.log(`[${qNum}] ${q.source_id} (${q.domain})`);

    // Dispatch both concurrently
    const [m0Result, m3Result] = await Promise.all([
      queryOllama(M0_IP, M0_MODEL, prompt, timeoutMs),
      queryOllama(m3ip, m3Model, prompt, timeoutMs),
    ]);

    const m0Letter = m0Result.success ? extractLetter(m0Result.response, q.options.length) : null;
    const m3Letter = m3Result.success ? extractLetter(m3Result.response, q.options.length) : null;

    const m0IsCorrect = m0Letter !== null && m0Letter === correctLetter;
    const m3IsCorrect = m3Letter !== null && m3Letter === correctLetter;

    if (m0IsCorrect) m0Correct++;
    if (m3IsCorrect) m3Correct++;

    // Ensemble logic
    let ensembleAnswer = null;
    let ensembleIsCorrect = false;
    let isContested = false;

    if (m0Letter !== null && m3Letter !== null) {
      if (m0Letter === m3Letter) {
        ensembleAnswer = m0Letter;
        ensembleIsCorrect = ensembleAnswer === correctLetter;
        if (ensembleIsCorrect) ensembleCorrect++;
      } else {
        isContested = true;
        contested++;
      }
    } else if (m0Letter !== null) {
      // Only M0 answered — use it as ensemble fallback
      ensembleAnswer = m0Letter;
      ensembleIsCorrect = ensembleAnswer === correctLetter;
      if (ensembleIsCorrect) ensembleCorrect++;
    } else if (m3Letter !== null) {
      // Only M3 answered
      ensembleAnswer = m3Letter;
      ensembleIsCorrect = ensembleAnswer === correctLetter;
      if (ensembleIsCorrect) ensembleCorrect++;
    } else {
      isContested = true;
      contested++;
    }

    // Per-question display
    const m0Display = m0Letter ?? (m0Result.success ? '?' : `ERR:${m0Result.error}`);
    const m3Display = m3Letter ?? (m3Result.success ? '?' : `ERR:${m3Result.error}`);

    console.log(`  M0 (${M0_MODEL}): ${m0Display} [${mark(m0IsCorrect)}]  (correct: ${correctLetter ?? '?'})`);
    console.log(`  M3 (${m3Model}): ${m3Display} [${mark(m3IsCorrect)}]`);

    if (isContested) {
      console.log(`  Ensemble: ${YELLOW}CONTESTED${RESET} [${mark(false)}]`);
    } else {
      console.log(`  Ensemble: ${ensembleAnswer ?? '?'} [${mark(ensembleIsCorrect)}]`);
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
      m0: {
        raw_response: m0Result.response?.slice(0, 200) ?? null,
        extracted_letter: m0Letter,
        correct: m0IsCorrect,
        error: m0Result.error,
      },
      m3: {
        raw_response: m3Result.response?.slice(0, 200) ?? null,
        extracted_letter: m3Letter,
        correct: m3IsCorrect,
        error: m3Result.error,
      },
      ensemble: {
        answer: isContested ? null : (ensembleAnswer ?? null),
        contested: isContested,
        correct: ensembleIsCorrect,
      },
    });
  }

  // Summary
  const ensemblePct = questions.length > 0 ? ((ensembleCorrect / questions.length) * 100).toFixed(1) : '0.0';
  const border = '══════════════════════════════════════════════════';

  console.log(border);
  console.log(`${BOLD}2-MACHINE PRE-CANONICAL VALIDATION · BP086${RESET}`);
  console.log(border);
  console.log(`Score:        ${ensembleCorrect}/${questions.length} = ${ensemblePct}%`);
  console.log(`M0 accuracy:  ${m0Correct}/${questions.length}`);
  console.log(`M3 accuracy:  ${m3Correct}/${questions.length}`);
  console.log(`Contested:    ${contested} questions`);
  console.log(`Topology:     LAN-direct (NOT LAN-as-WAN — pre-canonical only)`);
  console.log(`M0:           ${M0_IP}:11434`);
  console.log(`M3:           ${m3ip}:11434`);
  console.log(border);
  console.log('');

  // Write JSON receipt
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const receiptDir = 'C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform\\BISHOP_DROPZONE\\00_FOUNDER_REVIEW';
  const receiptPath = join(receiptDir, `VALIDATION_RUN_RECEIPT_${timestamp}.json`);

  const receipt = {
    run_type: '2-machine-pre-canonical-validation',
    canonical: false,
    topology: 'LAN-direct (NOT LAN-as-WAN)',
    run_timestamp: new Date().toISOString(),
    mode,
    question_count: questions.length,
    machines: {
      M0: { ip: M0_IP, model: M0_MODEL, correct: m0Correct, total: questions.length },
      M3: { ip: m3ip, model: m3Model, correct: m3Correct, total: questions.length },
    },
    ensemble_score: {
      correct: ensembleCorrect,
      total: questions.length,
      pct: parseFloat(ensemblePct),
      contested,
    },
    questions: results,
    truth_always_note:
      'This is a pre-canonical 2-machine validation run using direct LAN Ollama dispatch. ' +
      'The canonical 4-machine THUNDERCLAP run uses LAN-as-WAN routing via relay.lianabanyan.com.',
  };

  try {
    if (!existsSync(receiptDir)) mkdirSync(receiptDir, { recursive: true });
    writeFileSync(receiptPath, JSON.stringify(receipt, null, 2), 'utf8');
    console.log(`Receipt written: ${receiptPath}`);
  } catch (err) {
    console.error(`WARNING: Could not write receipt: ${err.message}`);
  }

  // Exit code
  const passThreshold = mode === 'full' ? 0.60 : 0.60;
  const passPct = questions.length > 0 ? ensembleCorrect / questions.length : 0;
  if (passPct >= passThreshold) {
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
