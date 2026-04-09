// K96 — Rally Group initiative webhook
import { createInitiativeWebhookHandler } from "../_shared/initiativeWebhookHandler.ts";

Deno.serve(createInitiativeWebhookHandler({
  initiative_id: "init-09-rally",
  initiative_slug: "rally-group",
  initiative_name: "Rally Group",
  webhook_secret_env: "STRIPE_RALLY_WEBHOOK_SECRET",
  ledger_category: "guild_payment",
  is_patronage: true,
  patronage_type: "service",
}));
