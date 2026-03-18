/**
 * PLATFORM BLUEPRINT — Canonical Principles & History
 * ====================================================
 * The foundational truths of Liana Banyan Corporation.
 * Referenced by about pages, blueprints, deck cards, and onboarding flows.
 *
 * "What successful people do to be successful is often what
 *  unsuccessful people are unwilling to do."
 */

// ─── FOUNDER ─────────────────────────────────────────────────────────────────

export const FOUNDER = {
  name: "Jonathan Jones",
  militaryService: "U.S. Army National Guard veteran (Infantry 11B, Aviation 15A)",
  family: "Father of eight (four grown and on their own, four still at home)",
  creativeDirAlias: "James Ausbin", // Founder's son Caleb — NEVER publish "Caleb"
} as const;

// ─── TIMELINE ────────────────────────────────────────────────────────────────
// The platform's lineage goes back over two decades.

export const TIMELINE = [
  { year: 2003, event: "First concepts — nights and weekends while serving" },
  { year: 2017, event: "Patent research begins in earnest" },
  { year: 2020, event: "First provisional patent filed" },
  { year: 2023, event: "8 utility patents filed; Hexel mechanical taxonomy defined" },
  { year: 2024, event: "Platform architecture begins; AI team formed (Rook, Knight, Bishop, Pawn)" },
  { year: 2025, event: "1,709 innovations cataloged; 1,336 patent claims across 7 provisional applications" },
  { year: 2026, event: "Public launch — 16 initiatives, 14 domains, full multi-portal architecture" },
] as const;

// ─── THE SACRIFICE PRINCIPLE ─────────────────────────────────────────────────
//
// This is documented because people need to see it in the blueprints.
// Building something this large requires years of late nights, early mornings,
// holidays at the keyboard, and a willingness to do what most people won't.
//
// The Founder has worked nights, weekends, and holidays since 2003 —
// through military service, through raising eight children, through everything.
// That is over two decades of sustained effort, not a sprint.
//
// "The secret to success is sacrifice — but wisely done. What successful
//  people do to be successful is often what unsuccessful people are
//  unwilling to do. Like work on holidays for their dream."
//  — Jonathan Jones, Founder

export const SACRIFICE_PRINCIPLE = {
  quote: "The secret to success is sacrifice — but wisely done. What successful people do to be successful is often what unsuccessful people are unwilling to do. Like work on holidays for their dream.",
  author: "Jonathan Jones",
  yearsOfWork: new Date().getFullYear() - 2003,
  startYear: 2003,
  context: [
    "Late nights and early mornings, every day, for over two decades",
    "Holidays at the keyboard — not because it's fun, but because it matters",
    "Through military service (Infantry 11B, Aviation 15A)",
    "Through raising eight children — four grown, four still at home",
    "Through building 8 utility patents worth between $9M and $80M",
    "$525,000 of personal investment over 9 years into patent portfolio",
    "1,709 innovations cataloged and documented",
    "1,336 patent claims across 7 provisional applications",
    "The platform exists because someone was willing to do what others wouldn't",
  ],
} as const;

// ─── PLATFORM PRINCIPLES ─────────────────────────────────────────────────────

export const PRINCIPLES = {
  buildForTheLongHaul: "I ALWAYS BUILD FOR THE LONG HAUL. No shortcuts, bandaids or wire twists.",
  noAtomo: "No Atomo. Superman!",  // period then exclamation — NOT colon
  asYouWish: "As You Wish",         // universal transaction confirmation phrase
  costPlus20: "Cost + 20% — locked forever. Sellers set prices. Market discovery.",
  creatorShare: "Creators keep 83.3%",
  membershipCost: "$5/year",
  microEntityPatent: "$65 per filing (micro-entity)",
  currencyEquality: "1 Credit = 1 Mark = 1 Joule (different acquisition, same value)",
  marksFromDifferential: "Marks emerge from differential ONLY — never granted as gifts",
} as const;

// ─── INNOVATION STATS ────────────────────────────────────────────────────────

export const INNOVATION_STATS = {
  canonicalCount: 1709,         // As of Session 17, March 14 2026 (delegation, XP, trickle, STAMP)
  patentClaims: 1336,           // Across 7 provisional applications (7th: 64/006,010, March 15 2026)
  utilityPatents: 8,
  patentPortfolioValue: { low: 9_000_000, high: 80_000_000 },
  personalInvestment: 525_000,  // Over 9 years
  investmentYears: 9,
  initiatives: 16,              // The Sweet Sixteen
  domains: 14,                  // Major innovation domains
  portals: 6,                   // marketplace, business, nonprofit, network, dss, hexisle
} as const;
