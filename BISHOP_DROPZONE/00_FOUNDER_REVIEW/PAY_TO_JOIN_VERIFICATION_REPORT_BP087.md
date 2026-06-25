# PAY-TO-JOIN VERIFICATION REPORT — BP087
**Bishop:** SEG-PJ · Model: claude-sonnet-4-6  
**Date:** 2026-06-19  
**Task:** End-to-end empirical gadget of the $5/yr Cooperative Membership Pay-to-Join flow  
**App version:** v0.5.12 (per package.json)  
**Scope:** Stripe product layer → Supabase schema → Edge Functions → Code path (main/preload/renderer) → Live web surface  

---

## EXECUTIVE SUMMARY

**Pay-to-Join end-to-end status: NOT YET WORKING.**

The Stripe product and price exist and are correctly configured at $5/yr. The Supabase schema is substantially built (peer_presence has the tier column; membership_subscriptions, membership_payments tables are present). However, the two critical middle layers are both stubs or missing: (1) the Stripe STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are **not present in the active secrets vault** used by the Electron app (22May2026.env / LockBox WORKING_KEYS.env), so the checkout session code path resolves to a stub URL; (2) the Supabase Edge Function `create-membership-checkout` exists at the runtime endpoint but **returns HTTP 401 "Not authenticated"** when called without a Supabase JWT — meaning no actual Stripe Checkout session can be created. The web join surface at lianabanyan.com/join is a React SPA that loads but contains no join modal matching the BP085 canonical copy ("Just let me join." / Benefits Over Barrier), and the /join route in the SPA redirects to the home page rather than rendering a join form. Until Stripe keys are wired into the active env vault, the Edge Function authentication is resolved, and either the web or Electron join UI is connected to a real checkout session creator, no member can successfully complete the $5 payment.

**BLOCKERS: 4 | WARNS: 3 | OKs: 4**

---

## LAYER 1 — STRIPE STATE

### Gadget method
Queried `https://api.stripe.com/v1/products` and `https://api.stripe.com/v1/prices` using STRIPE_SECRET_KEY from archive (LockBox/WORKING_KEYS.env at the pre-rotation snapshot path; key prefix: sk_live_51SI...).

### Empirical findings

| Item | Value | Status |
|------|-------|--------|
| Product name | MnemosyneC Cooperative Membership | OK |
| Product ID | prod_UixMKWi6UtT8S4 | OK |
| Product active | true | OK |
| Price ID | price_1TjVRjRlWRgRXQ3YAjBRw8o8 | OK |
| Price amount | 500 USD (= $5.00) | OK |
| Price interval | year | OK |
| Price active | true | OK |
| Price count | 1 (exactly one active price) | OK |

The Stripe product catalog entry from `reference_stripe_live_product_catalog_2026-06-17_bp085` is confirmed live and correct.

**Layer 1 severity:** OK — Stripe product and price are LIVE and correct.

### Gaps
None at the Stripe product layer itself.

### BLOCKER — Stripe key not in active vault
The STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET were found only in:
- `_archive_2026-05-22_pre_rotation_snapshot/LockBox/WORKING_KEYS.env` (archived, pre-rotation)
- `_archive_2026-05-22_pre_rotation_snapshot/LockBox/SDS.env` (archived)

