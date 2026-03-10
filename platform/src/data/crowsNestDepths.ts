/**
 * THE CROW'S NEST — Depth Level Definitions
 * ==========================================
 * Six distinct interaction depths for the guided discovery system.
 * Each level represents a progressively deeper engagement with a topic.
 *
 * Metaphor (nautical):
 *   Glimpse  = Spot a landmark on the horizon
 *   Peek     = Use the spyglass
 *   TellMore = Read the navigation chart
 *   Sample   = Descend and sail to that island
 *   ShowMe   = Get a guided harbor tour
 *   ToGo     = Pack the sea chest with provisions
 */

export type DepthLevel =
  | "glimpse"          // 10 sec  — card face, always visible
  | "peek"             // 30 sec  — inline expand, one paragraph
  | "tell_me_more"     // 1-2 min — inline expand, full description
  | "sample"           // 3-5 min — navigate to the actual page/feature
  | "show_me"          // Guided  — open the ShowMeHelp or Spotlight tour
  | "to_go";           // Homework — packaged items to take with you

export interface DepthDef {
  level: DepthLevel;
  /** User-facing display name */
  label: string;
  /** Button text (imperative verb) */
  verb: string;
  /** Lucide icon name */
  icon: string;
  /** Approximate time commitment in seconds (0 = variable) */
  estimatedSeconds: number;
  /** true = expand in-place on the grid, false = navigate away or open overlay */
  inline: boolean;
  /** Short description of what this depth provides */
  description: string;
}

/**
 * Ordered array of all depth levels, from shallowest to deepest engagement.
 * The order matters — depth dots on FlyoverCards render in this sequence.
 */
export const DEPTH_LEVELS: DepthDef[] = [
  {
    level: "glimpse",
    label: "Glimpse",
    verb: "Glimpse",
    icon: "Eye",
    estimatedSeconds: 10,
    inline: true,
    description: "Quick tagline — see it at a glance",
  },
  {
    level: "peek",
    label: "Peek",
    verb: "Peek",
    icon: "Search",
    estimatedSeconds: 30,
    inline: true,
    description: "One paragraph overview",
  },
  {
    level: "tell_me_more",
    label: "Tell Me More",
    verb: "Tell Me More",
    icon: "BookOpen",
    estimatedSeconds: 120,
    inline: true,
    description: "Full description with context and connections",
  },
  {
    level: "sample",
    label: "Sample",
    verb: "Try It",
    icon: "PlayCircle",
    estimatedSeconds: 300,
    inline: false,
    description: "Visit the actual feature page",
  },
  {
    level: "show_me",
    label: "Show Me",
    verb: "Show Me",
    icon: "Compass",
    estimatedSeconds: 180,
    inline: false,
    description: "Guided tour of the feature",
  },
  {
    level: "to_go",
    label: "To-Go",
    verb: "Pack To-Go",
    icon: "Package",
    estimatedSeconds: 0,
    inline: true,
    description: "Take-home action items and homework",
  },
];

/** Lookup a depth definition by level */
export function getDepthDef(level: DepthLevel): DepthDef {
  const found = DEPTH_LEVELS.find((d) => d.level === level);
  if (!found) throw new Error(`Unknown depth level: ${level}`);
  return found;
}

/** Get the next deeper level, or null if already at deepest inline level */
export function getNextInlineDepth(current: DepthLevel): DepthLevel | null {
  const inlineLevels = DEPTH_LEVELS.filter((d) => d.inline);
  const idx = inlineLevels.findIndex((d) => d.level === current);
  if (idx === -1 || idx >= inlineLevels.length - 1) return null;
  return inlineLevels[idx + 1].level;
}

/**
 * Founder's depth verb mapping (for reference):
 *
 *   SHOW ME                         -> show_me (guided tour)
 *   DIG A LITTLE DEEPER / SAMPLE    -> sample (visit the page)
 *   TELL ME MORE                    -> tell_me_more (inline expand)
 *   SPOT CHECK / PLEASE EXPLAIN     -> peek or tell_me_more
 *   REVIEW / WHAT DOES THIS MEAN    -> peek or tell_me_more
 *   MAINTENANCE / DOUBLE-CHECK      -> future admin/steward tier
 *   HARD ANSWER                     -> tell_me_more + to_go
 *   PEEK                            -> peek (30-second inline)
 *   TO-GO                           -> to_go (packaged homework)
 */
