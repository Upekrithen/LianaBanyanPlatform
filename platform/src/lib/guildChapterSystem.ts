/**
 * GUILD CHAPTER & TRIBE DIVISION SYSTEM
 * ========================================
 * Two parallel competition leagues:
 *
 *   GUILDS  = Skill-based divisions (Forge tools)
 *     - Anvil Guild (Economics)
 *     - Fire Guild (Verification)
 *     - Bellows Guild (Communications)
 *     - Hammer Guild (Production)
 *     - Water Guild (Quality)
 *
 *   TRIBES  = Community-based divisions (Geography/Interest)
 *     - Regional tribes (Nashville, Austin, etc.)
 *     - International tribes
 *     - Interest-based tribes
 *
 * Each guild/tribe has LOCAL CHAPTERS with:
 *   - Guild Captain / Tribal Chieftain
 *   - Custom coat of arms (annual competition)
 *   - Fantasy-sports roster (#929 Seedling Brackets)
 *   - Portfolio-interconnected scoring
 *   - Regional → National → Worldwide competition tiers
 *
 * Cross-Division Competition:
 *   - Guilds compete against Guilds
 *   - Tribes compete against Tribes
 *   - Eventually: Guilds vs. Tribes (like Military vs NFL)
 *   - Level-matched: top N of larger vs all N of smaller
 *
 * Innovation #1449 — Guild Chapter System
 * Innovation #1450 — Tribe Division System
 * Innovation #1451 — Cross-Division Level Matching
 * Innovation #1452 — Seedling Brackets Extension
 * Innovation #1453 — Coat of Arms Competition
 */

// ============================================================================
// TYPES
// ============================================================================

export type DivisionType = 'guild' | 'tribe';
export type CompetitionTier = 'local' | 'regional' | 'national' | 'worldwide';
export type SeasonStatus = 'upcoming' | 'active' | 'playoffs' | 'completed';
export type CoatOfArmsStatus = 'draft' | 'submitted' | 'voting' | 'winner' | 'archived';

// ============================================================================
// GUILD DEFINITIONS (Forge Tools)
// ============================================================================

export interface GuildDefinition {
  id: string;
  name: string;
  forgeTool: string;
  icon: string;
  color: string;
  description: string;
  /** What skills/activities this guild covers */
  domains: string[];
}

export const GUILDS: GuildDefinition[] = [
  {
    id: 'anvil',
    name: 'Anvil Guild',
    forgeTool: 'The Anvil',
    icon: '⚒️',
    color: 'amber',
    description: 'Economics — Where value is shaped',
    domains: ['Currency design', 'Pricing', 'Cost+20%', 'Marks', 'Credits', 'Joules', 'Brewster Bonus', 'Financial modeling'],
  },
  {
    id: 'fire',
    name: 'Fire Guild',
    forgeTool: 'The Furnace',
    icon: '🔥',
    color: 'red',
    description: 'Verification — Where truth is tested',
    domains: ['QR codes', 'Deck Cards', 'Harper Guild', 'Medallions', 'IP registration', 'Quality assurance', 'Auditing'],
  },
  {
    id: 'bellows',
    name: 'Bellows Guild',
    forgeTool: 'The Bellows',
    icon: '💨',
    color: 'blue',
    description: 'Communications — What pushes air into the fire',
    domains: ['The Battery', 'Universal Dispatch', 'Cue Cards', 'Social media', 'Newsletters', 'Beacon Runs', 'Marketing'],
  },
  {
    id: 'hammer',
    name: 'Hammer Guild',
    forgeTool: 'The Hammer',
    icon: '🔨',
    color: 'orange',
    description: 'Production — What shapes raw material',
    domains: ['ScrollForge', 'Manufacturing', 'DeckCardStudio', 'Content creation', 'Prototyping', 'Design', '3D printing'],
  },
  {
    id: 'water',
    name: 'Water Guild',
    forgeTool: 'The Quenching Trough',
    icon: '💧',
    color: 'cyan',
    description: 'Quality — Where products are hardened',
    domains: ['Golden Key', 'Alcove system', 'Testing', 'Gamification', 'Badges', 'Education', 'Documentation'],
  },
];

// ============================================================================
// CHAPTER
// ============================================================================

export interface Chapter {
  id: string;
  /** Parent guild or tribe ID */
  parentId: string;
  parentType: DivisionType;
  /** Chapter name (e.g., "Nashville Anvil Chapter") */
  name: string;
  /** Geographic or interest identifier */
  region: string;
  /** Country code */
  country: string;
  /** Chapter leader */
  captainId: string;
  captainTitle: string; // "Guild Captain" or "Tribal Chieftain"
  /** Current coat of arms (winner of last competition) */
  coatOfArmsUrl?: string;
  coatOfArmsDesignerId?: string;
  /** Stats */
  memberCount: number;
  foundedAt: string;
  /** Competition record */
  seasonWins: number;
  seasonLosses: number;
  /** Fantasy roster from Seedling Brackets */
  rosterId?: string;
  /** Portfolio score (aggregated from member activities) */
  chapterScore: number;
}

