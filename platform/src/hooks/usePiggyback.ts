import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/* ──────────────────────────────────────────────
 * TYPES
 * ────────────────────────────────────────────── */

type ImprovementType =
  | 'tolerance_fix' | 'print_orientation' | 'fdm_optimization' | 'material_change'
  | 'mechanism_redesign' | 'new_function' | 'aesthetic_improvement' | 'assembly_simplification'
  | 'cost_reduction' | 'other';

type TierSlug =
  | 'tereno_certified' | 'tereno_approved' | 'hexisle_official'
  | 'hexisle_compatible' | 'hexisle_adaptable' | 'hexisle_inspired';

type SubmissionStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'revision_requested' | 'promoted';
type ReviewAction = 'approve' | 'reject' | 'request_revision' | 'promote' | 'assign_tier';

export interface PiggybackSubmission {
  id: string;
  submitter_id: string;
  original_download_id: string | null;
  title: string;
  description: string;
  improvement_type: ImprovementType;
  stl_url: string | null;
  photo_urls: string[];
  video_url: string | null;
  test_results: string | null;
  printer_used: string | null;
  material_used: string | null;
  print_settings: string | null;
  proposed_tier: TierSlug | null;
  assigned_tier: TierSlug | null;
  status: SubmissionStatus;
  reviewer_id: string | null;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  marks_awarded: number;
  is_process_pioneer: boolean;
  ip_ledger_entry: string | null;
  created_at: string;
  updated_at: string;
}

export interface PiggybackReview {
  id: string;
  submission_id: string;
  reviewer_id: string;
  action: ReviewAction;
  tier_assigned: TierSlug | null;
  notes: string | null;
  created_at: string;
}

export const TIER_MARKS: Record<TierSlug, number> = {
  hexisle_inspired: 25,
  hexisle_adaptable: 50,
  hexisle_compatible: 75,
  hexisle_official: 100,
  tereno_approved: 150,
  tereno_certified: 200,
};

export const TIER_LABELS: Record<TierSlug, string> = {
  tereno_certified: 'Tereno Certified',
  tereno_approved: 'Tereno Approved',
  hexisle_official: 'HexIsle Official',
  hexisle_compatible: 'HexIsle Compatible',
  hexisle_adaptable: 'HexIsle Adaptable',
  hexisle_inspired: 'HexIsle Inspired',
};

export const IMPROVEMENT_TYPE_LABELS: Record<ImprovementType, string> = {
  tolerance_fix: 'Tolerance Fix',
  print_orientation: 'Print Orientation',
  fdm_optimization: 'FDM Optimization',
  material_change: 'Material Change',
  mechanism_redesign: 'Mechanism Redesign',
  new_function: 'New Function',
  aesthetic_improvement: 'Aesthetic Improvement',
  assembly_simplification: 'Assembly Simplification',
  cost_reduction: 'Cost Reduction',
  other: 'Other',
};

/* ──────────────────────────────────────────────
 * HOOK: useSubmissions — CRUD for piggyback submissions
 * ────────────────────────────────────────────── */

export function useSubmissions(downloadId?: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const mySubmissions = useQuery({
    queryKey: ['piggyback-submissions', 'mine', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('piggyback_submissions' as never)
        .select('*')
        .eq('submitter_id', user!.id)
        .order('created_at', { ascending: false });
      return (data ?? []) as unknown as PiggybackSubmission[];
    },
  });

  const approvedSubmissions = useQuery({
    queryKey: ['piggyback-submissions', 'approved', downloadId ?? 'all'],
    queryFn: async () => {
      let q = supabase
        .from('piggyback_submissions' as never)
        .select('*')
        .in('status', ['approved', 'promoted'])
        .order('created_at', { ascending: false });
      if (downloadId) q = q.eq('original_download_id', downloadId);
      const { data } = await q;
      return (data ?? []) as unknown as PiggybackSubmission[];
    },
  });

  const submitImprovement = useMutation({
    mutationFn: async (args: {
      originalDownloadId?: string;
      title: string;
      description: string;
      improvementType: ImprovementType;
      stlUrl?: string;
      photoUrls?: string[];
      videoUrl?: string;
      testResults?: string;
      printerUsed?: string;
      materialUsed?: string;
      printSettings?: string;
      proposedTier?: TierSlug;
    }) => {
      const { data, error } = await supabase
        .from('piggyback_submissions' as never)
        .insert({
          submitter_id: user!.id,
          original_download_id: args.originalDownloadId ?? null,
          title: args.title,
          description: args.description,
          improvement_type: args.improvementType,
          stl_url: args.stlUrl ?? null,
          photo_urls: args.photoUrls ?? [],
          video_url: args.videoUrl ?? null,
          test_results: args.testResults ?? null,
          printer_used: args.printerUsed ?? null,
          material_used: args.materialUsed ?? null,
          print_settings: args.printSettings ?? null,
          proposed_tier: args.proposedTier ?? null,
        } as never)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as PiggybackSubmission;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['piggyback-submissions'] });
    },
  });

  const updateSubmission = useMutation({
    mutationFn: async (args: { id: string; updates: Partial<Record<string, unknown>> }) => {
      const { error } = await supabase
        .from('piggyback_submissions' as never)
        .update({ ...args.updates, updated_at: new Date().toISOString() } as never)
        .eq('id', args.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['piggyback-submissions'] }),
  });

  return { mySubmissions, approvedSubmissions, submitImprovement, updateSubmission };
}

