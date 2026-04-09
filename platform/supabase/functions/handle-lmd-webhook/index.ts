// K96 — Let's Make Dinner initiative webhook
import { createInitiativeWebhookHandler } from "../_shared/initiativeWebhookHandler.ts";

Deno.serve(createInitiativeWebhookHandler({
  initiative_id: "init-01-dinner",
  initiative_slug: "lets-make-dinner",
  initiative_name: "Let's Make Dinner",
  webhook_secret_env: "STRIPE_LMD_WEBHOOK_SECRET",
  ledger_category: "guild_payment",
  is_patronage: true,
  patronage_type: "purchase",
}));
