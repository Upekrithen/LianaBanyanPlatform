/**
 * BP028 — Regenerate chronos-schema.ts fingerprint line (optional; repo stays hermetic without MCP).
 */
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const target = resolve(__dirname, "../src/lib/skip-eblets/chronos-schema.ts");
const stamp = new Date().toISOString().slice(0, 10);

const content = `/**
 * BP028 — Chronos chronicler tag contract for Skip-Eblet URNs.
 *
 * Last codegen stub refresh: ${stamp}
 * Optional: run \\`node scripts/chronos-schema-codegen.mjs\\` after Chronos spec changes.
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
  "bp028-skip-eblets-opaque-tag-v1-${stamp}";
`;

writeFileSync(target, content.replace(/\$\{stamp\}/g, stamp), "utf-8");
console.log("chronos-schema.ts updated:", stamp);
