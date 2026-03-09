/**
 * SHARED POOL ACCOUNTS — Keep & Tower Resource Sharing
 * ======================================================
 * The Pool sits under the Keeps and Guild Towers.
 * Members pay "rent" (their share) into the Pool,
 * and everyone in the chapter gets access to shared resources
 * at volume-discounted rates.
 *
 * USE CASE: AI Tool Accounts (Claude, etc.)
 *   - Ultra/Max account costs $200/month (20x usage)
 *   - Pro account costs $20/month (1x usage)
 *   - 10 chapter members each pay $20 = $200 total
 *   - LB buys the Ultra account for the chapter
 *   - Each member gets 2x what they'd get individually (20x ÷ 10 = 2x)
 *
 * BETTER: If LB negotiates enterprise/bulk pricing:
 *   - LB pays $200 for 20x
 *   - Charges each of 10 members $20 (same as they'd pay for Pro)
 *   - But gives them 2x usage (better than Pro's 1x)
 *   - Members win: same price, double the usage
 *   - LB wins: members stay on platform, volume increases
 *   - Tool provider wins: guaranteed seats, reduced churn
 *
 * This applies to ANY pooled resource:
 *   - AI tools (Claude, GPT, Gemini, Perplexity)
 *   - Software licenses (Adobe, Figma, etc.)
 *   - Physical resources (shared workshop, 3D printers)
 *   - Services (legal, accounting, shipping)
 *
 * Innovation #1454 — Shared Pool Accounts (Keep/Tower Rent Model)
 * Innovation #1455 — Volume Arbitrage for Member Benefit
 * Innovation #1456 — Tribe Minimum Viability (2-person tribes)
 */

// ============================================================================
// TYPES
// ============================================================================

export type PoolResourceType =
  | 'ai-tool'        // Claude, GPT, etc.
  | 'software'       // Adobe, Figma, etc.
  | 'physical'       // Shared equipment
  | 'service'        // Legal, accounting, etc.
  | 'subscription';  // General subscriptions

export type PoolTier = 'basic' | 'pro' | 'ultra' | 'enterprise';

export type PoolMemberStatus = 'active' | 'pending' | 'suspended' | 'departed';

export interface PoolResource {
  id: string;
  /** What tool/resource this pool provides */
  name: string;
  provider: string;
  type: PoolResourceType;
  /** Pricing tiers from the provider */
  tiers: PoolResourceTier[];
  /** Which tier LB is purchasing for the pool */
  activeTier: PoolTier;
  /** Logo/icon URL */
  iconUrl?: string;
}

export interface PoolResourceTier {
  tier: PoolTier;
  /** Monthly cost to LB (what LB pays the provider) */
  monthlyCost: number;
  /** Usage multiplier (e.g., 20x for Ultra) */
  usageMultiplier: number;
  /** Max members who can share this tier */
  maxMembers: number;
  /** What each member gets (multiplier ÷ members) */
  perMemberMultiplier: number;
  /** What LB charges each member */
  perMemberCharge: number;
  /** What the member would pay for individual equivalent */
  individualEquivalent: number;
  /** Savings per member vs. individual */
  memberSavings: number;
}

export interface SharedPool {
  id: string;
  /** Which chapter/tribe/keep owns this pool */
  ownerId: string;
  ownerType: 'guild-chapter' | 'tribe' | 'keep' | 'tower';
  ownerName: string;
  /** The resource being pooled */
  resource: PoolResource;
  /** Pool members */
  members: PoolMember[];
  /** Financial tracking */
  monthlyPoolCost: number;
  monthlyPoolRevenue: number;
  /** Status */
  isActive: boolean;
  createdAt: string;
}

export interface PoolMember {
  userId: string;
  displayName: string;
  status: PoolMemberStatus;
  /** What they pay per month (Credits or fiat) */
  monthlyContribution: number;
  /** What multiplier they receive */
  usageMultiplier: number;
  joinedAt: string;
  /** Usage this billing period */
  currentUsage: number;
  maxUsage: number;
}

