import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DemandSignal {
  id: string;
  project_id: string;
  user_id: string;
  signal_type: 'want' | 'pledge' | 'comment';
  credits_pledged: number;
  comment_text: string | null;
  created_at: string;
}

interface EscrowRecord {
  id: string;
  project_id: string;
  user_id: string;
  credits_amount: number;
  status: 'held' | 'converted' | 'refunded';
  escrowed_at: string;
}

export interface ShowcaseDemand {
  wantCount: number;
  pledgeTotal: number;
  pledgerCount: number;
  comments: DemandSignal[];
  signals: DemandSignal[];
  escrow: EscrowRecord[];
  isLoading: boolean;
  userWanted: boolean;
  userPledged: boolean;
}

export function useShowcaseDemand(projectId: string | undefined): ShowcaseDemand {
  const signalsQuery = useQuery({
    queryKey: ['showcase-signals', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('showcase_demand_signals' as never)
        .select('*')
        .eq('project_id', projectId!) as { data: DemandSignal[] | null; error: unknown };
      if (error) throw error;
      return (data || []) as DemandSignal[];
    },
    enabled: !!projectId,
  });

  const escrowQuery = useQuery({
    queryKey: ['showcase-escrow', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('showcase_pledge_escrow' as never)
        .select('*')
        .eq('project_id', projectId!)
        .eq('status', 'held') as { data: EscrowRecord[] | null; error: unknown };
      if (error) throw error;
      return (data || []) as EscrowRecord[];
    },
    enabled: !!projectId,
  });

  const signals = signalsQuery.data ?? [];
  const escrow = escrowQuery.data ?? [];
  const wantSignals = signals.filter(s => s.signal_type === 'want');
  const pledgeSignals = signals.filter(s => s.signal_type === 'pledge');
  const comments = signals
    .filter(s => s.signal_type === 'comment')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const userId = supabase.auth.getUser ? undefined : undefined;

  return {
    wantCount: wantSignals.length,
    pledgeTotal: escrow.reduce((sum, e) => sum + e.credits_amount, 0),
    pledgerCount: pledgeSignals.length,
    comments,
    signals,
    escrow,
    isLoading: signalsQuery.isLoading || escrowQuery.isLoading,
    userWanted: false,
    userPledged: false,
  };
}
