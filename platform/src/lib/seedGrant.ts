/**
 * SEED GRANT SYSTEM — One-Time Creator Onboarding Grants
 * =======================================================
 * Innovation #1524: Option C Recharacterization
 *
 * Option C was originally "Royalty Advance" — a 50/50 revenue advance.
 * That violates C+20% principles (creates hidden discount during repayment).
 *
 * RECHARACTERIZED as "Seed Grant":
 *   - ONE-TIME per creator (idempotent — once seeded, done forever)
 *   - Funded from LB Funding Pool (community money)
 *   - NOT a loan. NOT an advance. A GRANT.
 *   - "Repayment" = completing onboarding milestones (generates Marks)
 *   - Creator keeps 100% of C+20% margin on all sales (no revenue diversion)
 *
 * Three Funding Options (progressive disclosure):
 *   Option A: Community Bounty    — Community votes to fund production
 *   Option B: Incubator Crowdfund — Creator campaigns for backers
 *   Option C: Seed Grant          — Platform grants one-time onboarding funds
 *
 * "Say what you Do, Do what you Say."
 * We grant you seed funds. You plant them by participating.
 */

// ============================================================================
// TYPES
// ============================================================================

export type GrantTier = 'seedling' | 'sapling' | 'root';
export type GrantStatus = 'eligible' | 'applied' | 'approved' | 'active' | 'seeded';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'verified';

