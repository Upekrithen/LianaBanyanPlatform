#!/usr/bin/env node
/**
 * generate-shard.js — BP084 SEG-1
 * Reads MMLU-Pro per-domain data from lb-reproducibility-pack and produces
 * per-machine shard files under tools/plow-cli/shards/
 *
 * Usage: node generate-shard.js [--node m5] [--out ./shards]
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────────────────────────

const WORKSPACE_ROOT = path.resolve(__dirname, '..', '..');
const DATASET_DIR = path.join(WORKSPACE_ROOT, 'lb-reproducibility-pack', 'datasets', 'mmlu_pro_per_domain');
const SHARDS_DIR = path.join(__dirname, 'shards');

// 5-node plan (1,400 q total)
const NODE_PLANS = {
  m0: { model_tier: 'gemma4:12b', domains: ['math', 'chemistry', 'law', 'physics'],        q_per_domain: 100 },
  m1: { model_tier: 'gemma4:12b', domains: ['biology', 'business', 'economics'],            q_per_domain: 100 },
  m2: { model_tier: 'gemma4:12b', domains: ['engineering', 'computer_science'],             q_per_domain: 100 },
  m3: { model_tier: 'gemma4:12b', domains: ['philosophy', 'history'],                       q_per_domain: 100 },
  m5: { model_tier: 'gemma2:2b',  domains: ['psychology', 'other'],                         q_per_domain: 100 },
  // test20: lightweight 20-q shard for M0 dry-run
  test20: { model_tier: 'gemma4:12b', domains: ['math', 'psychology'],                      q_per_domain: 10 },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function seededShuffle(arr, seed) {
  // Deterministic Fisher-Yates with a simple LCG seed so shards are reproducible
  let s = seed >>> 0;
  const lcg = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xFFFFFFFF; };
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(lcg() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function stringToSeed(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

function loadDomainQuestions(domain) {
  const domainDir = path.join(DATASET_DIR, domain);
  const questionsFile = path.join(domainDir, 'questions.json');
  if (!fs.existsSync(questionsFile)) {
    console.warn(`  [WARN] No questions.json for domain "${domain}" at ${questionsFile}`);
    return [];
  }
  const raw = fs.readFileSync(questionsFile, 'utf8');
  const questions = JSON.parse(raw);
  if (!Array.isArray(questions)) {
    console.warn(`  [WARN] questions.json for "${domain}" is not an array`);
    return [];
  }
  return questions;
}

function mapQuestion(q, domain, index) {
  // Normalise format: options array → lettered options A-J
  const opts = Array.isArray(q.options) ? q.options : [];
  const letters = 'ABCDEFGHIJ';

  // Determine correct answer letter
  let answer_letter = null;
  if (q.correct_answer) {
    const idx = opts.indexOf(q.correct_answer);
    if (idx >= 0) answer_letter = letters[idx];
  }
  // Fallback: if data has answer_index directly
  if (!answer_letter && typeof q.answer_index === 'number') {
    answer_letter = letters[q.answer_index] ?? null;
  }
  // Fallback: single-letter 'answer' field
  if (!answer_letter && q.answer && /^[A-J]$/.test(q.answer)) {
    answer_letter = q.answer;
  }

  return {
    question_id: q.source_id ?? `${domain}_${index}`,
    domain,
    question: q.question ?? '',
    options: opts,
    correct_answer: q.correct_answer ?? (answer_letter ? opts[letters.indexOf(answer_letter)] : ''),
    answer_letter: answer_letter ?? 'A',
    source_category: q.source_category ?? domain,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

function generateShard(nodeId) {
  const plan = NODE_PLANS[nodeId];
  if (!plan) {
    console.error(`Unknown node: ${nodeId}. Available: ${Object.keys(NODE_PLANS).join(', ')}`);
    process.exit(1);
  }

  console.log(`\nGenerating shard for node ${nodeId} (model: ${plan.model_tier})`);

  const allQuestions = [];

  for (const domain of plan.domains) {
    console.log(`  Loading domain: ${domain}`);
    const rawQuestions = loadDomainQuestions(domain);
    const seed = stringToSeed(`${nodeId}:${domain}:bp084`);
    const shuffled = seededShuffle(rawQuestions, seed);
    const selected = shuffled.slice(0, plan.q_per_domain);
    console.log(`  ${domain}: ${rawQuestions.length} available → ${selected.length} selected`);
    selected.forEach((q, i) => allQuestions.push(mapQuestion(q, domain, i)));
  }

  const shard = {
    node_id: nodeId,
    model_tier: plan.model_tier,
    domains: plan.domains,
    total_questions: allQuestions.length,
    generated_at: new Date().toISOString(),
    seed_version: 'bp084-v1',
    questions: allQuestions,
  };

  fs.mkdirSync(SHARDS_DIR, { recursive: true });
  const outFile = path.join(SHARDS_DIR, `${nodeId}_shard.json`);
  fs.writeFileSync(outFile, JSON.stringify(shard, null, 2), 'utf8');
  console.log(`  → Written ${allQuestions.length} questions to ${outFile}`);
  return outFile;
}

// ── CLI entry ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const nodeArg = args.find(a => !a.startsWith('--')) ?? null;
const generateAll = args.includes('--all');

if (generateAll) {
  for (const nodeId of Object.keys(NODE_PLANS)) {
    generateShard(nodeId);
  }
} else if (nodeArg) {
  generateShard(nodeArg);
} else {
  // Default: generate m5 + test20 shards
  console.log('No node specified — generating m5 and test20 shards');
  generateShard('m5');
  generateShard('test20');
  // Also generate other node shards
  for (const nid of ['m0', 'm1', 'm2', 'm3']) {
    generateShard(nid);
  }
}

console.log('\nShard generation complete.');
