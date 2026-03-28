import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BackProjectInput {
  projectId: string;
  tier: string;
  creditsPaid: number;
  fulfillmentType: 'shipped' | 'print_yourself' | 'digital';
}

export function useBackProject() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: BackProjectInput) => {
      if (!user) throw new Error('Not authenticated');

      const { error: backErr } = await supabase
        .from('turnkey_backers' as never)
        .insert({
          project_id: input.projectId,
          user_id: user.id,
          tier: input.tier,
          credits_paid: input.creditsPaid,
          fulfillment_type: input.fulfillmentType,
          status: 'backed',
        } as never);

      if (backErr) throw backErr;

      const { data: proj } = await supabase
        .from('turnkey_projects' as never)
        .select('early_adopter_filled, community_matched')
        .eq('id', input.projectId)
        .single() as { data: { early_adopter_filled: number; community_matched: number } | null };

      if (proj) {
        await supabase
          .from('turnkey_projects' as never)
          .update({
            early_adopter_filled: proj.early_adopter_filled + 1,
            community_matched: proj.community_matched + input.creditsPaid,
          } as never)
          .eq('id', input.projectId);
      }

      return true;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['turnkey-project'] });
      qc.invalidateQueries({ queryKey: ['turnkey-projects'] });
      qc.invalidateQueries({ queryKey: ['turnkey-backer-count', vars.projectId] });
    },
  });
}
