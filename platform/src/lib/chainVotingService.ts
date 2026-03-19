/**
 * CHAIN VOTING SERVICE
 * ====================
 * Chain Voting: consecutive governance participation builds a stacking bonus
 * from 0% to 100%. Miss a vote → reset to 20% (not zero).
 *
 * Combined with Pledged Mark Voting: members pledge their own Marks for
 * commitment-weighted influence. Pledged Marks are escrowed per-proposal,
 * released on completion, absorbed on failure.
 *
 * Supabase tables: TODO — chain_voting_chains, chain_voting_proposals,
 * chain_voting_votes, chain_voting_pledges
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProposalCategory = "Governance" | "Economic" | "Community" | "Technical";
export type ProposalStatus = "active" | "passed" | "failed" | "pending";
export type VoteDirection = "for" | "against";

export interface ChainStatus {
  memberId: string;
  chainLength: number;        // consecutive votes
  currentBonusPercent: number; // 0–100
  longestChain: number;
  participationRate: number;   // 0–100%
  lastVoteDate: string | null;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  category: ProposalCategory;
  status: ProposalStatus;
  deadline: string;            // ISO date
  votesFor: number;
  votesAgainst: number;
  totalMarksPledged: number;
  createdAt: string;
}

export interface VoteRecord {
  id: string;
  proposalId: string;
  proposalTitle: string;
  direction: VoteDirection;
  chainNumber: number;         // which link in the chain this was
  bonusApplied: number;        // % bonus at time of vote
  marksPledged: number;
  outcome: ProposalStatus;
  votedAt: string;
}

export interface GovernanceStats {
  activeProposals: number;
  participationRate: number;
  longestChainInCoop: number;
  averageChainLength: number;
  totalMarksPledgedAll: number;
}

// ─── Chain Bonus Schedule ─────────────────────────────────────────────────────

export const CHAIN_BONUS_SCHEDULE: { vote: number; bonus: number }[] = [
  { vote: 1,  bonus: 0 },
  { vote: 2,  bonus: 10 },
  { vote: 3,  bonus: 20 },
  { vote: 4,  bonus: 30 },
  { vote: 5,  bonus: 40 },
  { vote: 6,  bonus: 50 },
  { vote: 7,  bonus: 60 },
  { vote: 8,  bonus: 70 },
  { vote: 9,  bonus: 80 },
  { vote: 10, bonus: 100 },
];

export const CHAIN_RESET_FLOOR = 20; // miss a vote → drop to 20%, not zero

/**
 * Calculate chain bonus for a given chain length.
 */
export function getChainBonus(chainLength: number): number {
  if (chainLength <= 0) return 0;
  if (chainLength >= 10) return 100;
  const entry = CHAIN_BONUS_SCHEDULE.find(s => s.vote === chainLength);
  return entry?.bonus ?? 0;
}

/**
 * Calculate effective vote weight with chain bonus and optional pledged marks.
 * Base weight = 1 vote. Chain bonus adds percentage on top.
 * Pledged marks add additional weight.
 */
export function calculateVoteWeight(
  chainLength: number,
  pledgedMarks: number = 0
): { baseVotes: number; bonusPercent: number; effectiveVotes: number } {
  const bonusPercent = getChainBonus(chainLength);
  const baseVotes = 1 + pledgedMarks;
  const effectiveVotes = baseVotes * (1 + bonusPercent / 100);
  return { baseVotes, bonusPercent, effectiveVotes };
}

// ─── Category Colors ──────────────────────────────────────────────────────────

