import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface LedgerEntry {
  stripe_session_id?: string;
  stripe_payment_intent?: string;
  stripe_event_id: string;
  ledger_category: string;
  amount_cents: number;
  currency?: string;
  payer_id?: string;
  payee_id?: string;
  storefront_id?: string;
  project_id?: string;
  initiative_id?: string;
  is_patronage: boolean;
  patronage_type?: string;
  status?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  webhook_source: string;
}

export async function writeLedgerEntry(entry: LedgerEntry) {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: existing } = await supabaseAdmin
    .from('transaction_ledger')
    .select('id')
    .eq('stripe_event_id', entry.stripe_event_id)
    .single();

  if (existing) {
    return { skipped: true, id: existing.id };
  }

  const { data, error } = await supabaseAdmin
    .from('transaction_ledger')
    .insert({
      ...entry,
      currency: entry.currency || 'usd',
      status: entry.status || 'completed',
      metadata: entry.metadata || {},
    })
    .select('id')
    .single();

  if (error) throw error;
  return { skipped: false, id: data.id };
}

export function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string,
  stripe: { webhooks: { constructEvent: (body: string, sig: string, secret: string) => unknown } }
): unknown {
  return stripe.webhooks.constructEvent(body, signature, secret);
}