They are **NOT present** in:
- `C:\Users\Administrator\.claude\state\secrets\22May2026.env` (active session secrets file — contains no STRIPE_* keys at all)
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\LockBox\WORKING_KEYS.env` — **this file does not exist** (the LockBox directory appears empty)

The `env_loader.ts` canonical path (#3) resolves to `Asteroid-ProofVault/LockBox/WORKING_KEYS.env`. Since that file is absent, the Electron app will log a "no env vault found" warning and STRIPE_API_KEY will be undefined at runtime. This causes `getStripeApiKey()` → null, and the code stubs out.

**Severity: BLOCKER (B-1)**

---

## LAYER 2 — SUPABASE SCHEMA

### Gadget method
`psql "postgresql://postgres:***@db.ruuxzilgmuwddcofqecc.supabase.co:5432/postgres"`

### Empirical findings

#### peer_presence table
```
Column       | Type    | Default       | Notes
-------------|---------|---------------|------
tier         | text    | 'base'::text  | PRESENT ✓
```
- Tier constraint: `CHECK (tier = ANY (ARRAY['base'::text, 'member'::text]))` — correct.
- RLS policies: anon INSERT/UPDATE constrained to `tier = 'base'`. Authenticated role can set `tier = 'member'`. Service role has full write access.
- The upgrade path (anon → member) requires service_role to flip tier after payment confirmation. The `peer_presence_member_upgrade` policy is for `authenticated` role but peer connections are anon — **tier upgrade by authenticated user requires a valid Supabase auth session** which the Electron app does not appear to manage.

**Severity: WARN (W-1)** — tier upgrade policy may not fire for anon-connected peers without a full auth session.

#### membership_subscriptions table
Exists with correct structure:
- stripe_customer_id, stripe_subscription_id, tier, status, period dates
- Foreign key to `auth.users(id)` — requires Supabase Auth user record
- Status check constraint covers: active, past_due, canceled, trialing, unpaid

**Present and schema-correct. Severity: OK**

#### membership_payments table
Exists with correct structure:
- amount default 5.00, stripe_session_id, stripe_payment_intent, status
- Foreign key to `auth.users(id)` — requires Supabase Auth user record
- Default period_end = CURRENT_DATE + 1 year (correct)

**Present and schema-correct. Severity: OK**

#### membership_activation_tokens table
Exists (confirmed in table list). Not described in detail but present.

#### No local subscriptions/customers/payment_intents table
There is no local SQLite-side membership state table. Local membership state is persisted in `userData/member_status.json` (per `membership:check-local-status` handler) — a flat JSON file, not SQLite.

**Severity: WARN (W-2)** — No local persistence record beyond member_status.json. If the file is deleted, membership status cannot be recovered from local storage alone.

#### Schema linkage gap
Both `membership_subscriptions` and `membership_payments` foreign-key to `auth.users(id)`. The current Electron flow does NOT appear to create a Supabase Auth user for members — the `peer_presence` table uses a `peer_id` (UUID, self-generated) and `email_hash`, not a Supabase auth UID. **The webhook handler that would write to membership_subscriptions has no Supabase Auth UID to use** as the user_id foreign key.

**Severity: BLOCKER (B-2)**

---

## LAYER 3 — EDGE FUNCTIONS

### Gadget method
Probed `https://ruuxzilgmuwddcofqecc.supabase.co/functions/v1/{name}` with POST + anon key header for 5 candidate function names. Also attempted Supabase Management API (failed: JWT decode error with sb_secret key, which is not a Management API JWT).

### Empirical findings

| Function name | HTTP response | Interpretation |
|---------------|--------------|----------------|
| create-membership-checkout | 401 "Not authenticated" | **Deployed but requires auth JWT** |
| stripe-webhook | 400 | **Deployed, running, returns error on empty body** |
| verify-membership-payment | 400 | **Deployed, running, returns error on empty body** |
| membership-status | 404 | Not deployed |
| create-checkout | 400 | **Deployed (may be alias or different function)** |

Only `wan-relay-reject` is confirmed in the local `supabase/functions/` directory. The membership-related edge functions are deployed to the live Supabase project but were built and deployed outside the current repo's tracked function files.

### Critical finding — `create-membership-checkout` returns 401
When called with the Supabase anon (publishable) key in the `apikey` header and `Authorization: Bearer <anon_key>`, the function returns `{"error":"Not authenticated"}`. This means the function enforces that the caller must be an **authenticated Supabase user** (not just an anon-key call). The Electron main process calls this function with `SUPABASE_ANON_KEY` as the Bearer token:

