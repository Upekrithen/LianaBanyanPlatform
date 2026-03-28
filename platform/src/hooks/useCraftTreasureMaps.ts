import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TreasureMapStep {
  order: number;
  title: string;
  description: string;
  link: string;
  time_estimate: string;
  cost_estimate: string;
}

export interface CraftTreasureMap {
  id: string;
  craft_type: string;
  title: string;
  slug: string;
  tagline: string;
  description: string | null;
  icon: string;
  steps: TreasureMapStep[];
  cue_card_slug: string | null;
  recommended_products: { title: string; slug: string }[];
  startup_cost_low: number | null;
  startup_cost_high: number | null;
  first_sale_timeline: string | null;
  projected_monthly_low: number | null;
  projected_monthly_high: number | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  time_commitment: string | null;
  created_at: string;
  updated_at: string;
}

export interface CraftTreasureMapProgress {
  id: string;
  user_id: string;
  treasure_map_id: string;
  current_step: number;
  completed_steps: number[];
  started_at: string;
  last_activity: string;
}

export function useCraftTreasureMaps() {
  return useQuery({
    queryKey: ['craft-treasure-maps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('craft_treasure_maps' as never)
        .select('*')
        .order('craft_type', { ascending: true }) as { data: CraftTreasureMap[] | null; error: unknown };
      if (error) throw error;
      return (data || []) as CraftTreasureMap[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useCraftTreasureMap(slug: string | undefined) {
  const { user } = useAuth();

  const mapQuery = useQuery({
    queryKey: ['craft-treasure-map', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('craft_treasure_maps' as never)
        .select('*')
        .eq('slug', slug!)
        .single() as { data: CraftTreasureMap | null; error: unknown };
      if (error) throw error;
      return data as CraftTreasureMap;
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });

  const progressQuery = useQuery({
    queryKey: ['craft-treasure-map-progress', mapQuery.data?.id, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('craft_treasure_map_progress' as never)
        .select('*')
        .eq('user_id', user!.id)
        .eq('treasure_map_id', mapQuery.data!.id)
        .maybeSingle() as { data: CraftTreasureMapProgress | null; error: unknown };
      if (error) throw error;
      return data as CraftTreasureMapProgress | null;
    },
    enabled: !!mapQuery.data?.id && !!user?.id,
  });

  return {
    map: mapQuery.data,
    progress: progressQuery.data,
    isLoading: mapQuery.isLoading,
    isProgressLoading: progressQuery.isLoading,
  };
}

export function useCraftTreasureMapProgress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const toggleStep = useMutation({
    mutationFn: async ({ mapId, stepOrder, completed }: { mapId: string; stepOrder: number; completed: boolean }) => {
      if (!user) throw new Error('Must be logged in');

      const { data: existing } = await supabase
        .from('craft_treasure_map_progress' as never)
        .select('*')
        .eq('user_id', user.id)
        .eq('treasure_map_id', mapId)
        .maybeSingle() as { data: CraftTreasureMapProgress | null };

      const currentSteps: number[] = existing?.completed_steps || [];
      const newSteps = completed
        ? [...new Set([...currentSteps, stepOrder])]
        : currentSteps.filter((s: number) => s !== stepOrder);
      const nextStep = Math.max(0, ...newSteps) + 1;

      if (existing) {
        const { error } = await supabase
          .from('craft_treasure_map_progress' as never)
          .update({ completed_steps: newSteps, current_step: nextStep, last_activity: new Date().toISOString() } as never)
          .eq('id', existing.id) as { error: unknown };
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('craft_treasure_map_progress' as never)
          .insert({ user_id: user.id, treasure_map_id: mapId, completed_steps: newSteps, current_step: nextStep } as never) as { error: unknown };
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['craft-treasure-map-progress'] });
    },
  });

  return { toggleStep };
}

type Intent = 'sell' | 'buy' | 'support' | 'manufacture' | 'cold-start' | 'idea';
type CraftType = 'terrain' | 'leather' | 'kitchen' | 'jewelry' | 'board_games' | 'woodworking' | 'digital' | 'other';
type ReadinessLevel = 'idea' | 'prototype' | 'selling' | 'scale';

export interface StartFlowState {
  step: 1 | 2 | 3 | 'result';
  intent: Intent | null;
  craftType: CraftType | null;
  readiness: ReadinessLevel | null;
}

const READINESS_TO_START_STEP: Record<ReadinessLevel, number> = {
  idea: 1,
  prototype: 2,
  selling: 3,
  scale: 4,
};

const CRAFT_TO_SLUG: Record<CraftType, string | null> = {
  terrain: 'terrain-maker',
  leather: 'leather-crafter',
  kitchen: 'kitchen-creator',
  jewelry: 'jewelry-maker',
  board_games: 'board-game-designer',
  woodworking: 'woodworker',
  digital: 'digital-creator',
  other: null,
};

export function useStartFlow() {
  const getRoute = (state: StartFlowState): string => {
    if (state.intent === 'buy') return '/marketplace';
    if (state.intent === 'support') return '/projects';
    if (state.intent === 'manufacture') return '/network';
    if (state.intent === 'idea') return '/cue-cards/campaigns';

    if (state.intent === 'sell' && state.craftType) {
      const slug = CRAFT_TO_SLUG[state.craftType];
      if (slug) return `/treasure-map/${slug}`;
      return '/cue-cards/campaigns';
    }

    return '/welcome';
  };

  const getStartStep = (readiness: ReadinessLevel): number => {
    return READINESS_TO_START_STEP[readiness];
  };

  return { getRoute, getStartStep, CRAFT_TO_SLUG, READINESS_TO_START_STEP };
}