// ============================================================================
// COAT OF ARMS COMPETITION
// ============================================================================

export interface CoatOfArmsEntry {
  id: string;
  chapterId: string;
  designerId: string;
  designerName: string;
  imageUrl: string;
  title: string;
  description: string;
  /** Design elements */
  symbolism: string;
  /** Competition tracking */
  status: CoatOfArmsStatus;
  votes: number;
  submittedAt: string;
  seasonYear: number;
}

export interface CoatOfArmsCompetition {
  id: string;
  /** Guild or Tribe this competition is for */
  divisionId: string;
  divisionType: DivisionType;
  seasonYear: number;
  /** Phases */
  submissionOpens: string;
  submissionCloses: string;
  votingOpens: string;
  votingCloses: string;
  /** Results */
  winnerId?: string;
  winnerChapterId?: string;
  totalEntries: number;
  totalVotes: number;
  status: 'submissions' | 'voting' | 'decided' | 'archived';
}

// ============================================================================
// COMPETITION SYSTEM
// ============================================================================

export interface Season {
  id: string;
  name: string; // e.g., "Spring 2026 Guild League"
  divisionType: DivisionType;
  tier: CompetitionTier;
  status: SeasonStatus;
  /** Date range */
  startsAt: string;
  endsAt: string;
  /** Participating chapters */
  chapterIds: string[];
  /** Scoring method */
  scoringMethod: 'fantasy' | 'bracket' | 'round-robin';
  /** Results */
  standings?: SeasonStanding[];
  championId?: string;
}

export interface SeasonStanding {
  chapterId: string;
  chapterName: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  fantasyScore: number;
  rank: number;
}

export interface CrossDivisionMatch {
  id: string;
  /** Which season/event this belongs to */
  eventName: string;
  /** The two competing entities */
  guildChapterId: string;
  tribeChapterId: string;
  /** Level matching */
  guildRank: number;
  tribeRank: number;
  /** Scores */
  guildScore: number;
  tribeScore: number;
  /** Status */
  status: 'scheduled' | 'live' | 'completed';
  scheduledAt: string;
}

// ============================================================================
// LEVEL MATCHING (#1451)
// ============================================================================

/**
 * Level-match two divisions with unequal chapter counts.
 *
 * If Guilds have 54 chapters and Tribes have 12,
 * the top 12 of 54 compete against all 12.
 *
 * "It's not just one national team, it's every region
 * matching other regions."
 */
export function levelMatch(
  largerDivision: Chapter[],
  smallerDivision: Chapter[],
): Array<{ larger: Chapter; smaller: Chapter }> {
  // Sort both by chapterScore (highest first)
  const sortedLarger = [...largerDivision].sort((a, b) => b.chapterScore - a.chapterScore);
  const sortedSmaller = [...smallerDivision].sort((a, b) => b.chapterScore - a.chapterScore);

  const matchCount = Math.min(sortedLarger.length, sortedSmaller.length);

  // Top N of larger vs all N of smaller, rank-matched
  const matches: Array<{ larger: Chapter; smaller: Chapter }> = [];
  for (let i = 0; i < matchCount; i++) {
    matches.push({
      larger: sortedLarger[i],
      smaller: sortedSmaller[i],
    });
  }

  return matches;
}

/**
 * Create a cross-division matchup (Guilds vs Tribes).
 */
export function createCrossDivisionMatchup(
  guildChapters: Chapter[],
  tribeChapters: Chapter[],
): CrossDivisionMatch[] {
  const isGuildLarger = guildChapters.length >= tribeChapters.length;
  const matches = isGuildLarger
    ? levelMatch(guildChapters, tribeChapters)
    : levelMatch(tribeChapters, guildChapters);

  return matches.map((m, i) => ({
    id: `cross-${i}`,
    eventName: 'Cross-Division Championship',
    guildChapterId: isGuildLarger ? m.larger.id : m.smaller.id,
    tribeChapterId: isGuildLarger ? m.smaller.id : m.larger.id,
    guildRank: i + 1,
    tribeRank: i + 1,
    guildScore: 0,
    tribeScore: 0,
    status: 'scheduled' as const,
    scheduledAt: new Date().toISOString(),
  }));
}

// ============================================================================
// FANTASY ROSTER INTEGRATION (#1452)
// ============================================================================

/**
 * A chapter's fantasy roster — extending Seedling Brackets (#929).
 *
 * Each chapter fields a "team" of members whose portfolio activities
 * generate fantasy-sports-style points. Points aggregate to the chapter
 * score, which determines league standings and playoff seeding.
 */
export interface ChapterRoster {
  id: string;
  chapterId: string;
  seasonId: string;
  /** Active roster members (fantasy "players") */
  members: RosterMember[];
  /** Aggregate score */
  totalScore: number;
  /** Bench (reserves) */
  benchMembers: RosterMember[];
}

