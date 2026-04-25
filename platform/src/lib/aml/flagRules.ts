/**
 * AML Flag Rules — K504 (Phase A)
 * =================================
 * Three automated flag rules + daily cron job runner.
 *
 * GUARDRAILS:
 *   - All flags are internal-only; no member notification on creation
 *   - No auto-suspension; verdict requires curator review
 *   - Idempotent: existing unresolved flags not re-created for same member+type
 *
 * Pawn red-team vector C.2 (Credit On-Ramp as Layering Vehicle)
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type AmlFlagType =
  | 'aml_concentration_high'
  | 'aml_velocity_spike'
  | 'aml_new_account_high_velocity'
  | 'aml_coordinated_ring'
  | 'aml_trust_match_crossref';

export interface AmlFlag {
  id: string;
  member_id: string;
  flag_type: AmlFlagType;
  triggered_at: string;
  evidence_json: Record<string, unknown>;
  verdict: 'pending' | 'legitimate' | 'escalate' | 'dispatch_sar';
  reviewed_at: string | null;
  reviewer_id: string | null;
  notes: string | null;
  resolved_at: string | null;
}

export interface ConcentrationRow {
  member_id: string;
  top_counterparty_id: string;
  concentration_pct: number;
  counterparty_spend: number;
  total_spend_30d: number;
  transaction_count: number;
  first_transaction_at: string;
  last_transaction_at: string;
}

export interface VelocityRow {
  member_id: string;
  spend_7d: number;
  median_weekly_spend_90d: number;
  transaction_count: number;
}

export interface NewAccountRow {
  member_id: string;
  account_age_days: number;
  spend_7d: number;
  transaction_ids: string[];
}

// ── Database interface (injectable for testing) ────────────────────────────────

export interface AmlFlagRulesDB {
  getConcentrationRows(): Promise<ConcentrationRow[]>;
  getVelocityRows(): Promise<VelocityRow[]>;
  getNewAccountHighVelocityRows(): Promise<NewAccountRow[]>;
  getExistingActiveFlags(memberId: string, flagType: AmlFlagType): Promise<AmlFlag[]>;
  insertFlag(memberId: string, flagType: AmlFlagType, evidence: Record<string, unknown>): Promise<AmlFlag>;
}

// ── Thresholds ─────────────────────────────────────────────────────────────────

/**
 * Thresholds are NOT exposed to members in any public-facing copy per guardrail.
 * Changing these values requires rebuilding the cron job — deliberately not config-driven
 * to prevent threshold-probing from leaking to members.
 */
const THRESHOLDS = {
  /** A.2: concentration flag triggers when both conditions met */
  concentration: {
    pct: 60,           // >60% spend to single counterparty in 30 days
    volume_usd: 500,   // AND absolute Credit-spend > $500/month equivalent
  },

  /** A.3: velocity flag triggers when 7-day spend > N× trailing 90-day median weekly spend */
  velocity: {
    multiplier: 5,
  },

  /** A.4: new-account flag triggers when account < 30d old AND 7-day spend > threshold */
  new_account: {
    max_age_days: 30,
    spend_7d_usd: 1000,
  },
} as const;

// ── Flag rule: A.2 Concentration ──────────────────────────────────────────────

export async function runConcentrationFlagRule(db: AmlFlagRulesDB): Promise<AmlFlag[]> {
  const rows = await db.getConcentrationRows();
  const created: AmlFlag[] = [];

  for (const row of rows) {
    if (
      row.concentration_pct > THRESHOLDS.concentration.pct &&
      row.total_spend_30d > THRESHOLDS.concentration.volume_usd
    ) {
      const existing = await db.getExistingActiveFlags(row.member_id, 'aml_concentration_high');
      if (existing.length > 0) continue; // idempotent — don't re-flag until prior flag resolved

      const flag = await db.insertFlag(row.member_id, 'aml_concentration_high', {
        counterparty_id: row.top_counterparty_id,
        concentration_pct: row.concentration_pct,
        counterparty_spend: row.counterparty_spend,
        total_spend_30d: row.total_spend_30d,
        transaction_count: row.transaction_count,
        first_transaction_at: row.first_transaction_at,
        last_transaction_at: row.last_transaction_at,
        threshold_pct_applied: THRESHOLDS.concentration.pct,
        threshold_volume_applied: THRESHOLDS.concentration.volume_usd,
      });
      created.push(flag);
    }
  }

  return created;
}

