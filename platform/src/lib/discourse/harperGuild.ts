/**
 * HARPER GUILD — Ethics Enforcement Architecture
 * ================================================
 * Spec: MUFFLED_RULE_AND_PHASE_MIMICTRUNKS.md, Section 5 (Ethics & Moderation)
 * Source: Rook Research R-017 (Harper Guild Architecture)
 *
 * The Harper Guild is Liana Banyan's ethics enforcement body — modeled after
 * Wikipedia's Admin structure, NOT Reddit's volunteer moderator system.
 *
 * KEY PRINCIPLES:
 *   - "Analyze, Assess, Advise" — Harpers observe, report, and intervene
 *   - Every moderation action is logged on the Immutable Ledger (transparent)
 *   - Harpers are subject to community recall (prevents oligarchy)
 *   - The Underground Railroad enables secure reporting of severe violations
 *
 * MEMBERSHIP LIFECYCLE:
 *   1. RECRUITMENT PHASE (Initial Seed):
 *      - First Harpers recruited by Founder/Core Team based on demonstrated
 *        alignment with the Shirley Temple Policy
 *   2. ELECTION PHASE (Steady State):
 *      - New Harpers nominated by existing Harpers
 *      - Confirmed by a Referendum Vote (Marks-based tier voting
 *        from petitionVoting.ts)
 *   3. RECALL MECHANIC:
 *      - Any Harper can be recalled via community petition
 *      - Petition must reach co-signer threshold + pass recall vote
 *      - Prevents the Guild from becoming an untouchable oligarchy
 *
 * HARPER TIERS:
 *   - Harper:        Standard ethics enforcer. Can triage, review, warn.
 *   - Senior Harper: Can issue temporary suspensions, review appeals.
 *   - Harper Elder:  Can issue permanent bans, access Underground Railroad
 *                    reports. Small subset of highly vetted Harpers.
 *
 * TOOLING — "The Harper Keep" (dedicated dashboard):
 *   - Triage Queue:    Automated flagging drops items here. Harpers claim tickets.
 *   - Context Viewer:  Full Immutable Ledger history for reviewed member.
 *   - Action Log:      Every moderation action written to public Ledger section.
 *
 * UNDERCOVER HARPERS (from HexIsle world):
 *   - Embedded in Inns, Taverns, and shops as NPCs
 *   - Subtle guild badge on hover (not immediately obvious)
 *   - Represent the Guild's presence throughout the platform world
 *
 * ECONOMIC PENALTY (R-017):
 *   - If Harper confirms content violates the Shirley Temple Policy,
 *     the sponsor who funded that content on the Pedestal loses their
 *     contribution (it is burned)
 *   - Massive financial disincentive for funding harmful content
 *
 * WHY WIKIPEDIA MODEL (not Reddit):
 *   - Reddit: Opaque, rogue mods can hijack communities, no universal standards
 *   - Discord: "Wild West" approach, total autonomy but no cross-platform accountability
 *   - Wikipedia: Transparent action log, elected admins, community recall, high quality
 *   - LB: Takes Wikipedia's transparency + accountability, adds economic enforcement
 *     and encrypted secure reporting (Underground Railroad)
 *
 * SEC-SAFE: Ethics enforcement is a community governance function,
 * not a financial mechanism. No economic benefits are generated.
 */

// ── Constants ──────────────────────────────────────────────────────────────

/** Minimum Marks to nominate a new Harper (nomination stake) */
export const HARPER_NOMINATION_STAKE = 25;

/** Co-signers required for Harper nomination to go to vote */
export const HARPER_NOMINATION_COSIGNER_THRESHOLD = 100;

/** Co-signers required for Harper recall petition */
export const HARPER_RECALL_COSIGNER_THRESHOLD = 250;

/** Minimum tenure (days) before a Harper can be promoted to Senior */
export const SENIOR_HARPER_MIN_TENURE_DAYS = 90;

/** Minimum tenure (days) before a Senior Harper can be nominated as Elder */
export const ELDER_HARPER_MIN_TENURE_DAYS = 365;

/** Maximum active tickets a single Harper can claim at once */
export const MAX_ACTIVE_TICKETS_PER_HARPER = 5;