// ============================================================================
// PRE-CONFIGURED RESOURCES
// ============================================================================

/**
 * Claude AI pool configuration.
 *
 * Pro = $20/month, 5x free usage
 * Max = $200/month, 20x Pro usage (= 100x free)
 *
 * Pool math for 10 members:
 *   LB buys Max at $200/month
 *   10 members × $20/month = $200/month (cost-neutral to LB)
 *   Each member gets 20x ÷ 10 = 2x Pro equivalent
 *   Member pays $20 (same as Pro) but gets 2× the usage
 */
export const CLAUDE_AI_POOL: PoolResource = {
  id: 'claude-ai',
  name: 'Claude AI',
  provider: 'Anthropic',
  type: 'ai-tool',
  iconUrl: '/icons/claude.svg',
  activeTier: 'ultra',
  tiers: [
    {
      tier: 'pro',
      monthlyCost: 20,
      usageMultiplier: 5,
      maxMembers: 1,
      perMemberMultiplier: 5,
      perMemberCharge: 20,
      individualEquivalent: 20,
      memberSavings: 0,
    },
    {
      tier: 'ultra',
      monthlyCost: 200,
      usageMultiplier: 100, // 20x Pro = 100x free
      maxMembers: 10,
      perMemberMultiplier: 10, // 100x ÷ 10 = 10x free = 2x Pro
      perMemberCharge: 20,    // Same as Pro!
      individualEquivalent: 20,
      memberSavings: 0,       // Same price but 2x the usage
    },
    {
      tier: 'enterprise',
      monthlyCost: 0, // Negotiated
      usageMultiplier: 0,
      maxMembers: 50,
      perMemberMultiplier: 0,
      perMemberCharge: 0,
      individualEquivalent: 20,
      memberSavings: 0,
    },
  ],
};

/**
 * Claude Teams pool configuration (actual Anthropic pricing, March 2026).
 *
 * Standard seat = $20/month (annual) or $25/month (monthly), 1.25x Pro usage
 * Premium seat = $100/month (annual) or $125/month (monthly), 6.25x Pro, includes Claude Code
 * Minimum 5 seats, maximum 150
 *
 * For guild chapters: mix Standard + Premium based on member roles.
 * Star Chamber verifications also run through this pool.
 */
export const CLAUDE_TEAMS_POOL: PoolResource = {
  id: 'claude-teams',
  name: 'Claude Teams',
  provider: 'Anthropic',
  type: 'ai-tool',
  iconUrl: '/icons/claude.svg',
  activeTier: 'pro',
  tiers: [
    {
      tier: 'basic', // Standard seats
      monthlyCost: 20,
      usageMultiplier: 6.25, // 1.25x Pro per seat
      maxMembers: 1,
      perMemberMultiplier: 6.25,
      perMemberCharge: 20,
      individualEquivalent: 20,
      memberSavings: 0,
    },
    {
      tier: 'pro', // 10 Standard seats
      monthlyCost: 200, // 10 × $20 annual
      usageMultiplier: 62.5, // 10 × 6.25x
      maxMembers: 10,
      perMemberMultiplier: 6.25,
      perMemberCharge: 20,
      individualEquivalent: 20,
      memberSavings: 0,
    },
    {
      tier: 'ultra', // 8 Standard + 2 Premium
      monthlyCost: 360, // (8 × $20) + (2 × $100)
      usageMultiplier: 62.5, // Mixed — devs get Claude Code
      maxMembers: 10,
      perMemberMultiplier: 6.25,
      perMemberCharge: 36, // Average across mixed seats
      individualEquivalent: 20,
      memberSavings: 0,
    },
  ],
};

