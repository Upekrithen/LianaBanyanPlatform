/**
 * AREOPAGUS GOVERNANCE — Dispute Escalation, Anti-Capture, Amendments
 * =====================================================================
 * Innovation #1533: Areopagus Governance System (R-020 Integration)
 * Innovation #1534: Harper Charter (Appendix H)
 *
 * Integrates Rook R-020 governance specification:
 *   - 4-Level Dispute Escalation Ladder
 *   - Anti-Capture Mechanisms (equal_time_tracking enforcement)
 *   - Amendment Process (multi-threshold, anti-entrenchment)
 *   - Perspective Voting (anti-brigading, weighted, Controversy Index)
 *   - Harper Guild Integration (Analyze, Assess, Advise — NOT censor)
 *   - Substack/Medium Syndication Workflow
 *
 * Harper Charter (Appendix H):
 *   - Keirsey Temperament Sorter (4 temperaments diversity requirement)
 *   - Multi-Source Vouching (per responsibility tier)
 *   - Collective Removal (Harper Review Panel)
 *   - No-Confidence Petition mechanism
 *   - Activity Ledger (full transparency)
 *
 * "Say what you Do. Do what you Say."
 * Harpers monitor SYSTEMS, not DOCTRINES.
 */

import type {
  DoctrineScope,
  AreopagusStampType,
  VerificationBadge,
} from './areopagusDoctrine';

// ============================================================================
// DISPUTE ESCALATION LADDER
// ============================================================================

export type DisputeLevel =
  | 'flagged'           // Content flagged by user
  | 'community_review'  // Level 1: Community Review
  | 'steward_mediation' // Level 2: Steward Mediation
  | 'arbitration'       // Level 3: Arbiter Panel Ruling
  | 'resolved'          // Dispute closed
  | 'appealed';         // Appeal filed on closed dispute

export type FlagType =
  | 'misrepresentation'  // Doctrine, tradition, or person misrepresented
  | 'mode_error'         // Wrong content mode (A/B/C)
  | 'harm'               // Harassment, hate, incitement
  | 'procedural'         // Duplicate, spam, trolling
  | 'bias'               // Systematic bias or unfair treatment
  | 'factual_error';     // Verifiably incorrect claim

export type DisputeResolution =
  | 'no_issue'           // Cleared — no action needed
  | 'edit_applied'       // Content edited to fix issue
  | 'mode_reclassified'  // Content mode changed
  | 'contested_marker'   // "Contested" marker applied
  | 'content_removed'    // Removed (extreme cases only)
  | 'behavioral_warning' // Warning issued to user
  | 'badge_downgrade'    // Badge tier reduced
  | 'topic_ban'          // Banned from specific topic
  | 'account_suspended'; // Account suspended

export interface AreopagusDispute {
  id: string;
  // Content
  contentId: string;
  contentTitle: string;
  contentMode: 'mode_a' | 'mode_b' | 'mode_c';
  doctrineScope: DoctrineScope;
  rootQuestionId?: string;
  // Flag
  flagType: FlagType;
  flagReason: string;
  flaggedBy: string;
  flaggedByBadge: VerificationBadge | null;
  flaggedAt: string;
  // Escalation
  currentLevel: DisputeLevel;
  levelHistory: DisputeLevelRecord[];
  // Assignment
  assignedReviewers: string[];          // Community Review voters
  assignedSteward?: string;            // Steward for Level 2
  arbitrationPanel?: ArbitrationPanel;  // Arbiter panel for Level 3
  // Resolution
  resolution?: DisputeResolution;
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  // Appeal
  appealFiled: boolean;
  appealReason?: string;
  appealOutcome?: string;
  // Metadata
  autoSeverity: boolean;   // Was auto-hidden for severity?
  harperInvolved: boolean; // Did Harper intervention occur?
  createdAt: string;
  updatedAt: string;
}