/** Triage ticket auto-expire time (hours) — unclaimed tickets reassign */
export const TICKET_AUTO_EXPIRE_HOURS = 24;

/** Warning expiry (days) — warnings older than this don't count toward thresholds */
export const WARNING_EXPIRY_DAYS = 180;

/** Maximum temporary suspension duration (days) that a standard Harper can issue */
export const MAX_HARPER_SUSPENSION_DAYS = 7;

/** Maximum temporary suspension duration (days) that a Senior Harper can issue */
export const MAX_SENIOR_SUSPENSION_DAYS = 30;

/** Burner channel auto-shred time (days) after investigation concludes */
export const BURNER_CHANNEL_SHRED_DAYS = 30;

// ── Types ──────────────────────────────────────────────────────────────────

/** Harper rank hierarchy */
export type HarperRank = "harper" | "senior_harper" | "harper_elder";

/** How a Harper was recruited */
export type HarperRecruitmentMethod =
  | "founder_recruited"       // initial seed by Founder/Core Team
  | "nominated_elected"       // nominated by existing Harper, confirmed by vote
  | "promoted";               // promoted from lower rank based on tenure + performance

/** Harper membership status */
export type HarperMembershipStatus =
  | "active"                  // currently serving
  | "on_leave"                // temporary leave (doesn't count toward tenure)
  | "recalled"                // removed by community recall
  | "resigned"                // voluntarily stepped down
  | "suspended";              // temporarily suspended by Elder review

/** Triage ticket severity */
export type TicketSeverity =
  | "low"                     // minor content issue, can wait
  | "medium"                  // standard flag, needs review within 24h
  | "high"                    // harassment, misinformation, needs same-day review
  | "critical";               // active harm (doxxing, threats) — immediate action required

/** Triage ticket source */
export type TicketSource =
  | "pedestal_flag"           // from Pedestal content voting (pedestalGovernance.ts)
  | "member_report"           // direct member report
  | "automated_detection"     // keyword/pattern heuristic
  | "underground_railroad"    // encrypted severe report
  | "harper_referral";        // one Harper flagging for another's review

/** Moderation action type */
export type ModerationActionType =
  | "warning_issued"          // formal warning to member
  | "content_hidden"          // content temporarily hidden pending review
  | "content_removed"         // content permanently removed
  | "content_restored"        // content restored after appeal
  | "temporary_suspension"    // member temporarily suspended (N days)
  | "permanent_ban"           // member permanently banned (Elder only)
  | "funding_burned"          // sponsor's contribution burned (Shirley Temple violation)
  | "review_status_applied"   // creator put in Review Status
  | "review_status_lifted"    // creator removed from Review Status
  | "appeal_upheld"           // appeal approved, action reversed
  | "appeal_denied"           // appeal denied, action stands
  | "ticket_dismissed";       // ticket reviewed but no action needed

// ── Interfaces ─────────────────────────────────────────────────────────────

/**
 * Harper Guild Member — an ethics enforcer.
 */
export interface HarperGuildMember {
  /** Member ID (same as their LB member ID) */
  memberId: string;
  /** Display name */
  displayName: string;
  /** Current rank */
  rank: HarperRank;
  /** How they were recruited */
  recruitmentMethod: HarperRecruitmentMethod;
  /** Membership status */
  status: HarperMembershipStatus;
  /** When they joined the Harper Guild */
  joinedAt: string;
  /** When they were last promoted (if applicable) */
  lastPromotedAt?: string;
  /** Total tickets resolved */
  ticketsResolved: number;
  /** Total moderation actions taken */
  actionsCount: number;
  /** Successful appeals against this Harper's actions (quality metric) */
  appealsAgainst: number;
  /** Specialties */
  specialties: Array<"content_review" | "member_conduct" | "financial_audit" | "technical_abuse">;
  /** Whether this Harper is available for ticket assignment */
  isAvailable: boolean;
  /** Active ticket count */
  activeTicketCount: number;
  /** Ledger section ID for this Harper's action history */
  ledgerSectionId: string;
}

/**
 * Triage Ticket — queued item for Harper review.
 */
