import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TurnKeyProject {
  id: string;
  creator_id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  images: string[];
  status: string;
  creator_backing_credits: number;
  community_matched: number;
  matching_cap: number;
  current_tier: string;
  early_adopter_slots: number;
  early_adopter_filled: number;
  production_method: string | null;
  stl_file_url: string | null;
  cue_card_id: string | null;
  created_at: string;
  updated_at: string;
  creator_display_name?: string;
  creator_avatar_url?: string;
}

interface UseProjectsOptions {
  category?: string;
  cueCardSlug?: string;
  sort?: 'newest' | 'most_backed' | 'almost_funded' | 'most_wanted' | 'most_pledged';
  showcaseOnly?: boolean;
}

export function useTurnKeyProjects(opts: UseProjectsOptions = {}) {
  return useQuery({
    queryKey: ['turnkey-projects', opts],
    queryFn: async () => {
      let query = supabase
        .from('turnkey_projects' as never)
        .select('*')
        .neq('status', 'draft');

      if (opts.showcaseOnly) {
        query = query.eq('is_showcased', true).eq('status', 'showcased');
      }

      if (opts.category) {
        query = query.eq('category', opts.category);
      }

      if (opts.sort === 'most_backed' || opts.sort === 'most_pledged') {
        query = query.order('community_matched', { ascending: false });
      } else if (opts.sort === 'almost_funded') {
        query = query.order('early_adopter_filled', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query as { data: TurnKeyProject[] | null; error: unknown };
      if (error) throw error;
      return (data || []) as TurnKeyProject[];
    },
    staleTime: 30_000,
  });
}
