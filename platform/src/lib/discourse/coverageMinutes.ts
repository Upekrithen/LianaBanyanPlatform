/**
 * COVERAGE MINUTES SYSTEM
 * =======================
 * Spec: MUFFLED_RULE_AND_PHASE_MIMICTRUNKS.md, Sections 1 & 2
 *
 * The Muffled Rule: You must listen if you want people to listen to you.
 * Your mic only works for as long as you have listened to others speak.
 * This applies to both voice AND text.
 *
 * Coverage Minutes are earned by:
 *   - Listening to others speak at Round Tables (1:1 ratio)
 *   - Reading content (Cephas Articles, member publications, external newsletters/newspapers)
 *   - Fast readers earn more — metric is content completion, not clock time
 *
 * Coverage Minutes are spent by:
 *   - Speaking at Round Tables (1:1 ratio)
 *   - Publishing text (proportional to reading time of your piece)
 *
 * Coverage Minutes can be donated between members (transparent, recorded, viewable for a fee).
 *
 * Accumulation: 3-minute increments. Max single-session broadcast: 3 hours (180 minutes).
 * The max is imposed regardless of donations — prevents DingDongDash behavior.
 */

// ─── Constants ──────────────────────────────────────────────────────────────

/** Coverage Minutes accumulate in this increment */
export const ACCUMULATION_INCREMENT = 3; // minutes

/** Maximum single-session broadcast time */
export const MAX_SESSION_BROADCAST = 180; // 3 hours in minutes

/** Fee to view a donation record (in Credits) */
export const DONATION_RECORD_VIEW_FEE = 1;

/** Minimum membership stamp level required to donate Coverage Minutes */
export const DONATION_STAMP_LEVEL = 1; // basic membership

// ─── Anti-Abuse Constants (R-005 Integration) ────────────────────────────
//
// Per Rook research R-005: Precedents from Stack Overflow reputation,
// Slashdot karma, Discord leveling bots. Mitigations for lurker hoarding,
// farming collusion, and bot-driven reading.

/** Coverage Minutes decay — unused minutes expire after this many days */
export const DECAY_WINDOW_DAYS = 90;

/** Decay check interval — how often to run decay calculations (ms) */
export const DECAY_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // daily

/**
 * Donation friction tax — donating N minutes costs sender N * DONATION_TAX_MULTIPLIER.
 * e.g., donating 10 minutes costs the sender 12 minutes (prevents infinite circular passing).
 */
export const DONATION_TAX_MULTIPLIER = 1.2;

/**
 * Diminishing returns — reading the same author repeatedly yields less.
 * After this many reads from the same author, earnings drop to the floor rate.
 */
export const SAME_AUTHOR_DIMINISHING_THRESHOLD = 5;

/**
 * Floor rate for diminished same-author reading.
 * After threshold, earn only this fraction of normal rate.
 */
export const SAME_AUTHOR_FLOOR_RATE = 0.1; // 10% of normal earnings

/**
 * Bot detection — maximum plausible words per minute.
 * Anything above this is flagged as suspicious.
 * (Even elite speed readers top out around 1,000 WPM with comprehension.)
 */
export const MAX_PLAUSIBLE_WPM = 1000;

/**
 * Bot detection — minimum reading time (seconds) to earn any Coverage Minutes.
 * Prevents instant "reads" that scroll through content in sub-second times.
 */
export const MIN_READING_TIME_SECONDS = 10;

/** Reading speed tiers — faster readers earn proportionally more per clock minute */
export const READING_SPEED_TIERS = {
  slow: 0.5,       // 0.5 Coverage Minutes per minute of reading
  normal: 1.0,     // 1:1 ratio
  fast: 1.5,       // 1.5x — fast readers cover more content
  speed: 2.0,      // 2x — speed readers
} as const;

export type ReadingSpeedTier = keyof typeof READING_SPEED_TIERS;

