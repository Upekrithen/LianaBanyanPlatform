/**
 * Rally Group Service -- Community Organizing & Mutual Aid
 * =========================================================
 * Data layer for Rally Group coordination features.
 *
 * TODO (schema): Run migration to create tables before activating live queries:
 *   rally_responders, rally_alerts, rally_chalkboard, rally_supply_nodes,
 *   rally_swoop_requests, rally_swoop_needs
 *
 * Marks for organizing and showing up:
 *   - 5 Marks on orientation completion
 *   - Variable Marks per alert response (rate: HELD FOR FOUNDER)
 *   - TODO: wire to marksPayoutWiring.ts allocateMark() after Founder approval
 */

import { supabase } from "@/integrations/supabase/client";
import type {
  ResponderProfile,
  RallyAlert,
  ChalkboardEntry,
  ChalkboardStats,
  SupplyNode,
  SwoopRequest,
  RallyMarksEvent,
} from "./rallyTypes";

// ─── Responder Registration ───────────────────────────────────────────────────

export async function getResponderProfile(memberId: string): Promise<ResponderProfile | null> {
  // TODO: activate after rally_responders table migration
  const { data, error } = await supabase
    .from("rally_responders" as never)
    .select("*")
    .eq("member_id", memberId)
    .maybeSingle() as any;
  if (error) return null;
  return data ?? null;
}

export async function registerResponder(
  memberId: string,
  profile: Omit<ResponderProfile, "id" | "member_id" | "status" | "orientation_completed_at" | "marks_earned" | "created_at" | "updated_at">
): Promise<ResponderProfile | null> {
  // TODO: activate after rally_responders table migration
  const { data, error } = await supabase
    .from("rally_responders" as never)
    .insert({
      member_id: memberId,
      status: "registered",
      orientation_completed_at: null,
      marks_earned: 0,
      ...profile,
    } as never)
    .select("*")
    .single() as any;
  if (error) return null;
  return data;
}