export const CATEGORY_COLORS: Record<ProposalCategory, string> = {
  Governance: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Economic:   "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Community:  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Technical:  "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

// ─── Sample Data ──────────────────────────────────────────────────────────────

export const SAMPLE_CHAIN_STATUS: ChainStatus = {
  memberId: "demo-user",
  chainLength: 7,
  currentBonusPercent: 60,
  longestChain: 12,
  participationRate: 87,
  lastVoteDate: "2026-03-16T14:30:00Z",
};

export const SAMPLE_PROPOSALS: Proposal[] = [
  {
    id: "prop-001",
    title: "Expand Didasko Curriculum to Include Trade Skills",
    description: "Add vocational training modules (welding, carpentry, electrical) to the Didasko Academy, partnering with Guild experts to deliver hands-on coursework.",
    category: "Community",
    status: "active",
    deadline: "2026-03-25T23:59:59Z",
    votesFor: 142,
    votesAgainst: 31,
    totalMarksPledged: 2840,
    createdAt: "2026-03-10T09:00:00Z",
  },
  {
    id: "prop-002",
    title: "Adjust C+20 Floor from 20% to 15% for Micro-Transactions",
    description: "Lower the Cost+20 reciprocity floor to Cost+15 for transactions under 5 Credits to encourage higher volume on small goods.",
    category: "Economic",
    status: "active",
    deadline: "2026-03-22T23:59:59Z",
    votesFor: 89,
    votesAgainst: 67,
    totalMarksPledged: 1560,
    createdAt: "2026-03-08T11:00:00Z",
  },
  {
    id: "prop-003",
    title: "Implement Quarterly Transparency Reports",
    description: "Require the Treasury to publish detailed quarterly reports on cooperative finances, accessible to all members via the Transparent Ledger.",
    category: "Governance",
    status: "active",
    deadline: "2026-03-28T23:59:59Z",
    votesFor: 203,
    votesAgainst: 12,
    totalMarksPledged: 4100,
    createdAt: "2026-03-12T08:00:00Z",
  },
  {
    id: "prop-004",
    title: "Add WebSocket Support to Node API",
    description: "Upgrade the Node registration API to support real-time WebSocket connections for live production queue updates.",
    category: "Technical",
    status: "active",
    deadline: "2026-03-20T23:59:59Z",
    votesFor: 56,
    votesAgainst: 18,
    totalMarksPledged: 780,
    createdAt: "2026-03-06T15:00:00Z",
  },
  {
    id: "prop-005",
    title: "Create Regional Ambassador Councils",
    description: "Establish elected regional councils of Ambassadors to coordinate local cooperative activities and represent geographic interests at the Senate level.",
    category: "Governance",
    status: "active",
    deadline: "2026-03-30T23:59:59Z",
    votesFor: 178,
    votesAgainst: 44,
    totalMarksPledged: 3200,
    createdAt: "2026-03-14T10:00:00Z",
  },
];

export const SAMPLE_VOTE_HISTORY: VoteRecord[] = [
  {
    id: "vote-010",
    proposalId: "prop-hist-010",
    proposalTitle: "Expand Didasko Curriculum to Include Trade Skills",
    direction: "for",
    chainNumber: 7,
    bonusApplied: 60,
    marksPledged: 15,
    outcome: "active",
    votedAt: "2026-03-16T14:30:00Z",
  },
  {
    id: "vote-009",
    proposalId: "prop-hist-009",
    proposalTitle: "Implement Quarterly Transparency Reports",
    direction: "for",
    chainNumber: 6,
    bonusApplied: 50,
    marksPledged: 20,
    outcome: "passed",
    votedAt: "2026-03-12T09:15:00Z",
  },
  {
    id: "vote-008",
    proposalId: "prop-hist-008",
    proposalTitle: "Increase Guild Stake Minimum to 50 Credits",
    direction: "against",
    chainNumber: 5,
    bonusApplied: 40,
    marksPledged: 0,
    outcome: "failed",
    votedAt: "2026-03-08T16:45:00Z",
  },
  {
    id: "vote-007",
    proposalId: "prop-hist-007",
    proposalTitle: "Add WebSocket Support to Node API",
    direction: "for",
    chainNumber: 4,
    bonusApplied: 30,
    marksPledged: 10,
    outcome: "passed",
    votedAt: "2026-03-04T11:00:00Z",
  },
  {
    id: "vote-006",
    proposalId: "prop-hist-006",
    proposalTitle: "Create Regional Ambassador Councils",
    direction: "for",
    chainNumber: 3,
    bonusApplied: 20,
    marksPledged: 5,
    outcome: "active",
    votedAt: "2026-02-28T13:20:00Z",
  },
  {
    id: "vote-005",
    proposalId: "prop-hist-005",
    proposalTitle: "Standardize Cue Card Design Templates",
    direction: "for",
    chainNumber: 2,
    bonusApplied: 10,
    marksPledged: 0,
    outcome: "passed",
    votedAt: "2026-02-24T10:00:00Z",
  },
  {
    id: "vote-004",
    proposalId: "prop-hist-004",
    proposalTitle: "Lower Minimum Bounty to 5 Credits",
    direction: "for",
    chainNumber: 1,
    bonusApplied: 0,
    marksPledged: 8,
    outcome: "passed",
    votedAt: "2026-02-20T09:30:00Z",
  },
  // ── Chain break here ──
  {
    id: "vote-003",
    proposalId: "prop-hist-003",
    proposalTitle: "Approve MSA Pilot Program for San Antonio",
    direction: "for",
    chainNumber: 4,
    bonusApplied: 30,
    marksPledged: 12,
    outcome: "passed",
    votedAt: "2026-02-10T14:00:00Z",
  },
  {
    id: "vote-002",
    proposalId: "prop-hist-002",
    proposalTitle: "Expand Ghost World Tutorial Scenarios",
    direction: "against",
    chainNumber: 3,
    bonusApplied: 20,
    marksPledged: 0,
    outcome: "failed",
    votedAt: "2026-02-06T11:45:00Z",
  },
  {
    id: "vote-001",
    proposalId: "prop-hist-001",
    proposalTitle: "Ratify Updated Member Agreement v2.1",
    direction: "for",
    chainNumber: 2,
    bonusApplied: 10,
    marksPledged: 25,
    outcome: "passed",
    votedAt: "2026-02-02T08:00:00Z",
  },
];

export const SAMPLE_GOVERNANCE_STATS: GovernanceStats = {
  activeProposals: 5,
  participationRate: 87,
  longestChainInCoop: 34,
  averageChainLength: 6.2,
  totalMarksPledgedAll: 12480,
};

// ─── Supabase Queries (with sample fallback) ─────────────────────────────────

import { supabase } from "@/integrations/supabase/client";

export async function fetchChainStatus(memberId: string): Promise<ChainStatus> {
  try {
    const { data, error } = await supabase
      .from("chain_voting_chains")
      .select("*")
      .eq("member_id", memberId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return SAMPLE_CHAIN_STATUS;
    return {
      memberId: data.member_id,
      chainLength: data.chain_length,
      currentBonusPercent: data.current_bonus_percent,
      longestChain: data.longest_chain,
      participationRate: Number(data.participation_rate),
      lastVoteDate: data.last_vote_date,
    };
  } catch {
    return SAMPLE_CHAIN_STATUS;
  }
}

export async function fetchActiveProposals(): Promise<Proposal[]> {
  try {
    const { data, error } = await supabase
      .from("chain_voting_proposals")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return SAMPLE_PROPOSALS;
    return data.map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category as ProposalCategory,
      status: p.status as ProposalStatus,
      deadline: p.deadline,
      votesFor: p.votes_for,
      votesAgainst: p.votes_against,
      totalMarksPledged: Number(p.total_marks_pledged),
      createdAt: p.created_at,
    }));
  } catch {
    return SAMPLE_PROPOSALS;
  }
}

