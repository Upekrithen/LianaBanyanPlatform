/** Cooperative epoch — daily rotation from 2026-01-01T00:00:00Z */
const EPOCH_ORIGIN_MS = new Date("2026-01-01T00:00:00Z").getTime();
const MS_PER_DAY = 86_400_000;

export function getCooperativeEpoch(nowMs: number = Date.now()): number {
  return Math.floor((nowMs - EPOCH_ORIGIN_MS) / MS_PER_DAY);
}

/** Expires at midnight UTC of the next cooperative epoch boundary. */
export function getExpiresAt(nowMs: number = Date.now()): Date {
  const epoch = getCooperativeEpoch(nowMs);
  return new Date(EPOCH_ORIGIN_MS + (epoch + 1) * MS_PER_DAY);
}

export function isExpired(expiresAt: string | Date, nowMs: number = Date.now()): boolean {
  return new Date(expiresAt).getTime() <= nowMs;
}
