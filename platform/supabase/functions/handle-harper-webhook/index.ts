// K96 — Harper Guild initiative webhook
import { createInitiativeWebhookHandler } from "../_shared/initiativeWebhookHandler.ts";

Deno.serve(createInitiativeWebhookHandler({
  initiative_id: "init-12-harper",
  initiative_slug: "harper-guild",
  initiative_name: "Harper Guild",
  webhook_secret_env: "STRIPE_HARPER_WEBHOOK_SECRET",
  ledger_category: "guild_payment",
  is_patronage: true,
  patronage_type: "service",
}));
