/**
 * INTEREST-TO-MOCK-DATA MAPPING
 * ==============================
 * Each Sweet Sixteen interest generates a category-appropriate
 * set of mock data fields for the Contingency Operators dialog.
 *
 * These are the numbers users see during a Wildfire Beacon Run
 * and can modify via the "What If?" button.
 *
 * All data explicitly labeled as demonstration/showcase.
 * No forward-looking statements. No financial projections.
 * SEC-safe: service demonstration tooling only.
 */

export interface MockField {
  key: string;
  label: string;
  value: number;
  defaultValue: number;
  unit: string;           // "$", "Credits", "Marks", "cities", "", etc.
  min: number;
  max: number;
  step: number;
  category: "storefront" | "saltMines" | "economics" | "coldStart" | "general";
  derivedFields?: string[]; // keys of fields that recalculate when this changes
}

export interface Derivation {
  key: string;
  label: string;
  unit: string;
  calculate: (fields: Record<string, number>) => number;
  category: "storefront" | "saltMines" | "economics" | "coldStart";
}

// ── Shared derivations used across multiple interests ──

export const COMMON_DERIVATIONS: Derivation[] = [
  {
    key: "monthlyRevenue",
    label: "Monthly Revenue",
    unit: "$",
    calculate: (f) =>
      (f.productPrice || f.unitPrice || 0) *
      (f.monthlyTransactions || f.monthlyUnits || 0),
    category: "economics",
  },
  {
    key: "annualRevenue",
    label: "Annual Revenue (est.)",
    unit: "$",
    calculate: (f) =>
      (f.productPrice || f.unitPrice || 0) *
      (f.monthlyTransactions || f.monthlyUnits || 0) *
      12,
    category: "economics",
  },
  {
    key: "creatorShare",
    label: "Creator Share (83.3%)",
    unit: "$",
    calculate: (f) => {
      const monthly =
        (f.productPrice || f.unitPrice || 0) *
        (f.monthlyTransactions || f.monthlyUnits || 0);
      return Math.round(monthly * 0.833 * 100) / 100;
    },
    category: "economics",
  },
  {
    key: "revenuePerCity",
    label: "Revenue per City",
    unit: "$",
    calculate: (f) => {
      const monthly =
        (f.productPrice || f.unitPrice || 0) *
        (f.monthlyTransactions || f.monthlyUnits || 0);
      return Math.round(monthly / Math.max(f.citiesActive || 1, 1));
    },
    category: "coldStart",
  },
];

// ── Interest-specific mock data templates ──

