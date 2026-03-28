import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/* ──────────────────────────────────────────────
 * SHARED TYPES
 * ────────────────────────────────────────────── */

type ErrorType = 'visual' | 'layout' | 'typo' | 'broken' | 'accessibility' | 'performance' | 'other';
type ErrorStatus = 'open' | 'documented' | 'fix_proposed' | 'fix_accepted' | 'resolved' | 'duplicate' | 'invalid';
type Severity = 'critical' | 'major' | 'minor' | 'cosmetic';
type FixType = 'css' | 'content' | 'layout' | 'functional' | 'other';
type BountyStatus = 'open' | 'claimed' | 'fulfilled' | 'expired' | 'cancelled';
type ProposalStatus = 'pending' | 'approved' | 'rejected' | 'implemented';

export interface ErrorReport {
  id: string;
  reporter_id: string;
  page_url: string;
  element_selector?: string;
  element_screenshot_url?: string;
  error_type: ErrorType;
  status: ErrorStatus;
  marks_allocated: number;
  created_at: string;
}

export interface ErrorDoc {
  id: string;
  error_id: string;
  documenter_id: string;
  description: string;
  expected_behavior?: string;
  browser_info?: string;
  device_info?: string;
  steps_to_reproduce?: string;
  severity?: Severity;
  marks_earned: number;
  created_at: string;
}

export interface FixProposal {
  id: string;
  error_id: string;
  proposer_id: string;
  fix_type: FixType;
  proposed_css?: string;
  proposed_html?: string;
  proposed_content?: string;
  description: string;
  marks_earned: number;
  status: ProposalStatus;
  created_at: string;
}

export interface Bounty {
  id: string;
  error_id?: string;
  creator_id: string;
  title: string;
  description: string;
  marks_reward: number;
  marks_pool: number;
  status: BountyStatus;
  fulfilled_by?: string;
  fulfilled_at?: string;
  expires_at?: string;
  created_at: string;
}

export interface AuctionEntry {
  id: string;
  fix_proposal_id?: string;
  element_overlay_id?: string;
  submitter_id: string;
  auction_cycle: string;
  title: string;
  nickname?: string;
  bid_total: number;
  display_duration_seconds: number;
  is_winner: boolean;
  created_at: string;
}

export interface DailyStats {
  id: string;
  user_id: string;
  stat_date: string;
  errors_found: number;
  errors_documented: number;
  fixes_proposed: number;
  bounties_created: number;
  bounties_fulfilled: number;
  marks_earned: number;
  streak_days: number;
}

/* ──────────────────────────────────────────────
 * HOOK: useErrorReports
 * ────────────────────────────────────────────── */

export function useErrorReports(pageUrl?: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const openErrors = useQuery({
    queryKey: ['error-reports', pageUrl ?? 'all'],
    queryFn: async () => {
      let q = supabase.from('error_reports' as never).select('*').order('created_at', { ascending: false });
      if (pageUrl) q = q.eq('page_url', pageUrl);
      const { data } = await q;
      return (data ?? []) as unknown as ErrorReport[];
    },
  });

  const myReports = useQuery({
    queryKey: ['error-reports', 'mine', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('error_reports' as never)
        .select('*')
        .eq('reporter_id', user!.id)
        .order('created_at', { ascending: false });
      return (data ?? []) as unknown as ErrorReport[];
    },
  });

  const reportError = useMutation({
    mutationFn: async (args: { pageUrl: string; elementSelector?: string; errorType: ErrorType }) => {
      const { data, error } = await supabase.from('error_reports' as never).insert({
        reporter_id: user!.id,
        page_url: args.pageUrl,
        element_selector: args.elementSelector,
        error_type: args.errorType,
      } as never).select().single();
      if (error) throw error;
      return data as unknown as ErrorReport;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['error-reports'] });
      qc.invalidateQueries({ queryKey: ['xray-daily-stats'] });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (args: { id: string; status: ErrorStatus }) => {
      const { error } = await supabase
        .from('error_reports' as never)
        .update({ status: args.status } as never)
        .eq('id', args.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['error-reports'] }),
  });

  return { openErrors, myReports, reportError, updateStatus };
}

/* ──────────────────────────────────────────────
 * HOOK: useErrorDocumentation
 * ────────────────────────────────────────────── */

