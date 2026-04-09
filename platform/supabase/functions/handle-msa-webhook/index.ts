// K96 — MSA (Medical Savings Account) initiative webhook
import { createInitiativeWebhookHandler } from "../_shared/initiativeWebhookHandler.ts";

Deno.serve(createInitiativeWebhookHandler({
  initiative_id: "init-07-msa",
  initiative_slug: "msa",
  initiative_name: "MSA",
  webhook_secret_env: "STRIPE_MSA_WEBHOOK_SECRET",
  ledger_category: "guild_payment",
  is_patronage: true,
  patronage_type: "purchase",
}));
