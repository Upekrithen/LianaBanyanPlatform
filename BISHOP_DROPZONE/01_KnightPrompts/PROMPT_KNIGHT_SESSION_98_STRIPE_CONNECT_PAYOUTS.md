# KNIGHT SESSION 98 — Stripe Connect Payouts (Push to Existing Bank/Card)
## Bishop 032 | March 24, 2026
## Innovation Count: 1,938
## Based on: K95 (Multi-Endpoint + LB Card Schema), K96 (Commerce Webhook + Ledger), K97 (Stripe Issuing Go-Live)
## Provider: **Stripe Connect Express** (CONFIRMED ACTIVE — Connect shortcut visible in Stripe Dashboard sidebar)

---

## MISSION

Build the **second payout path**: Stripe Connect Express payouts to members' existing bank accounts and debit cards. K97 built the LB Card path (Stripe Issuing — branded card, required for unbanked). This session builds the alternative: members who already have a bank account or debit card can receive earnings directly via Stripe Connect.

**Two payout paths. One balance. Member chooses.**

```
Member earns $100
    │
    ├── "Send to my bank/card" → Stripe Connect Payout (instant or standard)
    │   (default for banked members, zero new cards)
    │
    └── "Send to my LB Card" → fund-lb-card → Stripe Issuing
        (opt-in, branded, required for unbanked members)
```

Stripe Connect Express handles KYC, tax reporting (1099s for earnings > $600/year), and compliance. Members link their existing debit card or bank account through Stripe's hosted onboarding. The platform never touches raw banking details.

---

## CONTEXT: WHAT'S ALREADY DEPLOYED

### Database Tables (from K95/K96/K97 migrations)

| Table | Key Columns |
|-------|-------------|
| `lb_cardholders` | `id`, `user_id`, `stripe_cardholder_id`, `provider`, `provider_cardholder_id`, `status`, `card_balance_cents`, `kyc_status` |
| `lb_cards` | `id`, `cardholder_id`, `stripe_card_id`, `provider_card_id`, `card_type`, `status`, `last_four` |
| `lb_card_transactions` | `id`, `card_id`, `stripe_authorization_id`, `provider_authorization_id`, `amount_cents`, `merchant_name`, `status` |
| `lb_card_funding` | `id`, `cardholder_id`, `amount_cents`, `funding_type`, `source_description`, `stripe_transfer_id`, `provider_transfer_id` |
| `transaction_ledger` | `stripe_event_id`, `ledger_category`, `amount_cents`, `payer_id`, `payee_id`, `is_patronage`, `webhook_source` |
| `founder_feature_flags` | `feature_key`, `is_enabled`, `notes` |

### Edge Functions (ALL DEPLOYED)

| Function | Purpose |
|----------|---------|
| `create-lb-cardholder` | Creates Stripe Issuing cardholder |
| `create-lb-card` | Issues virtual card via Stripe Issuing |
| `get-lb-card-details` | Retrieves card number/CVC |
| `update-lb-card-controls` | Freeze/unfreeze/limits |
| `lb-card-webhook` | Handles Issuing authorization + transaction events |
| `fund-lb-card` | Updates `card_balance_cents` + logs funding |

### Shared Utilities

| File | Purpose |
|------|---------|
| `supabase/functions/_shared/ledgerWriter.ts` | `writeLedgerEntry()` — idempotent ledger inserts |
| `supabase/functions/_shared/cardProviderAdapter.ts` | Stripe Issuing adapter (K97) |
| `supabase/functions/_shared/war-chest-fifo.ts` | FIFO allocation for War Chest |

### Frontend

| File | Purpose |
|------|---------|
| `src/pages/LBCardPage.tsx` | Card manager UI — balance, transactions, freeze/unfreeze, card details |
| `src/pages/WarChestPage.tsx` | War Chest allocations — substitution, sponsorship, commission |
| `src/App.tsx` | Routes: `/dashboard/lb-card`, `/dashboard/war-chest` (lazy-loaded, `<ProtectedRoute>`) |

### Environment (ALREADY SET in Supabase secrets)

- `STRIPE_SECRET_KEY` — live key (same key works for Connect + Issuing)
- `STRIPE_ISSUING_WEBHOOK_SECRET` — Issuing webhook signing
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — standard
- `LB_SYSTEM_KEY` — internal system auth for fund-lb-card

---

## TASK 1: Migration — Connect Tables + Payout Preference + Feature Flag

**File**: `supabase/migrations/20260324000002_k98_stripe_connect_payouts.sql`