export interface DisputeLevelRecord {
  level: DisputeLevel;
  enteredAt: string;
  exitedAt?: string;
  reason: string;
}

export interface ArbitrationPanel {
  panelId: string;
  arbiters: PanelMember[];
  createdAt: string;
  decisionAt?: string;
  decision?: string;
  reasoning?: string;
  appealsAllowed: boolean;
}

export interface PanelMember {
  userId: string;
  badge: VerificationBadge;
  doctrineScope: DoctrineScope;
  vote?: 'approve' | 'reject' | 'abstain';
  notes?: string;
}

// ============================================================================
// ANTI-CAPTURE MECHANISMS
// ============================================================================

export interface EqualTimeSnapshot {
  doctrineScope: DoctrineScope;
  totalWords: number;
  totalViews: number;
  publishedItems: number;
  featuredItems: number;
  disputesFiled: number;
  disputesReceived: number;
  badgesHeld: number;
  perspectivesPublished: number;
  perspectiveVotesReceived: number;
  // Calculated metrics
  contentSharePercent: number;
  featuredSharePercent: number;
  disputeAsymmetry: number;      // Positive = filing more, negative = receiving more
  captureRiskScore: number;      // 0-100 composite
  snapshotAt: string;
}

export interface CaptureAlert {
  id: string;
  scope: DoctrineScope;
  alertType: 'content_flooding' | 'featured_dominance' | 'dispute_weaponization'
    | 'badge_clustering' | 'vote_brigading' | 'rapid_growth_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metrics: Record<string, number>;
  detectedAt: string;
  // Response
  automatedAction?: string;
  harperReviewId?: string;
  resolvedAt?: string;
  resolution?: string;
}

/**
 * Soft quota thresholds for anti-capture.
 */
export const CAPTURE_THRESHOLDS = {
  // If one DoctrineScope exceeds these percentages, triggers alert
  contentShareMax: 0.30,         // 30% of total content
  featuredShareMax: 0.25,        // 25% of featured items
  disputeAsymmetryMax: 3.0,      // Filing 3x more disputes than receiving
  badgeConcentrationMax: 0.40,   // 40% of any badge tier
  voteWeightMax: 0.40,           // 40% of total weighted votes on any perspective
  // Rate limits when thresholds exceeded
  publicationCooldownHours: 24,  // Extra review time for over-represented scope
  featuredBlockDays: 7,          // Cannot be featured for 7 days
};

/**
 * Calculate capture risk score for a DoctrineScope.
 */
export function calculateCaptureRisk(snapshot: EqualTimeSnapshot): number {
  let risk = 0;

  if (snapshot.contentSharePercent > CAPTURE_THRESHOLDS.contentShareMax * 100) {
    risk += 25;
  }
  if (snapshot.featuredSharePercent > CAPTURE_THRESHOLDS.featuredShareMax * 100) {
    risk += 25;
  }
  if (snapshot.disputeAsymmetry > CAPTURE_THRESHOLDS.disputeAsymmetryMax) {
    risk += 25;
  }
  if (snapshot.badgesHeld > 0 && snapshot.contentSharePercent > 20) {
    // Badge concentration roughly correlates with scope dominance
    risk += 15;
  }

  return Math.min(100, risk);
}

// ============================================================================
// PERSPECTIVE VOTING (Anti-Brigading)
// ============================================================================

export interface PerspectiveVote {
  id: string;
  perspectiveId: string;
  voterId: string;
  voterBadge: VerificationBadge | null;
  voterDoctrineScope: DoctrineScope;
  voteType: 'upvote' | 'downvote';
  // Anti-gaming metadata
  sourceType: 'organic' | 'direct_link' | 'shared_link' | 'search';
  weight: number;                // Calculated weight based on badge + source
  timestamp: string;
  // Flags
  steelmanFlag: boolean;         // Voter says this fairly represents opponents
  sourceVerifiedFlag: boolean;   // Voter has verified cited sources
}

