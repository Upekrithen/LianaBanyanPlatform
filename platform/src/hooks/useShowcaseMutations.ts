import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useToggleWant(projectId: string) {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ wanted }: { wanted: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sign in to show your support');

      if (wanted) {
        const { error } = await supabase
          .from('showcase_demand_signals' as never)
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', user.id)
          .eq('signal_type', 'want');
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('showcase_demand_signals' as never)
          .insert({ project_id: projectId, user_id: user.id, signal_type: 'want' } as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['showcase-signals', projectId] });
    },
    onError: (e: Error) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });
}

export function usePledgeCredits(projectId: string) {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sign in to pledge');

      const { error: sigError } = await supabase
        .from('showcase_demand_signals' as never)
        .upsert({
          project_id: projectId,
          user_id: user.id,
          signal_type: 'pledge',
          credits_pledged: amount,
        } as never, { onConflict: 'project_id,user_id,signal_type' });
      if (sigError) throw sigError;

      const { error: escError } = await supabase
        .from('showcase_pledge_escrow' as never)
        .insert({
          project_id: projectId,
          user_id: user.id,
          credits_amount: amount,
          status: 'held',
        } as never);
      if (escError) throw escError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['showcase-signals', projectId] });
      qc.invalidateQueries({ queryKey: ['showcase-escrow', projectId] });
      toast({ title: 'Pledged!', description: 'Your Credits are held in escrow until the creator joins.' });
    },
    onError: (e: Error) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });
}

export function useShowcaseComment(projectId: string) {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ text }: { text: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sign in to comment');

      const { error } = await supabase
        .from('showcase_demand_signals' as never)
        .insert({
          project_id: projectId,
          user_id: user.id,
          signal_type: 'comment',
          comment_text: text,
        } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['showcase-signals', projectId] });
      toast({ title: 'Comment posted!' });
    },
    onError: (e: Error) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });
}
