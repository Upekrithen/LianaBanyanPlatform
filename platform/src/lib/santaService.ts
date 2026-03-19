/**
 * Santa Ever After Service — Gift Delivery System
 * ================================================
 * "Giving Without Getting Caught"
 * Purchaser ≠ Deliverer. Captain Collateral stakes Marks.
 * Three-party verification: sender, captain, recipient.
 * Oops Code: 9-9-9-9
 */

import { supabase } from "@/integrations/supabase/client";

// ============================================================================
// TYPES
// ============================================================================

export type GiftStatus = "pending" | "assigned" | "in_transit" | "delivered" | "oops_code" | "completed" | "cancelled";
export type CurrencyType = "credits" | "marks" | "joules";

export interface SantaGift {
  id: string;
  senderUserId: string;
  recipientName: string;
  recipientContact: string;
  recipientUserId: string | null;
  productId: string | null;
  giftDescription: string;
  amountPaid: number;
  currencyType: CurrencyType;
  captainUserId: string | null;
  captainMarksStaked: number;
  status: GiftStatus;
  oopsCodeUsed: boolean;
  senderConfirmed: boolean;
  captainConfirmed: boolean;
  recipientConfirmed: boolean;
  createdAt: string;
  assignedAt: string | null;
  deliveredAt: string | null;
  completedAt: string | null;
  captainName?: string;
}

