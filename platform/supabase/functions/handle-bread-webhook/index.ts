// K96 — Let's Make Bread initiative webhook
import { createInitiativeWebhookHandler } from "../_shared/initiativeWebhookHandler.ts";

Deno.serve(createInitiativeWebhookHandler({
  initiative_id: "init-11-bread",
  initiative_slug: "lets-make-bread",
  initiative_name: "Let's Make Bread",
  webhook_secret_env: "STRIPE_BREAD_WEBHOOK_SECRET",
  ledger_category: "guild_payment",
  is_patronage: true,
  patronage_type: "purchase",
}));
