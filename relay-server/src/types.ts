/** PeanutRoll wire format — DO NOT CHANGE */
export interface PeanutRoll {
  v: 1;
  s: string;
  p: string[];
  b: Record<string, string>;
  ts: number;
}

export const SID_RE = /^[0-9a-f]{32}$/;

export function isValidSid(sid: string): boolean {
  return sid.length === 32 && SID_RE.test(sid);
}

export function isValidPeanutRoll(body: unknown): body is PeanutRoll {
  if (!body || typeof body !== "object") return false;
  const roll = body as Record<string, unknown>;
  return (
    roll.v === 1 &&
    typeof roll.s === "string" &&
    isValidSid(roll.s) &&
    Array.isArray(roll.p) &&
    roll.p.every((x) => typeof x === "string") &&
    roll.b !== null &&
    typeof roll.b === "object" &&
    !Array.isArray(roll.b) &&
    Object.values(roll.b as Record<string, unknown>).every((x) => typeof x === "string") &&
    typeof roll.ts === "number"
  );
}
