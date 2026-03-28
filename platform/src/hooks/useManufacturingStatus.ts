import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type Tier = 'bounty_hunter' | 'contractor' | 'senior_contractor' | 'partner' | 'senior_partner';

interface TierThreshold {
  marks: number;
  tier: Tier;
  label: string;
  benefits: string[];
}

const TIERS: TierThreshold[] = [
  { marks: 0, tier: 'bounty_hunter', label: 'Bounty Hunter', benefits: ['Access to open bounties', 'Kit eligibility'] },
  { marks: 500, tier: 'contractor', label: 'Contractor', benefits: ['1.5x multiplier', 'Priority bounty access'] },
  { marks: 1000, tier: 'senior_contractor', label: 'Senior Contractor', benefits: ['1.75x multiplier', 'Bench equipment eligibility'] },
  { marks: 2000, tier: 'partner', label: 'Partner', benefits: ['2.0x multiplier', 'Revenue share', 'Node eligibility', 'IP Ledger entry'] },
  { marks: 5000, tier: 'senior_partner', label: 'Senior Partner', benefits: ['2.5x multiplier', 'Factory Node eligibility', 'Governance vote'] },
];

const MULTIPLIERS: Record<Tier, number> = {
  bounty_hunter: 1.0,
  contractor: 1.5,
  senior_contractor: 1.75,
  partner: 2.0,
  senior_partner: 2.5,
};

function resolveTier(marks: number): TierThreshold {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (marks >= TIERS[i].marks) return TIERS[i];
  }
  return TIERS[0];
}

function resolveNext(marks: number): TierThreshold | null {
  for (const t of TIERS) {
    if (marks < t.marks) return t;
  }
  return null;
}

export interface ManufacturingStatus {
  aggregateMarks: number;
  currentTier: Tier;
  currentTierLabel: string;
  multiplier: number;
  nextThreshold: { marks: number; tier: string; benefits: string[] } | null;
  bountiesCompleted: number;
  bountiesInProgress: number;
  totalEarned: number;
  isEligibleForEquipment: (level: 1 | 2 | 3 | 4) => boolean;
  isLoading: boolean;
}

export function useManufacturingStatus(): ManufacturingStatus {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['manufacturing-status', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const uid = user!.id;

      const [statsRes, bountiesRes] = await Promise.all([
        supabase
          .from('xray_daily_stats' as never)
          .select('marks_earned')
          .eq('user_id', uid) as { data: { marks_earned: number }[] | null; error: unknown },
        supabase
          .from('bounties' as never)
          .select('status, reward_amount')
          .eq('claimed_by', uid) as { data: { status: string; reward_amount: number }[] | null; error: unknown },
      ]);

      const totalMarks = (statsRes.data ?? []).reduce((s, r) => s + (r.marks_earned ?? 0), 0);
      const bounties = bountiesRes.data ?? [];
      const completed = bounties.filter(b => b.status === 'completed').length;
      const inProgress = bounties.filter(b => b.status === 'in_progress').length;
      const earned = bounties.filter(b => b.status === 'completed').reduce((s, b) => s + (b.reward_amount ?? 0), 0);

      return { totalMarks, completed, inProgress, earned };
    },
    staleTime: 2 * 60 * 1000,
  });

  const marks = data?.totalMarks ?? 0;
  const tier = resolveTier(marks);
  const next = resolveNext(marks);

  const isEligibleForEquipment = useMemo(() => {
    return (level: 1 | 2 | 3 | 4) => {
      const thresholds = [0, 500, 2000, 5000];
      return marks >= thresholds[level - 1];
    };
  }, [marks]);

  return {
    aggregateMarks: marks,
    currentTier: tier.tier,
    currentTierLabel: tier.label,
    multiplier: MULTIPLIERS[tier.tier],
    nextThreshold: next ? { marks: next.marks, tier: next.label, benefits: next.benefits } : null,
    bountiesCompleted: data?.completed ?? 0,
    bountiesInProgress: data?.inProgress ?? 0,
    totalEarned: data?.earned ?? 0,
    isEligibleForEquipment,
    isLoading,
  };
}

export { TIERS, MULTIPLIERS, resolveTier, resolveNext };
export type { Tier, TierThreshold };
