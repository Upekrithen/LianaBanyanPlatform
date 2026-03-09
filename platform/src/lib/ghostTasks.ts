/**
 * GHOST TASKS SYSTEM
 * ==================
 * Allows Ghosts to add tasks and track progress without persistence.
 * When they become a member, they can keep everything they've done.
 * 
 * "Build up reasons to get the $5 membership"
 */

// ════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════

export interface GhostTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
  completedAt?: Date;
  reward?: TaskReward;
  metadata?: Record<string, any>;
}

export interface TaskReward {
  credits?: number;
  marks?: number;
  reputation?: number;
  badge?: string;
}

export type TaskCategory = 
  | 'card_design'
  | 'exploration'
  | 'voting'
  | 'guild'
  | 'project'
  | 'learning'
  | 'social'
  | 'custom';

export interface GhostProgress {
  tasks: GhostTask[];
  cardsDesigned: string[];
  cardsViewed: string[];
  votesPlaced: number;
  guildsJoined: string[];
  projectsViewed: string[];
  initiativesExplored: string[];
  hexagonHallsVisited: string[];
  totalCreditsEarned: number;
  totalMarksEarned: number;
  onDeckFavorites: string[];
  customSettings: Record<string, any>;
}

// ════════════════════════════════════════════════════════════════════
// STORAGE
// ════════════════════════════════════════════════════════════════════

const GHOST_TASKS_KEY = 'ghost_tasks_progress';

