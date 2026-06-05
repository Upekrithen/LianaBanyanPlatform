/**
 * IP Ledger Service
 *
 * Immutable, hash-chained records for critical platform data.
 * Every innovation, medallion mint, and governance decision is logged
 * with cryptographic integrity.
 */

import { supabase } from '@/integrations/supabase/client';

export interface IPLedgerEntry {
  id: string;
  sequence_number: number;
  entry_type: IPLedgerEntryType;
  entry_data: Record<string, unknown>;
  previous_hash: string | null;
  current_hash: string;
  created_at: string;
}

export type IPLedgerEntryType =
  | 'innovation.registered'
  | 'medallion.minted'
  | 'governance.decision'
  | 'content.created'
  | 'content.updated'
  | 'patent.filed'
  | 'patent.granted'
  | 'sponsor.allocated'
  | 'metric.recorded'
  // Branch reconciliation (git-model, scope 25)
  | 'branch.merge'       // co-author merge: two branches unified, both credited
  | 'branch.diverge'     // diverge/divide: branch splits, both paths preserved
  | 'branch.fork'        // compete/fork-and-vote: members fork and community votes
  | 'branch.vote'        // vote recorded on a fork competition
  | 'intent.beacon'      // MoneyPenny auto-notify: intent broadcast before major change
  // Economy / Bounty (Wave 26)
  | 'bounty.posted'      // bounty posted to help-wanted board
  | 'bounty.claimed'     // member claimed an open bounty
  | 'bounty.submitted'   // claimant submitted work for review
  | 'bounty.verified'    // work verified; Marks awarded
  | 'bounty.rejected'    // submission rejected; bounty re-opened
  | 'marks.redeemed'     // Marks converted to Credits
  // Pedestal (Wave 26)
  | 'pedestal.nominated' // member nominated work for Pedestal consideration
  | 'pedestal.ratified'  // Pedestal ratified by governance
  // Anchor spinout (Wave 22 Phase B)
  | 'anchor.created'     // member bound content to a permanent yoke-bridge URN
  | 'anchor.shared'      // member shared an anchor URN to another surface
  | 'anchor.built_on'    // member extended an existing anchor (cite-and-extend)
  // CAI Bonfire spinout (Wave 22 Phase B)
  | 'cai.contribution';  // member submitted a prompt, training example, or evaluation

/**
 * Generate SHA-256 hash for ledger entry
 */
async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get the latest entry from the IP Ledger
 */
export async function getLatestEntry(): Promise<IPLedgerEntry | null> {
  const { data, error } = await supabase
    .from('ip_ledger')
    .select('*')
    .order('sequence_number', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching latest IP Ledger entry:', error);
    return null;
  }

  return data as IPLedgerEntry | null;
}

/**
 * Add a new entry to the IP Ledger with hash chain integrity
 */
export async function addToIPLedger(
  entryType: IPLedgerEntryType,
  entryData: Record<string, unknown>
): Promise<IPLedgerEntry | null> {
  try {
    const latestEntry = await getLatestEntry();
    const previousHash = latestEntry?.current_hash || null;
    const sequenceNumber = (latestEntry?.sequence_number || 0) + 1;

    const dataToHash = JSON.stringify({
      sequence_number: sequenceNumber,
      entry_type: entryType,
      entry_data: entryData,
      previous_hash: previousHash,
      timestamp: new Date().toISOString()
    });

    const currentHash = await generateHash(dataToHash);

    const { data, error } = await supabase
      .from('ip_ledger')
      .insert({
        sequence_number: sequenceNumber,
        entry_type: entryType,
        entry_data: entryData,
        previous_hash: previousHash,
        current_hash: currentHash
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding to IP Ledger:', error);
      return null;
    }

    return data as IPLedgerEntry;
  } catch (err) {
    console.error('Exception adding to IP Ledger:', err);
    return null;
  }
}

/**
 * Verify the integrity of the IP Ledger chain
 */
export async function verifyLedgerIntegrity(): Promise<{
  valid: boolean;
  brokenAt?: number;
  message: string;
}> {
  const { data: entries, error } = await supabase
    .from('ip_ledger')
    .select('*')
    .order('sequence_number', { ascending: true });

  if (error) {
    return { valid: false, message: `Error fetching ledger: ${error.message}` };
  }

  if (!entries || entries.length === 0) {
    return { valid: true, message: 'Ledger is empty' };
  }

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i] as IPLedgerEntry;

    if (i === 0 && entry.previous_hash !== null) {
      return {
        valid: false,
        brokenAt: entry.sequence_number,
        message: 'First entry should have null previous_hash'
      };
    }

    if (i > 0) {
      const previousEntry = entries[i - 1] as IPLedgerEntry;
      if (entry.previous_hash !== previousEntry.current_hash) {
        return {
          valid: false,
          brokenAt: entry.sequence_number,
          message: `Hash chain broken at sequence ${entry.sequence_number}`
        };
      }
    }
  }

  return {
    valid: true,
    message: `Ledger verified: ${entries.length} entries, chain intact`
  };
}

