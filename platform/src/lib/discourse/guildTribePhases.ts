/**
 * GUILD & TRIBE PHASE STRUCTURE -- Organizational Governance Hierarchy
 * =====================================================================
 * Spec: MUFFLED_RULE_AND_PHASE_MIMICTRUNKS.md, Sections 6, 7
 *
 * Guilds and Tribes form the organizational hierarchy of LB:
 *
 *   LB (platform) -> Guild -> Tribe -> Sub-tribe (nesting possible)
 *
 * Key architectural constraints:
 *
 *   - Every Guild gets a Phase MimicTrunk BY DEFAULT (they pay for it)
 *   - Guilds can host MMORPGs (Warhammer 40K-scale games)
 *   - Tribes are sub-organizations (chapters) within a Guild
 *   - A Tribe CAN have its own Phase MimicTrunk (additional cost)
 *   - Each level's rules must comply with the level above
 *   - All governance changes recorded in Immutable Ledger
 */

import type { PhaseMimicTrunk, PhaseOwnerType } from "./phaseMimicTrunks";

// ── Constants ──────────────────────────────────────────────────────────────

/** Maximum Tribes per Guild */
export const MAX_TRIBES_PER_GUILD = 50;

/** Maximum nesting depth for sub-tribes */
export const MAX_TRIBE_NESTING_DEPTH = 3; // Guild -> Tribe -> Sub-tribe -> Sub-sub-tribe

/** Minimum members to form a Guild */
export const MIN_GUILD_MEMBERS = 5;

/** Minimum members to form a Tribe within a Guild */
export const MIN_TRIBE_MEMBERS = 3;

/** Default Guild Phase MimicTrunk monthly base fee (Credits) */
export const DEFAULT_GUILD_PHASE_FEE = 100;

/** Default Tribe Phase MimicTrunk monthly base fee (Credits) */
export const DEFAULT_TRIBE_PHASE_FEE = 50;

// ── MMORPG Hosting & Metered Pricing (R-003 Integration) ────────────────
//
// Per Rook research R-003: Guild Phases capable of hosting MMORPGs
// (Warhammer 40K scale) require specialized infrastructure.
//
// Architecture:
//   - Hybrid: LB cloud (Firebase/Supabase) for auth/ledger/governance
//   - Dedicated game fleet: AWS GameLift or Unity Multiplay for game servers
//   - Guilds pay: base fee (Phase + web presence) + metered usage (CCU)
//
// A flat fee would cause massive losses if a Guild game goes viral.
// Metered pricing ensures cost scales with actual usage.

/** CCU (Concurrent Users) tier thresholds */
export const CCU_TIERS = {
  /** Small Tribe/Guild: up to 100 concurrent players */
  SMALL: { maxCCU: 100, monthlyMin: 100, monthlyMax: 250 },
  /** Medium Guild: up to 1,000 concurrent players */
  MEDIUM: { maxCCU: 1_000, monthlyMin: 1_500, monthlyMax: 3_000 },
  /** Large Guild (Warhammer 40K scale): up to 10,000+ concurrent */
  LARGE: { maxCCU: 10_000, monthlyMin: 15_000, monthlyMax: 40_000 },
} as const;

export type CCUTierName = keyof typeof CCU_TIERS;

/** Per-CCU-hour cost (Credits) — the metered component */
export const COST_PER_CCU_HOUR = 0.05;

/** Maximum CCU before requiring enterprise/custom pricing */
export const MAX_SELF_SERVICE_CCU = 10_000;

/** Game server hosting providers LB can integrate with */
export const GAME_SERVER_PROVIDERS = [
  "aws_gamelift",
  "unity_multiplay",
  "custom_bare_metal",
] as const;

export type GameServerProvider = typeof GAME_SERVER_PROVIDERS[number];

// ── Types ──────────────────────────────────────────────────────────────────

export type GuildStatus = "active" | "forming" | "suspended" | "dissolved";
export type TribeStatus = "active" | "forming" | "suspended" | "dissolved";
export type MembershipRole = "leader" | "officer" | "member" | "recruit";

export type GovernanceAction =
  | "guild_created"
  | "guild_dissolved"
  | "tribe_created"
  | "tribe_dissolved"
  | "member_joined"
  | "member_left"
  | "member_promoted"
  | "member_demoted"
  | "phase_assigned"
  | "phase_revoked"
  | "rules_updated"
  | "leader_changed";

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface Guild {
  id: string;
  name: string;
  description: string;
  motto?: string;
  status: GuildStatus;
  leaderId: string;                 // guild leader member ID
  officerIds: string[];             // officers with elevated permissions
  memberIds: string[];              // all members including leader + officers
  memberCount: number;
  tribeIds: string[];               // tribes within this guild
  phaseMimicTrunkId: string;        // default Phase (every guild has one)
  monthlyPhaseFee: number;          // Credits per month for the Phase
  keepIds: string[];                // game lobbies within the guild's Phase
  bannerImageUrl?: string;
  rulesDocument?: string;           // guild-specific rules (must comply with LB rules)
  createdAt: string;
  updatedAt: string;
  ledgerSectionId: string;          // Guild/Tribe Governance section of ledger
}