```sql
-- ============================================
-- K98: Stripe Connect Payouts
-- New tables for Connect accounts + payout history
-- Adds payout_preference to lb_cardholders
-- ============================================

-- =============================================
-- TABLE 1: member_connect_accounts
-- Stripe Connect Express account per member
-- =============================================

CREATE TABLE member_connect_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  stripe_account_id TEXT NOT NULL UNIQUE,
  onboarding_status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (onboarding_status IN ('not_started', 'pending', 'complete', 'restricted')),
  payouts_enabled BOOLEAN NOT NULL DEFAULT false,
  charges_enabled BOOLEAN NOT NULL DEFAULT false,
  default_payout_speed TEXT NOT NULL DEFAULT 'standard'
    CHECK (default_payout_speed IN ('standard', 'instant')),
  country TEXT DEFAULT 'US',
  stripe_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 2: member_payouts
-- Every payout request + result
-- =============================================

CREATE TABLE member_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  connect_account_id UUID NOT NULL REFERENCES member_connect_accounts(id),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  fee_cents INTEGER NOT NULL DEFAULT 0,
  net_amount_cents INTEGER NOT NULL,
  payout_speed TEXT NOT NULL CHECK (payout_speed IN ('standard', 'instant')),
  stripe_transfer_id TEXT,
  stripe_payout_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'canceled')),
  failure_reason TEXT,
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- COLUMN: payout_preference on lb_cardholders
-- Where does the member want earnings sent?
-- =============================================

ALTER TABLE lb_cardholders
  ADD COLUMN IF NOT EXISTS payout_preference TEXT DEFAULT 'lb_card'
    CHECK (payout_preference IN ('lb_card', 'connect_instant', 'connect_standard'));

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_connect_accounts_user ON member_connect_accounts(user_id);
CREATE INDEX idx_connect_accounts_stripe ON member_connect_accounts(stripe_account_id);
CREATE INDEX idx_payouts_user ON member_payouts(user_id, created_at DESC);
CREATE INDEX idx_payouts_status ON member_payouts(status, created_at DESC);
CREATE INDEX idx_payouts_stripe_transfer ON member_payouts(stripe_transfer_id);

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE member_connect_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own connect account" ON member_connect_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users view own payouts" ON member_payouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin manages all connect accounts" ON member_connect_accounts
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admin manages all payouts" ON member_payouts
  FOR ALL USING (public.is_admin());

-- =============================================
-- LEDGER CATEGORIES: add connect payout types
-- =============================================

-- Extend transaction_ledger CHECK constraint to include 'connect_payout' and 'connect_payout_fee'
-- Drop and re-add the constraint (Postgres requires this for CHECK updates)
ALTER TABLE transaction_ledger DROP CONSTRAINT IF EXISTS transaction_ledger_ledger_category_check;
ALTER TABLE transaction_ledger ADD CONSTRAINT transaction_ledger_ledger_category_check
  CHECK (ledger_category IN (
    'membership',
    'commerce_storefront',
    'commerce_creator',
    'commerce_platform',
    'commerce_gleaners',
    'project_funding',
    'project_funder_credit',
    'project_seeding',
    'project_platform_cap',
    'project_escrow',
    'guild_payment',
    'coalition_fee',
    'housing_fund',
    'subscription',
    'card_funding',
    'card_transaction',
    'connect_payout',
    'connect_payout_fee'
  ));

-- =============================================
-- FEATURE FLAG
-- =============================================

INSERT INTO founder_feature_flags (feature_key, is_enabled, enabled_at, notes)
VALUES ('connect_payouts_enabled', false, NULL, 'Enable after first Connect account tested')
ON CONFLICT (feature_key) DO NOTHING;
```

---

## TASK 2: Edge Function — `create-connect-account`

**File**: `supabase/functions/create-connect-account/index.ts`