/**
 * Get ledger entries by type
 */
export async function getLedgerEntriesByType(
  entryType: IPLedgerEntryType,
  limit = 100
): Promise<IPLedgerEntry[]> {
  const { data, error } = await supabase
    .from('ip_ledger')
    .select('*')
    .eq('entry_type', entryType)
    .order('sequence_number', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching ledger entries:', error);
    return [];
  }

  return (data || []) as IPLedgerEntry[];
}

/**
 * Get ledger statistics
 */
export async function getLedgerStats(): Promise<{
  totalEntries: number;
  entriesByType: Record<string, number>;
  latestSequence: number;
  chainValid: boolean;
}> {
  const { data: entries, error } = await supabase
    .from('ip_ledger')
    .select('entry_type, sequence_number');

  if (error || !entries) {
    return {
      totalEntries: 0,
      entriesByType: {},
      latestSequence: 0,
      chainValid: false
    };
  }

  const entriesByType: Record<string, number> = {};
  let latestSequence = 0;

  for (const entry of entries) {
    const type = (entry as { entry_type: string }).entry_type;
    entriesByType[type] = (entriesByType[type] || 0) + 1;
    const seq = (entry as { sequence_number: number }).sequence_number;
    if (seq > latestSequence) latestSequence = seq;
  }

  const integrity = await verifyLedgerIntegrity();

  return {
    totalEntries: entries.length,
    entriesByType,
    latestSequence,
    chainValid: integrity.valid
  };
}

/**
 * Log an innovation registration
 */
export async function logInnovation(
  innovationNumber: number,
  title: string,
  category: string,
  description?: string
): Promise<IPLedgerEntry | null> {
  return addToIPLedger('innovation.registered', {
    innovation_number: innovationNumber,
    title,
    category,
    description,
    registered_at: new Date().toISOString()
  });
}

/**
 * Log a medallion mint
 */
export async function logMedallionMint(
  medallionId: string,
  userId: string,
  tier: string,
  value: number
): Promise<IPLedgerEntry | null> {
  return addToIPLedger('medallion.minted', {
    medallion_id: medallionId,
    user_id: userId,
    tier,
    value,
    minted_at: new Date().toISOString()
  });
}

// ─── Branch Reconciliation (Scope 25 / BP072 Wave 3) ─────────────────────────

/**
 * Represents a branch in the IP-Ledger git-model.
 * Provenance tracking only -- not a legal patent grant.
 * Counsel-gated before any Contributor Contract is enforceable.
 */
export interface IPBranchRecord {
  branch_id: string;
  base_innovation_ref: number;
  branch_label: string;
  created_by: string;       // member ID
  co_authors: string[];     // member IDs credited on the merge
  status: 'active' | 'merged' | 'diverged' | 'forked' | 'archived';
  parent_branch_id?: string;
  fork_vote_closes_at?: string;
  fork_vote_winner?: string; // branch_id that won the vote (if forked)
}

/**
 * An intent beacon -- broadcast before major changes so MoneyPenny can notify
 * affected members. Non-binding; provenance, not a veto.
 */
export interface IntentBeacon {
  beacon_id: string;
  innovation_ref: number;
  branch_id?: string;
  intent_type: 'merge' | 'diverge' | 'fork' | 'archive' | 'patent_file';
  summary: string;          // plain-language description (<200 chars)
  initiated_by: string;     // member ID
  notify_members: string[]; // member IDs to notify
  beacon_at: string;        // ISO timestamp
}

/**
 * Log a branch merge (co-author model).
 * Both authors are credited; the merged content becomes a single ledger node.
 */
export async function recordBranchMerge(opts: {
  baseInnovationRef: number;
  branchId: string;
  mergedBranchId: string;
  coAuthors: string[];
  summary: string;
}): Promise<IPLedgerEntry | null> {
  return addToIPLedger('branch.merge', {
    base_innovation_ref: opts.baseInnovationRef,
    branch_id: opts.branchId,
    merged_branch_id: opts.mergedBranchId,
    co_authors: opts.coAuthors,
    summary: opts.summary,
    merged_at: new Date().toISOString(),
    note: 'Provenance record only -- not a legal patent grant. Counsel-gated.',
  });
}

