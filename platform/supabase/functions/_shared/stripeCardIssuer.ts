// ── Stripe Card Issuer — wraps existing cardProviderAdapter into CardIssuer interface ──
// Delegates to the battle-tested Stripe functions already in cardProviderAdapter.ts.

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

import {
  createCardholder as stripeCreateCardholder,
  createCard as stripeCreateCard,
  getCardDetails as stripeGetCardDetails,
  fundCard as stripeFundCard,
  updateCardStatus as stripeUpdateCardStatus,
} from "./cardProviderAdapter.ts";

export class StripeCardIssuer implements CardIssuer {
  readonly provider = "stripe" as const;

  async createCardholder(input: CardholderInput): Promise<CardholderResult> {
    return stripeCreateCardholder({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      billing: {
        line1: input.billing.line1,
        city: input.billing.city,
        state: input.billing.state,
        postalCode: input.billing.postalCode,
        country: input.billing.country,
      },
    });
  }

  async issueVirtualCard(input: VirtualCardInput): Promise<CardResult> {
    const result = await stripeCreateCard({
      providerCardholderId: input.providerCardholderId,
      type: "virtual",
      currency: input.currency ?? "usd",
    });
    return {
      providerCardId: result.providerCardId,
      lastFour: result.lastFour,
      expMonth: result.expMonth,
      expYear: result.expYear,
      status: result.status,
      type: "virtual",
      metadata: result.metadata,
    };
  }

  async issuePhysicalCard(input: PhysicalCardInput): Promise<CardResult> {
    // Stripe physical cards require additional shipping params — handled via
    // Stripe Dashboard for Phase 1. The API call works the same as virtual
    // with type=physical; Stripe prompts for shipping in their flow.
    const result = await stripeCreateCard({
      providerCardholderId: input.providerCardholderId,
      type: "physical",
      currency: input.currency ?? "usd",
    });
    return {
      providerCardId: result.providerCardId,
      lastFour: result.lastFour,
      expMonth: result.expMonth,
      expYear: result.expYear,
      status: result.status,
      type: "physical",
      metadata: result.metadata,
    };
  }

  async fundCard(input: FundCardInput): Promise<FundCardResult> {
    return stripeFundCard({
      providerCardholderId: input.providerCardholderId,
      amountCents: input.amountCents,
      description: input.description,
      idempotencyKey: input.idempotencyKey,
    });
  }

  async getCardDetails(providerCardId: string): Promise<CardDetailsResult> {
    return stripeGetCardDetails(providerCardId);
  }

  async freezeCard(
    providerCardId: string,
  ): Promise<{ providerCardId: string; newStatus: string }> {
    const result = await stripeUpdateCardStatus({ providerCardId, action: "freeze" });
    return { providerCardId: result.providerCardId, newStatus: result.newStatus };
  }

  async unfreezeCard(
    providerCardId: string,
  ): Promise<{ providerCardId: string; newStatus: string }> {
    const result = await stripeUpdateCardStatus({ providerCardId, action: "unfreeze" });
    return { providerCardId: result.providerCardId, newStatus: result.newStatus };
  }

  async cancelCard(
    providerCardId: string,
  ): Promise<{ providerCardId: string; newStatus: string }> {
    const result = await stripeUpdateCardStatus({ providerCardId, action: "cancel" });
    return { providerCardId: result.providerCardId, newStatus: result.newStatus };
  }

  async getTransactions(
    _providerCardId: string,
    _limit?: number,
  ): Promise<TransactionRecord[]> {
    // Stripe transaction listing is done via webhooks (issuing_transaction.created),
    // not polling. Return empty — transactions are in lb_card_transactions table.
    console.log(
      "[StripeCardIssuer.getTransactions] Stripe uses webhook-driven transactions. Query lb_card_transactions table instead.",
    );
    return [];
  }
}
