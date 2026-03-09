/**
 * Ghost World & Half-Life System
 * 
 * Core mechanics for the ephemeral gameplay experience where non-members
 * compete for Crow Feathers (permanent achievements) while their loot
 * decays by half each time they return.
 * 
 * Canonical Quote: "Not in normal mode. You'd have to go Ghost."
 */

// ════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════

export interface GhostSession {
  sessionId: string;
  userId: string;
  startedAt: Date;
  expiresAt: Date;  // 12 hours max default, extended by persistence
  isPaused: boolean;
  pausedAt?: Date;
  persistenceTier: PersistenceTier;
  
  // Session loot (subject to Half-Life decay)
  loot: SessionLoot;
  
  // Saved loot (paid to bank)
  savedLoot?: SessionLoot;
  savedAt?: Date;
  
  // Free cue card for this session
  freeCueCardId?: string;
  freeCueCardSelectedAt?: Date;
}

export interface SessionLoot {
  goldenKeys: number;
  candles: number;
  friendWords: string[];
  areasDiscovered: string[];
  conduitsTraversed: number;
  deckCardsViewed: string[];
  beaconsCompleted: string[];
  inventoryItems: InventoryItem[];
}

export interface InventoryItem {
  id: string;
  type: string;
  name: string;
  quantity: number;
  acquiredAt: Date;
}

export interface CrowFeather {
  id: number;  // Global feather number (#1, #847, etc.)
  category: LeaderboardCategory;
  timeBracket: TimeBracket;
  recordValue: number;
  sessionDurationMinutes: number;
  earnedAt: Date;
  userId: string;
  username: string;
  supersededBy?: number;  // If record was beaten
}

export interface LeaderboardEntry {
  category: LeaderboardCategory;
  timeBracket: TimeBracket;
  userId: string;
  username: string;
  recordValue: number;
  sessionDurationMinutes: number;
  achievedAt: Date;
  crowFeatherId: number;
}

export type LeaderboardCategory = 
  | 'golden_keys'
  | 'areas_discovered'
  | 'labyrinth_speed'
  | 'conduits_traversed'
  | 'friend_words'
  | 'candles_earned'
  | 'deck_cards_viewed'
  | 'beacon_journeys'
  | 'beacon_run_speed'      // Fastest completion of a Beacon Run
  | 'beacons_dropped'       // Most beacons dropped in a session
  | 'beacon_runs_created';  // Total Beacon Runs created

export type TimeBracket =
  | 'under_15m'
  | '15m_30m'
  | '30m_1h'
  | '1h_2h'
  | '2h_3h'
  | '3h_4h'
  | '4h_6h'
  | '6h_8h'
  | '8h_10h'
  | '10h_12h'
  | 'absolute';  // For records without time brackets (e.g., labyrinth speed)

// ════════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════════

export const MAX_SESSION_HOURS = 12;
export const HALF_LIFE_DECAY_RATE = 0.5;

// PWA-Backed Rolling Persistence Tiers
export type PersistenceTier = 'default' | '3_days' | '7_days' | '30_days';

export const PERSISTENCE_DURATIONS: Record<PersistenceTier, number> = {
  'default': 12, // 12 hours
  '3_days': 72,  // 3 days in hours
  '7_days': 168, // 7 days in hours
  '30_days': 720 // 30 days in hours
};

export const SESSION_SAVE_PRICE = {
  nonMember: 0.50,
  member: 0.25,
};

export const SESSION_PURCHASE_TIERS = [
  { maxMinutes: 60, price: 0.50, label: 'Under 1 hour' },
  { maxMinutes: 180, price: 1.00, label: '1-3 hours' },
  { maxMinutes: 360, price: 1.50, label: '3-6 hours' },
  { maxMinutes: 720, price: 2.50, label: '6-12 hours' },
];

