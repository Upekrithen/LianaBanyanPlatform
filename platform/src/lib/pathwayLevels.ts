/**
 * Pathway Level System
 * 
 * Progressive disclosure through leveled navigation:
 * - Level 1: Entry points (Get a Job, Build a Business, Plant Seeds, Ghost World, Real World, Main Card boxes)
 * - Level 2: Requires completion of any Level 1 three-pack
 * - Level 3: Complex topics requiring Level 2 prerequisite knowledge
 * 
 * Rules:
 * - Maximum 2 paths available per page at your current level
 * - Higher level content is visible but locked until prerequisites met
 * - Progress saves even if you don't complete (for members)
 * - Three-packs: Complete 3 pathways to unlock next level
 */

export type PathwayLevel = 1 | 2 | 3;

export interface PathwayNode {
  id: string;
  route: string;
  name: string;
  level: PathwayLevel;
  description: string;
  icon?: string;
  prerequisitePathways?: string[]; // IDs of pathways that must be completed first
  childPaths?: string[]; // IDs of pathways accessible from this node
}

export interface PathwayThreePack {
  id: string;
  name: string;
  level: PathwayLevel;
  pathwayIds: [string, string, string]; // Exactly 3 pathways
  unlocksLevel?: PathwayLevel; // What level completing this pack unlocks
  description: string;
}

export interface UserPathwayProgress {
  completedPathways: string[];
  currentLevel: PathwayLevel;
  unlockedThreePacks: string[];
  activePathway?: string;
  pathwayProgress: Record<string, number>; // pathway ID -> percentage complete
  levelGatingEnabled: boolean; // Can be disabled once all levels achieved
}

// Level 1 Pathways - Entry points from homepage
export const LEVEL_1_PATHWAYS: PathwayNode[] = [
  {
    id: 'get-a-job',
    route: '/get-a-job',
    name: 'Get a Job',
    level: 1,
    description: 'Find work, earn credits, build reputation',
    icon: '💼',
    childPaths: ['bounty-categories', 'member-portfolio'],
  },
  {
    id: 'build-a-business',
    route: '/build-a-business',
    name: 'Build a Business',
    level: 1,
    description: 'Start or grow your business with Cost+20%',
    icon: '🏗️',
    childPaths: ['cost-plus-twenty', 'storefront-setup'],
  },
  {
    id: 'plant-seeds',
    route: '/plant-seeds',
    name: 'Plant Seeds',
    level: 1,
    description: 'Invest in the future, sponsor innovation',
    icon: '🌱',
    childPaths: ['sponsorship', 'patent-buckets'],
  },
  {
    id: 'ghost-world',
    route: '/ghost',
    name: 'Ghost World',
    level: 1,
    description: 'Practice mode - try everything risk-free',
    icon: '👻',
    childPaths: ['ghost-credits', 'testing-waters'],
  },
  {
    id: 'real-world',
    route: '/explore',
    name: 'Real World',
    level: 1,
    description: 'Live platform with real transactions',
    icon: '🌍',
    childPaths: ['marketplace', 'live-services'],
  },
  // Main Card back boxes - all Level 1
  {
    id: 'initiatives-overview',
    route: '/',
    name: '16 Initiatives',
    level: 1,
    description: 'Overview of all platform initiatives',
    icon: '🎯',
  },
  {
    id: 'help-each-other',
    route: '/help-each-other',
    name: 'Help Each Other',
    level: 1,
    description: 'Ways to contribute and receive help',
    icon: '🤝',
  },
];

// Level 2 Pathways - Require Level 1 three-pack completion
export const LEVEL_2_PATHWAYS: PathwayNode[] = [
  {
    id: 'economic-laws',
    route: '/economics',
    name: 'Nine Economic Laws',
    level: 2,
    description: 'The foundational principles of the platform',
    icon: '⚖️',
    prerequisitePathways: ['build-a-business'],
  },
  {
    id: 'patent-portfolio',
    route: '/patent-portfolio',
    name: 'Patent Portfolio',
    level: 2,
    description: '1,244 innovations across 7 applications',
    icon: '📜',
    prerequisitePathways: ['plant-seeds'],
  },
  {
    id: 'governance',
    route: '/governance',
    name: 'Governance & Senate',
    level: 2,
    description: 'How decisions are made',
    icon: '🏛️',
  },
  {
    id: 'crown-jewels',
    route: '/patent-portfolio#crown-jewels',
    name: 'Crown Jewels',
    level: 2,
    description: 'The 8 most valuable innovations',
    icon: '👑',
  },
  {
    id: 'hexisle',
    route: '/hexisle',
    name: 'HexIsle',
    level: 2,
    description: 'Hydraulic game table and governance visualization',
    icon: '🏝️',
  },
  {
    id: 'defense-klaus',
    route: '/initiatives/defense-klaus',
    name: 'Defense Klaus',
    level: 2,
    description: 'Legal defense fund for members',
    icon: '🛡️',
  },
];

// Level 3 Pathways - Complex topics requiring deep understanding
export const LEVEL_3_PATHWAYS: PathwayNode[] = [
  {
    id: 'member-portfolio',
    route: '/portfolio',
    name: 'Member Portfolio',
    level: 3,
    description: 'Your personal dashboard and achievements',
    icon: '📊',
  },
  {
    id: 'speedruns',
    route: '/ghost',
    name: 'Ghost World Speedruns',
    level: 3,
    description: 'Timed challenges with qualification rewards',
    icon: '⚡',
  },
  {
    id: 'media-blitz',
    route: '/social-admin',
    name: 'Media Blitz',
    level: 3,
    description: 'Coordinated social media campaigns',
    icon: '📣',
  },
  {
    id: 'golden-key-hunt',
    route: '/beacon-explainer',
    name: 'Golden Key Hunt',
    level: 3,
    description: 'Earn Golden Keys through platform mastery',
    icon: '🔑',
  },
  {
    id: 'swoop-projects',
    route: '/swoop',
    name: 'Swoop Projects',
    level: 3,
    description: 'Community-funded development projects',
    icon: '🦅',
  },
];

