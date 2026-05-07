import type { ChronosTag } from "./chronos-schema.js";
import { buildSkipUrn } from "./urn.js";

/** SHA-256 hex of anchor + etching payload (borrow-time drift detection). */
export async function hashEtching(
  anchorUrn: string,
  etchingPayload: string,
  chronosTag: ChronosTag,
  paneIndex: number,
): Promise<string> {
  const urn = buildSkipUrn(chronosTag, paneIndex);
  const canonical = `${anchorUrn}|${urn}|${etchingPayload}`;
  const enc = new TextEncoder().encode(canonical);
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("Web Crypto unavailable: ensure crypto.subtle in browser or vitest global");
  }
  const buf = await subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function detectEtchingDrift(expectedHash: string, actualHash: string): boolean {
  return expectedHash !== actualHash;
}