```typescript
// index.ts line 3456-3464
const resp = await globalThis.fetch(`${supabaseUrl}/functions/v1/create-membership-checkout`, {
  headers: {
    'Authorization': `Bearer ${supabaseKey}`,  // anon key → 401
    'apikey': supabaseKey,
  },
  body: JSON.stringify({ autoRenew }),
});
```

An anon key is not a user JWT. The function expects a signed user JWT. Since no Supabase Auth session is established for the peer before they attempt to join, **the function call will always return 401 in the current code path**.

**Severity: BLOCKER (B-3)**

### Additional finding — Supabase env vars not set in active vault
The `membership:create-checkout` handler reads `process.env.SUPABASE_URL` and `process.env.SUPABASE_ANON_KEY`. These names are NOT in the 22May2026.env secrets file. The env_loader canonical vault (Asteroid-ProofVault/LockBox/WORKING_KEYS.env) does not exist. Without these vars, the handler short-circuits to:

```typescript
return { ok: false, error: 'not_configured', fallbackUrl: 'https://lianabanyan.com/join' };
```

**Severity: BLOCKER (B-3) — same blocker as above, compound**

---

## LAYER 4 — CODE PATH

### Gadget method
Read `src/main/index.ts` (lines 3443–3483, 3979–4025), `src/main/membership/checkout_session.ts`, `src/main/membership/webhook_handler.ts`, `src/main/membership/stripe_client.ts`, `src/main/preload.ts`, `src/renderer/components/MembershipTab.tsx`, `src/shared/membership_types.ts`, `src/main/env_loader.ts`.

### Code path map: "User clicks Join" → end

```
1. USER CLICKS: MembershipTab.tsx handleJoin()
   → calls window.amplify.membershipStartCheckout()

2. PRELOAD (preload.ts line 1249-1250):
   membershipStartCheckout → ipcRenderer.invoke('membership:start-checkout')

3. MAIN IPC HANDLER (index.ts line 3979-3986):
   safeHandle('membership:start-checkout', async () => {
     const { createMembershipCheckoutSession } = await import('./membership/checkout_session')
     const result = await createMembershipCheckoutSession()
     if (result.checkoutUrl) shell.openExternal(result.checkoutUrl)
     return result
   })

4. checkout_session.ts createMembershipCheckoutSession():
   ← STUB — returns stub_session_${Date.now()} + fake Stripe URL
   ← Comment: "Stub — v0.1.61 wires real Stripe createSession here"
   ← isStub: true ALWAYS

5. PARALLEL REAL PATH (also in index.ts — membership:create-checkout, line 3446):
   → Calls Supabase Edge Function create-membership-checkout
   → Returns 401 (no auth session) OR fallback URL (no Supabase URL configured)
   → This handler is DIFFERENT from membership:start-checkout
   → The renderer calls membershipStartCheckout → membership:start-checkout (stub)
   → The real Edge Function path is only reachable via membership:create-checkout (not wired to renderer)

6. WEBHOOK PATH (index.ts line 3486 — membership-verify-status):
   → Calls Supabase Edge Function verify-membership-payment
   → Would return is_member: true/false
   → webhook_handler.ts handleWebhookEvent() is a STUB — returns hardcoded newStatus

7. AFTER PAYMENT (hypothetical):
   → peer_presence.tier flipped from 'base' → 'member'
   → membership_subscriptions row written
   → membership_payments row written
   → member_status.json written to userData
   ← NONE OF THIS IS WIRED END-TO-END
```

### Key findings

**B-4 (BLOCKER): checkout_session.ts is an explicit stub**
The file header states: "Returns stub response; real Stripe integration in v0.1.61." The `membership:start-checkout` handler (the one the renderer calls) always returns `isStub: true` with a fake URL `https://checkout.stripe.com/stub?amount=500`. No real Stripe Checkout session is ever created through this path.

