/**
 * Cost + 20% Certification Service
 *
 * Handles C+20 certification status checking, economic multipliers,
 * and certification request management.
 */

import { supabase } from '@/integrations/supabase/client';

export interface Anchor {
  id: string;
  owner_id: string;
  destination_url: string;
  display_name: string;
  description?: string;
  business_type?: string;
  pricing_policy: 'C_PLUS_20' | 'OPAQUE' | 'OTHER';
  verified_cost_plus: boolean;
  cost_plus_verified_at?: string;
  cost_plus_verified_by?: string;
  cost_plus_notes?: string;
  cost_plus_revoked_at?: string;
  cost_plus_revoked_reason?: string;
  cost_plus_compliance_ratio?: number;
  cost_plus_compliant_gmv?: number;
  cost_plus_total_gmv?: number;
  is_verified: boolean;
  trust_score: number;
  total_pass_throughs: number;
  status: string;
  charitable_tier_id?: string;
}

export type CostPlusTier = 'NONE' | 'QUARTER' | 'HALF' | 'THREE_QUARTER' | 'FULL';

export interface CostPlusTierInfo {
  tier: CostPlusTier;
  label: string;
  shortLabel: string;
  description: string;
  ratio: number;
  jouleMultiplier: number;
  marksMultiplier: number;
  ipStakeEligible: boolean;
  reciprocalTierMax: number;
  nextTier?: CostPlusTier;
  nextTierThreshold?: number;
  progressToNext?: number;
}

export interface CostPlusAudit {
  id: string;
  anchor_id: string;
  requested_by: string;
  request_type: 'certification' | 'renewal' | 'appeal';
  evidence_url?: string;
  evidence_notes?: string;
  cost_breakdown?: {
    cogs?: number;
    labor?: number;
    fees?: number;
    margin?: number;
  };
  reviewed_by?: string;
  status: 'pending' | 'approved' | 'rejected' | 'revoked' | 'expired';
  review_notes?: string;
  reviewed_at?: string;
  valid_from?: string;
  valid_until?: string;
  created_at: string;
}

export interface AnchorEconomics {
  joule_multiplier: number;
  marks_multiplier: number;
  ip_stake_eligible: boolean;
  reciprocal_tier_max: number;
  is_certified: boolean;
}

/**
 * Check if an anchor is fully C+20 certified (95%+ and verified).
 * This is the core check used throughout the platform.
 */
export function isCostPlusCertified(anchor: Anchor | null | undefined): boolean {
  if (!anchor) return false;
  return (
    anchor.pricing_policy === 'C_PLUS_20' &&
    anchor.verified_cost_plus === true &&
    !anchor.cost_plus_revoked_at &&
    (anchor.cost_plus_compliance_ratio ?? 0) >= 0.95
  );
}

/**
 * Get the C+20 badge tier based on compliance ratio.
 */
export function getCostPlusTier(anchor: Anchor | null | undefined): CostPlusTier {
  if (!anchor) return 'NONE';

  const ratio = anchor.cost_plus_compliance_ratio ?? 0;

  // Full badge requires both high ratio AND verification
  if (ratio >= 0.95 && anchor.verified_cost_plus && !anchor.cost_plus_revoked_at) {
    return 'FULL';
  }
  if (ratio >= 0.75) return 'THREE_QUARTER';
  if (ratio >= 0.50) return 'HALF';
  if (ratio >= 0.25) return 'QUARTER';
  return 'NONE';
}

/**
 * Get detailed tier information including progress and benefits.
 */
export function getCostPlusTierInfo(anchor: Anchor | null | undefined): CostPlusTierInfo {
  const tier = getCostPlusTier(anchor);
  const ratio = anchor?.cost_plus_compliance_ratio ?? 0;

  const tierConfigs: Record<CostPlusTier, Omit<CostPlusTierInfo, 'ratio' | 'progressToNext'>> = {
    NONE: {
      tier: 'NONE',
      label: 'Economics Unverified',
      shortLabel: 'No Badge',
      description: 'Less than 25% of platform sales are Cost + 20%',
      jouleMultiplier: 0.25,
      marksMultiplier: 0.50,
      ipStakeEligible: false,
      reciprocalTierMax: 1,
      nextTier: 'QUARTER',
      nextTierThreshold: 0.25,
    },
    QUARTER: {
      tier: 'QUARTER',
      label: 'C+20 in Progress',
      shortLabel: '¼ Badge',
      description: '25-49% of platform sales are Cost + 20%',
      jouleMultiplier: 0.40,
      marksMultiplier: 0.60,
      ipStakeEligible: false,
      reciprocalTierMax: 1,
      nextTier: 'HALF',
      nextTierThreshold: 0.50,
    },
    HALF: {
      tier: 'HALF',
      label: 'C+20 Builder',
      shortLabel: '½ Badge',
      description: '50-74% of platform sales are Cost + 20%',
      jouleMultiplier: 0.60,
      marksMultiplier: 0.75,
      ipStakeEligible: true,
      reciprocalTierMax: 2,
      nextTier: 'THREE_QUARTER',
      nextTierThreshold: 0.75,
    },
    THREE_QUARTER: {
      tier: 'THREE_QUARTER',
      label: 'C+20 Champion',
      shortLabel: '¾ Badge',
      description: '75-94% of platform sales are Cost + 20%',
      jouleMultiplier: 0.80,
      marksMultiplier: 0.90,
      ipStakeEligible: true,
      reciprocalTierMax: 2,
      nextTier: 'FULL',
      nextTierThreshold: 0.95,
    },
    FULL: {
      tier: 'FULL',
      label: 'C+20 Certified',
      shortLabel: 'Full Badge',
      description: '95%+ of platform sales are Cost + 20%',
      jouleMultiplier: 1.00,
      marksMultiplier: 1.00,
      ipStakeEligible: true,
      reciprocalTierMax: 3,
    },
  };

  const config = tierConfigs[tier];
  const progressToNext = config.nextTierThreshold
    ? Math.min(1, ratio / config.nextTierThreshold)
    : 1;

  return {
    ...config,
    ratio,
    progressToNext,
  };
}