export function useErrorDocumentation(errorId?: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const docs = useQuery({
    queryKey: ['error-documentation', errorId],
    enabled: !!errorId,
    queryFn: async () => {
      const { data } = await supabase
        .from('error_documentation' as never)
        .select('*')
        .eq('error_id', errorId!)
        .order('created_at', { ascending: false });
      return (data ?? []) as unknown as ErrorDoc[];
    },
  });

  const documentError = useMutation({
    mutationFn: async (args: {
      errorId: string;
      description: string;
      severity?: Severity;
      expectedBehavior?: string;
      stepsToReproduce?: string;
    }) => {
      const { data, error } = await supabase.from('error_documentation' as never).insert({
        error_id: args.errorId,
        documenter_id: user!.id,
        description: args.description,
        severity: args.severity,
        expected_behavior: args.expectedBehavior,
        steps_to_reproduce: args.stepsToReproduce,
        browser_info: navigator.userAgent,
        device_info: `${screen.width}x${screen.height}`,
      } as never).select().single();
      if (error) throw error;
      return data as unknown as ErrorDoc;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['error-documentation'] });
      qc.invalidateQueries({ queryKey: ['xray-daily-stats'] });
    },
  });

  return { docs, documentError };
}

/* ──────────────────────────────────────────────
 * HOOK: useFixProposals
 * ────────────────────────────────────────────── */