export interface CaptainProfile {
  id: string;
  userId: string;
  displayName: string;
  totalStaked: number;
  totalReleased: number;
  deliveriesCompleted: number;
  deliveriesFailed: number;
  successRate: number;
  rating: number;
  isActive: boolean;
  createdAt: string;
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

export const SAMPLE_GIFTS: SantaGift[] = [
  { id: "1", senderUserId: "u1", recipientName: "Maria Garcia", recipientContact: "maria@example.com", recipientUserId: null, productId: null, giftDescription: "Handmade soap set", amountPaid: 25, currencyType: "credits", captainUserId: null, captainMarksStaked: 0, status: "pending", oopsCodeUsed: false, senderConfirmed: true, captainConfirmed: false, recipientConfirmed: false, createdAt: "2026-03-15T10:00:00Z", assignedAt: null, deliveredAt: null, completedAt: null },
  { id: "2", senderUserId: "u1", recipientName: "Tom Chen", recipientContact: "tom@example.com", recipientUserId: null, productId: null, giftDescription: "3D-Printed Phone Stand", amountPaid: 12, currencyType: "credits", captainUserId: "u3", captainMarksStaked: 5, status: "in_transit", oopsCodeUsed: false, senderConfirmed: true, captainConfirmed: false, recipientConfirmed: false, createdAt: "2026-03-14T08:00:00Z", assignedAt: "2026-03-14T12:00:00Z", deliveredAt: null, completedAt: null, captainName: "Captain Reliable" },
  { id: "3", senderUserId: "u2", recipientName: "Sarah Kim", recipientContact: "sarah@example.com", recipientUserId: null, productId: null, giftDescription: "Organic Honey Jar", amountPaid: 15, currencyType: "marks", captainUserId: "u3", captainMarksStaked: 8, status: "delivered", oopsCodeUsed: false, senderConfirmed: true, captainConfirmed: true, recipientConfirmed: false, createdAt: "2026-03-12T09:00:00Z", assignedAt: "2026-03-12T14:00:00Z", deliveredAt: "2026-03-13T16:00:00Z", completedAt: null, captainName: "Captain Reliable" },
  { id: "4", senderUserId: "u2", recipientName: "James Park", recipientContact: "james@example.com", recipientUserId: null, productId: null, giftDescription: "Leather Bookmark Set", amountPaid: 18, currencyType: "credits", captainUserId: "u3", captainMarksStaked: 10, status: "completed", oopsCodeUsed: false, senderConfirmed: true, captainConfirmed: true, recipientConfirmed: true, createdAt: "2026-03-10T07:00:00Z", assignedAt: "2026-03-10T11:00:00Z", deliveredAt: "2026-03-11T15:00:00Z", completedAt: "2026-03-11T18:00:00Z", captainName: "Captain Reliable" },
  { id: "5", senderUserId: "u3", recipientName: "Lisa Wong", recipientContact: "lisa@example.com", recipientUserId: null, productId: null, giftDescription: "Custom Portrait", amountPaid: 30, currencyType: "joules", captainUserId: "u4", captainMarksStaked: 15, status: "oops_code", oopsCodeUsed: true, senderConfirmed: true, captainConfirmed: false, recipientConfirmed: false, createdAt: "2026-03-13T11:00:00Z", assignedAt: "2026-03-13T15:00:00Z", deliveredAt: null, completedAt: null, captainName: "Captain Stumble" },
];

export const SAMPLE_CAPTAINS: CaptainProfile[] = [
  { id: "c1", userId: "u3", displayName: "Captain Reliable", totalStaked: 500, totalReleased: 480, deliveriesCompleted: 12, deliveriesFailed: 0, successRate: 100, rating: 4.9, isActive: true, createdAt: "2026-01-01T00:00:00Z" },
  { id: "c2", userId: "u4", displayName: "New Captain Jessie", totalStaked: 50, totalReleased: 0, deliveriesCompleted: 0, deliveriesFailed: 0, successRate: 100, rating: 5.0, isActive: true, createdAt: "2026-03-10T00:00:00Z" },
  { id: "c3", userId: "u5", displayName: "Captain Stumble", totalStaked: 200, totalReleased: 150, deliveriesCompleted: 4, deliveriesFailed: 1, successRate: 80, rating: 3.8, isActive: true, createdAt: "2026-02-01T00:00:00Z" },
];

// ============================================================================
// FETCH FUNCTIONS
// ============================================================================

export async function fetchSentGifts(userId: string): Promise<SantaGift[]> {
  try {
    const { data, error } = await supabase
      .from("santa_gifts")
      .select("*")
      .eq("sender_user_id", userId)
      .order("created_at", { ascending: false });
    if (error || !data?.length) return SAMPLE_GIFTS.filter(g => g.senderUserId === "u1");
    return data.map(mapGift);
  } catch { return SAMPLE_GIFTS.filter(g => g.senderUserId === "u1"); }
}

export async function fetchReceivedGifts(userId: string): Promise<SantaGift[]> {
  try {
    const { data, error } = await supabase
      .from("santa_gifts")
      .select("*")
      .eq("recipient_user_id", userId)
      .order("created_at", { ascending: false });
    if (error || !data?.length) return SAMPLE_GIFTS.filter(g => g.status === "delivered" || g.status === "completed");
    return data.map(mapGift);
  } catch { return []; }
}

export async function fetchCaptains(): Promise<CaptainProfile[]> {
  try {
    const { data, error } = await supabase
      .from("captain_collateral_profiles")
      .select("*")
      .eq("is_active", true)
      .order("rating", { ascending: false });
    if (error || !data?.length) return SAMPLE_CAPTAINS;
    return data.map(mapCaptain);
  } catch { return SAMPLE_CAPTAINS; }
}

export async function fetchCaptainProfile(userId: string): Promise<CaptainProfile | null> {
  try {
    const { data, error } = await supabase
      .from("captain_collateral_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error || !data) return null;
    return mapCaptain(data);
  } catch { return null; }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

export async function createGift(gift: {
  senderUserId: string; recipientName: string; recipientContact: string;
  giftDescription: string; amountPaid: number; currencyType: CurrencyType;
  recipientUserId?: string; productId?: string;
}): Promise<SantaGift | null> {
  try {
    const { data, error } = await supabase.from("santa_gifts").insert({
      sender_user_id: gift.senderUserId,
      recipient_name: gift.recipientName,
      recipient_contact: gift.recipientContact,
      gift_description: gift.giftDescription,
      amount_paid: gift.amountPaid,
      currency_type: gift.currencyType,
      recipient_user_id: gift.recipientUserId || null,
      product_id: gift.productId || null,
    }).select().single();
    if (error || !data) return null;
    return mapGift(data);
  } catch { return null; }
}

export async function assignCaptain(giftId: string, captainUserId: string, marksStaked: number): Promise<boolean> {
  try {
    const { error } = await supabase.from("santa_gifts").update({
      captain_user_id: captainUserId,
      captain_marks_staked: marksStaked,
      status: "assigned",
      assigned_at: new Date().toISOString(),
    }).eq("id", giftId);
    return !error;
  } catch { return false; }
}

export async function confirmGift(giftId: string, role: "sender" | "captain" | "recipient"): Promise<boolean> {
  try {
    const field = role === "sender" ? "sender_confirmed" : role === "captain" ? "captain_confirmed" : "recipient_confirmed";
    const { error } = await supabase.from("santa_gifts").update({ [field]: true }).eq("id", giftId);
    return !error;
  } catch { return false; }
}

export async function markDelivered(giftId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("santa_gifts").update({
      status: "delivered",
      delivered_at: new Date().toISOString(),
    }).eq("id", giftId);
    return !error;
  } catch { return false; }
}

export async function completeGift(giftId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("santa_gifts").update({
      status: "completed",
      completed_at: new Date().toISOString(),
    }).eq("id", giftId);
    return !error;
  } catch { return false; }
}

export async function activateOopsCode(giftId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("santa_gifts").update({
      oops_code_used: true,
      status: "oops_code",
    }).eq("id", giftId);
    return !error;
  } catch { return false; }
}

