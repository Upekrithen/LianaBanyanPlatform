/**
 * GATE ARTWORK BOUNTIES
 * =====================
 * Bounty Cue Cards for hall entrance artwork.
 *
 * Each hall in the Hexagon Senate needs custom entrance artwork.
 * These bounties invite artists to create gate designs.
 */

export interface GateArtworkBounty {
  id: string;
  hallName: string;
  title: string;
  subtitle: string;
  description: string;
  requirements: string[];
  reward: {
    credits: number;
    marks: number;
    bonus?: string;
  };
  color: string;
  status: 'open' | 'claimed' | 'submitted' | 'completed';
  deadline?: string;
}

export const GATE_ARTWORK_BOUNTIES: GateArtworkBounty[] = [
  {
    id: 'gate-hall-of-innovations',
    hallName: 'Hall of Innovations',
    title: 'Gate Design: Hall of Innovations',
    subtitle: 'Patent Registry Entrance',
    description: `Design an entrance gate for the Hall of Innovations — the patent registry where members vote on which innovations to prosecute. The gate should evoke invention, light bulbs, gears, and intellectual property. Think steampunk meets patent office meets treasure vault.`,
    requirements: [
      'PNG or SVG format, minimum 1200x1600px',
      'Transparent background preferred',
      'Should work on dark backgrounds',
      'Include a keyhole or door element',
      'Evoke themes: invention, light, gears, patents',
      'Original artwork (no AI-generated)',
    ],
    reward: {
      credits: 500,
      marks: 100,
      bonus: 'Your name permanently displayed as artist',
    },
    color: '#eab308', // yellow/amber
    status: 'open',
  },
  {
    id: 'gate-hall-of-records',
    hallName: 'Hall of Records',
    title: 'Gate Design: Hall of Records',
    subtitle: 'The Pnyx — Academic Archive',
    description: `Design an entrance gate for the Hall of Records (The Pnyx) — where academic papers, letters, and historical documents are stored. The gate should evoke ancient libraries, scrolls, wisdom, and permanence. Think Library of Alexandria meets Hogwarts restricted section.`,
    requirements: [
      'PNG or SVG format, minimum 1200x1600px',
      'Transparent background preferred',
      'Should work on dark backgrounds',
      'Include a keyhole or door element',
      'Evoke themes: scrolls, books, wisdom, history',
      'Original artwork (no AI-generated)',
    ],
    reward: {
      credits: 500,
      marks: 100,
      bonus: 'Your name permanently displayed as artist',
    },
    color: '#f59e0b', // amber/gold
    status: 'open',
  },
  {
    id: 'gate-hall-of-projects',
    hallName: 'Hall of Projects',
    title: 'Gate Design: Hall of Projects',
    subtitle: 'Member Submissions',
    description: `Design an entrance gate for the Hall of Projects — where members submit projects for community review. The gate should evoke blueprints, construction, collaboration, and building. Think architect's studio meets community workshop.`,
    requirements: [
      'PNG or SVG format, minimum 1200x1600px',
      'Transparent background preferred',
      'Should work on dark backgrounds',
      'Include a keyhole or door element',
      'Evoke themes: blueprints, building, collaboration',
      'Original artwork (no AI-generated)',
    ],
    reward: {
      credits: 500,
      marks: 100,
      bonus: 'Your name permanently displayed as artist',
    },
    color: '#3b82f6', // blue
    status: 'open',
  },
  {
    id: 'gate-hall-of-initiatives',
    hallName: 'Hall of Initiatives',
    title: 'Gate Design: Hall of Initiatives',
    subtitle: 'The Sweet Sixteen',
    description: `Design an entrance gate for the Hall of Initiatives — home to the 16 charitable programs. The gate should evoke community, helping hands, hearts, and growth. Think community center meets garden gate meets charity gala entrance.`,
    requirements: [
      'PNG or SVG format, minimum 1200x1600px',
      'Transparent background preferred',
      'Should work on dark backgrounds',
      'Include a keyhole or door element',
      'Evoke themes: hearts, hands, community, growth',
      'Original artwork (no AI-generated)',
    ],
    reward: {
      credits: 500,
      marks: 100,
      bonus: 'Your name permanently displayed as artist',
    },
    color: '#ec4899', // pink
    status: 'open',
  },
  {
    id: 'gate-tower-of-peace',
    hallName: 'Tower of Peace',
    title: 'Gate Design: Tower of Peace',
    subtitle: 'Political Expedition',
    description: `Design an entrance gate for the Tower of Peace — where political discussion happens OUTSIDE the main platform. The gate should evoke neutrality, debate, balance, and civic discourse. Think UN headquarters meets ancient Greek agora meets debate hall.`,
    requirements: [
      'PNG or SVG format, minimum 1200x1600px',
      'Transparent background preferred',
      'Should work on dark backgrounds',
      'Include a keyhole or door element',
      'Evoke themes: balance, debate, peace, neutrality',
      'Original artwork (no AI-generated)',
    ],
    reward: {
      credits: 500,
      marks: 100,
      bonus: 'Your name permanently displayed as artist',
    },
    color: '#a855f7', // purple
    status: 'open',
  },
];

export const getGateBountyById = (id: string): GateArtworkBounty | undefined => {
  return GATE_ARTWORK_BOUNTIES.find(b => b.id === id);
};

export const getOpenGateBounties = (): GateArtworkBounty[] => {
  return GATE_ARTWORK_BOUNTIES.filter(b => b.status === 'open');
};
