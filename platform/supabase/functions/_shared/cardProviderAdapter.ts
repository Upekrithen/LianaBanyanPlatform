// Provider-agnostic card adapter — Stripe Issuing implementation
// Future providers: add implementation functions, update dispatcher

export type CardProvider = 'stripe' | 'unit' | 'lithic';

// ── Interfaces (provider-agnostic) ──────────────────────

export interface CreateCardholderParams {
  firstName: string;
  lastName: string;
  email: string;
  billing: { line1: string; city: string; state?: string; postalCode: string; country: string };
}

export interface CreateCardholderResult {
  providerCardholderId: string;
  status: string;
  metadata: Record<string, unknown>;
}

export interface CreateCardParams {
  providerCardholderId: string;
  type: 'virtual' | 'physical';
  currency?: string;
}

export interface CreateCardResult {
  providerCardId: string;
  lastFour: string;
  expMonth: number;
  expYear: number;
  status: string;
  metadata: Record<string, unknown>;
}

export interface CardDetailsResult {
  number: string;
  cvc: string;
  expMonth: number;
  expYear: number;
}

export interface FundCardParams {
  providerCardholderId: string;
  amountCents: number;
  description: string;
  idempotencyKey: string;
}

export interface FundCardResult {
  providerTransferId: string;
  status: string;
  metadata: Record<string, unknown>;
}

export interface UpdateCardStatusParams {
  providerCardId: string;
  action: 'freeze' | 'unfreeze' | 'cancel';
}

export interface UpdateCardStatusResult {
  providerCardId: string;
  newStatus: string;
  metadata: Record<string, unknown>;
}

// ── Stripe Implementation ───────────────────────────────

function stripeHeaders(): Record<string, string> {
  const key = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
  return {
    Authorization: `Basic ${btoa(key + ':')}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };
}

async function stripePost(path: string, body: URLSearchParams): Promise<any> {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: 'POST', headers: stripeHeaders(), body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Stripe ${path} failed`);
  return data;
}

async function stripeGet(path: string): Promise<any> {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    headers: { Authorization: stripeHeaders().Authorization },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Stripe GET ${path} failed`);
  return data;
}

async function stripeCreateCardholder(p: CreateCardholderParams): Promise<CreateCardholderResult> {
  const body = new URLSearchParams();
  body.append('type', 'individual');
  body.append('name', `${p.firstName} ${p.lastName}`.trim());
  body.append('individual[first_name]', p.firstName);
  body.append('individual[last_name]', p.lastName);
  body.append('email', p.email);
  body.append('billing[address][line1]', p.billing.line1);
  body.append('billing[address][city]', p.billing.city);
  body.append('billing[address][postal_code]', p.billing.postalCode);
  body.append('billing[address][country]', p.billing.country);
  if (p.billing.state) body.append('billing[address][state]', p.billing.state);
  body.append('status', 'active');

  const data = await stripePost('/issuing/cardholders', body);
  return { providerCardholderId: data.id, status: data.status, metadata: { raw: data } };
}

async function stripeCreateCard(p: CreateCardParams): Promise<CreateCardResult> {
  const body = new URLSearchParams();
  body.append('cardholder', p.providerCardholderId);
  body.append('currency', p.currency || 'usd');
  body.append('type', p.type);
  body.append('status', 'active');
  body.append('spending_controls[blocked_categories][]', 'cash_advance');
  body.append('spending_controls[blocked_categories][]', 'automated_fuel_dispensers');

  const data = await stripePost('/issuing/cards', body);
  return {
    providerCardId: data.id,
    lastFour: data.last4 ?? '',
    expMonth: data.exp_month,
    expYear: data.exp_year,
    status: data.status,
    metadata: { raw: data },
  };
}

async function stripeGetCardDetails(providerCardId: string): Promise<CardDetailsResult> {
  const data = await stripeGet(
    `/issuing/cards/${encodeURIComponent(providerCardId)}?expand[]=number&expand[]=cvc`
  );
  return {
    number: typeof data.number === 'string' ? data.number : data.number?.number ?? '',
    cvc: typeof data.cvc === 'string' ? data.cvc : data.cvc?.cvc ?? '',
    expMonth: data.exp_month,
    expYear: data.exp_year,
  };
}

async function stripeFundCard(p: FundCardParams): Promise<FundCardResult> {
  // Phase 1 (MVP): Issuing balance is pre-funded by the Founder via Stripe Dashboard.
  // Individual cardholder balances are tracked locally in card_balance_cents.
  // The lb-card-webhook checks card_balance_cents before approving authorizations.
  // Phase 2: automate top-ups via stripe.topups.create() when balance is low.
  console.log('[stripeFundCard] Phase 1: local balance is authoritative. Amount:', p.amountCents);
  return {
    providerTransferId: `local_${p.idempotencyKey}`,
    status: 'completed',
    metadata: { phase: 1, note: 'Local balance — Stripe Issuing balance pre-funded by Founder' },
  };
}

async function stripeUpdateCardStatus(p: UpdateCardStatusParams): Promise<UpdateCardStatusResult> {
  const statusMap: Record<string, string> = { freeze: 'inactive', unfreeze: 'active', cancel: 'canceled' };
  const body = new URLSearchParams();
  body.append('status', statusMap[p.action] || 'inactive');

  const data = await stripePost(`/issuing/cards/${encodeURIComponent(p.providerCardId)}`, body);
  return { providerCardId: data.id, newStatus: data.status, metadata: { raw: data } };
}

// ── Dispatcher ──────────────────────────────────────────

export function getProvider(): CardProvider {
  const p = (Deno.env.get('LB_CARD_PROVIDER') ?? 'stripe').toLowerCase();
  if (p === 'unit' || p === 'lithic') return p;
  return 'stripe';
}

export async function createCardholder(params: CreateCardholderParams): Promise<CreateCardholderResult> {
  const p = getProvider();
  if (p !== 'stripe') throw new Error(`Provider '${p}' not yet implemented. Only 'stripe' is active.`);
  return stripeCreateCardholder(params);
}

export async function createCard(params: CreateCardParams): Promise<CreateCardResult> {
  const p = getProvider();
  if (p !== 'stripe') throw new Error(`Provider '${p}' not yet implemented.`);
  return stripeCreateCard(params);
}

export async function getCardDetails(providerCardId: string): Promise<CardDetailsResult> {
  const p = getProvider();
  if (p !== 'stripe') throw new Error(`Provider '${p}' not yet implemented.`);
  return stripeGetCardDetails(providerCardId);
}

export async function fundCard(params: FundCardParams): Promise<FundCardResult> {
  const p = getProvider();
  if (p !== 'stripe') throw new Error(`Provider '${p}' not yet implemented.`);
  return stripeFundCard(params);
}

export async function updateCardStatus(params: UpdateCardStatusParams): Promise<UpdateCardStatusResult> {
  const p = getProvider();
  if (p !== 'stripe') throw new Error(`Provider '${p}' not yet implemented.`);
  return stripeUpdateCardStatus(params);
}