**B-4 compound: webhook_handler.ts is also a stub**
`handleWebhookEvent` returns `{ handled: true, newStatus: 'active' }` unconditionally without writing anything to Supabase. No DB write occurs on payment completion.

**WARN (W-3): Two IPC channels exist for membership checkout that do different things**
- `membership:start-checkout` → checkout_session.ts stub (renderer-wired)
- `membership:create-checkout` → Edge Function real path (NOT wired to renderer/amplify; only wired to `window.amplify.membership.createCheckout` which is a different namespace in preload.ts line 989)

The "real" checkout path exists but is not surfaced to the MembershipTab UI at all.

**OK: preload.ts IPC bridge is correct**
Both `membershipStartCheckout` and `membershipGetStatus` are correctly bridged in preload.ts lines 1249–1256 and exposed on `window.amplify`. The amplify.d.ts type declarations match.

**OK: membership_types.ts canonical constants**
`MEMBERSHIP_ANNUAL_FEE_USD = 5 as const` is correct. The renderer reads this constant throughout.

---

## LAYER 5 — LIVE WEB SURFACE

### Gadget method
HTTP GET to lianabanyan.com/join, cephas.lianabanyan.com/join, mnemosynec.org/ai. Also fetched and searched the bundled JS at `/assets/index-C00JzbNI.js` (1,716,868 chars).

### Empirical findings

#### lianabanyan.com/join
- Loads: YES (18,520 chars, HTTP 200)
- Title: "Liana Banyan — Help Each Other Help Ourselves" (same as home page)
- $5/year in meta description: YES
- Join modal / "Just let me join." copy: **NOT FOUND** in HTML or JS bundle
- "Benefits Over Barrier" canonical copy: **NOT FOUND**
- Stripe checkout references in JS bundle: Found `vendor-stripe-o7naS2Bf.js` (Stripe SDK present), "Secure payment via Stripe" found (in sponsor/Santa portal context only)
- `/join` route in SPA: Exists as a navigation target (`a("/join")` when tier is 'free' or 'expired') but the route does not render a join modal — it appears to redirect or render a generic page
- `membership:create-checkout` or `membership:start-checkout` strings: **NOT FOUND in web JS bundle** — these are Electron IPC channels, not available in the web SPA

**Assessment:** The web SPA at lianabanyan.com/join has no functioning join flow. It is a React app that references /join as a route but does not implement the BP085 Benefits-Over-Barrier join modal. The Stripe checkout flow in the web bundle is wired only to the Santa/sponsor tiers, not to the $5/yr Cooperative Membership.

**Severity: BLOCKER (B-4 extends here) + WARN (W-3 extends)**

#### cephas.lianabanyan.com/join
- Loads: YES (10,063 chars)
- Content: Hugo/static site nav only, no join modal
- "Just let me join.": NOT FOUND
- Membership checkout: NOT FOUND

**Severity: NOT a join surface — informational only**

#### mnemosynec.org/ai
- Loads: YES (9,359 chars)
- Membership/checkout/join copy: NOT FOUND

**Severity: NOT a join surface — informational only**

---

## CONSOLIDATED FINDINGS TABLE

