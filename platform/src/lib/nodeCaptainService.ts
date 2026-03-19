/**
 * Node Captain Service — Production Campaign Management
 * =====================================================
 * "Pick Up The Tab" — Fund production, manage campaigns, STAMP verification.
 * Cost+20% floor. Backed Marks collateralized by Joules.
 */

import { supabase } from "@/integrations/supabase/client";

// ============================================================================
// TYPES
// ============================================================================

export type CaptainStatus = "active" | "inactive" | "probation";
export type CampaignStatus = "planning" | "funded" | "in_production" | "quality_check" | "completed" | "cancelled";

export interface NodeCaptainProfile {
  id: string;
  userId: string;
  nodeName: string;
  nodeLocation: string;
  bio: string | null;
  campaignsCompleted: number;
  campaignsActive: number;
  totalBackedMarksUsed: number;
  joulesCollateralizing: number;
  totalUnitsProduced: number;
  averageQualityScore: number;
  status: CaptainStatus;
  createdAt: string;
}

export interface ProductionCampaign {
  id: string;
  captainUserId: string;
  productName: string;
  productDescription: string;
  unitsTarget: number;
  unitsCompleted: number;
  costPerUnit: number;
  pricePerUnit: number;
  backedMarksAllocated: number;
  joulesGacking: number;
  qualityCheckpoints: any[];
  status: CampaignStatus;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface ProductionStamp {
  id: string;
  campaignId: string;
  stamperUserId: string;
  unitsVerified: number;
  qualityScore: number;
  notes: string | null;
  xpAwarded: number;
  createdAt: string;
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

export const SAMPLE_CAPTAINS: NodeCaptainProfile[] = [
  { id: "nc1", userId: "u1", nodeName: "Boise Maker Hub", nodeLocation: "Boise, ID", bio: "Veteran maker with 5 completed campaigns", campaignsCompleted: 5, campaignsActive: 1, totalBackedMarksUsed: 2500, joulesCollateralizing: 1200, totalUnitsProduced: 450, averageQualityScore: 4.6, status: "active", createdAt: "2026-01-15T00:00:00Z" },
  { id: "nc2", userId: "u2", nodeName: "Portland Print Lab", nodeLocation: "Portland, OR", bio: "New node captain, excited to start", campaignsCompleted: 0, campaignsActive: 0, totalBackedMarksUsed: 0, joulesCollateralizing: 0, totalUnitsProduced: 0, averageQualityScore: 0, status: "active", createdAt: "2026-03-10T00:00:00Z" },
  { id: "nc3", userId: "u3", nodeName: "Denver Craft Works", nodeLocation: "Denver, CO", bio: "On probation after quality issue", campaignsCompleted: 2, campaignsActive: 0, totalBackedMarksUsed: 800, joulesCollateralizing: 0, totalUnitsProduced: 120, averageQualityScore: 3.2, status: "probation", createdAt: "2026-02-01T00:00:00Z" },
];

export const SAMPLE_CAMPAIGNS: ProductionCampaign[] = [
  { id: "pc1", captainUserId: "u1", productName: "HexIsle River Tile Set", productDescription: "Standard 6-pack river channel tiles", unitsTarget: 200, unitsCompleted: 0, costPerUnit: 3.00, pricePerUnit: 3.60, backedMarksAllocated: 720, joulesGacking: 360, qualityCheckpoints: [], status: "planning", startedAt: null, completedAt: null, createdAt: "2026-03-15T00:00:00Z" },
  { id: "pc2", captainUserId: "u1", productName: "Sourdough Starter Kits", productDescription: "Organic sourdough starter with instructions", unitsTarget: 100, unitsCompleted: 45, costPerUnit: 8.00, pricePerUnit: 9.60, backedMarksAllocated: 960, joulesGacking: 480, qualityCheckpoints: [{ at: 25, passed: true }, { at: 50, passed: false }], status: "in_production", startedAt: "2026-03-12T00:00:00Z", completedAt: null, createdAt: "2026-03-10T00:00:00Z" },
  { id: "pc3", captainUserId: "u1", productName: "Leather Bookmark Batch", productDescription: "Hand-cut leather bookmarks", unitsTarget: 50, unitsCompleted: 50, costPerUnit: 5.00, pricePerUnit: 6.00, backedMarksAllocated: 300, joulesGacking: 150, qualityCheckpoints: [{ at: 25, passed: true }, { at: 50, passed: true }], status: "quality_check", startedAt: "2026-03-08T00:00:00Z", completedAt: null, createdAt: "2026-03-05T00:00:00Z" },
  { id: "pc4", captainUserId: "u1", productName: "Wooden Spoon Collection", productDescription: "Hand-carved wooden kitchen spoons", unitsTarget: 75, unitsCompleted: 75, costPerUnit: 12.00, pricePerUnit: 14.40, backedMarksAllocated: 1080, joulesGacking: 540, qualityCheckpoints: [{ at: 25, passed: true }, { at: 50, passed: true }, { at: 75, passed: true }], status: "completed", startedAt: "2026-02-15T00:00:00Z", completedAt: "2026-03-01T00:00:00Z", createdAt: "2026-02-10T00:00:00Z" },
];

export const SAMPLE_STAMPS: ProductionStamp[] = [
  { id: "ps1", campaignId: "pc4", stamperUserId: "u2", unitsVerified: 25, qualityScore: 4.5, notes: "Excellent craftsmanship", xpAwarded: 112.5, createdAt: "2026-03-01T10:00:00Z" },
  { id: "ps2", campaignId: "pc4", stamperUserId: "u3", unitsVerified: 25, qualityScore: 4.2, notes: "Good quality, minor variations", xpAwarded: 105, createdAt: "2026-03-01T11:00:00Z" },
  { id: "ps3", campaignId: "pc4", stamperUserId: "u2", unitsVerified: 25, qualityScore: 4.8, notes: "Outstanding finish", xpAwarded: 120, createdAt: "2026-03-01T14:00:00Z" },
];

// ============================================================================
// FETCH FUNCTIONS
// ============================================================================

export async function fetchNodeCaptains(): Promise<NodeCaptainProfile[]> {
  try {
    const { data, error } = await supabase
      .from("node_captain_profiles")
      .select("*")
      .order("campaigns_completed", { ascending: false });
    if (error || !data?.length) return SAMPLE_CAPTAINS;
    return data.map(mapCaptain);
  } catch { return SAMPLE_CAPTAINS; }
}

export async function fetchProductionCampaigns(): Promise<ProductionCampaign[]> {
  try {
    const { data, error } = await supabase
      .from("production_campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data?.length) return SAMPLE_CAMPAIGNS;
    return data.map(mapCampaign);
  } catch { return SAMPLE_CAMPAIGNS; }
}

export async function fetchStamps(campaignId: string): Promise<ProductionStamp[]> {
  try {
    const { data, error } = await supabase
      .from("production_stamps")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: false });
    if (error || !data?.length) return SAMPLE_STAMPS.filter(s => s.campaignId === campaignId);
    return data.map(mapStamp);
  } catch { return SAMPLE_STAMPS.filter(s => s.campaignId === campaignId); }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

export async function createCampaign(campaign: {
  captainUserId: string; productName: string; productDescription: string;
  unitsTarget: number; costPerUnit: number; pricePerUnit: number;
  backedMarksAllocated: number; joulesGacking: number;
}): Promise<ProductionCampaign | null> {
  try {
    const { data, error } = await supabase.from("production_campaigns").insert({
      captain_user_id: campaign.captainUserId,
      product_name: campaign.productName,
      product_description: campaign.productDescription,
      units_target: campaign.unitsTarget,
      cost_per_unit: campaign.costPerUnit,
      price_per_unit: campaign.pricePerUnit,
      backed_marks_allocated: campaign.backedMarksAllocated,
      joules_backing: campaign.joulesGacking,
    }).select().single();
    if (error || !data) return null;
    return mapCampaign(data);
  } catch { return null; }
}

export async function updateCampaignStatus(campaignId: string, status: CampaignStatus): Promise<boolean> {
  try {
    const updates: Record<string, any> = { status };
    if (status === "in_production") updates.started_at = new Date().toISOString();
    if (status === "completed") updates.completed_at = new Date().toISOString();
    const { error } = await supabase.from("production_campaigns").update(updates).eq("id", campaignId);
    return !error;
  } catch { return false; }
}

export async function applyStamp(stamp: {
  campaignId: string; stamperUserId: string; unitsVerified: number;
  qualityScore: number; notes?: string;
}): Promise<ProductionStamp | null> {
  try {
    const xpAwarded = stamp.unitsVerified * stamp.qualityScore;
    const { data, error } = await supabase.from("production_stamps").insert({
      campaign_id: stamp.campaignId,
      stamper_user_id: stamp.stamperUserId,
      units_verified: stamp.unitsVerified,
      quality_score: stamp.qualityScore,
      notes: stamp.notes || null,
      xp_awarded: xpAwarded,
    }).select().single();
    if (error || !data) return null;
    return mapStamp(data);
  } catch { return null; }
}

// ============================================================================
// STATS
// ============================================================================

export async function fetchNodeStats(): Promise<{
  activeCaptains: number; activeCampaigns: number;
  totalUnitsProduced: number; avgQuality: number;
}> {
  try {
    const { data: captains, error: ce } = await supabase
      .from("node_captain_profiles")
      .select("status, total_units_produced, average_quality_score");
    if (ce || !captains?.length) {
      return { activeCaptains: 2, activeCampaigns: 1, totalUnitsProduced: 450, avgQuality: 4.2 };
    }
    const active = captains.filter(c => c.status === "active");
    const totalUnits = captains.reduce((sum, c) => sum + (c.total_units_produced || 0), 0);
    const avgQuality = active.length > 0
      ? active.reduce((sum, c) => sum + Number(c.average_quality_score || 0), 0) / active.length
      : 0;
    const { count } = await supabase
      .from("production_campaigns")
      .select("*", { count: "exact", head: true })
      .in("status", ["planning", "funded", "in_production", "quality_check"]);
    return {
      activeCaptains: active.length,
      activeCampaigns: count || 0,
      totalUnitsProduced: totalUnits,
      avgQuality: Math.round(avgQuality * 10) / 10,
    };
  } catch {
    return { activeCaptains: 2, activeCampaigns: 1, totalUnitsProduced: 450, avgQuality: 4.2 };
  }
}

// ============================================================================
// MAPPERS
// ============================================================================

function mapCaptain(row: any): NodeCaptainProfile {
  return {
    id: row.id, userId: row.user_id, nodeName: row.node_name, nodeLocation: row.node_location,
    bio: row.bio, campaignsCompleted: row.campaigns_completed, campaignsActive: row.campaigns_active,
    totalBackedMarksUsed: Number(row.total_backed_marks_used), joulesCollateralizing: Number(row.joules_collateralizing),
    totalUnitsProduced: row.total_units_produced, averageQualityScore: Number(row.average_quality_score),
    status: row.status, createdAt: row.created_at,
  };
}

function mapCampaign(row: any): ProductionCampaign {
  return {
    id: row.id, captainUserId: row.captain_user_id, productName: row.product_name,
    productDescription: row.product_description, unitsTarget: row.units_target,
    unitsCompleted: row.units_completed, costPerUnit: Number(row.cost_per_unit),
    pricePerUnit: Number(row.price_per_unit), backedMarksAllocated: Number(row.backed_marks_allocated),
    joulesGacking: Number(row.joules_backing), qualityCheckpoints: row.quality_checkpoints || [],
    status: row.status, startedAt: row.started_at, completedAt: row.completed_at, createdAt: row.created_at,
  };
}

function mapStamp(row: any): ProductionStamp {
  return {
    id: row.id, campaignId: row.campaign_id, stamperUserId: row.stamper_user_id,
    unitsVerified: row.units_verified, qualityScore: Number(row.quality_score),
    notes: row.notes, xpAwarded: Number(row.xp_awarded), createdAt: row.created_at,
  };
}
