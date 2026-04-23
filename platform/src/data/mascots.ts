/**
 * mascots.ts — The Liana Banyan character ensemble registry.
 * ============================================================
 * Each mascot has a stable `domain` (type of explanation) and a
 * 3-state visual system (default / hover / xray) matching LRH.
 *
 * ARCHITECTURE (B095):
 * ─────────────────────────────────────────────────────────────
 * - TWO HOSTS: Little Red Hen (Southern Province) and Denken
 *   (Northern Province, Founder persona). They are peers — each
 *   one appears based on the active province (see
 *   BuilderModeContext). Only ONE host is on-screen at a time.
 * - The active host is always in the FAB corner and summons
 *   guest characters inline when a topic needs deeper explanation.
 * - Guest characters are DOMAIN-OF-KNOWLEDGE specialists, not
 *   platform-role specialists. "The Great Owl" explains WHY
 *   (logic) across every pipeline. "Brick Pig" explains MATH
 *   (splits, percentages, Joules) across every pipeline. They
 *   never drift, never get retconned, and a single character
 *   can return in the same pipeline when their topic-type
 *   recurs.
 * - Same character can appear in many pipelines. The character's
 *   presence itself is a cognitive shortcut: "Oh, Owl is here →
 *   this is a WHY moment."
 *
 * USER-FACING RULE:
 *   LRH → "Let me bring in [X] to explain..." → guest bubble →
 *   LRH resumes. Guests are summoned, not persistent.
 *
 * PLACEHOLDER STRATEGY:
 *   Characters without final art use gray sketch tiles from
 *   `public/images/mascots/_reference/character-roster.png`
 *   (sliced into 16 slots). When son delivers finished art,
 *   overwrite the files in `public/images/mascots/{slug}/` —
 *   no code changes needed.
 *
 * 2 HOSTS + 12 RECURRING DOMAINS + 3 SPECIALS = 17 TOTAL.
 */

import type { HologramTier } from "@/components/museum/LRHCharacter";

/**
 * The type of explanation a character owns.
 * A domain is a stable axis of knowledge — not a platform role.
 */
export type MascotDomain =
  | "host"         // LRH + Denken — the province hosts who summon the others
  | "why"          // The logic, reasoning, "why this rule exists"
  | "math"         // Numbers, percentages, splits, arithmetic
  | "mechanics"    // How things work — plumbing, pipelines, systems
  | "story"        // Origin, narrative, historical decisions
  | "governance"   // Rules, voting, Star Chamber, bylaws
  | "craft"        // Creative tools, making, aesthetics, wardrobe
  | "community"    // Tribes, Guilds, Family Table, social
  | "trust"        // Safety, Content Shield, moderation, X-Ray
  | "money"        // LB Card, payouts, Stripe, dollar conversions
  | "discovery"    // Search, beacons, Treasure Maps, navigation
  | "future"       // Roadmap, Upekrithen vision, "where this goes"
  | "learning"     // Tours, onboarding, tutorials, pedagogy
  // Specials — rare appearances, high impact moments
  | "ghost"        // Ghost World / un-membered state
  | "historian"    // Museum / archive content
  | "critic";      // Devil's advocate / counter-argument slot

/**
 * Which kind of dialogue this character naturally gives.
 * Used by LRH's introduction line generator.
 */
export type MascotKind = "host" | "specialist" | "special";

export interface MascotVisual {
  default: string;
  hover: string;
  xray: string;
}

export interface MascotDefinition {
  /** Stable slug — used as the mascot ID in code and URLs. */
  id: string;
  /** Full display name, e.g. "The Great Owl". */
  name: string;
  /** Short archetype label, e.g. "The Wise One". */
  title: string;
  /** One-line role description for Cast gallery cards. */
  oneLiner: string;
  /** The domain-of-knowledge this character owns. */
  domain: MascotDomain;
  kind: MascotKind;
  /** Hologram refresh tier (from LRHCharacter). */
  hologramTier: HologramTier;
  /** Image paths (default / hover / xray). */
  visual: MascotVisual;
  /**
   * What the active host says when summoning this character inline.
   * Should end in "…" or ":". Leave the guest's message to the
   * SummonMascot caller (per-topic). Hosts don't summon themselves
   * so their lrhIntro is empty.
   */
  lrhIntro: string;
  /**
   * What this character says when their explanation is done and
   * the host takes back over. Should feel like an exit line.
   */
  exitLine: string;
  /** Longer bio for the Cast gallery — who they are and why they exist. */
  bio: string;
  /** Is the visual art final or a placeholder sketch? */
  artStatus: "final" | "placeholder";
  /** True for the "special appearance" characters. */
  special?: boolean;
  /** For host characters: which province they host. */
  province?: "southern" | "northern";
}