export interface Tribe {
  id: string;
  name: string;
  description: string;
  guildId: string;                  // parent guild
  status: TribeStatus;
  leaderId: string;                 // tribe leader
  memberIds: string[];
  memberCount: number;
  isChapter: boolean;               // sub-guild designation
  parentTribeId?: string;           // for sub-tribes (nesting)
  childTribeIds: string[];          // sub-tribes under this tribe
  nestingDepth: number;             // 1 = direct child of guild, 2 = sub-tribe, etc.
  phaseMimicTrunkId?: string;       // optional -- tribe can have its own Phase
  monthlyPhaseFee?: number;         // Credits per month (if has own Phase)
  keepIds: string[];                // game lobbies within the tribe
  rulesDocument?: string;           // tribe-specific rules (must comply with guild + LB)
  createdAt: string;
  updatedAt: string;
  ledgerSectionId: string;
}

export interface GuildMembership {
  id: string;
  guildId: string;
  memberId: string;
  role: MembershipRole;
  joinedAt: string;
  promotedAt?: string;
  tribeId?: string;                 // which tribe they belong to (if any)
  isActive: boolean;
}

export interface TribeMembership {
  id: string;
  tribeId: string;
  guildId: string;                  // parent guild for reference
  memberId: string;
  role: MembershipRole;
  joinedAt: string;
  isActive: boolean;
}

export interface GovernanceEvent {
  id: string;
  action: GovernanceAction;
  entityType: "guild" | "tribe";
  entityId: string;
  actorMemberId: string;           // who performed the action
  targetMemberId?: string;         // who was affected (for member actions)
  details: string;
  timestamp: string;
  ledgerEntryId: string;           // recorded in Immutable Ledger
}

export interface KeepAssignment {
  id: string;
  keepId: string;                  // game lobby ID
  ownerType: "guild" | "tribe";
  ownerId: string;
  assignedAt: string;
  isActive: boolean;
}

// ── MMORPG Hosting Types (R-003 Integration) ──────────────────────────────

/**
 * Game server configuration for a Guild's Phase MimicTrunk.
 * Only Guilds (not Tribes) can host game servers.
 */
export interface GameServerConfig {
  /** Config ID */
  id: string;
  /** Guild ID */
  guildId: string;
  /** Phase MimicTrunk ID */
  trunkId: string;
  /** Hosting provider */
  provider: GameServerProvider;
  /** Current CCU tier */
  ccuTier: CCUTierName;
  /** Maximum CCU configured */
  maxCCU: number;
  /** Whether auto-scaling is enabled */
  autoScaleEnabled: boolean;
  /** Auto-scale ceiling (max CCU to scale to) */
  autoScaleCeiling: number;
  /** Server regions (for latency optimization) */
  regions: string[];
  /** Whether the game server fleet is currently running */
  isActive: boolean;
  /** Last billing cycle start */
  currentBillingCycleStart: string;
  /** CCU-hours consumed in current billing cycle */
  currentCycleUsage: number;
  /** Created at */
  createdAt: string;
}

/**
 * Monthly billing breakdown for a Guild.
 * Combines base Phase fee + metered game server costs.
 */
export interface GuildMonthlyBill {
  /** Guild ID */
  guildId: string;
  /** Billing period (ISO month) */
  billingPeriod: string;
  /** Base Phase MimicTrunk fee (Credits) */
  basePhaseFee: number;
  /** Tribe Phase fees (sum of all tribes with own Phases) */
  totalTribePhaseFees: number;
  /** Metered game server cost (Credits) */
  gameServerCost: number;
  /** CCU-hours consumed */
  ccuHoursConsumed: number;
  /** Peak concurrent users during this period */
  peakCCU: number;
  /** Average concurrent users */
  averageCCU: number;
  /** Total monthly bill (Credits) */
  totalBill: number;
  /** Generated at */
  generatedAt: string;
}

/**
 * Calculate the metered game server cost for a billing period.
 * Cost = CCU-hours * COST_PER_CCU_HOUR
 * Minimum charge = CCU tier monthly minimum
 */
export function calculateGameServerCost(
  ccuHoursConsumed: number,
  ccuTier: CCUTierName,
): { meteredCost: number; tierMinimum: number; finalCost: number } {
  const tier = CCU_TIERS[ccuTier];
  const meteredCost = Math.round(ccuHoursConsumed * COST_PER_CCU_HOUR);
  const tierMinimum = tier.monthlyMin;

  return {
    meteredCost,
    tierMinimum,
    finalCost: Math.max(meteredCost, tierMinimum),
  };
}

/**
 * Determine the CCU tier for a given concurrent user count.
 */
export function getCCUTier(currentCCU: number): CCUTierName {
  if (currentCCU <= CCU_TIERS.SMALL.maxCCU) return "SMALL";
  if (currentCCU <= CCU_TIERS.MEDIUM.maxCCU) return "MEDIUM";
  return "LARGE";
}

/**
 * Generate a monthly bill for a Guild including all Phase fees + game server costs.
 */
