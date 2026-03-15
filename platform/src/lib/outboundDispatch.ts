/**
 * OUTBOUND DISPATCH SYSTEM — Stamp, Approve, Dispatch
 * =====================================================
 * Innovation #1523: Universal Outbound Content Approval System
 *
 * ALL outbound content goes through this system:
 *   - Olive Branch letters (creator outreach)
 *   - Crown letters (leadership invitations)
 *   - Academic papers (Areopagus, economic, civic)
 *   - Battery campaigns (social media dispatches)
 *   - Areopagus perspectives (op-eds, opinion pieces)
 *   - Publications (Substack, Medium, Cephas Hugo)
 *
 * Workflow:
 *   1. DRAFT    — Content created by Bishop/Rook/author
 *   2. REVIEW   — Founder reviews content
 *   3. STAMPED  — Founder stamps with "As You Wish" confirmation
 *   4. QUEUED   — Scheduled for dispatch at optimal time
 *   5. DISPATCHED — Sent via appropriate channel
 *   6. TRACKED  — Response/engagement monitoring
 *
 * The Founder's stamp is THE lock mechanism. Nothing leaves without it.
 * "A good test as the final action for launch." — Founder, Session 7E
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export type OutboundType =
  | 'olive_branch'       // Creator outreach letters
  | 'crown_letter'       // Leadership position invitations
  | 'advisory_letter'    // Advisory role invitations (e.g., thang010146)
  | 'academic_paper'     // Research papers, Areopagus doctrine papers
  | 'battery_campaign'   // Social media Battery dispatches
  | 'perspective'        // Areopagus op-ed / opinion piece
  | 'publication'        // Substack, Medium, Cephas Hugo posts
  | 'press_release'      // Official announcements
  | 'partnership_proposal'; // Business proposals (e.g., Pivotal Ventures)

export type OutboundStatus =
  | 'draft'       // Created, not yet reviewed
  | 'review'      // Submitted for Founder review
  | 'revision'    // Founder requested changes
  | 'stamped'     // Founder approved with "As You Wish"
  | 'queued'      // Scheduled for dispatch
  | 'dispatched'  // Sent
  | 'responded'   // Recipient responded
  | 'completed';  // Thread closed

export type DispatchChannel =
  | 'email'        // Direct email
  | 'linkedin'     // LinkedIn InMail or message
  | 'twitter'      // Twitter/X DM or post
  | 'bluesky'      // Bluesky post
  | 'substack'     // Substack publication
  | 'medium'       // Medium publication
  | 'cephas'       // Cephas Hugo site
  | 'battery'      // TheBattery social barrage
  | 'physical'     // Physical mail
  | 'platform';    // Internal platform notification

export type OutboundPriority = 'critical' | 'high' | 'normal' | 'low';

export interface OutboundItem {
  id: string;
  // Content identity
  title: string;
  type: OutboundType;
  status: OutboundStatus;
  priority: OutboundPriority;
  // Recipient (for letters/proposals)
  recipientName?: string;
  recipientOrg?: string;
  recipientContact?: string;  // email, LinkedIn URL, etc.
  // Content
  contentBody: string;        // The actual content (markdown)
  contentSummary: string;     // 1-2 sentence summary for review queue
  // Dispatch
  channels: DispatchChannel[];
  scheduledFor?: string;      // ISO timestamp for queued dispatch
  dispatchedAt?: string;      // When actually sent
  // Approval chain
  createdBy: string;          // 'bishop' | 'rook' | userId
  reviewedBy?: string;        // Founder's userId
  stampedAt?: string;         // When Founder stamped
  stampPhrase?: string;       // Should always be "As You Wish"
  // Tracking
  responseReceivedAt?: string;
  responseNotes?: string;
  followUpDate?: string;      // When to follow up if no response
  // References
  campaignId?: string;        // Link to Battery campaign
  contentPipelineId?: string; // Link to Content Pipeline item
  innovationNumbers: number[];
  tags: string[];
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// STATUS CONFIGURATION
// ============================================================================

export const OUTBOUND_STATUS_CONFIG: Record<OutboundStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
}> = {
  draft: {
    label: 'Draft',
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    icon: 'FileEdit',
    description: 'Content created, awaiting review',
  },
  review: {
    label: 'In Review',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    icon: 'Eye',
    description: 'Submitted for Founder review',
  },
  revision: {
    label: 'Needs Revision',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    icon: 'PenLine',
    description: 'Founder requested changes',
  },
  stamped: {
    label: 'Stamped',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    icon: 'Stamp',
    description: 'Founder approved — ready for dispatch',
  },
  queued: {
    label: 'Queued',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    icon: 'Clock',
    description: 'Scheduled for dispatch',
  },
  dispatched: {
    label: 'Dispatched',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    icon: 'Send',
    description: 'Sent via dispatch channel',
  },
  responded: {
    label: 'Response Received',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    icon: 'MessageCircle',
    description: 'Recipient has responded',
  },
  completed: {
    label: 'Completed',
    color: 'text-slate-500',
    bgColor: 'bg-slate-500/10',
    icon: 'CheckCircle',
    description: 'Thread closed',
  },
};

export const OUTBOUND_TYPE_CONFIG: Record<OutboundType, {
  label: string;
  emoji: string;
  defaultChannels: DispatchChannel[];
  requiresRecipient: boolean;
}> = {
  olive_branch: {
    label: 'Olive Branch Letter',
    emoji: '🫒',
    defaultChannels: ['email'],
    requiresRecipient: true,
  },
  crown_letter: {
    label: 'Crown Position Letter',
    emoji: '👑',
    defaultChannels: ['email', 'physical'],
    requiresRecipient: true,
  },
  advisory_letter: {
    label: 'Advisory Role Invitation',
    emoji: '🏅',
    defaultChannels: ['email'],
    requiresRecipient: true,
  },
  academic_paper: {
    label: 'Academic Paper',
    emoji: '📄',
    defaultChannels: ['cephas', 'substack'],
    requiresRecipient: false,
  },
  battery_campaign: {
    label: 'Battery Campaign',
    emoji: '🔋',
    defaultChannels: ['battery'],
    requiresRecipient: false,
  },
  perspective: {
    label: 'Areopagus Perspective',
    emoji: '🏛️',
    defaultChannels: ['platform', 'substack', 'medium'],
    requiresRecipient: false,
  },
  publication: {
    label: 'Publication',
    emoji: '📰',
    defaultChannels: ['substack', 'medium', 'cephas'],
    requiresRecipient: false,
  },
  press_release: {
    label: 'Press Release',
    emoji: '📢',
    defaultChannels: ['platform', 'email'],
    requiresRecipient: false,
  },
  partnership_proposal: {
    label: 'Partnership Proposal',
    emoji: '🤝',
    defaultChannels: ['email', 'linkedin'],
    requiresRecipient: true,
  },
};

// ============================================================================
// HELPER FUNCTIONS — DB-backed (outbound_dispatch table)
// ============================================================================

function rowToItem(row: Record<string, unknown>): OutboundItem {
  return {
    id: row.id as string,
    title: row.title as string,
    type: row.type as OutboundType,
    status: row.status as OutboundStatus,
    priority: (row.priority || 'normal') as OutboundPriority,
    recipientName: row.recipient_name as string | undefined,
    recipientOrg: row.recipient_org as string | undefined,
    recipientContact: row.recipient_contact as string | undefined,
    contentBody: row.content_body as string,
    contentSummary: row.content_summary as string,
    channels: (row.channels || []) as DispatchChannel[],
    scheduledFor: row.scheduled_for as string | undefined,
    dispatchedAt: row.dispatched_at as string | undefined,
    createdBy: row.created_by as string,
    reviewedBy: row.reviewed_by as string | undefined,
    stampedAt: row.stamped_at as string | undefined,
    stampPhrase: row.stamp_phrase as string | undefined,
    responseReceivedAt: row.response_received_at as string | undefined,
    responseNotes: row.response_notes as string | undefined,
    followUpDate: row.follow_up_date as string | undefined,
    campaignId: row.campaign_id as string | undefined,
    contentPipelineId: row.content_pipeline_id as string | undefined,
    innovationNumbers: (row.innovation_numbers || []) as number[],
    tags: (row.tags || []) as string[],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * Create a new outbound item in draft status (DB-backed).
 * Overloaded: call with no args to get in-memory item (for SESSION_7E_LAUNCH_QUEUE compat),
 * or call normally to INSERT into DB.
 */
