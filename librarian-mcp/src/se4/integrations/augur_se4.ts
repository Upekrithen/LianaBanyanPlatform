/**
 * SE-4 Augur Gate Integration (Tier 2 / B-SE4-2)
 * ================================================
 * Adds SE-4 envelope to every Augur gate-check verdict record.
 *
 * Each Augur spawn uses the SE-4 power-set uniqueness registry, giving each
 * active Augur a unique Shadow ID. Their verdict envelopes are distinguishable
 * by cell_identities even when multiple Augurs vote simultaneously.
 *
 * Multi-Augur joint-decision broadcast: when 4+ Augurs vote on the same gate
 * event simultaneously, their verdict envelopes are bundled as a composite
 * AugurJointVerdictBurst receipt in the Chronicler log.
 *
 * Integration point: augurVerdictWrite() — wraps gate verdict before substrate write.
 * Spec: PROMPT_KNIGHT_BUSHEL_SE4_RETROFIT_TIER_1_2_3_BP033.md §3 B-SE4-2 #2
 */

import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { signShadowOutput, verifyEnvelope, defaultKeyManager } from '../se4_hmac.js';
import { SE4Registry } from '../se4_registry.js';
import { DEFAULT_SESSION_ID } from '../se4_registry.js';
import type { SE4Envelope } from '../se4_envelope.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const STITCHPUNKS_DIR = resolve(__dirname, '..', '..', '..', 'stitchpunks');
const AUGUR_DIR       = resolve(STITCHPUNKS_DIR, 'augur_verdicts');

function ensureDir(p: string): void {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

// ─── Augur registry — per-session singleton ───────────────────────────────────
// Each Augur instance gets a unique bit slot for the session.

const _augurRegistry = new SE4Registry(`augur-session-${DEFAULT_SESSION_ID}`);

// ─── Types ────────────────────────────────────────────────────────────────────

export type AugurVerdictClass = 'approve' | 'reject' | 'defer';

export interface AugurVerdictRecord {
  augur_id: string;           // e.g. "Augur-1", "pricing_augur"
  gate_id: string;            // the gate being evaluated
  verdict: AugurVerdictClass;
  rationale?: string;
  ts: string;
  se4: SE4Envelope;
  se4_shadow_id: string;
}

export interface AugurJointVerdictBurst {
  gate_id: string;
  verdicts: AugurVerdictRecord[];
  consensus: AugurVerdictClass | 'split';
  ts: string;
  burst_envelope: SE4Envelope;
}

// ─── Active augur shadow IDs (session-level, for collision detection) ─────────

const _activeAugurShadowIds = new Map<string, string>(); // augur_id → shadow_id

// ─── augurVerdictWrite ────────────────────────────────────────────────────────

/**
 * Sign and write an Augur gate-check verdict with SE-4 envelope.
 *
 * The Augur spawns a unique Shadow ID from the augur registry at verdict time
 * and releases it after writing (stateless verdict delivery).
 *
 * @param augurId   Identifier for this Augur instance (e.g. "pricing_augur")
 * @param gateId    Gate being evaluated (e.g. "closeout_gate_2026-05-09")
 * @param verdict   approve | reject | defer
 * @param rationale Optional human-readable rationale
 * @param verdictFile Optional JSONL filename for this gate's verdicts
 */
export function augurVerdictWrite(
  augurId: string,
  gateId: string,
  verdict: AugurVerdictClass,
  rationale?: string,
  verdictFile = 'augur_verdicts.jsonl'
): AugurVerdictRecord {
  ensureDir(AUGUR_DIR);
  const filePath = resolve(AUGUR_DIR, verdictFile);

  const ts = new Date().toISOString();
  const payload = { augur_id: augurId, gate_id: gateId, verdict, rationale, ts };

  // Use augur-specific registry so Augur slots don't consume pheromone/detective slots
  const { envelope, shadow_id } = signShadowOutput('augur', payload, {
    registry:   _augurRegistry,
    keyManager: defaultKeyManager,
  });

  const record: AugurVerdictRecord = {
    augur_id:      augurId,
    gate_id:       gateId,
    verdict,
    rationale,
    ts,
    se4:           envelope,
    se4_shadow_id: shadow_id,
  };

  appendFileSync(filePath, JSON.stringify(record) + '\n', 'utf-8');

  // Track active shadow ID for joint-verdict burst collision detection
  _activeAugurShadowIds.set(augurId, shadow_id);

  // Release immediately after tracking
  _augurRegistry.releaseId(shadow_id);

  return record;
}

// ─── Joint verdict burst ──────────────────────────────────────────────────────

/**
 * Bundle multiple Augur verdicts on the same gate into a composite burst.
 * Checks for cell_identities collisions across the verdicts (should be zero
 * with sequential single-bit allocation).
 *
 * @param verdicts    Array of AugurVerdictRecord from augurVerdictWrite calls
 * @param burstFile   Optional JSONL filename for burst records
 */
export function augurJointVerdictBurst(
  verdicts: AugurVerdictRecord[],
  burstFile = 'augur_joint_bursts.jsonl'
): AugurJointVerdictBurst {
  if (!verdicts.length) throw new Error('SE4 Augur: verdicts array must not be empty');

  const gateId = verdicts[0].gate_id;

  // Collision check: assert no two verdict envelopes share cell_identities
  const allCells = new Set<string>();
  for (const v of verdicts) {
    for (const cell of v.se4.cell_identities) {
      if (allCells.has(cell)) {
        throw new Error(
          `SE4 Augur: cell_identities collision detected for gate '${gateId}' on cell '${cell}'`
        );
      }
      allCells.add(cell);
    }
  }

  // Determine consensus
  const counts: Record<AugurVerdictClass, number> = { approve: 0, reject: 0, defer: 0 };
  for (const v of verdicts) counts[v.verdict]++;
  const maxCount = Math.max(...Object.values(counts));
  const topVerdicts = (Object.keys(counts) as AugurVerdictClass[]).filter(
    (k) => counts[k] === maxCount
  );
  const consensus: AugurVerdictClass | 'split' = topVerdicts.length === 1 ? topVerdicts[0] : 'split';

  const ts = new Date().toISOString();
  const burstPayload = { gate_id: gateId, consensus, verdict_count: verdicts.length, ts };

  const { envelope: burstEnvelope, shadow_id } = signShadowOutput('augur', burstPayload, {
    registry:   _augurRegistry,
    keyManager: defaultKeyManager,
    burstCount: verdicts.length,
  });
  _augurRegistry.releaseId(shadow_id);

  const burst: AugurJointVerdictBurst = {
    gate_id:        gateId,
    verdicts,
    consensus,
    ts,
    burst_envelope: burstEnvelope,
  };

  ensureDir(AUGUR_DIR);
  appendFileSync(
    resolve(AUGUR_DIR, burstFile),
    JSON.stringify(burst) + '\n',
    'utf-8'
  );

  return burst;
}

// ─── HMAC verification ────────────────────────────────────────────────────────

/** Verify HMAC on an Augur verdict record. Returns false on tamper. */
export function verifyAugurVerdict(record: AugurVerdictRecord): boolean {
  const payload = {
    augur_id:  record.augur_id,
    gate_id:   record.gate_id,
    verdict:   record.verdict,
    rationale: record.rationale,
    ts:        record.ts,
  };
  return verifyEnvelope(record.se4, payload, defaultKeyManager);
}
