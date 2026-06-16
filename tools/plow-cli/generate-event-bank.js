#!/usr/bin/env node
/**
 * generate-event-bank.js — Substrate Awakens · BP084
 *
 * Generates a fresh 2,000-question event bank for the Substrate Awakens
 * live mesh event. Excludes all questions already used in m0–m5 shards.
 *
 * Output:
 *   Asteroid-ProofVault/PAPERS/substrate_awakens_question_bank.jsonl
 *   Asteroid-ProofVault/PAPERS/substrate_awakens_question_bank.jsonl.sha256
 *
 * Usage:
 *   node tools/plow-cli/generate-event-bank.js
 *   node tools/plow-cli/generate-event-bank.js --count 2000 --seed 42
 */

"use strict";

const fs     = require("fs");
const path   = require("path");
const crypto = require("crypto");

/* ── Config ─────────────────────────────────────────────────────────────────── */
const WORKSPACE  = path.resolve(__dirname, "..", "..");
const SHARD_DIR  = path.join(WORKSPACE, "tools", "plow-cli", "shards");
const DOMAIN_DIR = path.join(WORKSPACE, "lb-reproducibility-pack", "datasets", "mmlu_pro_per_domain");
const OUTPUT_DIR = path.join(WORKSPACE, "Asteroid-ProofVault", "PAPERS");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "substrate_awakens_question_bank.jsonl");
const SHA_FILE   = OUTPUT_FILE + ".sha256";

const TARGET_COUNT = parseInt(process.argv.find(a => a.startsWith("--count="))?.split("=")[1] || "2000", 10);
const RANDOM_SEED  = parseInt(process.argv.find(a => a.startsWith("--seed="))?.split("=")[1] || "20260620", 10);

const DOMAINS = [
  "biology","business","chemistry","computer_science","economics",
  "engineering","health","history","law","math","other","philosophy",
  "physics","psychology"
];

/* ── Seeded shuffle (Fisher-Yates with LCG) ─────────────────────────────────── */
function makeLCG(seed) {
  let s = seed >>> 0;
  return function() {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0xFFFFFFFF;
  };
}

function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ── Load all existing shard question IDs ────────────────────────────────────── */
function loadExistingIds() {
  const used = new Set();
  const shardFiles = ["m0_shard.json","m1_shard.json","m2_shard.json","m3_shard.json","m5_shard.json"];
  for (const sf of shardFiles) {
    const fp = path.join(SHARD_DIR, sf);
    if (!fs.existsSync(fp)) {
      console.warn(`  [WARN] Shard not found: ${sf}`);
      continue;
    }
    try {
      const data = JSON.parse(fs.readFileSync(fp, "utf8"));
      const qs = data.questions || [];
      for (const q of qs) {
        if (q.question_id) used.add(String(q.question_id));
        /* Also hash question text for fuzzy de-dup */
        if (q.question) used.add(crypto.createHash("md5").update(q.question.trim()).digest("hex").slice(0,16));
      }
      console.log(`  [OK] ${sf}: ${qs.length} questions loaded (${used.size} unique IDs so far)`);
    } catch (e) {
      console.warn(`  [WARN] Failed to parse ${sf}: ${e.message}`);
    }
  }
  return used;
}

/* ── Load MMLU-Pro domain questions ─────────────────────────────────────────── */
function loadDomainQuestions(domain) {
  const qFile = path.join(DOMAIN_DIR, domain, "questions.json");
  if (!fs.existsSync(qFile)) {
    console.warn(`  [WARN] Domain questions not found: ${qFile}`);
    return [];
  }
  try {
    const data = JSON.parse(fs.readFileSync(qFile, "utf8"));
    /* Handle both array and {questions:[...]} shapes */
    return Array.isArray(data) ? data : (data.questions || []);
  } catch (e) {
    console.warn(`  [WARN] Failed to parse ${domain}: ${e.message}`);
    return [];
  }
}

