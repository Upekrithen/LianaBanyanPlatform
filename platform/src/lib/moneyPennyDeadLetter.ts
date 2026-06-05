/**
 * MoneyPenny Dead-Letter Queue — BP073 Wave 4 · W4.9
 * ===================================================
 * Captures routing failures that exhausted all retries.
 * Nothing is lost. Every failed event can be replayed.
 *
 * Storage: moneypenny_dead_letter DB table (added in migration below).
 * The dead-letter processor polls this table and re-attempts delivery.
 *
 * Dead-letter is triggered by withChannelRetry() onFinalFailure callback
 * in moneypenny-voice, moneypenny-sms, gatekeeper-triage, gmail-bridge.
 *
 * DB Table (add to next Supabase migration):
 *   moneypenny_dead_letter (
 *     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *     channel TEXT NOT NULL,          -- voice | sms | gmail | resend
 *     event_type TEXT NOT NULL,       -- call_log | sms_send | email_intake | auto_response
 *     payload JSONB NOT NULL,         -- original event data
 *     error_message TEXT,
 *     retry_count INT DEFAULT 0,
 *     max_retries INT DEFAULT 5,
 *     status TEXT DEFAULT 'pending',  -- pending | retrying | resolved | abandoned
 *     next_retry_at TIMESTAMPTZ,
 *     created_at TIMESTAMPTZ DEFAULT now(),
 *     resolved_at TIMESTAMPTZ
 *   )
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type DeadLetterChannel = "voice" | "sms" | "gmail" | "resend";
export type DeadLetterStatus = "pending" | "retrying" | "resolved" | "abandoned";

export interface DeadLetterItem {
  id?: string;
  channel: DeadLetterChannel;
  event_type: string;
  payload: Record<string, unknown>;
  error_message: string;
  retry_count: number;
  max_retries: number;
  status: DeadLetterStatus;
  next_retry_at: string;
  created_at?: string;
  resolved_at?: string | null;
}

export interface DeadLetterPushResult {
  success: boolean;
  id?: string;
  error?: string;
}

export interface DeadLetterProcessResult {
  processed: number;
  resolved: number;
  re_queued: number;
  abandoned: number;
  errors: string[];
}

// ─── Retry Schedule per Channel ──────────────────────────────────────────────

const DEAD_LETTER_MAX_RETRIES: Record<DeadLetterChannel, number> = {
  voice: 3,
  sms: 5,
  gmail: 5,
  resend: 5,
};

/**
 * Calculate next retry time (exponential: 5min, 30min, 2h, 6h, 24h).
 */
export function calcNextRetryAt(retryCount: number): Date {
  const delays = [5, 30, 120, 360, 1440];
  const minutesDelay = delays[Math.min(retryCount, delays.length - 1)];
  return new Date(Date.now() + minutesDelay * 60 * 1000);
}

// ─── Push to Dead Letter ──────────────────────────────────────────────────────

/**
 * W4.9 — Push a failed routing event to the dead-letter queue.
 * Called by onFinalFailure in withChannelRetry().
 *
 * FOUNDER: no configuration needed. This runs automatically when any
 * channel fails all retries. Review dead letters in MoneyPennyDashboard
 * > Channel Health > Dead Letter tab.
 */