export const TIME_BRACKET_RANGES: Record<TimeBracket, { min: number; max: number }> = {
  'under_15m': { min: 0, max: 15 },
  '15m_30m': { min: 15, max: 30 },
  '30m_1h': { min: 30, max: 60 },
  '1h_2h': { min: 60, max: 120 },
  '2h_3h': { min: 120, max: 180 },
  '3h_4h': { min: 180, max: 240 },
  '4h_6h': { min: 240, max: 360 },
  '6h_8h': { min: 360, max: 480 },
  '8h_10h': { min: 480, max: 600 },
  '10h_12h': { min: 600, max: 720 },
  'absolute': { min: 0, max: Infinity },
};

// ════════════════════════════════════════════════════════════════════
// STORAGE KEYS
// ════════════════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  currentSession: 'ghost_world_session',
  previousLoot: 'ghost_world_previous_loot',
  crowFeathers: 'ghost_world_crow_feathers',
  sessionHistory: 'ghost_world_session_history',
};

// ════════════════════════════════════════════════════════════════════
// SESSION MANAGEMENT
// ════════════════════════════════════════════════════════════════════

/**
 * Upgrades the session's rolling persistence tier
 */
export function upgradePersistence(session: GhostSession, tier: PersistenceTier): GhostSession {
  const currentDuration = PERSISTENCE_DURATIONS[session.persistenceTier];
  const newDuration = PERSISTENCE_DURATIONS[tier];
  
  // Only upgrade if the new tier is longer
  if (newDuration > currentDuration) {
    session.persistenceTier = tier;
    const now = new Date();
    session.expiresAt = new Date(now.getTime() + newDuration * 60 * 60 * 1000);
    saveSession(session);
  }
  
  return session;
}

/**
 * Creates a new Ghost World session
 */
export function createGhostSession(userId: string): GhostSession {
  const now = new Date();
  const session: GhostSession = {
    sessionId: generateSessionId(),
    userId,
    startedAt: now,
    expiresAt: new Date(now.getTime() + MAX_SESSION_HOURS * 60 * 60 * 1000),
    isPaused: false,
    persistenceTier: 'default',
    loot: createEmptyLoot(),
  };
  
  saveSession(session);
  return session;
}

/**
 * Gets the current Ghost session, applying Half-Life decay if returning
 */
export function getOrCreateGhostSession(userId: string): { session: GhostSession; decayed: boolean; previousLoot?: SessionLoot } {
  const stored = localStorage.getItem(STORAGE_KEYS.currentSession);
  
  if (stored) {
    const session = JSON.parse(stored) as GhostSession;
    
    // Check if session expired
    if (new Date(session.expiresAt) < new Date()) {
      // Session expired - apply Half-Life decay
      const previousLoot = session.loot;
      const decayedLoot = applyHalfLifeDecay(previousLoot);
      
      // Store the decayed loot for the new session
      const newSession = createGhostSession(userId);
      newSession.loot = decayedLoot;
      saveSession(newSession);
      
      return { session: newSession, decayed: true, previousLoot };
    }
    
    return { session, decayed: false };
  }
  
  // Check for previous loot that needs decay
  const previousLootStr = localStorage.getItem(STORAGE_KEYS.previousLoot);
  if (previousLootStr) {
    const previousLoot = JSON.parse(previousLootStr) as SessionLoot;
    const decayedLoot = applyHalfLifeDecay(previousLoot);
    
    const newSession = createGhostSession(userId);
    newSession.loot = decayedLoot;
    saveSession(newSession);
    
    // Clear previous loot
    localStorage.removeItem(STORAGE_KEYS.previousLoot);
    
    return { session: newSession, decayed: true, previousLoot };
  }
  
  // Fresh start
  return { session: createGhostSession(userId), decayed: false };
}

/**
 * Saves loot mid-session (costs $0.50 for non-members, $0.25 for members)
 * Resets the 12-hour timer
 */
export function saveSessionLoot(session: GhostSession, isMember: boolean): GhostSession {
  const now = new Date();
  
  // Bank current loot
  session.savedLoot = { ...session.loot };
  session.savedAt = now;
  
  // Reset timer
  session.expiresAt = new Date(now.getTime() + MAX_SESSION_HOURS * 60 * 60 * 1000);
  
  saveSession(session);
  
  return session;
}

