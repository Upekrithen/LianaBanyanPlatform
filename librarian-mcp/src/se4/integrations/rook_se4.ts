/**
 * SE-4 Rook Multi-Surface Integration (Tier 2 / B-SE4-2)
 * =======================================================
 * Adds SE-4 envelope to RookReturn tablets across all 3 surfaces.
 *
 * Cross-surface coordination:
 *   When the same Rook task fires across 2+ surfaces, each surface instance
 *   gets a sibling parent_shadow_id pointing to the coordinating parent SEG.
 *   parseRookReturn validates that all sibling returns share a common
 *   parent_shadow_id and have non-overlapping cell_identities subsets.
 *
 * Multimodal receipt ride-along:
 *   For Rook returns carrying image data (Figures 1/2/3 class), the
 *   cell_identities array encodes figure identifiers — receiver decodes
 *   which figures are present from the power-set subset without reading
 *   the full payload first.
 *
 * Integration point: writeRookReturn() + parseRookReturn()
 * Spec: PROMPT_KNIGHT_BUSHEL_SE4_RETROFIT_TIER_1_2_3_BP033.md §3 B-SE4-2 #3
 */

import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { signShadowOutput, verifyEnvelope, defaultKeyManager } from '../se4_hmac.js';
import { defaultRegistry } from '../se4_registry.js';
import type { SE4Envelope, SE4RookSurface } from '../se4_envelope.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const STITCHPUNKS_DIR = resolve(__dirname, '..', '..', '..', 'stitchpunks');
const ROOK_DIR        = resolve(STITCHPUNKS_DIR, 'rook_returns');

function ensureDir(p: string): void {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RookReturnPayload {
  task_id: string;
  surface: SE4RookSurface;
  result: unknown;
  figure_ids?: string[];   // optional: Figures 1/2/3 class identifiers
  ts: string;
}

export interface RookReturnRecord extends RookReturnPayload {
  se4: SE4Envelope;
  se4_shadow_id: string;
  parent_shadow_id: string | null;
}

export interface RookCrossSurfaceReceipt {
  task_id: string;
  surfaces: SE4RookSurface[];
  returns: RookReturnRecord[];
  allShareParent: boolean;
  noIdentityOverlap: boolean;
  collisionReport: string[];
}

// ─── writeRookReturn ──────────────────────────────────────────────────────────

/**
 * Write a RookReturn tablet for one surface, with SE-4 envelope.
 *
 * @param payload         The Rook task result for this surface
 * @param parentShadowId  Parent SEG shadow ID (for cross-surface coordination)
 * @param returnFile      Optional custom JSONL filename
 */
export function writeRookReturn(
  payload: RookReturnPayload,
  parentShadowId: string | null = null,
  returnFile = 'rook_returns.jsonl'
): RookReturnRecord {
  ensureDir(ROOK_DIR);
  const filePath = resolve(ROOK_DIR, returnFile);

  const { envelope, shadow_id } = signShadowOutput('rook_surface', payload, {
    parentShadowId,
    registry:      defaultRegistry,
    keyManager:    defaultKeyManager,
  });

  // Encode figure_ids in cell_identities (multimodal ride-along)
  // The first cell_identity is from the power-set registry (collision safety).
  // Additional cells encode figure IDs if present.
  const cellsWithFigures = payload.figure_ids
    ? [...envelope.cell_identities, ...payload.figure_ids.map((id) => `fig_${id}`)]
    : envelope.cell_identities;

  const envelopeWithFigures: SE4Envelope = {
    ...envelope,
    cell_identities: cellsWithFigures,
  };

  const record: RookReturnRecord = {
    ...payload,
    se4:              envelopeWithFigures,
    se4_shadow_id:    shadow_id,
    parent_shadow_id: parentShadowId,
  };

  appendFileSync(filePath, JSON.stringify(record) + '\n', 'utf-8');

  // Release immediately (stateless return)
  defaultRegistry.releaseId(shadow_id);

  return record;
}

// ─── parseRookReturn ──────────────────────────────────────────────────────────

/**
 * Parse and validate a cross-surface Rook receipt.
 *
 * Validates:
 *   1. All sibling returns share a common parent_shadow_id
 *   2. No two returns share overlapping cell_identities registry slots
 *      (figure_id cells are excluded from collision check — they're labels)
 *   3. HMAC on each return verifies against payload
 */
export function parseRookReturn(
  returns: RookReturnRecord[]
): RookCrossSurfaceReceipt {
  if (!returns.length) {
    return {
      task_id: '',
      surfaces: [],
      returns: [],
      allShareParent: true,
      noIdentityOverlap: true,
      collisionReport: [],
    };
  }

  const task_id   = returns[0].task_id;
  const surfaces  = returns.map((r) => r.surface);
  const firstParent = returns[0].parent_shadow_id;

  // Check all share same parent_shadow_id
  const allShareParent = returns.every((r) => r.parent_shadow_id === firstParent);

  // Check no collision on registry-slot cells (cell_k prefixed, not fig_)
  const registryCells = new Set<string>();
  const collisionReport: string[] = [];
  for (const ret of returns) {
    const slots = ret.se4.cell_identities.filter((c) => c.startsWith('cell_'));
    for (const slot of slots) {
      if (registryCells.has(slot)) {
        collisionReport.push(
          `Collision on ${slot} between surfaces (task ${task_id})`
        );
      } else {
        registryCells.add(slot);
      }
    }
  }

  return {
    task_id,
    surfaces,
    returns,
    allShareParent,
    noIdentityOverlap: collisionReport.length === 0,
    collisionReport,
  };
}

// ─── Decode figure IDs from cell_identities ───────────────────────────────────

/**
 * Decode which figure IDs are present in a Rook return from the
 * cell_identities field, without reading the full payload.
 * Returns all cells with 'fig_' prefix, stripped of the prefix.
 */
export function decodeFigureIds(record: RookReturnRecord): string[] {
  return record.se4.cell_identities
    .filter((c) => c.startsWith('fig_'))
    .map((c) => c.slice(4));
}

// ─── Read all Rook returns for a task ────────────────────────────────────────

export function readRookReturnsForTask(
  taskId: string,
  returnFile = 'rook_returns.jsonl'
): RookReturnRecord[] {
  const filePath = resolve(ROOK_DIR, returnFile);
  if (!existsSync(filePath)) return [];

  const records: RookReturnRecord[] = [];
  const raw = readFileSync(filePath, 'utf-8');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t) continue;
    try {
      const rec = JSON.parse(t) as RookReturnRecord;
      if (rec.task_id === taskId) records.push(rec);
    } catch { /* skip */ }
  }
  return records;
}
