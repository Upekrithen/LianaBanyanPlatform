// K96 — Let's Go Shopping initiative webhook
import { createInitiativeWebhookHandler } from "../_shared/initiativeWebhookHandler.ts";

Deno.serve(createInitiativeWebhookHandler({
  initiative_id: "init-03-shopping",
  initiative_slug: "lets-go-shopping",
  initiative_name: "Let's Go Shopping",
  webhook_secret_env: "STRIPE_SHOPPING_WEBHOOK_SECRET",
  ledger_category: "guild_payment",
  is_patronage: true,
  patronage_type: "purchase",
}));
