#!/usr/bin/env node
/**
 * Mesh Orchestrator — THUNDERCLAP Cross-Machine MMLU-Pro
 * BP086 BLACK MAMBA × 30
 * Topology: LAN-as-WAN via relay.lianabanyan.com
 * Architecture: Option A (full-on-each-node ensemble)
 * Canon: canon_lan_as_wan_test_mode_4_machine_mesh_bp085
 */

import { getActivePeers } from './peer-discovery.js';
import { dispatchToAllNodes } from './question-dispatcher.js';
import { ensembleQuestion, scoreRun } from './ensemble.js';
import { buildReceiptEblet, writeReceiptEblet } from './receipt-writer.js';
import { QuestionResult } from './types.js';
import * as fs from 'fs';

interface Question {
  id: string;
  text: string;
  choices: string[];
  correct: string;
}

function loadQuestions(filePath: string): Question[] {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

async function main(): Promise<void> {
  const mode = process.argv[2] ?? 'mmlu-pro';
  const questionFile = process.argv[3] ?? `benchmarks/mmlu_pro_70q.json`;
  const minNodes = parseInt(process.argv[4] ?? '2', 10);

  console.log(`\n╔══════════════════════════════════════════════════════════════╗`);
  console.log(`║  THUNDERCLAP Mesh Orchestrator  ·  BP086 BLACK MAMBA × 30   ║`);
  console.log(`╚══════════════════════════════════════════════════════════════╝`);
  console.log(`Mode      : ${mode.toUpperCase()}`);
  console.log(`Topology  : LAN-as-WAN via relay.lianabanyan.com`);
  console.log(`Strategy  : Option A (full-on-each-node ensemble)`);
  console.log(`Min nodes : ${minNodes}`);
  console.log(``);

  // ── Step 1: Discover active peers ──────────────────────────────────────────
  console.log('[A1] Discovering active peers in peer_presence...');
  const nodes = await getActivePeers(minNodes);
  console.log(`[A1] ${nodes.length} active peers: ${nodes.map(n => `${n.machine_label}(${n.node_id.slice(0, 8)}...)`).join(', ')}`);

  // ── Step 2: Load questions ─────────────────────────────────────────────────
  console.log(`[A2] Loading questions from ${questionFile}`);
  const questions = loadQuestions(questionFile);
  console.log(`[A2] ${questions.length} questions loaded`);

  const startUtc = new Date().toISOString();
  const results: QuestionResult[] = [];
  let totalHexFrames = 0;
  let totalHexBytes = 0;
  let totalHexMs = 0;

  // ── Step 3: Dispatch all questions to all nodes (Option A) ─────────────────
  console.log(`\n[A3] Dispatching ${questions.length} questions × ${nodes.length} nodes...`);
  console.log(`     (${questions.length * nodes.length} total Plow runs via hex wire)\n`);

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const qLabel = String(i + 1).padStart(2, '0');
    console.log(`[Q${qLabel}/${questions.length}] ${q.id}...`);

    try {
      const nodeAnswers = await dispatchToAllNodes(nodes, q, { timeoutMs: 120000 });
      const result = ensembleQuestion(q.id, q.text, q.correct, nodeAnswers);
      results.push(result);

      // Accumulate hex wire stats
      for (const na of nodeAnswers) {
        totalHexFrames++;
        totalHexBytes += na.hex_frame_bytes;
        totalHexMs += na.hex_parse_latency_ms;
      }

      const flags = [
        result.is_correct ? '✅' : '❌',
        result.disagreement_flag ? '⚠️' : '',
        result.contested ? '🔴CONTESTED' : ''
      ].filter(Boolean).join(' ');

      console.log(`  → Ensemble: ${result.ensemble_winner} [${flags}] (${nodeAnswers.length} node votes)`);
    } catch (err) {
      // Truth-Always: log the failure, never hide it
      console.error(`  [ERROR] Q=${q.id}: ${err}`);
    }
  }

  const endUtc = new Date().toISOString();
  const score = scoreRun(results);

  console.log(`\n${'═'.repeat(66)}`);
  console.log(`THUNDERCLAP SCORE: ${score.correct}/${score.total} = ${score.pct}%`);
  console.log(`Answered: ${results.length}/${questions.length} questions`);

  const contested = results.filter(r => r.contested);
  const disagreements = results.filter(r => r.disagreement_flag);
  if (contested.length > 0) {
    console.log(`🔴 Contested (tie): ${contested.length} questions — flag for Founder review`);
  }
  if (disagreements.length > 0) {
    console.log(`⚠️  Disagreements: ${disagreements.length} questions — nodes split vote`);
  }
  console.log(`${'═'.repeat(66)}\n`);

  // ── Step 4: Build and write receipt eblet ─────────────────────────────────
  const runId = `${mode}_${new Date().toISOString().slice(0, 10)}_${nodes.length}nodes_bp086`;

  const receipt = buildReceiptEblet(
    runId,
    nodes,
    results,
    startUtc,
    endUtc,
    {
      total_frames: totalHexFrames,
      avg_bytes: totalHexFrames > 0 ? Math.round(totalHexBytes / totalHexFrames) : 0,
      avg_parse_ms: totalHexFrames > 0 ? Math.round(totalHexMs / totalHexFrames) : 0
    }
  );

  const receiptPath = writeReceiptEblet(receipt, `${runId}.eblet.md`);
  console.log(`[RECEIPT] Written to: ${receiptPath}`);
  console.log(`[DONE] THUNDERCLAP run complete. Receipt in Vault.`);
  console.log(`\nFOR THE KEEP!`);
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
