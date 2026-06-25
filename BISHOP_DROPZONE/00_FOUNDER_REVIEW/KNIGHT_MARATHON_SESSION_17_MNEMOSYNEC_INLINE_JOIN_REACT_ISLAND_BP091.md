# Knight Marathon Session 17 — Mnemosynec.org Inline $5 Join React Island
## BP091 · 2026-06-22 · **FOUNDER RATIFIED 2026-06-22 · CLEARED TO EXECUTE**

**R1-R5 all RATIFIED Founder-direct BP091 2026-06-22:**
- R1 scope match ✅ · R2 M11 Block 5 superseded ✅ · R3 anonymous-friendly edge fn ✅
- R4 Stripe URLs move to mnemosynec.org ✅ · R5 M11 Blocks 2+3 fire in parallel ✅

**Model:** Sonnet 4.6 (Knight execution). Bishop strategist composed.

---

## FOUNDER DIRECT (verbatim · BP091 2026-06-22)

> *"First, we make the Mnemosynec site work correctly. You should have to click through the two option license to install it (part of the installation) and you should be able to seamlessly pay the $5 to join. No switching to another site, use the react ON THAT PAGE for Mnemosynec so that it's all right there. That is step 1. Let's do it."*

---

## SCOPE LINE

The two-option license click-through is already specified in **Marathon 11 Blocks 2+3** (installer NSIS + Hugo download modal). M11 is RATIFIED through point #10 (Two-Axis) per its header; if Knight wakes and finds M11 ready to fire, fire it as composed.

**This Marathon 17 covers ONLY what M11 Block 5 must become:** an inline `$5/year` Stripe Checkout flow rendered as a React island on `https://mnemosynec.org/join/`, with NO redirect to lianabanyan.com. Same Supabase backend, same Stripe price, same edge functions — different mount point + different success/cancel URLs + new CORS origin.

