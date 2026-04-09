// ── Lithic Card Issuer Implementation ──────────────────────────────
// Implements CardIssuer using Lithic REST API (https://docs.lithic.com).
// Uses Deno native fetch — no SDK required.
// Env vars: LITHIC_API_KEY (production), LITHIC_SANDBOX_KEY (sandbox).
// Set LITHIC_ENVIRONMENT=sandbox to use sandbox; defaults to production.

import type {
  CardIssuer,
  CardholderInput,
  CardholderResult,
  VirtualCardInput,
  PhysicalCardInput,
  CardResult,
  CardDetailsResult,
  FundCardInput,
  FundCardResult,
  TransactionRecord,
} from "./cardIssuer.ts";

// ── Config ─────────────────────────────────────────────────────────

function getBaseUrl(): string {
  const env = (Deno.env.get("LITHIC_ENVIRONMENT") ?? "production").toLowerCase();
  return env === "sandbox"
    ? "https://sandbox.lithic.com"
    : "https://api.lithic.com";
}

function getApiKey(): string {
  const env = (Deno.env.get("LITHIC_ENVIRONMENT") ?? "production").toLowerCase();
  const key = env === "sandbox"
    ? Deno.env.get("LITHIC_SANDBOX_KEY")
    : Deno.env.get("LITHIC_API_KEY");
  if (!key) {
    throw new Error(
      `Missing Lithic API key. Set ${env === "sandbox" ? "LITHIC_SANDBOX_KEY" : "LITHIC_API_KEY"} in environment.`,
    );
  }
  return key;
}

function headers(): Record<string, string> {
  return {
    Authorization: `api-key ${getApiKey()}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

// ── HTTP helpers ───────────────────────────────────────────────────

async function lithicPost<T>(path: string, body: unknown): Promise<T> {
  const url = `${getBaseUrl()}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.message ?? data?.debugging_request_id ?? JSON.stringify(data);
    throw new Error(`Lithic POST ${path} failed (${res.status}): ${msg}`);
  }
  return data as T;
}