// ─── Reading Speed Benchmarks (P-005R Integration) ──────────────────────
//
// Per Pawn discovery P-005R: Empirical adult reading speed research.
//
// Average adult reading speeds (words per minute):
//   - Non-fiction: 238 WPM (scientific studies average)
//   - Fiction:     260 WPM (lighter cognitive load)
//   - Fast:        275-350 WPM (top 25% of adults)
//   - Very fast:   350-450 WPM (practiced speed readers with comprehension)
//   - Elite:       450-700 WPM (trained, reduced comprehension above 500)
//
// These benchmarks calibrate:
//   1. calculatePublishingCost() — uses 238 WPM (non-fiction baseline)
//   2. Reading speed tier detection — maps measured WPM to tier
//   3. Bot detection threshold — MAX_PLAUSIBLE_WPM stays at 1000
//      (even elite speed readers rarely exceed 700 with comprehension)

/** Benchmark: average non-fiction reading speed (WPM) */
export const BENCHMARK_WPM_NONFICTION = 238;

/** Benchmark: average fiction reading speed (WPM) */
export const BENCHMARK_WPM_FICTION = 260;

/** WPM thresholds for tier classification */
export const READING_SPEED_WPM_THRESHOLDS = {
  /** Below this = slow reader */
  slow_max: 180,
  /** Below this = normal reader (238 WPM average) */
  normal_max: 275,
  /** Below this = fast reader */
  fast_max: 450,
  /** Above fast_max = speed reader (up to MAX_PLAUSIBLE_WPM) */
} as const;

// ─── Content Types That Earn Coverage ───────────────────────────────────────

export type CoverageContentType =
  | "cephas_article"          // LB's own knowledge base articles
  | "member_publication"      // Content published by other members
  | "external_newsletter"    // External newsletter subscriptions
  | "external_newspaper"     // External newspaper integrations
  | "library_document"       // Documents in the Library system
  | "real_world_site";       // Integrated external sites

// ─── Core Interfaces ────────────────────────────────────────────────────────

export interface CoverageMinuteAccount {
  id: string;
  memberId: string;
  earnedMinutes: number;          // total earned through listening/reading
  spentMinutes: number;           // total spent on speaking/publishing
  donatedOutMinutes: number;      // total donated to others
  receivedDonationMinutes: number;// total received from others
  currentBalance: number;         // available to spend (earned + received - spent - donated)
  maxSessionBroadcast: number;    // cap per session (180 minutes)
  accumulationLevel: number;      // tier based on sustained participation
  createdAt: string;              // ISO timestamp
  updatedAt: string;              // ISO timestamp
}

export interface CoverageMinuteTransaction {
  id: string;
  accountId: string;
  memberId: string;
  type: "earn" | "spend" | "donate_out" | "donate_in";
  minutes: number;                // always positive; direction indicated by type
  source: CoverageTransactionSource;
  timestamp: string;              // ISO timestamp
  ledgerEntryId: string;          // recorded in Immutable Ledger
  sessionId?: string;             // round table session ID (if voice)
  contentId?: string;             // reading content ID (if reading)
}

export type CoverageTransactionSource =
  | "round_table_listen"     // earned by listening at a round table
  | "round_table_speak"     // spent by speaking at a round table
  | "reading_cephas"        // earned by reading Cephas articles
  | "reading_member"        // earned by reading member publications
  | "reading_external"      // earned by reading external content
  | "publishing_text"       // spent by publishing written content
  | "donation_sent"         // donated to another member
  | "donation_received";    // received from another member

export interface CoverageMinuteDonation {
  id: string;
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  minutes: number;
  timestamp: string;              // ISO timestamp
  ledgerEntryId: string;          // recorded in Immutable Ledger
  stampLevel: number;             // donor's stamp level at time of donation
}

export interface DonationRecordView {
  id: string;
  viewerMemberId: string;
  donationId: string;
  timestamp: string;              // ISO timestamp
  feePaid: number;                // Credits paid to view (DONATION_RECORD_VIEW_FEE)
  ledgerEntryId: string;          // viewing is ALSO recorded in the Ledger
}

export interface ReadingProgress {
  id: string;
  memberId: string;
  contentId: string;
  contentType: CoverageContentType;
  contentTitle: string;
  percentComplete: number;        // 0-100
  estimatedReadingMinutes: number;// total reading time of this content
  coverageMinutesEarned: number;  // how many minutes earned so far
  readingSpeedTier: ReadingSpeedTier;
  goldenKeysFound: number;        // keys discovered during this reading
  planeId?: string;               // which plane (for Golden Key puzzles)
  startedAt: string;              // ISO timestamp
  lastReadAt: string;             // ISO timestamp
  completedAt?: string;           // ISO timestamp (null if incomplete)
}

