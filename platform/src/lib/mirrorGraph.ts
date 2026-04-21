/**
 * MIRROR NAVIGATION GRAPH
 * ========================
 * Complete map of all mirror connections across the platform.
 * Used by Will-o'-Wisp Chase Mode for path generation.
 *
 * Mirrors are bi-directional portals that connect different areas.
 * The graph is designed for:
 * 1. Path generation (random walks for Chase Mode)
 * 2. Shortest path finding (for pickle detection)
 * 3. Difficulty scaling (longer paths = harder chases)
 *
 * @see DESIGN_DOCS/WILL_O_WISP_SYSTEM.md
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface MirrorNode {
  id: string;
  name: string;
  emoji: string;
  route: string;
  area: MirrorArea;
  tier: 1 | 2 | 3; // 1 = Landing, 2 = Primary paths, 3 = Deep pages
  connections: string[]; // IDs of connected mirrors
  isPickleZone?: boolean; // Areas where getting stuck is more likely
  description?: string;
}

export type MirrorArea =
  | 'landing'
  | 'work'
  | 'build'
  | 'sponsor'
  | 'learn'
  | 'governance'
  | 'initiatives'
  | 'guilds'
  | 'tribes'
  | 'marketplace'
  | 'portfolio'
  | 'deck';

export interface MirrorPath {
  nodes: string[]; // Ordered list of mirror IDs
  difficulty: 'novice' | 'journeyman' | 'expert' | 'legendary';
  estimatedTimeMs: number;
  pickleRisk: number; // 0-1 probability of getting stuck
}

// ═══════════════════════════════════════════════════════════════════════════════
// MIRROR GRAPH DATA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Complete mirror graph of the platform.
 * Each node represents a "mirror" (navigation point) with its connections.
 */
