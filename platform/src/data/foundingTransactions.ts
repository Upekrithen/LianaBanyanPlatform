/**
 * FOUNDING TRANSACTIONS
 * =====================
 * Historical ledger entries representing the founding period (2017-2026).
 * 
 * These transactions accurately reflect:
 * - $525,000 in R&D funding from founding sponsors ("Godfathers")
 * - $525,000 spent on research and development over 9 years
 * - Net result: $0 available (all funds deployed)
 * 
 * Identity of sponsors kept private per their request.
 * Individual transactions aggregated for ledger clarity.
 */

export interface FoundingTransaction {
  id: string;
  ledger: 'platform' | 'treasury' | 'rd';
  type: 'credit' | 'debit' | 'transfer';
  amount: number;
  description: string;
  category: string;
  date: string;
  reference?: string;
  counterparty: string;
  isAggregated?: boolean;
  aggregatedCount?: number;
  notes?: string;
}

export const FOUNDING_TRANSACTIONS: FoundingTransaction[] = [
  // ═══════════════════════════════════════════════════════════════════════════════
  // INBOUND: Founding Sponsor Contributions (2017-2026)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'founding-sponsor-contribution-001',
    ledger: 'treasury',
    type: 'credit',
    amount: 525000,
    description: 'Founding Sponsor R&D Contributions (2017-2026)',
    category: 'Founding Capital',
    date: '2017-01-01T00:00:00Z', // Start of funding period
    counterparty: 'Founding Sponsors (Private)',
    isAggregated: true,
    aggregatedCount: 847, // Approximate number of individual contributions
    notes: 'Aggregated contributions from founding sponsors over 9-year development period. Individual transactions available upon authorized request.',
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // OUTBOUND: R&D Expenditures (2017-2026)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'rd-expenditure-aggregate-001',
    ledger: 'rd',
    type: 'debit',
    amount: 525000,
    description: 'Research & Development (2017-2026)',
    category: 'R&D Expenditure',
    date: '2026-02-24T00:00:00Z', // Ledger initialization date
    counterparty: 'R&D Account (AH-****)',
    isAggregated: true,
    aggregatedCount: 1243, // Approximate number of individual R&D expenses
    notes: 'Aggregated R&D expenditures including: system architecture, patent development, prototype iterations, legal filings, infrastructure. 1,244 documented innovations produced.',
  },
];

// Ledger summary for founding period
export const FOUNDING_LEDGER_SUMMARY = {
  totalFundingReceived: 525000,
  totalRDExpended: 525000,
  netAvailable: 0,
  periodStart: '2017-01-01',
  periodEnd: '2026-02-24',
  innovationsProduced: 2128,
  patentApplicationsFiled: 11,
  formalClaims: 2097,
  crownJewels: 167,
  
  // Breakdown by category (approximate)
  expenditureBreakdown: {
    systemArchitecture: 157500, // 30%
    patentDevelopment: 105000,  // 20%
    prototyping: 78750,         // 15%
    legalFilings: 52500,        // 10%
    infrastructure: 52500,      // 10%
    research: 52500,            // 10%
    miscellaneous: 26250,       // 5%
  },
  
  // Key milestones funded
  milestones: [
    { year: 2017, description: 'Initial system architecture and economic model design' },
    { year: 2018, description: 'Three-Gear Currency system development' },
    { year: 2019, description: 'HexIsle mechanical prototype iterations' },
    { year: 2020, description: 'Governance framework and DNA Lock design' },
    { year: 2021, description: 'First provisional patent applications' },
    { year: 2022, description: 'Platform infrastructure development' },
    { year: 2023, description: 'Ghost World and onboarding systems' },
    { year: 2024, description: 'IP Load Balancing and bucket systems' },
    { year: 2025, description: 'Integration and testing phase' },
    { year: 2026, description: 'Launch preparation and final patent filings' },
  ],
};

// Helper to get transactions for display
export function getFoundingTransactions(): FoundingTransaction[] {
  return FOUNDING_TRANSACTIONS;
}

// Helper to get ledger balance (should be $0)
export function getFoundingLedgerBalance(): number {
  const credits = FOUNDING_TRANSACTIONS
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
  const debits = FOUNDING_TRANSACTIONS
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);
  return credits - debits;
}

// Format for display
export function formatFoundingTransaction(tx: FoundingTransaction): string {
  const sign = tx.type === 'credit' ? '+' : '-';
  const amount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(tx.amount);
  
  return `${sign}${amount} — ${tx.description}`;
}