/**
 * Cursor Teams pool configuration.
 *
 * Teams = $40/user/month (per-seat, $20 included usage each)
 * Enterprise = custom (pooled usage across org)
 *
 * For guild chapters doing collaborative coding.
 */
export const CURSOR_POOL: PoolResource = {
  id: 'cursor',
  name: 'Cursor',
  provider: 'Cursor Inc.',
  type: 'ai-tool',
  iconUrl: '/icons/cursor.svg',
  activeTier: 'pro',
  tiers: [
    {
      tier: 'basic', // Pro individual
      monthlyCost: 20,
      usageMultiplier: 5,
      maxMembers: 1,
      perMemberMultiplier: 5,
      perMemberCharge: 20,
      individualEquivalent: 20,
      memberSavings: 0,
    },
    {
      tier: 'pro', // Teams
      monthlyCost: 400, // 10 × $40
      usageMultiplier: 50, // 10 × $20 included usage
      maxMembers: 10,
      perMemberMultiplier: 5,
      perMemberCharge: 40,
      individualEquivalent: 20,
      memberSavings: 0, // Teams costs more but adds shared workspace
    },
    {
      tier: 'enterprise',
      monthlyCost: 0, // Negotiated
      usageMultiplier: 0,
      maxMembers: 50,
      perMemberMultiplier: 0,
      perMemberCharge: 0,
      individualEquivalent: 20,
      memberSavings: 0,
    },
  ],
};

/**
 * ChatGPT/OpenAI pool configuration (Red Queen in Star Chamber).
 *
 * Plus = $20/month individual
 * Team = $25-30/seat/month
 * Enterprise = custom
 */
export const CHATGPT_POOL: PoolResource = {
  id: 'chatgpt',
  name: 'ChatGPT',
  provider: 'OpenAI',
  type: 'ai-tool',
  iconUrl: '/icons/openai.svg',
  activeTier: 'pro',
  tiers: [
    {
      tier: 'basic',
      monthlyCost: 20,
      usageMultiplier: 5,
      maxMembers: 1,
      perMemberMultiplier: 5,
      perMemberCharge: 20,
      individualEquivalent: 20,
      memberSavings: 0,
    },
    {
      tier: 'pro', // Team
      monthlyCost: 250, // 10 × $25
      usageMultiplier: 50,
      maxMembers: 10,
      perMemberMultiplier: 5,
      perMemberCharge: 25,
      individualEquivalent: 20,
      memberSavings: 0,
    },
    {
      tier: 'enterprise',
      monthlyCost: 0,
      usageMultiplier: 0,
      maxMembers: 50,
      perMemberMultiplier: 0,
      perMemberCharge: 0,
      individualEquivalent: 20,
      memberSavings: 0,
    },
  ],
};

/**
 * Google Gemini pool configuration (Rook).
 *
 * Advanced = $20/month individual
 * Business = via Google Workspace
 */
export const GEMINI_POOL: PoolResource = {
  id: 'gemini',
  name: 'Gemini Advanced',
  provider: 'Google',
  type: 'ai-tool',
  iconUrl: '/icons/gemini.svg',
  activeTier: 'pro',
  tiers: [
    {
      tier: 'basic',
      monthlyCost: 20,
      usageMultiplier: 5,
      maxMembers: 1,
      perMemberMultiplier: 5,
      perMemberCharge: 20,
      individualEquivalent: 20,
      memberSavings: 0,
    },
    {
      tier: 'pro', // Google Workspace AI add-on
      monthlyCost: 200, // 10 × $20
      usageMultiplier: 50,
      maxMembers: 10,
      perMemberMultiplier: 5,
      perMemberCharge: 20,
      individualEquivalent: 20,
      memberSavings: 0,
    },
    {
      tier: 'enterprise',
      monthlyCost: 0,
      usageMultiplier: 0,
      maxMembers: 50,
      perMemberMultiplier: 0,
      perMemberCharge: 0,
      individualEquivalent: 20,
      memberSavings: 0,
    },
  ],
};