// ─── Anti-Abuse Types (R-005 Integration) ───────────────────────────────────

export type AbuseFlag =
  | "bot_reading"              // reading speed exceeds MAX_PLAUSIBLE_WPM
  | "instant_completion"       // content "read" in under MIN_READING_TIME_SECONDS
  | "farming_collusion"        // circular donation patterns detected
  | "same_author_farming"      // excessive same-author reading
  | "bulk_donation_anomaly";   // large donation volume in short time window

export interface ReadingBehaviorMetrics {
  /** Member ID */
  memberId: string;
  /** Average words per minute across recent sessions */
  averageWPM: number;
  /** Number of sessions flagged as suspicious */
  flaggedSessionCount: number;
  /** Active abuse flags */
  activeFlags: AbuseFlag[];
  /** Per-author read counts (for diminishing returns) */
  authorReadCounts: Record<string, number>;
  /** Last decay check timestamp */
  lastDecayCheck: string;
  /** Minutes decayed (lifetime total) */
  totalDecayed: number;
}

export interface DecayEvent {
  /** Account ID */
  accountId: string;
  /** Minutes that decayed (expired) */
  minutesDecayed: number;
  /** Oldest earning timestamp of decayed minutes */
  oldestEarningDate: string;
  /** When the decay was applied */
  appliedAt: string;
  /** Balance after decay */
  balanceAfter: number;
}

export interface DonationWithTax {
  /** Minutes the recipient receives */
  recipientReceives: number;
  /** Minutes deducted from sender (includes tax) */
  senderPays: number;
  /** The tax amount (senderPays - recipientReceives) */
  taxAmount: number;
  /** Tax multiplier applied */
  taxMultiplier: number;
}

// ─── Engagement Verification (P-004 Integration) ────────────────────────────
//
// Per Pawn discovery P-004: Composite "read proof" scoring.
//
// Verification tiers:
//   Passive (low friction): engaged time + scroll depth + focus detection
//   Active (gated): micro-quiz, interaction requirement (expand, highlight, react)
//   Tiered: passive for low-stakes, active for high-value/credit-heavy content
//
// A Phase MimicTrunk treats "read proof" as:
//   focus-aware engaged time + scroll-depth coverage +
//   at least one voluntary interaction + (optionally) a micro-quiz

/** Minimum scroll depth (%) to consider content "read" */
export const MIN_SCROLL_DEPTH_PERCENT = 60;

/** Minimum engaged time ratio (engaged_time / estimated_reading_time) */
export const MIN_ENGAGED_TIME_RATIO = 0.4;

/** Number of voluntary interactions required for passive verification */
export const MIN_VOLUNTARY_INTERACTIONS = 1;

/** Micro-quiz question count for active verification tier */
export const MICRO_QUIZ_QUESTION_COUNT = 2;

/** Content value threshold (Coverage Minutes) above which active verification kicks in */
export const ACTIVE_VERIFICATION_THRESHOLD = 9; // >= 9 minutes = require quiz

export type VerificationTier = "passive" | "active";

export type InteractionType =
  | "expand_footnote"
  | "highlight_text"
  | "reaction_click"
  | "mark_as_read"
  | "bookmark"
  | "share"
  | "golden_key_found";

/**
 * Composite read-proof for Coverage Minutes verification.
 * Combines passive signals (engaged time, scroll depth, focus)
 * with active signals (interactions, quiz) into a single score.
 */
