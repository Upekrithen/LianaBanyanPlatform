/**
 * Excalibur Class Types — KN105 / BP016
 * =======================================
 * Shared type surface for the Excalibur Class commercial subscription tier.
 * "Only the worthy wield Excalibur."
 *
 * Distilled-nectar Federation: per-topic / per-category curated-and-tested
 * Scribe slices available via one-time payment OR subscription.
 * Commercial path: Upekrithen LLC (NOT LB Corp AGPL).
 */

// ─── Granularity ──────────────────────────────────────────────────────────

export type ExcaliburGranularity = "topic" | "category";

// ─── Member Contribution ─────────────────────────────────────────────────

export interface PerUserDataStamp {
  source_scribe: string;
  tablet_id: string;
  contribution_weight: number;     // 0.0–1.0 proportional weight
}

export interface MemberContribution {
  member_id: string;
  data_stamps: PerUserDataStamp[];
  contribution_share_proportion: number;    // proportional to data-contribution; sums to 1.0 across opted-in members
  share_back_per_subscription: number;      // $ calculated from cost_anchor
  opt_in_status: "opted_in" | "opted_out" | "unknown_default_out";
}

// ─── Excalibur Slice ──────────────────────────────────────────────────────

export interface ExcaliburTagGates {
  cathedral_effect_verification: { passed: boolean; lift_pp: number };
  furnace_gate: { passed: boolean; verification_score: number };
  adversarial_fence_testing: { passed: boolean; probes_passed: number; probes_total: number };
  federation_member_vote: { yes_count: number; no_count: number; quorum_met: boolean; threshold_met: boolean };
}

export interface ExcaliburPricing {
  one_time_payment: number;
  subscription_annual: number;
  cost_anchor: {
    member_pay_rate: number;           // M_share (default $1/year-per-Member-per-topic)
    n_contributors: number;
    lb_margin_factor: 1.2;            // Cost+20% Structural Bylaw
    bundle_discount_factor?: 0.7;     // category-class only
  };
}

export interface ExcaliburSlice {
  id: string;
  granularity: ExcaliburGranularity;
  name: string;
  topics_included: string[];
  contributing_members: MemberContribution[];
  excalibur_tag_assigned: boolean;
  tag_assignment_at: string | null;    // ISO-8601 or null
  tag_assignment_gates: ExcaliburTagGates;
  pricing: ExcaliburPricing;
  status: "proposed" | "under_review" | "excalibur_class" | "raw_federation_library" | "rejected";
}

// ─── Subscription State Machine ───────────────────────────────────────────

export type SubscriptionState =
  | "inactive"
  | "active_one_time"        // expires after configurable window (default 30 days)
  | "active_subscription"    // ongoing annual subscription
  | "cancelled"
  | "lapsed";

export interface ExcaliburSubscription {
  id: string;
  subscriber_id: string;               // user/org id
  slice_id: string;
  granularity: ExcaliburGranularity;
  state: SubscriptionState;
  stripe_session_id?: string;
  stripe_subscription_id?: string;
  activated_at: string | null;
  expires_at: string | null;           // for active_one_time
  cancelled_at: string | null;
  lapsed_at: string | null;
  cohort_class_granted: "excalibur_class_subscriber";
  created_at: string;
  updated_at: string;
}

// ─── Share-Back Ledger Entry ──────────────────────────────────────────────

export interface ShareBackLedgerEntry {
  id: string;
  slice_id: string;
  member_id: string;
  subscription_revenue: number;
  cost_portion: number;               // subscription_revenue / 1.20 (unwind margin)
  member_share: number;               // cost_portion × contribution_share_proportion
  period_start: string;               // ISO-8601
  period_end: string;
  created_at: string;
  paid_out: boolean;
  paid_out_at: string | null;
}

// ─── Vote ─────────────────────────────────────────────────────────────────

export interface ExcaliburVote {
  id: string;
  slice_id: string;
  voter_member_id: string;
  vote: "yes" | "no";
  voted_at: string;
}
