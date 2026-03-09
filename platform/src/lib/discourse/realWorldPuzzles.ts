/**
 * REAL WORLD PUZZLES -- Member-Created Golden Key Challenges
 * ============================================================
 * Spec: MUFFLED_RULE_AND_PHASE_MIMICTRUNKS.md, Sections 2, 7
 *
 * Members can create their own Real World Puzzles using the Golden Key
 * system -- the same programming system used for Cephas Articles.
 *
 * Key architectural constraints:
 *
 *   - ALLOWED IN: Library, real-world publications, emails, external sites
 *   - NOT ALLOWED IN: LB islands (game world) UNLESS:
 *       a) LB charges for it (paid feature)
 *       b) Shirley Temple Policy is applied (content standards)
 *   - ONE Golden Key per plane -- never more than one per location
 *   - Each plane is its own contained space for that key's search
 *   - Planes can become the basis for new Phase MimicTrunks
 *   - Reading/completing puzzles earns Coverage Minutes
 */

// ── Constants ──────────────────────────────────────────────────────────────

/** Maximum Golden Keys per member-created puzzle chain */
export const MAX_KEYS_PER_CHAIN = 20;

/** Minimum reading/engagement time (seconds) before key can be found */
export const MIN_ENGAGEMENT_SECONDS = 30;

/** Coverage Minutes earned per puzzle completion */
export const COVERAGE_MINUTES_PER_COMPLETION = 3; // one increment

/** Fee for placing a puzzle in LB islands (Credits) */
export const ISLAND_PLACEMENT_FEE = 50;

// ── Types ──────────────────────────────────────────────────────────────────

export type PuzzleLocation =
  | "library"           // LB's Library system
  | "publication"       // member publications within LB
  | "email"             // emails within LB
  | "external_site"     // external integrated sites
  | "cephas_article"    // Cephas knowledge base articles
  | "lb_island";        // LB game world islands (restricted -- paid + Shirley Temple)

export type PuzzleStatus =
  | "draft"             // being created
  | "review"            // under Shirley Temple Policy review (if lb_island)
  | "active"            // live and discoverable
  | "paused"            // temporarily disabled by creator
  | "expired"           // time-limited puzzle that has ended
  | "archived";         // permanently retired

export type PuzzleDifficulty =
  | "beginner"          // simple reading completion
  | "intermediate"      // requires attention to detail
  | "advanced"          // multi-step engagement required
  | "expert";           // deep reading + cross-reference puzzles

export type KeyDiscoveryMethod =
  | "reading_completion"     // finish reading the content
  | "scroll_engagement"      // scroll through with sustained attention
  | "interaction_required"   // must interact with content (click, answer, etc.)
  | "cross_reference"        // must read multiple pieces to find the key
  | "time_based";            // spend minimum time engaging with content

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface RealWorldPuzzle {
  id: string;
  name: string;
  description: string;
  creatorMemberId: string;
  location: PuzzleLocation;
  status: PuzzleStatus;
  difficulty: PuzzleDifficulty;
  /** The Golden Key chain for this puzzle */
  goldenKeyChain: GoldenKeyPlane[];
  /** Total keys in this puzzle */
  keyCount: number;
  /** Coverage Minutes earned on completion */
  coverageMinutesReward: number;
  /** If in lb_island: paid fee and Shirley Temple review */
  islandPlacement?: IslandPlacementRecord;
  /** Content this puzzle is attached to */
  contentReference: ContentReference;
  /** How many members have attempted this puzzle */
  attemptCount: number;
  /** How many members have completed this puzzle */
  completionCount: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;            // for time-limited puzzles
  ledgerEntryId: string;
}

export interface GoldenKeyPlane {
  id: string;
  puzzleId: string;
  /** Sequence number within the puzzle chain (1-based) */
  sequenceNumber: number;
  /** The plane is its own contained space */
  planeId: string;
  /** How to discover this key */
  discoveryMethod: KeyDiscoveryMethod;
  /** Content the member must engage with to find this key */
  contentId: string;
  /** Minimum engagement metric to unlock */
  engagementThreshold: number;    // seconds, percentage, or interaction count
  /** Whether this plane can be the basis for a Phase MimicTrunk */
  canBecomePhaseBasis: boolean;
  /** If a Phase MimicTrunk was created from this plane */
  derivedTrunkId?: string;
  /** Hint text (optional) */
  hint?: string;
}

