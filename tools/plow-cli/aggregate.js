#!/usr/bin/env node
/**
 * aggregate.js — BP084 SEG-3
 * Merges N *_results.jsonl files into aggregate summary.
 *
 * Usage:
 *   node aggregate.js m0_results.jsonl m1_results.jsonl ... --out aggregate_summary.json
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ── CLI Parsing ───────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const outIdx = argv.indexOf('--out');
const OUT_FILE = outIdx >= 0 ? argv[outIdx + 1] : 'aggregate_summary.json';
const AGG_JSONL = OUT_FILE.replace(/\.json$/, '') + '_lines.jsonl';

const inputFiles = argv.filter((a, i) => !a.startsWith('--') && !(argv[i - 1] === '--out'));

if (inputFiles.length === 0) {
  console.error('Usage: node aggregate.js <file1.jsonl> [file2.jsonl ...] [--out aggregate_summary.json]');
  process.exit(1);
}

// ── JSONL loader ──────────────────────────────────────────────────────────────

function loadJsonl(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[WARN] File not found: ${filePath} — skipping`);
    return [];
  }
  const lines = fs.readFileSync(filePath, 'utf8').split('\n').filter(l => l.trim());
  const records = [];
  for (const line of lines) {
    try { records.push(JSON.parse(line)); } catch { /* skip malformed */ }
  }
  return records;
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  console.log('\nMnemosyneC Aggregate — BP084 SEG-3');
  console.log(`Input files: ${inputFiles.join(', ')}`);
  console.log(`Output     : ${OUT_FILE}\n`);

  const allRecords = [];
  const nodeHeaders = [];

  for (const filePath of inputFiles) {
    const records = loadJsonl(filePath);
    if (records.length === 0) continue;

    // Infer node_id from records or filename
    const nodeId = records[0]?.node_id ?? path.basename(filePath).replace('_results.jsonl', '');
    const model  = records[0]?.model  ?? 'unknown';

    // Compute per-node stats
    const startTs = records.reduce((min, r) => r.timestamp < min ? r.timestamp : min, records[0]?.timestamp ?? '');
    const endTs   = records.reduce((max, r) => r.timestamp > max ? r.timestamp : max, records[0]?.timestamp ?? '');

    // Estimate runtime from first/last timestamp
    let runtime_seconds = null;
    try {
      runtime_seconds = Math.round((new Date(endTs) - new Date(startTs)) / 1000);
    } catch { /* ok */ }

    const total_q    = records.length;
    const quarantine = records.filter(r => r.quarantined).length;
    const answered   = total_q - quarantine;
    const correct    = records.filter(r => r.correct).length;
    const accuracy   = answered > 0 ? Math.round((correct / answered) * 10000) / 100 : 0;

    nodeHeaders.push({
      node_id: nodeId,
      model,
      total_q,
      correct,
      quarantined: quarantine,
      accuracy,
      runtime_seconds,
    });

    allRecords.push(...records);
    console.log(`  ${nodeId} (${model}): ${correct}/${total_q} correct, ${quarantine} quarantined, ${accuracy}%`);
  }

  // Per-domain accuracy across all nodes
  const domainMap = {};
  for (const r of allRecords) {
    const d = r.domain ?? 'unknown';
    if (!domainMap[d]) domainMap[d] = { correct: 0, total: 0, quarantined: 0 };
    domainMap[d].total++;
    if (r.correct) domainMap[d].correct++;
    if (r.quarantined) domainMap[d].quarantined++;
  }

  const per_domain_accuracy = {};
  for (const [dom, st] of Object.entries(domainMap)) {
    const ans = st.total - st.quarantined;
    per_domain_accuracy[dom] = {
      total:      st.total,
      correct:    st.correct,
      quarantined: st.quarantined,
      accuracy:   ans > 0 ? Math.round((st.correct / ans) * 10000) / 100 : 0,
    };
  }

  // Overall totals
  const total_correct    = allRecords.filter(r => r.correct).length;
  const total_quarantine = allRecords.filter(r => r.quarantined).length;
  const total_all        = allRecords.length;
  const total_answered   = total_all - total_quarantine;
  const overall_score    = total_answered > 0
    ? Math.round((total_correct / total_answered) * 10000) / 100
    : 0;

  // Build summary object
  const summary = {
    generated_at:         new Date().toISOString(),
    source_version:       'bp084-aggregate-v1',
    total_questions:      total_all,
    total_correct:        total_correct,
    total_quarantined:    total_quarantine,
    overall_score_pct:    overall_score,
    node_count:           nodeHeaders.length,
    nodes:                nodeHeaders,
    per_domain_accuracy,
  };

  // Write aggregate_summary.json
  fs.writeFileSync(OUT_FILE, JSON.stringify(summary, null, 2), 'utf8');
  console.log(`\n→ Summary written to ${OUT_FILE}`);

  // Write merged aggregate JSONL
  const aggStream = fs.createWriteStream(AGG_JSONL, { flags: 'w' });
  for (const r of allRecords) aggStream.write(JSON.stringify(r) + '\n');
  aggStream.end();
  console.log(`→ Merged JSONL written to ${AGG_JSONL}`);

  // Print summary
  console.log('\n' + '─'.repeat(60));
  console.log(`AGGREGATE SUMMARY`);
  console.log(`  Total questions : ${total_all}`);
  console.log(`  Total correct   : ${total_correct}`);
  console.log(`  Total quarantined: ${total_quarantine}`);
  console.log(`  Overall score   : ${overall_score}%`);
  console.log('─'.repeat(60));

  console.log('\nPer-node receipt:');
  for (const n of nodeHeaders) {
    const rt = n.runtime_seconds != null ? `${n.runtime_seconds}s` : '?';
    console.log(`  ${n.node_id.padEnd(6)} ${n.model.padEnd(14)} q=${n.total_q} correct=${n.correct} quar=${n.quarantined} acc=${n.accuracy}% rt=${rt}`);
  }

  console.log('\nPer-domain accuracy:');
  for (const [dom, st] of Object.entries(per_domain_accuracy)) {
    console.log(`  ${dom.padEnd(20)} ${st.correct}/${st.total} (${st.accuracy}%) · ${st.quarantined} quarantined`);
  }
}

main();
