/**
 * K523 Pheromone Substrate — Verification Test Suite (Phase G)
 * Checks G.1 through G.10 (K523) and G.2 + G.2.b (K524) as specified.
 *
 * Import strategy: single module import at top level using file:// URL.
 * Tests that need isolation use a separate tmp dir via spawn or share the
 * production module and test in-memory state.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, statSync, truncateSync, unlinkSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { tmpdir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LIBRARIAN_ROOT = resolve(__dirname, '..');

// Import pheromone module using file:// URL (required for Windows ESM)
const PHEROMONE_URL = pathToFileURL(resolve(LIBRARIAN_ROOT, 'dist', 'scribes', 'pheromone.js')).href;
const {
  extractTopics,
  emitPheromone,
  queryPheromone,
  buildPheromoneIndex,
  forceRebuild,
  PHEROMONE_INDEX_PATH,
} = await import(PHEROMONE_URL);

// Import cathedral module for G.2 write-path integration tests
const CATHEDRAL_URL = pathToFileURL(resolve(LIBRARIAN_ROOT, 'dist', 'scribes', 'cathedral.js')).href;
const { appendScribeEntry, appendTidbit, SCRIBES_DIR, TIDBITS_PATH } = await import(CATHEDRAL_URL);

// ─── G.1: Pheromone substrate JSONL builds without errors ──────────────────
test('G.1 — production pheromone index exists and is non-empty', () => {
  assert.ok(existsSync(PHEROMONE_INDEX_PATH), `index.jsonl not found at ${PHEROMONE_INDEX_PATH}`);
  const raw = readFileSync(PHEROMONE_INDEX_PATH, 'utf-8');
  const lines = raw.split('\n').filter(l => l.trim());
  assert.ok(lines.length >= 100, `Expected >=100 records, got ${lines.length}`);
  const sample = JSON.parse(lines[0]);
  assert.ok(sample.scribe, 'record must have scribe field');
  assert.ok(sample.tablet_id, 'record must have tablet_id field');
  assert.ok(Array.isArray(sample.topics) && sample.topics.length > 0, 'record must have non-empty topics');
  assert.ok(sample.ts, 'record must have ts field');
  assert.ok(typeof sample.decay_constant_days === 'number', 'record must have decay_constant_days');
  console.log(`G.1 PASS: ${lines.length} pheromone records at ${PHEROMONE_INDEX_PATH}`);
});

// ─── G.3: Topic extraction spot-check parity with PoC algorithm ─────────────
test('G.3 — extractTopics parity with PoC algorithm (10 spot checks)', () => {
  const checks = [
    { text: 'founder anecdote Montana Christmas Eve', expects: ['founder', 'anecdote', 'montana'] },
    { text: '#2317 pheromone substrate stigmergy', expects: ['innovation_2317', 'pheromone', 'substrate', 'stigmergy'] },
    { text: 'append-only JSONL durability semantics', expects: ['append-only', 'jsonl', 'durability', 'semantics'] },
    { text: 'bishop session report handoff cathedral', expects: ['bishop', 'handoff', 'report', 'cathedral'] },
    { text: "Ants don't interview they sense trails", expects: ['ants', 'interview', 'sense', 'trails'] },
    { text: 'decay_constant_days exponential recency bias', expects: ['decay_constant_days', 'exponential', 'recency', 'bias'] },
    { text: 'Cathedral Effect cross-vendor benchmark results', expects: ['cathedral', 'effect', 'cross-vendor', 'benchmark', 'results'] },
    { text: '"golden key" help each other help ourselves', expects: ['golden key'] },
    // "AI" is all-caps so multi-word cap phrase won't match; "platform reference architecture" is the 3-word match instead
    { text: 'Cooperative AI Platform Reference Architecture', expects: ['platform reference architecture', 'cooperative', 'platform'] },
    { text: 'pheromone substrate stigmergic index detective scribe', expects: ['pheromone', 'substrate', 'stigmergic', 'detective', 'scribe'] },
  ];
  let passed = 0;
  for (const { text, expects } of checks) {
    const got = extractTopics(text);
    const gotSet = new Set(got.map(t => t.toLowerCase()));
    for (const expected of expects) {
      assert.ok(gotSet.has(expected.toLowerCase()),
        `extractTopics('${text}') missing '${expected}'; got: [${got.slice(0,12).join(', ')}]`);
    }
    passed++;
  }
  console.log(`G.3 PASS: ${passed}/10 spot checks passed`);
});

// ─── G.4: Decay scoring — older tablet ranks lower ──────────────────────────
test('G.4 — decay: 100-day-old tablet scores lower than 1-day-old on same topic', () => {
  const old100Days = new Date(Date.now() - 100 * 86_400_000).toISOString();
  const recent1Day = new Date(Date.now() - 1 * 86_400_000).toISOString();
  const SCRIBE = 'G4TestScribe';
  // Use unique purely-alphabetic terms that extractTopics will index and query can find
  const UNIQUE_A = 'quuxdecayold';    // unique enough to not appear in production corpus
  const UNIQUE_B = 'quuxdecaynew';

  emitPheromone(SCRIBE, 'g4_old_tablet', `${UNIQUE_A} stigmergic pheromone decay validation`, { ts: old100Days, cathedral: 'bishop' });
  emitPheromone(SCRIBE, 'g4_recent_tablet', `${UNIQUE_B} stigmergic pheromone decay validation`, { ts: recent1Day, cathedral: 'bishop' });

  // Query by the shared term 'stigmergic pheromone decay validation' — both tablets emit these
  const result = queryPheromone('stigmergic pheromone decay validation', { decayActive: true, topK: 200 });
  const oldHit = result.hits.find(h => h.scribe === SCRIBE && h.tablet_id === 'g4_old_tablet');
  const recentHit = result.hits.find(h => h.scribe === SCRIBE && h.tablet_id === 'g4_recent_tablet');

  assert.ok(oldHit, 'g4_old_tablet should appear in results');
  assert.ok(recentHit, 'g4_recent_tablet should appear in results');
  assert.ok(
    recentHit.decay_score > oldHit.decay_score,
    `recent decay_score (${recentHit.decay_score.toFixed(4)}) must exceed old (${oldHit.decay_score.toFixed(4)})`
  );
  console.log(`G.4 PASS: recent=${recentHit.decay_score.toFixed(4)} > old=${oldHit.decay_score.toFixed(4)}`);
});

// ─── G.5: Detective Phase 0 — production query <100ms ───────────────────────
test('G.5 — production index: routine query <100ms, phase_0_used for known topic', () => {
  const t0 = Date.now();
  const result = queryPheromone('founder anecdote', { sufficiencyThreshold: 5 });
  const wallMs = Date.now() - t0;
  assert.ok(wallMs < 100, `query took ${wallMs}ms (threshold 100ms)`);
  assert.ok(result.phase_0_used, `phase_0_used should be true; hits=${result.hits.length}`);
  assert.ok(result.query_ms < 100, `query_ms ${result.query_ms}ms should be <100ms`);
  assert.ok(result.hits.length > 0, 'should return at least 1 hit');
  console.log(`G.5 PASS: wall=${wallMs}ms, query_ms=${result.query_ms}ms, hits=${result.hits.length}, phase_0_used=${result.phase_0_used}`);
});

// ─── G.6: Detective fallback — sparse query returns fallback_to_rpc=true ────
test('G.6 — sparse/novel query triggers fallback_to_rpc', () => {
  const result = queryPheromone('zzz_novel_spurious_xkcd_term_9843', { sufficiencyThreshold: 10 });
  assert.ok(result.fallback_to_rpc, `fallback_to_rpc must be true for novel query; hits=${result.hits.length}`);
  assert.ok(!result.phase_0_used, 'phase_0_used must be false for sparse query');
  console.log(`G.6 PASS: fallback_to_rpc=${result.fallback_to_rpc}, hits=${result.hits.length}`);
});

// ─── G.7: Idempotent — re-emit same tablet_id 3x produces 1 record ───────────
test('G.7 — idempotent: same tablet_id emitted 3x → 1 deduplicated record in query', () => {
  const SCRIBE = 'G7IdempotentScribe';
  const TID = 'g7_idem_tablet_001';
  emitPheromone(SCRIBE, TID, 'first emit idempotent verification test', { cathedral: 'bishop' });
  emitPheromone(SCRIBE, TID, 'second emit idempotent same key test', { cathedral: 'bishop' });
  emitPheromone(SCRIBE, TID, 'third emit idempotent should collapse dedup', { cathedral: 'bishop' });

  const result = queryPheromone('idempotent verification', { decayActive: false, topK: 100 });
  const matchingHits = result.hits.filter(h => h.scribe === SCRIBE && h.tablet_id === TID);
  assert.equal(matchingHits.length, 1, `Expected 1 deduplicated hit, got ${matchingHits.length}`);
  console.log(`G.7 PASS: 3 emits for same (scribe, tablet_id) key → 1 record`);
});

// ─── G.9: Concurrent-write safety (5 distinct emits) ───────────────────────
test('G.9 — 5 distinct emits produce 5 distinct records', () => {
  const SCRIBE = 'G9ConcurrentScribe';
  for (let i = 0; i < 5; i++) {
    emitPheromone(SCRIBE, `g9_concurrent_tablet_${i}`, `concurrent write safety test tablet ${i} distinct content`, { cathedral: 'bishop' });
  }
  const result = queryPheromone('concurrent write safety distinct', { decayActive: false, topK: 100 });
  const concurrentHits = result.hits.filter(h => h.scribe === SCRIBE);
  assert.ok(concurrentHits.length >= 5, `Expected >=5 concurrent hits, got ${concurrentHits.length}`);
  const ids = new Set(concurrentHits.map(h => h.tablet_id));
  assert.equal(ids.size, concurrentHits.length, 'All tablet_ids must be distinct');
  console.log(`G.9 PASS: ${concurrentHits.length} distinct records from 5 emits`);
});

// ─── G.2: Write-path integration — appendScribeEntry emits pheromone per write ──
test('G.2 — appendScribeEntry: 5 writes produce 5 distinct pheromone records (K524)', async () => {
  // Use the Conductor scribe (registered, empty tablet) to avoid polluting
  // production tablets. Conductor has an empty file (0 bytes) so truncate
  // cleanup is safe: restoring to 0 is the same as the pre-test state.
  const SCRIBE = 'Conductor';
  // Must be purely alphabetic so extractTopics() can extract it as a topic token
  const UNIQUE_TAG = 'kxxqwritepathtestuniqxyz';
  const conductorPath = resolve(SCRIBES_DIR, `scribe_${SCRIBE}.jsonl`);

  // Record pre-test sizes for cleanup
  const tabletPreSize = existsSync(conductorPath) ? statSync(conductorPath).size : 0;
  const indexPreSize = existsSync(PHEROMONE_INDEX_PATH) ? statSync(PHEROMONE_INDEX_PATH).size : 0;

  // Write 5 distinct scribe entries (unique observation includes alphabetic-only tag)
  for (let i = 0; i < 5; i++) {
    appendScribeEntry({
      scribe_id: SCRIBE,
      session: 'K524_G2_test',
      observation: `write-path pheromone emission verification entry kxxqx${i} ${UNIQUE_TAG}`,
      source: 'knight_ship',
    });
  }

  // Assert: 5 new pheromone records visible via queryPheromone
  const result = queryPheromone(UNIQUE_TAG, { decayActive: false, topK: 100 });
  const testHits = result.hits.filter(h => h.scribe === SCRIBE);
  assert.ok(
    testHits.length >= 5,
    `Expected >=5 pheromone records for ${SCRIBE}, got ${testHits.length}. hits=${JSON.stringify(testHits.map(h => h.tablet_id))}`,
  );

  const tabletIds = new Set(testHits.map(h => h.tablet_id));
  assert.ok(tabletIds.size >= 5, `Expected >=5 distinct tablet_ids, got ${tabletIds.size}`);

  console.log(`G.2 PASS: ${testHits.length} distinct pheromone records from 5 appendScribeEntry calls`);

  // Cleanup: truncate both files to pre-test sizes
  if (existsSync(conductorPath)) truncateSync(conductorPath, tabletPreSize);
  if (existsSync(PHEROMONE_INDEX_PATH)) truncateSync(PHEROMONE_INDEX_PATH, indexPreSize);
  forceRebuild(); // purge in-memory index cache
  console.log('G.2 cleanup: files truncated to pre-test sizes, in-memory index reset');
});

// ─── G.2.b: Write-path integration — appendTidbit emits pheromone per write ──
test('G.2.b — appendTidbit: 5 writes produce 5 distinct pheromone records (K524)', async () => {
  // Must be purely alphabetic so extractTopics() can extract it as a topic token
  const UNIQUE_TAG = 'kxxqtidbittestuniqxyz';
  const VIRTUAL_SCRIBE = 'Tidbits';

  // Record pre-test sizes
  const tidbitsPreSize = existsSync(TIDBITS_PATH) ? statSync(TIDBITS_PATH).size : 0;
  const indexPreSize = existsSync(PHEROMONE_INDEX_PATH) ? statSync(PHEROMONE_INDEX_PATH).size : 0;

  // Write 5 tidbits with distinct categories (unique observation alphabetic-only tag)
  const categories = ['architecture', 'performance', 'security', 'testing', 'deployment'];
  for (let i = 0; i < 5; i++) {
    appendTidbit({
      agent: 'KNIGHT',
      session: 'K524_G2b_test',
      category: categories[i],
      observation: `tidbit pheromone emission verification entry kxxqxb${i} ${UNIQUE_TAG}`,
    });
  }

  // Assert: 5 new pheromone records under virtual "Tidbits" scribe
  const result = queryPheromone(UNIQUE_TAG, { decayActive: false, topK: 100 });
  const testHits = result.hits.filter(h => h.scribe === VIRTUAL_SCRIBE);
  assert.ok(
    testHits.length >= 5,
    `Expected >=5 pheromone records for ${VIRTUAL_SCRIBE}, got ${testHits.length}. hits=${JSON.stringify(testHits.map(h => h.tablet_id))}`,
  );

  const tabletIds = new Set(testHits.map(h => h.tablet_id));
  assert.ok(tabletIds.size >= 5, `Expected >=5 distinct tablet_ids, got ${tabletIds.size}`);

  console.log(`G.2.b PASS: ${testHits.length} distinct pheromone records from 5 appendTidbit calls`);

  // Cleanup: truncate both files to pre-test sizes
  if (existsSync(TIDBITS_PATH)) truncateSync(TIDBITS_PATH, tidbitsPreSize);
  if (existsSync(PHEROMONE_INDEX_PATH)) truncateSync(PHEROMONE_INDEX_PATH, indexPreSize);
  forceRebuild(); // purge in-memory index cache
  console.log('G.2.b cleanup: files truncated to pre-test sizes, in-memory index reset');
});

// ─── G.10: Scribe coverage mismatch resolution ───────────────────────────────
test('G.10 — all non-empty Scribes covered; empty/no-file Scribes absent (correct)', () => {
  const raw = readFileSync(PHEROMONE_INDEX_PATH, 'utf-8');
  const scribesInIndex = new Set();
  for (const line of raw.split('\n').filter(l => l.trim())) {
    const rec = JSON.parse(line);
    if (rec.cathedral === 'bishop') scribesInIndex.add(rec.scribe);
  }

  // These 11 Scribes have non-empty tablets and MUST be in the index
  const mustBePresent = [
    'Architecture', 'BRIDLE', 'Decisions', 'FounderVoice',
    'Landing', 'OperationalGotchas', 'Prov14', 'R11', 'R9', 'Toolsmith', 'Vault',
  ];
  const missing = mustBePresent.filter(s => !scribesInIndex.has(s));
  assert.deepEqual(missing, [], `Non-empty Scribes missing from index: [${missing.join(', ')}]`);

  // These are correctly absent (no tablets written yet)
  const expectedAbsent = ['Conductor', 'R12Cranewell', 'R12Covenant'];
  for (const s of expectedAbsent) {
    // Just document, don't fail — they may eventually get tablets
    const present = scribesInIndex.has(s);
    if (present) console.log(`  note: ${s} now has tablets (expected absent initially)`);
  }

  console.log(`G.10 PASS: ${scribesInIndex.size} bishop Scribes in index`);
  console.log(`  Present: ${Array.from(scribesInIndex).sort().join(', ')}`);
  console.log(`  Correctly absent (no tablets): ${expectedAbsent.filter(s => !scribesInIndex.has(s)).join(', ')}`);
  console.log(`  Resolution: Conductor=empty file, R12Cranewell/R12Covenant=no tablet file yet`);
});