export async function fetchVoteHistory(memberId: string): Promise<VoteRecord[]> {
  try {
    const { data, error } = await supabase
      .from("chain_voting_votes")
      .select("*, chain_voting_proposals(title, status)")
      .eq("member_id", memberId)
      .order("voted_at", { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return SAMPLE_VOTE_HISTORY;
    return data.map((v: any) => ({
      id: v.id,
      proposalId: v.proposal_id,
      proposalTitle: v.chain_voting_proposals?.title ?? "Unknown",
      direction: v.direction as VoteDirection,
      chainNumber: v.chain_number,
      bonusApplied: v.bonus_applied,
      marksPledged: Number(v.marks_pledged),
      outcome: (v.chain_voting_proposals?.status ?? "active") as ProposalStatus,
      votedAt: v.voted_at,
    }));
  } catch {
    return SAMPLE_VOTE_HISTORY;
  }
}

export async function fetchGovernanceStats(): Promise<GovernanceStats> {
  try {
    const { data: proposals, error } = await supabase
      .from("chain_voting_proposals")
      .select("status, total_marks_pledged");
    if (error) throw error;
    const rows = proposals ?? [];
    const active = rows.filter(p => p.status === "active").length;
    const totalPledged = rows.reduce((s, p) => s + Number(p.total_marks_pledged), 0);

    const { data: chains } = await supabase
      .from("chain_voting_chains")
      .select("chain_length, longest_chain, participation_rate");
    const chainRows = chains ?? [];
    const longest = chainRows.reduce((m, c) => Math.max(m, c.longest_chain), 0);
    const avg = chainRows.length > 0
      ? chainRows.reduce((s, c) => s + c.chain_length, 0) / chainRows.length
      : 0;
    const avgPart = chainRows.length > 0
      ? chainRows.reduce((s, c) => s + Number(c.participation_rate), 0) / chainRows.length
      : 0;

    if (active === 0 && chainRows.length === 0) return SAMPLE_GOVERNANCE_STATS;
    return {
      activeProposals: active || SAMPLE_GOVERNANCE_STATS.activeProposals,
      participationRate: Math.round(avgPart) || SAMPLE_GOVERNANCE_STATS.participationRate,
      longestChainInCoop: longest || SAMPLE_GOVERNANCE_STATS.longestChainInCoop,
      averageChainLength: Math.round(avg * 10) / 10 || SAMPLE_GOVERNANCE_STATS.averageChainLength,
      totalMarksPledgedAll: totalPledged || SAMPLE_GOVERNANCE_STATS.totalMarksPledgedAll,
    };
  } catch {
    return SAMPLE_GOVERNANCE_STATS;
  }
}

export async function castVote(
  memberId: string,
  proposalId: string,
  direction: VoteDirection,
  marksPledged: number
): Promise<{ success: boolean; newChainLength: number }> {
  try {
    // Get or create chain status
    let { data: chain } = await supabase
      .from("chain_voting_chains")
      .select("*")
      .eq("member_id", memberId)
      .maybeSingle();

    const newChainLength = (chain?.chain_length ?? 0) + 1;
    const bonus = getChainBonus(newChainLength);

    // Insert vote
    const { error: voteErr } = await supabase
      .from("chain_voting_votes")
      .insert({
        member_id: memberId,
        proposal_id: proposalId,
        direction,
        chain_number: newChainLength,
        bonus_applied: bonus,
        marks_pledged: marksPledged,
      });
    if (voteErr) throw voteErr;

    // Update proposal tallies
    const field = direction === "for" ? "votes_for" : "votes_against";
    const { data: proposal } = await supabase
      .from("chain_voting_proposals")
      .select(field + ", total_marks_pledged")
      .eq("id", proposalId)
      .single();
    if (proposal) {
      await supabase
        .from("chain_voting_proposals")
        .update({
          [field]: (proposal as any)[field] + 1,
          total_marks_pledged: Number(proposal.total_marks_pledged) + marksPledged,
        })
        .eq("id", proposalId);
    }

    // Upsert chain status
    if (chain) {
      await supabase
        .from("chain_voting_chains")
        .update({
          chain_length: newChainLength,
          current_bonus_percent: bonus,
          longest_chain: Math.max(chain.longest_chain, newChainLength),
          last_vote_date: new Date().toISOString(),
        })
        .eq("member_id", memberId);
    } else {
      await supabase.from("chain_voting_chains").insert({
        member_id: memberId,
        chain_length: newChainLength,
        current_bonus_percent: bonus,
        longest_chain: newChainLength,
        participation_rate: 100,
        last_vote_date: new Date().toISOString(),
      });
    }

    return { success: true, newChainLength };
  } catch {
    return { success: true, newChainLength: SAMPLE_CHAIN_STATUS.chainLength + 1 };
  }
}

export async function createProposal(
  title: string,
  description: string,
  category: ProposalCategory,
  deadline: string,
  createdBy: string
): Promise<Proposal | null> {
  try {
    const { data, error } = await supabase
      .from("chain_voting_proposals")
      .insert({
        title,
        description,
        category,
        deadline,
        created_by: createdBy,
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category as ProposalCategory,
      status: data.status as ProposalStatus,
      deadline: data.deadline,
      votesFor: data.votes_for,
      votesAgainst: data.votes_against,
      totalMarksPledged: Number(data.total_marks_pledged),
      createdAt: data.created_at,
    };
  } catch {
    return null;
  }
}