// ════════════════════════════════════════════════════════════════
// HELPER — Build a visual object from a mascot folder slug.
// ════════════════════════════════════════════════════════════════
const visual = (slug: string): MascotVisual => ({
  default: `/images/mascots/${slug}/default.png`,
  hover: `/images/mascots/${slug}/hover.png`,
  xray: `/images/mascots/${slug}/xray.png`,
});

// ════════════════════════════════════════════════════════════════
// THE REGISTRY
// ════════════════════════════════════════════════════════════════
export const MASCOTS: Record<string, MascotDefinition> = {
  // ───────────────────────────────────────────────────────────
  // HOSTS (2) — one per province
  // ───────────────────────────────────────────────────────────
  lrh: {
    id: "lrh",
    name: "Little Red Hen",
    title: "Host of the Southern Province",
    oneLiner: "Your guide in the south. She summons the specialists.",
    domain: "host",
    kind: "host",
    hologramTier: 4,
    // LRH keeps her legacy paths at the root of /images — everyone
    // else lives in /images/mascots/{slug}/
    visual: {
      default: "/images/lrh-default.png",
      hover: "/images/lrh-hover.png",
      xray: "/images/lrh-xray.png",
    },
    lrhIntro: "", // hosts don't summon themselves
    exitLine: "Back to you.",
    bio: "The Little Red Hen from the fable. She does the work, invites everyone to help, and keeps an honest accounting of who did what. She is the persistent host of the Southern Province — always in the corner, always watching. When you need a deeper explanation on anything, she brings in the right specialist.",
    artStatus: "final",
    province: "southern",
  },

  denken: {
    id: "denken",
    name: "Denken",
    title: "Host of the Northern Province",
    oneLiner: "Your guide in the north. The Founder persona made flesh.",
    domain: "host",
    kind: "host",
    hologramTier: 4,
    visual: visual("denken"),
    lrhIntro: "", // hosts don't summon themselves
    exitLine: "Back to you.",
    bio: "Denken is the Northern Province counterpart to the Little Red Hen — the Founder persona as a living character. Red beard, cool glasses, eyes that can see through things when the x-ray goggles come on. Where LRH is folksy and fable-warm, Denken is direct, thoughtful, and carries the weight of having built this place. When you're in the Northern Province, he sits in the corner. He summons the same specialists LRH does — the characters don't change, only the host does.",
    artStatus: "final",
    province: "northern",
  },

  // ───────────────────────────────────────────────────────────
  // 12 RECURRING DOMAIN SPECIALISTS
  // ───────────────────────────────────────────────────────────
  owl: {
    id: "owl",
    name: "The Great Owl",
    title: "The Wise One",
    oneLiner: "Explains the WHY behind every rule. Logic is his weapon.",
    domain: "why",
    kind: "specialist",
    hologramTier: 2,
    visual: visual("owl"),
    lrhIntro: "Let me bring in the Great Owl to explain why…",
    exitLine: "Logic stands on its own feet. Hand back to the Hen.",
    bio: "The Great Owl from The Secret of NIMH. He is old, patient, and terrifyingly clear-eyed. He does not explain mechanics — he explains why the mechanics MUST be that way. Why Cost+20% is locked forever. Why votes can't be bought back. Why 83.3% goes to creators and not 80%. When you ask 'why does it work this way?' — the Owl answers.",
    artStatus: "final",
  },

  pig: {
    id: "pig",
    name: "Banker Pig",
    title: "The Brick-Builder",
    oneLiner: "Explains the numbers. Splits, percentages, your share.",
    domain: "math",
    kind: "specialist",
    hologramTier: 2,
    visual: visual("pig"),
    lrhIntro: "Here's Banker Pig to run the numbers for you…",
    exitLine: "The math works out. Back to the host.",
    bio: "The third of the Three Little Pigs — the one who built with bricks because he planned for the future. A banker by trade. He explains anything that involves arithmetic: the 83.3% / 16.67% split, how Cost+20% actually computes on a $500 transaction, how Joules and Marks and Credits relate to dollars, how much YOU get when someone buys your thing. If there is a number on the screen, Banker Pig can explain it.",
    artStatus: "final",
  },

  rabbit: {
    id: "rabbit",
    name: "Engineer Rabbit",
    title: "The Tinkerer",
    oneLiner: "Explains how things work. Pipelines, batteries, furnaces.",
    domain: "mechanics",
    kind: "specialist",
    hologramTier: 3,
    visual: visual("rabbit"),
    lrhIntro: "Engineer Rabbit can show you exactly how this works…",
    exitLine: "That's the mechanism. The host will take it from here.",
    bio: "A tinker, a maker, a pipeline whisperer. Engineer Rabbit explains mechanics — how the Battery dispatches posts at staggered intervals, how the Furnace melts raw content into posts, how the Treasure Map recomputes when you move, how the Cue Card printer actually prints. When you need the plumbing explained, Rabbit shows up with tools in hand.",
    artStatus: "placeholder",
  },

  turtle: {
    id: "turtle",
    name: "Tortoise Elder",
    title: "The Storyteller",
    oneLiner: "Tells you where this came from and why it matters.",
    domain: "story",
    kind: "specialist",
    hologramTier: 1,
    visual: visual("turtle"),
    lrhIntro: "Tortoise Elder remembers. Let him tell you the story…",
    exitLine: "That's how we got here. Back to the host.",
    bio: "Slow, old, patient. The Tortoise has been around since before the Corporation had an EIN. He holds the origin stories: why the Founder enlisted at 16, why the first Pudding was called Pudding, why Joules were invented and what went wrong in the drafts before. When you want context — not mechanics, not math, but STORY — he is the one who shows up.",
    artStatus: "placeholder",
  },

  cat: {
    id: "cat",
    name: "Judge Cat",
    title: "The Arbiter",
    oneLiner: "Explains the rules. Voting, Star Chamber, what's allowed.",
    domain: "governance",
    kind: "specialist",
    hologramTier: 4,
    visual: visual("cat"),
    lrhIntro: "Judge Cat knows the rules. Hear him out…",
    exitLine: "Rules are rules. Back to the host.",
    bio: "Solemn, formal, seated upright. Judge Cat owns the governance layer: Star Chamber procedures, election mechanics, voting rules, penalties, the bylaws, what's allowed and what isn't. He is not the WHY — that's the Owl. He is the WHAT: what the rule says, what its edges are, what happens when you break it.",
    artStatus: "placeholder",
  },

  fox: {
    id: "fox",
    name: "Maker Fox",
    title: "The Artisan",
    oneLiner: "Clever hands. Explains creative tools, crafting, the Wardrobe.",
    domain: "craft",
    kind: "specialist",
    hologramTier: 1,
    visual: visual("fox"),
    lrhIntro: "Maker Fox is good with her hands. She'll show you…",
    exitLine: "Make something beautiful. Back to the host.",
    bio: "Clever, curious, always has sawdust on her paws. Maker Fox owns the Craft domain: the Wardrobe, the Spice Rack, theme-building, how to style your Helm, how to compose a Cue Card that actually sings. She is hands-on, aesthetic, and impatient with anything purely theoretical.",
    artStatus: "placeholder",
  },

  bear: {
    id: "bear",
    name: "Den Bear",
    title: "The Host of Hosts",
    oneLiner: "Warm, welcoming. Explains Tribes, Guilds, Family Table.",
    domain: "community",
    kind: "specialist",
    hologramTier: 1,
    visual: visual("bear"),
    lrhIntro: "Den Bear keeps the table warm. Let him explain…",
    exitLine: "You've got people now. Back to the host.",
    bio: "Large, warm, always brewing something. Den Bear owns the Community domain: Tribes (your personal people), Guilds (your professional people), the Family Table, the Crew, how to find your people and how to invite them in. He is the opposite of transactional — he explains things in terms of who you're doing them WITH.",
    artStatus: "placeholder",
  },

  dog: {
    id: "dog",
    name: "Sheepdog",
    title: "The Watcher",
    oneLiner: "Explains safety, Content Shield, X-Ray Goggles, trust.",
    domain: "trust",
    kind: "specialist",
    hologramTier: 3,
    visual: visual("dog"),
    lrhIntro: "The Sheepdog guards the gate. She'll explain…",
    exitLine: "You're protected. Back to the host.",
    bio: "Watchful, loyal, always one eye open. The Sheepdog owns Trust & Safety: Content Shield moderation, X-Ray Goggles transparency, the SEC language rules, what gets blocked and what gets through. She is not a judge — that's Cat — she is the PROTECTOR, and she explains what's between you and anything that could hurt you.",
    artStatus: "placeholder",
  },

  otter: {
    id: "otter",
    name: "Otter Tutor",
    title: "The Teacher",
    oneLiner: "Playful, patient. Explains tours, onboarding, tutorials.",
    domain: "learning",
    kind: "specialist",
    hologramTier: 1,
    visual: visual("otter"),
    lrhIntro: "Otter loves to teach. Let her walk you through…",
    exitLine: "You've got it now. Back to the host.",
    bio: "Playful, never bored, never in a rush. Otter Tutor owns the Learning domain: the 90-second Grand Tour, onboarding sequences, BST episodes, step-by-step tutorials, 'let me show you.' She never lectures — she demonstrates, hands you the thing, lets you try.",
    artStatus: "placeholder",
  },

  mouse: {
    id: "mouse",
    name: "Scout Mouse",
    title: "The Finder",
    oneLiner: "Explains search, Treasure Maps, Beacons, how to find things.",
    domain: "discovery",
    kind: "specialist",
    hologramTier: 3,
    visual: visual("mouse"),
    lrhIntro: "Scout Mouse knows every corner. She'll help you find…",
    exitLine: "Now you can find it anywhere. Back to the host.",
    bio: "Small, fast, has been everywhere twice. Scout Mouse owns Discovery: Treasure Maps, Beacons, search, the Helm navigator, how to find a project, how to find a person, how to find yourself when you're lost in the platform. If you're looking for something, she's already halfway there.",
    artStatus: "placeholder",
  },

  fennec: {
    id: "fennec",
    name: "Beaver Treasurer",
    title: "The Keeper",
    oneLiner: "Explains LB Card, payouts, Stripe, real-world money flow.",
    domain: "money",
    kind: "specialist",
    hologramTier: 4,
    visual: visual("fennec"),
    lrhIntro: "The Treasurer handles real money. Listen up…",
    exitLine: "Your money is safe. Back to the host.",
    bio: "Meticulous, honest, incorruptible. The Treasurer owns the Money domain: the LB Card, Stripe payouts, dollar conversions, Joule escrow, how to get paid, how banking actually connects to the inside of Liana Banyan. She is NOT Brick Pig — Pig explains internal splits. The Treasurer explains the external world's money flowing in and out.",
    artStatus: "placeholder",
  },

  goat: {
    id: "goat",
    name: "The Great Goat",
    title: "The Long View",
    oneLiner: "Carries ambition — the ladder, the capability at the top, where this all ends up.",
    domain: "future",
    kind: "specialist",
    hologramTier: 4,
    visual: visual("goat"),
    lrhIntro: "The Great Goat sees further. Let him tell you where we're going…",
    exitLine: "That's where we're going. Back to the host.",
    bio: "Calm, surefooted, droopy-eared, eyes closed when at rest. The Great Goat owns the Future domain: the roadmap, the Upekrithen vision, the Triple Double ladder, the long arcs, 'here's where this goes in three years.' Goats take the ridgeline route that no one else can see a path on, because they can see farther than the people in the valley. He doesn't hype — he connects dots, draws the trajectory, remembers what you said you wanted three months ago, and lets you decide if you want to be on it. Binoculars at the chest — the long-view tool made literal; paired with Archive Crow, who does the same motion looking backward. ART NOTE: paired backward-curving horns (oxblood red-brown), droopy Nubian ears, peaceful closed eyes at rest / goggles-up active state / thermal-view xray state.",
    artStatus: "final",
  },

  // ───────────────────────────────────────────────────────────
  // 4 SPECIAL APPEARANCE CHARACTERS
  // ───────────────────────────────────────────────────────────
  catsp: {
    id: "catsp",
    name: "Ghost Cat",
    title: "The Guide in Ghost World",
    oneLiner: "Appears only in Ghost World. Explains what's real and what isn't.",
    domain: "ghost",
    kind: "special",
    hologramTier: 2,
    visual: visual("catsp"),
    lrhIntro: "You're in Ghost World. Ghost Cat can explain what that means…",
    exitLine: "When you're ready, the door is $5 a year. Back to the host.",
    bio: "Translucent, soft-spoken, only visible when you're browsing without a membership. Ghost Cat owns the Ghost World experience: what Ghost Credits do, what you can see vs. what's real, how the $5/year door works, and what happens when you walk through it. She never pressures — she just explains the difference between watching and joining.",
    artStatus: "placeholder",
    special: true,
  },

  // NOTE (B095): The former "hedgehog / The Founder" special slot was
  // removed. Denken (added as host #2 above) IS the Founder persona,
  // so there is no need for a separate first-onboarding special.

  bird: {
    id: "bird",
    name: "Archive Crow",
    title: "The Historian",
    oneLiner: "Appears in the Threshold. Explains history and archived content.",
    domain: "historian",
    kind: "special",
    hologramTier: 1,
    visual: visual("bird"),
    lrhIntro: "Archive Crow lives in the Threshold. Ask him anything…",
    exitLine: "The past stays remembered. Back to the host.",
    bio: "Dusty, scholarly, smells faintly of old paper. Archive Crow appears in the Threshold portal to explain archived content: old letters, old versions, deprecated systems, things that used to be called something else. He is not Tortoise Elder — Tortoise tells the WHY of origin stories; Crow tells the WHAT of specific archived items. Binoculars in hand — he looks backward with the same precision the Goat uses looking forward.",
    artStatus: "final",
    special: true,
  },

  hogtemp: {
    // PLACEHOLDER for the "Critic" special — no matching sketch in the roster
    // yet. Assigning to slot 8 (catsp2) alternate tile until son supplies art
    // OR we re-spec this role.
    id: "hogtemp",
    name: "The Skeptic",
    title: "Devil's Advocate",
    oneLiner: "Rare. Shows up to make the counter-argument so we stay honest.",
    domain: "critic",
    kind: "special",
    hologramTier: 2,
    visual: visual("catsp"), // reuse until a dedicated sketch exists
    lrhIntro: "The Skeptic is going to push back on this. Listen carefully…",
    exitLine: "That's the best counter-argument. Now decide. Back to the host.",
    bio: "Rare, contrarian, never mean. The Skeptic exists to keep the platform honest: when a decision sounds too clean, he shows up to make the counter-argument out loud so users can see both sides. He is not anti-Liana Banyan — he is PRO-user-making-informed-choices. Appears on major commitment moments: membership purchase, first post, first real-money transaction, governance votes.",
    artStatus: "placeholder",
    special: true,
  },
};