/**
 * Ends the session and determines what to keep
 */
export function endGhostSession(session: GhostSession, purchaseKeep: boolean): { keptLoot: SessionLoot; lostLoot: SessionLoot } {
  const keptLoot = createEmptyLoot();
  const lostLoot = createEmptyLoot();
  
  if (purchaseKeep) {
    // Purchased - keep everything
    Object.assign(keptLoot, session.loot);
    if (session.savedLoot) {
      mergeLoot(keptLoot, session.savedLoot);
    }
  } else {
    // Not purchased - store for Half-Life decay on next return
    const totalLoot = { ...session.loot };
    if (session.savedLoot) {
      mergeLoot(totalLoot, session.savedLoot);
    }
    
    // Store for decay
    localStorage.setItem(STORAGE_KEYS.previousLoot, JSON.stringify(totalLoot));
    Object.assign(lostLoot, totalLoot);
  }
  
  // Clear current session
  localStorage.removeItem(STORAGE_KEYS.currentSession);
  
  return { keptLoot, lostLoot };
}

// ════════════════════════════════════════════════════════════════════
// HALF-LIFE DECAY
// ════════════════════════════════════════════════════════════════════

/**
 * Applies Half-Life decay to loot
 * "The crow remembers what the ghost forgets."
 */
export function applyHalfLifeDecay(loot: SessionLoot): SessionLoot {
  return {
    goldenKeys: Math.floor(loot.goldenKeys * HALF_LIFE_DECAY_RATE),
    candles: Math.floor(loot.candles * HALF_LIFE_DECAY_RATE * 10) / 10, // Keep one decimal
    friendWords: randomHalf(loot.friendWords),
    areasDiscovered: randomHalf(loot.areasDiscovered),
    conduitsTraversed: Math.floor(loot.conduitsTraversed * HALF_LIFE_DECAY_RATE),
    deckCardsViewed: randomHalf(loot.deckCardsViewed),
    beaconsCompleted: randomHalf(loot.beaconsCompleted),
    inventoryItems: randomHalf(loot.inventoryItems),
  };
}

/**
 * Randomly selects half of an array
 */
function randomHalf<T>(items: T[]): T[] {
  const keepCount = Math.floor(items.length * HALF_LIFE_DECAY_RATE);
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, keepCount);
}

// ════════════════════════════════════════════════════════════════════
// LEADERBOARDS & CROW FEATHERS
// ════════════════════════════════════════════════════════════════════

/**
 * Checks if current session has set any new records
 */
export function checkForRecords(session: GhostSession): CrowFeather[] {
  const sessionMinutes = Math.floor(
    (new Date().getTime() - new Date(session.startedAt).getTime()) / 60000
  );
  const timeBracket = getTimeBracket(sessionMinutes);
  const newFeathers: CrowFeather[] = [];
  
  // Check each category
  const categories: { category: LeaderboardCategory; value: number }[] = [
    { category: 'golden_keys', value: session.loot.goldenKeys },
    { category: 'areas_discovered', value: session.loot.areasDiscovered.length },
    { category: 'conduits_traversed', value: session.loot.conduitsTraversed },
    { category: 'friend_words', value: session.loot.friendWords.length },
    { category: 'candles_earned', value: session.loot.candles },
    { category: 'deck_cards_viewed', value: session.loot.deckCardsViewed.length },
    { category: 'beacon_journeys', value: session.loot.beaconsCompleted.length },
  ];
  
  for (const { category, value } of categories) {
    if (value > 0 && isNewRecord(category, timeBracket, value)) {
      const feather = createCrowFeather(
        category,
        timeBracket,
        value,
        sessionMinutes,
        session.userId
      );
      newFeathers.push(feather);
    }
  }
  
  return newFeathers;
}

/**
 * Gets the time bracket for a session duration
 */
