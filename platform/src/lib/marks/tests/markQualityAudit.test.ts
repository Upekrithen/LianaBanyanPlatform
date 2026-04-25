/**
 * Tests: marks/markQualityAudit — Phase D (K501)
 */

import { describe, it, expect } from "vitest";
import {
  shouldAuditTransaction,
  createMarkAudit,
  submitAuditVerdict,
  type MarkAuditDB,
  type MarkQualityAudit,
  type MarkAuditPanelMember,
  type MarkTransactionInfo,
  AUDIT_SAMPLE_RATE,
  MIN_MARKS_FOR_AUDIT,
  MIN_ACCOUNT_AGE_DAYS,
} from "../markQualityAudit";

// ── Test doubles ──────────────────────────────────────────────────────────────

function makeTx(overrides: Partial<MarkTransactionInfo> = {}): MarkTransactionInfo {
  return {
    transaction_id: "tx-1",
    amount_marks: 500,
    sender_id: "mem-sender",
    receiver_id: "mem-receiver",
    sender_account_age_days: 90,
    receiver_account_age_days: 90,
    has_prior_trust_match_bond: false,
    ...overrides,
  };
}

function makeAudit(overrides: Partial<MarkQualityAudit> = {}): MarkQualityAudit {
  return {
    id: "audit-1",
    transaction_id: "tx-1",
    auditor_member_id: "auditor-1",
    verdict: "pending",
    notes: null,
    audit_seasoning_penalty_applied: false,
    assigned_at: "2026-04-25T10:00:00Z",
    completed_at: null,
    created_at: "2026-04-25T10:00:00Z",
    updated_at: "2026-04-25T10:00:00Z",
    ...overrides,
  };
}

function makePanel(): MarkAuditPanelMember {
  return {
    id: "panel-1",
    member_id: "auditor-1",
    opted_in_at: "2026-01-01T00:00:00Z",
    opted_out_at: null,
    audits_completed_count: 10,
    audit_xp_earned: 500,
    audits_this_week: 2,
    week_reset_at: "2026-04-21T00:00:00Z",
    is_active: true,
  };
}