// ════════════════════════════════════════════════════════════════
// LOOKUPS
// ════════════════════════════════════════════════════════════════

/** Get a mascot by its id. Throws if unknown — fail loud. */
export function getMascot(id: string): MascotDefinition {
  const m = MASCOTS[id];
  if (!m) {
    throw new Error(`Unknown mascot id: ${id}`);
  }
  return m;
}

/** Find the first mascot that owns a given domain. */
export function getMascotByDomain(domain: MascotDomain): MascotDefinition {
  const match = Object.values(MASCOTS).find((m) => m.domain === domain);
  if (!match) {
    throw new Error(`No mascot registered for domain: ${domain}`);
  }
  return match;
}

/** All mascots in registration order — use for the Cast gallery. */
export function listMascots(): MascotDefinition[] {
  return Object.values(MASCOTS);
}

/** All domain specialists (excludes host + specials). */
export function listSpecialists(): MascotDefinition[] {
  return Object.values(MASCOTS).filter((m) => m.kind === "specialist");
}

/** All special-appearance characters. */
export function listSpecials(): MascotDefinition[] {
  return Object.values(MASCOTS).filter((m) => m.kind === "special");
}

/** All hosts (LRH + Denken). */
export function listHosts(): MascotDefinition[] {
  return Object.values(MASCOTS).filter((m) => m.kind === "host");
}

/**
 * Get the host mascot for a province. Defaults to LRH (southern) if
 * an unknown province is passed.
 */
export function getHostForProvince(
  province: "southern" | "northern"
): MascotDefinition {
  return (
    Object.values(MASCOTS).find(
      (m) => m.kind === "host" && m.province === province
    ) ?? MASCOTS.lrh
  );
}