export interface HarperTriageTicket {
  /** Ticket ID */
  id: string;
  /** Source of the ticket */
  source: TicketSource;
  /** Severity level */
  severity: TicketSeverity;
  /** Subject type (what's being reported) */
  subjectType: "content" | "member" | "pedestal" | "guild" | "tribe" | "financial";
  /** Subject ID (content ID, member ID, etc.) */
  subjectId: string;
  /** Description of the issue */
  description: string;
  /** Reporter member ID (null for automated or anonymous Underground Railroad) */
  reporterMemberId?: string;
  /** Whether the reporter requested anonymity */
  reporterAnonymous: boolean;
  /** Assigned Harper member ID (null if unclaimed) */
  assignedHarperId?: string;
  /** When the ticket was created */
  createdAt: string;
  /** When the ticket was claimed */
  claimedAt?: string;
  /** When the ticket was resolved */
  resolvedAt?: string;
  /** Resolution action type */
  resolutionAction?: ModerationActionType;
  /** Resolution notes */
  resolutionNotes?: string;
  /** Whether the ticket is still open */
  isOpen: boolean;
  /** Auto-expire timestamp (unclaimed tickets) */
  autoExpireAt: string;
  /** Related ticket IDs (if part of a pattern) */
  relatedTicketIds: string[];
  /** Ledger entry ID */
  ledgerEntryId: string;
}

/**
 * Moderation Action — a Harper's action, logged to the Immutable Ledger.
 * Every action is transparent and auditable.
 */
export interface HarperModerationAction {
  /** Action ID */
  id: string;
  /** Harper who took the action */
  harperId: string;
  /** Action type */
  actionType: ModerationActionType;
  /** Target member ID */
  targetMemberId: string;
  /** Target content/entity ID (if applicable) */
  targetEntityId?: string;
  /** Ticket ID that prompted this action */
  ticketId: string;
  /** Reason for the action */
  reason: string;
  /** Duration (for temporary actions like suspensions) */
  durationDays?: number;
  /** Credits burned (for funding_burned actions) */
  creditsBurned?: number;
  /** Whether this action can be appealed */
  isAppealable: boolean;
  /** When the action was taken */
  actionAt: string;
  /** When the action expires (if temporary) */
  expiresAt?: string;
  /** Whether the action has been reversed (via appeal) */
  isReversed: boolean;
  /** Ledger entry ID — written to PUBLIC section */
  ledgerEntryId: string;
}

/**
 * Underground Railroad Report — encrypted severe ethics violation report.
 * Bypasses local Tribe/Guild leaders. Only accessible by Harper Elders.
 *
 * PRIVACY ARCHITECTURE:
 *   - Report encrypted with Harper Elder public keys (E2E)
 *   - Reporter's identity verified (must be valid LB member) but stripped
 *     from the payload unless reporter explicitly opts in to contact
 *   - Burner channel available for follow-up (cryptographically shredded after)
 */
export interface UndergroundRailroadReport {
  /** Report ID */
  id: string;
  /** Encrypted payload (only Elder public keys can decrypt) */
  encryptedPayload: string;
  /** Reporter's verified member status (not their identity) */
  reporterVerified: boolean;
  /** Whether the reporter opted in to contact */
  reporterOptedInToContact: boolean;
  /** Severity (always "critical" for Underground Railroad) */
  severity: "critical";
  /** Report category */
  category: "systemic_abuse" | "doxxing" | "corruption" | "fraud" | "threats" | "other_severe";
  /** When the report was submitted */
  submittedAt: string;
  /** Assigned Elder ID (if claimed) */
  assignedElderId?: string;
  /** Burner channel ID (if follow-up needed) */
  burnerChannelId?: string;
  /** Investigation status */
  investigationStatus: "pending" | "under_investigation" | "resolved" | "referred_external";
  /** Resolved at timestamp */
  resolvedAt?: string;
  /** Ledger entry ID (metadata only — encrypted content NOT on ledger) */
  ledgerEntryId: string;
}

/**
 * Burner Channel — temporary encrypted communication between
 * a Harper Elder and an anonymous Underground Railroad reporter.
 * Cryptographically shredded after investigation concludes.
 */
