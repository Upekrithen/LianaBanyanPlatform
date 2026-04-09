// ── Card Issuer Abstraction Layer ──────────────────────────────────
// Provider-agnostic interface for card issuance operations.
// Implementations: Stripe (existing), Lithic (new), Unit (future).
// Factory function reads provider from env or accepts explicit arg.

export interface CardholderInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  billing: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
}

export interface CardholderResult {
  providerCardholderId: string;
  status: string;
  metadata: Record<string, unknown>;
}

export interface VirtualCardInput {
  providerCardholderId: string;
  currency?: string;
  memo?: string;
  spendLimitCents?: number;
  spendLimitDuration?: "ANNUALLY" | "FOREVER" | "MONTHLY" | "TRANSACTION";
}

export interface PhysicalCardInput extends VirtualCardInput {
  shippingAddress: {
    firstName: string;
    lastName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shippingMethod?: "STANDARD" | "EXPEDITED" | "2_DAY";
}

export interface CardResult {
  providerCardId: string;
  lastFour: string;
  expMonth: number;
  expYear: number;
  status: string;
  type: "virtual" | "physical";
  metadata: Record<string, unknown>;
}

export interface CardDetailsResult {
  number: string;
  cvc: string;
  expMonth: number;
  expYear: number;
}

export interface FundCardInput {
  providerCardholderId: string;
  amountCents: number;
  description: string;
  idempotencyKey: string;
}

export interface FundCardResult {
  providerTransferId: string;
  status: string;
  metadata: Record<string, unknown>;
}

export interface TransactionRecord {
  providerTransactionId: string;
  amountCents: number;
  merchantName: string | null;
  merchantCategory: string | null;
  status: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

// ── Card Issuer Interface ──────────────────────────────────────────

export interface CardIssuer {
  readonly provider: "stripe" | "lithic" | "unit";

  createCardholder(input: CardholderInput): Promise<CardholderResult>;
  issueVirtualCard(input: VirtualCardInput): Promise<CardResult>;
  issuePhysicalCard(input: PhysicalCardInput): Promise<CardResult>;
  fundCard(input: FundCardInput): Promise<FundCardResult>;
  getCardDetails(providerCardId: string): Promise<CardDetailsResult>;
  freezeCard(providerCardId: string): Promise<{ providerCardId: string; newStatus: string }>;
  unfreezeCard(providerCardId: string): Promise<{ providerCardId: string; newStatus: string }>;
  cancelCard(providerCardId: string): Promise<{ providerCardId: string; newStatus: string }>;
  getTransactions(providerCardId: string, limit?: number): Promise<TransactionRecord[]>;
}

// ── Factory ────────────────────────────────────────────────────────

let _issuerCache: Map<string, CardIssuer> = new Map();

export async function getCardIssuer(provider?: string): Promise<CardIssuer> {
  const p = (provider ?? Deno.env.get("LB_CARD_PROVIDER") ?? "stripe").toLowerCase();

  if (_issuerCache.has(p)) return _issuerCache.get(p)!;

  let issuer: CardIssuer;

  switch (p) {
    case "lithic": {
      const { LithicCardIssuer } = await import("./lithicCardIssuer.ts");
      issuer = new LithicCardIssuer();
      break;
    }
    case "stripe": {
      const { StripeCardIssuer } = await import("./stripeCardIssuer.ts");
      issuer = new StripeCardIssuer();
      break;
    }
    case "unit":
      throw new Error("Unit provider not yet implemented. Use 'stripe' or 'lithic'.");
    default:
      throw new Error(`Unknown card provider: '${p}'. Supported: stripe, lithic.`);
  }

  _issuerCache.set(p, issuer);
  return issuer;
}

// ── Helper: resolve provider from feature flags ────────────────────

export async function resolveProvider(
  supabaseAdmin: { from: (t: string) => any },
): Promise<string> {
  const { data } = await supabaseAdmin
    .from("founder_feature_flags")
    .select("flag_value")
    .eq("flag_name", "lb_card_provider")
    .maybeSingle();

  return data?.flag_value ?? Deno.env.get("LB_CARD_PROVIDER") ?? "stripe";
}
