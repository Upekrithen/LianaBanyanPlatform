/**
 * TREASURE MAP ENGINE — Tag scoring and play recommendations
 * Maps collected tags to exactly 3 recommended plays, ranked by match strength.
 */

export type OptionTag = string;

export interface Play {
  id: string;
  title: string;
  subtitle: string;
  bullets: string[];
  cta: string;
  route: string;
  icon: string;
  /** Optional: for run-a-node, which initiative to highlight (e.g. lets-make-dinner, lets-get-groceries) */
  nodeId?: string;
}

/** All play definitions for the results screen. */
export const PLAYS: Record<string, Play> = {
  dinner_crew: {
    id: "dinner_crew",
    title: "Join a Local Dinner Crew",
    subtitle: "Cook or prep 1 night a week; neighbors preorder your meals.",
    bullets: [
      "We'll match you into a 12-person 'Let's Make Dinner' Crew.",
      "You back 1 other member's offer; they back yours.",
      "Typical first order: $15–$20.",
    ],
    cta: "Start Dinner Crew Setup",
    route: "/launch/run-a-node",
    icon: "🍽️",
    nodeId: "lets-make-dinner",
  },
  grocery_runner: {
    id: "grocery_runner",
    title: "Become a Grocery Runner",
    subtitle: "Use your car to deliver pre-ordered groceries on your schedule.",
    bullets: [
      "Short shifts, predictable routes in your area.",
      "Join a crew — share tips and split orders.",
      "Earn per delivery, no inventory needed.",
    ],
    cta: "Start Grocery Node Setup",
    route: "/launch/run-a-node",
    icon: "🛒",
    nodeId: "lets-get-groceries",
  },
  skill_session: {
    id: "skill_session",
    title: "Offer a 1-Hour Skill Session",
    subtitle: "Teach, advise, or help — online or in person.",
    bullets: [
      "Budget review, homework help, cooking lesson — whatever you know.",
      "We give you a template listing and price suggestions.",
      "Start with one session, grow from there.",
    ],
    cta: "Draft My First Listing",
    route: "/launch",
    icon: "💡",
  },
  digital_product: {
    id: "digital_product",
    title: "Launch a Digital Product",
    subtitle: "Templates, guides, art, music, code — anything downloadable.",
    bullets: [
      "Create once, sell to many.",
      "We handle the storefront and payments.",
      "Set your price; the 20% margin funds 16 charitable initiatives.",
    ],
    cta: "Start Your Product",
    route: "/launch",
    icon: "📦",
  },
  baked_goods: {
    id: "baked_goods",
    title: "Sell Baked Goods or Prepared Meals",
    subtitle: "Turn your kitchen into a micro-bakery or meal prep service.",
    bullets: [
      "List what you make, set quantities and pickup times.",
      "Neighbors preorder — you only make what's sold.",
      "Start with one item. Add more when ready.",
    ],
    cta: "List Your First Item",
    route: "/launch",
    icon: "🥖",
  },
  care_tutoring: {
    id: "care_tutoring",
    title: "Start a Care or Tutoring Offer",
    subtitle: "Help families with childcare, elder check-ins, homework, or companionship.",
    bullets: [
      "Set your availability and rates.",
      "Families in your Crew see you first.",
      "Build trust locally, expand organically.",
    ],
    cta: "Create Your Care Listing",
    route: "/launch",
    icon: "❤️",
  },
};

/** Default top 3 when no strong match (explore / minimal). */
const DEFAULT_PLAY_IDS: [string, string, string] = ["dinner_crew", "grocery_runner", "skill_session"];

/**
 * Primary tag combos → play id. Order matters: first match wins for ranking.
 * Format: comma-separated tag set → play id.
 */
const TAG_COMBO_MAP: Array<{ tags: Set<string>; playId: string }> = [
  { tags: new Set(["food", "kitchen", "batch"]), playId: "dinner_crew" },
  { tags: new Set(["car", "delivery", "fast"]), playId: "grocery_runner" },
  { tags: new Set(["skills", "people", "remote"]), playId: "skill_session" },
  { tags: new Set(["digital", "computer", "build"]), playId: "digital_product" },
  { tags: new Set(["assets", "car", "moderate"]), playId: "grocery_runner" },
  { tags: new Set(["food", "labor", "fast"]), playId: "baked_goods" },
  { tags: new Set(["people", "caring", "open"]), playId: "care_tutoring" },
  { tags: new Set(["explore", "minimal"]), playId: "dinner_crew" }, // will still return 3 via default
];

/**
 * Score each play by how many of its preferred tags the user has.
 * Used to rank when we have multiple candidates.
 */
function scorePlay(playId: string, tags: OptionTag[]): number {
  const tagSet = new Set(tags);
  const combo = TAG_COMBO_MAP.find((c) => c.playId === playId);
  if (!combo) return 0;
  let score = 0;
  combo.tags.forEach((t) => {
    if (tagSet.has(t)) score += 1;
  });
  return score;
}

/**
 * Get the best-matching play for a tag combo (for primary mapping).
 */
function getBestComboMatch(tags: OptionTag[]): string | null {
  const tagSet = new Set(tags);
  for (const { tags: required, playId } of TAG_COMBO_MAP) {
    const matchCount = [...required].filter((t) => tagSet.has(t)).length;
    if (matchCount === required.size) return playId;
  }
  return null;
}

/**
 * Returns exactly 3 plays, ranked by match strength.
 * If explore + minimal, or no strong match, returns default 3.
 */
export function getRecommendedPlays(tags: OptionTag[], sourceWeight?: "earn" | "build"): Play[] {
  const weighted = [...tags];
  if (sourceWeight === "earn") {
    weighted.push("fast", "labor");
  } else if (sourceWeight === "build") {
    weighted.push("build", "digital");
  }

  const hasExploreMinimal = weighted.includes("explore") && weighted.includes("minimal");
  const comboMatch = getBestComboMatch(weighted);

  const candidateIds = new Set<string>();
  if (comboMatch) candidateIds.add(comboMatch);
  if (hasExploreMinimal || tags.length === 0) {
    DEFAULT_PLAY_IDS.forEach((id) => candidateIds.add(id));
  }

  // Score all plays that appear in TAG_COMBO_MAP by tag overlap
  const playScores = new Map<string, number>();
  for (const { playId } of TAG_COMBO_MAP) {
    const s = scorePlay(playId, weighted);
    playScores.set(playId, (playScores.get(playId) ?? 0) + s);
  }
  // Add default plays so they can be chosen
  DEFAULT_PLAY_IDS.forEach((id) => {
    if (!playScores.has(id)) playScores.set(id, 0);
  });

  const sorted = [...playScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);

  const uniqueOrdered: string[] = [];
  for (const id of sorted) {
    if (uniqueOrdered.length >= 3) break;
    if (!uniqueOrdered.includes(id)) uniqueOrdered.push(id);
  }

  // If we have fewer than 3, fill with defaults
  for (const id of DEFAULT_PLAY_IDS) {
    if (uniqueOrdered.length >= 3) break;
    if (!uniqueOrdered.includes(id)) uniqueOrdered.push(id);
  }

  return uniqueOrdered.slice(0, 3).map((id) => PLAYS[id]).filter(Boolean);
}
