/**
 * trial-02b-score.mjs — Wave II scoring SEG
 * BP089 BLACK MAMBA Marathon Session 3 DAWN RIDE
 *
 * Reads PASS_B_4PEER_responses.jsonl.
 * Computes per-peer scores (correct/70) + aggregate (correct/280).
 * Computes per-question variance (how many peers agreed on the answer).
 * Outputs summary table + variance report.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const OUTPUT_PATH = resolve('C:/Users/Administrator/Documents/Asteroid-ProofVault/receipts/THUNDERCLAP/Trial_02b/PASS_B_4PEER_responses.jsonl');

function main() {
  let raw;
  try {
    raw = readFileSync(OUTPUT_PATH, 'utf8');
  } catch {
    console.error(`Cannot read: ${OUTPUT_PATH}\nRun trial-02b-pass-b-fire.mjs first.`);
    process.exit(1);
  }

  const allRows = raw.replace(/^\uFEFF/, '').split('\n').filter(l => l.trim()).map(l => JSON.parse(l));
  // Deduplicate: keep LAST entry per (question_id, peer_name) to handle re-runs
  const dedupeMap = new Map();
  for (const row of allRows) {
    const key = `${row.question_id}|${row.peer_name}`;
    dedupeMap.set(key, row); // last write wins
  }
  const rows = Array.from(dedupeMap.values());
  console.log(`\n=== trial-02b-score.mjs · BP089 Wave II scoring ===`);
  console.log(`Raw rows: ${allRows.length} → deduplicated: ${rows.length}\n`);

  // Per-peer scoring
  const peerScores = {};
  const peerErrors = {};
  for (const row of rows) {
    const name = row.peer_name;
    if (!peerScores[name]) { peerScores[name] = 0; peerErrors[name] = 0; }
    if (row.correct_yn === true) peerScores[name]++;
    if (row.error) peerErrors[name]++;
  }

  console.log('─── Per-Peer Scores ───────────────────────────────');
  const peers = Object.keys(peerScores);
  let totalCorrect = 0;
  for (const name of peers) {
    const score = peerScores[name];
    const pct = ((score / 70) * 100).toFixed(1);
    const errs = peerErrors[name] > 0 ? ` (${peerErrors[name]} errors)` : '';
    console.log(`  ${name.padEnd(5)}: ${score}/70 (${pct}%)${errs}`);
    totalCorrect += score;
  }

  const respondingPeers = peers.filter(p => peerErrors[p] < 70);
  const peerCount = peers.length;
  const maxPossible = peerCount * 70;
  const aggregate_pct = ((totalCorrect / maxPossible) * 100).toFixed(1);
  console.log(`\n  AGGREGATE: ${totalCorrect}/${maxPossible} (${aggregate_pct}%) across ${peerCount} peers`);

  // Per-question variance (only for peers that responded)
  const qMap = {};
  for (const row of rows) {
    const qid = row.question_id;
    if (!qMap[qid]) qMap[qid] = { question: row.question, correct: row.correct, answers: [], domain: row.domain };
    if (row.model_answer) qMap[qid].answers.push(row.model_answer);
  }

  let fullAgreement = 0;
  let disagreement = 0;
  const disagreementCases = [];

  for (const [qid, q] of Object.entries(qMap)) {
    const answerSet = new Set(q.answers);
    if (answerSet.size <= 1) {
      fullAgreement++;
    } else {
      disagreement++;
      const counts = {};
      for (const a of q.answers) { counts[a] = (counts[a] ?? 0) + 1; }
      disagreementCases.push({ qid, domain: q.domain, correct: q.correct, counts, question: q.question.slice(0, 60) });
    }
  }

  console.log('\n─── Variance Summary ──────────────────────────────');
  console.log(`  Full agreement (all peers same answer): ${fullAgreement}/70`);
  console.log(`  Disagreement (peers gave different answers): ${disagreement}/70`);

  if (disagreementCases.length > 0) {
    console.log('\n─── Disagreement Cases ────────────────────────────');
    for (const d of disagreementCases.slice(0, 15)) {
      const countStr = Object.entries(d.counts).map(([a, n]) => `${a}:${n}`).join(' ');
      console.log(`  Q${d.qid} [${d.domain}] correct=${d.correct} → ${countStr}: "${d.question}..."`);
    }
    if (disagreementCases.length > 15) {
      console.log(`  ... and ${disagreementCases.length - 15} more`);
    }
  }

  console.log('\n─── Receipt Summary ───────────────────────────────');
  console.log(`  Pass A anchor: 70/70 claude · M0 · pearl 0fa461c8`);
  for (const name of peers) {
    console.log(`  Pass B ${name}: ${peerScores[name]}/70`);
  }
  console.log(`  Pass B aggregate: ${totalCorrect}/${maxPossible} (${peerCount} peers)`);
  console.log(`  Variance: ${fullAgreement} full agreement · ${disagreement} disagreement`);
  console.log('──────────────────────────────────────────────────\n');

  return { peerScores, totalCorrect, fullAgreement, disagreement };
}

main();