export interface RosterMember {
  userId: string;
  displayName: string;
  /** Position in the roster (like fantasy football positions) */
  position: RosterPosition;
  /** This member's contribution to chapter score */
  score: number;
  /** Activity breakdown */
  activities: {
    projectsBacked: number;
    marksCleared: number;
    bountiesCompleted: number;
    questionsAnswered: number;
    referrals: number;
    contentCreated: number;
  };
}

export type RosterPosition =
  | 'forge-master'    // Guild Captain equivalent on the roster
  | 'anvil-striker'   // High-value project backer
  | 'flame-tender'    // Active verifier/auditor
  | 'bellows-caller'  // Content creator/dispatcher
  | 'hammer-smith'    // Builder/manufacturer
  | 'water-bearer'    // Educator/tester
  | 'apprentice';     // Entry-level roster position

/**
 * Scoring weights for fantasy roster points.
 * Extends Innovation #929 (Seedling Brackets) scoring engine.
 */
export const ROSTER_SCORING: Record<string, number> = {
  projectBacked: 10,
  markCleared: 2,
  bountyCompleted: 25,
  questionAnsweredCorrect: 5,
  referralActivated: 15,
  contentPublished: 8,
  coatOfArmsDesigned: 20,
  goldenKeyFound: 10,
  alcoveCompleted: 3,
  brewsterBonusEarned: 50,
  matchTradeCompleted: 12,
};

/**
 * Calculate a roster member's score from their activities.
 */
export function calculateMemberScore(activities: RosterMember['activities']): number {
  return (
    activities.projectsBacked * ROSTER_SCORING.projectBacked +
    activities.marksCleared * ROSTER_SCORING.markCleared +
    activities.bountiesCompleted * ROSTER_SCORING.bountyCompleted +
    activities.questionsAnswered * ROSTER_SCORING.questionAnsweredCorrect +
    activities.referrals * ROSTER_SCORING.referralActivated +
    activities.contentCreated * ROSTER_SCORING.contentPublished
  );
}

/**
 * Calculate a chapter's total roster score.
 */
export function calculateChapterScore(roster: ChapterRoster): number {
  return roster.members.reduce((sum, m) => sum + m.score, 0);
}

// ============================================================================
// COMPETITION TIERS
// ============================================================================

/**
 * Competition flows upward:
 *
 *   LOCAL → REGIONAL → NATIONAL → WORLDWIDE
 *
 * At each tier, chapters compete within their geography:
 *   - Local: chapters in the same city/metro area
 *   - Regional: winning local chapters in the same state/province
 *   - National: winning regional chapters in the same country
 *   - Worldwide: winning national chapters compete globally
 *
 * Cross-division (Guilds vs Tribes) happens at NATIONAL and WORLDWIDE tiers.
 */
export const COMPETITION_TIERS: Array<{
  tier: CompetitionTier;
  name: string;
  description: string;
  crossDivisionEligible: boolean;
}> = [
  {
    tier: 'local',
    name: 'Local League',
    description: 'Chapters in the same city or metro area compete.',
    crossDivisionEligible: false,
  },
  {
    tier: 'regional',
    name: 'Regional Championship',
    description: 'Winning local chapters compete at state/province level.',
    crossDivisionEligible: false,
  },
  {
    tier: 'national',
    name: 'National Championship',
    description: 'Winning regional chapters compete at country level. Cross-division eligible.',
    crossDivisionEligible: true,
  },
  {
    tier: 'worldwide',
    name: 'World Championship',
    description: 'Winning national chapters compete globally. Cross-division finals.',
    crossDivisionEligible: true,
  },
];

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

export function getGuildById(id: string): GuildDefinition | undefined {
  return GUILDS.find(g => g.id === id);
}

export function getLeaderTitle(type: DivisionType): string {
  return type === 'guild' ? 'Guild Captain' : 'Tribal Chieftain';
}

export function formatCompetitionTier(tier: CompetitionTier): string {
  const labels: Record<CompetitionTier, string> = {
    local: '🏘️ Local',
    regional: '🗺️ Regional',
    national: '🏛️ National',
    worldwide: '🌍 Worldwide',
  };
  return labels[tier];
}

/**
 * Get a motivational description for cross-division competition.
 */
export function getCrossDivisionDescription(
  guildCount: number,
  tribeCount: number,
): string {
  const larger = Math.max(guildCount, tribeCount);
  const smaller = Math.min(guildCount, tribeCount);
  const largerLabel = guildCount >= tribeCount ? 'Guild' : 'Tribe';

  if (larger === smaller) {
    return `${larger} ${largerLabel} chapters vs ${smaller} chapters — full matchup!`;
  }

  return `Top ${smaller} of ${larger} ${largerLabel} chapters face all ${smaller} ${largerLabel === 'Guild' ? 'Tribe' : 'Guild'} chapters. Level-matched for fairness.`;
}