M11 Block 5 (which currently spec'd a CTA pointing to `lianabanyan.com/join`) is **SUPERSEDED** by this Marathon 17. When Knight executes both, do Block 5 = M17, skip the old Block 5.

---

## EMPIRICAL STATE (gadget-confirmed by Bishop 2026-06-22 before this dispatch)

| Surface | State |
|---|---|
| `membership_payments` Supabase table | **0 rows** (REST count) — pre-revenue confirmed |
| `member_profiles` Supabase table | **0 rows** (REST count) — pre-revenue confirmed |
| Edge fn `create-membership-checkout` | LIVE (HTTP 200 OPTIONS) |
| Edge fn `handle-membership-webhook` | LIVE (HTTP 405 on OPTIONS = exists, POST-only as expected) |
| Stripe live publishable key | Present in `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\.env` line 14 (`VITE_STRIPE_PUBLISHABLE_KEY`, last 6: `...1QcR`) |
| Stripe membership price | `price_1SIXWsDMOngHJB3UxKPFmXZE` hardcoded in `create-membership-checkout/index.ts:103` |
| Supabase URL | `https://ruuxzilgmuwddcofqecc.supabase.co` |
| Supabase anon key | `eyJhbGciOi...b5cLd8_PphlA-MM0zAhe0-Qj5b4GbqReO6cT8tA0ngk` (in `platform/.env` + `platform/src/integrations/supabase/client.ts`) |
| Hugo config placeholders | `config-mnemosynec.toml` has `stripePk = "pk_live_FOUNDER_SET_IN_CONFIG"` + `supabaseAnonKey = "FOUNDER_SET_SUPABASE_ANON_KEY"` — must be replaced with real values |
| React source for join | `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\pages\MembershipGate.tsx` (138 lines) + `MembershipStakePayment.tsx` (token-from-localStorage pattern) |
| Hugo `/join/` content | DOES NOT EXIST — `content-mnemosynec/join/` has only `success/` subdir; current homepage CTA `/join/` is 404 |
| Existing React on Hugo site | NONE — no `<script type="module">`, no ESM, no microfrontend |

---

## OBJECTIVE

A new user lands on `https://mnemosynec.org/join/` → sees the $5/year Benefits-Over-Barrier card → enters email + clicks "Join for $5" → Stripe Checkout opens (hosted, redirect — same as today on lianabanyan.com) → on completion Stripe redirects back to `https://mnemosynec.org/join/success/` → webhook fires → `member_profiles` + `membership_payments` rows written → user is a member. **At no point does the URL bar leave `mnemosynec.org`** (Stripe Checkout's stripe.com domain is the exception — that's the hosted checkout, identical to today's lianabanyan flow, NOT a site-switch back to the cooperative).

This produces the **first empirical row** in `membership_payments` and the **first empirical row** in `member_profiles.membership_status='active'`. Bishop watches Supabase in real-time during Founder's incognito test.

---

## BLOCK 1 — Bundle the React Island (Vite library mode)

Source repo: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform`

1. Create new package directory `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\packages\mnemo-join-island\` (or as a Vite library entry inside the main repo — Knight chooses cleanest).
2. Entry file `src/mnemo-join.tsx`:
   - Imports `MembershipGate` logic (the Stripe-checkout-initiator portion) from `src/pages/MembershipGate.tsx`.
   - Uses the **token-from-localStorage pattern** demonstrated in `MembershipStakePayment.tsx` — NO `AuthContext`, NO `react-router-dom`.
   - Anonymous-friendly: if no Supabase session exists, the island calls the edge fn with `apikey` only (anon Supabase) and the edge fn creates a guest checkout session keyed by email. (Edge fn change scoped in Block 4 below.)
   - Self-mounts: looks for `<div id="mnemo-join-root">` at DOMContentLoaded and renders into it. Supports optional `data-*` attributes on the mount div for `successUrl` / `cancelUrl` / `priceId` overrides.
   - Self-styles: bundles its own Tailwind output (`@tailwind base/components/utilities` → `dist/mnemo-join.css`) — scoped to a CSS class so it does not bleed onto Hugo styles.
3. `vite.config.ts` library-mode build:
   ```ts
   build: {
     lib: {
       entry: 'src/mnemo-join.tsx',
       formats: ['es'],
       fileName: 'mnemo-join'
     },
     outDir: 'dist-island',
     rollupOptions: { /* keep react + react-dom bundled — Hugo site has neither */ }
   }
   ```
4. Output: two files, hashed for cache-busting:
   - `dist-island/mnemo-join.[hash].js` (single ESM bundle, react+react-dom inlined, gzip target <90KB)
   - `dist-island/mnemo-join.[hash].css`
5. Copy both files to `cephas-hugo/static/js/` and `cephas-hugo/static/css/` (Hugo serves `/static/` as web root).
6. Emit a sidecar `dist-island/manifest.json` with the hashed filenames so Hugo template can `getJSON` it at build time.

**Acceptance:** `curl -I https://mnemosynec.org/js/mnemo-join.<hash>.js` returns 200 with `content-type: application/javascript` and `cache-control: public, max-age=31536000`.

---

## BLOCK 2 — Hugo /join/ page

1. Create `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\content-mnemosynec\join\_index.md`:
   ```yaml
   ---
   title: "Join the Cooperative · $5/year"
   description: "One step. Five dollars. A real cooperative."
   layout: "join"
   ---
   ```
2. Create layout `cephas-hugo\layouts\join\single.html` (or `list.html` matching the content type):
   - Reads `dist-island/manifest.json` via Hugo `resources.GetRemote` or local `readFile` for hashed filenames.
   - Renders:
     ```html
     <link rel="stylesheet" href="/css/mnemo-join.{{ .hash }}.css">
     <main class="mnemo-join-host">
       <div id="mnemo-join-root"
            data-success-url="https://mnemosynec.org/join/success/"
            data-cancel-url="https://mnemosynec.org/join/"
            data-price-id="price_1SIXWsDMOngHJB3UxKPFmXZE"></div>
     </main>
     <script type="module" src="/js/mnemo-join.{{ .hash }}.js"></script>
     ```
3. Verify `/join/success/` already has content (it has a directory per gadget; create a minimal "Welcome — check your inbox" page if empty).

**Acceptance:** `https://mnemosynec.org/join/` returns 200, renders the React island, browser console clean, no CSS leak onto Hugo nav.

---

## BLOCK 3 — Hugo config: real keys

Edit `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\config-mnemosynec.toml`:

```toml
[params]
  stripePk = "<paste from platform/.env VITE_STRIPE_PUBLISHABLE_KEY>"
  supabaseUrl = "https://ruuxzilgmuwddcofqecc.supabase.co"
  supabaseAnonKey = "<paste from platform/.env VITE_SUPABASE_ANON_KEY>"
```

The island bundle reads these at build time via Hugo template injection into a `<script>window.__MNEMO_ENV__={...}</script>` block ABOVE the island script tag. **DO NOT** bake keys into the .js bundle — they're public anyway but config drift between Vite build and Hugo build will surface as silent prod breaks.

**Acceptance:** `view-source:https://mnemosynec.org/join/` shows `window.__MNEMO_ENV__` with the real `pk_live_...` and real Supabase anon key (no `FOUNDER_SET_*` placeholders).

---

## BLOCK 4 — Edge function: CORS + anonymous-friendly checkout

File: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\functions\create-membership-checkout\index.ts`

Two changes:

(a) **CORS:** Add `https://mnemosynec.org` and `https://mnemosynec.ai` to the allowed origins list. Current allowlist likely has `lianabanyan.com` only — verify by Read. Add the two new origins; do NOT use `*` (Stripe webhooks don't need browser CORS; this is for the island's `fetch`).

(b) **Anonymous-friendly:** today the function requires a Bearer token (Supabase session). For mnemosynec.org first-touch, the user has no auth. Add a code path: if `Authorization` header is absent OR Bearer token has no associated `member_profile`, accept a `{email, introducer_user_id?}` POST body and create a Stripe Checkout session with `customer_email` set. On `checkout.session.completed`, the webhook (which already exists) must:
   1. If `member_profiles` row for that email exists → update.
   2. If not → INSERT a new `member_profiles` row keyed by email, generate a user record via `auth.admin.createUser({email, email_confirm: true})` Supabase Admin call so the user can later sign in via magic link.

Webhook file: `platform\supabase\functions\handle-membership-webhook\index.ts` — extend the `checkout.session.completed` handler to support the email-only-no-prior-auth path described above.

Deploy via Supabase CLI: `supabase functions deploy create-membership-checkout` + `supabase functions deploy handle-membership-webhook`.

**Acceptance:**
- Empirical curl OPTIONS preflight from origin `https://mnemosynec.org` returns `Access-Control-Allow-Origin: https://mnemosynec.org` header.
- Empirical POST with only `{email: "smoke@example.com"}` (no Bearer) returns `{url: "https://checkout.stripe.com/..."}` with HTTP 200.

---

## BLOCK 5 — Build & deploy mnemosynec.org

1. `cd C:\Users\Administrator\Documents\LianaBanyanPlatform\platform && npm run build:island` (new script Knight adds: `vite build --config vite.config.island.ts`).
2. Copy `dist-island/*` into `Cephas\cephas-hugo\static\js\` + `static\css\` per Block 1 step 5.
3. `cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo && hugo --config config-mnemosynec.toml --minify`.
4. `firebase deploy --only hosting:mnemosyne` (target `mnemosyne` → site `mnemosyne-lianabanyan` per `.firebaserc` + `firebase.json`).
5. Wait for deploy receipt URL, verify HTTP 200 on `https://mnemosynec.org/join/`.

**Acceptance:** Knight's KniPr return MUST include:
- The deployed `/join/` URL (verified live)
- A curl smoke test of the edge function from a real `Origin: https://mnemosynec.org` header
- A Stripe Checkout session URL created via the smoke test (truncated for safety)
- Hash of the deployed JS bundle (to confirm it's the new build, not cache)

---

## BLOCK 6 — Bishop-side end-to-end empirical smoke (BISHOP executes, not Knight)

After Knight's deploy receipt:

1. Bishop opens `https://mnemosynec.org/join/` in a fresh browser context (this Bishop session monitors via REST polling, not browser — Founder does the real browser test).
2. Founder runs the actual incognito + fresh-email test on lianabanyan.com? NO — on **mnemosynec.org/join/** per this Marathon. Per existing Tier-0 item #2.
3. Bishop polls Supabase REST every ~3 seconds during Founder's test:
   - `GET /rest/v1/membership_payments?select=*&order=created_at.desc&limit=1`
   - `GET /rest/v1/member_profiles?select=*&membership_status=eq.active`
4. On first `membership_status=active` row appearing → Bishop celebrates the empirical receipt and announces it.

---

## VERIFICATION GATES (T1-T12)

| # | Gate | Pass criteria |
|---|---|---|
| T1 | Island bundle builds clean | `vite build --config vite.config.island.ts` exit 0, gzip <90KB |
| T2 | Hugo /join/ renders | HTTP 200, browser console clean, island mounts |
| T3 | CSS isolation | No Hugo nav style breakage with island loaded |
| T4 | Env injection | `window.__MNEMO_ENV__` shows real keys, no `FOUNDER_SET_*` |
| T5 | CORS preflight | Origin `https://mnemosynec.org` → 200 with allow header |
| T6 | Anonymous checkout | Email-only POST → 200 with Stripe URL |
| T7 | Stripe redirect | `cancel_url` lands back on `https://mnemosynec.org/join/`, not lianabanyan |
| T8 | Success page | `https://mnemosynec.org/join/success/` returns 200 |
| T9 | Webhook receives `checkout.session.completed` | Stripe dashboard event log shows 200 from our endpoint |
| T10 | First `membership_payments` row | Supabase REST count > 0 after Founder test |
| T11 | First `member_profiles` row with `membership_status='active'` | Supabase REST count > 0 after Founder test |
| T12 | No URL-bar bounce to lianabanyan during Stripe flow | Confirmed in Founder's actual test (browser screenshot in receipt) |

---

## OUT OF SCOPE (do NOT do in this Marathon)

- Installer NSIS click-through gate — that's M11 Block 2.
- Hugo Tower download page modal — that's M11 Block 3.
- Supabase `license_acceptances` table — that's M11 Block 4.
- Hugo `/licensing` page — that's M11 Block 1.
- The Two-Axis Founding Licensee model surfaces — that's M11 Block 1 Component G.

This Marathon is **only** the mnemosynec.org/join/ inline $5 React island. If M11 hasn't fired yet when Knight wakes, M17 can ship independently (the join flow does not depend on the SSPL/Apache license decision — that's the installer/download path). The two click-throughs are commercial-licensing concerns; the $5 join is cooperative membership; both ship independently.

---

## DEPENDENCIES

- M11 Blocks 2+3 ship the **two-option license click-through Founder asked about**. This M17 ships the **inline $5 React island Founder asked about**. Both are step 1 per Founder's BP091 directive.
- M11's Two-Axis Founding Licensee DRAFT eblet should be ratified before M11 fires Block 1; M17 has no dependency on Two-Axis.
- Knight must use Sonnet 4.6 per BP091 Founder-direct + ongoing standing order.

---

## ESTIMATED WALL CLOCK

- Block 1 (island bundle): 2-3 hrs
- Block 2 (Hugo /join/ + layout): 30 min
- Block 3 (config keys): 5 min
- Block 4 (edge fn CORS + anon-friendly + webhook extension): 1-2 hrs
- Block 5 (build & deploy): 30 min
- T1-T12 verification: 1 hr
- **Total: 5-7 hrs single Knight session**

---

## RATIFICATION GATES (Founder)

| # | Gate | Status |
|---|---|---|
| R1 | This Marathon 17 scope is what Founder meant by "use the react ON THAT PAGE for Mnemosynec" | **RATIFIED 2026-06-22** |
| R2 | M11 Block 5 (CTA-to-lianabanyan) is SUPERSEDED by M17 | **RATIFIED 2026-06-22** |
| R3 | Anonymous-friendly edge fn extension is acceptable (creates Supabase user on payment, not on form-submit) | **RATIFIED 2026-06-22** |
| R4 | Stripe success_url + cancel_url move to mnemosynec.org domain | **RATIFIED 2026-06-22** |
| R5 | M11 Blocks 2+3 (the two-option license click-through) ship in parallel via existing M11 dispatch | **RATIFIED 2026-06-22** |

---

## ANTICIPATED RETURN ARTIFACTS

Knight's KniPr return MUST include:
1. Final deploy URL (`https://mnemosynec.org/join/`) — verified HTTP 200
2. Stripe smoke-test Checkout session URL (from empirical curl)
3. JS bundle SHA-256 hash + filename
4. Diff summary: files added/modified in `platform/` + `cephas-hugo/`
5. Empirical CORS preflight response (full headers)
6. Confirmation T1-T12 all PASS, or which failed + why
7. Time-to-ship (start/end timestamps)

— Bishop Opus 4.7 · BP091 · 2026-06-22 · Sonnet 4.6 SEG composed · Knight Sonnet 4.6 executes
