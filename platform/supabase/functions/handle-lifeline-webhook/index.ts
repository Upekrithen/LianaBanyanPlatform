// K96 — LifeLine Medications initiative webhook
import { createInitiativeWebhookHandler } from "../_shared/initiativeWebhookHandler.ts";

Deno.serve(createInitiativeWebhookHandler({
  initiative_id: "init-06-lifeline",
  initiative_slug: "lifeline-medications",
  initiative_name: "LifeLine Medications",
  webhook_secret_env: "STRIPE_LIFELINE_WEBHOOK_SECRET",
  ledger_category: "guild_payment",
  is_patronage: true,
  patronage_type: "purchase",
}));