/**
 * Perplexity pool configuration (Pawn).
 *
 * Pro = $20/month individual
 * Enterprise = custom
 */
export const PERPLEXITY_POOL: PoolResource = {
  id: 'perplexity',
  name: 'Perplexity Pro',
  provider: 'Perplexity AI',
  type: 'ai-tool',
  iconUrl: '/icons/perplexity.svg',
  activeTier: 'pro',
  tiers: [
    {
      tier: 'basic',
      monthlyCost: 20,
      usageMultiplier: 5,
      maxMembers: 1,
      perMemberMultiplier: 5,
      perMemberCharge: 20,
      individualEquivalent: 20,
      memberSavings: 0,
    },
    {
      tier: 'pro',
      monthlyCost: 200, // 10 × $20
      usageMultiplier: 50,
      maxMembers: 10,
      perMemberMultiplier: 5,
      perMemberCharge: 20,
      individualEquivalent: 20,
      memberSavings: 0,
    },
    {
      tier: 'enterprise',
      monthlyCost: 0,
      usageMultiplier: 0,
      maxMembers: 50,
      perMemberMultiplier: 0,
      perMemberCharge: 0,
      individualEquivalent: 20,
      memberSavings: 0,
    },
  ],
};

/**
 * All poolable AI resources, mapped to chess piece agents.
 *
 * | Chess Piece | AI Provider   | Pool Resource    |
 * |-------------|---------------|------------------|
 * | Bishop      | Claude        | CLAUDE_TEAMS     |
 * | Knight      | Cursor        | CURSOR           |
 * | Rook        | Gemini        | GEMINI           |
 * | Pawn        | Perplexity    | PERPLEXITY       |
 * | Red Queen   | ChatGPT       | CHATGPT          |
 *
 * Star Chamber verification uses Bishop + Red Queen (minimum 2 AI consensus).
 * Tower of Peace academic review uses all 5 in rotation.
 *
 * MULTI-TEAM MEMBERSHIP:
 *   A member can belong to up to 4 pools simultaneously:
 *   - Project team pool (submarine module)
 *   - Tribe pool
 *   - Guild chapter pool
 *   - Lone wolf (individual, no pool)
 *
 *   At C20 ($20 Credits) per pool, a member in 4 pools pays C80/month
 *   but gets 4x the access they'd have on their own — with strangers, even.
 *
 *   Projects choose their AI inside their "submarine" (Project Module).
 *   Otherwise, the Founder picks, and the picks are:
 *   Rook (Gemini), Bishop (Claude), Pawn (Perplexity), Red Queen (ChatGPT).
 */
export const ALL_AI_POOLS: PoolResource[] = [
  CLAUDE_AI_POOL,
  CLAUDE_TEAMS_POOL,
  CURSOR_POOL,
  CHATGPT_POOL,
  GEMINI_POOL,
  PERPLEXITY_POOL,
];

// ============================================================================
// MULTI-TEAM MEMBERSHIP (#1457)
// ============================================================================

/**
 * Multi-team pool membership.
 *
 * A member can be in multiple pools simultaneously:
 *   - Their guild chapter pool
 *   - Their tribe pool
 *   - A specific project pool (submarine module)
 *   - Or go lone wolf (individual subscription)
 *
 * At C20 per pool, 4 pools = C80/month = 4x what you'd get alone.
 * And you're sharing with strangers in some of those pools — that's fine.
 * The Pool doesn't care WHO is in it, just that the economics work.
 *
 * This is what Cursor Teams and Claude Teams already do — we just
 * layer the cooperative guild/tribe/project structure on top.
 */
