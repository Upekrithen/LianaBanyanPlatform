/**
 * WELCOME GATE CONTENT — Durin's Door Switchable
 * ================================================
 * The Welcome Gate is a full-screen overlay shown to first-time visitors
 * on ANY page. Content is switchable via Durin's Door passwords, so the
 * Founder can change what every new visitor sees without code changes.
 *
 * Default: "Help Each Other Help Ourselves" philosophy.
 * Switch by entering a Durin's Door password → sets localStorage key
 * that the WelcomeGate reads to select content variant.
 *
 * Content is universally integrateable — promotional, not internal.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type WelcomeLayout = "standard" | "bluf";

export interface WelcomeVariant {
  id: string;
  /** Durin's Door password that activates this variant (founder-only) */
  activationPassword: string;
  /** Layout mode: "standard" = headline+highlights+CTA, "bluf" = triage fork with branching buttons */
  layout: WelcomeLayout;
  /** Hero headline — two parts for the split display */
  headline: { top: string; bottom: string };
  /** Subtitle under the headline */
  subtitle: string;
  /** 3-4 key points shown as cards (standard layout) */
  highlights: WelcomeHighlight[];
  /** Branching triage buttons (bluf layout only) */
  branches?: WelcomeBranch[];
  /** The call-to-action button text (standard layout) */
  ctaText: string;
  /** Footer tagline */
  tagline: string;
}

export interface WelcomeHighlight {
  icon: string; // emoji
  title: string;
  description: string;
}

/** BLUF branch — one of 2-3 triage options shown as big clickable cards */
export interface WelcomeBranch {
  id: string;
  icon: string; // emoji
  title: string;
  subtitle: string;
  route: string; // where this branch takes the user
  color: string; // tailwind gradient classes
}

// ─── Storage Keys ───────────────────────────────────────────────────────────

/** Which content variant is currently active */
export const WELCOME_VARIANT_KEY = "lb_welcome_variant";
/** Whether the user has permanently dismissed the gate */
export const WELCOME_DISMISSED_KEY = "lb_welcome_gate_dismissed";
/** Session-level flag so gate only shows once per session */
export const WELCOME_SESSION_KEY = "lb_welcome_gate_seen_session";
/** Visit counter for PWA prompt timing */
export const VISIT_COUNT_KEY = "lb_visit_count";

// ─── Content Variants ──────────────────────────────────────────────────────