export interface PerspectiveScore {
  perspectiveId: string;
  rawUpvotes: number;
  rawDownvotes: number;
  weightedScore: number;         // Weighted by badge tier and diversity
  controversyIndex: number;      // 0-1, high = strong disagreement
  voterDiversityScore: number;   // 0-1, how many DoctrineScopes represented
  steelmanCount: number;
  sourceVerifiedCount: number;
  // Dissent detection
  isContested: boolean;          // High-rep voters disagree significantly
  topDissentPerspectiveId?: string; // Paired dissenting perspective
}

/**
 * Vote weight multipliers by badge tier.
 */
export const VOTE_WEIGHTS: Record<string, number> = {
  none: 0.5,
  contributor: 1.0,
  insider: 1.5,        // 1.5x within their DoctrineScope, 1x outside
  reviewer: 2.0,
  steward: 2.5,
  arbiter: 3.0,
};

/**
 * Source multipliers (anti-brigading).
 * Direct links from Discord/Reddit raids get heavily discounted.
 */
export const SOURCE_MULTIPLIERS: Record<string, number> = {
  organic: 1.0,         // Found through normal platform navigation
  search: 0.9,          // Found via search
  shared_link: 0.5,     // Shared via platform share button
  direct_link: 0.1,     // Direct URL (possible brigade)
};

/**
 * Calculate vote weight based on voter's badge, scope, and source.
 */
export function calculateVoteWeight(
  voterBadge: VerificationBadge | null,
  voterScope: DoctrineScope,
  perspectiveScope: DoctrineScope,
  source: PerspectiveVote['sourceType']
): number {
  const badgeWeight = VOTE_WEIGHTS[voterBadge || 'none'];
  const sourceMultiplier = SOURCE_MULTIPLIERS[source];

  // Insiders get extra weight within their own scope
  let scopeBonus = 1.0;
  if (voterBadge === 'insider' && voterScope === perspectiveScope) {
    scopeBonus = 1.5 / 1.0; // Insider gets 1.5x in their scope instead of 1.0
  }

  return badgeWeight * sourceMultiplier * scopeBonus;
}

/**
 * Calculate controversy index.
 * High controversy = strong opinions on BOTH sides.
 */
export function calculateControversyIndex(
  upvotes: number,
  downvotes: number
): number {
  const total = upvotes + downvotes;
  if (total === 0) return 0;

  const ratio = Math.min(upvotes, downvotes) / Math.max(upvotes, downvotes);
  // Perfect split (50/50) = 1.0. Total agreement = 0.0.
  return ratio;
}

// ============================================================================
// AMENDMENT PROCESS
// ============================================================================

export type AmendmentStatus =
  | 'proposed'          // Amendment submitted
  | 'eligibility_check' // Automated + Harper pre-screen
  | 'public_comment'    // 14-30 day comment period
  | 'voting'            // Multi-threshold voting
  | 'adopted'           // Amendment passed
  | 'rejected'          // Amendment failed
  | 'withdrawn';        // Proposer withdrew

export interface ConstitutionAmendment {
  id: string;
  title: string;
  description: string;
  proposedChanges: string;       // Diff of current vs proposed
  // Proposer
  proposedBy: string[];          // User IDs (requires multi-scope group)
  proposerBadges: VerificationBadge[];
  proposerScopes: DoctrineScope[];
  marksCost: number;             // Marks staked to propose (anti-spam)
  // Status
  status: AmendmentStatus;
  statusHistory: { status: AmendmentStatus; at: string; reason?: string }[];
  // Eligibility
  harperPreScreenPassed: boolean;
  harperNotes?: string;
  // Comments
  publicCommentStartDate?: string;
  publicCommentEndDate?: string;
  comments: AmendmentComment[];
  // Voting
  arbiterVotes: { userId: string; scope: DoctrineScope; vote: 'approve' | 'reject' | 'abstain' }[];
  communityVotes: { userId: string; badge: VerificationBadge; scope: DoctrineScope; vote: 'approve' | 'reject' }[];
  // Results
  arbiterApprovalRate?: number;  // Needs 66%+ (supermajority)
  scopeSpread?: number;          // Needs 50%+ of DoctrineScopes represented
  communityApprovalRate?: number; // Needs 60%+ of Reviewer+ votes
  // Timestamps
  proposedAt: string;
  decidedAt?: string;
}