/* ──────────────────────────────────────────────
 * HOOK: useReviewQueue — admin review workflow
 * ────────────────────────────────────────────── */

export function useReviewQueue() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const pendingReviews = useQuery({
    queryKey: ['piggyback-reviews', 'pending'],
    queryFn: async () => {
      const { data } = await supabase
        .from('piggyback_submissions' as never)
        .select('*')
        .eq('status', 'submitted')
        .order('created_at', { ascending: true });
      return (data ?? []) as unknown as PiggybackSubmission[];
    },
  });

  const allReviewable = useQuery({
    queryKey: ['piggyback-reviews', 'all-reviewable'],
    queryFn: async () => {
      const { data } = await supabase
        .from('piggyback_submissions' as never)
        .select('*')
        .in('status', ['submitted', 'under_review'])
        .order('created_at', { ascending: true });
      return (data ?? []) as unknown as PiggybackSubmission[];
    },
  });

  const reviewSubmission = useMutation({
    mutationFn: async (args: {
      submissionId: string;
      action: ReviewAction;
      tier?: TierSlug;
      notes?: string;
    }) => {
      // Create review record
      const { error: rErr } = await supabase
        .from('piggyback_reviews' as never)
        .insert({
          submission_id: args.submissionId,
          reviewer_id: user!.id,
          action: args.action,
          tier_assigned: args.tier ?? null,
          notes: args.notes ?? null,
        } as never);
      if (rErr) throw rErr;

      // Map action to status + compute marks
      let newStatus: SubmissionStatus = 'under_review';
      let marks = 0;
      const tier = args.tier;

      switch (args.action) {
        case 'approve':
          newStatus = 'approved';
          marks = tier ? TIER_MARKS[tier] : 25;
          break;
        case 'reject':
          newStatus = 'rejected';
          break;
        case 'request_revision':
          newStatus = 'revision_requested';
          break;
        case 'promote':
          newStatus = 'promoted';
          marks = tier ? TIER_MARKS[tier] + 50 : 100; // bonus for promotion
          break;
        case 'assign_tier':
          newStatus = 'approved';
          marks = tier ? TIER_MARKS[tier] : 0;
          break;
      }

      // Update submission status
      const updatePayload: Record<string, unknown> = {
        status: newStatus,
        reviewer_id: user!.id,
        reviewer_notes: args.notes ?? null,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (marks > 0) updatePayload.marks_awarded = marks;
      if (tier) updatePayload.assigned_tier = tier;

      const { error: uErr } = await supabase
        .from('piggyback_submissions' as never)
        .update(updatePayload as never)
        .eq('id', args.submissionId);
      if (uErr) throw uErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['piggyback-submissions'] });
      qc.invalidateQueries({ queryKey: ['piggyback-reviews'] });
    },
  });

  const getReviewHistory = (submissionId: string) =>
    useQuery({
      queryKey: ['piggyback-review-history', submissionId],
      enabled: !!submissionId,
      queryFn: async () => {
        const { data } = await supabase
          .from('piggyback_reviews' as never)
          .select('*')
          .eq('submission_id', submissionId)
          .order('created_at', { ascending: false });
        return (data ?? []) as unknown as PiggybackReview[];
      },
    });

  return { pendingReviews, allReviewable, reviewSubmission, getReviewHistory };
}

/* ──────────────────────────────────────────────
 * HOOK: usePiggybackStats — community stats
 * ────────────────────────────────────────────── */

export function usePiggybackStats() {
  const stats = useQuery({
    queryKey: ['piggyback-stats'],
    queryFn: async () => {
      const { data: all } = await supabase
        .from('piggyback_submissions' as never)
        .select('status, assigned_tier, improvement_type, submitter_id, is_process_pioneer');
      const rows = (all ?? []) as unknown as PiggybackSubmission[];
      const total = rows.length;
      const approved = rows.filter(r => r.status === 'approved' || r.status === 'promoted').length;
      const promoted = rows.filter(r => r.status === 'promoted').length;
      const pioneers = rows.filter(r => r.is_process_pioneer);

      // Tier distribution
      const tierDist: Record<string, number> = {};
      rows.filter(r => r.assigned_tier).forEach(r => {
        tierDist[r.assigned_tier!] = (tierDist[r.assigned_tier!] ?? 0) + 1;
      });

      // Top contributors
      const contribMap: Record<string, number> = {};
      rows.forEach(r => {
        contribMap[r.submitter_id] = (contribMap[r.submitter_id] ?? 0) + 1;
      });
      const topContributors = Object.entries(contribMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([userId, count]) => ({ userId, count }));

      return {
        total,
        approved,
        promoted,
        approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
        tierDistribution: tierDist,
        topContributors,
        processPioneers: pioneers,
      };
    },
  });

  return { stats };
}

/* ──────────────────────────────────────────────
 * COMBINED HOOK
 * ────────────────────────────────────────────── */

export function usePiggyback(downloadId?: string) {
  const submissions = useSubmissions(downloadId);
  const reviewQueue = useReviewQueue();
  const piggybackStats = usePiggybackStats();

  return { ...submissions, ...reviewQueue, ...piggybackStats };
}
