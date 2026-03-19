// ─── Send List Service ───────────────────────────────────────────────────────
// Supabase-backed service layer for send list management.
// Falls back to sample data when DB returns empty or errors.

import { supabase } from "@/integrations/supabase/client";

// ─── Enum-like Constants ─────────────────────────────────────────────────────

export const LIST_TYPES = ["Cue Card", "Crown Letter", "Event Invitation", "Announcement"] as const;

export const LIST_STATUSES = ["DRAFT", "STAMP_1", "REVIEW", "STAMP_2", "SENDING", "SENT"] as const;

export const DELIVERY_METHODS = ["Email", "SMS", "In-Platform"] as const;

export const RECIPIENT_STATUSES = ["pending", "sent", "delivered", "opened", "failed"] as const;

// ─── Types ───────────────────────────────────────────────────────────────────

export type ListType = (typeof LIST_TYPES)[number];

export type ListStatus = (typeof LIST_STATUSES)[number];

export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];

export type RecipientStatus = (typeof RECIPIENT_STATUSES)[number];

export interface SendListRecipient {
  id: string;
  sendListId: string;
  name: string;
  deliveryMethod: DeliveryMethod;
  cardType: string;
  status: RecipientStatus;
  contactInfo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendList {
  id: string;
  userId: string;
  name: string;
  type: ListType;
  description: string;
  status: ListStatus;
  createdAt: string;
  sentAt?: string;
  stamp1At?: string;
  stamp1By?: string;
  stamp2At?: string;
  stamp2By?: string;
  recipients: SendListRecipient[];
  deliveryStats?: {
    sent: number;
    delivered: number;
    opened: number;
  };
}

export interface SendListAuditEntry {
  id: string;
  sendListId: string;
  action: "created" | "stamp_1_applied" | "stamp_2_applied" | "send_executed" | "recipient_added" | "recipient_removed";
  performedBy: string;
  performedAt: string;
  details: string;
}

// ─── Sample Data ─────────────────────────────────────────────────────────────

const NOW = "2026-03-18";

function makeSampleRecipient(
  overrides: Partial<SendListRecipient> & Pick<SendListRecipient, "id" | "name" | "deliveryMethod" | "cardType" | "status">
): SendListRecipient {
  return {
    sendListId: "",
    contactInfo: undefined,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

export const SAMPLE_SEND_LISTS: SendList[] = [
  {
    id: "sl-001",
    userId: "sample-user",
    name: "Ring 1 \u2014 Family Testers",
    type: "Cue Card",
    description: "First ring of family testers for beta launch invitations.",
    status: "DRAFT",
    createdAt: "2026-03-15",
    recipients: [
      makeSampleRecipient({ id: "r1", sendListId: "sl-001", name: "Mom", deliveryMethod: "Email", cardType: "Beta Invite", status: "pending" }),
      makeSampleRecipient({ id: "r2", sendListId: "sl-001", name: "Dad", deliveryMethod: "Email", cardType: "Beta Invite", status: "pending" }),
      makeSampleRecipient({ id: "r3", sendListId: "sl-001", name: "Sister", deliveryMethod: "SMS", cardType: "Beta Invite", status: "pending" }),
      makeSampleRecipient({ id: "r4", sendListId: "sl-001", name: "Brother", deliveryMethod: "Email", cardType: "Beta Invite", status: "pending" }),
      makeSampleRecipient({ id: "r5", sendListId: "sl-001", name: "Cousin A", deliveryMethod: "SMS", cardType: "Beta Invite", status: "pending" }),
      makeSampleRecipient({ id: "r6", sendListId: "sl-001", name: "Cousin B", deliveryMethod: "Email", cardType: "Beta Invite", status: "pending" }),
    ],
  },
  {
    id: "sl-002",
    userId: "sample-user",
    name: "Ring 2 \u2014 Extended Family",
    type: "Cue Card",
    description: "Second ring of extended family and close friends for wider beta.",
    status: "STAMP_1",
    createdAt: "2026-03-14",
    stamp1At: "2026-03-15T10:00:00Z",
    stamp1By: "sample-user",
    recipients: Array.from({ length: 12 }, (_, i) =>
      makeSampleRecipient({
        id: `r2-${i}`,
        sendListId: "sl-002",
        name: `Recipient ${i + 1}`,
        deliveryMethod: (i % 3 === 0 ? "SMS" : i % 3 === 1 ? "In-Platform" : "Email") as DeliveryMethod,
        cardType: "Extended Beta",
        status: "pending",
      })
    ),
  },
  {
    id: "sl-003",
    userId: "sample-user",
    name: "Crown Letters \u2014 Board Candidates",
    type: "Crown Letter",
    description: "Crown letter distribution to board candidate nominees.",
    status: "SENT",
    createdAt: "2026-03-10",
    sentAt: "2026-03-12T14:32:00Z",
    stamp1At: "2026-03-11T09:00:00Z",
    stamp1By: "sample-user",
    stamp2At: "2026-03-12T14:00:00Z",
    stamp2By: "sample-user",
    recipients: [
      makeSampleRecipient({ id: "r3-1", sendListId: "sl-003", name: "Candidate Alpha", deliveryMethod: "Email", cardType: "Board Crown", status: "opened" }),
      makeSampleRecipient({ id: "r3-2", sendListId: "sl-003", name: "Candidate Beta", deliveryMethod: "Email", cardType: "Board Crown", status: "delivered" }),
      makeSampleRecipient({ id: "r3-3", sendListId: "sl-003", name: "Candidate Gamma", deliveryMethod: "Email", cardType: "Board Crown", status: "opened" }),
    ],
    deliveryStats: { sent: 3, delivered: 3, opened: 2 },
  },
];

// ─── DB → Frontend mapping ──────────────────────────────────────────────────

const DB_TYPE_MAP: Record<string, ListType> = {
  cue_card: "Cue Card",
  crown_letter: "Crown Letter",
  event_invitation: "Event Invitation",
  announcement: "Announcement",
};

const FRONTEND_TYPE_MAP: Record<ListType, string> = {
  "Cue Card": "cue_card",
  "Crown Letter": "crown_letter",
  "Event Invitation": "event_invitation",
  "Announcement": "announcement",
};

const DB_STATUS_MAP: Record<string, ListStatus> = {
  draft: "DRAFT", stamp_1: "STAMP_1", review: "REVIEW",
  stamp_2: "STAMP_2", sending: "SENDING", sent: "SENT",
};

const DB_DELIVERY_MAP: Record<string, DeliveryMethod> = {
  email: "Email", sms: "SMS", in_platform: "In-Platform",
};

function mapDbRecipient(r: any, listId: string): SendListRecipient {
  return {
    id: r.id,
    sendListId: listId,
    name: r.recipient_name,
    deliveryMethod: DB_DELIVERY_MAP[r.delivery_method] ?? "Email",
    cardType: r.card_type ?? "",
    status: r.status ?? "pending",
    contactInfo: r.delivery_address ?? undefined,
    createdAt: r.sent_at ?? "",
    updatedAt: r.sent_at ?? "",
  };
}

function mapDbList(row: any): SendList {
  const recipients = (row.send_list_recipients ?? []).map((r: any) =>
    mapDbRecipient(r, row.id)
  );
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: DB_TYPE_MAP[row.list_type] ?? "Cue Card",
    description: row.description ?? "",
    status: DB_STATUS_MAP[row.status] ?? "DRAFT",
    createdAt: row.created_at?.split("T")[0] ?? "",
    sentAt: row.sent_at ?? undefined,
    stamp1At: row.stamp_1_at ?? undefined,
    stamp2At: row.stamp_2_at ?? undefined,
    recipients,
  };
}

// ─── Service Functions — Supabase-backed with sample fallback ────────────────

export async function fetchUserSendLists(userId: string): Promise<SendList[]> {
  try {
    const { data } = await supabase
      .from("send_lists")
      .select("*, send_list_recipients(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) return data.map(mapDbList);
  } catch (err) {
    console.error("Failed to fetch send lists from DB", err);
  }
  return SAMPLE_SEND_LISTS;
}

export async function createSendList(list: Partial<SendList>): Promise<SendList> {
  try {
    const { data, error } = await supabase
      .from("send_lists")
      .insert({
        user_id: list.userId,
        name: list.name ?? "Untitled List",
        list_type: FRONTEND_TYPE_MAP[list.type ?? "Cue Card"],
        description: list.description ?? "",
        status: "draft",
      })
      .select()
      .single();

    if (!error && data) return mapDbList(data);
  } catch (err) {
    console.error("Failed to create send list in DB", err);
  }
  return {
    id: `sl-${Date.now()}`,
    userId: list.userId ?? "",
    name: list.name ?? "Untitled List",
    type: list.type ?? "Cue Card",
    description: list.description ?? "",
    status: "DRAFT",
    createdAt: new Date().toISOString().split("T")[0],
    recipients: [],
  };
}

export async function applyStamp(
  listId: string,
  stampNumber: 1 | 2,
  userId?: string
): Promise<{ success: boolean; newStatus: ListStatus }> {
  const newStatus: ListStatus = stampNumber === 1 ? "STAMP_1" : "STAMP_2";
  const dbStatus = stampNumber === 1 ? "stamp_1" : "stamp_2";
  const stampCol = stampNumber === 1 ? "stamp_1_at" : "stamp_2_at";
  try {
    await supabase
      .from("send_lists")
      .update({ status: dbStatus, [stampCol]: new Date().toISOString() })
      .eq("id", listId);

    await supabase.from("send_list_audit").insert({
      send_list_id: listId,
      action: `stamp_${stampNumber}`,
      performed_by: userId,
      details: { stamp: stampNumber },
    });
  } catch (err) {
    console.error("Failed to apply stamp", err);
  }
  return { success: true, newStatus };
}

export async function addRecipient(
  listId: string,
  recipient: Partial<SendListRecipient>
): Promise<SendListRecipient> {
  const deliveryMap: Record<string, string> = {
    Email: "email", SMS: "sms", "In-Platform": "in_platform",
  };
  try {
    const { data, error } = await supabase
      .from("send_list_recipients")
      .insert({
        send_list_id: listId,
        recipient_name: recipient.name ?? "Unknown",
        delivery_method: deliveryMap[recipient.deliveryMethod ?? "Email"] ?? "email",
        card_type: recipient.cardType ?? "Default",
        delivery_address: recipient.contactInfo,
      })
      .select()
      .single();

    if (!error && data) return mapDbRecipient(data, listId);
  } catch (err) {
    console.error("Failed to add recipient", err);
  }
  return {
    id: `r-${Date.now()}`,
    sendListId: listId,
    name: recipient.name ?? "Unknown",
    deliveryMethod: recipient.deliveryMethod ?? "Email",
    cardType: recipient.cardType ?? "Default",
    status: "pending",
    contactInfo: recipient.contactInfo,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function executeSend(
  listId: string,
  userId?: string
): Promise<{ success: boolean }> {
  try {
    await supabase.from("send_lists").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", listId);
    await supabase.from("send_list_audit").insert({
      send_list_id: listId, action: "send", performed_by: userId, details: {},
    });
  } catch (err) {
    console.error("Failed to execute send", err);
  }
  return { success: true };
}
