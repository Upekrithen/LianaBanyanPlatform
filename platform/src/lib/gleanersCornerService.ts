/**
 * Gleaner's Corner — Revenue Split Service
 * ==========================================
 * "The edges of every field, left for those who need them."
 *
 * Every transaction in the Liana Banyan ecosystem automatically splits:
 *   83.3% Creator  — the maker keeps the lion's share
 *   13.3% Platform — operations, infrastructure
 *    3.3% Gleaner's Corner — food, medical, essentials
 *
 * Biblical reference: Ruth gleaning in Boaz's fields (Ruth 2:15-16).
 * Not charity — structural. Nobody falls through.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface SplitBreakdown {
  creator: number;
  platform: number;
  gleaners: number;
  total: number;
}

export interface GleanerDistribution {
  id: string;
  date: string;
  recipientCount: number;
  totalMarks: number;
  category: DistributionCategory;
  description: string;
}

export type DistributionCategory = "food" | "medical" | "emergency";

export interface GleanerFundSummary {
  totalCollected: number;
  totalDistributed: number;
  reserveBalance: number;
  familiesSupported: number;
  mealsFunded: number;
  medicalCovered: number;
}

export interface CategoryBreakdown {
  category: DistributionCategory;
  label: string;
  percentage: number;
  color: string;
}

export interface PresetTransaction {
  label: string;
  price: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** The three-way split percentages */
export const SPLIT = {
  CREATOR: 0.833,
  PLATFORM: 0.133,
  GLEANERS: 0.033,
} as const;

/** Display percentages (human-readable) */
export const SPLIT_DISPLAY = {
  CREATOR: "83.3%",
  PLATFORM: "13.3%",
  GLEANERS: "3.3%",
} as const;

/** Category breakdown of Gleaner's fund distribution */
export const CATEGORY_BREAKDOWN: CategoryBreakdown[] = [
  { category: "food", label: "Food Assistance", percentage: 62, color: "#f59e0b" },
  { category: "medical", label: "Medical Savings", percentage: 24, color: "#3b82f6" },
  { category: "emergency", label: "Emergency Support", percentage: 14, color: "#ef4444" },
];

/** Quick calculator presets */
export const PRESETS: PresetTransaction[] = [
  { label: "$5 Digital Download", price: 5 },
  { label: "$10 Sourdough Starter", price: 10 },
  { label: "$25 Business Cards", price: 25 },
  { label: "$100 Custom Table", price: 100 },
];

// ============================================================================
// CALCULATOR
// ============================================================================

/**
 * Calculate the three-way split for any transaction amount.
 * Returns exact amounts for Creator, Platform, and Gleaner's Corner.
 */
export function calculateSplit(price: number): SplitBreakdown {
  const creator = Math.round(price * SPLIT.CREATOR * 100) / 100;
  const platform = Math.round(price * SPLIT.PLATFORM * 100) / 100;
  const gleaners = Math.round(price * SPLIT.GLEANERS * 100) / 100;
  return { creator, platform, gleaners, total: price };
}

/**
 * Scale projection: given monthly volume, what does Gleaner's Corner collect?
 */
export function monthlyGleanerProjection(monthlyVolume: number): number {
  return Math.round(monthlyVolume * SPLIT.GLEANERS);
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

export const SAMPLE_FUND_SUMMARY: GleanerFundSummary = {
  totalCollected: 4230,
  totalDistributed: 3890,
  reserveBalance: 340,
  familiesSupported: 12,
  mealsFunded: 340,
  medicalCovered: 8,
};

export const SAMPLE_DISTRIBUTIONS: GleanerDistribution[] = [
  {
    id: "gd-001",
    date: "2026-03-15",
    recipientCount: 3,
    totalMarks: 450,
    category: "food",
    description: "Monthly grocery allocation — 3 households",
  },
  {
    id: "gd-002",
    date: "2026-03-12",
    recipientCount: 1,
    totalMarks: 280,
    category: "medical",
    description: "Dental appointment coverage",
  },
  {
    id: "gd-003",
    date: "2026-03-10",
    recipientCount: 2,
    totalMarks: 320,
    category: "food",
    description: "Weekly essentials — 2 families",
  },
  {
    id: "gd-004",
    date: "2026-03-08",
    recipientCount: 1,
    totalMarks: 175,
    category: "emergency",
    description: "Emergency utility assistance",
  },
  {
    id: "gd-005",
    date: "2026-03-05",
    recipientCount: 4,
    totalMarks: 520,
    category: "food",
    description: "Bi-weekly food allocation — 4 households",
  },
  {
    id: "gd-006",
    date: "2026-03-02",
    recipientCount: 1,
    totalMarks: 390,
    category: "medical",
    description: "Prescription coverage — chronic condition",
  },
  {
    id: "gd-007",
    date: "2026-02-28",
    recipientCount: 2,
    totalMarks: 410,
    category: "food",
    description: "Monthly grocery allocation — 2 households",
  },
  {
    id: "gd-008",
    date: "2026-02-25",
    recipientCount: 1,
    totalMarks: 150,
    category: "emergency",
    description: "Urgent transportation need",
  },
  {
    id: "gd-009",
    date: "2026-02-22",
    recipientCount: 3,
    totalMarks: 485,
    category: "food",
    description: "Weekly essentials — 3 families",
  },
  {
    id: "gd-010",
    date: "2026-02-18",
    recipientCount: 1,
    totalMarks: 710,
    category: "medical",
    description: "Specialist visit and follow-up care",
  },
];