function getGhostProgress(): GhostProgress {
  const stored = localStorage.getItem(GHOST_TASKS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return createEmptyProgress();
}

function saveGhostProgress(progress: GhostProgress): void {
  localStorage.setItem(GHOST_TASKS_KEY, JSON.stringify(progress));
}

function createEmptyProgress(): GhostProgress {
  return {
    tasks: [],
    cardsDesigned: [],
    cardsViewed: [],
    votesPlaced: 0,
    guildsJoined: [],
    projectsViewed: [],
    initiativesExplored: [],
    hexagonHallsVisited: [],
    totalCreditsEarned: 0,
    totalMarksEarned: 0,
    onDeckFavorites: [],
    customSettings: {},
  };
}

// ════════════════════════════════════════════════════════════════════
// TASK MANAGEMENT
// ════════════════════════════════════════════════════════════════════

/**
 * Add a task to the Ghost's task list
 */
export function addGhostTask(task: Omit<GhostTask, 'id' | 'createdAt' | 'status'>): GhostTask {
  const progress = getGhostProgress();
  
  const newTask: GhostTask = {
    ...task,
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    status: 'pending',
  };
  
  progress.tasks.push(newTask);
  saveGhostProgress(progress);
  
  return newTask;
}

/**
 * Update task status
 */
export function updateGhostTaskStatus(
  taskId: string, 
  status: GhostTask['status']
): GhostTask | null {
  const progress = getGhostProgress();
  const task = progress.tasks.find(t => t.id === taskId);
  
  if (!task) return null;
  
  task.status = status;
  if (status === 'completed') {
    task.completedAt = new Date();
  }
  
  saveGhostProgress(progress);
  return task;
}

/**
 * Get all Ghost tasks
 */
export function getGhostTasks(): GhostTask[] {
  return getGhostProgress().tasks;
}

/**
 * Remove a task
 */
export function removeGhostTask(taskId: string): boolean {
  const progress = getGhostProgress();
  const index = progress.tasks.findIndex(t => t.id === taskId);
  
  if (index === -1) return false;
  
  progress.tasks.splice(index, 1);
  saveGhostProgress(progress);
  return true;
}

// ════════════════════════════════════════════════════════════════════
// PROGRESS TRACKING
// ════════════════════════════════════════════════════════════════════

/**
 * Track card design interest
 */
export function trackCardDesignInterest(cardId: string): void {
  const progress = getGhostProgress();
  if (!progress.cardsDesigned.includes(cardId)) {
    progress.cardsDesigned.push(cardId);
    saveGhostProgress(progress);
  }
}

/**
 * Track card viewed
 */
export function trackCardViewed(cardId: string): void {
  const progress = getGhostProgress();
  if (!progress.cardsViewed.includes(cardId)) {
    progress.cardsViewed.push(cardId);
    saveGhostProgress(progress);
  }
}

/**
 * Track vote placed
 */
export function trackVotePlaced(): void {
  const progress = getGhostProgress();
  progress.votesPlaced++;
  saveGhostProgress(progress);
}

/**
 * Track guild joined
 */
export function trackGuildJoined(guildId: string): void {
  const progress = getGhostProgress();
  if (!progress.guildsJoined.includes(guildId)) {
    progress.guildsJoined.push(guildId);
    saveGhostProgress(progress);
  }
}

/**
 * Track initiative explored
 */
export function trackInitiativeExplored(initiativeId: string): void {
  const progress = getGhostProgress();
  if (!progress.initiativesExplored.includes(initiativeId)) {
    progress.initiativesExplored.push(initiativeId);
    saveGhostProgress(progress);
  }
}

/**
 * Track Hexagon hall visited
 */
export function trackHexagonHallVisited(hallId: string): void {
  const progress = getGhostProgress();
  if (!progress.hexagonHallsVisited.includes(hallId)) {
    progress.hexagonHallsVisited.push(hallId);
    saveGhostProgress(progress);
  }
}

/**
 * Track On Deck favorite
 */
export function trackOnDeckFavorite(destId: string): void {
  const progress = getGhostProgress();
  if (!progress.onDeckFavorites.includes(destId)) {
    progress.onDeckFavorites.push(destId);
    saveGhostProgress(progress);
  }
}

/**
 * Add credits earned
 */
export function addGhostCredits(amount: number): void {
  const progress = getGhostProgress();
  progress.totalCreditsEarned += amount;
  saveGhostProgress(progress);
}

/**
 * Add marks earned
 */
export function addGhostMarks(amount: number): void {
  const progress = getGhostProgress();
  progress.totalMarksEarned += amount;
  saveGhostProgress(progress);
}

// ════════════════════════════════════════════════════════════════════
// MEMBERSHIP CONVERSION SUMMARY
// ════════════════════════════════════════════════════════════════════

export interface ConversionSummary {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  cardsDesigned: number;
  cardsViewed: number;
  votesPlaced: number;
  guildsJoined: number;
  initiativesExplored: number;
  hexagonHallsVisited: number;
  onDeckFavorites: number;
  totalCreditsEarned: number;
  totalMarksEarned: number;
  estimatedValue: string;
  items: ConversionItem[];
}

export interface ConversionItem {
  category: string;
  description: string;
  count: number;
  icon: string;
}

/**
 * Get a summary of what the Ghost would keep if they become a member
 */
export function getConversionSummary(): ConversionSummary {
  const progress = getGhostProgress();
  
  const items: ConversionItem[] = [];
  
  if (progress.tasks.length > 0) {
    items.push({
      category: 'Tasks',
      description: `${progress.tasks.filter(t => t.status === 'completed').length} completed, ${progress.tasks.filter(t => t.status === 'pending').length} pending`,
      count: progress.tasks.length,
      icon: '📋',
    });
  }
  
  if (progress.cardsDesigned.length > 0) {
    items.push({
      category: 'Card Design Interest',
      description: 'Cards you want to redesign',
      count: progress.cardsDesigned.length,
      icon: '🎨',
    });
  }
  
  if (progress.cardsViewed.length > 0) {
    items.push({
      category: 'Cards Explored',
      description: 'Deck cards you\'ve viewed',
      count: progress.cardsViewed.length,
      icon: '🃏',
    });
  }
  
  if (progress.votesPlaced > 0) {
    items.push({
      category: 'Votes Placed',
      description: 'Your voice in governance',
      count: progress.votesPlaced,
      icon: '🗳️',
    });
  }
  
  if (progress.guildsJoined.length > 0) {
    items.push({
      category: 'Guilds Joined',
      description: 'Your guild memberships',
      count: progress.guildsJoined.length,
      icon: '🏰',
    });
  }
  
  if (progress.initiativesExplored.length > 0) {
    items.push({
      category: 'Initiatives Explored',
      description: 'Sweet Sixteen progress',
      count: progress.initiativesExplored.length,
      icon: '💙',
    });
  }
  
  if (progress.hexagonHallsVisited.length > 0) {
    items.push({
      category: 'Hexagon Halls Visited',
      description: 'Senate exploration',
      count: progress.hexagonHallsVisited.length,
      icon: '🏛️',
    });
  }
  
  if (progress.onDeckFavorites.length > 0) {
    items.push({
      category: 'On Deck Favorites',
      description: 'Your saved destinations',
      count: progress.onDeckFavorites.length,
      icon: '⭐',
    });
  }
  
  if (progress.totalCreditsEarned > 0) {
    items.push({
      category: 'Credits Earned',
      description: 'Ghost credits accumulated',
      count: progress.totalCreditsEarned,
      icon: '💰',
    });
  }
  
  if (progress.totalMarksEarned > 0) {
    items.push({
      category: 'Marks Earned',
      description: 'Voting power accumulated',
      count: progress.totalMarksEarned,
      icon: '🎯',
    });
  }
  
  return {
    totalTasks: progress.tasks.length,
    completedTasks: progress.tasks.filter(t => t.status === 'completed').length,
    pendingTasks: progress.tasks.filter(t => t.status === 'pending').length,
    cardsDesigned: progress.cardsDesigned.length,
    cardsViewed: progress.cardsViewed.length,
    votesPlaced: progress.votesPlaced,
    guildsJoined: progress.guildsJoined.length,
    initiativesExplored: progress.initiativesExplored.length,
    hexagonHallsVisited: progress.hexagonHallsVisited.length,
    onDeckFavorites: progress.onDeckFavorites.length,
    totalCreditsEarned: progress.totalCreditsEarned,
    totalMarksEarned: progress.totalMarksEarned,
    estimatedValue: calculateEstimatedValue(progress),
    items,
  };
}

/**
 * Calculate estimated value of Ghost progress
 */
function calculateEstimatedValue(progress: GhostProgress): string {
  let value = 0;
  
  // Tasks have value
  value += progress.tasks.length * 5;
  value += progress.tasks.filter(t => t.status === 'completed').length * 10;
  
  // Exploration has value
  value += progress.cardsViewed.length * 2;
  value += progress.initiativesExplored.length * 5;
  value += progress.hexagonHallsVisited.length * 5;
  
  // Engagement has value
  value += progress.votesPlaced * 3;
  value += progress.guildsJoined.length * 10;
  
  // Credits/Marks
  value += progress.totalCreditsEarned;
  value += progress.totalMarksEarned * 2;
  
  if (value < 50) return 'Just getting started';
  if (value < 100) return 'Building momentum';
  if (value < 250) return 'Significant progress';
  if (value < 500) return 'Substantial investment';
  return 'Major commitment';
}

/**
 * Clear all Ghost progress (called when user becomes member and data is migrated)
 */
export function clearGhostProgress(): void {
  localStorage.removeItem(GHOST_TASKS_KEY);
}

/**
 * Check if there's any Ghost progress to save
 */
export function hasGhostProgress(): boolean {
  const progress = getGhostProgress();
  return (
    progress.tasks.length > 0 ||
    progress.cardsDesigned.length > 0 ||
    progress.cardsViewed.length > 0 ||
    progress.votesPlaced > 0 ||
    progress.guildsJoined.length > 0 ||
    progress.initiativesExplored.length > 0 ||
    progress.hexagonHallsVisited.length > 0 ||
    progress.onDeckFavorites.length > 0 ||
    progress.totalCreditsEarned > 0 ||
    progress.totalMarksEarned > 0
  );
}

// ════════════════════════════════════════════════════════════════════
// PRE-DEFINED TASKS
// ════════════════════════════════════════════════════════════════════

export const CARD_DESIGN_TASK = {
  title: 'Redesign This Card',
  description: 'Earn Credits by creating new artwork for this deck card. Join the Design Guild to participate.',
  category: 'card_design' as TaskCategory,
  reward: {
    credits: 500,
    reputation: 25,
  },
};

export function createCardDesignTask(cardId: string, cardName: string): GhostTask {
  return addGhostTask({
    title: `Redesign: ${cardName}`,
    description: `Create new artwork for the ${cardName} deck card. Earn 500-2000 Credits based on complexity.`,
    category: 'card_design',
    reward: {
      credits: 500,
      reputation: 25,
    },
    metadata: { cardId, cardName },
  });
}
