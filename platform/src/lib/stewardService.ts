/**
 * Steward Service — Interfaces, sample data, and Supabase stubs
 * for the Steward Command Post dashboard.
 *
 * Steward System: Manage campaigns end-to-end, pledge Marks as skin in the game.
 * Tiers: Apprentice → Journeyman → Master Steward → Grand Steward
 *
 * SEC: All compensation is deferred compensation for services rendered, not securities.
 */

// ============================================================================
// TYPES
// ============================================================================

export type StewardTier = 'apprentice' | 'journeyman' | 'master_steward' | 'grand_steward';
export type CampaignStatus = 'active' | 'completed' | 'failed';
export type PledgeStatus = 'escrowed' | 'released' | 'absorbed';

export interface StewardProfile {
  id: string;
  userId: string;
  displayName: string;
  tier: StewardTier;
  totalProjectsManaged: number;
  successfulProjects: number;
  failedProjects: number;
  successRate: number;
  totalMarksPledged: number;
  totalMarksReleased: number;
  totalDeferredCompensation: number;
  pendingCompensation: number;
  concurrentLimit: number;
  maxPledgePerProject: number;
  joinedAt: string;
}

export interface TriSourceFunding {
  stewardPledged: number;
  bandWagonBacked: number;
  lbAllocationPool: number;
  total: number;
}

export interface Campaign {
  id: string;
  name: string;
  projectId: string;
  projectLink: string;
  status: CampaignStatus;
  funding: TriSourceFunding;
  pledgeRatio: number; // Steward's pledge as percentage of total
  deferredCompensation: number;
  compensationStatus: 'pending' | 'paid' | 'forfeited';
  pizzaOvenGroup: string | null; // null = not batched
  startedAt: string;
  completedAt: string | null;
}

export interface PledgedMarkEntry {
  id: string;
  campaignId: string;
  campaignName: string;
  amountPledged: number;
  status: PledgeStatus;
  releasedAmount: number;
  date: string;
}

export interface DeferredCompensationSummary {
  totalEarned: number;
  totalPending: number;
  fromCompletedCampaigns: number;
  fromActiveCampaigns: number;
}

export interface PizzaOvenGroup {
  groupName: string;
  campaigns: string[];
  sharedInfrastructure: string;
  marginalCostSavings: number; // percentage
}

// ============================================================================
// TIER CONFIGURATION
// ============================================================================

export const STEWARD_TIERS: { key: StewardTier; label: string; minProjects: number; minSuccessRate: number }[] = [
  { key: 'apprentice', label: 'Apprentice', minProjects: 0, minSuccessRate: 0 },
  { key: 'journeyman', label: 'Journeyman', minProjects: 3, minSuccessRate: 0.6 },
  { key: 'master_steward', label: 'Master Steward', minProjects: 10, minSuccessRate: 0.75 },
  { key: 'grand_steward', label: 'Grand Steward', minProjects: 25, minSuccessRate: 0.85 },
];

// ============================================================================
// SAMPLE DATA
// ============================================================================

export const SAMPLE_STEWARD_PROFILE: StewardProfile = {
  id: 'steward-001',
  userId: 'user-001',
  displayName: 'Marcus Webb',
  tier: 'journeyman',
  totalProjectsManaged: 7,
  successfulProjects: 5,
  failedProjects: 1,
  successRate: 0.714,
  totalMarksPledged: 1240,
  totalMarksReleased: 890,
  totalDeferredCompensation: 445,
  pendingCompensation: 180,
  concurrentLimit: 3,
  maxPledgePerProject: 500,
  joinedAt: '2025-11-15T00:00:00Z',
};