// ── Flag rule: A.3 Velocity spike ─────────────────────────────────────────────

export async function runVelocitySpikeFlagRule(db: AmlFlagRulesDB): Promise<AmlFlag[]> {
  const rows = await db.getVelocityRows();
  const created: AmlFlag[] = [];

  for (const row of rows) {
    const ratio = row.median_weekly_spend_90d > 0
      ? row.spend_7d / row.median_weekly_spend_90d
      : null;

    // Only flag if there IS a baseline (null median = new account, covered by A.4)
    if (ratio !== null && ratio > THRESHOLDS.velocity.multiplier) {
      const existing = await db.getExistingActiveFlags(row.member_id, 'aml_velocity_spike');
      if (existing.length > 0) continue;

      const flag = await db.insertFlag(row.member_id, 'aml_velocity_spike', {
        spend_7d: row.spend_7d,
        median_weekly_spend_90d: row.median_weekly_spend_90d,
        ratio: Math.round(ratio * 100) / 100,
        transaction_count: row.transaction_count,
        threshold_multiplier_applied: THRESHOLDS.velocity.multiplier,
      });
      created.push(flag);
    }
  }

  return created;
}

// ── Flag rule: A.4 New-account high-velocity ──────────────────────────────────

export async function runNewAccountHighVelocityFlagRule(db: AmlFlagRulesDB): Promise<AmlFlag[]> {
  const rows = await db.getNewAccountHighVelocityRows();
  const created: AmlFlag[] = [];

  for (const row of rows) {
    if (
      row.account_age_days < THRESHOLDS.new_account.max_age_days &&
      row.spend_7d > THRESHOLDS.new_account.spend_7d_usd
    ) {
      const existing = await db.getExistingActiveFlags(row.member_id, 'aml_new_account_high_velocity');
      if (existing.length > 0) continue;

      const flag = await db.insertFlag(row.member_id, 'aml_new_account_high_velocity', {
        account_age_days: row.account_age_days,
        spend_7d: row.spend_7d,
        transaction_ids: row.transaction_ids,
        threshold_age_days_applied: THRESHOLDS.new_account.max_age_days,
        threshold_spend_7d_applied: THRESHOLDS.new_account.spend_7d_usd,
      });
      created.push(flag);
    }
  }

  return created;
}

// ── Daily cron entry point ────────────────────────────────────────────────────

export interface DailyCronResult {
  concentrationFlags: AmlFlag[];
  velocityFlags: AmlFlag[];
  newAccountFlags: AmlFlag[];
  totalNew: number;
  ranAt: string;
}

/**
 * Run all three Phase-A flag rules.
 * Intended to run at 03:00 UTC daily (low-traffic window).
 * Idempotent: existing unresolved flags of same type+member are not re-created.
 */
export async function runDailyAmlFlagJob(db: AmlFlagRulesDB): Promise<DailyCronResult> {
  const [concentrationFlags, velocityFlags, newAccountFlags] = await Promise.all([
    runConcentrationFlagRule(db),
    runVelocitySpikeFlagRule(db),
    runNewAccountHighVelocityFlagRule(db),
  ]);

  return {
    concentrationFlags,
    velocityFlags,
    newAccountFlags,
    totalNew: concentrationFlags.length + velocityFlags.length + newAccountFlags.length,
    ranAt: new Date().toISOString(),
  };
}