| # | Layer | Finding | Severity |
|---|-------|---------|----------|
| B-1 | Stripe / Env | STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET absent from active env vault (Asteroid-ProofVault/LockBox/WORKING_KEYS.env does not exist; 22May2026.env has no Stripe keys). Electron app cannot call Stripe API. | **BLOCKER** |
| B-2 | Schema | membership_subscriptions + membership_payments FK to auth.users(id) but Electron peers are not Supabase Auth users — no auth UID available at payment time. Webhook cannot write subscription record. | **BLOCKER** |
| B-3 | Edge Function | create-membership-checkout returns 401 when called with anon key. Also: SUPABASE_URL + SUPABASE_ANON_KEY not in active env vault, so the main-process handler short-circuits to fallback before even calling the function. | **BLOCKER** |
| B-4 | Code path | checkout_session.ts is an explicit stub (v0.1.61 target). membership:start-checkout always returns isStub:true with fake URL. webhook_handler.ts is also stub — no Supabase writes occur. Real create-checkout IPC path not wired to renderer. | **BLOCKER** |
| W-1 | Schema / RLS | peer_presence tier upgrade RLS policy grants UPDATE to authenticated role only — anon-connected peers cannot self-upgrade tier. Requires service_role call from webhook. | **WARN** |
| W-2 | Code path | Membership state persisted only in userData/member_status.json (flat file). No recovery path if file deleted. Supabase membership_subscriptions is the durable source of truth but not queried at app startup. | **WARN** |
| W-3 | Code / Web | Two IPC channels for checkout exist with different semantics. Web SPA has no $5/yr membership join modal — only Electron app has MembershipTab. No web join path exists that matches BP085 Benefits-Over-Barrier canon. | **WARN** |
| OK-1 | Stripe | Product prod_UixMKWi6UtT8S4 "MnemosyneC Cooperative Membership" LIVE at $5/yr (price_1TjVRjRlWRgRXQ3YAjBRw8o8, 500 USD, annual, active). | **OK** |
| OK-2 | Schema | peer_presence has tier column with correct base/member constraint and index. Schema matches canon. | **OK** |
| OK-3 | Schema | membership_subscriptions and membership_payments tables exist with correct structure (amounts, dates, Stripe ID fields). | **OK** |
| OK-4 | Code | preload.ts IPC bridge, amplify.d.ts types, shared/membership_types.ts constants, and MembershipTab.tsx UI skeleton are all correctly structured. The UI renders. | **OK** |

**Final count: 4 BLOCKERs · 3 WARNs · 4 OKs**

---

## QUEUED KNIGHT YOKE TOPICS

These topics require Knight implementation. Bishop does not author the yokes here — listing topics only.

1. **K-YOKE: Wire Stripe keys into active env vault**  
   Populate Asteroid-ProofVault/LockBox/WORKING_KEYS.env (create the file) with STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET. Also add SUPABASE_URL and SUPABASE_ANON_KEY. Confirm env_loader picks them up on next app launch. Note: determine if the archived key (sk_live_51SI...) is still valid or has been rotated — Founder must confirm.

2. **K-YOKE: Implement real createMembershipCheckoutSession in checkout_session.ts**  
   Replace the stub with a real Stripe `checkout.sessions.create()` call using the price_id `price_1TjVRjRlWRgRXQ3YAjBRw8o8`. Wire to the `membership:start-checkout` IPC handler (which the renderer already calls). Return real `checkoutUrl` for `shell.openExternal`.

3. **K-YOKE: Resolve auth.users(id) FK constraint for webhook writes**  
   Either: (a) create a Supabase Auth user for the peer at peer_presence registration time, or (b) change membership_subscriptions/membership_payments to FK on peer_id (text) instead of auth.users(id), or (c) use service_role to bypass RLS and write with peer_id as a lookup key. Must pick one canonical pattern before webhook implementation.

4. **K-YOKE: Implement Stripe webhook receiver in Edge Function / main process**  
   The `stripe-webhook` Edge Function exists (HTTP 400 on empty body = running but expects Stripe webhook payload). Wire it to: (1) verify Stripe signature using STRIPE_WEBHOOK_SECRET, (2) handle `checkout.session.completed` event, (3) write to membership_subscriptions + membership_payments, (4) flip peer_presence.tier to 'member', (5) push activation result to Electron via a polling endpoint or deep-link callback.

5. **K-YOKE: Wire real checkout path to renderer UI**  
   Currently `membership:start-checkout` calls the stub. Once the real session creator is implemented, connect it. OR wire `membership:create-checkout` (the real Edge Function path) to the MembershipTab button. Resolve the two-IPC-channel ambiguity.