export const SAMPLE_CAMPAIGNS: Campaign[] = [
  {
    id: 'campaign-001',
    name: 'Artisan Lamp Workshop — LED Collection',
    projectId: 'proj-001',
    projectLink: '/project/proj-001',
    status: 'active',
    funding: {
      stewardPledged: 320,
      bandWagonBacked: 180,
      lbAllocationPool: 100,
      total: 600,
    },
    pledgeRatio: 0.533,
    deferredCompensation: 0,
    compensationStatus: 'pending',
    pizzaOvenGroup: 'maker-batch-q1',
    startedAt: '2026-02-10T00:00:00Z',
    completedAt: null,
  },
  {
    id: 'campaign-002',
    name: 'Hexagonal Planter Set — Desktop Edition',
    projectId: 'proj-002',
    projectLink: '/project/proj-002',
    status: 'active',
    funding: {
      stewardPledged: 200,
      bandWagonBacked: 250,
      lbAllocationPool: 50,
      total: 500,
    },
    pledgeRatio: 0.4,
    deferredCompensation: 0,
    compensationStatus: 'pending',
    pizzaOvenGroup: 'maker-batch-q1',
    startedAt: '2026-02-20T00:00:00Z',
    completedAt: null,
  },
  {
    id: 'campaign-003',
    name: 'Community Cookbook — Bread Edition',
    projectId: 'proj-003',
    projectLink: '/project/proj-003',
    status: 'completed',
    funding: {
      stewardPledged: 400,
      bandWagonBacked: 300,
      lbAllocationPool: 100,
      total: 800,
    },
    pledgeRatio: 0.5,
    deferredCompensation: 200,
    compensationStatus: 'paid',
    pizzaOvenGroup: null,
    startedAt: '2025-12-01T00:00:00Z',
    completedAt: '2026-01-28T00:00:00Z',
  },
  {
    id: 'campaign-004',
    name: 'Solar Panel Mounting Kit — Prototype',
    projectId: 'proj-004',
    projectLink: '/project/proj-004',
    status: 'failed',
    funding: {
      stewardPledged: 320,
      bandWagonBacked: 160,
      lbAllocationPool: 120,
      total: 600,
    },
    pledgeRatio: 0.533,
    deferredCompensation: 0,
    compensationStatus: 'forfeited',
    pizzaOvenGroup: null,
    startedAt: '2025-10-15T00:00:00Z',
    completedAt: '2025-12-30T00:00:00Z',
  },
];

export const SAMPLE_PLEDGED_MARKS: PledgedMarkEntry[] = [
  {
    id: 'pledge-001',
    campaignId: 'campaign-001',
    campaignName: 'Artisan Lamp Workshop — LED Collection',
    amountPledged: 320,
    status: 'escrowed',
    releasedAmount: 0,
    date: '2026-02-10',
  },
  {
    id: 'pledge-002',
    campaignId: 'campaign-002',
    campaignName: 'Hexagonal Planter Set — Desktop Edition',
    amountPledged: 200,
    status: 'escrowed',
    releasedAmount: 0,
    date: '2026-02-20',
  },
  {
    id: 'pledge-003',
    campaignId: 'campaign-003',
    campaignName: 'Community Cookbook — Bread Edition',
    amountPledged: 400,
    status: 'released',
    releasedAmount: 400,
    date: '2025-12-01',
  },
  {
    id: 'pledge-004',
    campaignId: 'campaign-004',
    campaignName: 'Solar Panel Mounting Kit — Prototype',
    amountPledged: 320,
    status: 'absorbed',
    releasedAmount: 0,
    date: '2025-10-15',
  },
];

export const SAMPLE_PIZZA_OVEN_GROUPS: PizzaOvenGroup[] = [
  {
    groupName: 'maker-batch-q1',
    campaigns: ['campaign-001', 'campaign-002'],
    sharedInfrastructure: '3D Printing Lab + Packaging Line',
    marginalCostSavings: 22,
  },
];

export const SAMPLE_DEFERRED_COMPENSATION: DeferredCompensationSummary = {
  totalEarned: 445,
  totalPending: 180,
  fromCompletedCampaigns: 445,
  fromActiveCampaigns: 180,
};

// ============================================================================
// SUPABASE-BACKED SERVICE FUNCTIONS — sample fallback on error/empty
// ============================================================================

import { supabase } from "@/integrations/supabase/client";

function mapDbProfile(row: any): StewardProfile {
  const completed = Number(row.campaigns_completed ?? 0);
  const totalPledged = Number(row.total_pledged ?? 0);
  const totalReleased = Number(row.total_released ?? 0);
  const totalAbsorbed = Number(row.total_absorbed ?? 0);
  const failed = Math.round(totalAbsorbed > 0 ? totalAbsorbed / (totalPledged || 1) * completed : 0);
  const successful = completed - failed;
  const rate = completed > 0 ? successful / completed : 0;
  const tier = (row.tier ?? "apprentice") as StewardTier;
  const tierConfig = STEWARD_TIERS.find((t) => t.key === tier);
  const concurrentLimit = tier === "grand_steward" ? 5 : tier === "master_steward" ? 4 : 3;
  const maxPledge = tier === "grand_steward" ? 1000 : tier === "master_steward" ? 750 : 500;

  return {
    id: row.id,
    userId: row.user_id,
    displayName: tierConfig?.label ?? "Steward",
    tier,
    totalProjectsManaged: completed,
    successfulProjects: successful,
    failedProjects: failed,
    successRate: rate,
    totalMarksPledged: totalPledged,
    totalMarksReleased: totalReleased,
    totalDeferredCompensation: totalReleased * 0.5,
    pendingCompensation: 0,
    concurrentLimit,
    maxPledgePerProject: maxPledge,
    joinedAt: row.created_at ?? "",
  };
}