export async function pushToDeadLetter(
  supabase: { from: (table: string) => unknown },
  channel: DeadLetterChannel,
  event_type: string,
  payload: Record<string, unknown>,
  error_message: string,
): Promise<DeadLetterPushResult> {
  const item: Omit<DeadLetterItem, "id" | "created_at"> = {
    channel,
    event_type,
    payload,
    error_message,
    retry_count: 0,
    max_retries: DEAD_LETTER_MAX_RETRIES[channel],
    status: "pending",
    next_retry_at: calcNextRetryAt(0).toISOString(),
    resolved_at: null,
  };

  try {
    const table = (supabase as { from: (t: string) => { insert: (d: unknown) => { select: (s: string) => { single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }> } } } }).from("moneypenny_dead_letter");
    const { data, error } = await table.insert(item).select("id").single();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, id: data?.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ─── Process Dead Letters ────────────────────────────────────────────────────

type RetrySender = (item: DeadLetterItem) => Promise<{ success: boolean; error?: string }>;

/**
 * W4.9 — Poll the dead-letter queue and re-attempt pending items.
 * Called by a Supabase cron job (or manually by Founder from dashboard).
 *
 * For each item due for retry:
 *   - Increment retry_count
 *   - Call retrySender(item)
 *   - On success: mark resolved
 *   - On failure: if retry_count >= max_retries: mark abandoned
 *   - Else: schedule next retry (exponential backoff)
 */
export async function processPendingDeadLetters(
  supabase: {
    from: (table: string) => {
      select: (cols: string) => {
        eq: (col: string, val: unknown) => {
          lte: (col: string, val: string) => {
            order: (col: string, opts: { ascending: boolean }) => {
              limit: (n: number) => Promise<{ data: DeadLetterItem[] | null; error: { message: string } | null }>
            }
          }
        }
      };
      update: (data: unknown) => { eq: (col: string, val: string) => Promise<{ error: { message: string } | null }> }
    }
  },
  retrySender: RetrySender,
): Promise<DeadLetterProcessResult> {
  const result: DeadLetterProcessResult = {
    processed: 0,
    resolved: 0,
    re_queued: 0,
    abandoned: 0,
    errors: [],
  };

  const { data: pending, error: fetchError } = await supabase
    .from("moneypenny_dead_letter")
    .select("*")
    .eq("status", "pending")
    .lte("next_retry_at", new Date().toISOString())
    .order("created_at", { ascending: true })
    .limit(20);

  if (fetchError) {
    result.errors.push(`Fetch failed: ${fetchError.message}`);
    return result;
  }

  for (const item of pending ?? []) {
    result.processed++;
    const newRetryCount = item.retry_count + 1;

    const sendResult = await retrySender(item);

    if (sendResult.success) {
      await supabase
        .from("moneypenny_dead_letter")
        .update({
          status: "resolved",
          retry_count: newRetryCount,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", item.id!);
      result.resolved++;
    } else if (newRetryCount >= item.max_retries) {
      await supabase
        .from("moneypenny_dead_letter")
        .update({
          status: "abandoned",
          retry_count: newRetryCount,
          error_message: sendResult.error ?? item.error_message,
        })
        .eq("id", item.id!);
      result.abandoned++;
    } else {
      await supabase
        .from("moneypenny_dead_letter")
        .update({
          status: "pending",
          retry_count: newRetryCount,
          next_retry_at: calcNextRetryAt(newRetryCount).toISOString(),
          error_message: sendResult.error ?? item.error_message,
        })
        .eq("id", item.id!);
      result.re_queued++;
    }
  }

  return result;
}

// ─── Stats Helper ────────────────────────────────────────────────────────────

export interface DeadLetterStats {
  pending: number;
  retrying: number;
  abandoned: number;
  resolved_today: number;
  oldest_pending_hours: number | null;
}

/**
 * Build dead-letter stats summary from raw queue data.
 * Used by MoneyPennyDashboard channel health panel.
 */
export function summarizeDeadLetters(items: DeadLetterItem[]): DeadLetterStats {
  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const pending = items.filter(i => i.status === "pending");
  const oldestPending = pending.length > 0
    ? Math.max(
        ...pending.map(i => (now - new Date(i.created_at ?? now).getTime()) / 3_600_000),
      )
    : null;

  return {
    pending: pending.length,
    retrying: items.filter(i => i.status === "retrying").length,
    abandoned: items.filter(i => i.status === "abandoned").length,
    resolved_today: items.filter(
      i => i.status === "resolved" && i.resolved_at && new Date(i.resolved_at) >= todayStart,
    ).length,
    oldest_pending_hours: oldestPending !== null ? Math.round(oldestPending * 10) / 10 : null,
  };
}
