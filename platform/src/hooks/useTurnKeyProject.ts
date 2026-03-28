import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TurnKeyProject } from './useTurnKeyProjects';

export interface TierHistory {
  id: string;
  project_id: string;
  tier: string;
  units_target: number;
  units_filled: number;
  unit_price_credits: number;
  production_method: string | null;
  unlocked_at: string;
  completed_at: string | null;
}

export function useTurnKeyProject(slug: string | undefined) {
  const projectQuery = useQuery({
    queryKey: ['turnkey-project', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('turnkey_projects' as never)
        .select('*')
        .eq('slug', slug!)
        .maybeSingle() as { data: TurnKeyProject | null; error: unknown };
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const tiersQuery = useQuery({
    queryKey: ['turnkey-tiers', projectQuery.data?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('turnkey_tier_history' as never)
        .select('*')
        .eq('project_id', projectQuery.data!.id)
        .order('unlocked_at', { ascending: true }) as { data: TierHistory[] | null; error: unknown };
      if (error) throw error;
      return (data || []) as TierHistory[];
    },
    enabled: !!projectQuery.data?.id,
  });

  const backerCountQuery = useQuery({
    queryKey: ['turnkey-backer-count', projectQuery.data?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('turnkey_backers' as never)
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectQuery.data!.id) as { count: number | null; error: unknown };
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!projectQuery.data?.id,
  });

  return {
    project: projectQuery.data ?? null,
    tiers: tiersQuery.data ?? [],
    backerCount: backerCountQuery.data ?? 0,
    isLoading: projectQuery.isLoading,
  };
}