export function getTimeBracket(minutes: number): TimeBracket {
  for (const [bracket, range] of Object.entries(TIME_BRACKET_RANGES)) {
    if (bracket !== 'absolute' && minutes >= range.min && minutes < range.max) {
      return bracket as TimeBracket;
    }
  }
  return '10h_12h';
}

/**
 * Checks if a value is a new record for the category/bracket
 */
function isNewRecord(category: LeaderboardCategory, bracket: TimeBracket, value: number): boolean {
  // In production, this would check against Supabase
  // For now, check localStorage
  const leaderboard = getLocalLeaderboard();
  const key = `${category}_${bracket}`;
  const currentRecord = leaderboard[key];
  
  return !currentRecord || value > currentRecord.recordValue;
}

/**
 * Creates a new Crow Feather
 */
function createCrowFeather(
  category: LeaderboardCategory,
  timeBracket: TimeBracket,
  recordValue: number,
  sessionDurationMinutes: number,
  userId: string
): CrowFeather {
  const feathers = getCrowFeathers();
  const nextId = feathers.length > 0 ? Math.max(...feathers.map(f => f.id)) + 1 : 1;
  
  const feather: CrowFeather = {
    id: nextId,
    category,
    timeBracket,
    recordValue,
    sessionDurationMinutes,
    earnedAt: new Date(),
    userId,
    username: 'You',  // Would come from auth in production
  };
  
  // Save to local storage
  feathers.push(feather);
  localStorage.setItem(STORAGE_KEYS.crowFeathers, JSON.stringify(feathers));
  
  // Update leaderboard
  updateLocalLeaderboard(category, timeBracket, feather);
  
  return feather;
}

/**
 * Gets all Crow Feathers for the current user
 */
export function getCrowFeathers(): CrowFeather[] {
  const stored = localStorage.getItem(STORAGE_KEYS.crowFeathers);
  return stored ? JSON.parse(stored) : [];
}

// ════════════════════════════════════════════════════════════════════
// LOCAL LEADERBOARD (would be Supabase in production)
// ════════════════════════════════════════════════════════════════════

interface LocalLeaderboard {
  [key: string]: LeaderboardEntry;
}

function getLocalLeaderboard(): LocalLeaderboard {
  const stored = localStorage.getItem('ghost_world_leaderboard');
  return stored ? JSON.parse(stored) : {};
}

function updateLocalLeaderboard(category: LeaderboardCategory, bracket: TimeBracket, feather: CrowFeather): void {
  const leaderboard = getLocalLeaderboard();
  const key = `${category}_${bracket}`;
  
  leaderboard[key] = {
    category,
    timeBracket: bracket,
    userId: feather.userId,
    username: feather.username,
    recordValue: feather.recordValue,
    sessionDurationMinutes: feather.sessionDurationMinutes,
    achievedAt: feather.earnedAt,
    crowFeatherId: feather.id,
  };
  
  localStorage.setItem('ghost_world_leaderboard', JSON.stringify(leaderboard));
}

// ════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════