export function useFixProposals(errorId?: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const proposals = useQuery({
    queryKey: ['fix-proposals', errorId],
    enabled: !!errorId,
    queryFn: async () => {
      const { data } = await supabase
        .from('fix_proposals' as never)
        .select('*')
        .eq('error_id', errorId!)
        .order('created_at', { ascending: false });
      return (data ?? []) as unknown as FixProposal[];
    },
  });

  const proposeFix = useMutation({
    mutationFn: async (args: {
      errorId: string;
      fixType: FixType;
      description: string;
      proposedCss?: string;
      proposedHtml?: string;
      proposedContent?: string;
    }) => {
      const { data, error } = await supabase.from('fix_proposals' as never).insert({
        error_id: args.errorId,
        proposer_id: user!.id,
        fix_type: args.fixType,
        description: args.description,
        proposed_css: args.proposedCss,
        proposed_html: args.proposedHtml,
        proposed_content: args.proposedContent,
      } as never).select().single();
      if (error) throw error;
      return data as unknown as FixProposal;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fix-proposals'] });
      qc.invalidateQueries({ queryKey: ['xray-daily-stats'] });
    },
  });

  const approveProposal = useMutation({
    mutationFn: async (proposalId: string) => {
      const { error } = await supabase
        .from('fix_proposals' as never)
        .update({ status: 'approved' } as never)
        .eq('id', proposalId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fix-proposals'] }),
  });

  return { proposals, proposeFix, approveProposal };
}

/* ──────────────────────────────────────────────
 * HOOK: useBounties
 * ────────────────────────────────────────────── */

export function useBounties() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const openBounties = useQuery({
    queryKey: ['bounties', 'open'],
    queryFn: async () => {
      const { data } = await supabase
        .from('error_bounties' as never)
        .select('*')
        .eq('status', 'open')
        .order('marks_reward', { ascending: false });
      return (data ?? []) as unknown as Bounty[];
    },
  });

  const myBounties = useQuery({
    queryKey: ['bounties', 'mine', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('error_bounties' as never)
        .select('*')
        .eq('creator_id', user!.id)
        .order('created_at', { ascending: false });
      return (data ?? []) as unknown as Bounty[];
    },
  });

  const createBounty = useMutation({
    mutationFn: async (args: {
      title: string;
      description: string;
      marksReward: number;
      errorId?: string;
      expiresAt?: string;
    }) => {
      const { data, error } = await supabase.from('error_bounties' as never).insert({
        creator_id: user!.id,
        title: args.title,
        description: args.description,
        marks_reward: args.marksReward,
        marks_pool: args.marksReward,
        error_id: args.errorId,
        expires_at: args.expiresAt,
      } as never).select().single();
      if (error) throw error;
      return data as unknown as Bounty;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bounties'] }),
  });

  const contributeToBounty = useMutation({
    mutationFn: async (args: { bountyId: string; marksAmount: number }) => {
      const { error } = await supabase.from('bounty_contributions' as never).insert({
        bounty_id: args.bountyId,
        contributor_id: user!.id,
        marks_amount: args.marksAmount,
      } as never);
      if (error) throw error;
      // Also increment the pool total
      const { error: upErr } = await supabase.rpc('increment_bounty_pool' as never, {
        p_bounty_id: args.bountyId,
        p_amount: args.marksAmount,
      } as never);
      if (upErr) {
        // Fallback: direct update if RPC doesn't exist yet
        await supabase
          .from('error_bounties' as never)
          .update({ marks_pool: args.marksAmount } as never)
          .eq('id', args.bountyId);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bounties'] }),
  });

  const fulfillBounty = useMutation({
    mutationFn: async (bountyId: string) => {
      const { error } = await supabase
        .from('error_bounties' as never)
        .update({
          status: 'fulfilled',
          fulfilled_by: user!.id,
          fulfilled_at: new Date().toISOString(),
        } as never)
        .eq('id', bountyId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bounties'] });
      qc.invalidateQueries({ queryKey: ['xray-daily-stats'] });
    },
  });

  return { openBounties, myBounties, createBounty, contributeToBounty, fulfillBounty };
}

/* ──────────────────────────────────────────────
 * HOOK: useDesignAuction
 * ────────────────────────────────────────────── */

export function useDesignAuction() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const todayISO = new Date().toISOString().slice(0, 10);

  const todayAuction = useQuery({
    queryKey: ['auction', 'today', todayISO],
    queryFn: async () => {
      const { data } = await supabase
        .from('design_auction_entries' as never)
        .select('*')
        .eq('auction_cycle', todayISO)
        .order('bid_total', { ascending: false });
      return (data ?? []) as unknown as AuctionEntry[];
    },
  });

  const winners = useQuery({
    queryKey: ['auction', 'winners'],
    queryFn: async () => {
      const { data } = await supabase
        .from('design_auction_entries' as never)
        .select('*')
        .eq('is_winner', true)
        .order('auction_cycle', { ascending: false })
        .limit(20);
      return (data ?? []) as unknown as AuctionEntry[];
    },
  });

  const submitEntry = useMutation({
    mutationFn: async (args: {
      title: string;
      nickname?: string;
      fixProposalId?: string;
      overlayId?: string;
    }) => {
      const { data, error } = await supabase.from('design_auction_entries' as never).insert({
        submitter_id: user!.id,
        auction_cycle: todayISO,
        title: args.title,
        nickname: args.nickname,
        fix_proposal_id: args.fixProposalId,
        element_overlay_id: args.overlayId,
      } as never).select().single();
      if (error) throw error;
      return data as unknown as AuctionEntry;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auction'] }),
  });

  const bidOnEntry = useMutation({
    mutationFn: async (args: { entryId: string; marksWeight: number }) => {
      const { error } = await supabase.from('auction_bids' as never).insert({
        entry_id: args.entryId,
        bidder_id: user!.id,
        marks_weight: args.marksWeight,
      } as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auction'] }),
  });

  return { todayAuction, winners, submitEntry, bidOnEntry };
}

/* ──────────────────────────────────────────────
 * HOOK: useDailyTracker
 * ────────────────────────────────────────────── */

export function useDailyTracker() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const todayISO = new Date().toISOString().slice(0, 10);

  const dailyStats = useQuery({
    queryKey: ['xray-daily-stats', user?.id, todayISO],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('xray_daily_stats' as never)
        .select('*')
        .eq('user_id', user!.id)
        .eq('stat_date', todayISO)
        .maybeSingle();
      return (data ?? {
        errors_found: 0,
        errors_documented: 0,
        fixes_proposed: 0,
        bounties_created: 0,
        bounties_fulfilled: 0,
        marks_earned: 0,
        streak_days: 0,
      }) as unknown as DailyStats;
    },
  });

  const leaderboard = useQuery({
    queryKey: ['xray-leaderboard', todayISO],
    queryFn: async () => {
      const { data } = await supabase
        .from('xray_daily_stats' as never)
        .select('user_id, marks_earned, streak_days, errors_found, fixes_proposed')
        .eq('stat_date', todayISO)
        .order('marks_earned', { ascending: false })
        .limit(25);
      return (data ?? []) as unknown as DailyStats[];
    },
  });

  const incrementStat = useMutation({
    mutationFn: async (statType: 'errors_found' | 'errors_documented' | 'fixes_proposed' | 'bounties_created' | 'bounties_fulfilled') => {
      const { data: existing } = await supabase
        .from('xray_daily_stats' as never)
        .select('*')
        .eq('user_id', user!.id)
        .eq('stat_date', todayISO)
        .maybeSingle();

      if (existing) {
        const current = (existing as Record<string, number>)[statType] ?? 0;
        await supabase
          .from('xray_daily_stats' as never)
          .update({
            [statType]: current + 1,
            marks_earned: ((existing as Record<string, number>).marks_earned ?? 0) + 1,
          } as never)
          .eq('user_id', user!.id)
          .eq('stat_date', todayISO);
      } else {
        await supabase.from('xray_daily_stats' as never).insert({
          user_id: user!.id,
          stat_date: todayISO,
          [statType]: 1,
          marks_earned: 1,
          streak_days: 1,
        } as never);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['xray-daily-stats'] }),
  });

  return { dailyStats, leaderboard, incrementStat };
}

/* ──────────────────────────────────────────────
 * COMBINED HOOK
 * ────────────────────────────────────────────── */

export function useXRayBountyArena(pageUrl?: string) {
  const errorReports = useErrorReports(pageUrl);
  const errorDocumentation = useErrorDocumentation();
  const fixProposals = useFixProposals();
  const bounties = useBounties();
  const designAuction = useDesignAuction();
  const dailyTracker = useDailyTracker();

  return {
    ...errorReports,
    ...errorDocumentation,
    ...fixProposals,
    ...bounties,
    ...designAuction,
    ...dailyTracker,
  };
}