function mapDbCampaign(row: any): Campaign {
  const pledged = Number(row.pledged_marks ?? 0);
  const backed = Number(row.backed_marks_received ?? 0);
  const lbPool = Number(row.lb_pool_allocation ?? 0);
  const total = pledged + backed + lbPool;

  return {
    id: row.id,
    name: `Campaign ${(row.project_id ?? "").slice(0, 8)}`,
    projectId: row.project_id ?? "",
    projectLink: `/project/${row.project_id ?? ""}`,
    status: (row.status ?? "active") as CampaignStatus,
    funding: { stewardPledged: pledged, bandWagonBacked: backed, lbAllocationPool: lbPool, total },
    pledgeRatio: total > 0 ? pledged / total : 0,
    deferredCompensation: Number(row.deferred_compensation ?? 0),
    compensationStatus: row.status === "completed" ? "paid" : row.status === "failed" ? "forfeited" : "pending",
    pizzaOvenGroup: null,
    startedAt: row.created_at ?? "",
    completedAt: null,
  };
}

export async function fetchStewardProfile(userId: string): Promise<StewardProfile | null> {
  try {
    const { data, error } = await supabase
      .from("steward_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    if (data) return mapDbProfile(data);
  } catch (err) {
    console.warn("[Steward] Profile DB fetch failed, using sample", err);
  }
  return SAMPLE_STEWARD_PROFILE;
}

export async function fetchStewardCampaigns(userId: string): Promise<Campaign[]> {
  try {
    const { data: profile } = await supabase
      .from("steward_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (profile) {
      const { data, error } = await supabase
        .from("steward_campaigns")
        .select("*")
        .eq("steward_id", profile.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) return data.map(mapDbCampaign);
    }
  } catch (err) {
    console.warn("[Steward] Campaigns DB fetch failed, using sample", err);
  }
  return SAMPLE_CAMPAIGNS;
}

export async function fetchPledgedMarks(userId: string): Promise<PledgedMarkEntry[]> {
  try {
    const campaigns = await fetchStewardCampaigns(userId);
    if (campaigns !== SAMPLE_CAMPAIGNS) {
      return campaigns.map((c, i) => ({
        id: `pledge-${i}`,
        campaignId: c.id,
        campaignName: c.name,
        amountPledged: c.funding.stewardPledged,
        status: (c.status === "completed" ? "released" : c.status === "failed" ? "absorbed" : "escrowed") as PledgeStatus,
        releasedAmount: c.status === "completed" ? c.funding.stewardPledged : 0,
        date: c.startedAt.split("T")[0],
      }));
    }
  } catch (err) {
    console.warn("[Steward] Pledged marks derivation failed, using sample", err);
  }
  return SAMPLE_PLEDGED_MARKS;
}

export async function fetchPizzaOvenGroups(_userId: string): Promise<PizzaOvenGroup[]> {
  return SAMPLE_PIZZA_OVEN_GROUPS;
}

export async function fetchDeferredCompensation(userId: string): Promise<DeferredCompensationSummary> {
  try {
    const campaigns = await fetchStewardCampaigns(userId);
    if (campaigns !== SAMPLE_CAMPAIGNS) {
      const completed = campaigns.filter((c) => c.status === "completed");
      const active = campaigns.filter((c) => c.status === "active");
      const totalEarned = completed.reduce((s, c) => s + c.deferredCompensation, 0);
      const totalPending = active.reduce((s, c) => s + c.funding.stewardPledged * 0.5, 0);
      return {
        totalEarned,
        totalPending,
        fromCompletedCampaigns: totalEarned,
        fromActiveCampaigns: totalPending,
      };
    }
  } catch (err) {
    console.warn("[Steward] Compensation derivation failed, using sample", err);
  }
  return SAMPLE_DEFERRED_COMPENSATION;
}
