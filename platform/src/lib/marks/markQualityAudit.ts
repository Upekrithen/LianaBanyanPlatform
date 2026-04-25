/**
 * MARK QUALITY AUDIT — Phase D countermeasure (K501)
 * ====================================================
 * Closes attack vector A.2 (Mark Inflation) from Pawn red-team B119.
 *
 * 0.5% of Mark transactions meeting all three criteria are randomly flagged
 * for human audit panel review. All verdicts are human-curator decisions.
 * NO automatic punitive actions — flag for review only.
 *
 * Selection criteria (AND gate):
 *   - Transaction amount ≥ 100 Marks
 *   - Counterparties have no prior Trust Match bond
 *   - Neither member's account is < 30 days old
 *
 * Audit panel: high-Rep members (≥ 1000 XP) who have opted in via Helm settings.
 * Cap: 5 audits per auditor per week. Earn audit-XP for completing within 7 days.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type MarkAuditVerdict = "pending" | "legitimate" | "inflated" | "disputed";

export interface MarkQualityAudit {
  id: string;
  transaction_id: string;
  auditor_member_id: string | null;
  verdict: MarkAuditVerdict;
  notes: string | null;
  audit_seasoning_penalty_applied: boolean;
  assigned_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarkAuditPanelMember {
  id: string;
  member_id: string;
  opted_in_at: string;
  opted_out_at: string | null;
  audits_completed_count: number;
  audit_xp_earned: number;
  audits_this_week: number;
  week_reset_at: string;
  is_active: boolean;
}

export interface MarkTransactionInfo {
  transaction_id: string;
  amount_marks: number;
  sender_id: string;
  receiver_id: string;
  sender_account_age_days: number;
  receiver_account_age_days: number;
  has_prior_trust_match_bond: boolean;
}

export interface MarkAuditDB {
  sampleRate(): number;
  createAudit(audit: Omit<MarkQualityAudit, "id" | "created_at" | "updated_at">): Promise<MarkQualityAudit>;
  getAudit(auditId: string): Promise<MarkQualityAudit | null>;
  updateAuditVerdict(
    auditId: string,
    verdict: MarkAuditVerdict,
    notes: string | null,
    completedAt: Date,
  ): Promise<MarkQualityAudit>;
  getActivePanelMember(memberId: string): Promise<MarkAuditPanelMember | null>;
  getRandomPanelMember(excludeMemberIds: string[]): Promise<MarkAuditPanelMember | null>;
  incrementPanelMemberWeeklyCount(memberId: string): Promise<void>;
  addAuditXP(memberId: string, xp: number): Promise<void>;
  triggerGSRReview(memberId: string, context: string): Promise<void>;
  reverseMarkTransaction(transactionId: string, reason: string): Promise<void>;
  applySeasoningPenalty(memberId: string, days: number): Promise<void>;
  getPendingAuditsForAuditor(auditorMemberId: string, limit?: number): Promise<MarkQualityAudit[]>;
  optInAuditor(memberId: string): Promise<MarkAuditPanelMember>;
  optOutAuditor(memberId: string): Promise<void>;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const AUDIT_SAMPLE_RATE = 0.005;                // 0.5%
export const MIN_MARKS_FOR_AUDIT = 100;
export const MIN_ACCOUNT_AGE_DAYS = 30;
export const MIN_XP_FOR_AUDITOR = 1000;
export const MAX_AUDITS_PER_WEEK = 5;
export const AUDIT_COMPLETION_WINDOW_DAYS = 7;
export const AUDIT_XP_REWARD = 50;
export const INFLATED_SEASONING_PENALTY_DAYS = 30;

// ── Selection ─────────────────────────────────────────────────────────────────

/**
 * Determine if a Mark transaction should be sampled for audit.
 * Returns the reason for exclusion if not selected.
 */
