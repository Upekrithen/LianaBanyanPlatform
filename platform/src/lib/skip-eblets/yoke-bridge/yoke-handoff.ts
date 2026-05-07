/**
 * BP024 / BP028 — Yoke-mediated anchor URN handoff (opaque string on the wire).
 */

export interface YokeHandoffPayloadV1 {
  v: 1;
  anchorUrn: string;
  issuedAt: number;
}

export function serializeAnchorForYoke(anchorUrn: string): string {
  const payload: YokeHandoffPayloadV1 = { v: 1, anchorUrn, issuedAt: Date.now() };
  return JSON.stringify(payload);
}

export function deserializeAnchorFromYoke(raw: string): { anchorUrn: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error("yoke_handoff: invalid JSON");
  }
  if (!parsed || typeof parsed !== "object") throw new Error("yoke_handoff: malformed");
  const o = parsed as Record<string, unknown>;
  if (o["v"] !== 1 || typeof o["anchorUrn"] !== "string") {
    throw new Error("yoke_handoff: unsupported version or missing anchorUrn");
  }
  return { anchorUrn: o["anchorUrn"] };
}
