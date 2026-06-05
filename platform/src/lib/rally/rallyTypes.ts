/**
 * Rally Group Types -- Community Organizing & Mutual Aid Coordination
 * ====================================================================
 * The Rally Group is the "battle-buddy" concept at neighborhood scale.
 * Switzerland Policy: No political content. No religious content.
 * This is practical mutual aid and crisis preparedness coordination only.
 *
 * Marks awarded for organizing and showing up (participation credits only --
 * NOT equity, NOT financial return, NOT a guaranteed payout).
 */

// ─── Responder Registration ───────────────────────────────────────────────────

export type ResponderStatus = "registered" | "orientation_pending" | "active" | "inactive";

export interface ResponderProfile {
  id: string;
  member_id: string;
  status: ResponderStatus;
  /** What the responder can offer (housing, transport, cooking, supplies, etc.) */
  capabilities: string[];
  max_guests: number;
  has_vehicle: boolean;
  supply_node: boolean;
  zip_code: string;
  orientation_completed_at: string | null;
  marks_earned: number;
  created_at: string;
  updated_at: string;
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export type AlertUrgency = "info" | "urgent" | "critical";
export type AlertType = "displacement" | "medical" | "supply" | "utility" | "weather" | "other";

export interface RallyAlert {
  id: string;
  type: AlertType;
  urgency: AlertUrgency;
  title: string;
  description: string;
  requested_action: string;
  neighborhood: string;
  zip_code: string;
  /** Marks awarded for responding to this specific alert */
  marks_on_response: number;
  expires_at: string;
  created_at: string;
  status: "open" | "fulfilled" | "expired";
}

// ─── Chalkboard (Haves & Wants) ───────────────────────────────────────────────

export type ChalkboardEntryType = "have" | "want";

export interface ChalkboardEntry {
  id: string;
  type: ChalkboardEntryType;
  description: string;
  /** Neighborhood / local area label -- not a full address */
  area: string;
  category: string;
  posted_at: string;
  expires_at: string;
  fulfilled: boolean;
}

export interface ChalkboardStats {
  active_haves: number;
  active_wants: number;
  fulfilled_this_month: number;
  /** Spark threshold: 50 active entries activates Block Swap mode */
  spark_threshold: number;
  stage: "spark" | "ember" | "wildfire";
}

// ─── Supply Nodes ─────────────────────────────────────────────────────────────

export interface SupplyNode {
  id: string;
  captain_member_id: string;
  display_name: string;
  /** Neighborhood label only -- no full address for privacy */
  neighborhood: string;
  zip_code: string;
  supplies: SupplyItem[];
  verified: boolean;
  last_verified_at: string;
}

export interface SupplyItem {
  name: string;
  quantity: number;
  unit: string;
  last_updated: string;
}

// ─── Swoop (Crisis Aid) ───────────────────────────────────────────────────────

export type SwoopType = "meal_train" | "service_donation" | "financial_pool" | "housing_need";

export interface SwoopRequest {
  id: string;
  type: SwoopType;
  title: string;
  description: string;
  /** Recipients are anonymous in public views -- dignity preserved */
  anonymous: boolean;
  neighborhood: string;
  needs: SwoopNeed[];
  fulfilled_count: number;
  total_needed: number;
  closes_at: string;
  created_at: string;
}

export interface SwoopNeed {
  id: string;
  description: string;
  fulfilled: boolean;
  fulfilled_by_display?: string;
}

// ─── Marks & Participation ────────────────────────────────────────────────────

/**
 * Rally Group Marks allocation reasons.
 * Marks = participation credits ONLY. Not equity. Not financial return.
 * NOT a guaranteed payout. Rate schedule: HELD FOR FOUNDER.
 */
export type RallyMarksReason =
  | "orientation_completion"      // 5 Marks -- complete crisis preparedness orientation
  | "alert_response"              // Marks per alert response
  | "chalkboard_entry"            // Marks for posting or fulfilling a Have/Want
  | "swoop_contribution"          // Marks for contributing to a Swoop
  | "supply_node_maintenance"     // Marks for keeping a supply node active
  | "block_swap_hosting"          // Marks for hosting a Block Swap event
  | "rally_node_verification";    // Marks for annual supply node reverification

export interface RallyMarksEvent {
  reason: RallyMarksReason;
  marks_units: number;
  description: string;
  triggered_at: string;
}

// ─── Demo Tour Data Flags ─────────────────────────────────────────────────────

export const RALLY_DISCLAIMER_NEUTRAL =
  "Switzerland Policy: Rally Group coordination is strictly non-political and non-religious. " +
  "All mutual aid activities are practical, community-focused, and available to all members equally.";

export const RALLY_DISCLAIMER_MARKS =
  "Marks are participation credits only -- not equity, not a financial return, " +
  "not a guaranteed payout. Rate schedule is set by the cooperative and held for Founder approval.";
