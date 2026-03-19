/**
 * C+20 Reciprocity Service — Fair Pricing Dashboard
 * ==================================================
 * Every product at Cost Plus 20%. Every penny accounted for.
 * 83.3% Creator / 13.3% Platform / 3.3% Gleaner's Corner
 */

import { supabase } from "@/integrations/supabase/client";

// ============================================================================
// TYPES
// ============================================================================

export interface C20Example {
  id: string;
  productName: string;
  category: string;
  baseCost: number;
  finalPrice: number;
  marginAmount: number;
  creatorShare: number;
  platformShare: number;
  gleanersShare: number;
  stewardShare: number;
  createdAt: string;
}

export interface C20Calculation {
  baseCost: number;
  finalPrice: number;
  marginAmount: number;
  creatorShare: number;
  platformShare: number;
  gleanersShare: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const C20_LAWS = [
  { number: 1, title: "The Floor", description: "No product may be priced below Cost+20%. This is the minimum, not the maximum." },
  { number: 2, title: "Transparency", description: "All cost components must be visible to the buyer. No hidden fees, no surprise charges." },
  { number: 3, title: "The Gleaner's Share", description: "3.3% of every margin funds the Gleaner's Corner — the community benefit fund." },
  { number: 4, title: "No Loss Leaders", description: "Selling below cost to gain market share is prohibited. Every transaction must be self-sustaining." },
  { number: 5, title: "Seller Sovereignty", description: "Sellers set prices at or above the floor. The cooperative sets the minimum, not the maximum." },
  { number: 6, title: "Cost Verification", description: "Platform may audit cost claims for accuracy. Honest pricing protects everyone." },
  { number: 7, title: "Toe-Dipping Limits", description: "Per-product participation limits prevent any single buyer from cornering supply." },
  { number: 8, title: "Dollar-for-Dollar Sacrifice", description: "When the cooperative reduces its margin, that savings becomes increased purchasing power for members." },
  { number: 9, title: "The Creator's Majority", description: "83.3% of every margin goes to the creator. The maker always gets the lion's share." },
  { number: 10, title: "No Price Fixing", description: "Sellers compete on quality and service, not on who can undercut the floor." },
  { number: 11, title: "Seasonal Adjustment", description: "Cost inputs may fluctuate seasonally. The C+20 floor adjusts with verified cost changes." },
  { number: 12, title: "Bundle Pricing", description: "Bundles are priced at C+20 of the combined cost, not at the sum of individual C+20 prices." },
  { number: 13, title: "Service Parity", description: "Service-based products follow the same C+20 structure as physical goods." },
  { number: 14, title: "Cross-Border Consistency", description: "C+20 applies regardless of buyer or seller location within the cooperative network." },
  { number: 15, title: "Dispute Resolution", description: "Pricing disputes are handled by the Star Chamber with full cost transparency." },
  { number: 16, title: "Steward Compensation", description: "When a Steward manages a campaign, their deferred compensation comes from the platform share, not the creator share." },
  { number: 17, title: "No Middleman Markup", description: "The cooperative is the only intermediary. No additional markup layers between creator and buyer." },
  { number: 18, title: "Quality Floor", description: "Products that fail STAMP verification cannot be sold. Quality is non-negotiable." },
  { number: 19, title: "Preorder Commitment", description: "All preorders are paid in full before production begins. No speculative manufacturing." },
  { number: 20, title: "The Forever Rule", description: "C+20 is permanent. It does not sunset, phase out, or get replaced by a 'better' model. This is the model." },
];

// ============================================================================
// SAMPLE DATA
// ============================================================================

export const SAMPLE_EXAMPLES: C20Example[] = [
  { id: "1", productName: "Sarah's Sourdough Starter Kit", category: "food", baseCost: 10.00, finalPrice: 12.00, marginAmount: 2.00, creatorShare: 1.67, platformShare: 0.27, gleanersShare: 0.07, stewardShare: 0, createdAt: "2026-03-01" },
  { id: "2", productName: "3D-Printed Phone Stand", category: "maker", baseCost: 4.00, finalPrice: 4.80, marginAmount: 0.80, creatorShare: 0.67, platformShare: 0.11, gleanersShare: 0.03, stewardShare: 0, createdAt: "2026-03-01" },
  { id: "3", productName: "Hand-Carved Wooden Spoon", category: "craft", baseCost: 15.00, finalPrice: 18.00, marginAmount: 3.00, creatorShare: 2.50, platformShare: 0.40, gleanersShare: 0.10, stewardShare: 0, createdAt: "2026-03-01" },
  { id: "4", productName: "Guitar Lesson (1hr)", category: "service", baseCost: 40.00, finalPrice: 48.00, marginAmount: 8.00, creatorShare: 6.66, platformShare: 1.06, gleanersShare: 0.26, stewardShare: 0, createdAt: "2026-03-01" },
  { id: "5", productName: "Organic Honey Jar (16oz)", category: "food", baseCost: 8.00, finalPrice: 9.60, marginAmount: 1.60, creatorShare: 1.33, platformShare: 0.21, gleanersShare: 0.05, stewardShare: 0, createdAt: "2026-03-01" },
  { id: "6", productName: "Custom Pet Portrait", category: "art", baseCost: 25.00, finalPrice: 30.00, marginAmount: 5.00, creatorShare: 4.17, platformShare: 0.67, gleanersShare: 0.17, stewardShare: 0, createdAt: "2026-03-01" },
  { id: "7", productName: "Resume Review Service", category: "service", baseCost: 20.00, finalPrice: 24.00, marginAmount: 4.00, creatorShare: 3.33, platformShare: 0.53, gleanersShare: 0.13, stewardShare: 0, createdAt: "2026-03-01" },
  { id: "8", productName: "Handmade Leather Wallet", category: "craft", baseCost: 35.00, finalPrice: 42.00, marginAmount: 7.00, creatorShare: 5.83, platformShare: 0.93, gleanersShare: 0.23, stewardShare: 0, createdAt: "2026-03-01" },
  { id: "9", productName: "Kids Coding Workshop (2hr)", category: "education", baseCost: 30.00, finalPrice: 36.00, marginAmount: 6.00, creatorShare: 5.00, platformShare: 0.80, gleanersShare: 0.20, stewardShare: 0, createdAt: "2026-03-01" },
  { id: "10", productName: "HexIsle Terrain Set (6-pack)", category: "game", baseCost: 18.00, finalPrice: 21.60, marginAmount: 3.60, creatorShare: 3.00, platformShare: 0.48, gleanersShare: 0.12, stewardShare: 0, createdAt: "2026-03-01" },
];

// ============================================================================
// CALCULATION
// ============================================================================

export function calculateC20(baseCost: number): C20Calculation {
  const marginAmount = baseCost * 0.20;
  const finalPrice = baseCost + marginAmount;
  return {
    baseCost,
    finalPrice,
    marginAmount,
    creatorShare: Math.round(marginAmount * 0.833 * 100) / 100,
    platformShare: Math.round(marginAmount * 0.133 * 100) / 100,
    gleanersShare: Math.round(marginAmount * 0.033 * 100) / 100,
  };
}

// ============================================================================
// FETCH FUNCTIONS
// ============================================================================

export async function fetchC20Examples(): Promise<C20Example[]> {
  try {
    const { data, error } = await supabase
      .from("c20_pricing_examples")
      .select("*")
      .order("base_cost", { ascending: true });
    if (error || !data?.length) return SAMPLE_EXAMPLES;
    return data.map(mapExample);
  } catch { return SAMPLE_EXAMPLES; }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

export async function addC20Example(example: {
  productName: string; category: string; baseCost: number;
}): Promise<C20Example | null> {
  try {
    const calc = calculateC20(example.baseCost);
    const { data, error } = await supabase.from("c20_pricing_examples").insert({
      product_name: example.productName,
      category: example.category,
      base_cost: calc.baseCost,
      final_price: calc.finalPrice,
      margin_amount: calc.marginAmount,
      creator_share: calc.creatorShare,
      platform_share: calc.platformShare,
      gleaners_share: calc.gleanersShare,
      steward_share: 0,
    }).select().single();
    if (error || !data) return null;
    return mapExample(data);
  } catch { return null; }
}

export async function deleteC20Example(exampleId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("c20_pricing_examples").delete().eq("id", exampleId);
    return !error;
  } catch { return false; }
}

// ============================================================================
// MAPPERS
// ============================================================================

function mapExample(row: any): C20Example {
  return {
    id: row.id, productName: row.product_name, category: row.category,
    baseCost: Number(row.base_cost), finalPrice: Number(row.final_price),
    marginAmount: Number(row.margin_amount), creatorShare: Number(row.creator_share),
    platformShare: Number(row.platform_share), gleanersShare: Number(row.gleaners_share),
    stewardShare: Number(row.steward_share), createdAt: row.created_at,
  };
}