export interface BurnerChannel {
  /** Channel ID */
  id: string;
  /** Underground Railroad report ID */
  reportId: string;
  /** Elder Harper member ID */
  elderId: string;
  /** Whether the channel is still active */
  isActive: boolean;
  /** When the channel was created */
  createdAt: string;
  /** When the channel will be shredded */
  scheduledShredAt: string;
  /** Whether the channel has been shredded */
  isShredded: boolean;
  /** Shredded at timestamp */
  shreddedAt?: string;
  /** Message count (metadata only — messages are encrypted) */
  messageCount: number;
}

/**
 * Harper Recall Petition — community petition to remove a Harper.
 * Uses the same petition mechanics as petitionVoting.ts.
 */
export interface HarperRecallPetition {
  /** Petition ID */
  id: string;
  /** Harper member ID being recalled */
  targetHarperId: string;
  /** Petitioner member ID */
  petitionerMemberId: string;
  /** Reason for recall */
  reason: string;
  /** Co-signer count */
  coSignerCount: number;
  /** Whether co-signer threshold has been met */
  thresholdMet: boolean;
  /** Whether the recall vote has started */
  voteStarted: boolean;
  /** Vote result (if completed) */
  voteResult?: "recalled" | "retained";
  /** Created at */
  createdAt: string;
  /** Ledger entry ID */
  ledgerEntryId: string;
}

// ── Functions ──────────────────────────────────────────────────────────────

/**
 * Check if a Harper can take a specific moderation action
 * based on their rank.
 */
export function canTakeAction(
  rank: HarperRank,
  actionType: ModerationActionType,
): { allowed: boolean; reason?: string } {
  // Permanent bans = Elder only
  if (actionType === "permanent_ban" && rank !== "harper_elder") {
    return { allowed: false, reason: "Only Harper Elders can issue permanent bans." };
  }

  // Funding burned = Senior or Elder
  if (actionType === "funding_burned" && rank === "harper") {
    return { allowed: false, reason: "Only Senior Harpers or Elders can burn funding contributions." };
  }

  // All other actions available to all ranks
  return { allowed: true };
}

/**
 * Get the maximum suspension duration a Harper can issue.
 */
export function getMaxSuspensionDays(rank: HarperRank): number {
  switch (rank) {
    case "harper":
      return MAX_HARPER_SUSPENSION_DAYS;
    case "senior_harper":
      return MAX_SENIOR_SUSPENSION_DAYS;
    case "harper_elder":
      return 365; // Elders can issue up to 1-year suspensions (or permanent ban)
  }
}

/**
 * Check if a Harper is eligible for promotion.
 */
export function canPromote(
  member: HarperGuildMember,
  targetRank: HarperRank,
): { eligible: boolean; reason?: string } {
  if (member.status !== "active") {
    return { eligible: false, reason: "Harper must be in active status to be promoted." };
  }

  const tenureDays = Math.floor(
    (Date.now() - new Date(member.joinedAt).getTime()) / (1000 * 60 * 60 * 24),
  );

  if (targetRank === "senior_harper") {
    if (member.rank !== "harper") {
      return { eligible: false, reason: "Must be a Harper to be promoted to Senior Harper." };
    }
    if (tenureDays < SENIOR_HARPER_MIN_TENURE_DAYS) {
      return {
        eligible: false,
        reason: `Requires ${SENIOR_HARPER_MIN_TENURE_DAYS} days tenure. Current: ${tenureDays} days.`,
      };
    }
    return { eligible: true };
  }

  if (targetRank === "harper_elder") {
    if (member.rank !== "senior_harper") {
      return { eligible: false, reason: "Must be a Senior Harper to be nominated as Elder." };
    }
    if (tenureDays < ELDER_HARPER_MIN_TENURE_DAYS) {
      return {
        eligible: false,
        reason: `Requires ${ELDER_HARPER_MIN_TENURE_DAYS} days tenure. Current: ${tenureDays} days.`,
      };
    }
    return { eligible: true };
  }

  return { eligible: false, reason: "Invalid target rank." };
}

/**
 * Check if a Harper can claim a triage ticket.
 */
