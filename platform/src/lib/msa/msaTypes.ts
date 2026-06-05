/**
 * MSA Types -- Member Savings Account (Medical Coordination Tool)
 * ================================================================
 * CRITICAL SECURITIES-CLEAN NOTICE:
 *   The MSA is a COORDINATION TOOL only -- NOT a financial account,
 *   NOT a bank, NOT an investment product. Savings figures are
 *   coordination-tracking estimates versus a general market reference
 *   and are NOT A GUARANTEE of any specific savings amount.
 *
 * Switzerland Policy: No medical advice. No treatment recommendations.
 * The MSA coordinates PAYMENT logistics only.
 *
 * Administration: Cost+20% (cooperative admin fee, fully disclosed).
 */

// ─── Core Account ─────────────────────────────────────────────────────────────

/**
 * MSA coordination account record.
 * Tracks contribution intentions and spending coordination -- NOT a bank balance.
 */
export interface MSAAccount {
  id: string;
  member_id: string;
  /** Coordination balance in cents. NOT a guaranteed available amount. */
  balance_cents: number;
  monthly_deposit_cents: number;
  ytd_contributions_cents: number;
  ytd_spending_cents: number;
  roundup_enabled: boolean;
  status: "active" | "inactive" | "pending";
  created_at: string;
  updated_at: string;
}

// ─── Transactions ──────────────────────────────────────────────────────────────

export type MSATransactionType = "deposit" | "payment" | "community_roundup" | "family_transfer";

/** A single coordination event (deposit or payment routed through the MSA). */
export interface MSATransaction {
  id: string;
  account_id: string;
  member_id: string;
  type: MSATransactionType;
  /** Positive = credit, negative = debit (in cents) */
  amount_cents: number;
  description: string;
  provider?: string;
  initiative_slug?: string;
  created_at: string;
}

// ─── Family Pool ───────────────────────────────────────────────────────────────

export type MSAFamilyAccessLevel = "admin" | "limited";

export interface MSAFamilyMember {
  id: string;
  account_id: string;
  display_name: string;
  access_level: MSAFamilyAccessLevel;
  /** Monthly spending limit in cents (null = no limit for admin) */
  monthly_limit_cents: number | null;
  added_at: string;
}

// ─── Group Purchasing ─────────────────────────────────────────────────────────

/**
 * Group purchase coordination opportunity.
 * Price comparisons use a general market reference ONLY -- NOT A GUARANTEE
 * that any individual member will save that exact amount.
 */
export interface GroupPurchaseOpportunity {
  id: string;
  service_name: string;
  category: "prescription" | "lab" | "imaging" | "preventive" | "specialist" | "supplies";
  description: string;
  /** C+20% coordinated price in cents */
  c20_price_cents: number;
  /**
   * General market reference price in cents.
   * SOURCE: publicly available market data. NOT A GUARANTEE of retail price.
   * Individual prices vary. Label this "Market Ref (NOT A GUARANTEE)" in UI.
   */
  retail_reference_cents: number;
  enrolled_count: number;
  minimum_group_size: number;
  closes_at: string;
  status: "forming" | "active" | "closed";
}

// ─── Savings Comparison ───────────────────────────────────────────────────────

/**
 * Illustrative comparison between C+20% pricing and a general market reference.
 *
 * DISCLAIMER: These are illustrative figures using publicly available market
 * references. They are NOT A GUARANTEE that any individual member will achieve
 * these specific savings. Actual prices vary by location, provider, and plan.
 * This tool coordinates payment logistics -- it does not guarantee outcomes.
 */
export interface MSASavingsIllustration {
  service_name: string;
  /** General market reference in cents -- NOT guaranteed retail price */
  market_reference_cents: number;
  /** Cost+20% coordinated price in cents */
  c20_price_cents: number;
  /** Illustrative difference -- NOT A GUARANTEE */
  illustration_delta_cents: number;
  disclaimer: "NOT_A_GUARANTEE";
}

// ─── Community Pool ────────────────────────────────────────────────────────────

/**
 * Community emergency pool coordination figures.
 * These are aggregate coordination tracking numbers only.
 * NOT a guarantee of fund availability for any individual request.
 */
export interface MSACommunityPoolStats {
  total_cents: number;
  contributors_count: number;
  disbursements_ytd_cents: number;
  /** NOT a guaranteed disbursement amount for any individual */
  disclaimer: "NOT_A_GUARANTEE";
}

// ─── Demo / Tour Data ─────────────────────────────────────────────────────────

export const MSA_DISCLAIMER_ACCOUNT =
  "NOT A FINANCIAL ACCOUNT -- This is a coordination tool administered by the cooperative at Cost+20%. " +
  "Your contributions are tracked for payment coordination purposes only. " +
  "This is not a bank, not an investment account, and provides no guaranteed financial return.";

export const MSA_DISCLAIMER_SAVINGS =
  "NOT A GUARANTEE -- Savings illustrations compare C+20% pricing to general market references. " +
  "Actual prices vary by provider, location, and individual plan. " +
  "No specific savings amount is guaranteed.";

export const MSA_DISCLAIMER_SWITZERLAND =
  "Switzerland Policy: This tool coordinates payment logistics only. " +
  "No medical advice. No treatment recommendations. " +
  "Consult a qualified healthcare provider for all medical decisions.";
