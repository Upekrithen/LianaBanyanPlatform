// K96 — Defense Klaus initiative webhook
import { createInitiativeWebhookHandler } from "../_shared/initiativeWebhookHandler.ts";

Deno.serve(createInitiativeWebhookHandler({
  initiative_id: "init-08-defense-klaus",
  initiative_slug: "defense-klaus",
  initiative_name: "Defense Klaus",
  webhook_secret_env: "STRIPE_DEFENSE_KLAUS_WEBHOOK_SECRET",
  ledger_category: "guild_payment",
  is_patronage: true,
  patronage_type: "service",
}));
