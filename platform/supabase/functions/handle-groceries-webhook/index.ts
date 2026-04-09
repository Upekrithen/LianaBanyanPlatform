// K96 — Let's Get Groceries initiative webhook
import { createInitiativeWebhookHandler } from "../_shared/initiativeWebhookHandler.ts";

Deno.serve(createInitiativeWebhookHandler({
  initiative_id: "init-02-groceries",
  initiative_slug: "lets-get-groceries",
  initiative_name: "Let's Get Groceries",
  webhook_secret_env: "STRIPE_GROCERIES_WEBHOOK_SECRET",
  ledger_category: "guild_payment",
  is_patronage: true,
  patronage_type: "purchase",
}));
