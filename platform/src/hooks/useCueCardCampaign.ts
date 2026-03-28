import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CueCardCampaign } from './useCueCardCampaigns';

export function useCueCardCampaign(slug: string | undefined) {
  return useQuery({
    queryKey: ['cue-card-campaign', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cue_card_campaigns' as never)
        .select('*')
        .eq('slug', slug!)
        .maybeSingle() as { data: CueCardCampaign | null; error: unknown };
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}