function makeDB(overrides: Partial<MarkAuditDB> = {}): MarkAuditDB {
  const audit = makeAudit();
  return {
    sampleRate: () => AUDIT_SAMPLE_RATE,
    createAudit: async (a) => ({ ...a, id: "audit-new", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
    getAudit: async () => audit,
    updateAuditVerdict: async (id, verdict, notes, completedAt) => ({
      ...audit,
      verdict,
      notes,
      completed_at: completedAt.toISOString(),
      updated_at: new Date().toISOString(),
    }),
    getActivePanelMember: async () => makePanel(),
    getRandomPanelMember: async () => makePanel(),
    incrementPanelMemberWeeklyCount: async () => undefined,
    addAuditXP: async () => undefined,
    triggerGSRReview: async () => undefined,
    reverseMarkTransaction: async () => undefined,
    applySeasoningPenalty: async () => undefined,
    getPendingAuditsForAuditor: async () => [audit],
    optInAuditor: async () => makePanel(),
    optOutAuditor: async () => undefined,
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("shouldAuditTransaction", () => {
  it("excludes transactions below 100 Marks", () => {
    const tx = makeTx({ amount_marks: 50 });
    const result = shouldAuditTransaction(tx, () => 0);  // always selects
    expect(result.selected).toBe(false);
    expect(result.reason).toMatch(/Mark threshold/);
  });

  it("excludes transactions with Trust-Match-bonded counterparties", () => {
    const tx = makeTx({ has_prior_trust_match_bond: true });
    const result = shouldAuditTransaction(tx, () => 0);
    expect(result.selected).toBe(false);
    expect(result.reason).toMatch(/Trust Match bond/);
  });

  it("excludes sender with account age < 30 days", () => {
    const tx = makeTx({ sender_account_age_days: 10 });
    const result = shouldAuditTransaction(tx, () => 0);
    expect(result.selected).toBe(false);
  });

  it("excludes receiver with account age < 30 days", () => {
    const tx = makeTx({ receiver_account_age_days: 5 });
    const result = shouldAuditTransaction(tx, () => 0);
    expect(result.selected).toBe(false);
  });

  it("selects the transaction when all criteria pass and dice rolls into 0.5%", () => {
    const tx = makeTx();
    const result = shouldAuditTransaction(tx, () => 0.001);  // < 0.005 → selected
    expect(result.selected).toBe(true);
  });

  it("does NOT select when dice rolls outside 0.5% window", () => {
    const tx = makeTx();
    const result = shouldAuditTransaction(tx, () => 0.8);  // > 0.005 → not selected
    expect(result.selected).toBe(false);
    expect(result.reason).toMatch(/0\.5% rate/);
  });

  it("random selection respects the 0.5% rate over many samples", () => {
    const tx = makeTx();
    const trials = 10_000;
    let selected = 0;
    for (let i = 0; i < trials; i++) {
      if (shouldAuditTransaction(tx).selected) selected++;
    }
    // Expect roughly 0.5% ± 0.3% selection
    const rate = selected / trials;
    expect(rate).toBeGreaterThanOrEqual(0.002);
    expect(rate).toBeLessThanOrEqual(0.008);
  });
});

describe("createMarkAudit", () => {
  it("creates an audit with the panel member assigned", async () => {
    const db = makeDB();
    const audit = await createMarkAudit(db, makeTx());
    expect(audit).not.toBeNull();
    expect(audit!.auditor_member_id).toBe("auditor-1");
    expect(audit!.verdict).toBe("pending");
  });

  it("creates an unassigned audit when no panel member is available", async () => {
    const db = makeDB({ getRandomPanelMember: async () => null });
    const audit = await createMarkAudit(db, makeTx());
    expect(audit!.auditor_member_id).toBeNull();
  });
});

describe("submitAuditVerdict", () => {
  const now = new Date("2026-04-25T12:00:00Z");

  it("records 'legitimate' verdict and awards XP when timely", async () => {
    let xpAwarded = 0;
    const db = makeDB({ addAuditXP: async (_, xp) => { xpAwarded = xp; } });
    const result = await submitAuditVerdict(db, "audit-1", "auditor-1", "legitimate", null, now);
    expect(result.audit.verdict).toBe("legitimate");
    expect(result.consequenceQueued).toBe("none");
    expect(xpAwarded).toBeGreaterThan(0);
  });

  it("stages mark reversal + penalty for 'inflated' verdict (does NOT auto-apply)", async () => {
    let reversalCalled = false;
    let penaltyCalled = false;
    const db = makeDB({
      reverseMarkTransaction: async () => { reversalCalled = true; },
      applySeasoningPenalty: async () => { penaltyCalled = true; },
    });
    const result = await submitAuditVerdict(db, "audit-1", "auditor-1", "inflated", "Pattern match", now);
    expect(result.consequenceQueued).toMatch(/staged_for_curator_confirm/);
    // Auto-reversal and auto-penalty must NOT fire; curator must confirm
    expect(reversalCalled).toBe(false);
    expect(penaltyCalled).toBe(false);
  });

  it("triggers GSR review for 'disputed' verdict", async () => {
    let gsrCalled = false;
    const db = makeDB({ triggerGSRReview: async () => { gsrCalled = true; } });
    const result = await submitAuditVerdict(db, "audit-1", "auditor-1", "disputed", "Suspicious", now);
    expect(result.consequenceQueued).toMatch(/gsr_review/);
    expect(gsrCalled).toBe(true);
  });

  it("throws when non-assigned auditor attempts to submit verdict", async () => {
    const db = makeDB();
    await expect(
      submitAuditVerdict(db, "audit-1", "wrong-auditor", "legitimate", null, now),
    ).rejects.toThrow(/non-assigned auditor/);
  });

  it("throws when audit is already closed", async () => {
    const db = makeDB({ getAudit: async () => makeAudit({ verdict: "legitimate" }) });
    await expect(
      submitAuditVerdict(db, "audit-1", "auditor-1", "inflated", null, now),
    ).rejects.toThrow(/already closed/);
  });
});