export interface ContentReference {
  contentId: string;
  contentType: PuzzleLocation;
  title: string;
  url?: string;                   // for external sites
  /** For publications: the publication ID */
  publicationId?: string;
  /** For emails: the email thread ID */
  emailThreadId?: string;
  /** For Cephas articles: the article ID */
  cephasArticleId?: string;
  /** For LB islands: the island and hex position */
  islandId?: number;
  hexPosition?: { q: number; r: number };
}

export interface IslandPlacementRecord {
  /** Fee paid (Credits) */
  feePaid: number;
  /** Shirley Temple Policy review status */
  shirleyTempleReview: ShirleyTempleReview;
  /** Island where the puzzle is placed */
  islandId: number;
  /** Hex position on the island */
  hexPosition: { q: number; r: number };
  /** When the placement was approved */
  approvedAt?: string;
}

export interface ShirleyTempleReview {
  id: string;
  puzzleId: string;
  status: "pending" | "approved" | "rejected" | "revision_requested";
  reviewedByMemberId?: string;
  reviewedAt?: string;
  notes?: string;
  /** Content standards violations found (if any) */
  violations: string[];
}

export interface PuzzleAttempt {
  id: string;
  puzzleId: string;
  memberId: string;
  startedAt: string;
  completedAt?: string;
  /** Keys found so far */
  keysFound: string[];            // plane IDs
  /** Current progress (percentage) */
  progressPercent: number;
  /** Coverage Minutes earned from this attempt */
  coverageMinutesEarned: number;
  /** Is this attempt still active? */
  isActive: boolean;
}

export interface PlaneEntry {
  id: string;
  planeId: string;
  memberId: string;
  enteredAt: string;
  exitedAt?: string;
  /** Whether the Golden Key was found during this entry */
  keyFound: boolean;
  /** Engagement time in seconds */
  engagementSeconds: number;
  /** Whether the member can re-enter (some planes are one-time) */
  canReenter: boolean;
}

// ── Puzzle Creation Functions ──────────────────────────────────────────────

/**
 * Create a new Real World Puzzle.
 */
export function createPuzzle(
  name: string,
  description: string,
  creatorMemberId: string,
  location: PuzzleLocation,
  difficulty: PuzzleDifficulty,
  contentReference: ContentReference,
): { puzzle: RealWorldPuzzle; requiresReview: boolean; requiresFee: boolean } {
  const now = new Date().toISOString();
  const requiresReview = location === "lb_island";
  const requiresFee = location === "lb_island";

  const puzzle: RealWorldPuzzle = {
    id: `rwp-${Date.now()}`,
    name,
    description,
    creatorMemberId,
    location,
    status: requiresReview ? "review" : "draft",
    difficulty,
    goldenKeyChain: [],
    keyCount: 0,
    coverageMinutesReward: COVERAGE_MINUTES_PER_COMPLETION,
    contentReference,
    attemptCount: 0,
    completionCount: 0,
    createdAt: now,
    updatedAt: now,
    ledgerEntryId: `ledger-rwp-${Date.now()}`,
  };

  if (requiresFee) {
    puzzle.islandPlacement = {
      feePaid: ISLAND_PLACEMENT_FEE,
      shirleyTempleReview: {
        id: `str-${Date.now()}`,
        puzzleId: puzzle.id,
        status: "pending",
        violations: [],
      },
      islandId: contentReference.islandId ?? 0,
      hexPosition: contentReference.hexPosition ?? { q: 0, r: 0 },
    };
  }

  return { puzzle, requiresReview, requiresFee };
}

/**
 * Add a Golden Key plane to a puzzle chain.
 * Enforces: ONE key per plane, max keys per chain.
 */