/**
 * Log a branch divergence (divide model).
 * The original branch splits into two; both paths are preserved with attribution.
 */
export async function recordBranchDivergence(opts: {
  baseInnovationRef: number;
  sourceBranchId: string;
  newBranchIds: [string, string];
  initiatedBy: string;
  rationale: string;
}): Promise<IPLedgerEntry | null> {
  return addToIPLedger('branch.diverge', {
    base_innovation_ref: opts.baseInnovationRef,
    source_branch_id: opts.sourceBranchId,
    new_branch_ids: opts.newBranchIds,
    initiated_by: opts.initiatedBy,
    rationale: opts.rationale,
    diverged_at: new Date().toISOString(),
  });
}

/**
 * Log a fork competition (fork-and-vote model).
 * Members create competing branches; community votes selects the canonical path.
 * Securities-clean: fork votes are participation, not equity.
 */
export async function recordBranchFork(opts: {
  baseInnovationRef: number;
  forkBranchIds: string[];
  initiatedBy: string;
  voteClosesAt: string;
  description: string;
}): Promise<IPLedgerEntry | null> {
  return addToIPLedger('branch.fork', {
    base_innovation_ref: opts.baseInnovationRef,
    fork_branch_ids: opts.forkBranchIds,
    initiated_by: opts.initiatedBy,
    vote_closes_at: opts.voteClosesAt,
    description: opts.description,
    forked_at: new Date().toISOString(),
    note: 'Fork votes are cooperative participation -- not equity, not guaranteed payout.',
  });
}

/**
 * Record a member vote in a fork competition.
 */
export async function recordBranchVote(opts: {
  baseInnovationRef: number;
  forkCompetitionLedgerSeq: number;
  votedBranchId: string;
  votedBy: string;
  rationale?: string;
}): Promise<IPLedgerEntry | null> {
  return addToIPLedger('branch.vote', {
    base_innovation_ref: opts.baseInnovationRef,
    fork_competition_seq: opts.forkCompetitionLedgerSeq,
    voted_branch_id: opts.votedBranchId,
    voted_by: opts.votedBy,
    rationale: opts.rationale ?? null,
    voted_at: new Date().toISOString(),
  });
}

/**
 * Emit an intent beacon -- MoneyPenny auto-notifies affected members.
 * Call before any major branch operation so members can respond before action.
 */
export async function emitIntentBeacon(opts: {
  innovationRef: number;
  branchId?: string;
  intentType: IntentBeacon['intent_type'];
  summary: string;
  initiatedBy: string;
  notifyMembers: string[];
}): Promise<IPLedgerEntry | null> {
  return addToIPLedger('intent.beacon', {
    innovation_ref: opts.innovationRef,
    branch_id: opts.branchId ?? null,
    intent_type: opts.intentType,
    summary: opts.summary.slice(0, 200),
    initiated_by: opts.initiatedBy,
    notify_members: opts.notifyMembers,
    beacon_at: new Date().toISOString(),
    note: 'MoneyPenny will notify listed members. Non-binding intent beacon.',
  });
}

// ─── Economy / Bounty (Wave 26) ───────────────────────────────────────────────

/**
 * Log a bounty verification / completion with Brand Stamp.
 * Provenance record: contributor retains attribution; platform receives
 * non-exclusive license to use the delivered work.
 * "Provenance, not legal patent grant."
 */
export async function logBountyCompletion(opts: {
  bountyId: string;
  bountyTitle: string;
  bountyClass: string;
  claimantId: string;
  marksAwarded: number;
  workDescription: string;
  provenanceNote?: string;
}): Promise<IPLedgerEntry | null> {
  return addToIPLedger('bounty.verified', {
    bounty_id: opts.bountyId,
    bounty_title: opts.bountyTitle,
    bounty_class: opts.bountyClass,
    claimant_id: opts.claimantId,
    marks_awarded: opts.marksAwarded,
    work_description: opts.workDescription,
    brand_stamp_applied: true,
    ip_ownership_note: 'Contributor retains attribution; platform receives non-exclusive license.',
    provenance_note: opts.provenanceNote ?? 'Provenance, not legal patent grant.',
    verified_at: new Date().toISOString(),
  });
}

/**
 * Log a Marks-to-Credits redemption event.
 * Securities-clean: participation credits that reduce Cost+20% purchases.
 */
export async function logMarksRedemption(opts: {
  memberId: string;
  marksSpent: number;
  creditsReceived: number;
  purchaseContext?: string;
}): Promise<IPLedgerEntry | null> {
  return addToIPLedger('marks.redeemed', {
    member_id: opts.memberId,
    marks_spent: opts.marksSpent,
    credits_received: opts.creditsReceived,
    purchase_context: opts.purchaseContext ?? null,
    redemption_note: 'Participation credits reducing Cost+20% purchase. Not financial return.',
    redeemed_at: new Date().toISOString(),
  });
}

