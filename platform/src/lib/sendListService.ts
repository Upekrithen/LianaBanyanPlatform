// ─── Send List Service ───────────────────────────────────────────────────────
// Service layer for send list management.
// TODO: Wire all functions to Supabase tables: send_lists, send_list_recipients, send_list_audit

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

// ─── Service Functions ───────────────────────────────────────────────────────

/**
 * Fetch all send lists for a user.
 * TODO: Replace with Supabase query:
 *   supabase.from('send_lists').select('*, send_list_recipients(*)').eq('user_id', userId)
 */
export async function fetchUserSendLists(_userId: string): Promise<SendList[]> {
  // Return sample data for now
  return Promise.resolve(SAMPLE_SEND_LISTS);
}

/**
 * Create a new send list.
 * TODO: Replace with Supabase insert:
 *   supabase.from('send_lists').insert({ ...list, user_id: list.userId })
 */
export async function createSendList(list: Partial<SendList>): Promise<SendList> {
  const newList: SendList = {
    id: `sl-${Date.now()}`,
    userId: list.userId ?? "",
    name: list.name ?? "Untitled List",
    type: list.type ?? "Cue Card",
    description: list.description ?? "",
    status: "DRAFT",
    createdAt: new Date().toISOString().split("T")[0],
    recipients: [],
  };
  // TODO: Insert into Supabase and return the real row
  return Promise.resolve(newList);
}

/**
 * Apply STAMP 1 or STAMP 2 to a send list.
 * TODO: Replace with Supabase update + audit log insert:
 *   supabase.from('send_lists').update({ status, stamp1_at/stamp2_at, stamp1_by/stamp2_by }).eq('id', listId)
 *   supabase.from('send_list_audit').insert({ send_list_id, action, performed_by, details })
 */
export async function applyStamp(
  listId: string,
  stampNumber: 1 | 2,
  _userId?: string
): Promise<{ success: boolean; newStatus: ListStatus }> {
  const newStatus: ListStatus = stampNumber === 1 ? "STAMP_1" : "STAMP_2";
  // TODO: Supabase update + audit trail
  void listId;
  return Promise.resolve({ success: true, newStatus });
}

/**
 * Add a recipient to a send list.
 * TODO: Replace with Supabase insert:
 *   supabase.from('send_list_recipients').insert({ send_list_id: listId, ...recipient })
 */
export async function addRecipient(
  listId: string,
  recipient: Partial<SendListRecipient>
): Promise<SendListRecipient> {
  const newRecipient: SendListRecipient = {
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
  // TODO: Insert into Supabase and return the real row
  return Promise.resolve(newRecipient);
}

/**
 * Execute the send for a fully stamped list.
 * TODO: Replace with Supabase RPC or edge function call:
 *   supabase.rpc('execute_send_list', { list_id: listId })
 *   This should: update status to SENDING, queue messages, then update to SENT with delivery stats.
 */
export async function executeSend(
  listId: string,
  _userId?: string
): Promise<{ success: boolean }> {
  // TODO: Call Supabase edge function for actual dispatch
  void listId;
  return Promise.resolve({ success: true });
}
