/**
 * SE-4 Shadows-Proper Background Task Integration (Tier 3 / B-SE4-3)
 * ===================================================================
 * Adds SE-4 envelope to Shadows-proper heartbeat tablets and final
 * completion receipts. Enables HMAC verification before Bishop acts
 * on any background task output.
 *
 * 13th Floor depth-5+ safety: every Shadow-proper at any recursive depth
 * inherits a unique cell_identities subset from the registry. Combined with
 * per-output HMAC verification, the recursive SEG dispatch tree is
 * collision-free at structural level regardless of depth.
 *
 * ShadowBackgroundTaskReceipt:
 *   task_id       — unique task identifier
 *   envelope      — SE-4 envelope on final output
 *   hmacVerified  — true if payload matches envelope.payload_hash
 *   epochsElapsed — Lamport epochs elapsed from spawn to completion
 *
 * Integration point: shadowHeartbeatWrite(), shadowCompletionWrite()
 * Spec: PROMPT_KNIGHT_BUSHEL_SE4_RETROFIT_TIER_1_2_3_BP033.md §3 B-SE4-3 #3
 */

import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { signShadowOutput, verifyEnvelope, defaultKeyManager } from '../se4_hmac.js';
import { SE4Registry, DEFAULT_SESSION_ID } from '../se4_registry.js';
import { currentEpoch, decodeEpoch } from '../se4_clock.js';
import type { SE4Envelope, SE4ShadowBackgroundTaskReceipt } from '../se4_envelope.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const STITCHPUNKS_DIR = resolve(__dirname, '..', '..', '..', 'stitchpunks');
const SHADOW_DIR      = resolve(STITCHPUNKS_DIR, 'shadow_proper_tablets');

