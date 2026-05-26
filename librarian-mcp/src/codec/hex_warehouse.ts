/**
 * Speckle Architecture — Hex Codec Layer (BP058 W15 V15.1)
 *
 * Vocabulary:
 *   Speckle      = atomic 4-bit nibble (one hex char) — singularity of information
 *   Soccerball   = 32-Speckle composite (128-bit handle) — truncated-icosahedron topology
 *   Peanut-Roll  = N-soccerball chain — TCP/IP wire-format primitive
 *   MassCrystal  = in-memory Map<soccerball_id, PeanutRoll> — O(1) substrate
 *   AI Tuner     = Killashandra → Founder → Bishop → Knight → Members lineage
 *
 * Context-agnostic: LLM operates on Speckles as machine codes.
 * Ollama at IN/OUT boundaries does natural-language ↔ Speckle conversion.
 * ANY LLM works because context window is IRRELEVANT when on Speckle machine codes.
 *
 * Empirical math:
 *   300K context = 600K Speckles = ~12K Pearl handles = ~10MB substrate (ONE session)
 *   Current substrate ~611 Pearls × 16-byte handles = ~10KB → 400-600× headroom
 */

import { createHash } from "crypto";

// ─── Core Types ────────────────────────────────────────────────────────────────

/** 4-bit nibble atom — one hex character (0-f). Singularity of information. */
export type Speckle = string; // invariant: length === 1, /^[0-9a-f]$/

/** 32-Speckle 128-bit composite handle. Truncated-icosahedron topology. */
export type Soccerball = string; // invariant: length === 32, /^[0-9a-f]{32}$/

/** Fixed-width wire format: N-soccerball chain. TCP/IP wire-format primitive. */
export interface PeanutRoll {
  v: 1;
  s: Soccerball;
  p: string[];   // pearl_ids encoded in this soccerball
  b: Record<string, string>; // binding-set key→value
  ts: number;    // unix timestamp ms — creation time
}

/** In-memory O(1) substrate — Memory-Crystal lineage. */
export type MassCrystal = Map<Soccerball, PeanutRoll>;

// ─── Global MassCrystal Index ──────────────────────────────────────────────────

const MASS_CRYSTAL: MassCrystal = new Map();

// ─── Encoding / Decoding ──────────────────────────────────────────────────────

/**
 * soccerball_emit — encode N pearl_ids + binding-set into a 32-char hex Soccerball handle.
 *
 * Strategy: stable deterministic hash so same pearl set + bindings always yields
 * same soccerball_id (content-addressable, like Git). Uses SHA-256 truncated to 128 bits.
 */
export function soccerball_emit(
  pearls: string[],
  bindings: Record<string, string> = {}
): Soccerball {
  if (pearls.length === 0) throw new Error("soccerball_emit: pearls array must be non-empty");

  // Canonical form: sorted pearls + sorted binding keys for determinism
  const sortedPearls = [...pearls].sort();
  const sortedBindings = Object.fromEntries(
    Object.entries(bindings).sort(([a], [b]) => a.localeCompare(b))
  );

  const payload = JSON.stringify({ p: sortedPearls, b: sortedBindings });
  const hash = createHash("sha256").update(payload).digest("hex");
  const soccerball_id = hash.slice(0, 32) as Soccerball;

  // Write to MassCrystal substrate (O(1) lookup from this point forward)
  const roll: PeanutRoll = {
    v: 1,
    s: soccerball_id,
    p: sortedPearls,
    b: sortedBindings,
    ts: Date.now(),
  };
  MASS_CRYSTAL.set(soccerball_id, roll);

  return soccerball_id;
}

/**
 * soccerball_decode — decode Soccerball handle back to pearls + bindings.
 * Reads from MassCrystal first (O(1)). Returns null if handle not in substrate.
 */
export function soccerball_decode(
  soccerball_id: Soccerball
): { pearls: string[]; bindings: Record<string, string> } | null {
  const roll = MASS_CRYSTAL.get(soccerball_id);
  if (!roll) return null;
  return { pearls: [...roll.p], bindings: { ...roll.b } };
}

/**
 * speckle_lookup — constant-time index lookup returning Peanut-Roll wire format.
 * O(1) via MassCrystal Map. Returns null if soccerball_id not registered.
 */
export function speckle_lookup(soccerball_id: Soccerball): PeanutRoll | null {
  return MASS_CRYSTAL.get(soccerball_id) ?? null;
}

/**
 * speckle_register — register an externally created PeanutRoll into MassCrystal.
 * Used when hydrating the substrate from persistent storage.
 */
export function speckle_register(roll: PeanutRoll): void {
  MASS_CRYSTAL.set(roll.s, roll);
}

/**
 * mass_crystal_stats — diagnostic: current MassCrystal size + memory estimate.
 */
export function mass_crystal_stats(): { count: number; estimatedBytes: number } {
  const count = MASS_CRYSTAL.size;
  // Rough: each PeanutRoll ≈ 128B handle + ~50B per pearl_id + bindings
  const estimatedBytes = count * 200;
  return { count, estimatedBytes };
}

/**
 * speckle_nibble — extract individual Speckle (4-bit nibble) at position i.
 * Position 0-31 in a 32-Speckle Soccerball.
 */
export function speckle_nibble(soccerball_id: Soccerball, position: number): Speckle {
  if (position < 0 || position > 31) throw new Error("Speckle position must be 0-31");
  return soccerball_id[position];
}

/**
 * serialize_peanut_roll — fixed-width JSON serialization of PeanutRoll wire format.
 */
export function serialize_peanut_roll(roll: PeanutRoll): string {
  return JSON.stringify(roll);
}

/**
 * deserialize_peanut_roll — parse PeanutRoll from wire format.
 */
export function deserialize_peanut_roll(raw: string): PeanutRoll {
  const parsed = JSON.parse(raw);
  if (parsed.v !== 1 || typeof parsed.s !== "string" || !Array.isArray(parsed.p)) {
    throw new Error("Invalid PeanutRoll wire format");
  }
  return parsed as PeanutRoll;
}
