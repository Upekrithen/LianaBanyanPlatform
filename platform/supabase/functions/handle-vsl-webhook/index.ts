// K96 — VSL (Village Savings & Loans) initiative webhook
import { createInitiativeWebhookHandler } from "../_shared/initiativeWebhookHandler.ts";

Deno.serve(createInitiativeWebhookHandler({
  initiative_id: "init-10-vsl",
  initiative_slug: "vsl",
  initiative_name: "VSL",
  webhook_secret_env: "STRIPE_VSL_WEBHOOK_SECRET",
  ledger_category: "guild_payment",
  is_patronage: true,
  patronage_type: "purchase",
}));
