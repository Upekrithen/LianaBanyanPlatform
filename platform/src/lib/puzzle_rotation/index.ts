/**
 * PUZZLE CONTENT ROTATION — Phase A countermeasure (K501)
 * =========================================================
 * Closes attack vector B.3 (Spark Answer Sharing) from Pawn red-team B119.
 *
 * Strategy: Golden Keys / Codebreaker / Six Sparks paths rotate every 30 days.
 * Shared answers expire with the content variant, eliminating network-effect cheating.
 *
 * All DB access is abstracted via PuzzleRotationDB to keep this module testable
 * without a live Supabase connection.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type PuzzleClass =
  | "golden_keys_treasure_map"
  | "codebreakers"
  | "six_sparks_path";

export interface PuzzleContentRotationRow {
  id: string;
  puzzle_class: PuzzleClass;
  content_payload: Record<string, unknown>;
  active_from: string;     // ISO timestamp
  active_until: string;    // ISO timestamp
  expected_completion_time_seconds: number;
  created_at: string;
}

export interface SparkVelocityAnomaly {
  completion_id: string;
  member_id: string;
  puzzle_id: string;
  completion_time_seconds: number | null;
  flagged_for_spark_review: boolean;
  puzzle_completed_at: string | null;
  created_at: string;
}

/** Minimal DB interface — inject real Supabase client or a mock in tests. */
export interface PuzzleRotationDB {
  getActivePuzzle(puzzleClass: PuzzleClass, now?: Date): Promise<PuzzleContentRotationRow | null>;
  insertRotation(row: Omit<PuzzleContentRotationRow, "id" | "created_at">): Promise<PuzzleContentRotationRow>;
  getExpiringSoon(daysAhead: number, now?: Date): Promise<PuzzleContentRotationRow[]>;
  getSparkVelocityAnomalies(limit?: number): Promise<SparkVelocityAnomaly[]>;
  flagCompletionForReview(completionId: string): Promise<void>;
  getCompletionTimePercentile(puzzleClass: PuzzleClass, percentile: number): Promise<number | null>;
  getMemberAccountAgeDays(memberId: string): Promise<number>;
  updateCompletionTimestamps(
    completionId: string,
    startedAt: Date,
    completedAt: Date,
  ): Promise<void>;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const ROTATION_PERIOD_DAYS = 30;
export const ROTATION_ADVANCE_NOTICE_DAYS = 7;
export const NEW_MEMBER_REVIEW_WINDOW_DAYS = 30;
export const VELOCITY_REVIEW_PERCENTILE = 5;   // below 5th percentile triggers flag

// ── Core helpers ──────────────────────────────────────────────────────────────

/**
 * Return the currently active puzzle variant for a given class.
 * Returns null if no active variant is configured (config gap → content ops issue).
 */
export async function getActivePuzzle(
  db: PuzzleRotationDB,
  puzzleClass: PuzzleClass,
  now = new Date(),
): Promise<PuzzleContentRotationRow | null> {
  return db.getActivePuzzle(puzzleClass, now);
}

/**
 * Queue a new content variant for the next rotation cycle.
 * active_from = current variant's active_until; active_until = active_from + 30 days.
 *
 * Called by the `rotate_puzzles_daily` cron when an active variant's active_until
 * is < ROTATION_ADVANCE_NOTICE_DAYS away.
 */
export async function queueNextRotation(
  db: PuzzleRotationDB,
  puzzleClass: PuzzleClass,
  contentPayload: Record<string, unknown>,
  expectedCompletionTimeSeconds: number,
  currentVariant: PuzzleContentRotationRow,
): Promise<PuzzleContentRotationRow> {
  const activeFrom = new Date(currentVariant.active_until);
  const activeUntil = new Date(activeFrom);
  activeUntil.setDate(activeUntil.getDate() + ROTATION_PERIOD_DAYS);

  return db.insertRotation({
    puzzle_class: puzzleClass,
    content_payload: contentPayload,
    active_from: activeFrom.toISOString(),
    active_until: activeUntil.toISOString(),
    expected_completion_time_seconds: expectedCompletionTimeSeconds,
  });
}

/**
 * Daily cron: check each puzzle class; if the active variant expires within
 * ROTATION_ADVANCE_NOTICE_DAYS, signal that a new variant should be queued.
 *
 * Returns a list of puzzle classes that need new content queued by content-ops.
 * Does NOT generate puzzle content — that is a human content-ops task.
 */
export async function checkRotationsDue(
  db: PuzzleRotationDB,
  now = new Date(),
): Promise<{ puzzleClass: PuzzleClass; expiresAt: string }[]> {
  const expiring = await db.getExpiringSoon(ROTATION_ADVANCE_NOTICE_DAYS, now);
  return expiring.map((row) => ({
    puzzleClass: row.puzzle_class,
    expiresAt: row.active_until,
  }));
}

// ── Completion-time monitoring ────────────────────────────────────────────────

/**
 * Record puzzle completion timestamps and flag if velocity anomaly detected.
 *
 * Flagging criteria (AND gate):
 *   - completion_time_seconds < 5th-percentile for the puzzle class population
 *   - member account age < 30 days
 *
 * Flagged completions appear in spark_velocity_anomalies view for curator review.
 * NO automatic denial — curator must review before any action.
 */
export async function recordPuzzleCompletion(
  db: PuzzleRotationDB,
  completionId: string,
  memberId: string,
  puzzleClass: PuzzleClass,
  startedAt: Date,
  completedAt: Date,
): Promise<{ flagged: boolean; reason?: string }> {
  await db.updateCompletionTimestamps(completionId, startedAt, completedAt);

  const completionSeconds = (completedAt.getTime() - startedAt.getTime()) / 1000;

  const [p5Threshold, accountAgeDays] = await Promise.all([
    db.getCompletionTimePercentile(puzzleClass, VELOCITY_REVIEW_PERCENTILE),
    db.getMemberAccountAgeDays(memberId),
  ]);

  if (
    p5Threshold !== null &&
    completionSeconds < p5Threshold &&
    accountAgeDays < NEW_MEMBER_REVIEW_WINDOW_DAYS
  ) {
    await db.flagCompletionForReview(completionId);
    return {
      flagged: true,
      reason: `Completion time ${completionSeconds}s is below 5th percentile (${p5Threshold}s) and member account age is ${accountAgeDays} days.`,
    };
  }

  return { flagged: false };
}

/**
 * Retrieve all currently flagged spark velocity anomalies for the curator endpoint.
 * Corresponds to /api/admin/spark_velocity_anomalies.
 */
export async function getSparkVelocityAnomalies(
  db: PuzzleRotationDB,
  limit = 100,
): Promise<SparkVelocityAnomaly[]> {
  return db.getSparkVelocityAnomalies(limit);
}
