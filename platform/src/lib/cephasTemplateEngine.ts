import type { CanonicalStats } from '@/hooks/useCanonicalStats';

const STATIC_VARS: Record<string, string> = {
  founderTitle: 'Founder & General Manager',
  entityName: 'Liana Banyan Corporation',
  membershipCost: '$5/year',
  creatorRetention: '83.3%',
  platformMargin: 'Cost + 20%',
  dirtyDozenTotal: '12',
};

function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

export function buildTemplateVars(stats: CanonicalStats): Record<string, string> {
  const innovations = fmt(stats.innovationCount);
  const jewels = fmt(stats.crownJewels);
  const provApps = String(stats.patentApplications);
  const claims = fmt(stats.patentClaims);
  const inits = String(stats.initiatives);

  return {
    ...STATIC_VARS,
    innovationCount: innovations,
    crownJewels: jewels,
    crownJewelCount: jewels,
    patentApplications: provApps,
    provisionalApps: provApps,
    patentClaims: claims,
    formalClaimsCount: claims,
    productionSystems: String(stats.productionSystems),
    charitableInitiatives: String(stats.charitableInitiatives),
    founderAge: String(stats.founderAge),
    knightSessions: String(stats.knightSessions),
    bishopSessions: String(stats.bishopSessions).padStart(3, '0'),
    pawnBatches: String(stats.pawnBatches),
    dirtyDozenGreen: String(stats.dirtyDozenGreen),
    puddingArticles: String(stats.puddingArticles),
    academicPapers: String(stats.academicPapers),
    initiatives: inits,
    initiativeCount: inits,
    domains: String(stats.domains),
    creatorKeeps: STATIC_VARS.creatorRetention,
  };
}

/**
 * Replace {{variableName}} tokens in content with live values.
 * Unrecognized tokens pass through unchanged.
 */
export function interpolateContent(
  content: string,
  vars: Record<string, string>,
): string {
  return content.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => vars[key] ?? _match);
}