export function canClaimTicket(
  harper: HarperGuildMember,
  ticket: HarperTriageTicket,
): { allowed: boolean; reason?: string } {
  if (harper.status !== "active") {
    return { allowed: false, reason: "Only active Harpers can claim tickets." };
  }

  if (!harper.isAvailable) {
    return { allowed: false, reason: "You are currently marked as unavailable." };
  }

  if (harper.activeTicketCount >= MAX_ACTIVE_TICKETS_PER_HARPER) {
    return {
      allowed: false,
      reason: `Maximum active tickets (${MAX_ACTIVE_TICKETS_PER_HARPER}) reached. Resolve current tickets first.`,
    };
  }

  if (!ticket.isOpen) {
    return { allowed: false, reason: "This ticket has already been resolved." };
  }

  if (ticket.assignedHarperId && ticket.assignedHarperId !== harper.memberId) {
    return { allowed: false, reason: "This ticket is already claimed by another Harper." };
  }

  // Underground Railroad tickets = Elder only
  if (ticket.source === "underground_railroad" && harper.rank !== "harper_elder") {
    return { allowed: false, reason: "Underground Railroad reports can only be reviewed by Harper Elders." };
  }

  return { allowed: true };
}

/**
 * Create a new triage ticket from a Pedestal content flag.
 */
export function createTriageTicketFromFlag(
  contentId: string,
  pedestalId: string,
  flagCount: number,
  reporterMemberId?: string,
): HarperTriageTicket {
  const now = new Date();
  const autoExpire = new Date(now);
  autoExpire.setHours(autoExpire.getHours() + TICKET_AUTO_EXPIRE_HOURS);

  const severity: TicketSeverity = flagCount >= 10 ? "high" : flagCount >= 5 ? "medium" : "low";

  return {
    id: `ticket-${Date.now()}`,
    source: "pedestal_flag",
    severity,
    subjectType: "content",
    subjectId: contentId,
    description: `Content flagged on Pedestal ${pedestalId}. Total flags: ${flagCount}.`,
    reporterMemberId,
    reporterAnonymous: false,
    isOpen: true,
    createdAt: now.toISOString(),
    autoExpireAt: autoExpire.toISOString(),
    relatedTicketIds: [],
    ledgerEntryId: `ledger-ticket-${Date.now()}`,
  };
}

/**
 * Create an Underground Railroad report.
 */
export function createUndergroundRailroadReport(
  encryptedPayload: string,
  category: UndergroundRailroadReport["category"],
  reporterOptedInToContact: boolean,
): UndergroundRailroadReport {
  return {
    id: `urr-${Date.now()}`,
    encryptedPayload,
    reporterVerified: true,
    reporterOptedInToContact,
    severity: "critical",
    category,
    submittedAt: new Date().toISOString(),
    investigationStatus: "pending",
    ledgerEntryId: `ledger-urr-${Date.now()}`,
  };
}

/**
 * Schedule a burner channel for cryptographic shredding.
 */
export function scheduleBurnerShred(channel: BurnerChannel): BurnerChannel {
  const shredDate = new Date();
  shredDate.setDate(shredDate.getDate() + BURNER_CHANNEL_SHRED_DAYS);

  return {
    ...channel,
    isActive: false,
    scheduledShredAt: shredDate.toISOString(),
  };
}

/**
 * Get Harper Guild summary statistics.
 */
export function getHarperGuildSummary(members: HarperGuildMember[]): {
  totalMembers: number;
  activeMembers: number;
  byRank: Record<HarperRank, number>;
  totalTicketsResolved: number;
  averageAppealsPerHarper: number;
} {
  const active = members.filter(m => m.status === "active");
  const byRank: Record<HarperRank, number> = {
    harper: 0,
    senior_harper: 0,
    harper_elder: 0,
  };

  let totalResolved = 0;
  let totalAppeals = 0;

  for (const m of members) {
    if (m.status === "active") {
      byRank[m.rank] = (byRank[m.rank] ?? 0) + 1;
    }
    totalResolved += m.ticketsResolved;
    totalAppeals += m.appealsAgainst;
  }

  return {
    totalMembers: members.length,
    activeMembers: active.length,
    byRank,
    totalTicketsResolved: totalResolved,
    averageAppealsPerHarper:
      members.length > 0 ? Math.round((totalAppeals / members.length) * 100) / 100 : 0,
  };
}