export function createOutboundDraft(
  title: string,
  type: OutboundType,
  contentBody: string,
  contentSummary: string,
  createdBy: string,
  options: {
    recipientName?: string;
    recipientOrg?: string;
    recipientContact?: string;
    channels?: DispatchChannel[];
    priority?: OutboundPriority;
    innovationNumbers?: number[];
    tags?: string[];
    campaignId?: string;
    contentPipelineId?: string;
  } = {}
): OutboundItem {
  const config = OUTBOUND_TYPE_CONFIG[type];
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title,
    type,
    status: 'draft',
    priority: options.priority || 'normal',
    recipientName: options.recipientName,
    recipientOrg: options.recipientOrg,
    recipientContact: options.recipientContact,
    contentBody,
    contentSummary,
    channels: options.channels || config.defaultChannels,
    createdBy,
    innovationNumbers: options.innovationNumbers || [],
    tags: options.tags || [],
    campaignId: options.campaignId,
    contentPipelineId: options.contentPipelineId,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Insert a draft into the DB.
 */
export async function insertOutboundDraft(item: OutboundItem): Promise<OutboundItem> {
  const { data, error } = await (supabase
    .from('outbound_dispatch' as never)
    .insert({
      title: item.title,
      type: item.type,
      status: 'draft',
      priority: item.priority,
      recipient_name: item.recipientName || null,
      recipient_org: item.recipientOrg || null,
      recipient_contact: item.recipientContact || null,
      content_body: item.contentBody,
      content_summary: item.contentSummary,
      channels: item.channels,
      created_by: item.createdBy,
      innovation_numbers: item.innovationNumbers,
      tags: item.tags,
      campaign_id: item.campaignId || null,
      content_pipeline_id: item.contentPipelineId || null,
    }) as any)
    .select()
    .single();

  if (error) throw error;
  return rowToItem(data);
}

/**
 * Submit item for Founder review.
 */
export async function submitForReview(itemId: string): Promise<OutboundItem> {
  const { data, error } = await (supabase
    .from('outbound_dispatch' as never)
    .update({ status: 'review', updated_at: new Date().toISOString() }) as any)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return rowToItem(data);
}

/**
 * Founder stamps the item (approval).
 */
export async function stampItem(
  itemId: string,
  reviewerId: string,
  stampPhrase: string = 'As You Wish'
): Promise<OutboundItem> {
  const now = new Date().toISOString();
  const { data, error } = await (supabase
    .from('outbound_dispatch' as never)
    .update({
      status: 'stamped',
      reviewed_by: reviewerId,
      stamped_at: now,
      stamp_phrase: stampPhrase,
      updated_at: now,
    }) as any)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return rowToItem(data);
}

/**
 * Queue item for dispatch at a specific time.
 */
export async function queueForDispatch(
  itemId: string,
  scheduledFor: string
): Promise<OutboundItem> {
  const { data, error } = await (supabase
    .from('outbound_dispatch' as never)
    .update({
      status: 'queued',
      scheduled_for: scheduledFor,
      updated_at: new Date().toISOString(),
    }) as any)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return rowToItem(data);
}

/**
 * Mark item as dispatched.
 */
export async function markDispatched(itemId: string): Promise<OutboundItem> {
  const now = new Date().toISOString();
  const { data, error } = await (supabase
    .from('outbound_dispatch' as never)
    .update({ status: 'dispatched', dispatched_at: now, updated_at: now }) as any)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return rowToItem(data);
}

/**
 * Record a response.
 */
export async function recordResponse(
  itemId: string,
  notes: string,
  followUpDate?: string
): Promise<OutboundItem> {
  const now = new Date().toISOString();
  const { data, error } = await (supabase
    .from('outbound_dispatch' as never)
    .update({
      status: 'responded',
      response_received_at: now,
      response_notes: notes,
      follow_up_date: followUpDate || null,
      updated_at: now,
    }) as any)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return rowToItem(data);
}

/**
 * Request revision (Founder sends back for changes).
 */
export async function requestRevision(itemId: string): Promise<OutboundItem> {
  const { data, error } = await (supabase
    .from('outbound_dispatch' as never)
    .update({ status: 'revision', updated_at: new Date().toISOString() }) as any)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return rowToItem(data);
}

// ============================================================================
// QUEUE MANAGEMENT — DB-backed queries
// ============================================================================

/**
 * Get all items in a specific status.
 */
export async function filterByStatus(status: OutboundStatus): Promise<OutboundItem[]> {
  const { data, error } = await (supabase
    .from('outbound_dispatch' as never)
    .select('*') as any)
    .eq('status', status)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map(rowToItem);
}

/**
 * Get items ready for dispatch (stamped or queued with past scheduledFor).
 */
export async function getReadyForDispatch(): Promise<OutboundItem[]> {
  const now = new Date().toISOString();
  const { data, error } = await (supabase
    .from('outbound_dispatch' as never)
    .select('*') as any)
    .or(`status.eq.stamped,and(status.eq.queued,scheduled_for.lte.${now})`)
    .order('priority', { ascending: true });

  if (error) throw error;
  return (data || []).map(rowToItem);
}

/**
 * Get items needing follow-up.
 */
export async function getNeedingFollowUp(): Promise<OutboundItem[]> {
  const now = new Date().toISOString();
  const { data, error } = await (supabase
    .from('outbound_dispatch' as never)
    .select('*') as any)
    .eq('status', 'dispatched')
    .lte('follow_up_date', now);

  if (error) throw error;
  return (data || []).map(rowToItem);
}

/**
 * Get all dispatch items for the queue view.
 */
export async function getAllDispatchItems(): Promise<OutboundItem[]> {
  const { data, error } = await (supabase
    .from('outbound_dispatch' as never)
    .select('*') as any)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(rowToItem);
}

/**
 * Get dispatch queue summary.
 */
export async function getQueueSummary(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  readyForDispatch: number;
  awaitingStamp: number;
}> {
  const items = await getAllDispatchItems();
  const byStatus: Record<string, number> = {};
  const byType: Record<string, number> = {};

  for (const item of items) {
    byStatus[item.status] = (byStatus[item.status] || 0) + 1;
    byType[item.type] = (byType[item.type] || 0) + 1;
  }

  const ready = await getReadyForDispatch();
  const reviewing = items.filter(i => i.status === 'review');

  return {
    total: items.length,
    byStatus,
    byType,
    readyForDispatch: ready.length,
    awaitingStamp: reviewing.length,
  };
}

// ============================================================================
// INITIAL QUEUE — Session 7E Launch Queue
// ============================================================================

/**
 * Pre-loaded outbound items for Session 7E launch.
 * These are the items the Founder needs to stamp before dispatch.
 */
export const SESSION_7E_LAUNCH_QUEUE: OutboundItem[] = [
  // === TIER 1 OLIVE BRANCH LETTERS ===
  createOutboundDraft(
    "Olive Branch — Maker's Muse (Angus)",
    'olive_branch',
    'See BISHOP_DROPZONE/OLIVE-BRANCH-TIER1-LETTERS.md — Letter 1',
    'Creator outreach to Angus (Maker\'s Muse). 3D printing expert, IP advocate. Hammer Guild — Additive Manufacturing Crown Advisor candidate.',
    'bishop',
    { recipientName: 'Angus Deveson', recipientOrg: "Maker's Muse", priority: 'high', tags: ['tier-1', 'hammer-guild'] }
  ),
  createOutboundDraft(
    'Olive Branch — Clickspring (Chris)',
    'olive_branch',
    'See BISHOP_DROPZONE/OLIVE-BRANCH-TIER1-LETTERS.md — Letter 2',
    'Creator outreach to Chris (Clickspring). Precision clockmaker. Hammer Guild — Precision Craft Crown Advisor candidate.',
    'bishop',
    { recipientName: 'Chris', recipientOrg: 'Clickspring', priority: 'high', tags: ['tier-1', 'hammer-guild'] }
  ),
  createOutboundDraft(
    'Olive Branch — Teaching Tech (Michael)',
    'olive_branch',
    'See BISHOP_DROPZONE/OLIVE-BRANCH-TIER1-LETTERS.md — Letter 3',
    'Creator outreach to Michael (Teaching Tech). 3D printer educator. Bellows Guild — Maker Education Crown Advisor candidate.',
    'bishop',
    { recipientName: 'Michael', recipientOrg: 'Teaching Tech', priority: 'high', tags: ['tier-1', 'bellows-guild'] }
  ),
  createOutboundDraft(
    'Olive Branch — Rybonator',
    'olive_branch',
    'See BISHOP_DROPZONE/OLIVE-BRANCH-TIER1-LETTERS.md — Letter 4',
    'Creator outreach. Advanced 3D printing techniques. Hammer Guild — Materials & Finish Crown Advisor candidate.',
    'bishop',
    { recipientName: 'Rybonator', priority: 'high', tags: ['tier-1', 'hammer-guild'] }
  ),
  createOutboundDraft(
    'Olive Branch — Tom Stanton',
    'olive_branch',
    'See BISHOP_DROPZONE/OLIVE-BRANCH-TIER1-LETTERS.md — Letter 5',
    'Creator outreach. Engineering experiments. Fire Guild — Engineering Verification Crown Advisor candidate.',
    'bishop',
    { recipientName: 'Tom Stanton', priority: 'high', tags: ['tier-1', 'fire-guild'] }
  ),
  createOutboundDraft(
    'Olive Branch — Practical Engineering (Grady)',
    'olive_branch',
    'See BISHOP_DROPZONE/OLIVE-BRANCH-TIER1-LETTERS.md — Letter 6',
    'Creator outreach to Grady Hillhouse. Civil engineering education. Anvil Guild — Infrastructure Knowledge Crown Advisor candidate.',
    'bishop',
    { recipientName: 'Grady Hillhouse', recipientOrg: 'Practical Engineering', priority: 'high', tags: ['tier-1', 'anvil-guild'] }
  ),
  createOutboundDraft(
    'Olive Branch — Gear Down For What?',
    'olive_branch',
    'See BISHOP_DROPZONE/OLIVE-BRANCH-TIER1-LETTERS.md — Letter 7',
    'Creator outreach. Automotive engineering. Hammer Guild — Mechanical Repair Crown Advisor candidate.',
    'bishop',
    { recipientName: 'Gear Down For What?', priority: 'high', tags: ['tier-1', 'hammer-guild'] }
  ),
  createOutboundDraft(
    'Olive Branch — Mechanistic',
    'olive_branch',
    'See BISHOP_DROPZONE/OLIVE-BRANCH-TIER1-LETTERS.md — Letter 8',
    'Creator outreach. Mechanism design. Mechanical Guild Crown Advisor candidate (secondary to thang010146).',
    'bishop',
    { recipientName: 'Mechanistic', priority: 'high', tags: ['tier-1', 'mechanical-guild'] }
  ),

  // === SPECIAL ADVISORY LETTER ===
  createOutboundDraft(
    'Advisory Role Invitation — thang010146 (Mechanical Guild)',
    'advisory_letter',
    'See BISHOP_DROPZONE/SESSION-7E-THANG010146-ADVISORY-LETTER.md',
    'Crown Advisor invitation for Mechanical Guild. Founder\'s top advisory candidate. Requesting blessing, HexIsle analysis, and advisory role acceptance.',
    'bishop',
    { recipientName: 'thang010146', priority: 'critical', tags: ['advisory', 'mechanical-guild', 'crown'] }
  ),

  // === MELINDA FRENCH GATES — IWD-TIMED ===
  createOutboundDraft(
    'Partnership Proposal — Melinda French Gates (IWD-Timed)',
    'partnership_proposal',
    'See BISHOP_DROPZONE/SESSION-7E-MELINDA-FRENCH-GATES-LETTER.md',
    'IWD-timed letter to Melinda French Gates / Pivotal Ventures. References her March 8 LinkedIn post. Architecture for women\'s structural empowerment.',
    'bishop',
    {
      recipientName: 'Melinda French Gates',
      recipientOrg: 'Pivotal Ventures',
      channels: ['linkedin', 'email'],
      priority: 'critical',
      tags: ['iwd', 'pivotal', 'partnership', 'time-sensitive'],
    }
  ),

  // === ACADEMIC PAPERS ===
  createOutboundDraft(
    'Academic Paper — Areopagus Doctrine Architecture',
    'academic_paper',
    'See BISHOP_DROPZONE/ACADEMIC-PAPER-AREOPAGUS-DOCTRINE-ARCHITECTURE.md',
    'Full academic paper on the Areopagus Model: technology-mediated framework for cross-tradition doctrinal literacy and charitable action.',
    'bishop',
    {
      channels: ['cephas', 'substack'],
      priority: 'normal',
      innovationNumbers: [1517, 1518, 1519, 1520],
      tags: ['areopagus', 'academic', 'doctrine'],
    }
  ),

  // === BATTERY CAMPAIGNS ===
  createOutboundDraft(
    'Battery Campaign — Opening Gambit (7-Day Launch)',
    'battery_campaign',
    'TheBattery component — Opening Gambit campaign. 18 posts across 7 days.',
    'Opening Gambit social media launch campaign. Pain -> Vision -> Proof -> People -> Architecture -> Consolidation. 18 posts, multi-platform.',
    'bishop',
    {
      channels: ['battery'],
      priority: 'high',
      tags: ['launch', 'battery', 'opening-gambit'],
    }
  ),
  createOutboundDraft(
    'Battery Campaign — Grassroots Intelligence (5-Day Civic)',
    'battery_campaign',
    'TheBattery component — Grassroots Intelligence campaign. 15 posts across 5 days.',
    'Civic engagement campaign. Broken Petitions -> Effort Democracy -> Zero Demographics -> Muffled Rule -> Join. 15 posts, multi-platform.',
    'bishop',
    {
      channels: ['battery'],
      priority: 'normal',
      tags: ['civic', 'battery', 'grassroots'],
    }
  ),
  createOutboundDraft(
    'Battery Campaign — Little Red Hen Story (25-Post Narrative)',
    'battery_campaign',
    'TheBattery component — Little Red Hen Story campaign. 25 posts across 3 acts.',
    'Narrative story campaign across 3 acts. 25 posts with cumulative images building the story.',
    'bishop',
    {
      channels: ['battery'],
      priority: 'normal',
      tags: ['narrative', 'battery', 'little-red-hen'],
    }
  ),
];

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  OUTBOUND_STATUS_CONFIG,
  OUTBOUND_TYPE_CONFIG,
  SESSION_7E_LAUNCH_QUEUE,
  createOutboundDraft,
  insertOutboundDraft,
  submitForReview,
  stampItem,
  queueForDispatch,
  markDispatched,
  recordResponse,
  requestRevision,
  filterByStatus,
  getReadyForDispatch,
  getNeedingFollowUp,
  getAllDispatchItems,
  getQueueSummary,
};