export interface AmendmentComment {
  id: string;
  userId: string;
  badge: VerificationBadge | null;
  scope: DoctrineScope;
  text: string;
  sentiment: 'support' | 'oppose' | 'neutral';
  postedAt: string;
}

/**
 * Hard constraints that CANNOT be amended.
 * Changes to these require platform-wide guild constitution ratification.
 */
export const IMMUTABLE_PROVISIONS = [
  'Three-Column System (Believed/Taught/Practiced)',
  'Switzerland Protocol (platform takes no doctrinal position)',
  'No-Council Architecture (badge-based, not seat-based)',
  'Harper mandate: Analyze, Assess, Advise (no content authority)',
  'Equal Time Tracking requirement',
  'Arbiter panel diversity requirement',
  'Public case archive (transparency)',
  'Appeals process availability',
] as const;

/**
 * Check if a proposed amendment touches immutable provisions.
 */
export function touchesImmutableProvision(proposedChanges: string): {
  touches: boolean;
  provisions: string[];
} {
  const touched = IMMUTABLE_PROVISIONS.filter(provision =>
    proposedChanges.toLowerCase().includes(provision.toLowerCase().slice(0, 20))
  );
  return { touches: touched.length > 0, provisions: [...touched] };
}

// ============================================================================
// HARPER CHARTER (Appendix H)
// ============================================================================

export type KeirseyTemperament = 'artisan' | 'guardian' | 'idealist' | 'rational';

export type HarperTier =
  | 'observer'   // Entry level: watch and learn
  | 'analyst'    // Can open integrity reviews, recommend changes
  | 'lead';      // Can request emergency actions, lead investigations

export interface HarperProfile {
  id: string;
  userId: string;
  name: string;
  // Keirsey
  temperament: KeirseyTemperament;
  keirseyType: string;           // e.g., "INTJ", "ENFP", etc.
  keirseyAssessedAt: string;
  // Tier
  tier: HarperTier;
  // Vouching
  vouches: HarperVouch[];
  vouchesAgainst: HarperVouchAgainst[];
  // Activity
  integrityReviewsOpened: number;
  recommendationsAccepted: number;
  recommendationsRejected: number;
  emergencyActionsUsed: number;
  // Metrics
  biasIndicators: Record<DoctrineScope, number>; // Intervention count per scope
  qualityScore: number;          // 0-100 based on acceptance rate
  // Scope
  primaryDoctrineScope: DoctrineScope;
  // Status
  active: boolean;
  suspendedAt?: string;
  suspensionReason?: string;
  // Terms
  appointedAt: string;
  termExpiresAt: string;
  cooldownUntil?: string;        // Cannot serve again until this date
}

export interface HarperVouch {
  id: string;
  voucherId: string;
  voucherBadge: VerificationBadge;
  voucherScope: DoctrineScope;
  vouchedAt: string;
  revoked: boolean;
  revokedAt?: string;
  revokeReason?: string;
}

export interface HarperVouchAgainst {
  id: string;
  userId: string;
  userBadge: VerificationBadge;
  userScope: DoctrineScope;
  reason: string;
  filedAt: string;
}

export interface HarperReviewPanel {
  id: string;
  harperUnderReview: string;     // Harper userId
  // Panel
  members: PanelMember[];        // 3-5 members: 2+ Arbiters, 1+ Steward
  // Inputs
  activityLedger: string;        // Summary of Harper's activity
  performanceConcerns: string[]; // Filed concerns
  vouchHistory: string;          // Vouch/vouch-against summary
  harperResponse?: string;       // Harper's written response
  // Decision
  decision?: 'no_action' | 'corrective_plan' | 'downgrade' | 'removal';
  reasoning?: string;
  decidedAt?: string;
  // Supermajority requirement
  votesForAction: number;
  votesAgainstAction: number;
  scopesInMajority: DoctrineScope[];
}

