/**
 * Codex Binding Ceremony — KN-K2 / BP018
 * =========================================
 * Immutability ceremony for Codex bound-book artifacts.
 *
 * bind()     — transitions Codex from "review" → "bound"; HMAC-locks all chapters
 * supersede() — chains old bound Codex to a new one (old.superseded_by = new.id)
 *
 * Post-binding mutations are rejected (same pattern as Jar sealed state, KN-J1).
 * Pheromone Pixie-Dust emitted on bind + supersede.
 *
 * HMAC: computed over canonical chapter ordering (sorted by ts_drafted then topic).
 */

import { createHmac } from "crypto";
import { emitPheromone } from "../scribes/pheromone.js";
import {
  readAllCodexEntries,
  appendCodexEntry,
  getCodexById,
  type Codex,
  type CodexChapter,
} from "./schema.js";

// ─── Bound Codex type ─────────────────────────────────────────────────────────

export interface BoundCodex extends Codex {
  status: "bound";
  bound_ts: string;
  bound_hmac: string;
}

// ─── HMAC computation ─────────────────────────────────────────────────────────

export function computeCodexHmac(codex_id: string, chapters: CodexChapter[], bound_ts: string): string {
  const key = `lb-codex-chronos-${bound_ts.slice(0, 10)}`;
  // Canonical chapter ordering: sort by ts_drafted then topic (deterministic)
  const sorted = [...chapters].sort((a, b) => {
    const tsCmp = a.ts_drafted.localeCompare(b.ts_drafted);
    return tsCmp !== 0 ? tsCmp : a.topic.localeCompare(b.topic);
  });
  const payload = `${codex_id}::${sorted.map((c) => `${c.topic}::${c.ts_drafted}`).join("|")}::${bound_ts}`;
  return createHmac("sha256", key).update(payload).digest("hex").slice(0, 16);
}

export function verifyCodexHmac(codex: Codex): boolean {
  if (!codex.bound_ts || !codex.bound_hmac) return false;
  const expected = computeCodexHmac(codex.id, codex.chapters, codex.bound_ts);
  return codex.bound_hmac === expected;
}

// ─── Pointer reference verification ──────────────────────────────────────────

export interface PointerVerificationResult {
  valid: boolean;
  broken_pointers: string[];
  warnings: string[];
}

/**
 * Verify all pointer references in a Codex resolve (non-empty and structurally valid).
 * Real resolution (gold_tablet_query, excalibur_by_id, jar_by_id) wired when
 * Pod-N and Pod-J infrastructure is fully available.
 */
export function verifyPointerReferences(codex: Codex): PointerVerificationResult {
  const broken: string[] = [];
  const warnings: string[] = [];

  for (const chapter of codex.chapters) {
    // Gold tablet pointers — must be non-empty strings
    for (const ptr of chapter.gold_tablet_pointers) {
      if (!ptr.trim()) broken.push(`Chapter '${chapter.topic}': empty gold_tablet_pointer`);
    }
    // Excalibur pointers
    for (const ptr of chapter.excalibur_pointers) {
      if (!ptr.trim()) broken.push(`Chapter '${chapter.topic}': empty excalibur_pointer`);
    }
    // Jar pointers
    for (const ptr of chapter.jar_pointers) {
      if (!ptr.trim()) broken.push(`Chapter '${chapter.topic}': empty jar_pointer`);
    }
    // Joules redemption pointers (optional)
    for (const ptr of chapter.joules_redemption_pointers ?? []) {
      if (!ptr.trim()) warnings.push(`Chapter '${chapter.topic}': empty joules_redemption_pointer`);
    }
  }

  return {
    valid: broken.length === 0,
    broken_pointers: broken,
    warnings,
  };
}

// ─── CodexBinding ─────────────────────────────────────────────────────────────

export class CodexBinding {
  /**
   * Bind a Codex — finalizes + HMAC-locks; subsequent mutations rejected.
   *
   * 1. Verify Codex.status == "review"
   * 2. Verify all pointer references resolve
   * 3. Compute HMAC over canonical chapter ordering
   * 4. Set status = "bound"; populate bound_ts + bound_hmac
   * 5. Pheromone Pixie-Dust write
   */
  async bind(codex_id: string, signer: string): Promise<BoundCodex | { error: string }> {
    const codex = getCodexById(codex_id);
    if (!codex) {
      return { error: `Codex '${codex_id}' not found` };
    }
    if (codex.status !== "review") {
      return {
        error: `Codex '${codex_id}' is in status '${codex.status}'. Must be 'review' before binding.`,
      };
    }

    // Pointer reference verification
    const ptrCheck = verifyPointerReferences(codex);
    if (!ptrCheck.valid) {
      return {
        error: `Binding rejected — broken pointer references: ${ptrCheck.broken_pointers.join("; ")}`,
      };
    }

    const bound_ts = new Date().toISOString();
    const bound_hmac = computeCodexHmac(codex_id, codex.chapters, bound_ts);

    const bound: BoundCodex = {
      ...codex,
      status: "bound",
      bound_ts,
      bound_hmac,
    };

    appendCodexEntry(bound);

    emitPheromone(
      "CodexBinding",
      `codex_bind_${codex_id}`,
      `codex bind ${codex.title} edition:${codex.edition} signer:${signer} layer-8 canon-of-canons bound immutable`,
      { cathedral: "knight", flavorClass: { domain: "codex", cognition: "building-in-public" } }
    );

    return bound;
  }

  /**
   * Supersede an old bound Codex with a new one.
   * Sets old.superseded_by = new_codex_id and new.status stays as-is.
   */
  async supersede(old_codex_id: string, new_codex_id: string): Promise<void | { error: string }> {
    const old = getCodexById(old_codex_id);
    if (!old) return { error: `Codex '${old_codex_id}' not found` };
    if (old.status !== "bound") {
      return { error: `Codex '${old_codex_id}' is not bound — only bound Codices can be superseded` };
    }
    const newCodex = getCodexById(new_codex_id);
    if (!newCodex) return { error: `New Codex '${new_codex_id}' not found` };

    const updated: Codex = { ...old, status: "superseded", superseded_by: new_codex_id };
    appendCodexEntry(updated);

    emitPheromone(
      "CodexBinding",
      `codex_supersede_${old_codex_id}`,
      `codex supersede ${old.title} → ${newCodex.title} layer-8 canon-of-canons`,
      { cathedral: "knight", flavorClass: { domain: "codex", cognition: "building-in-public" } }
    );
  }

  /**
   * Guard: reject mutations on bound Codex (called before any write operation).
   */
  checkMutationAllowed(codex: Codex): { allowed: boolean; reason: string } {
    if (codex.status === "bound" || codex.status === "superseded") {
      return {
        allowed: false,
        reason: `Codex '${codex.id}' is '${codex.status}' — IMMUTABLE. Post-binding mutations rejected. ` +
          "To update: create a new Codex and use supersede().",
      };
    }
    return { allowed: true, reason: "Codex is in mutable state" };
  }
}
