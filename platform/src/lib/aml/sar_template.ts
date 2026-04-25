/**
 * AML SAR Pre-Population Template — K504 (Phase D)
 * ==================================================
 * Takes a dispatch_sar-verdicted AmlFlag and pre-populates a FinCEN SAR
 * form structure (structured JSON → internal email delivery).
 *
 * GUARDRAILS (encoded in this module):
 *   1. SarDispatchGate checks regulatory classification before allowing generation.
 *      If classification is 'unclassified' or 'not_msb', throws SarGateError.
 *   2. Output is INTERNAL ONLY — delivered to LB compliance email, NEVER auto-filed.
 *   3. All SAR drafts are appended to aml_sar_audit_log (immutable).
 *
 * Counsel reviews + files manually if appropriate.
 */

// ── Regulatory classification ─────────────────────────────────────────────────

export type AmlRegulatoryClassification =
  | 'unclassified'      // default; counsel has not yet determined — SAR pathway DISABLED
  | 'not_msb'           // counsel determined LB is not an MSB — SAR pathway DISABLED
  | 'msb_state_only'    // state money-transmitter — state-specific SAR pathway
  | 'msb_federal';      // full FinCEN MSB — federal SAR pathway ENABLED

export class SarGateError extends Error {
  constructor(classification: AmlRegulatoryClassification) {
    super(
      `SAR dispatch is gated. Current classification: '${classification}'. ` +
      `SAR pathway only enables when classification is 'msb_state_only' or 'msb_federal'. ` +
      `This determination requires counsel review before activation.`
    );
    this.name = 'SarGateError';
  }
}

export function assertSarGateOpen(classification: AmlRegulatoryClassification): void {
  if (classification === 'unclassified' || classification === 'not_msb') {
    throw new SarGateError(classification);
  }
}

// ── FinCEN SAR pre-population structure ──────────────────────────────────────

export interface SarSubject {
  member_id: string;
  account_signup_date: string;
  total_transactions: number;
  prior_flag_count: number;
  counterparty_id?: string;
}

export interface SarDraft {
  internal_ref: string;           // aml_flag.id
  generated_at: string;
  regulatory_classification: AmlRegulatoryClassification;

  // FinCEN SAR Part I — Reporting financial institution (LB Corporation)
  fincen_part1: {
    institution_name: string;
    ein: string;
    address: string;
    contact_name: string;         // LB compliance contact (left blank for counsel to fill)
    contact_phone: string;
  };

  // FinCEN SAR Part II — Suspicious activity information
  fincen_part2: {
    suspected_violation: string;
    date_range_start: string;
    date_range_end: string;
    total_amount: number;
    summary: string;
  };

  // FinCEN SAR Part III — Subject information (the flagged member)
  fincen_part3: {
    subject: SarSubject;
    relationship_to_institution: string;
  };

  // FinCEN SAR Part IV — Suspicious activity narrative
  fincen_part4: {
    narrative: string;              // auto-drafted from evidence_json; counsel finalizes
    curator_review_notes: string;
    evidence_summary: string;
  };

  // Internal metadata
  delivery_note: string;            // always explains this is a draft, not filed
  curator_id: string;
  flag_type: string;
}

// ── Template generator ────────────────────────────────────────────────────────

export interface SarTemplateDB {
  getRegulatoryClassification(): Promise<AmlRegulatoryClassification>;
  getAmlFlag(flagId: string): Promise<{
    id: string;
    member_id: string;
    flag_type: string;
    triggered_at: string;
    evidence_json: Record<string, unknown>;
    notes: string | null;
    reviewer_id: string;
  }>;
  getMemberInfo(memberId: string): Promise<{
    signup_date: string;
    total_transactions: number;
    prior_flag_count: number;
  }>;
  appendSarAuditLog(entry: {
    flag_id: string;
    curator_id: string;
    counsel_review_status: string;
    filing_status: string;
  }): Promise<void>;
}

const LB_INSTITUTION = {
  name: 'LIANA BANYAN CORPORATION',
  ein: '41-2797446',
  address: 'Wyoming C-Corporation (address to be provided by counsel)',
  contact_name: '[LB Compliance Officer — to be designated by counsel]',
  contact_phone: '[To be designated by counsel]',
};

/**
 * Build a pre-populated SAR draft from a dispatch_sar-verdicted flag.
 * Throws SarGateError if regulatory classification does not permit SAR pathway.
 *
 * Output is delivered internally only — NOT auto-filed.
 */
