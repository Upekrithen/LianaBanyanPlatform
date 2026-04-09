// K96 — JukeBox initiative webhook
import { createInitiativeWebhookHandler } from "../_shared/initiativeWebhookHandler.ts";

Deno.serve(createInitiativeWebhookHandler({
  initiative_id: "init-13-jukebox",
  initiative_slug: "jukebox",
  initiative_name: "JukeBox",
  webhook_secret_env: "STRIPE_JUKEBOX_WEBHOOK_SECRET",
  ledger_category: "guild_payment",
  is_patronage: true,
  patronage_type: "purchase",
}));