async function lithicGet<T>(path: string): Promise<T> {
  const url = `${getBaseUrl()}${path}`;
  const res = await fetch(url, {
    method: "GET",
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.message ?? JSON.stringify(data);
    throw new Error(`Lithic GET ${path} failed (${res.status}): ${msg}`);
  }
  return data as T;
}

async function lithicPatch<T>(path: string, body: unknown): Promise<T> {
  const url = `${getBaseUrl()}${path}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.message ?? JSON.stringify(data);
    throw new Error(`Lithic PATCH ${path} failed (${res.status}): ${msg}`);
  }
  return data as T;
}

// ── Lithic response types (subset) ────────────────────────────────

interface LithicAccount {
  token: string;
  state: string;
  [key: string]: unknown;
}

interface LithicCard {
  token: string;
  last_four: string;
  exp_month: string;
  exp_year: string;
  state: string;
  type: string;
  pan?: string;
  cvv?: string;
  [key: string]: unknown;
}

interface LithicTransaction {
  token: string;
  amount: number;
  merchant: { descriptor?: string; mcc?: string } | null;
  status: string;
  created: string;
  [key: string]: unknown;
}

interface LithicTransactionPage {
  data: LithicTransaction[];
  has_more: boolean;
  [key: string]: unknown;
}

// ── Implementation ─────────────────────────────────────────────────

export class LithicCardIssuer implements CardIssuer {
  readonly provider = "lithic" as const;

  async createCardholder(input: CardholderInput): Promise<CardholderResult> {
    // Lithic uses "accounts" as the cardholder container
    const account = await lithicPost<LithicAccount>("/v1/accounts", {
      // Lithic accounts are lightweight; personal data goes on KYC/KYB
      // For prepaid programs (Stearns Bank), KYC is handled at program level
    });

    return {
      providerCardholderId: account.token,
      status: account.state?.toLowerCase() ?? "active",
      metadata: { raw: account },
    };
  }

  async issueVirtualCard(input: VirtualCardInput): Promise<CardResult> {
    const body: Record<string, unknown> = {
      type: "VIRTUAL",
      account_token: input.providerCardholderId,
      product_id: Deno.env.get("LITHIC_PRODUCT_ID") ?? undefined,
    };

    if (input.spendLimitCents !== undefined) {
      body.spend_limit = input.spendLimitCents;
      body.spend_limit_duration = input.spendLimitDuration ?? "TRANSACTION";
    }

    if (input.memo) {
      body.memo = input.memo;
    }

    const card = await lithicPost<LithicCard>("/v1/cards", body);

    return this.mapCardResult(card, "virtual");
  }

  async issuePhysicalCard(input: PhysicalCardInput): Promise<CardResult> {
    const addr = input.shippingAddress;
    const body: Record<string, unknown> = {
      type: "PHYSICAL",
      account_token: input.providerCardholderId,
      product_id: Deno.env.get("LITHIC_PRODUCT_ID") ?? undefined,
      shipping_address: {
        first_name: addr.firstName,
        last_name: addr.lastName,
        line1: addr.line1,
        line2: addr.line2 ?? "",
        city: addr.city,
        state: addr.state,
        postal_code: addr.postalCode,
        country: addr.country,
      },
      shipping_method: input.shippingMethod ?? "STANDARD",
    };

    if (input.spendLimitCents !== undefined) {
      body.spend_limit = input.spendLimitCents;
      body.spend_limit_duration = input.spendLimitDuration ?? "TRANSACTION";
    }

    if (input.memo) {
      body.memo = input.memo;
    }

    const card = await lithicPost<LithicCard>("/v1/cards", body);

    return this.mapCardResult(card, "physical");
  }

  async fundCard(input: FundCardInput): Promise<FundCardResult> {
    // Lithic funding: Stearns Bank program-level funding.
    // Individual cardholder balances are tracked locally in card_balance_cents,
    // same as the Stripe Phase 1 approach.
    console.log(
      "[LithicCardIssuer.fundCard] Local balance is authoritative. Amount:",
      input.amountCents,
    );
    return {
      providerTransferId: `lithic_local_${input.idempotencyKey}`,
      status: "completed",
      metadata: {
        phase: 1,
        note: "Local balance — Lithic program balance funded at program level",
      },
    };
  }

  async getCardDetails(providerCardId: string): Promise<CardDetailsResult> {
    const card = await lithicGet<LithicCard>(
      `/v1/cards/${encodeURIComponent(providerCardId)}`,
    );

    return {
      number: card.pan ?? "",
      cvc: card.cvv ?? "",
      expMonth: parseInt(card.exp_month, 10) || 0,
      expYear: parseInt(card.exp_year, 10) || 0,
    };
  }

  async freezeCard(
    providerCardId: string,
  ): Promise<{ providerCardId: string; newStatus: string }> {
    const card = await lithicPatch<LithicCard>(
      `/v1/cards/${encodeURIComponent(providerCardId)}`,
      { state: "PAUSED" },
    );
    return { providerCardId: card.token, newStatus: card.state };
  }

  async unfreezeCard(
    providerCardId: string,
  ): Promise<{ providerCardId: string; newStatus: string }> {
    const card = await lithicPatch<LithicCard>(
      `/v1/cards/${encodeURIComponent(providerCardId)}`,
      { state: "OPEN" },
    );
    return { providerCardId: card.token, newStatus: card.state };
  }

  async cancelCard(
    providerCardId: string,
  ): Promise<{ providerCardId: string; newStatus: string }> {
    const card = await lithicPatch<LithicCard>(
      `/v1/cards/${encodeURIComponent(providerCardId)}`,
      { state: "CLOSED" },
    );
    return { providerCardId: card.token, newStatus: card.state };
  }

  async getTransactions(
    providerCardId: string,
    limit = 50,
  ): Promise<TransactionRecord[]> {
    const page = await lithicGet<LithicTransactionPage>(
      `/v1/transactions?card_token=${encodeURIComponent(providerCardId)}&page_size=${limit}`,
    );

    return (page.data ?? []).map((t) => ({
      providerTransactionId: t.token,
      amountCents: t.amount ?? 0,
      merchantName: t.merchant?.descriptor ?? null,
      merchantCategory: t.merchant?.mcc ?? null,
      status: t.status,
      createdAt: t.created,
      metadata: { raw: t },
    }));
  }

  // ── Private helpers ────────────────────────────────────────────

  private mapCardResult(card: LithicCard, type: "virtual" | "physical"): CardResult {
    return {
      providerCardId: card.token,
      lastFour: card.last_four ?? "",
      expMonth: parseInt(card.exp_month, 10) || 0,
      expYear: parseInt(card.exp_year, 10) || 0,
      status: card.state?.toLowerCase() ?? "unknown",
      type,
      metadata: { raw: card },
    };
  }
}
