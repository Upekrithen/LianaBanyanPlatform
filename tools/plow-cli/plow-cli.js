#!/usr/bin/env node
/**
 * plow-cli.js — BP084 SEG-2
 * Standalone MMLU-Pro benchmark runner against local Ollama.
 * Node 18+ native fetch — no npm install required.
 *
 * Usage:
 *   node plow-cli.js <shard.json> [options]
 *
 * Options:
 *   --model <name>       Ollama model (default: gemma2:2b)
 *   --ollama <url>       Ollama base URL (default: http://localhost:11434)
 *   --out <file>         Output JSONL file (default: son_results.jsonl)
 *   --resume             Resume from checkpoint if it exists
 *   --timeout <ms>       Per-question timeout ms (default: 120000)
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ── CLI Argument Parsing ──────────────────────────────────────────────────────

const argv = process.argv.slice(2);

function getArg(flag, def) {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] ?? def : def;
}
function hasFlag(flag) { return argv.includes(flag); }

const shardFile = argv.find(a => !a.startsWith('--')) ?? null;
if (!shardFile) {
  console.error('Usage: node plow-cli.js <shard.json> [--model gemma2:2b] [--ollama http://localhost:11434] [--out son_results.jsonl] [--resume]');
  process.exit(1);
}

const MODEL     = getArg('--model',   'gemma2:2b');
const OLLAMA    = getArg('--ollama',  'http://localhost:11434').replace(/\/$/, '');
const OUT_FILE  = getArg('--out',     'son_results.jsonl');
const TIMEOUT   = parseInt(getArg('--timeout', '120000'), 10);
const RESUME    = hasFlag('--resume');
const CKPT_FILE = OUT_FILE + '.checkpoint';

// ── Constants ─────────────────────────────────────────────────────────────────

const PROGRESS_INTERVAL = 10;   // print progress every N questions
const CHECKPOINT_EVERY  = 10;   // checkpoint every N questions
const OPTION_LETTERS    = 'ABCDEFGHIJ';

// ── Prompt builder ────────────────────────────────────────────────────────────

function buildPrompt(q) {
  const opts = q.options.map((o, i) => `${OPTION_LETTERS[i]}. ${o}`).join('\n');
  const validLetters = OPTION_LETTERS.slice(0, q.options.length).split('').join(', ');
  return `Answer this multiple-choice question. Your response must be EXACTLY ONE letter (${validLetters}) — nothing else, no explanation, no punctuation.

Question: ${q.question}

${opts}

Letter:`;
}

// ── Ollama caller ─────────────────────────────────────────────────────────────
// Uses /api/chat for compatibility with thinking models (gemma4, gemma2, etc.)
// num_predict: 512 to allow thinking tokens before the actual answer letter.

async function callOllama(prompt) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    const resp = await fetch(`${OLLAMA}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        options: { temperature: 0.0, num_predict: 2048 },
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      return { response: null, error: `HTTP ${resp.status}: ${body.slice(0, 120)}` };
    }
    const data = await resp.json();
    // /api/chat returns data.message.content; thinking models may also set data.message.thinking
    const content = data.message?.content?.trim() ?? null;
    const thinking = data.message?.thinking?.trim() ?? null;
    // If content is empty but thinking has an answer, extract from thinking tail
    if ((!content || content === '') && thinking) {
      const tailMatch = thinking.match(/(?:answer\s+is|final\s+answer|therefore[,:]?\s+)[:\s]*([A-J])\b/i)
        ?? thinking.match(/\b([A-J])\s*(?:is\s+(?:correct|the\s+answer)|\.?\s*$)/i)
        ?? thinking.match(/answer[:\s]+([A-J])\b/i);
      if (tailMatch) return { response: tailMatch[1].toUpperCase(), error: null };
      // Last-resort: look for a lone letter at the very end of thinking
      const tailLone = thinking.slice(-100).match(/\b([A-J])\s*\.?\s*$/i);
      if (tailLone) return { response: tailLone[1].toUpperCase(), error: null };
      return { response: null, error: 'thinking-overflow: model exhausted token budget' };
    }
    return { response: content, error: null };
  } catch (err) {
    return { response: null, error: err.message ?? String(err) };
  }
}

// ── Answer parser ─────────────────────────────────────────────────────────────

function parseAnswer(responseText, numOptions) {
  if (!responseText) return { letter: null, confidence: 'low', quarantined: true };

  const upper = responseText.trim().toUpperCase();

  // Direct single letter match at start
  const directMatch = upper.match(/^([A-J])\b/);
  if (directMatch) {
    const letter = directMatch[1];
    if (OPTION_LETTERS.indexOf(letter) < numOptions) {
      return { letter, confidence: 'high', quarantined: false };
    }
  }

  // "Answer: X" or "The answer is X" pattern
  const prefixMatch = upper.match(/(?:ANSWER\s*[:IS]+\s*|THE\s+ANSWER\s+IS\s*)([A-J])\b/);
  if (prefixMatch) {
    const letter = prefixMatch[1];
    if (OPTION_LETTERS.indexOf(letter) < numOptions) {
      return { letter, confidence: 'medium', quarantined: false };
    }
  }

  // Any letter in a short response (< 10 chars)
  if (upper.length <= 10) {
    const anyLetter = upper.match(/([A-J])/);
    if (anyLetter) {
      const letter = anyLetter[1];
      if (OPTION_LETTERS.indexOf(letter) < numOptions) {
        return { letter, confidence: 'low', quarantined: false };
      }
    }
  }

  // Could not parse — quarantine
  return { letter: null, confidence: 'none', quarantined: true };
}

// ── Checkpoint ────────────────────────────────────────────────────────────────

function loadCheckpoint() {
  if (!RESUME || !fs.existsSync(CKPT_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(CKPT_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function saveCheckpoint(state) {
  fs.writeFileSync(CKPT_FILE, JSON.stringify(state), 'utf8');
}

// ── ETA calculator ────────────────────────────────────────────────────────────

function formatEta(ms) {
  if (!ms || ms <= 0) return '?';
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m < 60) return `${m}m ${r}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

// ── Result writer ─────────────────────────────────────────────────────────────

let outStream = null;

function openOutStream(append) {
  outStream = fs.createWriteStream(OUT_FILE, { flags: append ? 'a' : 'w' });
}

function writeResult(rec) {
  outStream.write(JSON.stringify(rec) + '\n');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // Load shard
  if (!fs.existsSync(shardFile)) {
    console.error(`Shard file not found: ${shardFile}`);
    process.exit(1);
  }
  const shard = JSON.parse(fs.readFileSync(shardFile, 'utf8'));
  const questions = shard.questions ?? [];
  const total = questions.length;

  if (total === 0) {
    console.error('Shard contains 0 questions.');
    process.exit(1);
  }

  console.log(`\nMnemosyneC Plow CLI — BP084`);
  console.log(`Shard  : ${shardFile} (${total} questions)`);
  console.log(`Model  : ${MODEL}`);
  console.log(`Ollama : ${OLLAMA}`);
  console.log(`Output : ${OUT_FILE}`);
  console.log(`Resume : ${RESUME}`);
  console.log('');

  // Verify Ollama connection
  try {
    const pingResp = await fetch(`${OLLAMA}/api/tags`, { signal: AbortSignal.timeout(5000) });
    if (!pingResp.ok) throw new Error(`HTTP ${pingResp.status}`);
    const tags = await pingResp.json();
    const modelNames = (tags.models ?? []).map(m => m.name);
    const modelPresent = modelNames.some(n => n === MODEL || n.startsWith(MODEL.replace(':latest', '')));
    if (!modelPresent) {
      console.warn(`[WARN] Model "${MODEL}" not found in Ollama. Available: ${modelNames.slice(0, 6).join(', ')}`);
      console.warn(`       Run: ollama pull ${MODEL}`);
      console.warn('       Continuing anyway — Ollama will attempt to load it...');
    } else {
      console.log(`[OK] Ollama connected. Model "${MODEL}" found.`);
    }
  } catch (err) {
    console.error(`[ERROR] Cannot reach Ollama at ${OLLAMA}: ${err.message}`);
    console.error('        Make sure Ollama is running: ollama serve');
    process.exit(1);
  }

  // Load checkpoint if resuming
  const ckpt = loadCheckpoint();
  let startIdx = 0;
  let correct = 0;
  let quarantined = 0;
  let domainStats = {};  // domain -> { correct, total, quarantined }

  if (ckpt) {
    startIdx    = ckpt.next_index ?? 0;
    correct     = ckpt.correct ?? 0;
    quarantined = ckpt.quarantined ?? 0;
    domainStats = ckpt.domain_stats ?? {};
    console.log(`[RESUME] Continuing from question ${startIdx + 1}/${total} (${correct} correct, ${quarantined} quarantined so far)`);
    openOutStream(true);  // append mode
  } else {
    openOutStream(false); // fresh run
  }

  const startWallMs = Date.now();
  let questionMs = []; // rolling window for ETA

  for (let i = startIdx; i < total; i++) {
    const q = questions[i];
    const qStart = Date.now();

    const prompt = buildPrompt(q);
    const { response, error } = await callOllama(prompt);
    const elapsed = Date.now() - qStart;

    // Parse answer
    const { letter, confidence, quarantined: isQuar } = parseAnswer(response, (q.options ?? []).length);

    // Check correctness
    let isCorrect = false;
    if (!isQuar && letter) {
      const expectedLetter = q.answer_letter ?? 'A';
      isCorrect = letter === expectedLetter;
    }

    if (isCorrect) correct++;
    if (isQuar) quarantined++;

    // Update domain stats
    const domain = q.domain ?? q.source_category ?? 'unknown';
    if (!domainStats[domain]) domainStats[domain] = { correct: 0, total: 0, quarantined: 0 };
    domainStats[domain].total++;
    if (isCorrect) domainStats[domain].correct++;
    if (isQuar) domainStats[domain].quarantined++;

    // Write result eblet
    const rec = {
      question_id:    q.question_id,
      domain,
      question:       q.question,
      model_answer:   letter,
      correct_letter: q.answer_letter,
      correct_text:   q.correct_answer,
      model_response: response,
      correct:        isCorrect,
      quarantined:    isQuar,
      confidence,
      error:          error ?? null,
      elapsed_ms:     elapsed,
      node_id:        shard.node_id ?? 'unknown',
      model:          MODEL,
      timestamp:      new Date().toISOString(),
    };
    writeResult(rec);

    // Rolling ETA
    questionMs.push(elapsed);
    if (questionMs.length > 20) questionMs.shift();
    const avgMs = questionMs.reduce((s, v) => s + v, 0) / questionMs.length;
    const remaining = total - (i + 1);
    const etaMs = remaining * avgMs;

    // Progress print
    const done = i + 1;
    if (done % PROGRESS_INTERVAL === 0 || done === total) {
      const pct = ((correct / (done - quarantined || 1)) * 100).toFixed(1);
      const domainLabel = domain.slice(0, 12).padEnd(12);
      process.stdout.write(
        `[${String(done).padStart(3)}/${total}] ${domainLabel} · ${pct}% · ${quarantined} quarantined · ETA ${formatEta(etaMs)}\n`
      );
    }

    // Checkpoint
    if (done % CHECKPOINT_EVERY === 0) {
      saveCheckpoint({
        shard_file: shardFile,
        model: MODEL,
        next_index: i + 1,
        correct,
        quarantined,
        domain_stats: domainStats,
        saved_at: new Date().toISOString(),
      });
    }
  }

  outStream.end();

  // Final summary
  const wallSec = Math.round((Date.now() - startWallMs) / 1000);
  const answered = total - quarantined;
  const score = answered > 0 ? ((correct / answered) * 100).toFixed(1) : '0.0';

  console.log('');
  console.log('─'.repeat(60));
  console.log(`[${total}/${total}] · ${correct} correct · ${quarantined} quarantined · score ${score}%`);
  console.log(`Runtime: ${formatEta(wallSec * 1000)} · Output: ${OUT_FILE}`);
  console.log('─'.repeat(60));

  // Domain breakdown
  console.log('\nDomain breakdown:');
  for (const [dom, st] of Object.entries(domainStats)) {
    const domAns = st.total - st.quarantined;
    const domScore = domAns > 0 ? ((st.correct / domAns) * 100).toFixed(1) : '0.0';
    console.log(`  ${dom.padEnd(20)} ${st.correct}/${st.total} (${domScore}%) · ${st.quarantined} quarantined`);
  }

  // Clean up checkpoint on successful completion
  if (fs.existsSync(CKPT_FILE)) {
    try { fs.unlinkSync(CKPT_FILE); } catch { /* ok */ }
  }

  console.log('\nDone. Email son_results.jsonl (or the --out file) back to Dad.');
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
