// K96 — The Family Table initiative webhook
import { createInitiativeWebhookHandler } from "../_shared/initiativeWebhookHandler.ts";

Deno.serve(createInitiativeWebhookHandler({
  initiative_id: "init-05-family-table",
  initiative_slug: "the-family-table",
  initiative_name: "The Family Table",
  webhook_secret_env: "STRIPE_FAMILY_TABLE_WEBHOOK_SECRET",
  ledger_category: "guild_payment",
  is_patronage: true,
  patronage_type: "purchase",
}));