/**
 * Get the certification status label for display.
 */
export function getCertificationStatusLabel(anchor: Anchor | null | undefined): string {
  if (!anchor) return 'Unknown';

  if (isCostPlusCertified(anchor)) {
    return 'C+20% Certified';
  }

  if (anchor.pricing_policy === 'C_PLUS_20' && !anchor.verified_cost_plus) {
    return 'Certification Pending';
  }

  if (anchor.cost_plus_revoked_at) {
    return 'Certification Revoked';
  }

  return 'Economics Unverified';
}

/**
 * Get economic multipliers for an anchor based on C+20 status.
 */
export async function getAnchorEconomics(anchorId: string): Promise<AnchorEconomics> {
  const { data, error } = await supabase
    .rpc('get_anchor_economics', { p_anchor_id: anchorId });

  if (error || !data || data.length === 0) {
    // Return default non-certified economics
    return {
      joule_multiplier: 0.25,
      marks_multiplier: 0.50,
      ip_stake_eligible: false,
      reciprocal_tier_max: 1,
      is_certified: false,
    };
  }

  return data[0];
}

/**
 * Request C+20 certification for an anchor.
 */
export async function requestCertification(
  anchorId: string,
  evidenceUrl?: string,
  evidenceNotes?: string,
  costBreakdown?: CostPlusAudit['cost_breakdown']
): Promise<{ success: boolean; auditId?: string; error?: string }> {
  const { data, error } = await supabase
    .rpc('request_cost_plus_certification', {
      p_anchor_id: anchorId,
      p_evidence_url: evidenceUrl || null,
      p_evidence_notes: evidenceNotes || null,
      p_cost_breakdown: costBreakdown || null,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, auditId: data };
}

/**
 * Get certification audit history for an anchor.
 */
export async function getCertificationHistory(anchorId: string): Promise<CostPlusAudit[]> {
  const { data, error } = await supabase
    .from('cost_plus_audits')
    .select('*')
    .eq('anchor_id', anchorId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching certification history:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all C+20 certified anchors (for public display).
 */
export async function getCertifiedAnchors(): Promise<Anchor[]> {
  const { data, error } = await supabase
    .from('v_certified_anchors')
    .select('*');

  if (error) {
    console.error('Error fetching certified anchors:', error);
    return [];
  }

  return data || [];
}

/**
 * Calculate the economic benefit difference between certified and uncertified.
 * Used for showing users what they're missing by not certifying.
 */
export function calculateCertificationBenefit(
  baseJoules: number,
  baseMarks: number
): {
  certified: { joules: number; marks: number };
  uncertified: { joules: number; marks: number };
  difference: { joules: number; marks: number; percentage: number };
} {
  const certifiedJoules = baseJoules * 1.0;
  const certifiedMarks = baseMarks * 1.0;
  const uncertifiedJoules = baseJoules * 0.25;
  const uncertifiedMarks = baseMarks * 0.50;

  return {
    certified: { joules: certifiedJoules, marks: certifiedMarks },
    uncertified: { joules: uncertifiedJoules, marks: uncertifiedMarks },
    difference: {
      joules: certifiedJoules - uncertifiedJoules,
      marks: certifiedMarks - uncertifiedMarks,
      percentage: 75, // 75% more Joules when certified
    },
  };
}

/**
 * Constants for C+20 economics.
 */
export const COST_PLUS_CONSTANTS = {
  CREATOR_CUT: 0.833,           // 83.3%
  PLATFORM_MARGIN: 0.20,        // 20% of cost
  CERTIFICATION_VALIDITY_DAYS: 365,
  CERTIFIED_JOULE_MULTIPLIER: 1.0,
  UNCERTIFIED_JOULE_MULTIPLIER: 0.25,
  CERTIFIED_MARKS_MULTIPLIER: 1.0,
  UNCERTIFIED_MARKS_MULTIPLIER: 0.50,
  MAX_RECIPROCAL_TIER_CERTIFIED: 3,
  MAX_RECIPROCAL_TIER_UNCERTIFIED: 1,
};