function ensureDir(p: string): void {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

// ─── Shadow-proper registry ───────────────────────────────────────────────────

const _shadowRegistry = new SE4Registry(`shadow-proper-${DEFAULT_SESSION_ID}`);

// ─── Active task tracking ─────────────────────────────────────────────────────

interface ActiveTask {
  task_id: string;
  shadow_id: string;
  spawn_envelope: SE4Envelope;
  spawn_epoch: number;
  parent_shadow_id: string | null;
}

const _activeTasks = new Map<string, ActiveTask>(); // task_id → ActiveTask

// ─── shadowSpawn ──────────────────────────────────────────────────────────────

/**
 * Spawn a background Shadow task. Allocates a unique SE-4 Shadow ID and
 * returns the spawn record. MUST be called before the first heartbeat write.
 *
 * @param description     Human-readable task description
 * @param parentShadowId  Parent SEG shadow ID for recursive dispatch
 */
export function shadowSpawn(
  description: string,
  parentShadowId: string | null = null
): ActiveTask {
  const task_id = randomUUID();
  const ts = new Date().toISOString();
  const payload = { task_id, description, event: 'spawn', ts };

  const { envelope, shadow_id } = signShadowOutput('shadow_proper', payload, {
    parentShadowId,
    registry:      _shadowRegistry,
    keyManager:    defaultKeyManager,
  });

  const task: ActiveTask = {
    task_id,
    shadow_id,
    spawn_envelope:   envelope,
    spawn_epoch:      decodeEpoch(envelope.epoch_id),
    parent_shadow_id: parentShadowId,
  };

  _activeTasks.set(task_id, task);
  return task;
}

// ─── shadowHeartbeatWrite ─────────────────────────────────────────────────────

export interface ShadowHeartbeatRecord {
  task_id: string;
  shadow_id: string;
  heartbeat_n: number;
  status: string;
  ts: string;
  se4: SE4Envelope;
}

const _heartbeatCounts = new Map<string, number>(); // task_id → count

/**
 * Write a heartbeat tablet for an active Shadow task.
 * Every heartbeat carries an SE-4 envelope.
 *
 * @param taskId    The task_id from shadowSpawn
 * @param status    Current status string
 * @param tabletFile Optional JSONL filename
 */
export function shadowHeartbeatWrite(
  taskId: string,
  status: string,
  tabletFile = 'shadow_heartbeats.jsonl'
): ShadowHeartbeatRecord | null {
  const task = _activeTasks.get(taskId);
  if (!task) return null;

  ensureDir(SHADOW_DIR);
  const filePath = resolve(SHADOW_DIR, tabletFile);

  const n = (_heartbeatCounts.get(taskId) ?? 0) + 1;
  _heartbeatCounts.set(taskId, n);

  const ts = new Date().toISOString();
  const payload = { task_id: taskId, heartbeat_n: n, status, ts };

  const { envelope, shadow_id: _hbId } = signShadowOutput('shadow_proper', payload, {
    parentShadowId: task.shadow_id,
    registry:       _shadowRegistry,
    keyManager:     defaultKeyManager,
  });
  // Release heartbeat slot immediately (heartbeats are stateless events)
  _shadowRegistry.releaseId(_hbId);

  const record: ShadowHeartbeatRecord = {
    task_id:     taskId,
    shadow_id:   task.shadow_id,
    heartbeat_n: n,
    status,
    ts,
    se4:         envelope,
  };

  appendFileSync(filePath, JSON.stringify(record) + '\n', 'utf-8');
  return record;
}

// ─── shadowCompletionWrite ────────────────────────────────────────────────────

/**
 * Write the final completion tablet for a Shadow task.
 * The HMAC in the SE-4 envelope must match the output payload.
 * Bishop reads and calls verifyEnvelope before acting on the result.
 *
 * Releases the task's shadow_id slot on completion.
 *
 * @param taskId      The task_id from shadowSpawn
 * @param output      The final task output (any serializable value)
 * @param tabletFile  Optional JSONL filename
 */
export function shadowCompletionWrite(
  taskId: string,
  output: unknown,
  tabletFile = 'shadow_completions.jsonl'
): SE4ShadowBackgroundTaskReceipt | null {
  const task = _activeTasks.get(taskId);
  if (!task) return null;

  ensureDir(SHADOW_DIR);
  const filePath = resolve(SHADOW_DIR, tabletFile);

  const ts = new Date().toISOString();
  const payload = { task_id: taskId, output, event: 'completion', ts };

  const { envelope, shadow_id } = signShadowOutput('shadow_proper', payload, {
    parentShadowId: task.parent_shadow_id,
    registry:       _shadowRegistry,
    keyManager:     defaultKeyManager,
  });
  _shadowRegistry.releaseId(shadow_id);

  const epochsElapsed = decodeEpoch(envelope.epoch_id) - task.spawn_epoch;

  const receipt: SE4ShadowBackgroundTaskReceipt = {
    task_id:       taskId,
    envelope,
    hmacVerified:  verifyEnvelope(envelope, payload, defaultKeyManager),
    epochsElapsed,
  };

  appendFileSync(filePath, JSON.stringify({ ...receipt, payload }), 'utf-8');
  appendFileSync(filePath, '\n', 'utf-8');

  // Clean up task tracking
  _shadowRegistry.releaseId(task.shadow_id);
  _activeTasks.delete(taskId);
  _heartbeatCounts.delete(taskId);

  return receipt;
}

// ─── Read and verify completion tablets ──────────────────────────────────────

export interface ShadowCompletionVerifyResult {
  task_id: string;
  hmacVerified: boolean;
  epochsElapsed: number;
  output: unknown;
}

export function readAndVerifyCompletions(
  tabletFile = 'shadow_completions.jsonl'
): ShadowCompletionVerifyResult[] {
  const filePath = resolve(SHADOW_DIR, tabletFile);
  if (!existsSync(filePath)) return [];

  const results: ShadowCompletionVerifyResult[] = [];
  const raw = readFileSync(filePath, 'utf-8');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t) continue;
    try {
      const rec = JSON.parse(t) as {
        task_id: string;
        envelope: SE4Envelope;
        hmacVerified: boolean;
        epochsElapsed: number;
        payload: unknown;
      };
      // Re-verify HMAC on read (double-check, independent of stored hmacVerified flag)
      const hmacVerified = verifyEnvelope(rec.envelope, rec.payload, defaultKeyManager);
      results.push({
        task_id:       rec.task_id,
        hmacVerified,
        epochsElapsed: rec.epochsElapsed,
        output:        (rec.payload as Record<string, unknown>)?.output,
      });
    } catch { /* skip malformed */ }
  }
  return results;
}