export interface MultiTeamMembership {
  userId: string;
  displayName: string;
  /** Pools this member belongs to */
  pools: Array<{
    poolId: string;
    poolType: 'guild-chapter' | 'tribe' | 'project' | 'lone-wolf';
    poolName: string;
    monthlyContribution: number;
    aiTool: string;
  }>;
  /** Total monthly cost across all pools */
  totalMonthlyRent: number;
  /** Total usage multiplier across all pools */
  totalUsageMultiplier: number;
}

export function calculateMultiTeamBenefit(
  poolCount: number,
  perPoolCost: number = 20,
  individualMultiplier: number = 5,
): {
  totalCost: number;
  totalMultiplier: number;
  vsIndividualRatio: string;
} {
  return {
    totalCost: poolCount * perPoolCost,
    totalMultiplier: poolCount * individualMultiplier,
    vsIndividualRatio: `${poolCount}x`,
  };
}

// ============================================================================
// POOL ECONOMICS
// ============================================================================

/**
 * Calculate the economics of a shared pool.
 *
 * Key insight: Volume arbitrage.
 *   - Provider offers tiered pricing (more $ = disproportionately more usage)
 *   - LB buys the higher tier
 *   - Splits cost among chapter members
 *   - Each member pays the SAME as they would individually
 *   - But gets MORE usage because of the volume tier
 *
 * This is the Volume Discount Differential Principle applied to subscriptions.
 */
export function calculatePoolEconomics(
  tierCost: number,
  tierMultiplier: number,
  memberCount: number,
  individualCost: number,
): {
  costPerMember: number;
  multiplierPerMember: number;
  savingsVsIndividual: number;
  usageBoostVsIndividual: string;
  lbProfit: number;
  isViable: boolean;
} {
  const costPerMember = tierCost / memberCount;
  const multiplierPerMember = tierMultiplier / memberCount;

  // If we charge the same as individual, how much does LB keep?
  const revenueAtIndividualPrice = memberCount * individualCost;
  const lbProfit = revenueAtIndividualPrice - tierCost;

  // Usage boost: how much more does each member get?
  // Assuming Pro = 5x free, and individual = Pro
  const proMultiplier = 5; // Pro baseline
  const boost = multiplierPerMember / proMultiplier;

  return {
    costPerMember: Math.round(costPerMember * 100) / 100,
    multiplierPerMember: Math.round(multiplierPerMember * 100) / 100,
    savingsVsIndividual: Math.round((individualCost - costPerMember) * 100) / 100,
    usageBoostVsIndividual: `${boost.toFixed(1)}x`,
    lbProfit,
    isViable: costPerMember <= individualCost,
  };
}

/**
 * Calculate optimal member count for a pool.
 * Returns the number of members where each still gets ≥ 1x Pro equivalent.
 */
export function calculateOptimalPoolSize(
  tierMultiplier: number,
  proMultiplier: number = 5,
): number {
  // Each member should get at least 1x Pro equivalent
  return Math.floor(tierMultiplier / proMultiplier);
}

// ============================================================================
// TRIBE MINIMUM VIABILITY (#1456)
// ============================================================================

/**
 * Tribe minimum: 2 people.
 *
 * "All you need is 2 people to make a Tribe."
 * — The Jesse Stuart Principle
 *
 * Reference: Jesse Stuart, "The Thread That Runs So True" (1949).
 * Stuart taught in a one-room schoolhouse in the mountains of Kentucky.
 * His tiny school — a fraction of the size of the well-funded
 * college-prep academies — competed against and BEAT them at the
 * state academic competition. The Founder read this book at age 12.
 * Size doesn't determine capability. Attention and effort do.
 *
 * See also: James Herriot's quartet — "All Creatures Great and Small,"
 * "All Things Bright and Beautiful," "All Things Wise and Wonderful,"
 * "The Lord God Made Them All." Four books, four lines from one hymn.
 * Similarly: all tribes, all sizes, all types — all one platform.
 *
 * Tribe types:
 *   - Family tribes (Jones family — 64 first cousins!)
 *   - Geographic tribes (Nashville, Austin)
 *   - Interest tribes (gardening, woodworking)
 *   - Professional tribes (teachers, nurses)
 *
 * A family of 64 first cousins is a tribe.
 * A married couple is also a tribe.
 * Both can compete — to the level they are able.
 */
