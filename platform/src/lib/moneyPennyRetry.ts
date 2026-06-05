/**
 * MoneyPenny Retry Logic — BP073 Wave 4 · W4.8
 * =============================================
 * Per-channel exponential backoff with jitter.
 * Each channel has its own retry configuration tuned to its SLA.
 *
 * Retry configs:
 *   voice    — 2 retries, 1s base, 5s max (TwiML must respond quickly)
 *   sms      — 3 retries, 2s base, 30s max (Twilio queues natively, but we back-pressure)
 *   gmail    — 3 retries, 5s base, 60s max (Pub/Sub delivers reliably, but Gmail API can 429)
 *   resend   — 3 retries, 2s base, 30s max (Resend API is reliable, but transient 5xx possible)
 *   db_write — 4 retries, 500ms base, 10s max (Supabase can briefly 503 on cold start)
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type RetryChannel = "voice" | "sms" | "gmail" | "resend" | "db_write";

export interface RetryConfig {
  channel: RetryChannel;
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterFactor: number;
  retryOnStatus?: number[];
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: string;
  attempts: number;
  totalDelayMs: number;
}

// ─── Per-Channel Configs ─────────────────────────────────────────────────────

export const RETRY_CONFIGS: Record<RetryChannel, RetryConfig> = {
  voice: {
    channel: "voice",
    maxAttempts: 2,
    baseDelayMs: 1000,
    maxDelayMs: 5000,
    jitterFactor: 0.2,
    retryOnStatus: [500, 502, 503, 504],
  },
  sms: {
    channel: "sms",
    maxAttempts: 3,
    baseDelayMs: 2000,
    maxDelayMs: 30_000,
    jitterFactor: 0.3,
    retryOnStatus: [429, 500, 502, 503],
  },
  gmail: {
    channel: "gmail",
    maxAttempts: 3,
    baseDelayMs: 5000,
    maxDelayMs: 60_000,
    jitterFactor: 0.25,
    retryOnStatus: [429, 500, 503],
  },
  resend: {
    channel: "resend",
    maxAttempts: 3,
    baseDelayMs: 2000,
    maxDelayMs: 30_000,
    jitterFactor: 0.3,
    retryOnStatus: [429, 500, 502, 503],
  },
  db_write: {
    channel: "db_write",
    maxAttempts: 4,
    baseDelayMs: 500,
    maxDelayMs: 10_000,
    jitterFactor: 0.2,
    retryOnStatus: [503, 504],
  },
};

// ─── Backoff Calculator ───────────────────────────────────────────────────────

/**
 * Calculate delay for attempt N using exponential backoff with full jitter.
 * Formula: min(maxDelay, base * 2^attempt) * (1 + jitter * rand[-1,1])
 */
export function calcBackoffDelay(config: RetryConfig, attempt: number): number {
  const exponential = Math.min(config.maxDelayMs, config.baseDelayMs * Math.pow(2, attempt));
  const jitter = exponential * config.jitterFactor * (Math.random() * 2 - 1);
  return Math.max(0, Math.round(exponential + jitter));
}

/**
 * Calculate delay deterministically for testing (no jitter).
 */
export function calcBackoffDelayDeterministic(config: RetryConfig, attempt: number): number {
  return Math.min(config.maxDelayMs, config.baseDelayMs * Math.pow(2, attempt));
}

// ─── Core Retry Wrapper ───────────────────────────────────────────────────────

type AsyncFn<T> = () => Promise<T>;

/**
 * W4.8 — Retry an async function per the channel's retry config.
 *
 * @param fn         The async operation to retry.
 * @param channel    Which channel's config to use.
 * @param shouldPush Optional: push to dead-letter on final failure.
 */
export async function withChannelRetry<T>(
  fn: AsyncFn<T>,
  channel: RetryChannel,
  onFinalFailure?: (err: Error) => Promise<void>,
): Promise<RetryResult<T>> {
  const config = RETRY_CONFIGS[channel];
  let lastError: Error | undefined;
  let totalDelayMs = 0;

  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      const result = await fn();
      return { success: true, result, attempts: attempt + 1, totalDelayMs };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      const isLastAttempt = attempt === config.maxAttempts - 1;
      if (!isLastAttempt) {
        const delay = calcBackoffDelay(config, attempt);
        totalDelayMs += delay;
        await sleep(delay);
      }
    }
  }

  if (onFinalFailure && lastError) {
    try {
      await onFinalFailure(lastError);
    } catch {
      // dead-letter push failed — log and continue
    }
  }

  return {
    success: false,
    error: lastError?.message ?? "Unknown error",
    attempts: config.maxAttempts,
    totalDelayMs,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Whether an HTTP status code should trigger a retry for a given channel.
 */
export function shouldRetryStatus(channel: RetryChannel, statusCode: number): boolean {
  const config = RETRY_CONFIGS[channel];
  return (config.retryOnStatus ?? []).includes(statusCode);
}

/**
 * Max total retry window in milliseconds for a channel (deterministic sum).
 * Used for SLA reasoning in the cost tracker and health dashboard.
 */
export function maxRetryWindowMs(channel: RetryChannel): number {
  const config = RETRY_CONFIGS[channel];
  let total = 0;
  for (let attempt = 0; attempt < config.maxAttempts - 1; attempt++) {
    total += calcBackoffDelayDeterministic(config, attempt);
  }
  return total;
}