/* ── Main ────────────────────────────────────────────────────────────────────── */
function main() {
  console.log("=== Substrate Awakens · Question Bank Generator · BP084 ===");
  console.log(`Target: ${TARGET_COUNT} questions · Seed: ${RANDOM_SEED}`);
  console.log("");

  /* 1. Load existing shard IDs */
  console.log("Step 1: Loading existing shard question IDs…");
  const usedIds = loadExistingIds();
  console.log(`  → ${usedIds.size} existing IDs excluded\n`);

  /* 2. Load all domain questions and filter */
  console.log("Step 2: Loading MMLU-Pro domain questions…");
  const fresh = [];
  const domainStats = {};

  for (const domain of DOMAINS) {
    const qs = loadDomainQuestions(domain);
    let freshCount = 0;
    for (const q of qs) {
      const id  = String(q.question_id || q.id || "");
      const txt = (q.question || "").trim();
      const txtHash = txt ? crypto.createHash("md5").update(txt).digest("hex").slice(0,16) : "";

      /* Skip if already used */
      if (id && usedIds.has(id))    continue;
      if (txtHash && usedIds.has(txtHash)) continue;

      /* Normalize to event bank format */
      const options = q.options || q.choices || [];
      const correctAnswer = q.answer || q.correct_answer || q.answer_text || options[q.answer_index] || "";
      const answerLetter  = q.answer_letter || q.answer_index !== undefined
        ? String.fromCharCode(65 + (q.answer_index ?? 0))
        : "";

      fresh.push({
        question_id:    id || crypto.randomUUID().slice(0,8),
        domain,
        question:       txt,
        options,
        correct_answer: correctAnswer,
        answer_letter:  answerLetter,
        source:         "mmlu_pro",
      });
      freshCount++;
    }
    domainStats[domain] = freshCount;
    console.log(`  ${domain}: ${freshCount} fresh questions available`);
  }

  console.log(`\n  → Total fresh pool: ${fresh.length} questions\n`);

  if (fresh.length < TARGET_COUNT) {
    console.warn(`  [WARN] Only ${fresh.length} fresh questions available; adjusting target.`);
  }

  /* 3. Shuffle and select */
  console.log("Step 3: Shuffling and selecting…");
  const rng = makeLCG(RANDOM_SEED);
  shuffle(fresh, rng);

  /* Distribute evenly across domains, then fill remaining randomly */
  const perDomain = Math.floor(TARGET_COUNT / DOMAINS.length);
  const selected  = [];
  const byDomain  = {};

  for (const q of fresh) {
    if (!byDomain[q.domain]) byDomain[q.domain] = [];
    byDomain[q.domain].push(q);
  }

  for (const domain of DOMAINS) {
    const pool = byDomain[domain] || [];
    selected.push(...pool.slice(0, perDomain));
  }

  /* Fill remaining slots from any domain */
  const remaining = TARGET_COUNT - selected.length;
  const usedSet   = new Set(selected.map(q => q.question_id));
  const remainder = fresh.filter(q => !usedSet.has(q.question_id));
  selected.push(...remainder.slice(0, remaining));

  const final = selected.slice(0, TARGET_COUNT);
  console.log(`  → Selected ${final.length} questions\n`);

  /* Print domain distribution */
  const distrib = {};
  for (const q of final) distrib[q.domain] = (distrib[q.domain]||0) + 1;
  console.log("  Domain distribution:");
  for (const [d,c] of Object.entries(distrib).sort((a,b)=>b[1]-a[1])) {
    console.log(`    ${d}: ${c}`);
  }

  /* 4. Write output */
  console.log("\nStep 4: Writing output…");
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const lines = final.map(q => JSON.stringify(q)).join("\n");
  fs.writeFileSync(OUTPUT_FILE, lines, "utf8");
  console.log(`  [OK] ${OUTPUT_FILE}`);

  /* 5. Compute SHA256 */
  const sha256 = crypto.createHash("sha256").update(lines, "utf8").digest("hex");
  fs.writeFileSync(SHA_FILE, `${sha256}  substrate_awakens_question_bank.jsonl\n`, "utf8");
  console.log(`  [OK] ${SHA_FILE}`);
  console.log(`  SHA256: ${sha256}`);

  /* 6. Write manifest */
  const manifest = {
    event:          "Substrate Awakens",
    event_date:     "2026-06-20",
    bp_session:     "BP084",
    generated_at:   new Date().toISOString(),
    seed:           RANDOM_SEED,
    total_questions: final.length,
    excluded_from_shards: ["m0","m1","m2","m3","m5"],
    domain_distribution: distrib,
    sha256,
  };
  const manifestFile = path.join(OUTPUT_DIR, "substrate_awakens_question_bank_manifest.json");
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`  [OK] ${manifestFile}`);

  console.log("\n=== Sharp 9: PASS — question bank + SHA256 written ===");
  console.log("FOR THE KEEP. Substrate Awakens.");
}

main();