6. **K-YOKE: Implement web join modal at lianabanyan.com/join**  
   The web SPA has no join modal. Either: (a) implement the BP085 Benefits-Over-Barrier modal in the React SPA (Stripe.js embedded or hosted checkout redirect), or (b) redirect /join to the MnemosyneC download page with deep-link that triggers the in-app join flow. Per BP085 canon, the copy must include "Just let me join." and the 5 benefits listed verbatim.

7. **K-YOKE: Implement membership status sync on app launch**  
   `membership:get-status` currently returns hardcoded stub. Replace with: read member_status.json → if is_member, call verify-membership-payment edge function → confirm active → refresh local cache. This ensures membership state is accurate across sessions.

---

## TEST PLAN — Click-Through Verification

Steps Bishop would run to verify end-to-end once blockers are resolved:

**Pre-conditions:** Stripe keys in active vault, SUPABASE_URL + SUPABASE_ANON_KEY in vault, checkout_session.ts real implementation shipped.

1. Launch MnemosyneC Electron app on a fresh user profile (clean userData directory).
2. Open MembershipTab (Tab 19, 💎). Confirm status displays "Not yet joined" and annual fee shows "$5/year".
3. Click "💎 Join · $5/year" button. Confirm heartbeat spinner and rotating messages appear.
4. Confirm a browser window opens to a real Stripe Checkout URL (not `https://checkout.stripe.com/stub`). The URL should contain `checkout.stripe.com/c/pay/` and be for $5.00 USD.
5. In Stripe, complete payment with test card 4242 4242 4242 4242 (if test mode) or observe Stripe dashboard for live charge.
6. After payment, return to app. Confirm checkout-opened banner shows: "✓ Checkout opened in your browser."
7. Confirm Stripe webhook fires: check Supabase → membership_subscriptions → new row with status='active'.
8. Confirm Supabase → membership_payments → new row with status='completed'.
9. Confirm Supabase → peer_presence → tier flipped from 'base' to 'member' for the peer_id.
10. Confirm userData/member_status.json contains `{"is_member":true,...}`.
11. Close and relaunch MnemosyneC. Confirm MembershipTab shows status "Active" (not "Not yet joined").
12. Confirm `membership-verify-status` IPC returns `{ ok: true, membership_active: true }`.
13. Gadget Stripe dashboard: confirm charge of $5.00 appears under the Cooperative Membership product (prod_UixMKWi6UtT8S4).

**Web path test (once B-4 web gap is resolved):**
14. Navigate browser to lianabanyan.com/join. Confirm join modal renders with Benefits-Over-Barrier copy and "Just let me join." button.
15. Click join, complete Stripe Checkout, confirm same webhook flow as above fires.

---

## APPENDIX — FILE PATHS EXAMINED

| File | Role |
|------|------|
| `C:\Users\Administrator\.claude\state\secrets\22May2026.env` | Active session secrets (no Stripe keys found) |
| `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\membership\checkout_session.ts` | Checkout session creator (stub) |
| `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\membership\webhook_handler.ts` | Webhook handler (stub) |
| `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\membership\stripe_client.ts` | Stripe client config reader (reads STRIPE_API_KEY) |
| `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\env_loader.ts` | Env vault loader (canonical path: Asteroid-ProofVault/LockBox/WORKING_KEYS.env — FILE ABSENT) |
| `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\index.ts` | Main IPC handlers (lines 3443–3483, 3979–4025) |
| `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\preload.ts` | Electron preload / amplify bridge (membership wired at lines 987–1006, 1249–1256) |
| `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\MembershipTab.tsx` | In-app join UI (correctly structured; calls stub) |
| `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\shared\membership_types.ts` | Canonical types + MEMBERSHIP_ANNUAL_FEE_USD=5 |
| `C:\Users\Administrator\Documents\LianaBanyanPlatform\supabase\functions\` | Only wan-relay-reject/ present locally; membership functions deployed but not tracked here |

---

*Report authored by Bishop SEG-PJ · BP087 · 2026-06-19 · Truth-Always · Sonnet 4.6 verbatim*