export const TRIBE_MINIMUM_MEMBERS = 2;

export type TribeType = 'family' | 'geographic' | 'interest' | 'professional';

export interface TribeDefinition {
  id: string;
  name: string;
  type: TribeType;
  /** Founding members (minimum 2) */
  founderIds: string[];
  /** Tribal Chieftain */
  chieftainId: string;
  /** Family name (for family tribes) */
  familyName?: string;
  /** Geographic region (for geographic tribes) */
  region?: string;
  /** Interest/profession (for interest/professional tribes) */
  focus?: string;
  /** Size */
  memberCount: number;
  /** "Compete as far as you are able to get" */
  competitionTier: 'local' | 'regional' | 'national' | 'worldwide';
}

/**
 * Can a tribe compete at a given tier?
 * Yes — always. Size doesn't determine eligibility.
 * But level-matching ensures fairness.
 */
export function canTribeCompete(): boolean {
  // A tribe can ALWAYS compete. The question is WHO they compete against.
  // Level matching handles fairness.
  return true; // The Jesse Stuart Principle
}

/**
 * Create a family tribe.
 */
export function createFamilyTribe(
  familyName: string,
  founderIds: [string, string, ...string[]],
  chieftainId: string,
): TribeDefinition {
  return {
    id: `family-${familyName.toLowerCase().replace(/\s+/g, '-')}`,
    name: `The ${familyName} Family`,
    type: 'family',
    founderIds,
    chieftainId,
    familyName,
    memberCount: founderIds.length,
    competitionTier: 'local', // Start local, grow as able
  };
}

// ============================================================================
// POOL + CHAPTER INTEGRATION
// ============================================================================

/**
 * When a chapter sets up a shared pool:
 *
 * 1. Chapter has N members
 * 2. LB finds the optimal tier for that N
 * 3. LB purchases the tier
 * 4. Members pay their share (Credits or fiat)
 * 5. Share goes to the Pool (under the Keep/Tower)
 * 6. Each member gets access at boosted rate
 *
 * The Pool is the shared resource bucket.
 * The Keep/Tower is the chapter's home base.
 * Rent = monthly contribution to the Pool.
 */
export interface ChapterPoolSetup {
  chapterId: string;
  chapterName: string;
  memberCount: number;
  /** Resources this chapter pools */
  pools: SharedPool[];
  /** Total monthly rent per member (sum of all pool contributions) */
  totalMonthlyRent: number;
  /** What members get in return */
  benefits: string[];
}

/**
 * Calculate the total monthly rent for a chapter member
 * across all shared pools.
 */
export function calculateMonthlyRent(pools: SharedPool[]): number {
  return pools.reduce((total, pool) => {
    const memberContribution = pool.monthlyPoolCost / pool.members.length;
    return total + memberContribution;
  }, 0);
}

/**
 * Generate a benefits summary for a chapter's pool setup.
 */
export function generateBenefitsSummary(
  pools: SharedPool[],
  memberCount: number,
): string[] {
  const benefits: string[] = [];

  for (const pool of pools) {
    const tier = pool.resource.tiers.find(t => t.tier === pool.resource.activeTier);
    if (!tier) continue;

    const perMember = tier.usageMultiplier / memberCount;
    const individualBaseline = tier.tier === 'pro' ? tier.usageMultiplier : 5;

    if (perMember > individualBaseline) {
      benefits.push(
        `${pool.resource.name}: ${(perMember / individualBaseline).toFixed(1)}x more than individual ${tier.tier} plan`
      );
    } else {
      benefits.push(
        `${pool.resource.name}: Same price, shared access`
      );
    }
  }

  return benefits;
}
