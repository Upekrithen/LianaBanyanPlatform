/**
 * AML Flag Rules — Unit Tests (K504 Phase A)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  runConcentrationFlagRule,
  runVelocitySpikeFlagRule,
  runNewAccountHighVelocityFlagRule,
  runDailyAmlFlagJob,
  type AmlFlagRulesDB,
  type AmlFlag,
  type ConcentrationRow,
  type VelocityRow,
  type NewAccountRow,
} from '../flagRules';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeFlag(partial: Partial<AmlFlag> = {}): AmlFlag {
  return {
    id: 'flag-1',
    member_id: 'member-A',
    flag_type: 'aml_concentration_high',
    triggered_at: new Date().toISOString(),
    evidence_json: {},
    verdict: 'pending',
    reviewed_at: null,
    reviewer_id: null,
    notes: null,
    resolved_at: null,
    ...partial,
  };
}

function makeDB(overrides: Partial<AmlFlagRulesDB> = {}): AmlFlagRulesDB {
  return {
    getConcentrationRows: vi.fn().mockResolvedValue([]),
    getVelocityRows: vi.fn().mockResolvedValue([]),
    getNewAccountHighVelocityRows: vi.fn().mockResolvedValue([]),
    getExistingActiveFlags: vi.fn().mockResolvedValue([]),
    insertFlag: vi.fn().mockResolvedValue(makeFlag()),
    ...overrides,
  };
}

// ── A.2 Concentration flag ────────────────────────────────────────────────────

describe('runConcentrationFlagRule', () => {
  it('flags member when >60% concentration AND >$500 volume', async () => {
    const row: ConcentrationRow = {
      member_id: 'member-A',
      top_counterparty_id: 'member-B',
      concentration_pct: 75,
      counterparty_spend: 450,
      total_spend_30d: 600,
      transaction_count: 8,
      first_transaction_at: '2026-04-01T00:00:00Z',
      last_transaction_at: '2026-04-25T00:00:00Z',
    };
    const db = makeDB({ getConcentrationRows: vi.fn().mockResolvedValue([row]) });
    const flags = await runConcentrationFlagRule(db);
    expect(flags).toHaveLength(1);
    expect(db.insertFlag).toHaveBeenCalledWith(
      'member-A',
      'aml_concentration_high',
      expect.objectContaining({ concentration_pct: 75, total_spend_30d: 600 }),
    );
  });

  it('does NOT flag when concentration >60% but volume <=500', async () => {
    const row: ConcentrationRow = {
      member_id: 'member-A',
      top_counterparty_id: 'member-B',
      concentration_pct: 80,
      counterparty_spend: 300,
      total_spend_30d: 375,
      transaction_count: 3,
      first_transaction_at: '2026-04-01T00:00:00Z',
      last_transaction_at: '2026-04-25T00:00:00Z',
    };
    const db = makeDB({ getConcentrationRows: vi.fn().mockResolvedValue([row]) });
    const flags = await runConcentrationFlagRule(db);
    expect(flags).toHaveLength(0);
  });

  it('does NOT flag when volume >$500 but concentration <=60%', async () => {
    const row: ConcentrationRow = {
      member_id: 'member-A',
      top_counterparty_id: 'member-B',
      concentration_pct: 55,
      counterparty_spend: 400,
      total_spend_30d: 727,
      transaction_count: 10,
      first_transaction_at: '2026-04-01T00:00:00Z',
      last_transaction_at: '2026-04-25T00:00:00Z',
    };
    const db = makeDB({ getConcentrationRows: vi.fn().mockResolvedValue([row]) });
    const flags = await runConcentrationFlagRule(db);
    expect(flags).toHaveLength(0);
  });

  it('is idempotent — does not re-flag if active flag exists', async () => {
    const row: ConcentrationRow = {
      member_id: 'member-A',
      top_counterparty_id: 'member-B',
      concentration_pct: 90,
      counterparty_spend: 900,
      total_spend_30d: 1000,
      transaction_count: 15,
      first_transaction_at: '2026-04-01T00:00:00Z',
      last_transaction_at: '2026-04-25T00:00:00Z',
    };
    const db = makeDB({
      getConcentrationRows: vi.fn().mockResolvedValue([row]),
      getExistingActiveFlags: vi.fn().mockResolvedValue([makeFlag()]),
    });
    const flags = await runConcentrationFlagRule(db);
    expect(flags).toHaveLength(0);
    expect(db.insertFlag).not.toHaveBeenCalled();
  });
});

// ── A.3 Velocity spike flag ────────────────────────────────────────────────────

describe('runVelocitySpikeFlagRule', () => {
  it('flags member when 7-day spend > 5× trailing weekly median', async () => {
    const row: VelocityRow = {
      member_id: 'member-A',
      spend_7d: 600,
      median_weekly_spend_90d: 100,
      transaction_count: 12,
    };
    const db = makeDB({ getVelocityRows: vi.fn().mockResolvedValue([row]) });
    const flags = await runVelocitySpikeFlagRule(db);
    expect(flags).toHaveLength(1);
    expect(db.insertFlag).toHaveBeenCalledWith(
      'member-A',
      'aml_velocity_spike',
      expect.objectContaining({ ratio: 6 }),
    );
  });

  it('does NOT flag when ratio exactly at boundary (5×)', async () => {
    const row: VelocityRow = {
      member_id: 'member-A',
      spend_7d: 500,
      median_weekly_spend_90d: 100,
      transaction_count: 10,
    };
    const db = makeDB({ getVelocityRows: vi.fn().mockResolvedValue([row]) });
    const flags = await runVelocitySpikeFlagRule(db);
    expect(flags).toHaveLength(0); // NOT strictly > 5×; must exceed, not meet
  });

  it('does NOT flag when median is zero (new account — no baseline)', async () => {
    const row: VelocityRow = {
      member_id: 'member-A',
      spend_7d: 1000,
      median_weekly_spend_90d: 0,
      transaction_count: 20,
    };
    const db = makeDB({ getVelocityRows: vi.fn().mockResolvedValue([row]) });
    const flags = await runVelocitySpikeFlagRule(db);
    expect(flags).toHaveLength(0); // zero median → new account; covered by A.4
  });

  it('is idempotent', async () => {
    const row: VelocityRow = {
      member_id: 'member-A',
      spend_7d: 1000,
      median_weekly_spend_90d: 100,
      transaction_count: 20,
    };
    const db = makeDB({
      getVelocityRows: vi.fn().mockResolvedValue([row]),
      getExistingActiveFlags: vi.fn().mockResolvedValue([makeFlag({ flag_type: 'aml_velocity_spike' })]),
    });
    const flags = await runVelocitySpikeFlagRule(db);
    expect(flags).toHaveLength(0);
  });
});

// ── A.4 New-account high-velocity flag ───────────────────────────────────────

describe('runNewAccountHighVelocityFlagRule', () => {
  it('flags account <30 days old with 7-day spend >$1000', async () => {
    const row: NewAccountRow = {
      member_id: 'member-A',
      account_age_days: 10,
      spend_7d: 1200,
      transaction_ids: ['tx-1', 'tx-2', 'tx-3'],
    };
    const db = makeDB({ getNewAccountHighVelocityRows: vi.fn().mockResolvedValue([row]) });
    const flags = await runNewAccountHighVelocityFlagRule(db);
    expect(flags).toHaveLength(1);
    expect(db.insertFlag).toHaveBeenCalledWith(
      'member-A',
      'aml_new_account_high_velocity',
      expect.objectContaining({ account_age_days: 10, spend_7d: 1200 }),
    );
  });

  it('does NOT flag account >=30 days old', async () => {
    const row: NewAccountRow = {
      member_id: 'member-A',
      account_age_days: 30,
      spend_7d: 1500,
      transaction_ids: ['tx-1'],
    };
    const db = makeDB({ getNewAccountHighVelocityRows: vi.fn().mockResolvedValue([row]) });
    const flags = await runNewAccountHighVelocityFlagRule(db);
    expect(flags).toHaveLength(0);
  });

  it('does NOT flag spend at exactly $1000', async () => {
    const row: NewAccountRow = {
      member_id: 'member-A',
      account_age_days: 5,
      spend_7d: 1000,
      transaction_ids: ['tx-1'],
    };
    const db = makeDB({ getNewAccountHighVelocityRows: vi.fn().mockResolvedValue([row]) });
    const flags = await runNewAccountHighVelocityFlagRule(db);
    expect(flags).toHaveLength(0); // must strictly exceed
  });
});

// ── Daily cron job ────────────────────────────────────────────────────────────

describe('runDailyAmlFlagJob', () => {
  it('runs all three rules and aggregates results', async () => {
    const concentrationRow: ConcentrationRow = {
      member_id: 'member-A', top_counterparty_id: 'member-B',
      concentration_pct: 70, counterparty_spend: 600, total_spend_30d: 857,
      transaction_count: 5, first_transaction_at: '2026-04-01T00:00:00Z',
      last_transaction_at: '2026-04-25T00:00:00Z',
    };
    const velocityRow: VelocityRow = {
      member_id: 'member-C', spend_7d: 800, median_weekly_spend_90d: 100, transaction_count: 8,
    };
    const db = makeDB({
      getConcentrationRows: vi.fn().mockResolvedValue([concentrationRow]),
      getVelocityRows: vi.fn().mockResolvedValue([velocityRow]),
      getNewAccountHighVelocityRows: vi.fn().mockResolvedValue([]),
      insertFlag: vi.fn()
        .mockResolvedValueOnce(makeFlag({ flag_type: 'aml_concentration_high' }))
        .mockResolvedValueOnce(makeFlag({ flag_type: 'aml_velocity_spike' })),
    });

    const result = await runDailyAmlFlagJob(db);
    expect(result.concentrationFlags).toHaveLength(1);
    expect(result.velocityFlags).toHaveLength(1);
    expect(result.newAccountFlags).toHaveLength(0);
    expect(result.totalNew).toBe(2);
    expect(result.ranAt).toBeTruthy();
  });
});
