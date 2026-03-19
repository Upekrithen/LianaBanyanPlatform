/**
 * NotCents Economy — Innovation #1752
 * "The NotCents Economy — Credits, Marks, and Joules."
 *
 * Triple meaning:
 * 1. "Not cents" — not fiat currency
 * 2. Sounds like "nonsense" — self-deprecating humor
 * 3. "Not sense" — challenges conventional economic wisdom
 *
 * Symbol: The Anvil (Ↄ‖) — Innovation #1426
 * Trademark: Filed with USPTO (draft saved, Intent to Use)
 */

export const NOTCENTS_BRAND = {
  name: 'NotCents',
  tagline: 'The NotCents Economy — Credits, Marks, and Joules.',
  footerLine: 'Powered by NotCents™',
  symbol: 'Ↄ‖',
  symbolName: 'The Anvil',
  innovationNumber: 1752,
  currencies: {
    credit: { name: 'Credit', color: 'amber', shape: 'circle', description: 'Purchased with fiat. $1 = 1 Credit.' },
    mark: { name: 'Mark', color: 'red', shape: 'square', description: 'Effort-debt currency. Earned from differential.' },
    joule: { name: 'Joule', color: 'blue', shape: 'triangle', description: 'Surplus storage. Forever stamp mechanic.' },
  },
  exchangeRate: '1 Credit = 1 Mark = 1 Joule',
  pricingFormula: 'Cost + 20%',
  markSubtypes: {
    earned: 'From differential only. Never granted as gifts.',
    backed: 'Joule-collateralized. Spendable only on project sponsorship.',
    founder: 'Giveaways. Cannot fund production.',
    pledged: 'Escrowed to specific project. Released on success, absorbed on failure.',
  },
} as const;

export type CurrencyKey = keyof typeof NOTCENTS_BRAND.currencies;
export type MarkSubtype = keyof typeof NOTCENTS_BRAND.markSubtypes;