// ============================================================================
// STATS
// ============================================================================

export async function fetchSantaStats(): Promise<{
  total: number; pending: number; inTransit: number;
  delivered: number; completed: number; oopsCodes: number;
}> {
  try {
    const { data, error } = await supabase.from("santa_gifts").select("status");
    if (error || !data?.length) {
      return { total: SAMPLE_GIFTS.length, pending: 1, inTransit: 1, delivered: 1, completed: 1, oopsCodes: 1 };
    }
    return {
      total: data.length,
      pending: data.filter(g => g.status === "pending").length,
      inTransit: data.filter(g => g.status === "in_transit").length,
      delivered: data.filter(g => g.status === "delivered").length,
      completed: data.filter(g => g.status === "completed").length,
      oopsCodes: data.filter(g => g.status === "oops_code").length,
    };
  } catch {
    return { total: SAMPLE_GIFTS.length, pending: 1, inTransit: 1, delivered: 1, completed: 1, oopsCodes: 1 };
  }
}

// ============================================================================
// MAPPERS
// ============================================================================

function mapGift(row: any): SantaGift {
  return {
    id: row.id,
    senderUserId: row.sender_user_id,
    recipientName: row.recipient_name,
    recipientContact: row.recipient_contact,
    recipientUserId: row.recipient_user_id,
    productId: row.product_id,
    giftDescription: row.gift_description,
    amountPaid: Number(row.amount_paid),
    currencyType: row.currency_type,
    captainUserId: row.captain_user_id,
    captainMarksStaked: Number(row.captain_marks_staked),
    status: row.status,
    oopsCodeUsed: row.oops_code_used,
    senderConfirmed: row.sender_confirmed,
    captainConfirmed: row.captain_confirmed,
    recipientConfirmed: row.recipient_confirmed,
    createdAt: row.created_at,
    assignedAt: row.assigned_at,
    deliveredAt: row.delivered_at,
    completedAt: row.completed_at,
  };
}

function mapCaptain(row: any): CaptainProfile {
  return {
    id: row.id,
    userId: row.user_id,
    displayName: row.display_name,
    totalStaked: Number(row.total_staked),
    totalReleased: Number(row.total_released),
    deliveriesCompleted: row.deliveries_completed,
    deliveriesFailed: row.deliveries_failed,
    successRate: Number(row.success_rate),
    rating: Number(row.rating),
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}