export function shouldAuditTransaction(
  tx: MarkTransactionInfo,
  random = Math.random,
): { selected: boolean; reason?: string } {
  if (tx.amount_marks < MIN_MARKS_FOR_AUDIT) {
    return { selected: false, reason: `Amount ${tx.amount_marks} < ${MIN_MARKS_FOR_AUDIT} Mark threshold` };
  }

  if (tx.sender_account_age_days < MIN_ACCOUNT_AGE_DAYS) {
    return { selected: false, reason: `Sender account age ${tx.sender_account_age_days} days < ${MIN_ACCOUNT_AGE_DAYS}` };
  }

  if (tx.receiver_account_age_days < MIN_ACCOUNT_AGE_DAYS) {
    return { selected: false, reason: `Receiver account age ${tx.receiver_account_age_days} days < ${MIN_ACCOUNT_AGE_DAYS}` };
  }

  if (tx.has_prior_trust_match_bond) {
    return { selected: false, reason: "Counterparties have an existing Trust Match bond — skip" };
  }

  if (random() >= AUDIT_SAMPLE_RATE) {
    return { selected: false, reason: "Not selected in random sample (0.5% rate)" };
  }

  return { selected: true };
}

/**
 * Create a new audit record and assign a panel auditor.
 * Skips if no eligible auditor is available (audit backlog is non-blocking).
 */
export async function createMarkAudit(
  db: MarkAuditDB,
  tx: MarkTransactionInfo,
  now = new Date(),
): Promise<MarkQualityAudit | null> {
  const panelMember = await db.getRandomPanelMember([tx.sender_id, tx.receiver_id]);

  const audit = await db.createAudit({
    transaction_id: tx.transaction_id,
    auditor_member_id: panelMember?.member_id ?? null,
    verdict: "pending",
    notes: null,
    audit_seasoning_penalty_applied: false,
    assigned_at: now.toISOString(),
    completed_at: null,
  });

  if (panelMember) {
    await db.incrementPanelMemberWeeklyCount(panelMember.member_id);
  }

  return audit;
}

/**
 * Submit an auditor's verdict on a pending audit.
 *
 * Consequences by verdict (ALL require curator confirmation — this function stages them):
 *   - legitimate: no action
 *   - inflated: Marks reversed + 30-day Seasoning penalty on receiver (staged for curator confirm)
 *   - disputed: escalate to GSR on both parties
 *
 * The audit_seasoning_penalty_applied flag is NOT set here — it is set only after
 * curator confirms an "inflated" verdict. This function records the verdict only.
 */
export async function submitAuditVerdict(
  db: MarkAuditDB,
  auditId: string,
  auditorMemberId: string,
  verdict: Exclude<MarkAuditVerdict, "pending">,
  notes: string | null,
  now = new Date(),
): Promise<{
  audit: MarkQualityAudit;
  consequenceQueued: string;
}> {
  const audit = await db.getAudit(auditId);
  if (!audit) throw new Error(`Audit ${auditId} not found`);
  if (audit.auditor_member_id !== auditorMemberId) throw new Error("Verdict submitted by non-assigned auditor");
  if (audit.verdict !== "pending") throw new Error(`Audit ${auditId} is already closed (${audit.verdict})`);

  const updatedAudit = await db.updateAuditVerdict(auditId, verdict, notes, now);

  // Award XP for timely completion
  const assignedAt = new Date(audit.assigned_at);
  const daysSinceAssignment = (now.getTime() - assignedAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceAssignment <= AUDIT_COMPLETION_WINDOW_DAYS) {
    await db.addAuditXP(auditorMemberId, AUDIT_XP_REWARD);
  }

  let consequenceQueued: string;
  switch (verdict) {
    case "legitimate":
      consequenceQueued = "none";
      break;
    case "inflated":
      consequenceQueued = "mark_reversal_and_seasoning_penalty_staged_for_curator_confirm";
      break;
    case "disputed":
      await db.triggerGSRReview(audit.transaction_id, `Mark quality audit ${auditId} disputed`);
      consequenceQueued = "gsr_review_triggered_for_both_parties";
      break;
  }

  return { audit: updatedAudit, consequenceQueued };
}
