export interface SpotlightCard {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  stats?: { label: string; value: string; color?: string }[];
  bodyPreview: string;
  bodyFull?: string;
  ctaLabel?: string;
  ctaRoute?: string;
  priority: number;
  validFrom?: string;
  validUntil?: string;
  timeOfDayBias?: 'morning' | 'afternoon' | 'evening' | null;
}

export interface AlgorithmConfig {
  timeOfDayWeight: number;
  recencyWeight: number;
  viewRatioWeight: number;
  randomSalt: number;
}

const DEFAULT_CONFIG: AlgorithmConfig = {
  timeOfDayWeight: 0.2,
  recencyWeight: 0.3,
  viewRatioWeight: 0.3,
  randomSalt: 0.2,
};

function getTimeOfDayPhase(hour: number): 'morning' | 'afternoon' | 'evening' {
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

export function selectCards(
  allCards: SpotlightCard[],
  category: string,
  config: AlgorithmConfig = DEFAULT_CONFIG,
  impressionCounts: Record<string, number> = {},
  currentHour: number = new Date().getHours(),
): SpotlightCard[] {
  const now = new Date().toISOString();
  const phase = getTimeOfDayPhase(currentHour);

  const filtered = allCards.filter(c => {
    if (category !== 'all' && c.category !== category) return false;
    if (c.validFrom && c.validFrom > now) return false;
    if (c.validUntil && c.validUntil < now) return false;
    return true;
  });

  const maxImpressions = Math.max(1, ...Object.values(impressionCounts), 1);

  const scored = filtered.map(card => {
    const basePriority = card.priority / 100;

    const timeBonus = card.timeOfDayBias === phase ? 1.5 : 1.0;
    const timeScore = 1 + (timeBonus - 1) * config.timeOfDayWeight;

    const views = impressionCounts[card.id] || 0;
    const viewRatio = 1 - (views / maxImpressions);
    const viewScore = 1 + viewRatio * config.viewRatioWeight;

    const random = 1 + (Math.random() - 0.5) * config.randomSalt;

    const score = basePriority * timeScore * viewScore * random;
    return { card, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.card);
}

export const SPOTLIGHT_CATEGORIES = [
  { id: 'all', label: 'All', icon: '✦' },
  { id: 'featured', label: 'Featured', icon: '⭐' },
  { id: 'campaigns', label: 'Campaigns', icon: '🚀' },
  { id: 'benefits', label: 'Benefits', icon: '🎁' },
  { id: 'announcements', label: 'News', icon: '📢' },
  { id: 'makers', label: 'Makers', icon: '🛠️' },
];

export const SEED_CARDS: SpotlightCard[] = [
  {
    id: 'built-to-last',
    category: 'featured',
    title: 'Built to Last',
    bodyPreview: '8 Patent Applications · 1,754 Innovations · 47 Creators Identified',
    stats: [
      { label: 'Patents', value: '8', color: '#38a169' },
      { label: 'Innovations', value: '1,754', color: '#38a169' },
      { label: 'Creators', value: '47', color: '#38a169' },
    ],
    ctaLabel: 'View Portfolio',
    ctaRoute: '/patent-portfolio',
    priority: 90,
  },
  {
    id: 'whats-in-it',
    category: 'featured',
    title: "What's In It For You?",
    bodyPreview: 'Maker? Sell what you build. Shopper? Own the store. Curious? Start here.',
    ctaLabel: 'Join the Red Carpet',
    ctaRoute: '/RedCarpet',
    priority: 85,
  },
  {
    id: 'know-maker',
    category: 'featured',
    title: 'Know a Maker?',
    bodyPreview: 'Invite them. Earn 10 Marks. 6-tier rewards · Everyone gets something · Forever',
    ctaLabel: 'Refer Someone',
    ctaRoute: '/initiatives/brass-tacks',
    priority: 80,
  },
  {
    id: 'creator-split',
    category: 'benefits',
    title: '83.3% Creator Split',
    bodyPreview: 'On every $500 transaction, creators keep $416.67. Locked forever by structural bylaws.',
    ctaLabel: 'See the Economics',
    ctaRoute: '/economics',
    priority: 75,
  },
  {
    id: 'five-dollar-membership',
    category: 'benefits',
    title: '$5/Year Membership',
    bodyPreview: 'Full platform access. No hidden fees. No upsells. No data harvesting. Just $5.',
    ctaLabel: 'Join Now',
    ctaRoute: '/RedCarpet',
    priority: 70,
  },
  {
    id: 'joule-stamps',
    category: 'benefits',
    title: 'Joule Forever Stamps',
    bodyPreview: "Buy Joules at today's price. Use them whenever. They never expire. Like stamps for the platform.",
    ctaLabel: 'Learn About Joules',
    ctaRoute: '/economics',
    priority: 65,
  },
  {
    id: 'patent-filing-8',
    category: 'announcements',
    title: '8th Patent Filing Ready',
    bodyPreview: '73 new innovations (#1676-#1751) across 6 technology domains. ~220 formal claims.',
    ctaLabel: 'View Patent Portfolio',
    ctaRoute: '/patent-portfolio',
    priority: 85,
    timeOfDayBias: 'morning',
  },
  {
    id: 'attack-wheel',
    category: 'announcements',
    title: 'New: Deterministic Combat',
    bodyPreview: 'HexIsle replaces dice with a fixed attack wheel. No luck — only knowledge. Try the demo.',
    ctaLabel: 'Try the Demo',
    ctaRoute: '/hexisle',
    priority: 80,
    timeOfDayBias: 'evening',
  },
  {
    id: 'launch-tracker',
    category: 'campaigns',
    title: 'Initiative Launch Tracker',
    bodyPreview: '16 initiatives. Progress bars. When conditions are met, they go live. Track the momentum.',
    ctaLabel: 'View Tracker',
    ctaRoute: '/launch-tracker',
    priority: 75,
  },
  {
    id: 'hexisle-founding',
    category: 'campaigns',
    title: 'HexIsle Founding Run',
    bodyPreview: 'Pre-order the 19-Hexel starter. Water-powered. No batteries. No screens. Just physics.',
    ctaLabel: 'Pre-Order',
    ctaRoute: '/hexisle/founding-run',
    priority: 70,
    timeOfDayBias: 'evening',
  },
];
