import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";

const SID_HEX_RE = /^[0-9a-f]{32}$/;

/** SHA-256 hash of client IP — never store plaintext IP. */
export function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress ?? "unknown";
}

interface WindowEntry {
  count: number;
  resetAt: number;
}

const sidWindows = new Map<string, WindowEntry>();

function checkSidWindow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = sidWindows.get(key);

  if (!entry || now >= entry.resetAt) {
    sidWindows.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= max) {
    return false;
  }

  entry.count += 1;
  return true;
}

/** Max 10 publishes per IP per hour. */
export const publishIpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "rate limited: too many publishes from this IP" },
  handler: (_req, res) => {
    res.status(429).json({ ok: false, error: "rate limited: too many publishes from this IP" });
  },
});

/** Max 3 publishes per SID per hour. */
export function publishSidLimiter(req: Request, res: Response, next: NextFunction): void {
  const sid = typeof req.body?.s === "string" ? req.body.s : "";
  if (!SID_HEX_RE.test(sid)) {
    next();
    return;
  }

  const key = `publish:sid:${sid}`;
  if (!checkSidWindow(key, 3, 60 * 60 * 1000)) {
    res.status(429).json({ ok: false, error: "rate limited: too many publishes for this SID" });
    return;
  }
  next();
}

/** Max 60 resolves per IP per minute. */
export const resolveIpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: "rate limited: too many resolve requests from this IP" });
  },
});

/** Periodic cleanup of in-memory SID windows (best-effort; per-instance on Cloud Run). */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of sidWindows) {
    if (now >= entry.resetAt) {
      sidWindows.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();
