/**
 * Thorax Eblit Snapshot — P10: Snapshot-at-access frozen frame
 * ============================================================
 * Dream #5 · BP046B · Phase 1
 *
 * P10: Eblit-snapshot decode at transmission moment.
 *      Deterministic frozen frame even as source mutates concurrently.
 *
 * Founder verbatim: "Eblits are smaller versions so we can change but still
 *   static at time of access — like when I click the screenshot tool, it
 *   freezes the screen and then I pick what part I want to outline, even
 *   though behind it, its still going." (BP031)
 *
 * Canon: eblits_snapshot_at_access_substrate_fragments_canon_bp031.eblet.md
 *        LB-STACK-0174 · Crown-Jewel-class · K22 kernel-extension candidate
 *
 * Composes with:
 *   - thorax_stamp.ts (stamp-state Eblit capture)
 *   - thorax_channels.ts (channel-state Eblit capture)
 *   - thorax_transmission.ts (transmission-params Eblit capture)
 */

import {
  existsSync, appendFileSync, readFileSync, mkdirSync,
} from "fs";
import { resolve } from "path";
import { randomUUID, createHash } from "crypto";
import { THORAX_DIR } from "./thorax_choke.js";
import type { EblitSnapshot } from "./thorax_types.js";

// ─── Storage ──────────────────────────────────────────────────────────────────

function eblitStorePath(): string {
  return resolve(THORAX_DIR, "eblit_snapshots.jsonl");
}

function ensureDir(): void {
  if (!existsSync(THORAX_DIR)) mkdirSync(THORAX_DIR, { recursive: true });
}

function appendEblit(snapshot: EblitSnapshot): void {
  ensureDir();
  appendFileSync(eblitStorePath(), JSON.stringify(snapshot) + "\n", "utf-8");
}

function readAllEblits(): EblitSnapshot[] {
  const p = eblitStorePath();
  if (!existsSync(p)) return [];
  try {
    return readFileSync(p, "utf-8")
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as EblitSnapshot);
  } catch {
    return [];
  }
}

// ─── Core snapshot operation ──────────────────────────────────────────────────

/**
 * Capture an Eblit snapshot — copy-on-read.
 *
 * "When I click the screenshot tool, it freezes the screen."
 * Source continues mutating; this frozen frame is deterministic for its reader.
 *
 * Every call produces an immutable receipt in eblit_snapshots.jsonl.
 * Iron Tablet provenance is implied: append-only log = audit trail.
 */
export function captureEblitSnapshot(
  channel_id: number,
  source_type: EblitSnapshot["source_type"],
  live_state: Record<string, unknown>
): EblitSnapshot {
  const serialized = JSON.stringify(live_state);
  const source_version_hash = createHash("sha256").update(serialized).digest("hex");

  const snapshot: EblitSnapshot = {
    snapshot_id: `eblit-${randomUUID()}`,
    channel_id,
    source_type,
    frozen_content: { ...live_state },   // deep copy — source can mutate freely after this
    source_version_hash,
    captured_ts: new Date().toISOString(),
  };

  appendEblit(snapshot);
  return snapshot;
}

/**
 * Read an Eblit snapshot by ID.
 * Returns the frozen frame — same content regardless of how much the source
 * has mutated since the snapshot was captured.
 */
export function readEblitSnapshot(snapshot_id: string): EblitSnapshot | null {
  const all = readAllEblits();
  return all.find((s) => s.snapshot_id === snapshot_id) ?? null;
}

/**
 * Get all Eblits for a channel, ordered by capture time.
 */
export function readChannelEblits(channel_id: number): EblitSnapshot[] {
  return readAllEblits()
    .filter((s) => s.channel_id === channel_id)
    .sort((a, b) => a.captured_ts.localeCompare(b.captured_ts));
}

/**
 * Get the most recent Eblit snapshot for a channel (any source_type).
 * Used by SE-4 decoding-table lookup: deterministic registry at burst-fire time.
 */
export function latestEblitForChannel(
  channel_id: number,
  source_type?: EblitSnapshot["source_type"]
): EblitSnapshot | null {
  const all = readChannelEblits(channel_id);
  const filtered = source_type
    ? all.filter((s) => s.source_type === source_type)
    : all;
  return filtered[filtered.length - 1] ?? null;
}

// ─── Verification ─────────────────────────────────────────────────────────────

/**
 * Verify an Eblit's integrity: re-hash the frozen_content and compare
 * against stored source_version_hash.
 * Returns true if content is intact (no tampering).
 */
export function verifyEblitIntegrity(snapshot_id: string): {
  verified: boolean;
  snapshot_id: string;
  expected_hash?: string;
  computed_hash?: string;
  error?: string;
} {
  const snap = readEblitSnapshot(snapshot_id);
  if (!snap) {
    return { verified: false, snapshot_id, error: `Snapshot ${snapshot_id} not found.` };
  }

  const computed_hash = createHash("sha256")
    .update(JSON.stringify(snap.frozen_content))
    .digest("hex");

  return {
    verified: computed_hash === snap.source_version_hash,
    snapshot_id,
    expected_hash: snap.source_version_hash,
    computed_hash,
  };
}