export function addGoldenKeyPlane(
  puzzle: RealWorldPuzzle,
  discoveryMethod: KeyDiscoveryMethod,
  contentId: string,
  engagementThreshold: number,
  options?: {
    canBecomePhaseBasis?: boolean;
    hint?: string;
  },
): { added: boolean; reason?: string } {
  if (puzzle.goldenKeyChain.length >= MAX_KEYS_PER_CHAIN) {
    return {
      added: false,
      reason: `Maximum of ${MAX_KEYS_PER_CHAIN} Golden Keys per puzzle chain.`,
    };
  }

  const sequenceNumber = puzzle.goldenKeyChain.length + 1;
  const planeId = `plane-${puzzle.id}-${sequenceNumber}-${Date.now()}`;

  const keyPlane: GoldenKeyPlane = {
    id: `gk-${planeId}`,
    puzzleId: puzzle.id,
    sequenceNumber,
    planeId,
    discoveryMethod,
    contentId,
    engagementThreshold,
    canBecomePhaseBasis: options?.canBecomePhaseBasis ?? false,
    hint: options?.hint,
  };

  puzzle.goldenKeyChain.push(keyPlane);
  puzzle.keyCount = puzzle.goldenKeyChain.length;
  puzzle.updatedAt = new Date().toISOString();

  return { added: true };
}

/**
 * Check if a puzzle location is allowed.
 * LB islands require paid fee + Shirley Temple Policy.
 */
export function isLocationAllowed(
  location: PuzzleLocation,
  hasPaidFee: boolean,
  shirleyTempleApproved: boolean,
): { allowed: boolean; reason?: string } {
  if (location !== "lb_island") {
    return { allowed: true };
  }

  if (!hasPaidFee) {
    return {
      allowed: false,
      reason: `Placing puzzles in LB islands requires a fee of ${ISLAND_PLACEMENT_FEE} Credits.`,
    };
  }

  if (!shirleyTempleApproved) {
    return {
      allowed: false,
      reason: "Puzzles in LB islands must pass the Shirley Temple Policy content review.",
    };
  }

  return { allowed: true };
}

/**
 * Record a plane entry for a member.
 */
export function enterPlane(
  planeId: string,
  memberId: string,
): PlaneEntry {
  return {
    id: `pe-${planeId}-${memberId}-${Date.now()}`,
    planeId,
    memberId,
    enteredAt: new Date().toISOString(),
    keyFound: false,
    engagementSeconds: 0,
    canReenter: true,
  };
}

/**
 * Check if a member has met the engagement threshold to find a key.
 */
export function checkKeyDiscovery(
  plane: GoldenKeyPlane,
  entry: PlaneEntry,
): { found: boolean; reason?: string } {
  if (entry.engagementSeconds < MIN_ENGAGEMENT_SECONDS) {
    return {
      found: false,
      reason: `Need ${MIN_ENGAGEMENT_SECONDS - entry.engagementSeconds} more seconds of engagement.`,
    };
  }

  if (entry.engagementSeconds < plane.engagementThreshold) {
    return {
      found: false,
      reason: `Engagement threshold not met. Current: ${entry.engagementSeconds}s, Required: ${plane.engagementThreshold}s.`,
    };
  }

  return { found: true };
}

/**
 * Calculate Coverage Minutes earned from puzzle progress.
 */
export function calculatePuzzleCoverage(
  puzzle: RealWorldPuzzle,
  keysFound: number,
): number {
  if (puzzle.keyCount === 0) return 0;

  const completionRatio = keysFound / puzzle.keyCount;

  // Partial credit: earn proportional Coverage Minutes
  // Full reward only on complete puzzle completion
  if (completionRatio >= 1.0) {
    return puzzle.coverageMinutesReward;
  }

  // Partial: round down to nearest increment of 1
  return Math.floor(completionRatio * puzzle.coverageMinutesReward);
}

/**
 * Get puzzle statistics.
 */
export function getPuzzleStats(puzzle: RealWorldPuzzle): {
  name: string;
  difficulty: PuzzleDifficulty;
  location: PuzzleLocation;
  keyCount: number;
  attemptCount: number;
  completionCount: number;
  completionRate: number;
  isRestricted: boolean;
} {
  return {
    name: puzzle.name,
    difficulty: puzzle.difficulty,
    location: puzzle.location,
    keyCount: puzzle.keyCount,
    attemptCount: puzzle.attemptCount,
    completionCount: puzzle.completionCount,
    completionRate: puzzle.attemptCount > 0
      ? Math.round((puzzle.completionCount / puzzle.attemptCount) * 100)
      : 0,
    isRestricted: puzzle.location === "lb_island",
  };
}