export const WELCOME_VARIANTS: WelcomeVariant[] = [
  {
    id: "help-each-other",
    activationPassword: "HELP EACH OTHER",
    layout: "standard",
    headline: { top: "Help Each Other", bottom: "Help Ourselves" },
    subtitle: "A platform built on the idea that your success helps my success. My contribution enables yours.",
    highlights: [
      {
        icon: "🤝",
        title: "Mutual Aid, Not Charity",
        description: "Every initiative creates mutual benefit. Your participation strengthens the whole network. 83.3% of every transaction goes to the creator.",
      },
      {
        icon: "🔍",
        title: "Transparent Pricing",
        description: "Cost + 20%. That's it. No hidden margins, no exploitation. Everyone knows the real price. Trust is the foundation.",
      },
      {
        icon: "🚪",
        title: "Access Over Exclusion",
        description: "Ghost mode lets anyone explore for free. 20% of cold start slots are donated. The ladder, not the gate.",
      },
      {
        icon: "⚡",
        title: "Earned Over Given",
        description: "The most valuable things require effort. Marks emerge from participation. Commitment unlocks trust. No shortcuts.",
      },
    ],
    ctaText: "Enter",
    tagline: "One hand builds. One hand gives. Both are needed.",
  },
  {
    id: "hexisle-launch",
    activationPassword: "HEXISLE LAUNCH",
    layout: "standard",
    headline: { top: "HexIsle", bottom: "The Universal Hex Platform" },
    subtitle: "Decades of designs. Now releasing FREE STL files for every hex gamer. Water-powered. Physics-driven. Compatible with everything.",
    highlights: [
      {
        icon: "🔧",
        title: "Free STL Files",
        description: "Download and print Hexel parts for personal use. New releases every two weeks. Start building now.",
      },
      {
        icon: "🏭",
        title: "Decentralized Manufacturing",
        description: "Local industry, not centralized factories. Cost+20% pricing. Creator keeps 83.3%. Manufacturing at community Nodes.",
      },
      {
        icon: "🎮",
        title: "Universal Compatibility",
        description: "Works with BattleTech, Open WarHex, Green Stuff World, and every major hex terrain system. One platform for all.",
      },
      {
        icon: "🤝",
        title: "Open Collaboration",
        description: "We invite competitors in. We share our IP. Design contests with official licensing. This is a group project.",
      },
    ],
    ctaText: "Explore HexIsle",
    tagline: "Built for decades. Released for everyone.",
  },
  {
    id: "defense-klaus",
    activationPassword: "SHIELD WALL",
    layout: "standard",
    headline: { top: "Defense Klaus", bottom: "Legal Protection for All" },
    subtitle: "A $6 bracelet that funds real legal defense for members. Help each other stay protected.",
    highlights: [
      {
        icon: "🛡️",
        title: "$6 Bracelet, 100% to the Fund",
        description: "Every dollar goes to legal defense. No overhead siphoned. Pure mutual protection.",
      },
      {
        icon: "🎁",
        title: "2 Gift Passes Per Signup",
        description: "Share protection with people you care about. Each new member gets two passes to give away.",
      },
      {
        icon: "⚖️",
        title: "Attorneys Welcome",
        description: "Competitive rates, meaningful work. Join the network and help members who need you.",
      },
      {
        icon: "💚",
        title: "20% Free Slots",
        description: "One in five cold start slots is donated. Nobody turned away for lack of funds.",
      },
    ],
    ctaText: "Learn More",
    tagline: "Protection shouldn't be a luxury.",
  },
  {
    id: "bluf",
    activationPassword: "BOTTOM LINE",
    layout: "bluf",
    headline: { top: "What do you need", bottom: "today?" },
    subtitle: "Skip the tour. Pick a door. Go.",
    highlights: [], // BLUF uses branches, not highlights
    branches: [
      {
        id: "earn",
        icon: "💰",
        title: "I Need to Earn Money",
        subtitle: "Real work. Fair pay. You keep 83.3%. Start today.",
        route: "/help-wanted",
        color: "from-emerald-600/20 to-green-600/10 border-emerald-500/30 hover:border-emerald-400/60",
      },
      {
        id: "build",
        icon: "🚀",
        title: "I Want to Build Something",
        subtitle: "$5/year. Same terms as the Founder. Launch your idea.",
        route: "/build-a-business",
        color: "from-violet-600/20 to-purple-600/10 border-violet-500/30 hover:border-violet-400/60",
      },
      {
        id: "learn",
        icon: "📖",
        title: "I Want to Learn & Earn",
        subtitle: "Read papers. Take quizzes. Earn Marks and Golden Keys. Three reading levels.",
        route: "/papers",
        color: "from-amber-600/20 to-yellow-600/10 border-amber-500/30 hover:border-amber-400/60",
      },
      {
        id: "explore",
        icon: "👻",
        title: "Let Me Look Around First",
        subtitle: "No signup. No pressure. Explore everything as a Ghost.",
        route: "",
        color: "from-white/5 to-white/[0.02] border-white/20 hover:border-white/40",
      },
    ],
    ctaText: "", // Not used in BLUF — branches have their own routes
    tagline: "Milk and eggs. Not the back of the store.",
  },
];

// ─── Helper Functions ──────────────────────────────────────────────────────

/** Get the currently active welcome variant */
export function getActiveVariant(): WelcomeVariant {
  const variantId = localStorage.getItem(WELCOME_VARIANT_KEY);
  if (variantId) {
    const found = WELCOME_VARIANTS.find((v) => v.id === variantId);
    if (found) return found;
  }
  return WELCOME_VARIANTS[0]; // Default: Help Each Other
}

/** Check if a Durin's Door password matches a welcome variant */
export function tryWelcomeVariantPassword(input: string): WelcomeVariant | null {
  const normalized = input.trim().toUpperCase();
  return WELCOME_VARIANTS.find((v) => v.activationPassword === normalized) || null;
}

/** Activate a welcome variant by ID */
export function setActiveVariant(variantId: string): void {
  localStorage.setItem(WELCOME_VARIANT_KEY, variantId);
}

/** Check whether the welcome gate should be shown */
export function shouldShowWelcomeGate(): boolean {
  // Permanently dismissed?
  if (localStorage.getItem(WELCOME_DISMISSED_KEY) === "true") return false;
  // Already seen this session?
  if (sessionStorage.getItem(WELCOME_SESSION_KEY) === "true") return false;
  return true;
}

/** Dismiss the welcome gate for this session (or permanently) */
export function dismissWelcomeGate(permanent: boolean): void {
  if (permanent) {
    localStorage.setItem(WELCOME_DISMISSED_KEY, "true");
  }
  sessionStorage.setItem(WELCOME_SESSION_KEY, "true");
}

/** Increment and return visit count */
export function incrementVisitCount(): number {
  const current = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || "0", 10);
  const next = current + 1;
  localStorage.setItem(VISIT_COUNT_KEY, next.toString());
  return next;
}

/** Get current visit count without incrementing */
export function getVisitCount(): number {
  return parseInt(localStorage.getItem(VISIT_COUNT_KEY) || "0", 10);
}