export const MIRROR_GRAPH: Record<string, MirrorNode> = {
  // ───────────────────────────────────────────────────────────────────────────
  // TIER 1: Landing Page
  // ───────────────────────────────────────────────────────────────────────────
  'landing-home': {
    id: 'landing-home',
    name: 'The Gateway',
    emoji: '🌳',
    route: '/',
    area: 'landing',
    tier: 1,
    connections: ['discover-work', 'discover-build', 'discover-sponsor'],
    description: 'Where all journeys begin'
  },

  // ───────────────────────────────────────────────────────────────────────────
  // TIER 2: Primary Discovery Paths (Level 2 Triangle)
  // ───────────────────────────────────────────────────────────────────────────
  'discover-work': {
    id: 'discover-work',
    name: 'Get a Job',
    emoji: '💼',
    route: '/discover/work',
    area: 'work',
    tier: 2,
    connections: ['landing-home', 'discover-build', 'discover-sponsor', 'work-opportunities', 'work-guilds'],
    description: 'Find your calling'
  },
  'discover-build': {
    id: 'discover-build',
    name: 'Build a Business',
    emoji: '🏰',
    route: '/discover/build',
    area: 'build',
    tier: 2,
    connections: ['landing-home', 'discover-work', 'discover-sponsor', 'build-keep', 'marketplace-main'],
    description: 'Your ship, Captain'
  },
  'discover-sponsor': {
    id: 'discover-sponsor',
    name: 'Plant Seeds',
    emoji: '🌱',
    route: '/discover/sponsor',
    area: 'sponsor',
    tier: 2,
    connections: ['landing-home', 'discover-work', 'discover-build', 'sponsor-gift', 'initiatives-main'],
    description: 'Johnny Appleseed mode'
  },

  // ───────────────────────────────────────────────────────────────────────────
  // TIER 2: Secondary Discovery Paths (Level 3 Triangle)
  // ───────────────────────────────────────────────────────────────────────────
  'discover-learn': {
    id: 'discover-learn',
    name: 'Learn a Skill',
    emoji: '📚',
    route: '/discover/learn',
    area: 'learn',
    tier: 2,
    connections: ['discover-governance', 'discover-initiatives', 'didasko-main', 'guilds-main'],
    description: 'Grow your abilities'
  },
  'discover-governance': {
    id: 'discover-governance',
    name: 'Governance',
    emoji: '🏛️',
    route: '/discover/governance',
    area: 'governance',
    tier: 2,
    connections: ['discover-learn', 'discover-initiatives', 'governance-300', 'governance-petitions'],
    description: 'The 300 await'
  },
  'discover-initiatives': {
    id: 'discover-initiatives',
    name: 'Sweet Sixteen',
    emoji: '💖',
    route: '/discover/initiatives',
    area: 'initiatives',
    tier: 2,
    connections: ['discover-learn', 'discover-governance', 'initiatives-main', 'initiatives-lmd'],
    description: 'The 16 initiatives'
  },

  // ───────────────────────────────────────────────────────────────────────────
  // TIER 3: Work Deep Pages
  // ───────────────────────────────────────────────────────────────────────────
  'work-opportunities': {
    id: 'work-opportunities',
    name: 'Opportunities',
    emoji: '🎯',
    route: '/work/opportunities',
    area: 'work',
    tier: 3,
    connections: ['discover-work', 'work-guilds', 'work-applications'],
    description: 'Browse available work'
  },
  'work-guilds': {
    id: 'work-guilds',
    name: 'Join a Guild',
    emoji: '⚔️',
    route: '/guilds',
    area: 'guilds',
    tier: 3,
    connections: ['discover-work', 'work-opportunities', 'guilds-main'],
  },
  'work-applications': {
    id: 'work-applications',
    name: 'My Applications',
    emoji: '📝',
    route: '/work/applications',
    area: 'work',
    tier: 3,
    connections: ['work-opportunities', 'portfolio-main'],
    isPickleZone: true, // Requires login
  },

  // ───────────────────────────────────────────────────────────────────────────
  // TIER 3: Build Deep Pages
  // ───────────────────────────────────────────────────────────────────────────
  'build-keep': {
    id: 'build-keep',
    name: 'Your Keep',
    emoji: '🏰',
    route: '/build/keep',
    area: 'build',
    tier: 3,
    connections: ['discover-build', 'build-projects', 'marketplace-main'],
  },
  'build-projects': {
    id: 'build-projects',
    name: 'Projects',
    emoji: '🔨',
    route: '/projects',
    area: 'build',
    tier: 3,
    connections: ['build-keep', 'marketplace-main'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // TIER 3: Sponsor Deep Pages
  // ───────────────────────────────────────────────────────────────────────────
  'sponsor-gift': {
    id: 'sponsor-gift',
    name: 'Gift Memberships',
    emoji: '🎁',
    route: '/sponsor/gift',
    area: 'sponsor',
    tier: 3,
    connections: ['discover-sponsor', 'initiatives-main'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // TIER 3: Learn Deep Pages
  // ───────────────────────────────────────────────────────────────────────────
  'didasko-main': {
    id: 'didasko-main',
    name: 'Didasko Academy',
    emoji: '🎓',
    route: '/didasko',
    area: 'learn',
    tier: 3,
    connections: ['discover-learn', 'didasko-courses', 'didasko-bounty'],
  },
  'didasko-courses': {
    id: 'didasko-courses',
    name: 'Courses',
    emoji: '📖',
    route: '/didasko/courses',
    area: 'learn',
    tier: 3,
    connections: ['didasko-main', 'didasko-bounty'],
    isPickleZone: true, // Complex navigation
  },
  'didasko-bounty': {
    id: 'didasko-bounty',
    name: 'Bounty Board',
    emoji: '💰',
    route: '/didasko/bounty',
    area: 'learn',
    tier: 3,
    connections: ['didasko-main', 'didasko-courses'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // TIER 3: Governance Deep Pages
  // ───────────────────────────────────────────────────────────────────────────
  'governance-300': {
    id: 'governance-300',
    name: 'The 300',
    emoji: '🗳️',
    route: '/governance/300',
    area: 'governance',
    tier: 3,
    connections: ['discover-governance', 'governance-petitions', 'governance-flywall'],
  },
  'governance-petitions': {
    id: 'governance-petitions',
    name: 'Petitions',
    emoji: '📜',
    route: '/governance/petitions',
    area: 'governance',
    tier: 3,
    connections: ['discover-governance', 'governance-300'],
  },
  'governance-flywall': {
    id: 'governance-flywall',
    name: 'Fly on the Wall',
    emoji: '🪰',
    route: '/governance/flywall',
    area: 'governance',
    tier: 3,
    connections: ['governance-300'],
    isPickleZone: true, // Deep transparency rabbit hole
  },

  // ───────────────────────────────────────────────────────────────────────────
  // TIER 3: Initiatives Deep Pages
  // ───────────────────────────────────────────────────────────────────────────
  'initiatives-main': {
    id: 'initiatives-main',
    name: 'All Initiatives',
    emoji: '💖',
    route: '/initiatives',
    area: 'initiatives',
    tier: 3,
    connections: ['discover-initiatives', 'discover-sponsor', 'initiatives-lmd', 'initiatives-lgg', 'initiatives-defense'],
  },
  'initiatives-lmd': {
    id: 'initiatives-lmd',
    name: "Let's Make Dinner",
    emoji: '🍽️',
    route: '/initiatives/lets-make-dinner',
    area: 'initiatives',
    tier: 3,
    connections: ['initiatives-main', 'initiatives-lgg'],
    description: 'Crown: Maneet Chauhan'
  },
  'initiatives-lgg': {
    id: 'initiatives-lgg',
    name: "Let's Get Groceries",
    emoji: '🛒',
    route: '/initiatives/lets-get-groceries',
    area: 'initiatives',
    tier: 3,
    connections: ['initiatives-main', 'initiatives-lmd', 'initiatives-lgs'],
  },
  'initiatives-lgs': {
    id: 'initiatives-lgs',
    name: "Let's Go Shopping",
    emoji: '🛍️',
    route: '/initiatives/lets-go-shopping',
    area: 'initiatives',
    tier: 3,
    connections: ['initiatives-lgg', 'initiatives-defense'],
    description: 'Crown: Mary Beth Laughton'
  },
  'initiatives-defense': {
    id: 'initiatives-defense',
    name: 'Defense Claws',
    emoji: '🛡️',
    route: '/initiatives/defense-claws',
    area: 'initiatives',
    tier: 3,
    connections: ['initiatives-main', 'initiatives-lgs'],
    description: 'For Someone You Love'
  },

  // ───────────────────────────────────────────────────────────────────────────
  // TIER 3: Guilds & Tribes
  // ───────────────────────────────────────────────────────────────────────────
  'guilds-main': {
    id: 'guilds-main',
    name: 'Guild Hall',
    emoji: '⚔️',
    route: '/guilds',
    area: 'guilds',
    tier: 3,
    connections: ['discover-learn', 'work-guilds', 'tribes-main'],
  },
  'tribes-main': {
    id: 'tribes-main',
    name: 'Tribes',
    emoji: '🏕️',
    route: '/tribes',
    area: 'tribes',
    tier: 3,
    connections: ['guilds-main', 'portfolio-main'],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // TIER 3: Marketplace & Portfolio
  // ───────────────────────────────────────────────────────────────────────────
  'marketplace-main': {
    id: 'marketplace-main',
    name: 'Marketplace',
    emoji: '🏪',
    route: '/marketplace',
    area: 'marketplace',
    tier: 3,
    connections: ['discover-build', 'build-keep', 'portfolio-main', 'deck-main'],
  },
  'portfolio-main': {
    id: 'portfolio-main',
    name: 'Portfolio',
    emoji: '📊',
    route: '/portfolio',
    area: 'portfolio',
    tier: 3,
    connections: ['marketplace-main', 'deck-main', 'tribes-main'],
    isPickleZone: true, // Requires login
  },
  'deck-main': {
    id: 'deck-main',
    name: 'The Deck',
    emoji: '🃏',
    route: '/deck',
    area: 'deck',
    tier: 3,
    connections: ['portfolio-main', 'marketplace-main'],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// GRAPH UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get all mirror nodes
 */
export function getAllMirrors(): MirrorNode[] {
  return Object.values(MIRROR_GRAPH);
}

/**
 * Get mirrors by tier
 */
export function getMirrorsByTier(tier: 1 | 2 | 3): MirrorNode[] {
  return getAllMirrors().filter(m => m.tier === tier);
}

/**
 * Get mirrors by area
 */
export function getMirrorsByArea(area: MirrorArea): MirrorNode[] {
  return getAllMirrors().filter(m => m.area === area);
}

/**
 * Get connected mirrors from a node
 */
export function getConnectedMirrors(mirrorId: string): MirrorNode[] {
  const node = MIRROR_GRAPH[mirrorId];
  if (!node) return [];
  return node.connections.map(id => MIRROR_GRAPH[id]).filter(Boolean);
}

/**
 * Find shortest path between two mirrors using BFS
 */
export function findShortestPath(startId: string, endId: string): string[] | null {
  if (startId === endId) return [startId];

  const visited = new Set<string>();
  const queue: { id: string; path: string[] }[] = [{ id: startId, path: [startId] }];

  while (queue.length > 0) {
    const { id, path } = queue.shift()!;

    if (visited.has(id)) continue;
    visited.add(id);

    const node = MIRROR_GRAPH[id];
    if (!node) continue;

    for (const nextId of node.connections) {
      if (nextId === endId) {
        return [...path, nextId];
      }
      if (!visited.has(nextId)) {
        queue.push({ id: nextId, path: [...path, nextId] });
      }
    }
  }

  return null; // No path found
}

/**
 * Calculate distance between two mirrors
 */
export function getDistance(startId: string, endId: string): number {
  const path = findShortestPath(startId, endId);
  return path ? path.length - 1 : Infinity;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PATH GENERATION (For Chase Mode)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Difficulty settings for path generation
 */
const DIFFICULTY_SETTINGS = {
  novice: {
    minLength: 3,
    maxLength: 5,
    allowPickleZones: false,
    maxTier: 2,
    baseTimeMs: 30000, // 30 seconds per step
  },
  journeyman: {
    minLength: 5,
    maxLength: 8,
    allowPickleZones: false,
    maxTier: 3,
    baseTimeMs: 25000,
  },
  expert: {
    minLength: 8,
    maxLength: 12,
    allowPickleZones: true,
    maxTier: 3,
    baseTimeMs: 20000,
  },
  legendary: {
    minLength: 12,
    maxLength: 20,
    allowPickleZones: true,
    maxTier: 3,
    baseTimeMs: 15000,
  },
};

/**
 * Generate a random chase path with given difficulty
 */
export function generateChasePath(
  difficulty: 'novice' | 'journeyman' | 'expert' | 'legendary',
  seed?: string
): MirrorPath {
  const settings = DIFFICULTY_SETTINGS[difficulty];

  // Seeded random for deterministic paths
  const random = seededRandom(seed || Math.random().toString());

  // Determine path length
  const pathLength = Math.floor(
    random() * (settings.maxLength - settings.minLength + 1) + settings.minLength
  );

  // Start from a random tier 2 node (discovery pages)
  const tier2Nodes = getMirrorsByTier(2);
  const startNode = tier2Nodes[Math.floor(random() * tier2Nodes.length)];

  const path: string[] = [startNode.id];
  const visited = new Set<string>([startNode.id]);
  let pickleRisk = 0;

  // Random walk to build path
  let currentId = startNode.id;
  while (path.length < pathLength) {
    const current = MIRROR_GRAPH[currentId];
    if (!current) break;

    // Filter valid next steps
    const validNext = current.connections.filter(id => {
      const node = MIRROR_GRAPH[id];
      if (!node) return false;
      if (visited.has(id)) return false;
      if (node.tier > settings.maxTier) return false;
      if (!settings.allowPickleZones && node.isPickleZone) return false;
      return true;
    });

    if (validNext.length === 0) {
      // Dead end - backtrack or end path
      break;
    }

    // Pick random next node
    const nextId = validNext[Math.floor(random() * validNext.length)];
    const nextNode = MIRROR_GRAPH[nextId];

    path.push(nextId);
    visited.add(nextId);
    currentId = nextId;

    if (nextNode?.isPickleZone) {
      pickleRisk += 0.15;
    }
  }

  // Calculate estimated time
  const estimatedTimeMs = path.length * settings.baseTimeMs;

  return {
    nodes: path,
    difficulty,
    estimatedTimeMs,
    pickleRisk: Math.min(pickleRisk, 1),
  };
}

/**
 * Validate that a path is still navigable
 */
export function validatePath(path: string[]): boolean {
  for (let i = 0; i < path.length - 1; i++) {
    const current = MIRROR_GRAPH[path[i]];
    if (!current) return false;
    if (!current.connections.includes(path[i + 1])) return false;
  }
  return true;
}

/**
 * Get the next valid steps from current position in a chase
 */
export function getNextSteps(currentId: string, targetPath: string[], currentIndex: number): {
  correct: string | null;
  alternatives: string[];
} {
  const current = MIRROR_GRAPH[currentId];
  if (!current) return { correct: null, alternatives: [] };

  const correctNext = targetPath[currentIndex + 1] || null;
  const alternatives = current.connections.filter(id => id !== correctNext);

  return { correct: correctNext, alternatives };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PICKLE DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if a player is "in a pickle" (stuck or lost)
 */
export function isInPickle(
  currentId: string,
  targetPath: string[],
  currentIndex: number,
  timeSpentMs: number,
  expectedTimeMs: number
): { isPickle: boolean; severity: number; hint?: string } {
  const current = MIRROR_GRAPH[currentId];
  if (!current) {
    return { isPickle: true, severity: 1, hint: "You've wandered off the map!" };
  }

  // Check if way behind on time
  const timeRatio = timeSpentMs / expectedTimeMs;
  if (timeRatio > 2) {
    return { isPickle: true, severity: 0.8, hint: "Time's slipping away..." };
  }

  // Check if in a pickle zone
  if (current.isPickleZone) {
    return { isPickle: true, severity: 0.5, hint: "This is tricky territory!" };
  }

  // Check if lost (not on the expected path)
  const expectedNext = targetPath[currentIndex + 1];
  if (expectedNext && !current.connections.includes(expectedNext)) {
    // Can we still reach the target?
    const pathToTarget = findShortestPath(currentId, expectedNext);
    if (!pathToTarget) {
      return { isPickle: true, severity: 0.9, hint: "You may need to backtrack..." };
    }
    if (pathToTarget.length > 3) {
      return { isPickle: true, severity: 0.6, hint: "You've strayed from the path" };
    }
  }

  return { isPickle: false, severity: 0 };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEEDED RANDOM (for deterministic path generation)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create a seeded random number generator
 */
function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }

  return function() {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  MIRROR_GRAPH,
  getAllMirrors,
  getMirrorsByTier,
  getMirrorsByArea,
  getConnectedMirrors,
  findShortestPath,
  getDistance,
  generateChasePath,
  validatePath,
  getNextSteps,
  isInPickle,
};