Creates a Stripe Connect Express account for the authenticated member and returns the hosted onboarding URL.

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function stripeHeaders(): Record<string, string> {
  const key = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
  return {
    Authorization: `Basic ${btoa(key + ":")}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

async function stripePost(path: string, body: URLSearchParams): Promise<any> {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: "POST",
    headers: stripeHeaders(),
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Stripe ${path} failed`);
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

  if (!stripeKey) return jsonResponse({ error: "Server misconfigured" }, 500);

  // Auth: get user from JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return jsonResponse({ error: "Unauthorized" }, 401);

  const supabaseClient = createClient(supabaseUrl, supabaseKey);
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authErr } = await createClient(
    supabaseUrl,
    Deno.env.get("SUPABASE_ANON_KEY") ?? supabaseKey
  ).auth.getUser(token);

  if (authErr || !user) return jsonResponse({ error: "Unauthorized" }, 401);

  // Check feature flag
  const { data: flag } = await supabaseClient
    .from("founder_feature_flags")
    .select("is_enabled")
    .eq("feature_key", "connect_payouts_enabled")
    .maybeSingle();

  if (!flag?.is_enabled) {
    return jsonResponse({ error: "Connect payouts not yet enabled" }, 403);
  }

  // Check if member already has a Connect account
  const { data: existing } = await supabaseClient
    .from("member_connect_accounts")
    .select("id, stripe_account_id, onboarding_status, payouts_enabled")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing && existing.onboarding_status === "complete" && existing.payouts_enabled) {
    return jsonResponse({ error: "Connect account already active", account_id: existing.id }, 409);
  }

  // If existing but incomplete, generate new onboarding link
  if (existing && existing.stripe_account_id) {
    const linkBody = new URLSearchParams();
    linkBody.append("account", existing.stripe_account_id);
    linkBody.append("refresh_url", `${req.headers.get("origin") || "https://lianabanyan.com"}/dashboard/payouts?refresh=true`);
    linkBody.append("return_url", `${req.headers.get("origin") || "https://lianabanyan.com"}/dashboard/payouts?onboarding=complete`);
    linkBody.append("type", "account_onboarding");

    const link = await stripePost("/account_links", linkBody);
    return jsonResponse({ onboarding_url: link.url, account_id: existing.id, resuming: true });
  }

  // Parse optional body for email/country
  let bodyData: { email?: string; country?: string } = {};
  try {
    bodyData = await req.json();
  } catch {
    // No body is fine — we use user.email
  }

  // Create Stripe Connect Express account
  const acctBody = new URLSearchParams();
  acctBody.append("type", "express");
  acctBody.append("country", bodyData.country || "US");
  acctBody.append("email", bodyData.email || user.email || "");
  acctBody.append("capabilities[transfers][requested]", "true");
  acctBody.append("capabilities[card_payments][requested]", "false");
  acctBody.append("business_type", "individual");
  acctBody.append("metadata[lb_user_id]", user.id);
  acctBody.append("metadata[platform]", "liana_banyan");
  // Settings for payouts
  acctBody.append("settings[payouts][schedule][interval]", "manual");

  const account = await stripePost("/accounts", acctBody);

  // Insert DB record
  const { data: row, error: insErr } = await supabaseClient
    .from("member_connect_accounts")
    .insert({
      user_id: user.id,
      stripe_account_id: account.id,
      onboarding_status: "pending",
      payouts_enabled: false,
      charges_enabled: false,
      country: bodyData.country || "US",
      stripe_metadata: { created_at: account.created, type: account.type },
    })
    .select("id")
    .single();

  if (insErr) {
    console.error("[create-connect-account] DB insert failed:", insErr);
    return jsonResponse({ error: "Failed to save account" }, 500);
  }

  // Create account onboarding link
  const linkBody = new URLSearchParams();
  linkBody.append("account", account.id);
  linkBody.append("refresh_url", `${req.headers.get("origin") || "https://lianabanyan.com"}/dashboard/payouts?refresh=true`);
  linkBody.append("return_url", `${req.headers.get("origin") || "https://lianabanyan.com"}/dashboard/payouts?onboarding=complete`);
  linkBody.append("type", "account_onboarding");

  const link = await stripePost("/account_links", linkBody);

  return jsonResponse({
    onboarding_url: link.url,
    account_id: row.id,
    stripe_account_id: account.id,
  });
});
```

---

## TASK 3: Edge Function — `connect-account-webhook`

**File**: `supabase/functions/connect-account-webhook/index.ts`

Handles Stripe Connect webhook events: `account.updated`, `payout.paid`, `payout.failed`, `transfer.created`.

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { writeLedgerEntry } from "../_shared/ledgerWriter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── Signature verification (same pattern as lb-card-webhook) ──

function parseStripeSignature(header: string | null): { t: string; v1: string[] } | null {
  if (!header) return null;
  const tMatch = header.match(/(?:^|,)\s*t=(\d+)/);
  const t = tMatch?.[1];
  if (!t) return null;
  const v1: string[] = [];
  for (const m of header.matchAll(/(?:^|,)\s*v1=([^,\s]+)/g)) {
    v1.push(m[1]);
  }
  if (v1.length === 0) return null;
  return { t, v1 };
}

function hexEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function verifyStripeSignature(
  rawBody: string,
  stripeSignatureHeader: string | null,
  secret: string
): Promise<boolean> {
  const parsed = parseStripeSignature(stripeSignatureHeader);
  if (!parsed) return false;

  const nowSec = Math.floor(Date.now() / 1000);
  const ts = parseInt(parsed.t, 10);
  if (Number.isNaN(ts) || Math.abs(nowSec - ts) > 300) {
    console.error("Stripe Connect webhook timestamp outside tolerance");
    return false;
  }

  const signedPayload = `${parsed.t}.${rawBody}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const hex = [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return parsed.v1.some((v) => hexEquals(hex, v));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const webhookSecret = Deno.env.get("STRIPE_CONNECT_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!webhookSecret || !supabaseUrl || !supabaseKey) {
    console.error("Missing STRIPE_CONNECT_WEBHOOK_SECRET, SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY");
    return jsonResponse({ error: "Server misconfigured" }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const rawBody = await req.text();
  const sigHeader = req.headers.get("stripe-signature");

  const okSig = await verifyStripeSignature(rawBody, sigHeader, webhookSecret);
  if (!okSig) {
    return jsonResponse({ error: "Invalid signature" }, 401);
  }

  let event: { id?: string; type?: string; account?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const eventType = event.type;
  const obj = event.data?.object;
  const connectedAccountId = event.account; // For Connect events, this is the connected account ID

  console.log(`[connect-account-webhook] ${eventType}`, { eventId: event.id, connectedAccountId });

  try {
    // ── account.updated ──────────────────────────────
    if (eventType === "account.updated") {
      const acct = obj as Record<string, unknown> | undefined;
      if (!acct) return jsonResponse({ received: true });

      const stripeAccountId = (acct.id as string) || connectedAccountId;
      if (!stripeAccountId) return jsonResponse({ received: true });

      const payoutsEnabled = acct.payouts_enabled as boolean | undefined;
      const chargesEnabled = acct.charges_enabled as boolean | undefined;
      const detailsSubmitted = acct.details_submitted as boolean | undefined;
      const requirements = acct.requirements as { currently_due?: string[]; disabled_reason?: string } | undefined;

      let onboardingStatus: string;
      if (detailsSubmitted && payoutsEnabled) {
        onboardingStatus = "complete";
      } else if (requirements?.disabled_reason) {
        onboardingStatus = "restricted";
      } else {
        onboardingStatus = "pending";
      }

      const { error: updErr } = await supabase
        .from("member_connect_accounts")
        .update({
          onboarding_status: onboardingStatus,
          payouts_enabled: payoutsEnabled ?? false,
          charges_enabled: chargesEnabled ?? false,
          stripe_metadata: {
            details_submitted: detailsSubmitted,
            requirements_due: requirements?.currently_due ?? [],
            disabled_reason: requirements?.disabled_reason ?? null,
            updated_from_event: event.id,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_account_id", stripeAccountId);

      if (updErr) console.error("[connect-account-webhook] account.updated DB error:", updErr);

      // If onboarding just completed, set payout_preference to connect_standard
      if (onboardingStatus === "complete") {
        const { data: connectRow } = await supabase
          .from("member_connect_accounts")
          .select("user_id")
          .eq("stripe_account_id", stripeAccountId)
          .maybeSingle();

        if (connectRow) {
          await supabase
            .from("lb_cardholders")
            .update({ payout_preference: "connect_standard" })
            .eq("user_id", connectRow.user_id);
          console.log("[connect-account-webhook] Set payout_preference to connect_standard for user:", connectRow.user_id);
        }
      }

      return jsonResponse({ received: true });
    }

    // ── payout.paid ──────────────────────────────────
    if (eventType === "payout.paid") {
      const payout = obj as Record<string, unknown> | undefined;
      if (!payout) return jsonResponse({ received: true });

      const stripePayoutId = payout.id as string;
      if (!stripePayoutId) return jsonResponse({ received: true });

      // Update member_payouts row
      const { data: payoutRow, error: updErr } = await supabase
        .from("member_payouts")
        .update({
          status: "paid",
          completed_at: new Date().toISOString(),
        })
        .eq("stripe_payout_id", stripePayoutId)
        .select("id, user_id, amount_cents")
        .maybeSingle();

      if (updErr) console.error("[connect-account-webhook] payout.paid DB error:", updErr);

      // Ledger entry for completed payout
      if (payoutRow) {
        await writeLedgerEntry({
          stripe_event_id: `connect_payout_paid_${event.id}`,
          ledger_category: "connect_payout",
          amount_cents: payoutRow.amount_cents,
          payee_id: payoutRow.user_id,
          is_patronage: false,
          description: `Connect payout completed: ${stripePayoutId}`,
          webhook_source: "connect-account-webhook",
          metadata: { stripe_payout_id: stripePayoutId, status: "paid" },
        });
      }

      return jsonResponse({ received: true });
    }

    // ── payout.failed ────────────────────────────────
    if (eventType === "payout.failed") {
      const payout = obj as Record<string, unknown> | undefined;
      if (!payout) return jsonResponse({ received: true });

      const stripePayoutId = payout.id as string;
      const failureCode = payout.failure_code as string | undefined;
      const failureMessage = payout.failure_message as string | undefined;

      if (!stripePayoutId) return jsonResponse({ received: true });

      // Update payout row with failure
      const { data: payoutRow, error: updErr } = await supabase
        .from("member_payouts")
        .update({
          status: "failed",
          failure_reason: failureMessage || failureCode || "Unknown failure",
          completed_at: new Date().toISOString(),
        })
        .eq("stripe_payout_id", stripePayoutId)
        .select("id, user_id, connect_account_id, amount_cents")
        .maybeSingle();

      if (updErr) console.error("[connect-account-webhook] payout.failed DB error:", updErr);

      // Refund the balance back to the member's card_balance_cents
      if (payoutRow) {
        const { data: ch } = await supabase
          .from("lb_cardholders")
          .select("id, card_balance_cents")
          .eq("user_id", payoutRow.user_id)
          .maybeSingle();

        if (ch) {
          await supabase
            .from("lb_cardholders")
            .update({
              card_balance_cents: (ch.card_balance_cents ?? 0) + payoutRow.amount_cents,
              updated_at: new Date().toISOString(),
            })
            .eq("id", ch.id);
          console.log("[connect-account-webhook] Refunded balance after payout failure:", payoutRow.amount_cents);
        }

        await writeLedgerEntry({
          stripe_event_id: `connect_payout_failed_${event.id}`,
          ledger_category: "connect_payout",
          amount_cents: payoutRow.amount_cents,
          payee_id: payoutRow.user_id,
          is_patronage: false,
          status: "failed",
          description: `Connect payout failed: ${failureMessage || failureCode || "unknown"}`,
          webhook_source: "connect-account-webhook",
          metadata: { stripe_payout_id: stripePayoutId, failure_code: failureCode },
        });
      }

      return jsonResponse({ received: true });
    }

    // ── transfer.created (confirmation of platform→connected transfer) ──
    if (eventType === "transfer.created") {
      const transfer = obj as Record<string, unknown> | undefined;
      const transferId = transfer?.id as string | undefined;
      console.log("[connect-account-webhook] transfer.created:", transferId);
      // No DB action needed — request-payout already recorded the transfer ID
      return jsonResponse({ received: true });
    }

    // Unhandled event type
    console.log("[connect-account-webhook] Unhandled event:", eventType);
    return jsonResponse({ received: true });

  } catch (e) {
    console.error("[connect-account-webhook] Error:", e);
    return jsonResponse({ error: "Internal error" }, 500);
  }
});
```

---

## TASK 4: Edge Function — `request-payout`

**File**: `supabase/functions/request-payout/index.ts`

Member requests a payout from their `card_balance_cents` to their connected Stripe account. Two-step process: Transfer from platform to connected account, then trigger Payout from connected account to their bank/card.

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { writeLedgerEntry } from "../_shared/ledgerWriter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function stripeHeaders(): Record<string, string> {
  const key = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
  return {
    Authorization: `Basic ${btoa(key + ":")}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

async function stripePost(path: string, body: URLSearchParams): Promise<any> {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: "POST",
    headers: stripeHeaders(),
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Stripe ${path} failed`);
  return data;
}

const MIN_PAYOUT_CENTS = 100;        // $1.00 minimum payout
const MAX_PAYOUT_CENTS = 1_000_000;  // $10,000 maximum per payout
const INSTANT_FEE_BPS = 100;         // 1% fee for instant payouts (Stripe charges this)

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

  if (!stripeKey) return jsonResponse({ error: "Server misconfigured" }, 500);

  // Auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return jsonResponse({ error: "Unauthorized" }, 401);

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authErr } = await createClient(
    supabaseUrl,
    Deno.env.get("SUPABASE_ANON_KEY") ?? supabaseKey
  ).auth.getUser(token);

  if (authErr || !user) return jsonResponse({ error: "Unauthorized" }, 401);

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Parse body
  let body: { amount_cents?: number; payout_speed?: string } = {};
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { amount_cents, payout_speed = "standard" } = body;

  if (typeof amount_cents !== "number" || !Number.isInteger(amount_cents)) {
    return jsonResponse({ error: "amount_cents must be an integer" }, 400);
  }
  if (amount_cents < MIN_PAYOUT_CENTS || amount_cents > MAX_PAYOUT_CENTS) {
    return jsonResponse({ error: `amount_cents must be between ${MIN_PAYOUT_CENTS} and ${MAX_PAYOUT_CENTS}` }, 400);
  }
  if (payout_speed !== "standard" && payout_speed !== "instant") {
    return jsonResponse({ error: "payout_speed must be 'standard' or 'instant'" }, 400);
  }

  // Get member's Connect account
  const { data: connectAcct, error: caErr } = await supabase
    .from("member_connect_accounts")
    .select("id, stripe_account_id, onboarding_status, payouts_enabled")
    .eq("user_id", user.id)
    .maybeSingle();

  if (caErr || !connectAcct) {
    return jsonResponse({ error: "No Connect account found. Complete onboarding first." }, 404);
  }
  if (connectAcct.onboarding_status !== "complete" || !connectAcct.payouts_enabled) {
    return jsonResponse({ error: "Connect account onboarding incomplete or payouts disabled" }, 403);
  }

  // Check balance
  const { data: cardholder, error: chErr } = await supabase
    .from("lb_cardholders")
    .select("id, card_balance_cents")
    .eq("user_id", user.id)
    .maybeSingle();

  if (chErr || !cardholder) {
    return jsonResponse({ error: "No cardholder account found" }, 404);
  }

  if ((cardholder.card_balance_cents ?? 0) < amount_cents) {
    return jsonResponse({
      error: "Insufficient balance",
      available: cardholder.card_balance_cents ?? 0,
      requested: amount_cents,
    }, 400);
  }

  // Calculate fee
  const fee_cents = payout_speed === "instant"
    ? Math.ceil(amount_cents * INSTANT_FEE_BPS / 10000)
    : 0;
  const net_amount_cents = amount_cents - fee_cents;

  // Deduct from balance (optimistic lock via eq on current balance)
  const currentBalance = cardholder.card_balance_cents ?? 0;
  const { error: deductErr } = await supabase
    .from("lb_cardholders")
    .update({
      card_balance_cents: currentBalance - amount_cents,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cardholder.id)
    .eq("card_balance_cents", currentBalance);

  if (deductErr) {
    console.error("[request-payout] Balance deduction failed (concurrent modification?):", deductErr);
    return jsonResponse({ error: "Balance update failed. Try again." }, 409);
  }

  // Step 1: Transfer from platform to connected account
  let transfer;
  try {
    const xferBody = new URLSearchParams();
    xferBody.append("amount", String(net_amount_cents));
    xferBody.append("currency", "usd");
    xferBody.append("destination", connectAcct.stripe_account_id);
    xferBody.append("description", `LB payout to member ${user.id}`);
    xferBody.append("metadata[lb_user_id]", user.id);
    xferBody.append("metadata[payout_speed]", payout_speed);

    transfer = await stripePost("/transfers", xferBody);
  } catch (err) {
    // Rollback balance
    console.error("[request-payout] Stripe Transfer failed, rolling back balance:", err);
    await supabase
      .from("lb_cardholders")
      .update({
        card_balance_cents: currentBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cardholder.id);
    return jsonResponse({ error: "Stripe transfer failed. Balance restored." }, 502);
  }

  // Step 2: Trigger payout from connected account to their bank/card
  let payout;
  try {
    const payoutBody = new URLSearchParams();
    payoutBody.append("amount", String(net_amount_cents));
    payoutBody.append("currency", "usd");
    if (payout_speed === "instant") {
      payoutBody.append("method", "instant");
    }
    payoutBody.append("description", "Liana Banyan earnings payout");
    payoutBody.append("metadata[lb_user_id]", user.id);
    payoutBody.append("metadata[transfer_id]", transfer.id);

    // Payout on behalf of the connected account
    const res = await fetch("https://api.stripe.com/v1/payouts", {
      method: "POST",
      headers: {
        ...stripeHeaders(),
        "Stripe-Account": connectAcct.stripe_account_id,
      },
      body: payoutBody,
    });
    payout = await res.json();
    if (!res.ok) throw new Error(payout?.error?.message || "Payout creation failed");
  } catch (err) {
    console.error("[request-payout] Payout creation failed (transfer succeeded):", err);
    // Transfer succeeded but payout didn't — record as processing, webhook will resolve
    payout = { id: null, status: "processing" };
  }

  // Insert payout record
  const { data: payoutRow, error: insErr } = await supabase
    .from("member_payouts")
    .insert({
      user_id: user.id,
      connect_account_id: connectAcct.id,
      amount_cents,
      fee_cents,
      net_amount_cents,
      payout_speed,
      stripe_transfer_id: transfer.id,
      stripe_payout_id: payout.id || null,
      status: payout.id ? "processing" : "pending",
    })
    .select("id, status, amount_cents, fee_cents, net_amount_cents, payout_speed")
    .single();

  if (insErr) {
    console.error("[request-payout] Payout record insert failed:", insErr);
  }

  // Ledger entry for the payout initiation
  await writeLedgerEntry({
    stripe_event_id: `connect_payout_init_${transfer.id}`,
    ledger_category: "connect_payout",
    amount_cents: net_amount_cents,
    payee_id: user.id,
    is_patronage: false,
    description: `Connect payout initiated: ${payout_speed} — $${(net_amount_cents / 100).toFixed(2)}`,
    webhook_source: "request-payout",
    metadata: {
      stripe_transfer_id: transfer.id,
      stripe_payout_id: payout.id,
      payout_speed,
      fee_cents,
    },
  });

  // Ledger entry for fee (if instant)
  if (fee_cents > 0) {
    await writeLedgerEntry({
      stripe_event_id: `connect_payout_fee_${transfer.id}`,
      ledger_category: "connect_payout_fee",
      amount_cents: fee_cents,
      payer_id: user.id,
      is_patronage: false,
      description: `Instant payout fee: $${(fee_cents / 100).toFixed(2)}`,
      webhook_source: "request-payout",
      metadata: { stripe_transfer_id: transfer.id, fee_bps: INSTANT_FEE_BPS },
    });
  }

  return jsonResponse({
    success: true,
    payout: payoutRow,
    stripe_transfer_id: transfer.id,
    stripe_payout_id: payout.id || null,
    new_balance_cents: currentBalance - amount_cents,
  });
});
```

---

## TASK 5: Edge Function — `connect-onboarding-refresh`

**File**: `supabase/functions/connect-onboarding-refresh/index.ts`

Generates a new onboarding link if the member's previous link expired (Stripe account links expire after a few minutes).

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function stripeHeaders(): Record<string, string> {
  const key = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
  return {
    Authorization: `Basic ${btoa(key + ":")}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return jsonResponse({ error: "Unauthorized" }, 401);

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authErr } = await createClient(
    supabaseUrl,
    Deno.env.get("SUPABASE_ANON_KEY") ?? supabaseKey
  ).auth.getUser(token);

  if (authErr || !user) return jsonResponse({ error: "Unauthorized" }, 401);

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Look up Connect account
  const { data: connectAcct } = await supabase
    .from("member_connect_accounts")
    .select("stripe_account_id, onboarding_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!connectAcct || !connectAcct.stripe_account_id) {
    return jsonResponse({ error: "No Connect account found. Start onboarding first." }, 404);
  }

  if (connectAcct.onboarding_status === "complete") {
    return jsonResponse({ error: "Onboarding already complete" }, 409);
  }

  // Generate fresh onboarding link
  const linkBody = new URLSearchParams();
  linkBody.append("account", connectAcct.stripe_account_id);
  linkBody.append("refresh_url", `${req.headers.get("origin") || "https://lianabanyan.com"}/dashboard/payouts?refresh=true`);
  linkBody.append("return_url", `${req.headers.get("origin") || "https://lianabanyan.com"}/dashboard/payouts?onboarding=complete`);
  linkBody.append("type", "account_onboarding");

  const res = await fetch("https://api.stripe.com/v1/account_links", {
    method: "POST",
    headers: stripeHeaders(),
    body: linkBody,
  });
  const link = await res.json();

  if (!res.ok) {
    console.error("[connect-onboarding-refresh] Stripe error:", link);
    return jsonResponse({ error: "Failed to generate onboarding link" }, 502);
  }

  return jsonResponse({ onboarding_url: link.url });
});
```

---

## TASK 6: Frontend — PayoutsPage.tsx

**File**: `src/pages/PayoutsPage.tsx`

New page for managing payout preferences and requesting payouts. Replaces/augments the funding section of LBCardPage with a unified payout experience.

Build this page with the following sections:

### 6A: Payout Preference Selector

```
┌─────────────────────────────────────────────────┐
│ How do you want to get paid?                    │
│                                                 │
│  ┌───────────────────┐  ┌───────────────────┐  │
│  │ 🏦 My Bank/Card   │  │ 💳 LB Card        │  │
│  │ Direct deposit    │  │ Branded debit     │  │
│  │ ✓ CONNECTED       │  │ card              │  │
│  └───────────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────┘
```

- Query `member_connect_accounts` for current user
- Query `lb_cardholders.payout_preference` for current selection
- Radio-card UI: `connect_standard` / `connect_instant` / `lb_card`
- If no Connect account: "Set up direct deposit" button calls `create-connect-account`, opens onboarding URL in new tab
- If Connect pending: show "Complete your setup" with refresh link

### 6B: Cash Out Section

```
┌─────────────────────────────────────────────────┐
│ Available Balance: $142.50                      │
│                                                 │
│ Cash out: [___$50.00___]                        │
│                                                 │
│  ○ Standard (free, 1-2 business days)           │
│  ○ Instant ($0.50 fee, arrives in minutes)      │
│                                                 │
│ [     Cash Out $50.00     ]                     │
└─────────────────────────────────────────────────┘
```

- Input field for amount (validate >= $1.00, <= balance)
- Radio for standard vs instant
- Fee calculation displayed live (1% for instant, $0 for standard)
- Calls `request-payout` edge function
- Disable button while processing
- Show success/error toast

### 6C: Payout History Table

```
┌───────────┬──────────┬─────────┬─────────┬──────────┐
│ Date      │ Amount   │ Fee     │ Speed   │ Status   │
├───────────┼──────────┼─────────┼─────────┼──────────┤
│ Mar 24    │ $50.00   │ $0.50   │ Instant │ Paid ✓   │
│ Mar 20    │ $92.50   │ $0.00   │ Standard│ Paid ✓   │
└───────────┴──────────┴─────────┴─────────┴──────────┘
```

- Query `member_payouts` for current user, order by `created_at DESC`
- Status badges: `paid` = green, `processing` = amber, `failed` = red
- Show `failure_reason` on hover/expand for failed payouts

### 6D: Implementation Details

```tsx
// Use same patterns as LBCardPage.tsx:
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Feature flag check: connect_payouts_enabled
// If disabled, show "Coming Soon" (same pattern as LBCardPage used before K97)

// Page queries:
// 1. Feature flags: founder_feature_flags where feature_key IN ('connect_payouts_enabled', 'lb_card_enabled')
// 2. Connect account: member_connect_accounts where user_id = current user
// 3. Cardholder: lb_cardholders where user_id = current user (for balance + payout_preference)
// 4. Payout history: member_payouts where user_id = current user

// Edge function calls via supabase.functions.invoke():
// - "create-connect-account" → returns { onboarding_url }
// - "connect-onboarding-refresh" → returns { onboarding_url }
// - "request-payout" → body: { amount_cents, payout_speed }

// Payout preference update (direct DB update via supabase client):
// supabase.from("lb_cardholders").update({ payout_preference }).eq("user_id", userId)
// — NOT an edge function call; RLS SELECT policy exists but need INSERT/UPDATE policy
// — Add update policy in migration: "Users update own payout preference"
```

**ADD to migration** (TASK 1 — append to SQL file):
```sql
-- Allow members to update their own payout_preference
CREATE POLICY "Users update own payout preference" ON lb_cardholders
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## TASK 7: Route + Lazy Load

**File**: `src/App.tsx`

Add the PayoutsPage route alongside the existing LB Card and War Chest routes:

```tsx
// Near line 375-376 (after LBCardPage and WarChestPage lazy imports):
const PayoutsPage = lazy(() => import("./pages/PayoutsPage"));

// Near line 876-877 (after /dashboard/lb-card and /dashboard/war-chest routes):
<Route path="/dashboard/payouts" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><PayoutsPage /></Suspense></ProtectedRoute>} />
```

---

## TASK 8: Update fund-lb-card to Respect Payout Preference

**File**: `supabase/functions/fund-lb-card/index.ts`

When earnings are funded to a member, check their `payout_preference`. If set to `connect_instant` or `connect_standard`, auto-trigger a payout instead of accumulating on card balance.

**Add after the existing balance update + funding insert** (around line 136):

```typescript
// After successful funding, check if member prefers Connect payouts
const { data: chFull } = await supabase
  .from("lb_cardholders")
  .select("payout_preference")
  .eq("id", cardholder.id)
  .single();

if (chFull?.payout_preference === "connect_instant" || chFull?.payout_preference === "connect_standard") {
  // Check if member has an active Connect account
  const { data: connectAcct } = await supabase
    .from("member_connect_accounts")
    .select("id, stripe_account_id, payouts_enabled")
    .eq("user_id", user_id)
    .maybeSingle();

  if (connectAcct?.payouts_enabled) {
    console.log("[fund-lb-card] Member prefers Connect payout — auto-payout will be handled by frontend/scheduled job");
    // NOTE: Do NOT auto-trigger payout here in Phase 1.
    // Reason: The member should see their balance first and choose when to cash out.
    // Phase 2: Add optional auto-payout threshold (e.g., auto-cash-out when balance > $50).
    // For now, just log the preference. The balance accumulates and member cashes out manually.
  }
}
```

---

## TASK 9: Update Stats

**File**: `platform/src/hooks/useCanonicalStats.ts`

Innovation count: **1,938** (unchanged — infrastructure session, no new innovations registered)

---

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `supabase/migrations/20260324000002_k98_stripe_connect_payouts.sql` | Connect tables + payout_preference + ledger categories + feature flag |
| `supabase/functions/create-connect-account/index.ts` | Creates Stripe Connect Express account, returns onboarding URL |
| `supabase/functions/connect-account-webhook/index.ts` | Handles account.updated, payout.paid, payout.failed |
| `supabase/functions/request-payout/index.ts` | Member requests payout to their connected bank/card |
| `supabase/functions/connect-onboarding-refresh/index.ts` | Generates fresh onboarding link for expired sessions |
| `src/pages/PayoutsPage.tsx` | Payout preference + cash out + payout history UI |

## FILES TO MODIFY

| File | Change |
|------|--------|
| `supabase/functions/fund-lb-card/index.ts` | Read payout_preference, log auto-payout intent (Phase 1: manual only) |
| `src/App.tsx` | Add PayoutsPage lazy import + `/dashboard/payouts` route |

## DO NOT TOUCH

Membership Stripe (K94) | Transaction Ledger core (K95) | Coalition (K94)
Red Carpet / Slingshot (K93) | ADAPT Score (K92) | Front Door (K91)
Commerce Engine (K80) | Star Chamber (K79/K80) | MoneyPenny (K84)
Calendar (K82) | Beacon (K75/K82) | Treasure Map (K81)
Vehicle files (K85) | Political Expedition (K86) | Design Pipeline (K87)
Ghost World (K88) | Housing (K89) | Congress API (K90)
K96 commerce webhook + project funding | K97 cardProviderAdapter.ts + Issuing refactors
ledgerWriter.ts (read-only import, do not modify) | war-chest-fifo.ts
LBCardPage.tsx (do not modify — payouts get their own page)
lb-card-webhook (Issuing only — do not add Connect events here)

---

## SECURITY REQUIREMENTS

1. **No bank details in DB**: Stripe Connect handles all banking info. We only store `stripe_account_id` and `onboarding_status`
2. **Webhook signature verification**: HMAC-SHA256 with timing-safe comparison (same pattern as `lb-card-webhook`)
3. **Optimistic locking on balance**: `eq("card_balance_cents", currentBalance)` prevents double-spend on concurrent payout requests
4. **Balance rollback on Stripe failure**: If Transfer fails, restore `card_balance_cents` immediately
5. **Balance refund on payout failure**: Webhook handler restores balance when `payout.failed` fires
6. **Minimum payout**: $1.00 — prevents micro-transaction abuse
7. **Maximum payout**: $10,000 per request — requires admin review above this
8. **JWT auth on all member-facing functions**: `create-connect-account`, `request-payout`, `connect-onboarding-refresh`
9. **Feature flag gate**: All Connect functions check `connect_payouts_enabled` flag
10. **Cash domain sealed**: No FK to credit/mark/joule tables. Payouts draw from `card_balance_cents` only
11. **Manual payout schedule**: Connected accounts set to `manual` payout schedule — platform controls when money moves
12. **Idempotency**: Ledger entries use `stripe_event_id` prefix pattern for dedup. Transfer IDs used as idempotency anchors

---

## BUILD ORDER

```
1. Migration (tables + columns + indexes + RLS + ledger categories + feature flag)
2. create-connect-account edge function
3. connect-onboarding-refresh edge function
4. request-payout edge function
5. connect-account-webhook edge function
6. Update fund-lb-card (payout preference awareness)
7. PayoutsPage.tsx (frontend)
8. App.tsx (route + lazy import)
9. Stats (confirm 1,938 unchanged)
```

---

## DEPLOY CHECKLIST

1. **Set new secrets** in Supabase Edge Function secrets:
   ```
   STRIPE_CONNECT_WEBHOOK_SECRET = whsec_... (new — created in Stripe Dashboard → Developers → Webhooks)
   ```
   Configure the Connect webhook endpoint in Stripe Dashboard:
   - URL: `https://ruuxzilgmuwddcofqecc.supabase.co/functions/v1/connect-account-webhook`
   - Events: `account.updated`, `payout.paid`, `payout.failed`, `transfer.created`
   - **Listen to events on Connected accounts** (NOT just your account — this is a Connect-specific setting)

2. Push migration:
   ```
   npx supabase db push --project-ref ruuxzilgmuwddcofqecc
   ```

3. Deploy all new edge functions:
   ```
   npx supabase functions deploy create-connect-account --project-ref ruuxzilgmuwddcofqecc
   npx supabase functions deploy connect-onboarding-refresh --project-ref ruuxzilgmuwddcofqecc
   npx supabase functions deploy request-payout --project-ref ruuxzilgmuwddcofqecc
   npx supabase functions deploy connect-account-webhook --project-ref ruuxzilgmuwddcofqecc
   ```

4. Redeploy modified function:
   ```
   npx supabase functions deploy fund-lb-card --project-ref ruuxzilgmuwddcofqecc
   ```

5. Build frontend:
   ```
   npm run build
   ```
   Zero errors expected.

6. Deploy frontend:
   ```
   firebase deploy --only hosting:main -P default
   ```

7. **After deploy — enable flag**:
   ```sql
   UPDATE founder_feature_flags
   SET is_enabled = true, enabled_at = NOW(),
       notes = 'LIVE — Stripe Connect payouts (K98)'
   WHERE feature_key = 'connect_payouts_enabled';
   ```

---

## TEST CHECKLIST

1. Feature flag OFF → PayoutsPage shows "Coming Soon" 
2. Feature flag ON → PayoutsPage loads with payout preference selector
3. "Set up direct deposit" button → calls `create-connect-account` → returns onboarding URL
4. Open onboarding URL → Stripe hosted Express onboarding flow loads
5. Complete onboarding → `account.updated` webhook fires → `onboarding_status` = `complete`, `payouts_enabled` = `true`
6. Payout preference auto-set to `connect_standard` after onboarding completes
7. Member can toggle between `lb_card`, `connect_standard`, `connect_instant`
8. Cash out $10 standard → Transfer + Payout created in Stripe → `member_payouts` row = `processing`
9. `payout.paid` webhook → status = `paid`, `completed_at` set
10. Cash out $10 instant → fee = $0.10 → net = $9.90 → fee ledger entry created
11. Payout history table shows all payouts with correct status badges
12. Insufficient balance → "Insufficient balance" error, no balance change
13. Concurrent payout attempts → optimistic lock prevents double-spend
14. Simulate `payout.failed` → balance restored, failure_reason logged, status = `failed`
15. Expired onboarding link → "Complete your setup" → `connect-onboarding-refresh` → fresh link
16. Ledger entries: `connect_payout` and `connect_payout_fee` categories appear correctly
17. No duplicate ledger entries on webhook retry (idempotency check)
18. LBCardPage unchanged — no regressions
19. fund-lb-card still works for LB Card path — payout_preference read is additive only
20. Zero console errors

---

## SESSION WEIGHT: MEDIUM-HEAVY

One migration with 2 new tables + column additions + CHECK constraint update. Four new edge functions (2 member-facing, 1 webhook, 1 refresh helper). One new frontend page. Two modified files (fund-lb-card + App.tsx). The Stripe Connect API calls are straightforward — the complexity is in the two-step Transfer→Payout flow and the failure/rollback handling.

---

## STRIPE CONNECT ARCHITECTURE NOTES

### Why Express (not Standard or Custom)?

- **Express** = Stripe-hosted onboarding + dashboard. LB never touches banking data. Stripe handles KYC, 1099 generation, dispute handling.
- **Standard** = member manages their own Stripe account. Too much friction for non-technical members.
- **Custom** = full white-label. Requires LB to handle KYC and compliance. Massive scope, unnecessary.

### Transfer vs Payout

- **Transfer** = platform account → connected account. Moves money within Stripe.
- **Payout** = connected account → member's external bank/card. Moves money out of Stripe.
- Must happen in order: Transfer first, then Payout.
- Instant payouts require the connected account to have a linked debit card (Stripe handles this in onboarding).

### Tax Reporting

- Stripe Connect automatically generates 1099-NEC for members earning > $600/year.
- Platform does NOT need to issue 1099s separately for Connect payouts.
- LB Card (Stripe Issuing) payouts are a different tax treatment — those are card funding, not income payments.

### Fee Structure

- Standard payouts: FREE (Stripe absorbs, takes 1-2 business days)
- Instant payouts: ~1% fee (Stripe charges the connected account, which we pre-calculate and show to member)
- The fee is deducted from the payout amount, not charged separately

---

## FUTURE ENHANCEMENTS (NOT THIS SESSION)

1. **Auto-payout threshold**: Member sets "cash out automatically when balance > $X"
2. **Scheduled payouts**: Weekly/biweekly automatic payouts
3. **Payout splits**: "Send 80% to bank, 20% to LB Card" (savings feature)
4. **Connect dashboard link**: Let members access their Stripe Express dashboard (login links)
5. **Multi-currency**: Support for international members (different countries, currencies)
6. **Payout receipts**: Email notification when payout completes

---

**Two paths to the same money. Bank or card. Instant or standard. The member chooses. The cooperative pays.**

**FOR THE KEEP.**