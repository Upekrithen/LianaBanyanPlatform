/**
 * MSA Service -- Medical Savings Account Coordination
 * ====================================================
 * Data layer for MSA coordination tracking.
 *
 * TODO (schema): Run migration to create tables before activating live queries:
 *   msa_accounts, msa_transactions, msa_family_members,
 *   group_purchase_opportunities, msa_community_pool_stats
 *
 * All Supabase calls are guarded with graceful fallbacks.
 * Demo data is available for WildFire tour mode.
 */

import { supabase } from "@/integrations/supabase/client";
import { calculateC20 } from "@/lib/c20Service";
import type {
  MSAAccount,
  MSATransaction,
  MSAFamilyMember,
  GroupPurchaseOpportunity,
  MSACommunityPoolStats,
  MSASavingsIllustration,
} from "./msaTypes";

// ─── Live Queries (TODO: activate after schema migration) ─────────────────────

/** Fetch the MSA coordination account for a member. Returns null if not found. */
export async function getMSAAccount(memberId: string): Promise<MSAAccount | null> {
  // TODO: activate after msa_accounts table migration
  const { data, error } = await supabase
    .from("msa_accounts" as never)
    .select("*")
    .eq("member_id", memberId)
    .maybeSingle() as any;
  if (error) return null;
  return data ?? null;
}

/** Fetch recent MSA transactions for an account. */
export async function getMSATransactions(
  accountId: string,
  limit = 20
): Promise<MSATransaction[]> {
  // TODO: activate after msa_transactions table migration
  const { data, error } = await supabase
    .from("msa_transactions" as never)
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false })
    .limit(limit) as any;
  if (error) return [];
  return data ?? [];
}

/** Fetch family members authorized on this MSA account. */
export async function getMSAFamilyMembers(
  accountId: string
): Promise<MSAFamilyMember[]> {
  // TODO: activate after msa_family_members table migration (join with family_table)
  const { data, error } = await supabase
    .from("msa_family_members" as never)
    .select("*")
    .eq("account_id", accountId) as any;
  if (error) return [];
  return data ?? [];
}

/** Fetch open group purchase coordination opportunities. */
export async function getGroupPurchaseOpportunities(): Promise<GroupPurchaseOpportunity[]> {
  // TODO: activate after group_purchase_opportunities table migration
  // Seeded by Health Accords coordinators; refreshed nightly
  const { data, error } = await supabase
    .from("group_purchase_opportunities" as never)
    .select("*")
    .in("status", ["forming", "active"])
    .order("closes_at", { ascending: true }) as any;
  if (error) return [];
  return data ?? [];
}

/** Fetch aggregate community pool stats. */
export async function getCommunityPoolStats(): Promise<MSACommunityPoolStats | null> {
  // TODO: activate after msa_community_pool_stats view migration
  const { data, error } = await supabase
    .from("msa_community_pool_stats" as never)
    .select("*")
    .maybeSingle() as any;
  if (error) return null;
  return data ?? null;
}

/** Set round-up opt-in for a member's account. */
export async function setRoundupEnabled(
  accountId: string,
  enabled: boolean
): Promise<boolean> {
  // TODO: activate after msa_accounts table migration
  const { error } = await supabase
    .from("msa_accounts" as never)
    .update({ roundup_enabled: enabled } as never)
    .eq("id", accountId) as any;
  return !error;
}

// ─── Savings Illustrations ────────────────────────────────────────────────────

/**
 * Returns illustrative savings comparisons using C+20% vs general market references.
 * DISCLAIMER: All figures are illustrative. NOT A GUARANTEE of individual savings.
 * Market references sourced from publicly available data (GoodRx, CMS, FAIR Health).
 */
