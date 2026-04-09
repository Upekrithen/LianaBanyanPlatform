// K96 — Didasko (Academic) initiative webhook
import { createInitiativeWebhookHandler } from "../_shared/initiativeWebhookHandler.ts";

Deno.serve(createInitiativeWebhookHandler({
  initiative_id: "init-14-didasko",
  initiative_slug: "didasko",
  initiative_name: "Didasko",
  webhook_secret_env: "STRIPE_DIDASKO_WEBHOOK_SECRET",
  ledger_category: "guild_payment",
  is_patronage: true,
  patronage_type: "service",
}));
