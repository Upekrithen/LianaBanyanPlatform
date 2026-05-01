/**
 * bounty-furnace-verify — Supabase Edge Function
 * ================================================
 * Verifies Bounty submissions against the appropriate rubric.
 * Routes to per-bounty rubric branches by `bounty_id`.
 *
 * KN094 / BP011 adds Bounty #7 — Heartbeat Interval Tuning.
 * KN088 / BP009 established Bounties #1-6 (KN088 commit f997705).
 *
 * Constitutional: Cost+20% platform margin governs all reward calculations.
 * Anti-farming: Furnace pass + independent 7-day reproducibility re-run.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ── Types ──────────────────────────────────────────────────────────────────

interface BountySubmission {
  bounty_id: number;
  submitter_id: string;
  submission_data: Record<string, unknown>;
}

interface FurnaceReceipt {
  passed: boolean;
  score: number;
  bounty_id: number;
  submitter_id: string;
  rejection_reason?: string;
  verified_at: string;
  details: Record<string, unknown>;
}

// ── Bounty #7 Rubric ───────────────────────────────────────────────────────

/**
 * Bounty #7 — Heartbeat Interval Tuning (KN094 / BP011).
 *
 * Weighted score formula (Founder-ratified BP011 turn 16):
 *   score = 0.6 × (accuracy_pct / 100)
 *         + 0.2 × (1 − storage_overrun_pct)
 *         + 0.2 × (1 − latency_overrun_pct)
 *
 * Pass threshold: 0.65
 * Baseline (KN091 a3cc7a2): 60s → 100% accuracy / 170 MB / 3-min latency.
 *
 * Inputs (from submission_data):
 *   - adjusted_interval_seconds: number  (must be in [30, 300])
 *   - accuracy_pct: number               (cohort-detect accuracy over 24h test)
 *   - storage_mb: number                 (Stone Tablet rolling-30-day MB)
 *   - latency_ms: number                 (cohort-detect max latency in ms)
 */
function verifyBounty7(submission: BountySubmission): FurnaceReceipt {
  const data = submission.submission_data;

  const PASS_THRESHOLD = 0.65;
  const BASELINE_ACCURACY_PCT = 100.0;
  const BASELINE_STORAGE_MB = 170.0;
  const BASELINE_LATENCY_MS = 180000; // 3 min
  const INTERVAL_MIN = 30;
  const INTERVAL_MAX = 300;

  const interval = Number(data.adjusted_interval_seconds ?? 0);
  const accuracyPct = Number(data.accuracy_pct ?? 0);
  const storageMb = Number(data.storage_mb ?? BASELINE_STORAGE_MB);
  const latencyMs = Number(data.latency_ms ?? BASELINE_LATENCY_MS);

  const details: Record<string, unknown> = {
    interval_seconds: interval,
    accuracy_pct: accuracyPct,
    storage_mb: storageMb,
    latency_ms: latencyMs,
    baseline_accuracy_pct: BASELINE_ACCURACY_PCT,
    baseline_storage_mb: BASELINE_STORAGE_MB,
    baseline_latency_ms: BASELINE_LATENCY_MS,
  };

  // Validate interval range
  if (interval < INTERVAL_MIN || interval > INTERVAL_MAX) {
    return {
      passed: false,
      score: 0,
      bounty_id: 7,
      submitter_id: submission.submitter_id,
      rejection_reason: `adjusted_interval_seconds ${interval} outside bounded range [${INTERVAL_MIN}, ${INTERVAL_MAX}]`,
      verified_at: new Date().toISOString(),
      details,
    };
  }

  const storageOverrunPct = Math.max(0, (storageMb - BASELINE_STORAGE_MB) / BASELINE_STORAGE_MB);
  const latencyOverrunPct = Math.max(0, (latencyMs - BASELINE_LATENCY_MS) / BASELINE_LATENCY_MS);

  const score =
    0.6 * (accuracyPct / 100.0) +
    0.2 * Math.max(0, 1 - storageOverrunPct) +
    0.2 * Math.max(0, 1 - latencyOverrunPct);

  details.storage_overrun_pct = storageOverrunPct;
  details.latency_overrun_pct = latencyOverrunPct;
  details.score = score;
  details.pass_threshold = PASS_THRESHOLD;

  const passed = score >= PASS_THRESHOLD;

  return {
    passed,
    score,
    bounty_id: 7,
    submitter_id: submission.submitter_id,
    rejection_reason: passed
      ? undefined
      : `Weighted score ${score.toFixed(3)} < threshold ${PASS_THRESHOLD}`,
    verified_at: new Date().toISOString(),
    details,
  };
}

// ── Router ────────────────────────────────────────────────────────────────

function verifySubmission(submission: BountySubmission): FurnaceReceipt {
  switch (submission.bounty_id) {
    case 7:
      return verifyBounty7(submission);
    default:
      return {
        passed: false,
        score: 0,
        bounty_id: submission.bounty_id,
        submitter_id: submission.submitter_id,
        rejection_reason: `No rubric registered for bounty_id ${submission.bounty_id}`,
        verified_at: new Date().toISOString(),
        details: {},
      };
  }
}

// ── Handler ───────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let submission: BountySubmission;
  try {
    submission = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!submission.bounty_id || !submission.submitter_id) {
    return new Response(
      JSON.stringify({ error: "bounty_id and submitter_id are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const receipt = verifySubmission(submission);

  return new Response(JSON.stringify(receipt), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
