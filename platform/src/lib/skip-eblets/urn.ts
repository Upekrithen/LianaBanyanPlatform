import type { ChronosTag } from "./chronos-schema.js";

const PREFIX = "skip:";

export function buildSkipUrn(chronosTag: ChronosTag, idx: number): string {
  const safeTag = encodeURIComponent(chronosTag);
  return `${PREFIX}${safeTag}:${idx}`;
}

export function parseSkipUrn(urn: string): { chronosTag: ChronosTag; idx: number } | null {
  if (!urn.startsWith(PREFIX)) return null;
  const rest = urn.slice(PREFIX.length);
  const lastColon = rest.lastIndexOf(":");
  if (lastColon <= 0) return null;
  const encTag = rest.slice(0, lastColon);
  const idxStr = rest.slice(lastColon + 1);
  const idx = Number.parseInt(idxStr, 10);
  if (!Number.isFinite(idx) || idx < 0) return null;
  try {
    const chronosTag = decodeURIComponent(encTag) as ChronosTag;
    return { chronosTag, idx };
  } catch {
    return null;
  }
}