export function getMSASavingsIllustrations(): MSASavingsIllustration[] {
  // Market reference costs (USD, illustrative, sourced from public market data)
  // TODO: source these from a refreshed public-data feed rather than hard-coded constants
  const illustrations: Array<{ name: string; baseCostUSD: number; marketRefUSD: number }> = [
    { name: "Annual Physical (Direct Pay)", baseCostUSD: 125, marketRefUSD: 250 },
    { name: "Generic Prescription (30-day)", baseCostUSD: 8, marketRefUSD: 45 },
    { name: "Basic Lab Panel", baseCostUSD: 35, marketRefUSD: 180 },
    { name: "Urgent Care Visit", baseCostUSD: 95, marketRefUSD: 195 },
  ];

  return illustrations.map((item) => {
    const c20 = calculateC20(item.baseCostUSD);
    return {
      service_name: item.name,
      market_reference_cents: Math.round(item.marketRefUSD * 100),
      c20_price_cents: Math.round(c20.finalPrice * 100),
      illustration_delta_cents: Math.round((item.marketRefUSD - c20.finalPrice) * 100),
      disclaimer: "NOT_A_GUARANTEE" as const,
    };
  });
}

// ─── WildFire Tour Demo Data ──────────────────────────────────────────────────

export const MSA_DEMO_ACCOUNT: MSAAccount = {
  id: "demo-account",
  member_id: "demo-member",
  balance_cents: 425000,
  monthly_deposit_cents: 25000,
  ytd_contributions_cents: 300000,
  ytd_spending_cents: 9920,
  roundup_enabled: false,
  status: "active",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-06-01T00:00:00Z",
};

export const MSA_DEMO_TRANSACTIONS: MSATransaction[] = [
  {
    id: "txn-1",
    account_id: "demo-account",
    member_id: "demo-member",
    type: "payment",
    amount_cents: -1420,
    description: "Generic Albuterol (30-day)",
    provider: "Health Accords",
    initiative_slug: "tatiana-schlossburg-health-accords",
    created_at: "2026-06-01T10:00:00Z",
  },
  {
    id: "txn-2",
    account_id: "demo-account",
    member_id: "demo-member",
    type: "deposit",
    amount_cents: 25000,
    description: "Monthly Auto-Deposit",
    created_at: "2026-06-01T00:00:00Z",
  },
  {
    id: "txn-3",
    account_id: "demo-account",
    member_id: "demo-member",
    type: "payment",
    amount_cents: -8500,
    description: "Dr. Chen (Direct Pay) -- Pediatric Visit",
    provider: "Direct Pay Provider",
    created_at: "2026-05-25T14:00:00Z",
  },
];

export const MSA_DEMO_GROUP_PURCHASES: GroupPurchaseOpportunity[] = [
  {
    id: "gpo-1",
    service_name: "Annual Physical -- Direct Pay Bundle",
    category: "preventive",
    description: "Group coordination for annual physicals with direct-pay providers in the Health Accords network.",
    c20_price_cents: 15000,
    retail_reference_cents: 30000,
    enrolled_count: 23,
    minimum_group_size: 10,
    closes_at: "2026-07-01T00:00:00Z",
    status: "active",
  },
  {
    id: "gpo-2",
    service_name: "Basic Metabolic Lab Panel",
    category: "lab",
    description: "Coordinated lab ordering through LifeLine Medications network partners.",
    c20_price_cents: 4200,
    retail_reference_cents: 18000,
    enrolled_count: 7,
    minimum_group_size: 10,
    closes_at: "2026-06-15T00:00:00Z",
    status: "forming",
  },
];

export const MSA_DEMO_FAMILY_MEMBERS: MSAFamilyMember[] = [
  {
    id: "fam-1",
    account_id: "demo-account",
    display_name: "Primary Member",
    access_level: "admin",
    monthly_limit_cents: null,
    added_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "fam-2",
    account_id: "demo-account",
    display_name: "Spouse",
    access_level: "admin",
    monthly_limit_cents: null,
    added_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "fam-3",
    account_id: "demo-account",
    display_name: "Child (College)",
    access_level: "limited",
    monthly_limit_cents: 20000,
    added_at: "2026-02-01T00:00:00Z",
  },
];

export const MSA_DEMO_COMMUNITY_POOL: MSACommunityPoolStats = {
  total_cents: 1240000,
  contributors_count: 312,
  disbursements_ytd_cents: 89500,
  disclaimer: "NOT_A_GUARANTEE",
};
