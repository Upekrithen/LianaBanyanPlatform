/**
 * Shared Initiative Webhook Handler Factory
 * K96 — Each of the 16 LB initiatives gets its own Stripe webhook
 * endpoint with its own signing secret for clean Subchapter T accounting.
 *
 * Usage (in each initiative's index.ts):
 *   import { createInitiativeWebhookHandler } from "../_shared/initiativeWebhookHandler.ts";
 *   Deno.serve(createInitiativeWebhookHandler({ ... }));
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { writeLedgerEntry } from "./ledgerWriter.ts";

export interface InitiativeConfig {
  initiative_id: string;       // e.g. 'init-01-dinner'
  initiative_slug: string;     // e.g. 'lets-make-dinner'
  initiative_name: string;     // e.g. "Let's Make Dinner"
  webhook_secret_env: string;  // e.g. 'STRIPE_LMD_WEBHOOK_SECRET'
  ledger_category: string;     // existing category from transaction_ledger
  is_patronage: boolean;       // true for all 16 initiatives
  patronage_type: string;      // 'purchase' | 'service'
  /** Optional custom logic to run after payment is confirmed */
  onPaymentCompleted?: (ctx: PaymentContext) => Promise<void>;
}

export interface PaymentContext {
  event: Record<string, unknown>;
  session: Record<string, unknown>;
  metadata: Record<string, string>;
  supabase: ReturnType<typeof createClient>;
  initiative: InitiativeConfig;
}

/**
 * Verify Stripe webhook signature using manual HMAC (no SDK dependency).
 * Matches the pattern established in handle-membership-webhook.
 */
async function verifySignature(
  body: string,
  signatureHeader: string,
  secret: string
): Promise<boolean> {
  const parts = signatureHeader.split(",").reduce(
    (acc: Record<string, string>, part: string) => {
      const [k, v] = part.split("=");
      acc[k.trim()] = v;
      return acc;
    },
    {} as Record<string, string>
  );

  const timestamp = parts["t"];
  const expectedSig = parts["v1"];

  if (!timestamp || !expectedSig) return false;

  // Reject events older than 5 minutes
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp);
  if (Math.abs(age) > 300) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${timestamp}.${body}`)
  );
  const computedSig = Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computedSig === expectedSig;
}

/**
 * Creates a Deno.serve-compatible handler for an initiative webhook.
 */
export function createInitiativeWebhookHandler(
  config: InitiativeConfig
): (req: Request) => Promise<Response> {
  const tag = `[${config.initiative_name}Webhook]`;

  return async (req: Request): Promise<Response> => {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const webhookSecret = Deno.env.get(config.webhook_secret_env);
      if (!webhookSecret) {
        console.error(`${tag} Missing ${config.webhook_secret_env}`);
        return new Response("Server config error", { status: 500 });
      }

      const signature = req.headers.get("stripe-signature");
      if (!signature) {
        return new Response("No signature", { status: 400 });
      }

      const body = await req.text();
      const valid = await verifySignature(body, signature, webhookSecret);
      if (!valid) {
        console.error(`${tag} Signature mismatch`);
        return new Response("Invalid signature", { status: 400 });
      }

      const event = JSON.parse(body);
      console.log(`${tag} Event: ${event.type} (${event.id})`);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const meta = (session.metadata || {}) as Record<string, string>;

        const supabase = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // Write ledger entry for this initiative payment
        const amountCents = session.amount_total || 0;
        try {
          await writeLedgerEntry({
            stripe_event_id: event.id,
            stripe_session_id: session.id,
            stripe_payment_intent:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : undefined,
            ledger_category: config.ledger_category,
            amount_cents: amountCents,
            currency: session.currency || "usd",
            payer_id: meta.user_id || undefined,
            initiative_id: config.initiative_id,
            is_patronage: config.is_patronage,
            patronage_type: config.patronage_type,
            description: `${config.initiative_name} payment`,
            metadata: { initiative_slug: config.initiative_slug, ...meta },
            webhook_source: `handle-${config.initiative_slug}-webhook`,
          });
          console.log(
            `${tag} Ledger entry written: ${config.ledger_category}, ${amountCents} cents`
          );
        } catch (ledgerErr) {
          console.error(`${tag} Ledger write failed (non-fatal):`, ledgerErr);
        }

        // Run initiative-specific custom logic if provided
        if (config.onPaymentCompleted) {
          await config.onPaymentCompleted({
            event,
            session,
            metadata: meta,
            supabase,
            initiative: config,
          });
        }
      } else {
        console.log(`${tag} Ignoring event type: ${event.type}`);
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`${tag} FATAL: ${msg}`);
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}