/** Mark orientation as complete and award 5 Marks. */
export async function completeOrientation(
  responderId: string,
  memberId: string
): Promise<boolean> {
  // TODO: activate after rally_responders migration AND marksPayoutWiring hook approval
  // Step 1: mark orientation complete
  const { error: updateError } = await supabase
    .from("rally_responders" as never)
    .update({
      status: "active",
      orientation_completed_at: new Date().toISOString(),
      marks_earned: 5, // TODO: read from marks config -- rate HELD FOR FOUNDER
    } as never)
    .eq("id", responderId) as any;
  if (updateError) return false;

  // Step 2: allocate 5 Marks for orientation_completion
  // TODO: call allocateMark from marksPayoutWiring.ts here
  // await allocateMark({ member_id: memberId, reason: "orientation_completion", marks_units: 5, note: "Rally Group orientation completed" });

  return true;
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export async function getActiveAlerts(zipCode?: string): Promise<RallyAlert[]> {
  // TODO: activate after rally_alerts table migration
  let query = supabase
    .from("rally_alerts" as never)
    .select("*")
    .eq("status", "open")
    .gt("expires_at", new Date().toISOString())
    .order("urgency", { ascending: false }) as any;

  if (zipCode) {
    query = query.eq("zip_code", zipCode);
  }

  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

// ─── Chalkboard ───────────────────────────────────────────────────────────────

export async function getChalkboardEntries(
  zipCode?: string,
  limit = 50
): Promise<ChalkboardEntry[]> {
  // TODO: activate after rally_chalkboard table migration
  let query = supabase
    .from("rally_chalkboard" as never)
    .select("*")
    .eq("fulfilled", false)
    .gt("expires_at", new Date().toISOString())
    .order("posted_at", { ascending: false })
    .limit(limit) as any;

  if (zipCode) {
    query = query.eq("zip_code", zipCode);
  }

  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

export async function getChalkboardStats(zipCode?: string): Promise<ChalkboardStats | null> {
  // TODO: activate after rally_chalkboard_stats view migration
  const { data, error } = await supabase
    .from("rally_chalkboard_stats" as never)
    .select("*")
    .maybeSingle() as any;
  if (error) return null;
  return data ?? null;
}

// ─── Supply Nodes ─────────────────────────────────────────────────────────────

export async function getNearbySupplyNodes(zipCode: string): Promise<SupplyNode[]> {
  // TODO: activate after rally_supply_nodes table migration
  // TODO: implement geo-proximity query (PostGIS or zip_code matching)
  const { data, error } = await supabase
    .from("rally_supply_nodes" as never)
    .select("*")
    .eq("zip_code", zipCode)
    .eq("verified", true) as any;
  if (error) return [];
  return data ?? [];
}

// ─── Swoop ────────────────────────────────────────────────────────────────────

export async function getActiveSwoopRequests(zipCode?: string): Promise<SwoopRequest[]> {
  // TODO: activate after rally_swoop_requests + rally_swoop_needs migration
  let query = supabase
    .from("rally_swoop_requests" as never)
    .select("*, rally_swoop_needs(*)")
    .gt("closes_at", new Date().toISOString())
    .order("created_at", { ascending: false }) as any;

  if (zipCode) {
    query = query.eq("neighborhood", zipCode);
  }

  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

// ─── Marks ────────────────────────────────────────────────────────────────────

export async function getRallyMarksEvents(memberId: string): Promise<RallyMarksEvent[]> {
  // TODO: activate after shadow_marks_ledger integration for rally reasons
  const { data, error } = await supabase
    .from("shadow_marks_ledger" as never)
    .select("*")
    .eq("member_id", memberId)
    .in("reason", [
      "orientation_completion",
      "alert_response",
      "chalkboard_entry",
      "swoop_contribution",
      "supply_node_maintenance",
      "block_swap_hosting",
      "rally_node_verification",
    ])
    .order("allocated_at", { ascending: false })
    .limit(20) as any;
  if (error) return [];
  return (data ?? []).map((row: any) => ({
    reason: row.reason,
    marks_units: row.marks_units,
    description: row.note,
    triggered_at: row.allocated_at,
  }));
}

// ─── WildFire Tour Demo Data ──────────────────────────────────────────────────

export const RALLY_DEMO_RESPONDER: ResponderProfile = {
  id: "demo-responder",
  member_id: "demo-member",
  status: "active",
  capabilities: ["housing_2_guests", "transport_4_seats", "cooking"],
  max_guests: 2,
  has_vehicle: true,
  supply_node: false,
  zip_code: "00001",
  orientation_completed_at: "2026-03-01T10:00:00Z",
  marks_earned: 15,
  created_at: "2026-02-15T00:00:00Z",
  updated_at: "2026-06-01T00:00:00Z",
};

export const RALLY_DEMO_ALERTS: RallyAlert[] = [
  {
    id: "alert-1",
    type: "displacement",
    urgency: "urgent",
    title: "House Fire Displacement -- 3 Adults",
    description: "Family of 3 displaced by a house fire needs temporary housing for 3-5 nights.",
    requested_action: "Can you host 1-3 guests for up to 5 nights?",
    neighborhood: "Eastside",
    zip_code: "00001",
    marks_on_response: 3,
    expires_at: "2026-06-05T00:00:00Z",
    created_at: "2026-06-02T08:00:00Z",
    status: "open",
  },
  {
    id: "alert-2",
    type: "supply",
    urgency: "info",
    title: "Blanket Drive -- Community Shelter",
    description: "Local shelter requesting blanket donations ahead of predicted cold snap.",
    requested_action: "Can you drop off blankets at the Captain's node at Elm & 4th?",
    neighborhood: "Westside",
    zip_code: "00001",
    marks_on_response: 1,
    expires_at: "2026-06-08T00:00:00Z",
    created_at: "2026-06-01T12:00:00Z",
    status: "open",
  },
];

export const RALLY_DEMO_CHALKBOARD_STATS: ChalkboardStats = {
  active_haves: 38,
  active_wants: 19,
  fulfilled_this_month: 24,
  spark_threshold: 50,
  stage: "spark",
};

export const RALLY_DEMO_CHALKBOARD: ChalkboardEntry[] = [
  {
    id: "chalk-1",
    type: "have",
    description: "Pickup truck available on weekends for moves/hauls",
    area: "Northside",
    category: "transport",
    posted_at: "2026-06-01T10:00:00Z",
    expires_at: "2026-07-01T00:00:00Z",
    fulfilled: false,
  },
  {
    id: "chalk-2",
    type: "want",
    description: "Need lawnmower for Saturday morning -- 2 hours",
    area: "Eastside",
    category: "tools",
    posted_at: "2026-06-01T09:00:00Z",
    expires_at: "2026-06-08T00:00:00Z",
    fulfilled: false,
  },
  {
    id: "chalk-3",
    type: "have",
    description: "Extra lemons + herbs from garden",
    area: "Midtown",
    category: "food",
    posted_at: "2026-05-31T14:00:00Z",
    expires_at: "2026-06-07T00:00:00Z",
    fulfilled: false,
  },
];

export const RALLY_DEMO_MARKS_EVENTS: RallyMarksEvent[] = [
  {
    reason: "orientation_completion",
    marks_units: 5,
    description: "Crisis preparedness orientation completed",
    triggered_at: "2026-03-01T10:00:00Z",
  },
  {
    reason: "alert_response",
    marks_units: 3,
    description: "Responded to displacement alert -- hosted 2 guests",
    triggered_at: "2026-04-12T18:00:00Z",
  },
  {
    reason: "chalkboard_entry",
    marks_units: 1,
    description: "Fulfilled a community Want (tool lending)",
    triggered_at: "2026-05-20T09:00:00Z",
  },
];
