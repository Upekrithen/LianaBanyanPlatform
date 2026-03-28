import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/* ── Row Types ── */

export interface ProductionLevel {
  id: string;
  product_id: string;
  level_number: number;
  level_name: string;
  units_count: number;
  unit_price: number;
  votes_needed: number;
  current_votes: number;
  progress_pct: number;
  is_funded: boolean;
}

export interface Product {
  id: string;
  project_id: string;
  name: string;
  description: string;
  levels: ProductionLevel[];
}

export interface ProductionProject {
  id: string;
  name: string;
  description: string;
  products: Product[];
  total_target: number;
  total_pledged: number;
  overall_pct: number;
}

export interface Bounty {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  difficulty: string;
  reward_marks: number;
  status: string;
}

export interface LeadershipPedestal {
  id: string;
  seat_title: string;
  seat_type: string;
  initiative: string;
  invited_name: string;
  invited_description: string;
  invited_image_url: string | null;
  support_count: number;
  status: string;
  claimed_by: string | null;
}

/* ── Helpers ── */

function enrichLevel(level: any, pledgeSum: number): ProductionLevel {
  const votesNeeded = level.units_count * level.unit_price;
  const currentVotes = pledgeSum;
  return {
    id: level.id,
    product_id: level.product_id,
    level_number: level.level_number,
    level_name: level.level_name,
    units_count: level.units_count,
    unit_price: level.unit_price,
    votes_needed: votesNeeded,
    current_votes: currentVotes,
    progress_pct: votesNeeded > 0 ? Math.min((currentVotes / votesNeeded) * 100, 100) : 0,
    is_funded: currentVotes >= votesNeeded,
  };
}

/* ── useProjects ── */

export function useProjects() {
  return useQuery({
    queryKey: ['production-projects'],
    queryFn: async () => {
      const { data: projects, error: pErr } = await supabase
        .from('projects' as never)
        .select('id, name, description') as { data: any[] | null; error: any };
      if (pErr || !projects) return [] as ProductionProject[];

      const { data: products } = await supabase
        .from('products' as never)
        .select('id, project_id, name, description') as { data: any[] | null; error: any };

      const { data: levels } = await supabase
        .from('production_levels' as never)
        .select('id, product_id, level_number, level_name, units_count, unit_price') as { data: any[] | null; error: any };

      const { data: pledges } = await supabase
        .from('pledges' as never)
        .select('production_level_id, amount') as { data: any[] | null; error: any };

      const pledgeMap = new Map<string, number>();
      (pledges ?? []).forEach((p: any) => {
        const prev = pledgeMap.get(p.production_level_id) ?? 0;
        pledgeMap.set(p.production_level_id, prev + Number(p.amount ?? 0));
      });

      return projects.map((proj: any): ProductionProject => {
        const projProducts = (products ?? []).filter((pr: any) => pr.project_id === proj.id);
        const enrichedProducts: Product[] = projProducts.map((pr: any) => {
          const prodLevels = (levels ?? [])
            .filter((l: any) => l.product_id === pr.id)
            .sort((a: any, b: any) => a.level_number - b.level_number)
            .map((l: any) => enrichLevel(l, pledgeMap.get(l.id) ?? 0));
          return { ...pr, levels: prodLevels };
        });

        const totalTarget = enrichedProducts.reduce(
          (s, p) => s + p.levels.reduce((ls, l) => ls + l.votes_needed, 0), 0);
        const totalPledged = enrichedProducts.reduce(
          (s, p) => s + p.levels.reduce((ls, l) => ls + l.current_votes, 0), 0);

        return {
          ...proj,
          products: enrichedProducts,
          total_target: totalTarget,
          total_pledged: totalPledged,
          overall_pct: totalTarget > 0 ? Math.min((totalPledged / totalTarget) * 100, 100) : 0,
        };
      });
    },
    staleTime: 30_000,
  });
}

/* ── useProject (single) ── */

export function useProject(projectId: string | undefined) {
  const { data: allProjects } = useProjects();
  return allProjects?.find((p) => p.id === projectId) ?? null;
}

/* ── useProjectBounties ── */

export function useProjectBounties(category?: string) {
  return useQuery({
    queryKey: ['production-bounties', category],
    queryFn: async () => {
      let q = supabase
        .from('bounties' as never)
        .select('id, title, description, category, priority, difficulty, reward_marks, status')
        .eq('status' as never, 'open' as never);
      if (category) q = q.eq('category' as never, category as never);
      const { data, error } = await q as { data: any[] | null; error: any };
      if (error || !data) return [] as Bounty[];
      return data as Bounty[];
    },
    staleTime: 30_000,
  });
}

/* ── useProjectCaptains ── */

export function useProjectCaptains(initiative?: string) {
  return useQuery({
    queryKey: ['production-captains', initiative],
    queryFn: async () => {
      let q = supabase
        .from('leadership_pedestals' as never)
        .select('id, seat_title, seat_type, initiative, invited_name, invited_description, invited_image_url, support_count, status, claimed_by');
      if (initiative) q = q.ilike('initiative' as never, `%${initiative}%` as never);
      const { data, error } = await q as { data: any[] | null; error: any };
      if (error || !data) return [] as LeadershipPedestal[];
      return data as LeadershipPedestal[];
    },
    staleTime: 60_000,
  });
}

/* ── Mutations ── */

export function usePledgeToLevel() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ levelId, amount, source }: { levelId: string; amount: number; source: string }) => {
      if (!user) throw new Error('Authentication required');
      const { error } = await supabase
        .from('pledges' as never)
        .insert({
          production_level_id: levelId,
          user_id: user.id,
          amount,
          source,
        } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['production-projects'] });
    },
  });
}

export function useClaimBounty() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (bountyId: string) => {
      if (!user) throw new Error('Authentication required');
      const { error } = await supabase
        .from('bounties' as never)
        .update({ status: 'claimed', claimed_by: user.id } as never)
        .eq('id' as never, bountyId as never);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['production-bounties'] });
    },
  });
}

export function useNominateCaptain() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (pedestalId: string) => {
      if (!user) throw new Error('Authentication required');
      const { error } = await supabase
        .from('pedestal_support_signals' as never)
        .insert({
          pedestal_id: pedestalId,
          user_id: user.id,
          signal_type: 'support',
        } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['production-captains'] });
    },
  });
}