/**
 * Harper tier vouch requirements.
 */
export const HARPER_VOUCH_REQUIREMENTS: Record<HarperTier, {
  totalVouches: number;
  communityVouches: number;     // Non-Harper vouches
  minDoctrineScopes: number;
}> = {
  observer: { totalVouches: 3, communityVouches: 2, minDoctrineScopes: 2 },
  analyst: { totalVouches: 5, communityVouches: 3, minDoctrineScopes: 3 },
  lead: { totalVouches: 7, communityVouches: 4, minDoctrineScopes: 4 },
};

/**
 * Maximum percentage of Harpers from any single temperament.
 */
export const HARPER_TEMPERAMENT_CAP = 0.5; // 50%

/**
 * Maximum percentage of Harpers from any single DoctrineScope.
 */
export const HARPER_SCOPE_CAP = 0.30; // 30%

/**
 * Check if a user is eligible to become a Harper.
 */
export function isEligibleForHarper(
  userBadge: VerificationBadge | null,
  sanctionHistory: number,        // Recent sanctions count
  crossScopeInteractions: number, // Positive interactions across scopes
): boolean {
  // Must be Reviewer+ badge
  const eligibleBadges: VerificationBadge[] = ['reviewer', 'steward', 'arbiter'];
  if (!userBadge || !eligibleBadges.includes(userBadge)) return false;

  // No recent sanctions
  if (sanctionHistory > 0) return false;

  // Must have cross-scope trust
  if (crossScopeInteractions < 5) return false;

  return true;
}

/**
 * Check if a Harper has sufficient vouches for their tier.
 */
export function hasRequiredVouches(harper: HarperProfile): boolean {
  const requirements = HARPER_VOUCH_REQUIREMENTS[harper.tier];

  // Count active (non-revoked) vouches
  const activeVouches = harper.vouches.filter(v => !v.revoked);
  const communityVouches = activeVouches.filter(v => {
    // Community vouches = non-Harper vouches (we'd check against Harper roster)
    return true; // Simplified — in production, check against Harper list
  });

  // Count unique DoctrineScopes
  const uniqueScopes = new Set(activeVouches.map(v => v.voucherScope));

  return (
    activeVouches.length >= requirements.totalVouches &&
    communityVouches.length >= requirements.communityVouches &&
    uniqueScopes.size >= requirements.minDoctrineScopes
  );
}

/**
 * Check if vouch-against threshold triggers suspension.
 */
export function shouldSuspendHarper(harper: HarperProfile): boolean {
  const activeVouchesAgainst = harper.vouchesAgainst;
  const uniqueScopes = new Set(activeVouchesAgainst.map(v => v.userScope));

  // 3-5 vouch-against from distinct DoctrineScopes triggers review
  return activeVouchesAgainst.length >= 3 && uniqueScopes.size >= 3;
}

// ============================================================================
// SYNDICATION WORKFLOW
// ============================================================================

export type SyndicationPlatform = 'substack' | 'medium' | 'cephas';

export type SyndicationStatus =
  | 'nominated'       // Nominated for syndication
  | 'panel_review'    // Syndication panel reviewing
  | 'author_consent'  // Awaiting author opt-in
  | 'approved'        // Ready to syndicate
  | 'published'       // Published on external platform
  | 'withdrawn';      // Withdrawn from syndication

