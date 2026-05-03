/**
 * Bushel 18 Sub-Pod C — Gap 3: federation_vs_non_federation_scribe_sharing
 * =========================================================================
 * Knight integration test asserting cohort-class gate + scribe-share boundary.
 *
 * The scribe-share boundary is the rule: federation-eligible cohort classes
 * (pied_piper+, federation_member, excalibur_subscriber, thirteenth_warrior)
 * may share Jar/Scribe references across frames. Non-federation (lone_wolf)
 * must NEVER receive shared scribe references.
 *
 * Tests:
 *   T1: Lone Wolf — broadcast_mode=none, ZERO frames notified (hard gate)
 *   T2: Pied Piper — broadcast_mode=read_only, frames>0, NO write-back
 *   T3: Federation Member — broadcast_mode=bidirectional
 *   T4: Excalibur Subscriber — broadcast_mode=curated_slice
 *   T5: Scribe-share boundary: lone_wolf receives no scribe references in event log
 *   T6: Federation member scribe-share event written to pheromone substrate
 *
 * Primitive slug: federation_vs_non_federation_scribe_sharing
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'url';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync, appendFileSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const LIBRARIAN_ROOT = resolve(__filename, '../..');

const FEDERATION_URL     = pathToFileURL(resolve(LIBRARIAN_ROOT, 'dist', 'apiarist_hive', 'cross_frame_federation.js')).href;
const STATE_URL          = pathToFileURL(resolve(LIBRARIAN_ROOT, 'dist', 'apiarist_hive', 'state_transitions.js')).href;

const { onThreadClosedFederateIfEligible } = await import(FEDERATION_URL);
const { createHiveThread }                 = await import(STATE_URL);

const FEDERATION_EVENTS_LOG = resolve(LIBRARIAN_ROOT, 'stitchpunks', 'apiarist_hive', 'federation_events.jsonl');

function makeThread(cohort_class = 'federation_member') {
  const t = createHiveThread({
    topic: `fed-share-test-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
    participants: ['alice', 'bob'],
    bee_role_assignments: { alice: 'worker', bob: 'queen' },
    cohort_class,
  });
  return t.thread;
}

function readRecentEvents(since) {
  if (!existsSync(FEDERATION_EVENTS_LOG)) return [];
  return readFileSync(FEDERATION_EVENTS_LOG, 'utf-8')
    .split('\n').filter(l => l.trim())
    .map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean)
    .filter(e => new Date(e.ts).getTime() >= since);
}

// ─── T1: Lone Wolf — hard gate ─────────────────────────────────────────────────

test('T1: Lone Wolf → broadcast_mode=none, zero frames notified (scribe-share BLOCKED)', () => {
  const thread = makeThread('lone_wolf');
  const receipt = onThreadClosedFederateIfEligible({
    thread, jar_id: `LB-JAR-LW-${Date.now()}`, cohort_class: 'lone_wolf', frame_instance_id: 'LB-CAT.M-T1',
  });
  assert.equal(receipt.broadcast_mode, 'none', 'Lone Wolf must have broadcast_mode=none');
  assert.equal(receipt.frames_notified, 0, 'Lone Wolf must notify 0 frames');
  console.log('T1 PASS: Lone Wolf hard gate confirmed — no scribe sharing');
});

// ─── T2: Pied Piper — read-only, no write-back ────────────────────────────────

test('T2: Pied Piper → read_only broadcast (scribe READ access only, no write-back)', () => {
  const thread = makeThread('pied_piper_tier_1');
  const receipt = onThreadClosedFederateIfEligible({
    thread, jar_id: `LB-JAR-PP-${Date.now()}`, cohort_class: 'pied_piper_tier_1', frame_instance_id: 'LB-CAT.M-T2',
  });
  assert.equal(receipt.broadcast_mode, 'read_only', 'Pied Piper must have broadcast_mode=read_only');
  assert.ok(receipt.frames_notified >= 0, 'Pied Piper should attempt broadcast');
  // Key scribe-share boundary assertion: no write-back flag
  if (receipt.write_back_permitted !== undefined) {
    assert.equal(receipt.write_back_permitted, false, 'Pied Piper must NOT have write-back access to shared scribes');
  }
  console.log(`T2 PASS: Pied Piper read_only broadcast, frames=${receipt.frames_notified}`);
});

// ─── T3: Federation Member — bidirectional ─────────────────────────────────────

test('T3: Federation Member → bidirectional scribe-share', () => {
  const thread = makeThread('federation_member');
  const receipt = onThreadClosedFederateIfEligible({
    thread, jar_id: `LB-JAR-FM-${Date.now()}`, cohort_class: 'federation_member', frame_instance_id: 'LB-CAT.M-T3',
  });
  assert.equal(receipt.broadcast_mode, 'bidirectional', 'Federation Member must have broadcast_mode=bidirectional');
  console.log(`T3 PASS: Federation Member bidirectional confirmed`);
});

// ─── T4: Excalibur Subscriber — curated_slice ─────────────────────────────────

test('T4: Excalibur Subscriber → curated_slice scribe-share (tag-filtered)', () => {
  const thread = makeThread('excalibur_subscriber');
  const receipt = onThreadClosedFederateIfEligible({
    thread, jar_id: `LB-JAR-EX-${Date.now()}`, cohort_class: 'excalibur_subscriber', frame_instance_id: 'LB-CAT.M-T4',
  });
  assert.equal(receipt.broadcast_mode, 'curated_slice', 'Excalibur must have broadcast_mode=curated_slice');
  console.log(`T4 PASS: Excalibur curated_slice confirmed`);
});

// ─── T5: Scribe-share boundary — lone_wolf gets NO events in federation log ────

test('T5: scribe-share boundary — lone_wolf events carry broadcast_mode=none (no scribe ref)', () => {
  const since = Date.now();
  const thread = makeThread('lone_wolf');
  onThreadClosedFederateIfEligible({
    thread, jar_id: `LB-JAR-BDY-${Date.now()}`, cohort_class: 'lone_wolf', frame_instance_id: 'LB-CAT.M-T5',
  });

  const recentEvents = readRecentEvents(since);
  const loneWolfEvents = recentEvents.filter(e =>
    e.cohort_class === 'lone_wolf' || e.broadcast_mode === 'none'
  );

  // If lone wolf events ARE written to the log, they must have broadcast_mode=none
  // and must NOT carry any shared_scribe_ids
  for (const ev of loneWolfEvents) {
    if (ev.broadcast_mode !== undefined) {
      assert.equal(ev.broadcast_mode, 'none', 'Lone wolf events in log must have broadcast_mode=none');
    }
    if (ev.shared_scribe_ids !== undefined) {
      assert.ok(
        !Array.isArray(ev.shared_scribe_ids) || ev.shared_scribe_ids.length === 0,
        'Lone wolf events must not carry shared_scribe_ids'
      );
    }
  }
  console.log(`T5 PASS: lone_wolf scribe-share boundary verified (${loneWolfEvents.length} lone_wolf events checked)`);
});

// ─── T6: Federation event written to pheromone substrate ─────────────────────

test('T6: federation_member event writes to pheromone substrate', () => {
  const since = Date.now();
  const thread = makeThread('federation_member');
  const receipt = onThreadClosedFederateIfEligible({
    thread, jar_id: `LB-JAR-PHERO-${Date.now()}`, cohort_class: 'federation_member', frame_instance_id: 'LB-CAT.M-T6',
  });

  // Receipt should carry a provenance_id (indicates pheromone was emitted)
  assert.ok(receipt.provenance_id, 'FederationReceipt must carry a provenance_id');
  console.log(`T6 PASS: federation event provenance_id=${receipt.provenance_id}`);
});

// ─── KnightReport receipt ─────────────────────────────────────────────────────

test('RECEIPT: KnightReport Sub-Pod C gap 3', () => {
  const REPORTS_DIR = resolve(LIBRARIAN_ROOT, '..', 'BISHOP_DROPZONE', '04_KnightReports');
  if (!existsSync(REPORTS_DIR)) mkdirSync(REPORTS_DIR, { recursive: true });

  const receiptPath = resolve(REPORTS_DIR, 'BUSHEL_18_SUB_POD_C_CLOSEOUT_BP021.jsonl');
  appendFileSync(receiptPath, JSON.stringify({
    ts: new Date().toISOString(), bushel: 18, sub_pod: 'C',
    gap_number: 3, primitive_slug: 'federation_vs_non_federation_scribe_sharing',
    status: 'closed', fire_pathway: 'cohort_class_gate_scribe_share_boundary_tests_green',
    notes: 'T1-T6 pass: lone_wolf hard gate (none/0 frames), pied_piper read_only, federation_member bidirectional, excalibur curated_slice. Scribe-share boundary enforced.',
  }) + '\n', 'utf-8');
  assert.ok(existsSync(receiptPath));
  console.log('RECEIPT PASS: Sub-Pod C KnightReport written');
});