export const INTEREST_MOCK_MAP: Record<string, MockField[]> = {
  // ── Sweet Sixteen Interests ──

  "lets-make-bread": [
    { key: "productPrice", label: "Product Price", value: 35, defaultValue: 35, unit: "$", min: 5, max: 500, step: 5, category: "storefront" },
    { key: "productionLevel", label: "Production Level", value: 3, defaultValue: 3, unit: "", min: 1, max: 10, step: 1, category: "storefront" },
    { key: "citiesActive", label: "Cities Active", value: 1, defaultValue: 1, unit: "cities", min: 1, max: 50, step: 1, category: "coldStart" },
    { key: "monthlyTransactions", label: "Monthly Transactions", value: 47, defaultValue: 47, unit: "", min: 1, max: 10000, step: 10, category: "economics" },
    { key: "bountyReward", label: "Bounty Reward", value: 15, defaultValue: 15, unit: "Credits", min: 1, max: 100, step: 1, category: "saltMines" },
    { key: "memberCount", label: "Member Count", value: 120, defaultValue: 120, unit: "", min: 10, max: 100000, step: 50, category: "economics" },
  ],

  "hexisle-manufacturing": [
    { key: "unitPrice", label: "Unit Price", value: 42, defaultValue: 42, unit: "$", min: 10, max: 200, step: 1, category: "storefront" },
    { key: "productionNodes", label: "Production Nodes", value: 2, defaultValue: 2, unit: "nodes", min: 1, max: 20, step: 1, category: "storefront" },
    { key: "citiesActive", label: "Cities Active", value: 1, defaultValue: 1, unit: "cities", min: 1, max: 50, step: 1, category: "coldStart" },
    { key: "monthlyUnits", label: "Monthly Units", value: 85, defaultValue: 85, unit: "", min: 1, max: 50000, step: 25, category: "economics" },
    { key: "testPilots", label: "Active Test-Pilots", value: 8, defaultValue: 8, unit: "", min: 1, max: 500, step: 5, category: "general" },
    { key: "bountyReward", label: "Bounty Reward", value: 20, defaultValue: 20, unit: "Credits", min: 1, max: 100, step: 1, category: "saltMines" },
  ],

  "household-concierge": [
    { key: "productPrice", label: "Service Price", value: 25, defaultValue: 25, unit: "$", min: 5, max: 200, step: 5, category: "storefront" },
    { key: "householdsServed", label: "Households Served", value: 15, defaultValue: 15, unit: "", min: 1, max: 1000, step: 5, category: "general" },
    { key: "citiesActive", label: "Cities Active", value: 1, defaultValue: 1, unit: "cities", min: 1, max: 50, step: 1, category: "coldStart" },
    { key: "monthlyTransactions", label: "Monthly Bookings", value: 60, defaultValue: 60, unit: "", min: 1, max: 5000, step: 10, category: "economics" },
    { key: "bountyReward", label: "Task Reward", value: 10, defaultValue: 10, unit: "Marks", min: 1, max: 50, step: 1, category: "saltMines" },
    { key: "memberCount", label: "Active Members", value: 45, defaultValue: 45, unit: "", min: 5, max: 10000, step: 10, category: "economics" },
  ],

  "jukebox": [
    { key: "productPrice", label: "License Price", value: 15, defaultValue: 15, unit: "$", min: 1, max: 100, step: 1, category: "storefront" },
    { key: "artistsActive", label: "Active Artists", value: 25, defaultValue: 25, unit: "", min: 1, max: 5000, step: 10, category: "general" },
    { key: "citiesActive", label: "Cities Active", value: 3, defaultValue: 3, unit: "cities", min: 1, max: 50, step: 1, category: "coldStart" },
    { key: "monthlyTransactions", label: "Monthly Licenses", value: 200, defaultValue: 200, unit: "", min: 1, max: 50000, step: 50, category: "economics" },
    { key: "bountyReward", label: "Review Reward", value: 5, defaultValue: 5, unit: "Marks", min: 1, max: 25, step: 1, category: "saltMines" },
    { key: "memberCount", label: "Listeners", value: 500, defaultValue: 500, unit: "", min: 10, max: 100000, step: 100, category: "economics" },
  ],

  "didasko": [
    { key: "productPrice", label: "Course Price", value: 20, defaultValue: 20, unit: "$", min: 5, max: 200, step: 5, category: "storefront" },
    { key: "instructors", label: "Instructors", value: 8, defaultValue: 8, unit: "", min: 1, max: 500, step: 1, category: "general" },
    { key: "citiesActive", label: "Cities Active", value: 2, defaultValue: 2, unit: "cities", min: 1, max: 50, step: 1, category: "coldStart" },
    { key: "monthlyTransactions", label: "Monthly Enrollments", value: 75, defaultValue: 75, unit: "", min: 1, max: 10000, step: 10, category: "economics" },
    { key: "bountyReward", label: "Teaching Bounty", value: 25, defaultValue: 25, unit: "Marks", min: 1, max: 100, step: 5, category: "saltMines" },
    { key: "memberCount", label: "Students", value: 300, defaultValue: 300, unit: "", min: 10, max: 50000, step: 50, category: "economics" },
  ],

  "msa-medical": [
    { key: "productPrice", label: "Avg Service Cost", value: 50, defaultValue: 50, unit: "$", min: 10, max: 500, step: 10, category: "storefront" },
    { key: "providers", label: "Service Providers", value: 5, defaultValue: 5, unit: "", min: 1, max: 200, step: 1, category: "general" },
    { key: "citiesActive", label: "Cities Active", value: 1, defaultValue: 1, unit: "cities", min: 1, max: 50, step: 1, category: "coldStart" },
    { key: "monthlyTransactions", label: "Monthly Services", value: 30, defaultValue: 30, unit: "", min: 1, max: 5000, step: 5, category: "economics" },
    { key: "marksReserve", label: "Marks Reserve", value: 500, defaultValue: 500, unit: "Marks", min: 100, max: 50000, step: 100, category: "economics" },
    { key: "memberCount", label: "Enrolled Members", value: 80, defaultValue: 80, unit: "", min: 5, max: 50000, step: 25, category: "economics" },
  ],

  "salt-mines": [
    { key: "bountyReward", label: "Avg Bounty Value", value: 30, defaultValue: 30, unit: "Credits", min: 5, max: 500, step: 5, category: "saltMines" },
    { key: "activeBounties", label: "Active Bounties", value: 45, defaultValue: 45, unit: "", min: 1, max: 1000, step: 5, category: "saltMines" },
    { key: "completionRate", label: "Completion Rate (%)", value: 72, defaultValue: 72, unit: "%", min: 10, max: 100, step: 1, category: "saltMines" },
    { key: "citiesActive", label: "Cities Active", value: 3, defaultValue: 3, unit: "cities", min: 1, max: 50, step: 1, category: "coldStart" },
    { key: "monthlyTransactions", label: "Monthly Completions", value: 32, defaultValue: 32, unit: "", min: 1, max: 5000, step: 5, category: "economics" },
    { key: "memberCount", label: "Active Contributors", value: 60, defaultValue: 60, unit: "", min: 5, max: 50000, step: 10, category: "economics" },
  ],

  "vsl-loans": [
    { key: "productPrice", label: "Avg Voucher Value", value: 100, defaultValue: 100, unit: "$", min: 10, max: 1000, step: 10, category: "storefront" },
    { key: "citiesActive", label: "Cities Active", value: 1, defaultValue: 1, unit: "cities", min: 1, max: 50, step: 1, category: "coldStart" },
    { key: "monthlyTransactions", label: "Monthly Vouchers", value: 20, defaultValue: 20, unit: "", min: 1, max: 5000, step: 5, category: "economics" },
    { key: "repaymentRate", label: "Repayment Rate (%)", value: 94, defaultValue: 94, unit: "%", min: 50, max: 100, step: 1, category: "economics" },
    { key: "memberCount", label: "Borrowers", value: 35, defaultValue: 35, unit: "", min: 5, max: 10000, step: 10, category: "economics" },
  ],

  "family-table": [
    { key: "productPrice", label: "Family Plan Cost", value: 15, defaultValue: 15, unit: "$", min: 5, max: 100, step: 5, category: "storefront" },
    { key: "familiesActive", label: "Active Families", value: 20, defaultValue: 20, unit: "", min: 1, max: 5000, step: 5, category: "general" },
    { key: "citiesActive", label: "Cities Active", value: 1, defaultValue: 1, unit: "cities", min: 1, max: 50, step: 1, category: "coldStart" },
    { key: "monthlyTransactions", label: "Monthly Plans", value: 20, defaultValue: 20, unit: "", min: 1, max: 5000, step: 5, category: "economics" },
    { key: "memberCount", label: "Family Members", value: 80, defaultValue: 80, unit: "", min: 5, max: 50000, step: 10, category: "economics" },
  ],

  "seed-the-quan": [
    { key: "productPrice", label: "Seed Contribution", value: 50, defaultValue: 50, unit: "$", min: 5, max: 500, step: 5, category: "storefront" },
    { key: "citiesActive", label: "Cities Active", value: 2, defaultValue: 2, unit: "cities", min: 1, max: 50, step: 1, category: "coldStart" },
    { key: "monthlyTransactions", label: "Monthly Contributions", value: 40, defaultValue: 40, unit: "", min: 1, max: 10000, step: 10, category: "economics" },
    { key: "bountyReward", label: "Community Reward", value: 20, defaultValue: 20, unit: "Marks", min: 1, max: 100, step: 5, category: "saltMines" },
    { key: "memberCount", label: "Contributors", value: 100, defaultValue: 100, unit: "", min: 5, max: 50000, step: 25, category: "economics" },
  ],

  "power-to-the-people": [
    { key: "productPrice", label: "Campaign Cost", value: 10, defaultValue: 10, unit: "$", min: 1, max: 100, step: 1, category: "storefront" },
    { key: "citiesActive", label: "Cities Active", value: 5, defaultValue: 5, unit: "cities", min: 1, max: 50, step: 1, category: "coldStart" },
    { key: "monthlyTransactions", label: "Monthly Supporters", value: 150, defaultValue: 150, unit: "", min: 1, max: 50000, step: 25, category: "economics" },
    { key: "bountyReward", label: "Civic Bounty", value: 10, defaultValue: 10, unit: "Marks", min: 1, max: 50, step: 1, category: "saltMines" },
    { key: "memberCount", label: "Civic Members", value: 500, defaultValue: 500, unit: "", min: 10, max: 100000, step: 100, category: "economics" },
  ],

  "cold-start": [
    { key: "citiesActive", label: "Cities Launched", value: 1, defaultValue: 1, unit: "cities", min: 1, max: 50, step: 1, category: "coldStart" },
    { key: "populationPerCity", label: "Avg City Population", value: 50000, defaultValue: 50000, unit: "", min: 1000, max: 5000000, step: 10000, category: "coldStart" },
    { key: "penetrationRate", label: "Penetration Rate (%)", value: 2, defaultValue: 2, unit: "%", min: 0.1, max: 50, step: 0.5, category: "coldStart" },
    { key: "monthlyTransactions", label: "Monthly Transactions", value: 100, defaultValue: 100, unit: "", min: 1, max: 50000, step: 25, category: "economics" },
    { key: "memberCount", label: "Active Members", value: 200, defaultValue: 200, unit: "", min: 10, max: 100000, step: 50, category: "economics" },
  ],
};