export interface ReadProof {
  /** Member ID */
  memberId: string;
  /** Content ID */
  contentId: string;
  /** Verification tier applied */
  tier: VerificationTier;
  /** Engaged time (seconds) — only counts when page is in focus + user interacting */
  engagedTimeSeconds: number;
  /** Estimated reading time (seconds) — based on word count + speed tier */
  estimatedReadingTimeSeconds: number;
  /** Engaged time ratio (engagedTime / estimatedReadingTime) */
  engagedTimeRatio: number;
  /** Maximum scroll depth reached (0-100) */
  scrollDepthPercent: number;
  /** Whether the page was in focus for majority of reading */
  pageFocusMajority: boolean;
  /** Voluntary interactions performed */
  interactions: InteractionType[];
  /** Micro-quiz attempted (if active tier) */
  quizAttempted: boolean;
  /** Micro-quiz passed (if attempted) */
  quizPassed: boolean;
  /** Composite score (0-100) — higher = more confident this was genuine reading */
  compositeScore: number;
  /** Whether this read proof passes verification */
  isVerified: boolean;
  /** Reason for failure (if not verified) */
  failureReason?: string;
  /** Timestamp */
  timestamp: string;
}

/**
 * Calculate composite read-proof score and determine verification.
 * Score components:
 *   - Scroll depth: 0-30 points (full at >= MIN_SCROLL_DEPTH_PERCENT)
 *   - Engaged time ratio: 0-30 points (full at >= MIN_ENGAGED_TIME_RATIO)
 *   - Page focus: 0-10 points (binary)
 *   - Interactions: 0-15 points (scales with count, capped at 3)
 *   - Quiz: 0-15 points (only for active tier)
 *
 * Passing threshold: >= 50 points
 */
