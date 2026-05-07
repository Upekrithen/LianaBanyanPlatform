/**
 * BP028 — Chronos chronicler tag contract for Skip-Eblet URNs.
 *
 * Build-time refresh: optionally run `node scripts/chronos-schema-codegen.mjs` after
 * Librarian `chronos_query` returns a new schema doc (developer machine only).
 * Skip-Eblet code treats tags as opaque; only equality + ordering use helpers below.
 */

/** Opaque Chronos tag (full chronicler string; never parse internally). */
export type ChronosTag = string;

/** ISO-like monotonic prefix is typical; ordering is lexicographic fallback until Chronos RPC. */
export function compareChronosTagsOpaque(a: ChronosTag, b: ChronosTag): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function chronosTagsEqual(a: ChronosTag, b: ChronosTag): boolean {
  return a === b;
}

/** Cached schema fingerprint for debugging / drift (not the secret material). */
export const CHRONOS_SCHEMA_CACHE_FINGERPRINT =
  "bp028-skip-eblets-opaque-tag-v1-2026-05-06";
