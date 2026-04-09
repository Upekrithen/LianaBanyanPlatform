// K96 — Household Concierge initiative webhook
import { createInitiativeWebhookHandler } from "../_shared/initiativeWebhookHandler.ts";

Deno.serve(createInitiativeWebhookHandler({
  initiative_id: "init-04-concierge",
  initiative_slug: "household-concierge",
  initiative_name: "Household Concierge",
  webhook_secret_env: "STRIPE_CONCIERGE_WEBHOOK_SECRET",
  ledger_category: "guild_payment",
  is_patronage: true,
  patronage_type: "service",
}));