export function calculateReadProof(
  memberId: string,
  contentId: string,
  engagedTimeSeconds: number,
  estimatedReadingTimeSeconds: number,
  scrollDepthPercent: number,
  pageFocusMajority: boolean,
  interactions: InteractionType[],
  coverageMinutesValue: number,
  quizAttempted: boolean = false,
  quizPassed: boolean = false,
): ReadProof {
  const tier: VerificationTier =
    coverageMinutesValue >= ACTIVE_VERIFICATION_THRESHOLD ? "active" : "passive";

  const engagedTimeRatio =
    estimatedReadingTimeSeconds > 0
      ? engagedTimeSeconds / estimatedReadingTimeSeconds
      : 0;

  // Score components
  const scrollScore = Math.min(30, (scrollDepthPercent / MIN_SCROLL_DEPTH_PERCENT) * 30);
  const timeScore = Math.min(30, (engagedTimeRatio / MIN_ENGAGED_TIME_RATIO) * 30);
  const focusScore = pageFocusMajority ? 10 : 0;
  const interactionScore = Math.min(15, interactions.length * 5);

  let quizScore = 0;
  if (tier === "active") {
    if (quizAttempted && quizPassed) {
      quizScore = 15;
    } else if (quizAttempted && !quizPassed) {
      quizScore = 5; // attempted but failed — some credit
    }
  } else {
    // Passive tier: quiz points auto-granted
    quizScore = 15;
  }

  const compositeScore = Math.round(scrollScore + timeScore + focusScore + interactionScore + quizScore);
  const isVerified = compositeScore >= 50;

  let failureReason: string | undefined;
  if (!isVerified) {
    const reasons: string[] = [];
    if (scrollDepthPercent < MIN_SCROLL_DEPTH_PERCENT) {
      reasons.push(`Scroll depth ${scrollDepthPercent}% below ${MIN_SCROLL_DEPTH_PERCENT}% minimum`);
    }
    if (engagedTimeRatio < MIN_ENGAGED_TIME_RATIO) {
      reasons.push(`Engaged time ratio ${(engagedTimeRatio * 100).toFixed(0)}% below ${MIN_ENGAGED_TIME_RATIO * 100}% minimum`);
    }
    if (interactions.length < MIN_VOLUNTARY_INTERACTIONS) {
      reasons.push(`Need at least ${MIN_VOLUNTARY_INTERACTIONS} interaction(s)`);
    }
    if (tier === "active" && !quizAttempted) {
      reasons.push("Micro-quiz required for high-value content but not attempted");
    }
    failureReason = reasons.join(". ");
  }

  return {
    memberId,
    contentId,
    tier,
    engagedTimeSeconds,
    estimatedReadingTimeSeconds,
    engagedTimeRatio,
    scrollDepthPercent,
    pageFocusMajority,
    interactions,
    quizAttempted,
    quizPassed,
    compositeScore,
    isVerified,
    failureReason,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Determine the verification tier for a given content value.
 */
export function getVerificationTier(coverageMinutesValue: number): VerificationTier {
  return coverageMinutesValue >= ACTIVE_VERIFICATION_THRESHOLD ? "active" : "passive";
}

// ─── Accumulation Level System ──────────────────────────────────────────────

/**
 * Accumulation levels based on total lifetime minutes earned.
 * Higher levels unlock longer potential broadcast sessions
 * (still capped at MAX_SESSION_BROADCAST).
 */
export const ACCUMULATION_LEVELS = [
  { level: 1, minEarned: 0,      label: "Listener",          sessionBonus: 0 },
  { level: 2, minEarned: 30,     label: "Attentive",         sessionBonus: 0 },
  { level: 3, minEarned: 90,     label: "Engaged",           sessionBonus: 0 },
  { level: 4, minEarned: 300,    label: "Contributor",       sessionBonus: 0 },
  { level: 5, minEarned: 900,    label: "Respected Voice",   sessionBonus: 0 },
  { level: 6, minEarned: 2700,   label: "Trusted Speaker",   sessionBonus: 0 },
  { level: 7, minEarned: 8100,   label: "Community Pillar",  sessionBonus: 0 },
] as const;

// ─── Logic Functions ────────────────────────────────────────────────────────

/**
 * Create a new Coverage Minutes account for a member.
 */
export function createAccount(memberId: string): CoverageMinuteAccount {
  const now = new Date().toISOString();
  return {
    id: `cma-${memberId}`,
    memberId,
    earnedMinutes: 0,
    spentMinutes: 0,
    donatedOutMinutes: 0,
    receivedDonationMinutes: 0,
    currentBalance: 0,
    maxSessionBroadcast: MAX_SESSION_BROADCAST,
    accumulationLevel: 1,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Calculate the current balance of a Coverage Minutes account.
 */
export function calculateBalance(account: CoverageMinuteAccount): number {
  return (
    account.earnedMinutes +
    account.receivedDonationMinutes -
    account.spentMinutes -
    account.donatedOutMinutes
  );
}

/**
 * Round minutes to the nearest ACCUMULATION_INCREMENT.
 * Coverage Minutes always accumulate in 3-minute increments.
 */
export function roundToIncrement(minutes: number): number {
  return Math.floor(minutes / ACCUMULATION_INCREMENT) * ACCUMULATION_INCREMENT;
}

/**
 * Calculate Coverage Minutes earned from reading, adjusted for reading speed.
 */
export function calculateReadingEarnings(
  contentReadingTimeMinutes: number,
  percentComplete: number,
  speedTier: ReadingSpeedTier,
): number {
  const rawMinutes = (contentReadingTimeMinutes * percentComplete / 100) * READING_SPEED_TIERS[speedTier];
  return roundToIncrement(rawMinutes);
}

/**
 * Check if a member can speak for a given duration.
 * Must have enough balance AND not exceed session max.
 */
export function canSpeak(
  account: CoverageMinuteAccount,
  durationMinutes: number,
  sessionMinutesUsed: number = 0,
): { allowed: boolean; reason?: string } {
  const balance = calculateBalance(account);

  if (balance < durationMinutes) {
    return {
      allowed: false,
      reason: `Insufficient Coverage Minutes. Balance: ${balance}, Requested: ${durationMinutes}. Listen more to earn more.`,
    };
  }

  if (sessionMinutesUsed + durationMinutes > MAX_SESSION_BROADCAST) {
    return {
      allowed: false,
      reason: `Session limit reached. Max per session: ${MAX_SESSION_BROADCAST} minutes. Used: ${sessionMinutesUsed}.`,
    };
  }

  return { allowed: true };
}

/**
 * Check if a member can donate Coverage Minutes.
 * Requires membership stamp and sufficient balance.
 */
export function canDonate(
  account: CoverageMinuteAccount,
  minutes: number,
  stampLevel: number,
): { allowed: boolean; reason?: string } {
  if (stampLevel < DONATION_STAMP_LEVEL) {
    return {
      allowed: false,
      reason: "Membership stamp required to donate Coverage Minutes.",
    };
  }

  const balance = calculateBalance(account);
  if (balance < minutes) {
    return {
      allowed: false,
      reason: `Insufficient balance to donate. Balance: ${balance}, Attempting: ${minutes}.`,
    };
  }

  return { allowed: true };
}

/**
 * Get the accumulation level for a given total earned minutes.
 */
export function getAccumulationLevel(totalEarned: number): typeof ACCUMULATION_LEVELS[number] {
  let level = ACCUMULATION_LEVELS[0];
  for (const l of ACCUMULATION_LEVELS) {
    if (totalEarned >= l.minEarned) {
      level = l;
    }
  }
  return level;
}

/**
 * Calculate Coverage Minutes cost for publishing text.
 * Based on estimated reading time of the published piece.
 * Uses BENCHMARK_WPM_NONFICTION (238 WPM) from P-005R research
 * as the baseline reading speed for cost calculation.
 */
export function calculatePublishingCost(wordCount: number): number {
  const readingTimeMinutes = wordCount / BENCHMARK_WPM_NONFICTION;
  return roundToIncrement(Math.max(ACCUMULATION_INCREMENT, readingTimeMinutes));
}

/**
 * Determine reading speed tier from measured words-per-minute.
 * Uses empirical benchmarks from P-005R research.
 */
export function determineReadingSpeedTier(measuredWPM: number): ReadingSpeedTier {
  if (measuredWPM <= READING_SPEED_WPM_THRESHOLDS.slow_max) return "slow";
  if (measuredWPM <= READING_SPEED_WPM_THRESHOLDS.normal_max) return "normal";
  if (measuredWPM <= READING_SPEED_WPM_THRESHOLDS.fast_max) return "fast";
  return "speed";
}

// ─── Anti-Abuse Functions (R-005 Integration) ───────────────────────────────

/**
 * Calculate donation with friction tax.
 * Donating N minutes costs the sender N * DONATION_TAX_MULTIPLIER.
 * This prevents infinite circular passing of minutes between colluding accounts.
 *
 * Example: donating 10 minutes costs sender 12, recipient gets 10.
 * The 2-minute tax is "burned" — removed from circulation.
 */
export function calculateDonationWithTax(minutesToDonate: number): DonationWithTax {
  const senderPays = Math.ceil(minutesToDonate * DONATION_TAX_MULTIPLIER);
  const taxAmount = senderPays - minutesToDonate;

  return {
    recipientReceives: minutesToDonate,
    senderPays,
    taxAmount,
    taxMultiplier: DONATION_TAX_MULTIPLIER,
  };
}

/**
 * Calculate diminishing returns for reading the same author.
 * First N reads (up to threshold) earn full rate.
 * After threshold, earnings drop to SAME_AUTHOR_FLOOR_RATE.
 *
 * Forces diverse reading to earn efficiently — prevents farming cartels.
 */
export function calculateAuthorDiminishingRate(
  authorReadCount: number,
): number {
  if (authorReadCount <= SAME_AUTHOR_DIMINISHING_THRESHOLD) {
    return 1.0; // full rate
  }
  return SAME_AUTHOR_FLOOR_RATE;
}

/**
 * Calculate reading earnings with diminishing returns applied.
 * Wraps calculateReadingEarnings with same-author penalty.
 */
export function calculateReadingEarningsWithDiminishing(
  contentReadingTimeMinutes: number,
  percentComplete: number,
  speedTier: ReadingSpeedTier,
  authorReadCount: number,
): number {
  const baseEarnings = calculateReadingEarnings(
    contentReadingTimeMinutes,
    percentComplete,
    speedTier,
  );
  const diminishingRate = calculateAuthorDiminishingRate(authorReadCount);
  return roundToIncrement(baseEarnings * diminishingRate);
}

/**
 * Check if a reading session looks like bot behavior.
 * Returns abuse flags if suspicious patterns detected.
 */
export function detectReadingAbuse(
  wordCount: number,
  readingTimeSeconds: number,
): { isSuspicious: boolean; flags: AbuseFlag[]; reason?: string } {
  const flags: AbuseFlag[] = [];

  // Check minimum reading time
  if (readingTimeSeconds < MIN_READING_TIME_SECONDS) {
    flags.push("instant_completion");
  }

  // Check reading speed (WPM)
  const readingTimeMinutes = readingTimeSeconds / 60;
  if (readingTimeMinutes > 0) {
    const wpm = wordCount / readingTimeMinutes;
    if (wpm > MAX_PLAUSIBLE_WPM) {
      flags.push("bot_reading");
    }
  }

  if (flags.length === 0) {
    return { isSuspicious: false, flags };
  }

  const reasons: string[] = [];
  if (flags.includes("instant_completion")) {
    reasons.push(`Reading completed in ${readingTimeSeconds}s (minimum: ${MIN_READING_TIME_SECONDS}s)`);
  }
  if (flags.includes("bot_reading")) {
    const wpm = Math.round(wordCount / (readingTimeSeconds / 60));
    reasons.push(`Reading speed ${wpm} WPM exceeds plausible limit of ${MAX_PLAUSIBLE_WPM} WPM`);
  }

  return {
    isSuspicious: true,
    flags,
    reason: reasons.join(". "),
  };
}

/**
 * Calculate minutes to decay from an account.
 * Any earned minutes older than DECAY_WINDOW_DAYS that haven't been spent
 * or donated are expired. This prevents lurker hoarding.
 *
 * Note: In production, this runs via an Edge Function on DECAY_CHECK_INTERVAL_MS.
 * The function takes a list of earning transactions and returns which ones have decayed.
 */
export function calculateDecay(
  earnedTransactions: Array<{ minutes: number; timestamp: string }>,
  currentTime: Date = new Date(),
): DecayEvent | null {
  const cutoffMs = currentTime.getTime() - (DECAY_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  let minutesDecayed = 0;
  let oldestDate = "";

  for (const tx of earnedTransactions) {
    const txTime = new Date(tx.timestamp).getTime();
    if (txTime < cutoffMs) {
      minutesDecayed += tx.minutes;
      if (!oldestDate || tx.timestamp < oldestDate) {
        oldestDate = tx.timestamp;
      }
    }
  }

  if (minutesDecayed === 0) {
    return null;
  }

  return {
    accountId: "",  // populated by caller
    minutesDecayed,
    oldestEarningDate: oldestDate,
    appliedAt: currentTime.toISOString(),
    balanceAfter: 0, // populated by caller after applying
  };
}

/**
 * Check if a donation can proceed with the friction tax applied.
 * Uses calculateDonationWithTax to determine actual sender cost.
 */
export function canDonateWithTax(
  account: CoverageMinuteAccount,
  minutesToDonate: number,
  stampLevel: number,
): { allowed: boolean; reason?: string; taxDetails?: DonationWithTax } {
  if (stampLevel < DONATION_STAMP_LEVEL) {
    return {
      allowed: false,
      reason: "Membership stamp required to donate Coverage Minutes.",
    };
  }

  const taxDetails = calculateDonationWithTax(minutesToDonate);
  const balance = calculateBalance(account);

  if (balance < taxDetails.senderPays) {
    return {
      allowed: false,
      reason: `Insufficient balance. Donating ${minutesToDonate} minutes costs ${taxDetails.senderPays} minutes (includes ${taxDetails.taxAmount} minute friction tax). Your balance: ${balance}.`,
      taxDetails,
    };
  }

  return { allowed: true, taxDetails };
}

/**
 * Initialize reading behavior metrics for a new member.
 */
export function createReadingBehaviorMetrics(memberId: string): ReadingBehaviorMetrics {
  return {
    memberId,
    averageWPM: 0,
    flaggedSessionCount: 0,
    activeFlags: [],
    authorReadCounts: {},
    lastDecayCheck: new Date().toISOString(),
    totalDecayed: 0,
  };
}

/**
 * Update author read count and return the diminishing rate for this read.
 */
export function recordAuthorRead(
  metrics: ReadingBehaviorMetrics,
  authorId: string,
): { readCount: number; earningRate: number } {
  const currentCount = metrics.authorReadCounts[authorId] ?? 0;
  const newCount = currentCount + 1;
  metrics.authorReadCounts[authorId] = newCount;

  return {
    readCount: newCount,
    earningRate: calculateAuthorDiminishingRate(newCount),
  };
}