function generateSessionId(): string {
  return `ghost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createEmptyLoot(): SessionLoot {
  return {
    goldenKeys: 0,
    candles: 0,
    friendWords: [],
    areasDiscovered: [],
    conduitsTraversed: 0,
    deckCardsViewed: [],
    beaconsCompleted: [],
    inventoryItems: [],
  };
}

function saveSession(session: GhostSession): void {
  localStorage.setItem(STORAGE_KEYS.currentSession, JSON.stringify(session));
}

function mergeLoot(target: SessionLoot, source: SessionLoot): void {
  target.goldenKeys += source.goldenKeys;
  target.candles += source.candles;
  target.friendWords = [...new Set([...target.friendWords, ...source.friendWords])];
  target.areasDiscovered = [...new Set([...target.areasDiscovered, ...source.areasDiscovered])];
  target.conduitsTraversed += source.conduitsTraversed;
  target.deckCardsViewed = [...new Set([...target.deckCardsViewed, ...source.deckCardsViewed])];
  target.beaconsCompleted = [...new Set([...target.beaconsCompleted, ...source.beaconsCompleted])];
  target.inventoryItems = [...target.inventoryItems, ...source.inventoryItems];
}

// ════════════════════════════════════════════════════════════════════
// LOOT TRACKING (call these as user plays)
// ════════════════════════════════════════════════════════════════════

export function addGoldenKey(session: GhostSession): void {
  session.loot.goldenKeys++;
  saveSession(session);
}

export function addCandle(session: GhostSession, amount: number = 1): void {
  session.loot.candles += amount;
  saveSession(session);
}

export function addFriendWord(session: GhostSession, word: string): void {
  if (!session.loot.friendWords.includes(word)) {
    session.loot.friendWords.push(word);
    saveSession(session);
  }
}

export function addAreaDiscovered(session: GhostSession, areaId: string): void {
  if (!session.loot.areasDiscovered.includes(areaId)) {
    session.loot.areasDiscovered.push(areaId);
    saveSession(session);
  }
}

export function addConduitTraversal(session: GhostSession): void {
  session.loot.conduitsTraversed++;
  saveSession(session);
}

export function addDeckCardViewed(session: GhostSession, cardId: string): void {
  if (!session.loot.deckCardsViewed.includes(cardId)) {
    session.loot.deckCardsViewed.push(cardId);
    saveSession(session);
  }
}

export function addBeaconCompleted(session: GhostSession, beaconId: string): void {
  if (!session.loot.beaconsCompleted.includes(beaconId)) {
    session.loot.beaconsCompleted.push(beaconId);
    saveSession(session);
  }
}

export function addInventoryItem(session: GhostSession, item: Omit<InventoryItem, 'acquiredAt'>): void {
  session.loot.inventoryItems.push({
    ...item,
    acquiredAt: new Date(),
  });
  saveSession(session);
}

// ════════════════════════════════════════════════════════════════════
// SESSION DISPLAY HELPERS
// ════════════════════════════════════════════════════════════════════

export function formatSessionDuration(session: GhostSession): string {
  const minutes = Math.floor(
    (new Date().getTime() - new Date(session.startedAt).getTime()) / 60000
  );
  
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export function getSessionTimeRemaining(session: GhostSession): string {
  const remaining = new Date(session.expiresAt).getTime() - new Date().getTime();
  
  if (remaining <= 0) {
    return 'Expired';
  }
  
  const minutes = Math.floor(remaining / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return `${hours}h ${remainingMinutes}m remaining`;
}

export function getSessionPurchasePrice(session: GhostSession): number {
  const minutes = Math.floor(
    (new Date().getTime() - new Date(session.startedAt).getTime()) / 60000
  );
  
  for (const tier of SESSION_PURCHASE_TIERS) {
    if (minutes <= tier.maxMinutes) {
      return tier.price;
    }
  }
  
  return SESSION_PURCHASE_TIERS[SESSION_PURCHASE_TIERS.length - 1].price;
}

// ════════════════════════════════════════════════════════════════════
// CATEGORY DISPLAY NAMES
// ════════════════════════════════════════════════════════════════════

export const CATEGORY_NAMES: Record<LeaderboardCategory, string> = {
  golden_keys: 'Golden Keys',
  areas_discovered: 'Areas Discovered',
  labyrinth_speed: 'Labyrinth Speed',
  conduits_traversed: 'Conduits Traversed',
  friend_words: 'Friend Words',
  candles_earned: 'Candles Earned',
  deck_cards_viewed: 'Deck Cards Viewed',
  beacon_journeys: 'Beacon Journeys',
  beacon_run_speed: 'Beacon Run Speed',
  beacons_dropped: 'Beacons Dropped',
  beacon_runs_created: 'Beacon Runs Created',
};

export const TIME_BRACKET_NAMES: Record<TimeBracket, string> = {
  'under_15m': 'Under 15 min',
  '15m_30m': '15-30 min',
  '30m_1h': '30 min - 1 hr',
  '1h_2h': '1-2 hours',
  '2h_3h': '2-3 hours',
  '3h_4h': '3-4 hours',
  '4h_6h': '4-6 hours',
  '6h_8h': '6-8 hours',
  '8h_10h': '8-10 hours',
  '10h_12h': '10-12 hours',
  'absolute': 'All Time',
};

// ════════════════════════════════════════════════════════════════════
// GHOST CHASE MODE INTEGRATION
// Allows Ghosts to ante with session-based marks and track stats
// "Crow Feathers persist even for Ghosts — their ONLY persistent thing"
// ════════════════════════════════════════════════════════════════════

export interface GhostChaseStats {
  totalChases: number;
  wins: number;
  losses: number;
  quits: number;
  totalAnteSpent: number;
  totalWinnings: number;
  netProfit: number;
  bestFinish: number;
  bestTimeMs: number;
  currentStreak: number;
  bestStreak: number;
}

const GHOST_CHASE_STORAGE_KEY = 'ghost_world_chase_stats';

/**
 * Get Ghost's chase stats (persists in localStorage)
 */
export function getGhostChaseStats(): GhostChaseStats {
  const stored = localStorage.getItem(GHOST_CHASE_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    totalChases: 0,
    wins: 0,
    losses: 0,
    quits: 0,
    totalAnteSpent: 0,
    totalWinnings: 0,
    netProfit: 0,
    bestFinish: 999,
    bestTimeMs: Infinity,
    currentStreak: 0,
    bestStreak: 0,
  };
}

/**
 * Update Ghost's chase stats after a chase
 */
export function updateGhostChaseStats(
  position: number,
  totalParticipants: number,
  anteAmount: number,
  payout: number,
  finishTimeMs: number,
  status: 'finished' | 'quit' | 'lost'
): GhostChaseStats {
  const stats = getGhostChaseStats();
  
  stats.totalChases++;
  stats.totalAnteSpent += anteAmount;
  
  if (status === 'quit') {
    stats.quits++;
    stats.currentStreak = 0;
  } else if (status === 'lost' || position > Math.ceil(totalParticipants / 2)) {
    stats.losses++;
    stats.currentStreak = 0;
  } else {
    stats.wins++;
    stats.totalWinnings += payout;
    stats.currentStreak++;
    
    if (stats.currentStreak > stats.bestStreak) {
      stats.bestStreak = stats.currentStreak;
    }
    
    if (position < stats.bestFinish) {
      stats.bestFinish = position;
    }
  }
  
  if (finishTimeMs < stats.bestTimeMs && status === 'finished') {
    stats.bestTimeMs = finishTimeMs;
  }
  
  stats.netProfit = stats.totalWinnings - stats.totalAnteSpent;
  
  localStorage.setItem(GHOST_CHASE_STORAGE_KEY, JSON.stringify(stats));
  
  return stats;
}

/**
 * Check if Ghost can afford to ante (using session marks)
 */
export function canGhostAffordAnte(session: GhostSession, anteAmount: number): boolean {
  // Ghosts use their session Marks (stored as 'goldenKeys' for simplicity, 
  // or we could add a separate 'sessionMarks' field)
  // For now, Ghosts play with their candles as "marks" equivalent
  return session.loot.candles >= anteAmount;
}

/**
 * Deduct ante from Ghost's session loot
 */
export function deductGhostAnte(session: GhostSession, anteAmount: number): GhostSession {
  session.loot.candles -= anteAmount;
  saveGhostSession(session);
  return session;
}

/**
 * Add winnings to Ghost's session loot
 */
export function addGhostWinnings(session: GhostSession, amount: number): GhostSession {
  session.loot.candles += amount;
  saveGhostSession(session);
  return session;
}

/**
 * Save Ghost session helper
 */
function saveGhostSession(session: GhostSession): void {
  localStorage.setItem(STORAGE_KEYS.currentSession, JSON.stringify(session));
}

/**
 * Check if currently in Ghost mode (no authenticated user)
 */
export function isGhostMode(): boolean {
  const session = localStorage.getItem(STORAGE_KEYS.currentSession);
  return session !== null;
}

/**
 * Get current Ghost session if exists
 */
export function getCurrentGhostSession(): GhostSession | null {
  const stored = localStorage.getItem(STORAGE_KEYS.currentSession);
  return stored ? JSON.parse(stored) : null;
}

// ════════════════════════════════════════════════════════════════════
// BEACON RUN INTEGRATION
// "Not in normal mode. You'd have to go Ghost."
// Beacon Runs can ONLY be created and played in Ghost Mode
// ════════════════════════════════════════════════════════════════════

export interface BeaconRunProgress {
  runId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  currentWaypointIndex: number;
  totalWaypoints: number;
  elapsedMs: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  crowFeatherEarned?: number;
}

export interface BeaconRunLeaderboardEntry {
  runId: string;
  runName: string;
  userId: string;
  username: string;
  completionTimeMs: number;
  completedAt: Date;
  crowFeatherId?: number;
  rank: number;
}

const BEACON_RUN_STORAGE_KEY = 'ghost_world_beacon_runs';

/**
 * Start a Beacon Run attempt (Ghost Mode only)
 */
export function startBeaconRun(
  runId: string, 
  totalWaypoints: number, 
  userId: string
): BeaconRunProgress {
  const progress: BeaconRunProgress = {
    runId,
    userId,
    startedAt: new Date(),
    currentWaypointIndex: 0,
    totalWaypoints,
    elapsedMs: 0,
    status: 'in_progress',
  };
  
  const stored = localStorage.getItem(BEACON_RUN_STORAGE_KEY);
  const runs = stored ? JSON.parse(stored) : {};
  runs[runId] = progress;
  localStorage.setItem(BEACON_RUN_STORAGE_KEY, JSON.stringify(runs));
  
  return progress;
}

/**
 * Update progress on a Beacon Run
 */
export function updateBeaconRunProgress(
  runId: string,
  waypointIndex: number
): BeaconRunProgress | null {
  const stored = localStorage.getItem(BEACON_RUN_STORAGE_KEY);
  if (!stored) return null;
  
  const runs = JSON.parse(stored);
  const progress = runs[runId] as BeaconRunProgress;
  if (!progress) return null;
  
  progress.currentWaypointIndex = waypointIndex;
  progress.elapsedMs = new Date().getTime() - new Date(progress.startedAt).getTime();
  
  localStorage.setItem(BEACON_RUN_STORAGE_KEY, JSON.stringify(runs));
  return progress;
}

/**
 * Complete a Beacon Run and check for Crow Feather
 */
export function completeBeaconRun(
  runId: string,
  session: GhostSession
): { progress: BeaconRunProgress; crowFeather?: CrowFeather } {
  const stored = localStorage.getItem(BEACON_RUN_STORAGE_KEY);
  if (!stored) throw new Error('No beacon run in progress');
  
  const runs = JSON.parse(stored);
  const progress = runs[runId] as BeaconRunProgress;
  if (!progress) throw new Error('Beacon run not found');
  
  progress.completedAt = new Date();
  progress.elapsedMs = progress.completedAt.getTime() - new Date(progress.startedAt).getTime();
  progress.status = 'completed';
  
  localStorage.setItem(BEACON_RUN_STORAGE_KEY, JSON.stringify(runs));
  
  // Add to session loot
  addBeaconCompleted(session, runId);
  
  // Check for speed record (Crow Feather)
  let crowFeather: CrowFeather | undefined;
  const sessionMinutes = Math.floor(
    (new Date().getTime() - new Date(session.startedAt).getTime()) / 60000
  );
  const timeBracket = getTimeBracket(sessionMinutes);
  
  // Speed is measured in seconds (lower is better)
  const completionSeconds = Math.floor(progress.elapsedMs / 1000);
  if (isNewSpeedRecord('beacon_run_speed', timeBracket, completionSeconds, runId)) {
    crowFeather = createBeaconRunCrowFeather(
      'beacon_run_speed',
      timeBracket,
      completionSeconds,
      sessionMinutes,
      session.userId,
      runId
    );
    progress.crowFeatherEarned = crowFeather.id;
  }
  
  return { progress, crowFeather };
}

/**
 * Abandon a Beacon Run
 */
export function abandonBeaconRun(runId: string): void {
  const stored = localStorage.getItem(BEACON_RUN_STORAGE_KEY);
  if (!stored) return;
  
  const runs = JSON.parse(stored);
  if (runs[runId]) {
    runs[runId].status = 'abandoned';
    localStorage.setItem(BEACON_RUN_STORAGE_KEY, JSON.stringify(runs));
  }
}

/**
 * Check if a completion time is a new speed record for a specific Beacon Run
 */
function isNewSpeedRecord(
  category: LeaderboardCategory, 
  bracket: TimeBracket, 
  seconds: number,
  runId: string
): boolean {
  const leaderboard = getLocalLeaderboard();
  const key = `${category}_${bracket}_${runId}`;
  const currentRecord = leaderboard[key];
  
  // For speed, lower is better
  return !currentRecord || seconds < currentRecord.recordValue;
}

/**
 * Create a Crow Feather specifically for Beacon Run achievements
 */
function createBeaconRunCrowFeather(
  category: LeaderboardCategory,
  timeBracket: TimeBracket,
  recordValue: number,
  sessionDurationMinutes: number,
  userId: string,
  runId: string
): CrowFeather {
  const feathers = getCrowFeathers();
  const nextId = feathers.length > 0 ? Math.max(...feathers.map(f => f.id)) + 1 : 1;
  
  const feather: CrowFeather = {
    id: nextId,
    category,
    timeBracket,
    recordValue,
    sessionDurationMinutes,
    earnedAt: new Date(),
    userId,
    username: 'You',
  };
  
  feathers.push(feather);
  localStorage.setItem(STORAGE_KEYS.crowFeathers, JSON.stringify(feathers));
  
  // Update run-specific leaderboard
  const leaderboard = getLocalLeaderboard();
  const key = `${category}_${timeBracket}_${runId}`;
  leaderboard[key] = {
    category,
    timeBracket,
    userId,
    username: 'You',
    recordValue,
    sessionDurationMinutes,
    achievedAt: feather.earnedAt,
    crowFeatherId: feather.id,
  };
  localStorage.setItem('ghost_world_leaderboard', JSON.stringify(leaderboard));
  
  return feather;
}

/**
 * Get Beacon Run leaderboard for a specific run
 */
export function getBeaconRunLeaderboard(runId: string): BeaconRunLeaderboardEntry[] {
  const leaderboard = getLocalLeaderboard();
  const entries: BeaconRunLeaderboardEntry[] = [];
  
  for (const [key, entry] of Object.entries(leaderboard)) {
    if (key.includes(`beacon_run_speed`) && key.includes(runId)) {
      entries.push({
        runId,
        runName: `Beacon Run ${runId.slice(0, 8)}`,
        userId: entry.userId,
        username: entry.username,
        completionTimeMs: entry.recordValue * 1000,
        completedAt: new Date(entry.achievedAt),
        crowFeatherId: entry.crowFeatherId,
        rank: 0,
      });
    }
  }
  
  // Sort by completion time and assign ranks
  entries.sort((a, b) => a.completionTimeMs - b.completionTimeMs);
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });
  
  return entries;
}

/**
 * Get all Crow Feathers earned from Beacon Runs
 */
export function getBeaconRunCrowFeathers(): CrowFeather[] {
  return getCrowFeathers().filter(f => 
    f.category === 'beacon_run_speed' || 
    f.category === 'beacons_dropped' ||
    f.category === 'beacon_runs_created'
  );
}

/**
 * Format completion time for display
 */
export function formatCompletionTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${seconds}s`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
}
