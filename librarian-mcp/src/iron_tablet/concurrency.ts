/**
 * Concurrency — KN089 / BP011 Pod W Bean 1
 * ==========================================
 * Fused write semantics: Stone Tablet mutex serializes; Eblet atomic replace;
 * ConcurrencyConflict surfaced (not auto-resolved).
 *
 * Fused write sequence:
 *   1. Read current eblet hash (caller's snapshot before mutex).
 *   2. Acquire Stone Tablet mutex for this ledger.
 *   3. Re-read eblet hash (authoritative — mutex is held).
 *   4. If on-disk hash ≠ caller snapshot hash → hash_divergence conflict.
 *   5. Write new content to Eblet atomically (last-write-wins regardless of conflict).
 *   6. Append to Stone Tablet ledger (authoritative, append-only — always succeeds).
 *   7. Release mutex.
 *
 * The Stone Tablet ledger records EVERY write attempt, including conflicted ones.
 * This makes Stone the authoritative replay log: even if the Eblet file is lost,
 * the ledger preserves the hash + session + scribeId of every intent.
 */

import { stoneAppend, stoneReadProvenance, computeHash, getLedgerPath } from "./stone_layer.js";
import { ebletRead, ebletWrite } from "./eblet_layer.js";
import type {
  IronTabletWriteParams,
  IronTabletWriteResult,
  IronTabletReadResult,
  ProvenanceReceipt,
} from "./types.js";

// ─── In-process fused-write mutex ────────────────────────────────────────────
//
// The Stone layer's withMutex serializes writes at the LEDGER level.
// The fused write needs to hold that mutex across BOTH the Eblet write AND the
// Stone append, so concurrent callers cannot interleave their Eblet writes.
// We achieve this by reading the pre-mutex snapshot outside, then running the
// full Eblet-write + Stone-append under the stone_layer mutex.
//
// Implementation: we re-implement the ledger mutex here at the fused level,
// keyed by ledger path, so the full Eblet+Stone pair is atomic under one lock.

const fusedMutexTails = new Map<string, Promise<unknown>>();

async function withFusedMutex<T>(
  ledgerKey: string,
  fn: () => Promise<T>,
): Promise<T> {
  const tail = fusedMutexTails.get(ledgerKey) ?? Promise.resolve();

  let release!: () => void;
  const mySlot = new Promise<void>((r) => { release = r; });
  fusedMutexTails.set(ledgerKey, mySlot);

  await tail;

  try {
    return await fn();
  } finally {
    release();
    if (fusedMutexTails.get(ledgerKey) === mySlot) {
      fusedMutexTails.delete(ledgerKey);
    }
  }
}

// ─── Fused write ─────────────────────────────────────────────────────────────

export async function fusedWrite(
  params: IronTabletWriteParams,
): Promise<IronTabletWriteResult> {
  const ledgerPath = getLedgerPath(params.ebletPath);

  // Step 1: read caller's snapshot (before mutex — represents the caller's "world view")
  const preSnap = ebletRead(params.ebletPath);
  const callerKnownHash = preSnap?.hash ?? null;

  return withFusedMutex(ledgerPath, async () => {
    // Step 3-5: within mutex — re-read is implicit in ebletWrite's conflict check
    const { ebletHash, conflict } = ebletWrite({
      ebletPath: params.ebletPath,
      content: params.content,
      callerKnownHash,
      scribeId: params.scribeId,
    });

    // Step 6: Append to Stone Tablet regardless of conflict
    const stoneReceipt = await stoneAppend({
      scribeId: params.scribeId,
      ebletPath: params.ebletPath,
      hash: ebletHash,
      session: params.provenance.session,
      decisionId: params.provenance.decisionId,
      conflict: conflict !== undefined,
    });

    return {
      stoneReceipt,
      ebletHash,
      ...(conflict !== undefined && { conflict }),
    } satisfies IronTabletWriteResult;
  });
}

// ─── Fused read ──────────────────────────────────────────────────────────────

export function fusedRead(ebletPath: string): IronTabletReadResult | null {
  const existing = ebletRead(ebletPath);
  const provenance = stoneReadProvenance(ebletPath);

  if (existing === null) return null;

  return {
    content: existing.content,
    ebletHash: existing.hash,
    stoneProvenance: provenance,
  };
}

// ─── Provenance only ─────────────────────────────────────────────────────────

export function fusedProvenance(ebletPath: string): ProvenanceReceipt[] {
  return stoneReadProvenance(ebletPath);
}

// ─── List helper ─────────────────────────────────────────────────────────────

export { computeHash };