export interface SeedGrant {
  id: string;
  userId: string;
  tier: GrantTier;
  status: GrantStatus;
  amountCredits: number;
  // Milestones
  milestones: GrantMilestone[];
  milestonesCompleted: number;
  milestonesTotal: number;
  // Approval
  appliedAt: string;
  approvedAt?: string;
  approvedBy?: string;       // Founder or delegated Guild Captain
  seededAt?: string;          // When all milestones completed
  // Marks generated
  marksGenerated: number;     // Total Marks earned through milestone completion
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface GrantMilestone {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  marksReward: number;        // Marks earned on completion
  completedAt?: string;
  verifiedBy?: string;
  verificationMethod: 'automatic' | 'manual' | 'guild_captain';
}

export interface FundingOption {
  id: 'community_bounty' | 'incubator_crowdfund' | 'seed_grant';
  name: string;
  tagline: string;
  description: string;
  howItWorks: string[];
  whoPays: string;
  creatorRisk: string;
  bestFor: string;
  icon: string;
}

// ============================================================================
// GRANT TIER CONFIGURATION
// ============================================================================

export const GRANT_TIERS: Record<GrantTier, {
  label: string;
  maxCredits: number;
  description: string;
  milestoneCount: number;
  typicalUse: string;
}> = {
  seedling: {
    label: 'Seedling Grant',
    maxCredits: 50,
    description: 'For materials and prototyping',
    milestoneCount: 4,
    typicalUse: 'First 3D print filament, basic materials, design software access',
  },
  sapling: {
    label: 'Sapling Grant',
    maxCredits: 200,
    description: 'For small batch tooling and production setup',
    milestoneCount: 6,
    typicalUse: 'Print farm time, mold materials, post-processing supplies',
  },
  root: {
    label: 'Root Grant',
    maxCredits: 500,
    description: 'For medium production setup and equipment',
    milestoneCount: 8,
    typicalUse: 'Equipment access, material bulk purchase, quality testing setup',
  },
};

// ============================================================================
// DEFAULT MILESTONES BY TIER
// ============================================================================

export function getDefaultMilestones(tier: GrantTier): GrantMilestone[] {
  const baseMilestones: GrantMilestone[] = [
    {
      id: 'ms-product-listing',
      title: 'Complete Product Listing',
      description: 'List at least 1 product with full Blueprint Scroll path and C+20% compliant pricing',
      status: 'pending',
      marksReward: 5,
      verificationMethod: 'automatic',
    },
    {
      id: 'ms-c20-pricing',
      title: 'Set C+20% Compliant Pricing',
      description: 'All products priced at Cost + 20% minimum with transparent cost breakdown',
      status: 'pending',
      marksReward: 3,
      verificationMethod: 'automatic',
    },
    {
      id: 'ms-coverage-minutes',
      title: 'Complete 3 Coverage Minutes',
      description: 'Read or create platform education content worth at least 3 Coverage Minutes',
      status: 'pending',
      marksReward: 3,
      verificationMethod: 'automatic',
    },
    {
      id: 'ms-guild-join',
      title: 'Join a Guild',
      description: 'Join or create a Guild chapter aligned with your craft',
      status: 'pending',
      marksReward: 5,
      verificationMethod: 'automatic',
    },
  ];

  if (tier === 'seedling') return baseMilestones;

  const saplingMilestones: GrantMilestone[] = [
    ...baseMilestones,
    {
      id: 'ms-round-table',
      title: 'Participate in Round Table',
      description: 'Attend and participate in at least 1 Round Table session',
      status: 'pending',
      marksReward: 5,
      verificationMethod: 'automatic',
    },
    {
      id: 'ms-blueprint-complete',
      title: 'Complete Blueprint Scroll Path',
      description: 'Follow the Blueprint Scroll journey for at least 1 product through to Checkpoint stage',
      status: 'pending',
      marksReward: 10,
      verificationMethod: 'manual',
    },
  ];

  if (tier === 'sapling') return saplingMilestones;

  // Root tier — all above plus
  return [
    ...saplingMilestones,
    {
      id: 'ms-quality-review',
      title: 'Pass Quality Review',
      description: 'Submit 1 product for Water Guild quality review and pass',
      status: 'pending',
      marksReward: 10,
      verificationMethod: 'guild_captain',
    },
    {
      id: 'ms-mentor-session',
      title: 'Complete Mentor Session',
      description: 'Complete 1 mentor matching session (as mentor or mentee) via Academy',
      status: 'pending',
      marksReward: 10,
      verificationMethod: 'manual',
    },
  ];
}

// ============================================================================
// THREE FUNDING OPTIONS (for Blueprints page)
// ============================================================================

export const FUNDING_OPTIONS: FundingOption[] = [
  {
    id: 'community_bounty',
    name: 'Community Bounty',
    tagline: 'Let the community fund your idea',
    description: 'Post your product idea as a bounty. Community members vote with Credits to fund production. When the threshold is met, production begins. Zero risk to you — the community has already committed.',
    howItWorks: [
      'Post your product idea with cost breakdown and Blueprint Scroll path',
      'Community members vote with Credits — each vote is a real commitment',
      'When votes reach the production threshold, funding is locked',
      'You produce and deliver. Community gets their product at C+20%',
      'Surplus votes carry over as pre-orders for next batch',
    ],
    whoPays: 'Community members (through Credit votes)',
    creatorRisk: 'Zero — production only starts when fully funded',
    bestFor: 'Creators with validated ideas who want community backing before committing',
    icon: 'Users',
  },
  {
    id: 'incubator_crowdfund',
    name: 'Incubator Crowdfund',
    tagline: 'Campaign for backers on your terms',
    description: 'Launch a crowdfunding campaign within the platform. Set your own goal, timeline, and rewards. Backers contribute Credits directly. Market-validated before you spend a dime.',
    howItWorks: [
      'Create a campaign page with video, description, and funding goal',
      'Set reward tiers for backers (early access, special editions, etc.)',
      'Promote through your Guild, social channels, and platform network',
      'Campaign succeeds when goal is met (all-or-nothing model)',
      'Funds released upon delivery milestones to protect backers',
    ],
    whoPays: 'Backers and supporters (through direct Credit contributions)',
    creatorRisk: 'Low — campaign only activates if goal is met',
    bestFor: 'Creators with an audience who want to test market demand',
    icon: 'Rocket',
  },
  {
    id: 'seed_grant',
    name: 'Seed Grant',
    tagline: 'Platform-backed onboarding funds',
    description: 'A one-time grant from the LB Funding Pool to help you get started. Not a loan — a grant. Complete onboarding milestones to earn Marks and "seed" your grant. You keep 100% of your C+20% margin from day one.',
    howItWorks: [
      'Apply for a Seedling (50 Credits), Sapling (200), or Root (500) grant',
      'Founder (or Guild Captain) reviews and approves your application',
      'Grant funds are released from the LB Funding Pool',
      'Complete onboarding milestones (list product, join guild, participate)',
      'Each milestone earns Marks and moves you toward "seeded" status',
      'Once all milestones are complete, your grant is seeded — done forever',
    ],
    whoPays: 'LB Funding Pool (community-contributed medallion funds)',
    creatorRisk: 'Zero — grant, not loan. No repayment. No revenue diversion.',
    bestFor: 'New creators who need startup funds but have no audience yet',
    icon: 'Sprout',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a user is eligible for a Seed Grant.
 * Users can only receive ONE Seed Grant ever.
 */
export function isEligibleForGrant(existingGrants: SeedGrant[]): boolean {
  return existingGrants.length === 0;
}

/**
 * Calculate milestone completion percentage.
 */
export function getCompletionPercentage(grant: SeedGrant): number {
  if (grant.milestonesTotal === 0) return 0;
  return Math.round((grant.milestonesCompleted / grant.milestonesTotal) * 100);
}

/**
 * Check if all milestones are complete (grant is "seeded").
 */
export function isFullySeeded(grant: SeedGrant): boolean {
  return grant.milestones.every(m => m.status === 'completed' || m.status === 'verified');
}

/**
 * Calculate total Marks generated by completed milestones.
 */
export function calculateMarksGenerated(milestones: GrantMilestone[]): number {
  return milestones
    .filter(m => m.status === 'completed' || m.status === 'verified')
    .reduce((sum, m) => sum + m.marksReward, 0);
}

export default {
  GRANT_TIERS,
  FUNDING_OPTIONS,
  getDefaultMilestones,
  isEligibleForGrant,
  getCompletionPercentage,
  isFullySeeded,
  calculateMarksGenerated,
};