// ── Fallback: default mock data for any interest not explicitly mapped ──

export const DEFAULT_MOCK_FIELDS: MockField[] = [
  { key: "productPrice", label: "Service Price", value: 25, defaultValue: 25, unit: "$", min: 5, max: 500, step: 5, category: "storefront" },
  { key: "citiesActive", label: "Cities Active", value: 1, defaultValue: 1, unit: "cities", min: 1, max: 50, step: 1, category: "coldStart" },
  { key: "monthlyTransactions", label: "Monthly Activity", value: 50, defaultValue: 50, unit: "", min: 1, max: 10000, step: 10, category: "economics" },
  { key: "bountyReward", label: "Bounty Reward", value: 15, defaultValue: 15, unit: "Credits", min: 1, max: 100, step: 1, category: "saltMines" },
  { key: "memberCount", label: "Active Members", value: 100, defaultValue: 100, unit: "", min: 10, max: 100000, step: 50, category: "economics" },
];

/**
 * Get mock data fields for an interest.
 * Falls back to DEFAULT_MOCK_FIELDS for unmapped interests.
 */
export function getMockFieldsForInterest(interestKey: string): MockField[] {
  return INTEREST_MOCK_MAP[interestKey] || DEFAULT_MOCK_FIELDS;
}

/**
 * Get all derivations (common + any interest-specific ones).
 */
export function getDerivationsForInterest(_interestKey: string): Derivation[] {
  // For now, all interests use the common derivations.
  // Interest-specific derivations can be added later.
  return COMMON_DERIVATIONS;
}

/**
 * Category display names and icons for the CO dialog.
 */
export const CATEGORY_META: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  storefront: { label: "Storefront", icon: "🏪", color: "text-blue-600" },
  saltMines: { label: "Salt Mines (Bounties)", icon: "⛏️", color: "text-amber-600" },
  economics: { label: "Economics", icon: "📊", color: "text-emerald-600" },
  coldStart: { label: "Cold Start (Cities)", icon: "🏙️", color: "text-purple-600" },
  general: { label: "General", icon: "⚙️", color: "text-slate-600" },
};
