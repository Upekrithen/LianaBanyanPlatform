// K96 — Brass Tacks (Medallion Sponsorship) initiative webhook
import { createInitiativeWebhookHandler } from "../_shared/initiativeWebhookHandler.ts";

Deno.serve(createInitiativeWebhookHandler({
  initiative_id: "init-16-brass",
  initiative_slug: "brass-tacks",
  initiative_name: "Brass Tacks",
  webhook_secret_env: "STRIPE_BRASS_TACKS_WEBHOOK_SECRET",
  ledger_category: "guild_payment",
  is_patronage: true,
  patronage_type: "purchase",
}));