/**
 * Log a Pedestal nomination by a member.
 */
export async function logPedestalNomination(opts: {
  nominatedBy: string;
  workTitle: string;
  workDescription: string;
  bountyRef?: string;
  ipLedgerRef?: number;
}): Promise<IPLedgerEntry | null> {
  return addToIPLedger('pedestal.nominated', {
    nominated_by: opts.nominatedBy,
    work_title: opts.workTitle,
    work_description: opts.workDescription,
    bounty_ref: opts.bountyRef ?? null,
    ip_ledger_ref: opts.ipLedgerRef ?? null,
    nominated_at: new Date().toISOString(),
  });
}

// ─── Anchor Spinout (Wave 22 Phase B) ────────────────────────────────────────

/**
 * Log anchor creation -- a member bound content to a permanent yoke-bridge URN.
 * Every anchor is a provenance record in the hash-chained IP-Ledger.
 */
export async function logAnchorCreated(opts: {
  anchorUrn: string;
  createdBy: string;
  contentType: string;
  contentRef?: string;
  title?: string;
}): Promise<IPLedgerEntry | null> {
  return addToIPLedger('anchor.created', {
    anchor_urn: opts.anchorUrn,
    created_by: opts.createdBy,
    content_type: opts.contentType,
    content_ref: opts.contentRef ?? null,
    title: opts.title ?? null,
    created_at: new Date().toISOString(),
    note: 'Provenance record. Anchor URN is permanent via yoke-bridge protocol.',
  });
}

/**
 * Log an anchor share -- a member shared an anchor URN to another surface.
 */
export async function logAnchorShared(opts: {
  anchorUrn: string;
  sharedBy: string;
  targetSurface: string;
}): Promise<IPLedgerEntry | null> {
  return addToIPLedger('anchor.shared', {
    anchor_urn: opts.anchorUrn,
    shared_by: opts.sharedBy,
    target_surface: opts.targetSurface,
    shared_at: new Date().toISOString(),
  });
}

/**
 * Log an anchor extension -- a member built new content on top of an existing anchor.
 * The original anchor creator earns Marks when their anchor is built upon.
 * Marks = cooperative participation -- NOT A FINANCIAL RETURN.
 */
export async function logAnchorBuiltOn(opts: {
  baseAnchorUrn: string;
  newAnchorUrn: string;
  builtBy: string;
  originalCreatorId: string;
  summary: string;
}): Promise<IPLedgerEntry | null> {
  return addToIPLedger('anchor.built_on', {
    base_anchor_urn: opts.baseAnchorUrn,
    new_anchor_urn: opts.newAnchorUrn,
    built_by: opts.builtBy,
    original_creator_id: opts.originalCreatorId,
    summary: opts.summary,
    built_at: new Date().toISOString(),
    marks_note: 'Marks for anchor creator = cooperative participation, NOT A FINANCIAL RETURN.',
  });
}

// ─── CAI Bonfire Spinout (Wave 22 Phase B) ───────────────────────────────────

/**
 * Log a CAI Bonfire contribution -- prompt, training data, or evaluation.
 * Every contribution is IP-Ledger logged for provenance and attribution.
 * Marks for quality contributions = cooperative participation, NOT A FINANCIAL RETURN.
 */
export async function logCaiBonfireContribution(opts: {
  contributionId: string;
  contributedBy: string;
  contributionType: 'prompt' | 'training_data' | 'evaluation' | 'benchmark';
  title: string;
  modelRef?: string;
  computeCostUsd?: number;
}): Promise<IPLedgerEntry | null> {
  return addToIPLedger('cai.contribution', {
    contribution_id: opts.contributionId,
    contributed_by: opts.contributedBy,
    contribution_type: opts.contributionType,
    title: opts.title,
    model_ref: opts.modelRef ?? null,
    compute_cost_usd: opts.computeCostUsd ?? null,
    contributed_at: new Date().toISOString(),
    pricing_note: 'Compute at Cost+20%. Full cost disclosed before any run authorized.',
    marks_note: 'Marks for quality contributions = cooperative participation, NOT A FINANCIAL RETURN.',
  });
}

/**
 * Log a governance decision
 */
export async function logGovernanceDecision(
  decisionType: string,
  description: string,
  votingResult?: Record<string, unknown>
): Promise<IPLedgerEntry | null> {
  return addToIPLedger('governance.decision', {
    decision_type: decisionType,
    description,
    voting_result: votingResult,
    decided_at: new Date().toISOString()
  });
}