// Three-Packs - Complete 3 to unlock next level
export const THREE_PACKS: PathwayThreePack[] = [
  // Level 1 Three-Packs (any of these unlocks Level 2)
  {
    id: 'starter-pack-work',
    name: 'Worker Starter Pack',
    level: 1,
    pathwayIds: ['get-a-job', 'ghost-world', 'help-each-other'],
    unlocksLevel: 2,
    description: 'Learn to find work and contribute',
  },
  {
    id: 'starter-pack-business',
    name: 'Business Starter Pack',
    level: 1,
    pathwayIds: ['build-a-business', 'ghost-world', 'initiatives-overview'],
    unlocksLevel: 2,
    description: 'Learn to sell and grow',
  },
  {
    id: 'starter-pack-investor',
    name: 'Investor Starter Pack',
    level: 1,
    pathwayIds: ['plant-seeds', 'real-world', 'help-each-other'],
    unlocksLevel: 2,
    description: 'Learn to sponsor and invest',
  },
  // Level 2 Three-Packs (unlocks Level 3)
  {
    id: 'advanced-pack-economics',
    name: 'Economics Deep Dive',
    level: 2,
    pathwayIds: ['economic-laws', 'patent-portfolio', 'crown-jewels'],
    unlocksLevel: 3,
    description: 'Master the economic foundations',
  },
  {
    id: 'advanced-pack-governance',
    name: 'Governance Track',
    level: 2,
    pathwayIds: ['governance', 'hexisle', 'defense-klaus'],
    unlocksLevel: 3,
    description: 'Understand how decisions are made',
  },
];

// All pathways combined for lookup
export const ALL_PATHWAYS: PathwayNode[] = [
  ...LEVEL_1_PATHWAYS,
  ...LEVEL_2_PATHWAYS,
  ...LEVEL_3_PATHWAYS,
];

// Helper functions
export function getPathwayById(id: string): PathwayNode | undefined {
  return ALL_PATHWAYS.find(p => p.id === id);
}

export function getPathwaysByLevel(level: PathwayLevel): PathwayNode[] {
  return ALL_PATHWAYS.filter(p => p.level === level);
}

export function canAccessPathway(
  pathway: PathwayNode,
  userProgress: UserPathwayProgress
): boolean {
  // Level 1 is always accessible
  if (pathway.level === 1) return true;
  
  // Check if user has reached this level
  if (userProgress.currentLevel < pathway.level) return false;
  
  // Check prerequisites if any
  if (pathway.prerequisitePathways) {
    return pathway.prerequisitePathways.every(
      prereq => userProgress.completedPathways.includes(prereq)
    );
  }
  
  return true;
}

export function getAvailablePathsFromPage(
  currentRoute: string,
  userProgress: UserPathwayProgress,
  maxPaths: number = 2
): PathwayNode[] {
  // Find current pathway
  const currentPathway = ALL_PATHWAYS.find(p => p.route === currentRoute);
  if (!currentPathway?.childPaths) return [];
  
  // Get child pathways user can access
  const accessiblePaths = currentPathway.childPaths
    .map(id => getPathwayById(id))
    .filter((p): p is PathwayNode => p !== undefined && canAccessPathway(p, userProgress));
  
  // Return up to maxPaths
  return accessiblePaths.slice(0, maxPaths);
}

export function getLockedPathsFromPage(
  currentRoute: string,
  userProgress: UserPathwayProgress
): PathwayNode[] {
  const currentPathway = ALL_PATHWAYS.find(p => p.route === currentRoute);
  if (!currentPathway?.childPaths) return [];
  
  return currentPathway.childPaths
    .map(id => getPathwayById(id))
    .filter((p): p is PathwayNode => p !== undefined && !canAccessPathway(p, userProgress));
}

export function checkThreePackCompletion(
  packId: string,
  completedPathways: string[]
): boolean {
  const pack = THREE_PACKS.find(p => p.id === packId);
  if (!pack) return false;
  
  return pack.pathwayIds.every(id => completedPathways.includes(id));
}

export function getUnlockedLevel(completedPathways: string[]): PathwayLevel {
  // Check if any Level 2 three-pack is complete (unlocks Level 3)
  const level2Packs = THREE_PACKS.filter(p => p.level === 2);
  if (level2Packs.some(pack => checkThreePackCompletion(pack.id, completedPathways))) {
    return 3;
  }
  
  // Check if any Level 1 three-pack is complete (unlocks Level 2)
  const level1Packs = THREE_PACKS.filter(p => p.level === 1);
  if (level1Packs.some(pack => checkThreePackCompletion(pack.id, completedPathways))) {
    return 2;
  }
  
  return 1;
}

// Default progress for new/guest users
export const DEFAULT_USER_PROGRESS: UserPathwayProgress = {
  completedPathways: [],
  currentLevel: 1,
  unlockedThreePacks: [],
  pathwayProgress: {},
  levelGatingEnabled: true, // Enabled by default, can be disabled once all levels achieved
};

// Check if user has completed all pathways (can disable level gating)
export function hasCompletedAllPathways(completedPathways: string[]): boolean {
  return ALL_PATHWAYS.every(p => completedPathways.includes(p.id));
}

// Check if user can disable level gating (reached Level 3)
export function canDisableLevelGating(currentLevel: PathwayLevel): boolean {
  return currentLevel >= 3;
}