export interface SyndicationRequest {
  id: string;
  perspectiveId: string;
  platform: SyndicationPlatform;
  status: SyndicationStatus;
  // Nomination
  nominatedBy: string;
  nominatedAt: string;
  // Review
  reviewPanel: {
    arbiterId: string;
    stwardId: string;
    harperId: string;
  } | null;
  reviewOutcome?: 'approved' | 'rejected';
  reviewNotes?: string;
  // Author consent
  authorId: string;
  authorConsented: boolean;
  authorAttributionPreference: 'real_name' | 'pseudonym' | 'collective';
  // External
  externalUrl?: string;
  publishedAt?: string;
  // Engagement
  externalViews?: number;
  // CTA: blurred after 10% with join prompt
  ctaEnabled: boolean;           // "Join Areopagus to read full and participate"
}

/**
 * Syndication eligibility criteria.
 */
export function isSyndicationEligible(
  qualityScore: number,
  voterDiversity: number,
  doctrineScope: DoctrineScope,
  equalTimeSnapshot: EqualTimeSnapshot
): { eligible: boolean; reason?: string } {
  // Quality threshold
  if (qualityScore < 70) {
    return { eligible: false, reason: 'Quality score below 70 threshold' };
  }

  // Voter diversity threshold
  if (voterDiversity < 0.4) {
    return { eligible: false, reason: 'Insufficient voter diversity across DoctrineScopes' };
  }

  // Not from over-represented scope
  if (equalTimeSnapshot.featuredSharePercent > CAPTURE_THRESHOLDS.featuredShareMax * 100) {
    return { eligible: false, reason: `DoctrineScope ${doctrineScope} exceeds featured share threshold` };
  }

  return { eligible: true };
}

// ============================================================================
// HARPER RED LINES
// ============================================================================

/**
 * Actions that trigger immediate Harper intervention.
 * Harpers enforce these lines — they don't rewrite theology.
 */
export const HARPER_RED_LINES = [
  {
    id: 'ad-hominem',
    description: 'Personal attacks on contributors instead of addressing ideas',
    severity: 'high' as const,
    autoAction: 'Content flagged, author warned',
  },
  {
    id: 'switzerland-violation',
    description: 'Content presents platform position as endorsing a specific doctrine',
    severity: 'critical' as const,
    autoAction: 'Content hidden pending review',
  },
  {
    id: 'doxxing',
    description: 'Revealing private information about contributors',
    severity: 'critical' as const,
    autoAction: 'Content removed immediately, user suspended pending review',
  },
  {
    id: 'edit-warring',
    description: 'Repeated back-and-forth edits without discussion',
    severity: 'medium' as const,
    autoAction: 'Content locked, mediation required',
  },
  {
    id: 'brigading',
    description: 'Coordinated voting from external sources to manipulate perspective ranking',
    severity: 'high' as const,
    autoAction: 'Vote weights reduced, Harper investigation opened',
  },
  {
    id: 'scope-flooding',
    description: 'Systematic bulk publishing to drown out other DoctrineScopes',
    severity: 'medium' as const,
    autoAction: 'Publication rate limited, capture alert generated',
  },
  {
    id: 'credential-fraud',
    description: 'False claims of scholarly or tradition-insider credentials',
    severity: 'critical' as const,
    autoAction: 'Badge revoked, contributions quarantined pending review',
  },
  {
    id: 'incitement',
    description: 'Content encouraging real-world harm against individuals or groups',
    severity: 'critical' as const,
    autoAction: 'Content removed immediately, account suspended, Arbiter review mandatory',
  },
] as const;

export default {
  CAPTURE_THRESHOLDS,
  VOTE_WEIGHTS,
  SOURCE_MULTIPLIERS,
  IMMUTABLE_PROVISIONS,
  HARPER_VOUCH_REQUIREMENTS,
  HARPER_TEMPERAMENT_CAP,
  HARPER_SCOPE_CAP,
  HARPER_RED_LINES,
  calculateCaptureRisk,
  calculateVoteWeight,
  calculateControversyIndex,
  touchesImmutableProvision,
  isEligibleForHarper,
  hasRequiredVouches,
  shouldSuspendHarper,
  isSyndicationEligible,
};