export async function buildSarDraft(
  flagId: string,
  db: SarTemplateDB,
): Promise<SarDraft> {
  // Gate check — always first
  const classification = await db.getRegulatoryClassification();
  assertSarGateOpen(classification);

  const [flag, memberInfo] = await Promise.all([
    db.getAmlFlag(flagId),
    db.getAmlFlag(flagId).then((f) => db.getMemberInfo(f.member_id)),
  ]);
  const flagFull = await db.getAmlFlag(flagId);
  const member = await db.getMemberInfo(flagFull.member_id);

  const evidence = flagFull.evidence_json;
  const now = new Date().toISOString();

  // Compute date range from evidence
  const dateStart = (evidence.first_transaction_at as string) ?? flagFull.triggered_at;
  const dateEnd = (evidence.last_transaction_at as string) ?? now;

  // Auto-draft narrative (counsel finalizes before filing)
  const narrative = buildNarrative(flagFull.flag_type, evidence, member);

  const draft: SarDraft = {
    internal_ref: flagFull.id,
    generated_at: now,
    regulatory_classification: classification,

    fincen_part1: {
      institution_name: LB_INSTITUTION.name,
      ein: LB_INSTITUTION.ein,
      address: LB_INSTITUTION.address,
      contact_name: LB_INSTITUTION.contact_name,
      contact_phone: LB_INSTITUTION.contact_phone,
    },

    fincen_part2: {
      suspected_violation: suspectedViolationLabel(flagFull.flag_type),
      date_range_start: dateStart,
      date_range_end: dateEnd,
      total_amount: (evidence.total_spend_30d ?? evidence.spend_7d ?? evidence.cumulative_volume ?? 0) as number,
      summary: `Platform Credit transaction monitoring flag: ${flagFull.flag_type}`,
    },

    fincen_part3: {
      subject: {
        member_id: flagFull.member_id,
        account_signup_date: member.signup_date,
        total_transactions: member.total_transactions,
        prior_flag_count: member.prior_flag_count,
        counterparty_id: evidence.counterparty_id as string | undefined,
      },
      relationship_to_institution: 'Platform member',
    },

    fincen_part4: {
      narrative,
      curator_review_notes: flagFull.notes ?? '[No curator notes recorded]',
      evidence_summary: JSON.stringify(evidence, null, 2),
    },

    delivery_note:
      'INTERNAL DRAFT ONLY. This document has NOT been filed with FinCEN or any regulatory authority. ' +
      'Counsel must review and determine whether filing is appropriate under applicable law. ' +
      'Filing, if appropriate, must be performed manually by counsel or designated compliance officer.',

    curator_id: flagFull.reviewer_id,
    flag_type: flagFull.flag_type,
  };

  // Append to immutable SAR audit log
  await db.appendSarAuditLog({
    flag_id: flagId,
    curator_id: flagFull.reviewer_id,
    counsel_review_status: 'pending',
    filing_status: 'draft',
  });

  return draft;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function suspectedViolationLabel(flagType: string): string {
  const labels: Record<string, string> = {
    aml_concentration_high: 'Potential money laundering — layering stage (high-concentration counterparty routing)',
    aml_velocity_spike: 'Potential money laundering — velocity anomaly (unusual Credit-spend acceleration)',
    aml_new_account_high_velocity: 'Potential money laundering — new-account high-velocity Credit spend',
    aml_coordinated_ring: 'Potential money laundering — circular Credit routing (coordinated ring pattern)',
    aml_trust_match_crossref: 'Potential money laundering — circular Credit routing with Trust Match cross-reference (elevated confidence)',
  };
  return labels[flagType] ?? 'Suspicious activity — platform-internal monitoring flag';
}

function buildNarrative(
  flagType: string,
  evidence: Record<string, unknown>,
  member: { signup_date: string; total_transactions: number; prior_flag_count: number },
): string {
  const base = `Subject is a Liana Banyan platform member (account opened ${member.signup_date}; ${member.total_transactions} total transactions; ${member.prior_flag_count} prior AML flags).`;

  switch (flagType) {
    case 'aml_concentration_high':
      return `${base} The platform's automated monitoring identified that ${evidence.concentration_pct}% of the subject's Credits over the trailing 30-day window were transacted with a single counterparty (ID: ${evidence.counterparty_id}), totaling ${evidence.total_spend_30d} Credits. This concentration pattern is consistent with layering behavior. [Counsel to expand narrative with any additional context gathered.] This is an auto-drafted narrative; counsel must review and finalize before any filing.`;

    case 'aml_velocity_spike':
      return `${base} The platform's automated monitoring identified a ${evidence.ratio}× spike in the subject's 7-day Credit-spend (${evidence.spend_7d} Credits in 7 days vs. a trailing 90-day median weekly spend of ${evidence.median_weekly_spend_90d} Credits). Velocity anomalies of this magnitude may indicate structuring or placement activity. [Counsel to expand narrative.] This is an auto-drafted narrative.`;

    case 'aml_new_account_high_velocity':
      return `${base} The subject's account is ${evidence.account_age_days} days old and transacted ${evidence.spend_7d} Credits within a 7-day window — above the platform's new-account high-velocity threshold. New-account high-velocity patterns are associated with account-opening as a placement vehicle. [Counsel to expand narrative.] This is an auto-drafted narrative.`;

    case 'aml_coordinated_ring':
    case 'aml_trust_match_crossref': {
      const members = (evidence.cycle_members as string[]).join(', ');
      const crossrefNote = flagType === 'aml_trust_match_crossref'
        ? ' Additionally, one or more members in this ring also appear in the platform\'s Trust Match social-credit cycle audit (structural + financial coordination — elevated confidence signal).'
        : '';
      return `${base} The platform's automated monitoring identified a ${evidence.cycle_length}-member circular Credit routing pattern involving member IDs: ${members}. Cumulative volume: ${evidence.cumulative_volume} Credits.${crossrefNote} Circular routing patterns are consistent with layering. [Counsel to expand narrative.] This is an auto-drafted narrative.`;
    }

    default:
      return `${base} [Flag type: ${flagType}. Evidence attached. Counsel to draft complete narrative based on evidence JSON.] This is an auto-drafted narrative shell.`;
  }
}
