import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CanonicalStats {
  innovationCount: number;
  crownJewels: number;
  patentApplications: number;
  patentClaims: number;
  domains: number;
  initiatives: number;
  membershipCost: number;
  creatorKeepsPct: number;
  platformMarginPct: number;
  specExpanded: number;
  portfolioValueLow: number;
  portfolioValueHigh: number;
  personalInvestment: number;
  investmentYears: number;
  productionSystems: number;
  charitableInitiatives: number;
  founderAge: number;
  dirtyDozenGreen: number;
  puddingArticles: number;
  academicPapers: number;
  knightSessions: number;
  bishopSessions: number;
  pawnBatches: number;
}

const DEFAULTS: CanonicalStats = {
  innovationCount: 2270,
  crownJewels: 228,
  patentApplications: 13,
  patentClaims: 2506,
  domains: 29,
  initiatives: 16,
  membershipCost: 5,
  creatorKeepsPct: 83.3,
  platformMarginPct: 20,
  specExpanded: 653,
  portfolioValueLow: 630_000,
  portfolioValueHigh: 116_000_000,
  personalInvestment: 525_000,
  investmentYears: 9,
  productionSystems: 36,
  charitableInitiatives: 16,
  founderAge: 53,
  dirtyDozenGreen: 11,
  puddingArticles: 189,
  academicPapers: 41,
  knightSessions: 545,
  bishopSessions: 133,
  pawnBatches: 56,
};

const KEY_MAP: Record<string, keyof CanonicalStats> = {
  innovation_count: 'innovationCount',
  crown_jewels: 'crownJewels',
  patent_applications: 'patentApplications',
  patent_claims: 'patentClaims',
  domains: 'domains',
  initiatives: 'initiatives',
  membership_cost: 'membershipCost',
  creator_keeps_pct: 'creatorKeepsPct',
  platform_margin_pct: 'platformMarginPct',
  spec_expanded: 'specExpanded',
  portfolio_value_low: 'portfolioValueLow',
  portfolio_value_high: 'portfolioValueHigh',
  personal_investment: 'personalInvestment',
  investment_years: 'investmentYears',
  production_systems: 'productionSystems',
  charitable_initiatives: 'charitableInitiatives',
  founder_age: 'founderAge',
  dirty_dozen_green: 'dirtyDozenGreen',
  pudding_articles: 'puddingArticles',
  academic_papers: 'academicPapers',
  knight_sessions: 'knightSessions',
  bishop_sessions: 'bishopSessions',
  pawn_batches: 'pawnBatches',
};

interface CanonicalRow {
  key: string;
  value: number | null;
}

export function useCanonicalStats(): CanonicalStats {
  const { data } = useQuery({
    queryKey: ['canonical-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_canonical' as never)
        .select('key, value') as { data: CanonicalRow[] | null; error: unknown };

      if (error || !data) return DEFAULTS;

      const result = { ...DEFAULTS };
      for (const row of data) {
        const field = KEY_MAP[row.key];
        if (field && row.value != null) {
          (result as Record<string, number>)[field] = Number(row.value);
        }
      }
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });

  return data ?? DEFAULTS;
}

export { DEFAULTS as CANONICAL_DEFAULTS };
