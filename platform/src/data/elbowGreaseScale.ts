export interface ElbowGreaseLevel {
  level: number;
  name: string;
  description: string;
  marksRange: string;
  color: string;
}

export const ELBOW_GREASE_LEVELS: ElbowGreaseLevel[] = [
  { level: 1, name: 'Browse', description: 'Read articles, explore pages, take tours', marksRange: '1-10', color: '#86efac' },
  { level: 2, name: 'Engage', description: 'Give feedback, hit 100 Marks, drop beacons', marksRange: '10-25', color: '#6ee7b7' },
  { level: 3, name: 'Research', description: 'Find businesses online, send Cue Cards, Codebreakers', marksRange: '25-50', color: '#fbbf24' },
  { level: 4, name: 'Create', description: 'Design icons, write content, build Brand packages', marksRange: '50-100', color: '#f59e0b' },
  { level: 5, name: 'Scout', description: 'Bounty Photography in person, Pearl Diver deal logging', marksRange: '100-200', color: '#f97316' },
  { level: 6, name: 'Pitch', description: 'Walk into business with Red Carpet card, make the pitch', marksRange: '200-350', color: '#ef4444' },
  { level: 7, name: 'Launch', description: 'Start project, set up storefront, accept payments', marksRange: '350-500', color: '#dc2626' },
  { level: 8, name: 'Captain', description: 'Build crew (Oar Slots), manage Node', marksRange: '500-750', color: '#a855f7' },
  { level: 9, name: 'Forge', description: 'Cold Start initiative — 10 businesses, crew, revenue', marksRange: '750-1000', color: '#7c3aed' },
  { level: 10, name: 'Founder', description: 'Multiple Nodes, train Captains, expand cities', marksRange: '1000+', color: '#4f46e5' },
];

export function getElbowGreaseLevel(level: number): ElbowGreaseLevel {
  const clamped = Math.max(1, Math.min(10, level));
  return ELBOW_GREASE_LEVELS[clamped - 1];
}