export function generateMonthlyBill(
  guild: Guild,
  tribes: Tribe[],
  gameServerConfig: GameServerConfig | null,
  ccuHoursConsumed: number,
  peakCCU: number,
  averageCCU: number,
): GuildMonthlyBill {
  const phaseFees = calculateTotalPhaseFees(guild, tribes);

  let gameServerCost = 0;
  if (gameServerConfig && gameServerConfig.isActive) {
    const serverCost = calculateGameServerCost(ccuHoursConsumed, gameServerConfig.ccuTier);
    gameServerCost = serverCost.finalCost;
  }

  return {
    guildId: guild.id,
    billingPeriod: new Date().toISOString().slice(0, 7), // YYYY-MM
    basePhaseFee: phaseFees.guildFee,
    totalTribePhaseFees: phaseFees.totalMonthly - phaseFees.guildFee,
    gameServerCost,
    ccuHoursConsumed,
    peakCCU,
    averageCCU,
    totalBill: phaseFees.totalMonthly + gameServerCost,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Create a default game server configuration for a Guild.
 */
export function createGameServerConfig(
  guildId: string,
  trunkId: string,
  provider: GameServerProvider = "aws_gamelift",
): GameServerConfig {
  return {
    id: `gsc-${guildId}-${Date.now()}`,
    guildId,
    trunkId,
    provider,
    ccuTier: "SMALL",
    maxCCU: CCU_TIERS.SMALL.maxCCU,
    autoScaleEnabled: true,
    autoScaleCeiling: CCU_TIERS.SMALL.maxCCU,
    regions: ["us-east-1"],
    isActive: false,
    currentBillingCycleStart: new Date().toISOString(),
    currentCycleUsage: 0,
    createdAt: new Date().toISOString(),
  };
}

// ── Guild Phase Cost Model (P-003 Integration) ──────────────────────────
//
// Per Pawn discovery P-003: Real-world MMO hosting benchmarks.
//
// AWS GameLift examples:
//   - 50K ACU, c5n.2xlarge @ $0.746/hr = ~$112K/mo
//   - 10K ACU, same = ~$37K/mo
//   - 10K ACU with 50% Spot mix = ~$3.2K/mo (order of magnitude cheaper)
//
// Managed hosts (Nitrado etc.):
//   - Small guild shard: $20-100/mo per shard
//   - Custom stack on cloud VMs: $100-500+/mo per shard
//
// Guild Phase cost formula:
//   cost_per_guild = base_infra (db, auth, lobby) + N_shards * cost_per_shard

/** Base infrastructure cost per Guild Phase (db, auth, lobby, ledger — Credits/mo) */
export const BASE_INFRA_COST = 50;

/** Cost per game shard (Credits/mo) */
export const SHARD_COST_TIERS = {
  /** Managed host, casual MMO-lite */
  CASUAL: { costPerShard: 50, maxPlayersPerShard: 20 },
  /** Cloud VM, moderate load */
  STANDARD: { costPerShard: 150, maxPlayersPerShard: 50 },
  /** Dedicated server, high-performance */
  PERFORMANCE: { costPerShard: 500, maxPlayersPerShard: 200 },
  /** Enterprise, Warhammer-scale */
  ENTERPRISE: { costPerShard: 2000, maxPlayersPerShard: 1000 },
} as const;

export type ShardTier = keyof typeof SHARD_COST_TIERS;

/** Spot instance discount multiplier (50/50 on-demand/spot mix) */
export const SPOT_DISCOUNT_MULTIPLIER = 0.35;

/**
 * Shard-based cost estimate for a Guild Phase.
 */
export interface ShardCostEstimate {
  /** Number of game shards required */
  shardCount: number;
  /** Shard tier */
  shardTier: ShardTier;
  /** Base infrastructure cost (Credits/mo) */
  baseInfraCost: number;
  /** Total shard cost before discount (Credits/mo) */
  shardCostBeforeDiscount: number;
  /** Spot discount applied */
  spotDiscount: number;
  /** Total shard cost after discount */
  shardCostAfterDiscount: number;
  /** Total monthly estimate (Credits) */
  totalMonthly: number;
  /** Max concurrent players supported */
  maxConcurrentPlayers: number;
}

/**
 * Calculate shard-based cost estimate for a Guild.
 * Formula: base_infra + (N_shards * cost_per_shard * spot_multiplier)
 */
export function calculateShardCostEstimate(
  targetConcurrentPlayers: number,
  shardTier: ShardTier,
  useSpotInstances: boolean = false,
): ShardCostEstimate {
  const tier = SHARD_COST_TIERS[shardTier];
  const shardCount = Math.ceil(targetConcurrentPlayers / tier.maxPlayersPerShard);
  const shardCostBeforeDiscount = shardCount * tier.costPerShard;
  const spotMultiplier = useSpotInstances ? SPOT_DISCOUNT_MULTIPLIER : 1.0;
  const spotDiscount = useSpotInstances
    ? Math.round(shardCostBeforeDiscount * (1 - SPOT_DISCOUNT_MULTIPLIER))
    : 0;
  const shardCostAfterDiscount = Math.round(shardCostBeforeDiscount * spotMultiplier);

  return {
    shardCount,
    shardTier,
    baseInfraCost: BASE_INFRA_COST,
    shardCostBeforeDiscount,
    spotDiscount,
    shardCostAfterDiscount,
    totalMonthly: BASE_INFRA_COST + shardCostAfterDiscount,
    maxConcurrentPlayers: shardCount * tier.maxPlayersPerShard,
  };
}

// ── Digital Real Estate / Keep Leasing (R-009 Integration) ───────────────
//
// Per Rook research R-009: Non-crypto virtual real estate precedents.
//
// Key insights from Second Life, Roblox, and Fortnite:
//   - Leasehold model (Second Life "Tier" system) aligns cost of digital
//     space with recurring server hosting cost. No permanent ownership.
//   - Value comes from TRAFFIC and ENGAGEMENT, not map coordinates (Roblox).
//   - Creator revenue tied to player engagement time (Fortnite Creative 2.0).
//
// LB's Leasehold & Utility Model:
//   1. NO permanent ownership — Guilds/Tribes LEASE Keeps using Credits
//   2. Pricing by Capacity & Features, NOT coordinates (no artificial scarcity)
//   3. Sub-letting allowed: Guild leases Phase, sub-lets Keeps to Tribes/members
//   4. NPC Shopkeepers: automated 24/7 commerce stalls in popular Guild Phases
//   5. Lease expiration → Keep archived (prevents digital blight)
//   6. All lease transactions recorded in Immutable Ledger

/** Keep lease status */
export type KeepLeaseStatus =
  | "active"      // lease current, Keep operational
  | "grace"       // lease expired, 7-day grace period
  | "archived"    // lease expired + grace period elapsed, Keep frozen
  | "suspended";  // suspended for rule violation

/** Keep capacity tier — determines concurrent users and features */
export const KEEP_CAPACITY_TIERS = {
  /** Starter: small guild hangout */
  STARTER: {
    maxConcurrentUsers: 20,
    persistentStorage: false,
    customNPCs: false,
    monthlyLeaseCost: 500,
    label: "Starter Keep",
  },
  /** Standard: active guild hub */
  STANDARD: {
    maxConcurrentUsers: 100,
    persistentStorage: true,
    customNPCs: false,
    monthlyLeaseCost: 2_000,
    label: "Standard Keep",
  },
  /** Premium: large guild with NPC commerce */
  PREMIUM: {
    maxConcurrentUsers: 500,
    persistentStorage: true,
    customNPCs: true,
    monthlyLeaseCost: 8_000,
    label: "Premium Keep",
  },
  /** Fortress: massive guild Phase (Warhammer-scale) */
  FORTRESS: {
    maxConcurrentUsers: 2_000,
    persistentStorage: true,
    customNPCs: true,
    monthlyLeaseCost: 25_000,
    label: "Fortress Keep",
  },
} as const;

export type KeepCapacityTier = keyof typeof KEEP_CAPACITY_TIERS;

/** Lease grace period before archival (days) */
export const KEEP_LEASE_GRACE_DAYS = 7;

/** Maximum sub-leases a Keep can issue */
export const MAX_SUB_LEASES_PER_KEEP = 20;

/**
 * Keep Lease agreement — the core digital real estate contract.
 * Guilds/Tribes lease Keeps (server instances within a Phase MimicTrunk).
 */
export interface KeepLease {
  /** Lease ID */
  id: string;
  /** Keep ID */
  keepId: string;
  /** Phase MimicTrunk this Keep belongs to */
  trunkId: string;
  /** Lessee type */
  lesseeType: "guild" | "tribe" | "member";
  /** Lessee ID */
  lesseeId: string;
  /** Capacity tier */
  capacityTier: KeepCapacityTier;
  /** Monthly lease cost (Credits) */
  monthlyLeaseCost: number;
  /** Lease status */
  status: KeepLeaseStatus;
  /** Lease start date */
  leaseStartedAt: string;
  /** Current lease period end */
  currentPeriodEndsAt: string;
  /** Whether auto-renewal is enabled */
  autoRenew: boolean;
  /** Sub-leases issued by this Keep's lessee */
  subLeaseCount: number;
  /** Total traffic (unique visitors) during current lease period */
  periodTrafficCount: number;
  /** Ledger entry ID for the lease agreement */
  ledgerEntryId: string;
  /** Created at */
  createdAt: string;
  /** Updated at */
  updatedAt: string;
}

/**
 * Sub-lease: a Guild sub-lets a storefront/room within their Keep
 * to a Tribe, member, or NPC Shopkeeper.
 */
export interface KeepSubLease {
  /** Sub-lease ID */
  id: string;
  /** Parent Keep Lease ID */
  parentLeaseId: string;
  /** Keep ID */
  keepId: string;
  /** Sub-lessee type */
  subLesseeType: "tribe" | "member" | "npc_shopkeeper";
  /** Sub-lessee ID */
  subLesseeId: string;
  /** Monthly rent (Credits, set by the Keep lessee) */
  monthlyRent: number;
  /** Space name (e.g., "East Wing Stall", "Tribe Hall A") */
  spaceName: string;
  /** Whether the sub-lease is active */
  isActive: boolean;
  /** Ledger entry ID */
  ledgerEntryId: string;
  /** Created at */
  createdAt: string;
}

/**
 * NPC Shopkeeper deployed in a Keep.
 * Automated 24/7 commerce: sells digital goods on behalf of a member.
 * All transactions recorded in the Immutable Ledger.
 */
export interface NPCShopkeeper {
  /** Shopkeeper ID */
  id: string;
  /** Owner member ID (who deployed this NPC) */
  ownerMemberId: string;
  /** Keep ID where the NPC is stationed */
  keepId: string;
  /** Sub-lease ID (NPC must rent a stall) */
  subLeaseId: string;
  /** NPC display name */
  displayName: string;
  /** What the NPC sells */
  inventoryType: "special_deck_cards" | "cosmetic_items" | "guild_merchandise" | "mixed";
  /** Number of items currently for sale */
  activeListingCount: number;
  /** Total transactions completed */
  totalTransactions: number;
  /** Total Credits earned */
  totalCreditsEarned: number;
  /** Whether the NPC is currently active */
  isActive: boolean;
  /** Created at */
  createdAt: string;
}

/**
 * Create a Keep lease for a Guild or Tribe.
 */
export function createKeepLease(
  keepId: string,
  trunkId: string,
  lesseeType: "guild" | "tribe" | "member",
  lesseeId: string,
  capacityTier: KeepCapacityTier,
): KeepLease {
  const now = new Date().toISOString();
  const tier = KEEP_CAPACITY_TIERS[capacityTier];
  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + 30); // 30-day lease period

  return {
    id: `lease-${keepId}-${Date.now()}`,
    keepId,
    trunkId,
    lesseeType,
    lesseeId,
    capacityTier,
    monthlyLeaseCost: tier.monthlyLeaseCost,
    status: "active",
    leaseStartedAt: now,
    currentPeriodEndsAt: periodEnd.toISOString(),
    autoRenew: true,
    subLeaseCount: 0,
    periodTrafficCount: 0,
    ledgerEntryId: `ledger-lease-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Check if a Keep lease has expired and determine its new status.
 */
export function checkLeaseExpiration(lease: KeepLease): {
  expired: boolean;
  newStatus: KeepLeaseStatus;
  daysRemaining: number;
} {
  const now = Date.now();
  const periodEnd = new Date(lease.currentPeriodEndsAt).getTime();
  const graceEnd = periodEnd + (KEEP_LEASE_GRACE_DAYS * 24 * 60 * 60 * 1000);
  const daysRemaining = Math.ceil((periodEnd - now) / (24 * 60 * 60 * 1000));

  if (now < periodEnd) {
    return { expired: false, newStatus: "active", daysRemaining };
  }

  if (now < graceEnd) {
    return { expired: true, newStatus: "grace", daysRemaining: 0 };
  }

  return { expired: true, newStatus: "archived", daysRemaining: 0 };
}

/**
 * Check if a Keep can accept more sub-leases.
 */
export function canCreateSubLease(lease: KeepLease): {
  allowed: boolean;
  reason?: string;
} {
  if (lease.status !== "active") {
    return { allowed: false, reason: "Keep lease is not active." };
  }

  if (lease.subLeaseCount >= MAX_SUB_LEASES_PER_KEEP) {
    return { allowed: false, reason: `Maximum sub-leases (${MAX_SUB_LEASES_PER_KEEP}) reached.` };
  }

  return { allowed: true };
}

// ── Keep Infrastructure Economics (R-012 Integration) ────────────────────────
//
// Per Rook research R-012: Keep Lease Revenue Economics.
//
// Real infrastructure costs (AWS baseline) for hosting Keep game servers:
//
//   Tier 1 (50 CCU):  t3.medium   + ~500 GB bandwidth  = ~$75/mo
//   Tier 2 (200 CCU): c6i.large   + ~2 TB bandwidth    = ~$250/mo
//   Tier 3 (1K CCU):  c6i.2xlarge + ~10 TB bandwidth   = ~$1,200/mo
//
// CRITICAL INSIGHT: Bandwidth is the silent killer in cloud gaming.
//   AWS charges ~$0.09/GB out. Multiplayer games constantly stream position data.
//
// MANDATORY: Auto-scaling (spin empty Keeps to zero) is required for profitability.
//   If a Keep is only active 8 hours/day, compute cost drops ~66%.
//   Lease price stays the same → massive margin improvement.
//
// Guild revenue model: Guilds fund Keep leases through Tribe sub-letting
//   and NPC Shopkeeper taxes. A Guild paying 150K Credits/mo for Tier 3
//   can sub-let 10 Keeps to Tribes at 20K Credits/mo → 50K Credit surplus.

/** Real infrastructure cost estimates per Keep capacity tier (USD/month) */
export const KEEP_INFRASTRUCTURE_COSTS = {
  STARTER: {
    computeInstance: "t3.medium",
    estimatedBandwidthGB: 150,
    monthlyCostUSD: 25,
    label: "Starter (20 CCU)",
  },
  STANDARD: {
    computeInstance: "t3.medium",
    estimatedBandwidthGB: 500,
    monthlyCostUSD: 75,
    label: "Standard (100 CCU)",
  },
  PREMIUM: {
    computeInstance: "c6i.large",
    estimatedBandwidthGB: 2_000,
    monthlyCostUSD: 250,
    label: "Premium (500 CCU)",
  },
  FORTRESS: {
    computeInstance: "c6i.2xlarge",
    estimatedBandwidthGB: 10_000,
    monthlyCostUSD: 1_200,
    label: "Fortress (2K CCU)",
  },
} as const;

/** Platform margin rule: Cost + 20% minimum */
export const PLATFORM_MARGIN_MULTIPLIER = 1.20;

/**
 * Auto-scaling configuration for Keep game servers.
 * Empty Keeps spin down to zero; spin up on player entry (5-15 seconds).
 */
export interface KeepAutoScaleConfig {
  /** Whether auto-scaling is enabled (SHOULD always be true) */
  enabled: boolean;
  /** Minutes of inactivity before spinning down to zero */
  idleTimeoutMinutes: number;
  /** Estimated spin-up time (seconds) for cold start */
  coldStartSeconds: number;
  /** Whether to show a "Loading..." screen during cold start */
  showLoadingScreen: boolean;
  /** Maximum hours per day the Keep is expected to be active */
  expectedActiveHoursPerDay: number;
}

/** Default auto-scale config (aggressive — spin down after 15 min idle) */
export const DEFAULT_AUTOSCALE_CONFIG: KeepAutoScaleConfig = {
  enabled: true,
  idleTimeoutMinutes: 15,
  coldStartSeconds: 10,
  showLoadingScreen: true,
  expectedActiveHoursPerDay: 8,
};

/**
 * Calculate whether a Keep lease price covers infrastructure costs
 * with the required platform margin (Cost + 20%).
 */
export function calculateKeepMargin(
  capacityTier: KeepCapacityTier,
  leasePriceCredits: number,
  creditsToUSDRate: number = 0.01,
): {
  infraCostUSD: number;
  leasePriceUSD: number;
  marginPercent: number;
  meetsMinimumMargin: boolean;
  estimatedAutoScaleSavings: number;
} {
  const infra = KEEP_INFRASTRUCTURE_COSTS[capacityTier];
  const leasePriceUSD = leasePriceCredits * creditsToUSDRate;
  const marginPercent = infra.monthlyCostUSD > 0
    ? ((leasePriceUSD - infra.monthlyCostUSD) / infra.monthlyCostUSD) * 100
    : 100;

  // Auto-scale savings: if active only 8/24 hours, save ~66% on compute
  const activeRatio = DEFAULT_AUTOSCALE_CONFIG.expectedActiveHoursPerDay / 24;
  const estimatedAutoScaleSavings = infra.monthlyCostUSD * (1 - activeRatio);

  return {
    infraCostUSD: infra.monthlyCostUSD,
    leasePriceUSD,
    marginPercent: Math.round(marginPercent * 100) / 100,
    meetsMinimumMargin: marginPercent >= 20,
    estimatedAutoScaleSavings: Math.round(estimatedAutoScaleSavings * 100) / 100,
  };
}

/**
 * Calculate breakeven occupancy for a Keep — how many active hours
 * per day are needed to justify the infrastructure cost.
 */
export function calculateBreakevenOccupancy(
  capacityTier: KeepCapacityTier,
  leasePriceCredits: number,
  creditsToUSDRate: number = 0.01,
): { breakevenHoursPerDay: number; isAlwaysProfitable: boolean } {
  const infra = KEEP_INFRASTRUCTURE_COSTS[capacityTier];
  const leasePriceUSD = leasePriceCredits * creditsToUSDRate;

  if (leasePriceUSD >= infra.monthlyCostUSD) {
    return { breakevenHoursPerDay: 0, isAlwaysProfitable: true };
  }

  // Without auto-scaling, how many hours would we need to charge for?
  const breakevenHoursPerDay = (infra.monthlyCostUSD / leasePriceUSD) * 24;
  return {
    breakevenHoursPerDay: Math.round(breakevenHoursPerDay * 10) / 10,
    isAlwaysProfitable: false,
  };
}

// ── NPC Shopkeeper Transaction Architecture (R-013 Integration) ───────────
//
// Per Rook research R-013: NPC Shopkeeper Implementation Patterns.
//
// Architecture: Hybrid Model (Roblox Backend + Second Life Frontend)
//
//   FRONTEND (Phase MimicTrunk game world):
//     - NPC is a visual entity that players interact with
//     - Displays inventory UI when player clicks/approaches
//     - Plays "Thank You" animation on successful purchase
//
//   BACKEND (Supabase / Immutable Ledger):
//     - Actual inventory and pricing stored in LB central database
//     - NOT on the Keep's game server (prevents memory exploits)
//     - All transactions go through Edge Functions with atomicity
//
// Transaction Flow (R-013):
//   1. INTENT:    Player clicks "Buy" on NPC
//   2. LOCK:      Edge Function locks the item in database (prevents double-buy)
//   3. DEBIT:     Edge Function deducts Credits from buyer
//   4. CREDIT:    Edge Function credits NPC owner (minus platform tax)
//   5. LEDGER:    Transaction written to Immutable Ledger
//   6. FULFILL:   Edge Function returns "Success" → NPC plays animation
//
// Key anti-exploit measures:
//   - Inventory lives in DATABASE, not game server memory
//   - Item locks prevent race conditions (two players buying last item)
//   - Members manage inventory via web UI (Cephas/Library), NOT in-game
//   - "Window Shopper" mode: browse without locking player character
//   - "Offline Ledger": sales while owner is offline → notification in Library

/** NPC transaction states */
export type NPCTransactionState =
  | "initiated"     // player clicked "Buy"
  | "item_locked"   // item reserved in database
  | "debited"       // buyer's Credits deducted
  | "credited"      // seller's Credits added (minus tax)
  | "fulfilled"     // item transferred, NPC animation played
  | "failed"        // transaction rolled back
  | "refunded";     // post-sale refund processed

/** Inventory item types that NPC Shopkeepers can sell */
export type NPCInventoryItemType =
  | "special_deck_card"
  | "cosmetic_item"
  | "guild_merchandise"
  | "consumable_boost"
  | "recipe_scroll"
  | "crafting_material";

/** Platform tax rate on NPC sales */
export const NPC_PLATFORM_TAX_RATE = 0.05; // 5% platform cut

/** Maximum items an NPC can have listed at once */
export const MAX_NPC_LISTINGS = 100;

/** Maximum price for a single NPC item (Credits) */
export const MAX_NPC_ITEM_PRICE = 50_000;

/** Item lock timeout (seconds) — prevents permanent locks on failed transactions */
export const ITEM_LOCK_TIMEOUT_SECONDS = 30;

/**
 * Stall inventory item — what an NPC Shopkeeper has for sale.
 * Stored in the central database, NOT in game server memory.
 */
export interface StallInventoryItem {
  /** Item listing ID */
  id: string;
  /** NPC Shopkeeper ID */
  shopkeeperId: string;
  /** Item type */
  itemType: NPCInventoryItemType;
  /** Item name */
  itemName: string;
  /** Item description */
  itemDescription: string;
  /** Price in Credits */
  priceCredits: number;
  /** Quantity available (0 = sold out) */
  quantityAvailable: number;
  /** Whether quantity is unlimited (restocking NPC) */
  isUnlimited: boolean;
  /** Whether the item is currently locked (mid-transaction) */
  isLocked: boolean;
  /** Lock expires at (ISO timestamp, null if not locked) */
  lockExpiresAt: string | null;
  /** Locked by member ID (null if not locked) */
  lockedByMemberId: string | null;
  /** Total units sold */
  totalSold: number;
  /** Listed at */
  listedAt: string;
  /** Whether the listing is active */
  isActive: boolean;
}

/**
 * NPC transaction record — one entry per purchase attempt.
 * Tracks the full lifecycle from intent to fulfillment.
 */
export interface NPCTransaction {
  /** Transaction ID */
  id: string;
  /** NPC Shopkeeper ID */
  shopkeeperId: string;
  /** Buyer member ID */
  buyerMemberId: string;
  /** Seller (NPC owner) member ID */
  sellerMemberId: string;
  /** Item listing ID */
  itemId: string;
  /** Quantity purchased */
  quantity: number;
  /** Total price (Credits) */
  totalPrice: number;
  /** Platform tax deducted (Credits) */
  platformTax: number;
  /** Net amount to seller (Credits) */
  sellerReceives: number;
  /** Transaction state */
  state: NPCTransactionState;
  /** Idempotency key */
  idempotencyKey: string;
  /** Ledger entry ID */
  ledgerEntryId: string;
  /** Error message (if failed) */
  errorMessage?: string;
  /** Transaction started at */
  startedAt: string;
  /** Transaction completed at */
  completedAt?: string;
}

/**
 * Offline sale notification — sent to NPC owner when a sale happens
 * while they are not logged in.
 */
export interface OfflineSaleNotification {
  /** Notification ID */
  id: string;
  /** NPC Shopkeeper ID */
  shopkeeperId: string;
  /** NPC display name */
  shopkeeperName: string;
  /** Owner member ID */
  ownerMemberId: string;
  /** Item sold */
  itemName: string;
  /** Quantity sold */
  quantity: number;
  /** Credits earned (after tax) */
  creditsEarned: number;
  /** Buyer name (display) */
  buyerName: string;
  /** Sale timestamp */
  soldAt: string;
  /** Whether the owner has seen this notification */
  isRead: boolean;
}

/**
 * Calculate the NPC transaction breakdown for a purchase.
 */
export function calculateNPCTransaction(
  pricePerUnit: number,
  quantity: number,
): {
  totalPrice: number;
  platformTax: number;
  sellerReceives: number;
} {
  const totalPrice = pricePerUnit * quantity;
  const platformTax = Math.ceil(totalPrice * NPC_PLATFORM_TAX_RATE);
  const sellerReceives = totalPrice - platformTax;

  return { totalPrice, platformTax, sellerReceives };
}

/**
 * Check if an item lock has expired (stale lock from failed transaction).
 */
export function isItemLockExpired(item: StallInventoryItem): boolean {
  if (!item.isLocked || !item.lockExpiresAt) return true;
  return Date.now() > new Date(item.lockExpiresAt).getTime();
}

/**
 * Create an item lock with timeout (prevents permanent locks).
 */
export function createItemLock(
  itemId: string,
  buyerMemberId: string,
): { lockExpiresAt: string; lockedByMemberId: string } {
  const expiresAt = new Date(Date.now() + ITEM_LOCK_TIMEOUT_SECONDS * 1_000);
  return {
    lockExpiresAt: expiresAt.toISOString(),
    lockedByMemberId: buyerMemberId,
  };
}

/**
 * Validate that an NPC listing meets all platform requirements.
 */
export function validateNPCListing(
  priceCredits: number,
  quantity: number,
  currentListingCount: number,
): { valid: boolean; reason?: string } {
  if (priceCredits <= 0) {
    return { valid: false, reason: "Price must be positive." };
  }
  if (priceCredits > MAX_NPC_ITEM_PRICE) {
    return { valid: false, reason: `Maximum item price is ${MAX_NPC_ITEM_PRICE} Credits.` };
  }
  if (quantity <= 0) {
    return { valid: false, reason: "Quantity must be positive." };
  }
  if (currentListingCount >= MAX_NPC_LISTINGS) {
    return { valid: false, reason: `Maximum listings (${MAX_NPC_LISTINGS}) reached.` };
  }
  return { valid: true };
}

// ── Guild Management Functions ─────────────────────────────────────────────

/**
 * Create a new Guild with its default Phase MimicTrunk.
 * Every Guild gets a Phase -- they pay for it.
 */
export function createGuild(
  name: string,
  description: string,
  founderId: string,
  initialMemberIds: string[],
): { guild: Guild; isValid: boolean; reason?: string } {
  const allMembers = [founderId, ...initialMemberIds.filter(id => id !== founderId)];

  if (allMembers.length < MIN_GUILD_MEMBERS) {
    return {
      guild: null as unknown as Guild,
      isValid: false,
      reason: `A Guild requires at least ${MIN_GUILD_MEMBERS} members. Currently have ${allMembers.length}.`,
    };
  }

  const now = new Date().toISOString();
  const guildId = `guild-${Date.now()}`;

  const guild: Guild = {
    id: guildId,
    name,
    description,
    status: "active",
    leaderId: founderId,
    officerIds: [],
    memberIds: allMembers,
    memberCount: allMembers.length,
    tribeIds: [],
    phaseMimicTrunkId: `pmt-guild-${guildId}-${Date.now()}`,
    monthlyPhaseFee: DEFAULT_GUILD_PHASE_FEE,
    keepIds: [],
    createdAt: now,
    updatedAt: now,
    ledgerSectionId: `ledger-guild-${guildId}`,
  };

  return { guild, isValid: true };
}

/**
 * Create a Tribe within a Guild.
 */
export function createTribe(
  name: string,
  description: string,
  guildId: string,
  leaderId: string,
  initialMemberIds: string[],
  options?: {
    parentTribeId?: string;
    isChapter?: boolean;
    nestingDepth?: number;
  },
): { tribe: Tribe; isValid: boolean; reason?: string } {
  const allMembers = [leaderId, ...initialMemberIds.filter(id => id !== leaderId)];

  if (allMembers.length < MIN_TRIBE_MEMBERS) {
    return {
      tribe: null as unknown as Tribe,
      isValid: false,
      reason: `A Tribe requires at least ${MIN_TRIBE_MEMBERS} members. Currently have ${allMembers.length}.`,
    };
  }

  const depth = options?.nestingDepth ?? 1;
  if (depth > MAX_TRIBE_NESTING_DEPTH) {
    return {
      tribe: null as unknown as Tribe,
      isValid: false,
      reason: `Maximum nesting depth is ${MAX_TRIBE_NESTING_DEPTH}. Requested depth: ${depth}.`,
    };
  }

  const now = new Date().toISOString();
  const tribeId = `tribe-${guildId}-${Date.now()}`;

  const tribe: Tribe = {
    id: tribeId,
    name,
    description,
    guildId,
    status: "active",
    leaderId,
    memberIds: allMembers,
    memberCount: allMembers.length,
    isChapter: options?.isChapter ?? false,
    parentTribeId: options?.parentTribeId,
    childTribeIds: [],
    nestingDepth: depth,
    keepIds: [],
    createdAt: now,
    updatedAt: now,
    ledgerSectionId: `ledger-tribe-${tribeId}`,
  };

  return { tribe, isValid: true };
}

/**
 * Assign a Phase MimicTrunk to a Tribe (optional, additional cost).
 */
export function assignTribePhase(
  tribe: Tribe,
  trunkId: string,
  monthlyFee: number,
): void {
  tribe.phaseMimicTrunkId = trunkId;
  tribe.monthlyPhaseFee = monthlyFee;
  tribe.updatedAt = new Date().toISOString();
}

/**
 * Check if a member can join a Guild.
 */
export function canJoinGuild(
  guild: Guild,
  memberId: string,
): { allowed: boolean; reason?: string } {
  if (guild.status !== "active") {
    return { allowed: false, reason: "This Guild is not currently active." };
  }

  if (guild.memberIds.includes(memberId)) {
    return { allowed: false, reason: "Already a member of this Guild." };
  }

  return { allowed: true };
}

/**
 * Check if a member can form a Tribe within a Guild.
 */
export function canFormTribe(
  guild: Guild,
  memberId: string,
): { allowed: boolean; reason?: string } {
  if (!guild.memberIds.includes(memberId)) {
    return { allowed: false, reason: "Must be a Guild member to form a Tribe." };
  }

  if (guild.tribeIds.length >= MAX_TRIBES_PER_GUILD) {
    return { allowed: false, reason: `This Guild has reached the maximum of ${MAX_TRIBES_PER_GUILD} Tribes.` };
  }

  if (guild.status !== "active") {
    return { allowed: false, reason: "This Guild is not currently active." };
  }

  return { allowed: true };
}

/**
 * Validate that a Tribe's rules comply with its Guild's rules.
 * (Placeholder — actual rule validation would be more complex.)
 */
export function validateGovernanceCompliance(
  tribe: Tribe,
  guild: Guild,
): { compliant: boolean; violations: string[] } {
  const violations: string[] = [];

  // Tribe leader must be a guild member
  if (!guild.memberIds.includes(tribe.leaderId)) {
    violations.push("Tribe leader must be a member of the parent Guild.");
  }

  // All tribe members must be guild members
  for (const memberId of tribe.memberIds) {
    if (!guild.memberIds.includes(memberId)) {
      violations.push(`Tribe member ${memberId} is not a member of the parent Guild.`);
    }
  }

  // Tribe must belong to the correct guild
  if (tribe.guildId !== guild.id) {
    violations.push("Tribe's guildId does not match the provided Guild.");
  }

  return {
    compliant: violations.length === 0,
    violations,
  };
}

/**
 * Get the full governance hierarchy for a Tribe.
 * Returns: Guild -> Tribe -> Sub-tribe chain.
 */
export function getGovernanceHierarchy(
  tribeId: string,
  guild: Guild,
  allTribes: Tribe[],
): { guild: Guild; chain: Tribe[] } {
  const chain: Tribe[] = [];
  let current = allTribes.find(t => t.id === tribeId);

  while (current) {
    chain.unshift(current);
    if (current.parentTribeId) {
      current = allTribes.find(t => t.id === current!.parentTribeId);
    } else {
      break;
    }
  }

  return { guild, chain };
}

/**
 * Calculate total monthly Phase fees for a Guild and all its Tribes.
 */
export function calculateTotalPhaseFees(
  guild: Guild,
  tribes: Tribe[],
): {
  guildFee: number;
  tribeFees: Array<{ tribeId: string; tribeName: string; fee: number }>;
  totalMonthly: number;
} {
  const tribeFees = tribes
    .filter(t => t.guildId === guild.id && t.monthlyPhaseFee)
    .map(t => ({
      tribeId: t.id,
      tribeName: t.name,
      fee: t.monthlyPhaseFee!,
    }));

  const totalTribeFees = tribeFees.reduce((sum, t) => sum + t.fee, 0);

  return {
    guildFee: guild.monthlyPhaseFee,
    tribeFees,
    totalMonthly: guild.monthlyPhaseFee + totalTribeFees,
  };
}
