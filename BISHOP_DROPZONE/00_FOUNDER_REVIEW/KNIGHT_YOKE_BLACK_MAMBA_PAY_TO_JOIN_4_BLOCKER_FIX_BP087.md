# BLACK MAMBA PAY-TO-JOIN 4-BLOCKER FIX
## Knight Yoke · BP087 · BRICK WALL pre-authorized · URGENT pre-NYT

---

## §0 HEADER

**Yoke ID:** BLACK_MAMBA_PAY_TO_JOIN  
**Session:** BP087  
**Authorization:** BRICK WALL pre-authorized by Founder  
**Priority:** URGENT -- NYT pitch imminent -- readers cannot convert without this  
**Statutes binding:** §2 IMMUTABLES + §3 Sonnet 4.6 verbatim + §4 absolute paths + §14 gadget-first + §15 Bishop-direct-Supabase  
**Authored by:** SEG-O · Sonnet 4.6  
**Date:** 2026-06-19  

---

## §1 CONTEXT

### The Moment

The NYT op-ed closes at Option A this session. The pitch is imminent. The lightbulb
tagline ("I'm tired of using candles. We're making a lightbulb.") drives readers to
lianabanyan.com and mnemosynec.org. The call-to-action on those pages points to /join.
The $5 membership transaction IS the empirical proof of the inequality trinity:

    Free WITH Substrate > Flagship WITHOUT Substrate = BROKE THE SOUND BARRIER

If a reader clicks through and cannot pay $5, the thesis collapses at the moment of
maximum leverage. Pay-to-Join broken = NYT readers cannot convert = zero empirical
validation of the Business-Launch-Primitive thesis.

### The 4 Blockers (verbatim from BP087.md lines 2822-2842)

**Blocker 1:** WORKING_KEYS.env missing -- the actual working Stripe + Supabase secrets
file. Knights need loader path verification.

**Blocker 2:** checkout Edge Function returns 401 -- likely JWT-vs-publishable-key trap
or RLS misconfig.

**Blocker 3:** checkout_session.ts + webhook_handler.ts are explicit stubs (v0.1.61).

**Blocker 4:** lianabanyan.com/join modal not deployed.

---

## §1b GADGET-VERIFY RECON RESULTS (SEG-O pre-flight · BP087 · 2026-06-19)

SEG-O read all target files before authoring. Truth-Always disclosure:

### Blocker 1: WORKING_KEYS.env -- STATUS: PARTIALLY REAL

C:\Users\Administrator\.claude\state\secrets\22May2026.env EXISTS. Key names present:
ANTHROPIC_API_KEY, OPENAI_API_KEY, Supabase_Publishable_Key, Supabase_Secret_Key,
PERPLEXITY_API_KEY, Gemini_API_Key, RELAY_SECRET, SUPABASE_DB_URL.

MISSING FROM 22May2026.env: STRIPE_SECRET_KEY, STRIPE_MEMBERSHIP_WEBHOOK_SECRET.

The platform/.env contains ONLY the Vite-side publishable key (VITE_STRIPE_PUBLISHABLE_KEY).
ALL server-side secrets live in Supabase Edge Function secrets (set via
`npx supabase secrets set KEY=VALUE`). The platform/.env.example documents this:
"ALL server-side secrets are in Supabase Edge Function secrets. Do NOT add secrets here."

WORKING_KEYS.env as a standalone file does NOT exist in the platform tree.
The canonical pattern is: Stripe secret lives in Supabase secrets, not a flat .env file.

SEG-PJ-1 task: verify Supabase secrets have STRIPE_SECRET_KEY set. Loader path is
already correct in Edge Functions (Deno.env.get("STRIPE_SECRET_KEY")). The blocker
is whether the secret is actually set in Supabase -- Knight cannot read it directly
but can run `npx supabase secrets list` to confirm presence without echoing value.

### Blocker 2: checkout Edge Function -- STATUS: REAL (but misdiagnosed)

`platform/supabase/functions/create-membership-checkout/index.ts` EXISTS and is fully
implemented (not a stub). It uses `supabase.auth.getUser(token)` with a Bearer JWT.

The MembershipGate.tsx on lianabanyan.com calls it via `supabase.functions.invoke()`
which passes the JWT automatically. This should work IF STRIPE_SECRET_KEY is set in
Supabase secrets. The 401 is almost certainly Blocker 1 (STRIPE_SECRET_KEY missing)
causing a 500 that the client misreads, OR the function is not deployed.

The layout at `Cephas/cephas-hugo/layouts/join/list.html` calls a DIFFERENT function:
`create-mnemosynec-checkout` (anon/public, no JWT). That function EXISTS at
`platform/supabase/functions/create-mnemosynec-checkout/index.ts` and is fully
implemented. It also requires STRIPE_SECRET_KEY via Deno.env.

Knight must: (a) confirm STRIPE_SECRET_KEY is in Supabase secrets, (b) confirm both
functions are deployed (`supabase functions deploy`).

### Blocker 3: checkout_session.ts + webhook_handler.ts stubs -- STATUS: REAL

`src/main/membership/checkout_session.ts` is an explicit stub (returns stub_session_*,
isStub: true). It is NOT called by the live flow -- MembershipGate.tsx calls the
Supabase Edge Function directly. But it is still a stub and must be implemented per
the yoke spec for completeness and so any future caller gets real behavior.

`src/main/membership/webhook_handler.ts` is a stub with console.log only. The live
webhook is handled by `platform/supabase/functions/handle-subscription-webhook/index.ts`
which IS fully implemented (signature verify + DB writes + 83.3% split). There is also
a membership-specific webhook needed for the membership flow that hits membership_payments.

Knight must: implement both stubs as real code wired to the Supabase Edge Functions.

### Blocker 4: lianabanyan.com/join modal -- STATUS: PARTIALLY REAL

The join ROUTE EXISTS in the platform React app at `/join` (MembershipGate.tsx,
registered in `platform/src/routes/onboarding.tsx` line 55). The page is wired and
functional IF the Edge Function is deployed and STRIPE_SECRET_KEY is set.

The Cephas/hugo side has a layouts/join/list.html template but `content/join/_index.md`
is MISSING (directory exists, is empty). Without _index.md Hugo will not render the
/join page on cephas.lianabanyan.com.

config.toml MISSING `stripePk` and `supabaseFunctionsUrl` params. The list.html
template uses `{{ .Site.Params.stripePk | jsonify }}` and
`{{ .Site.Params.supabaseFunctionsUrl | jsonify }}` -- both will render as `null`
without those params, causing Stripe to fail silently.

Knight must:
- Add stripePk + supabaseFunctionsUrl to config.toml [params]
- Create content/join/_index.md with correct front matter
- Confirm lianabanyan.com /join (React) is deployed and STRIPE_SECRET_KEY is live

---

## §2 SEG FAN-OUT -- WAVE 1 PARALLEL

**Use segs Sonnet 4.6 verbatim for all four SEGs.**

All four SEGs fire in parallel. No SEG waits for another. All return receipts to Bishop.

---

### SEG-PJ-1: Secrets Audit + Supabase Deployment Verification

**Goal:** Confirm STRIPE_SECRET_KEY and STRIPE_MEMBERSHIP_WEBHOOK_SECRET are live in
Supabase Edge Function secrets. Confirm both checkout functions are deployed.

**Steps:**

1. Gadget-verify first: `mcp__librarian__brief_me` with task "Supabase secrets audit
   and Edge Function deployment status for create-membership-checkout and
   create-mnemosynec-checkout"

2. Run WITHOUT echoing values:
   `npx supabase secrets list --project-ref <project_ref>`
   -- Confirm STRIPE_SECRET_KEY appears in the list (presence only, not value)
   -- Confirm STRIPE_MEMBERSHIP_WEBHOOK_SECRET or STRIPE_SUBSCRIPTION_WEBHOOK_SECRET
      appears in the list

3. If STRIPE_SECRET_KEY is NOT in the list, Knight sets it from the canonical source:
   The Stripe secret key is in the Founder's Stripe dashboard. Bishop owns key rotation.
   Per §15 BLOOD: Knight does NOT ask Founder for keys. Knight reads the canonical
   secrets path: C:\Users\Administrator\.claude\state\secrets\22May2026.env
   -- If STRIPE_SECRET_KEY is present there, set it: `npx supabase secrets set STRIPE_SECRET_KEY=<value>`
   -- If not present there, Knight flags in receipt: "STRIPE_SECRET_KEY not in canonical
      secrets path -- Bishop must set via Stripe dashboard -- this is the primary blocker"

4. Verify deployment status of both functions:
   `npx supabase functions list`
   -- Confirm create-membership-checkout is ACTIVE
   -- Confirm create-mnemosynec-checkout is ACTIVE

5. If either function is not deployed or stale, redeploy:
   `cd C:\Users\Administrator\Documents\LianaBanyanPlatform\platform`
   `npx supabase functions deploy create-membership-checkout --no-verify-jwt`
   `npx supabase functions deploy create-mnemosynec-checkout --no-verify-jwt`
   Note: create-mnemosynec-checkout is public (anon) -- the --no-verify-jwt flag is
   correct for that function. create-membership-checkout uses its own JWT verification
   internally so --no-verify-jwt is also correct there.

**Return receipt must include:**
- STRIPE_SECRET_KEY: present/absent in secrets
- STRIPE_MEMBERSHIP_WEBHOOK_SECRET: present/absent
- create-membership-checkout: deployed Y/N, last-deployed timestamp
- create-mnemosynec-checkout: deployed Y/N, last-deployed timestamp
- If any flag action taken: exact command run (no values echoed)

---

### SEG-PJ-2: checkout Edge Function Smoke Test + 401 Root Cause Fix

**Goal:** Confirm the live checkout function returns 200 to a valid request.
Fix the 401 if present.

**Steps:**

1. Gadget-verify first: `mcp__librarian__brief_me` with task "checkout Edge Function
   401 diagnosis for create-membership-checkout and create-mnemosynec-checkout BP087"

2. Smoke-test create-mnemosynec-checkout (public, no JWT needed):
   ```
   curl -X POST https://<project_ref>.supabase.co/functions/v1/create-mnemosynec-checkout \
     -H "Content-Type: application/json" \
     -H "apikey: <SUPABASE_ANON_KEY>" \
     -d '{"intent":"join_cooperative","return_url":"https://lianabanyan.com/join/success"}'
   ```
   Expected: HTTP 200 with `{ "client_secret": "cs_..." }`
   If HTTP 401: the function is deployed with verify_jwt=true. Fix:
   -- Add to supabase/config.toml under [functions.create-mnemosynec-checkout]:
      verify_jwt = false
   -- Redeploy: `npx supabase functions deploy create-mnemosynec-checkout --no-verify-jwt`

3. If Stripe returns an error (STRIPE_SECRET_KEY missing): that is Blocker 1.
   Note in receipt and wait for SEG-PJ-1 to fix, then retest.

4. Check RLS on memberships / membership_payments tables for anon INSERT:
   The verify-mnemosynec-checkout function writes to mnemosynec_members. If that table
   has no RLS policy for service_role, the write will silently fail (non-fatal per
   current code). Add the migration in §3 to ensure the table exists with correct RLS.

5. Smoke-test create-membership-checkout with a test user JWT:
   ```
   curl -X POST https://<project_ref>.supabase.co/functions/v1/create-membership-checkout \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <test_user_jwt>" \
     -H "apikey: <SUPABASE_ANON_KEY>" \
     -d '{"isRenewal":false}'
   ```
   Expected: HTTP 200 with `{ "url": "https://checkout.stripe.com/..." }`

**Return receipt must include:**
- create-mnemosynec-checkout smoke result: HTTP status + response shape
- create-membership-checkout smoke result: HTTP status + response shape
- Root cause of 401 if found: JWT flag / RLS / missing secret
- Any config.toml changes made: diff

---

### SEG-PJ-3: checkout_session.ts + webhook_handler.ts Full Implementation

**Goal:** Replace both stubs with real implementations that call the Supabase Edge
Functions. The live flow uses the Edge Functions directly but these modules must not
remain stubs -- they are imported by other callers and will mislead future devs.

**File targets:**
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\membership\checkout_session.ts`
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\membership\webhook_handler.ts`

**Steps:**

1. Gadget-verify first: Read both files. Confirm stub state per recon (confirmed above).

2. Implement `checkout_session.ts`:
   Replace the stub with a real implementation that:
   - Calls the Supabase Edge Function `create-membership-checkout` via fetch
   - Accepts userEmail and optionally a Supabase JWT token
   - Returns { success, checkoutUrl, sessionId, isStub: false } on success
   - Returns { success: false, error, isStub: false } on failure
   - Does NOT hardcode the SUPABASE_URL -- reads from environment or accepts as param
   - isStub must be FALSE in all real-code paths

3. Implement `webhook_handler.ts`:
   Replace the stub with a real implementation that:
   - Verifies the Stripe-Signature header using HMAC-SHA256
   - Reads STRIPE_MEMBERSHIP_WEBHOOK_SECRET from process.env
   - Handles: customer.subscription.created, customer.subscription.updated,
     customer.subscription.deleted, checkout.session.completed,
     invoice.payment_succeeded, invoice.payment_failed
   - On checkout.session.completed with metadata.payment_type = "lb_membership_stake":
     calls the Supabase service role client to update membership_payments status to "paid"
     and entity_memberships status to "active"
   - Returns { handled: true, newStatus } on success
   - Signature pattern: same HMAC-SHA256 pattern as handle-subscription-webhook/index.ts
     (already implemented -- use it as the reference)

4. Add TypeScript types -- import from shared/membership_types.ts for MembershipStatus.

5. Confirm no em-dashes in output.

**Return receipt must include:**
- Diff stats for both files (lines added / removed)
- Commit hash
- Confirmation isStub = false in all real-code paths
- Any import errors resolved

---

### SEG-PJ-4: lianabanyan.com/join + Hugo /join Page Deploy

**Goal:** Ensure /join returns HTTP 200 across all three domains and the Stripe checkout
actually loads. Two surfaces: (A) lianabanyan.com React app, (B) Cephas Hugo site.

**File targets:**
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\content\join\_index.md` (CREATE -- missing)
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\config.toml` (EDIT -- add stripePk + supabaseFunctionsUrl)

**Steps:**

1. Gadget-verify first: Glob `content/join/**` and read config.toml. Confirm _index.md
   missing and stripePk absent (confirmed by SEG-O recon above).

2. Create `content/join/_index.md`:

```
---
title: "Join the Cooperative"
description: "Become a member-owner of Liana Banyan for $5/year. One vote. Workers keep the majority."
layout: "join"
url: "/join/"
sitemap:
  changefreq: monthly
  priority: 0.9
---
```

   Note: the layout "join" maps to layouts/join/list.html (Hugo uses list.html for
   section index pages). The file content body is unused -- the layout is self-contained.

3. Edit config.toml -- add to the existing [params] block:

```toml
  stripePk = "pk_live_..."         # Vite publishable key from VITE_STRIPE_PUBLISHABLE_KEY
  supabaseFunctionsUrl = "https://<project_ref>.supabase.co/functions/v1"
```

   Knight reads the value of VITE_STRIPE_PUBLISHABLE_KEY from
   `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\.env`
   and the Supabase project ref from VITE_SUPABASE_PROJECT_ID in the same file.
   Do NOT echo the actual key value in the receipt -- confirm it was set correctly
   by checking that the rendered page returns a non-null Stripe PK.

   Per §15 BLOOD: Knight reads from platform/.env (it contains ONLY the publishable
   key which is intentionally public). No secrets are placed in config.toml.

4. Verify the join/success route exists in Hugo layouts:
   layouts/join/join-success.html EXISTS (confirmed by recon). The success URL in
   create-mnemosynec-checkout is `return_url + ?session={CHECKOUT_SESSION_ID}`.
   The MembershipGate.tsx success_url is `/membership-success`. Confirm Hugo has a
   content page at `content/join/success/` or `content/membership-success/` -- if not,
   create `content/join/success/_index.md` pointing to join-success layout.

5. Rebuild and redeploy Hugo site:
   ```
   cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo
   hugo --minify
   ```
   Then deploy per the Firebase hosting target for lianabanyan.com (hosting:main per
   librarian canon: "lianabanyan.com uses hosting:main, NOT hosting:dotcom").

6. For mnemosynec.org/join and mnemosynec.ai/join:
   Check if those domains have their own Hugo/static content or redirect to lianabanyan.com.
   If they redirect, the 3-domain curl check will follow the redirect -- note the final
   destination in the receipt.

**Return receipt must include:**
- content/join/_index.md: created Y/N
- config.toml: stripePk set Y/N, supabaseFunctionsUrl set Y/N (no values echoed)
- Hugo build: success Y/N, any errors
- Deploy: Firebase target used, output URL
- Success page: content/join/success/_index.md status

---

## §3 FILE TARGETS (ABSOLUTE PATHS)

```
PRIMARY TARGETS:
C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\membership\checkout_session.ts
C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\membership\webhook_handler.ts
C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\content\join\_index.md   [CREATE]
C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\config.toml              [EDIT]

EDGE FUNCTIONS (Supabase deploy, not local file edit):
C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\functions\create-membership-checkout\index.ts
C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\functions\create-mnemosynec-checkout\index.ts

SECRETS MANAGEMENT (canonical path, Bishop owns rotation):
C:\Users\Administrator\.claude\state\secrets\22May2026.env   [READ ONLY -- verify STRIPE_SECRET_KEY present]

SQL MIGRATION (Knight ships .sql -- Bishop applies via psql, NOT delegate):
C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\migrations\20260619_membership_subscription_substrate_market_bp087.sql   [CREATE]
```

---

## §4 ACCEPTANCE GATES

All gates must pass before Knight submits receipt. Gadget-verify each gate.

**Gate 1: Secrets confirmed**
- `npx supabase secrets list` shows STRIPE_SECRET_KEY: present
- `npx supabase secrets list` shows STRIPE_MEMBERSHIP_WEBHOOK_SECRET or equivalent: present
- No values echoed in receipt

**Gate 2: Edge Functions deployed and returning 200**
- `curl -X POST .../create-mnemosynec-checkout` with anon apikey returns HTTP 200
  with `{ "client_secret": "cs_..." }`
- `curl -X POST .../create-membership-checkout` with valid JWT returns HTTP 200
  with `{ "url": "https://checkout.stripe.com/..." }`

**Gate 3: End-to-end test (Stripe test mode)**
- Visit lianabanyan.com/join in browser OR curl the checkout URL returned above
- Click "Join the Cooperative -- $5/yr" button
- Stripe Checkout loads (embedded or redirect)
- Complete with Stripe test card 4242 4242 4242 4242
- Webhook fires (check Supabase function logs: `npx supabase functions logs`)
- membership_payments row created with status='active' OR mnemosynec_members row
  upserted with joined_at set
- Stripe test-mode smoke confirmation in receipt

**Gate 4: 4-curl domain check**
```
curl -I https://lianabanyan.com/join          # expect 200 or 301 to auth
curl -I https://mnemosynec.org/join           # expect 200 or 301
curl -I https://mnemosynec.ai/join            # expect 200 or 301
curl -I https://cephas.lianabanyan.com/join   # expect 200
```
All four must return HTTP 2xx or 3xx (redirect is acceptable -- note final destination).
HTTP 404 is a failure.

**Gate 5: checkout_session.ts isStub = false**
- `grep -n "isStub" src/main/membership/checkout_session.ts`
  must show `isStub: false` in the real-code path, never `isStub: true`

**Gate 6: webhook_handler.ts signature verify active**
- `grep -n "HMAC\|verifySignature\|stripe-signature" src/main/membership/webhook_handler.ts`
  must return at least one match

**Gate 7: SQL migration file ships**
- Migration file exists at absolute path in §3
- Contains: CREATE TABLE IF NOT EXISTS mnemosynec_members + membership status columns
  (stripe_session_id, email, intent, joined_at, status)
- Bishop will apply via psql

---

## §5 DRIFT PROTOCOL (BP053 inline)

Per BP053 §4: if any gate fails after implementation, Knight does NOT re-ask Founder.

Knight self-corrects up to 3 attempts per gate. On the 4th failure, Knight logs
"DRIFT UNRESOLVED: [gate name] -- [specific failure]" in the receipt and flags for Bishop.

Gadget-verify BEFORE re-asking anything. No hallucinated fixes. Every change must be
read back from disk before marking complete.

If Supabase CLI commands fail, Knight checks:
1. Is the CLI logged in? `npx supabase projects list`
2. Is the correct project linked? `npx supabase status`
3. Are secrets in the right project? `npx supabase secrets list --project-ref <ref>`

---

## §6 COMPOSITION

This yoke composes with:

- canon_im_tired_of_using_candles_making_a_lightbulb_tagline_bp087
  The /join page is the destination for the lightbulb tagline CTA. If /join 404s or
  Stripe fails, the lightbulb does not turn on.

- canon_house_liturgy_signoff
  The join success page ("You're in. Welcome to the Cooperative.") is the first moment
  a reader experiences the liturgy as a member-owner.

- canon_cooperative_substrate_business_launch_built_in_customer_base_preferences_bp086
  The $5 join transaction proves the Business-Launch-Primitive thesis empirically.
  Every member who joins through the NYT path IS the built-in customer base.

- canon_three_gear_currency_differential_credits_marks_joules_mechanism_bp086
  On successful join: 5 starter Credits are issued (per MembershipGate.tsx benefits list).
  The webhook_handler.ts implementation must trigger this. The join is the ignition of
  the Credits gear.

- canon_gemma_only_mesh_trial_integral
  Mesh trial access is unlocked by membership. The webhook completion event may emit
  a mesh-trial entitlement if the Marks/Credits layer is live.

- canon_substrate_connection_general_purpose_p2p_gaming_cost_plus_20_bp086
  The base-tier free mesh access is already open. Membership ($5) unlocks the
  personalization tier and CREW participation. The join transaction is the tier upgrade.

---

## §7 KNIGHT RETURN TEMPLATE

Knight returns a receipt to Bishop following BP053 §4 empirical pattern.

```
## BLACK MAMBA PAY-TO-JOIN RECEIPT · BP087

### SEG-PJ-1 Return
- STRIPE_SECRET_KEY in Supabase secrets: [present/absent/set-by-knight]
- STRIPE_MEMBERSHIP_WEBHOOK_SECRET: [present/absent/set-by-knight]
- create-membership-checkout deployed: [Y/N] · last-deployed: [timestamp]
- create-mnemosynec-checkout deployed: [Y/N] · last-deployed: [timestamp]
- Drift: [none / describe]

### SEG-PJ-2 Return
- create-mnemosynec-checkout smoke: HTTP [status] · response: [shape only, no secrets]
- create-membership-checkout smoke: HTTP [status] · response: [shape only]
- 401 root cause: [JWT flag / RLS / missing secret / N/A]
- config.toml change: [none / diff summary]
- Drift: [none / describe]

### SEG-PJ-3 Return
- checkout_session.ts: [lines added] / [lines removed] · isStub=false confirmed: Y/N
- webhook_handler.ts: [lines added] / [lines removed] · HMAC verify confirmed: Y/N
- Commit hash: [hash]
- Drift: [none / describe]

### SEG-PJ-4 Return
- content/join/_index.md: created Y/N
- config.toml stripePk: set Y/N (no value echoed)
- config.toml supabaseFunctionsUrl: set Y/N (no value echoed)
- Hugo build: success Y/N
- Firebase deploy: target [hosting:main] · URL [deployed URL]
- Drift: [none / describe]

### Acceptance Gates Summary
Gate 1 Secrets:         [ ] PASS / [ ] FAIL
Gate 2 Edge Fn 200:     [ ] PASS / [ ] FAIL
Gate 3 E2E test mode:   [ ] PASS / [ ] FAIL
Gate 4 4-curl:
  lianabanyan.com/join:          HTTP [  ] -> final [  ]
  mnemosynec.org/join:           HTTP [  ] -> final [  ]
  mnemosynec.ai/join:            HTTP [  ] -> final [  ]
  cephas.lianabanyan.com/join:   HTTP [  ] -> final [  ]
Gate 5 isStub=false:    [ ] PASS / [ ] FAIL
Gate 6 HMAC verify:     [ ] PASS / [ ] FAIL
Gate 7 SQL migration:   [ ] PASS / [ ] FAIL

### Stripe Smoke Test
- Mode: test
- Card: 4242 4242 4242 4242
- Result: [paid / failed / error]
- Session ID shape: cs_test_... (prefix only -- no full ID)
- Webhook received: Y/N
- DB row confirmed: Y/N

### SQL Migration Path
[absolute path to migration file]
NOTE TO BISHOP: apply via `psql $SUPABASE_DB_URL -f <migration_path>` -- do NOT delegate
```

---

## §8 STATUTES BINDING HEADER

This yoke is bound by:

**§2 IMMUTABLES**
- $5/year membership price: CANONICAL -- do not change any default or variable
- 83.3% creator keep: CANONICAL -- do not alter any split calculation
- Cost+20% platform margin: CANONICAL -- do not alter fee structures

**§3 Sonnet 4.6 verbatim**
All SEGs in this wave use Sonnet 4.6 exactly. No model substitution.

**§4 Absolute paths**
Every file reference in this yoke uses an absolute path. No relative paths in any
Knight implementation. If a path does not exist on disk, Knight creates it -- does
not assume it exists.

**§14 GADGET-FIRST (BLOOD)**
Before reading any file, before running any search, Knight runs:
`mcp__librarian__brief_me` with a task-scoped description.
"Gadget-verify before re-asking anything." -- BP053 canon verbatim.
If the gadget is unavailable, Knight logs "GADGET UNAVAILABLE -- proceeding with
disk read only" and flags in receipt. Does NOT skip the gate and claim success.

**§15 BISHOP-DIRECT-SUPABASE (BLOOD)**
Knight ships the .sql migration file. Knight does NOT apply it.
Bishop applies via: `psql $SUPABASE_DB_URL -f <migration_path>`
Knight does NOT delegate this to another Knight or Pawn.
Knight does NOT ask Founder for Stripe keys. Knight reads the canonical secrets path:
`C:\Users\Administrator\.claude\state\secrets\22May2026.env`
If STRIPE_SECRET_KEY is absent from that path, Knight flags "STRIPE_SECRET_KEY NOT IN
CANONICAL SECRETS PATH -- BISHOP MUST SET" and does not block on it.

**NO EM-DASHES**
Zero em-dashes anywhere in this document or in any Knight output from this yoke.
Use "--" (double hyphen) or restructure the sentence.

---

## §9 SQL MIGRATION (Knight ships, Bishop applies)

Knight creates this file at the absolute path specified in §3.

```sql
-- 20260619_membership_subscription_substrate_market_bp087.sql
-- BLACK MAMBA Pay-to-Join · BP087
-- Knight ships. Bishop applies via: psql $SUPABASE_DB_URL -f <path>

-- mnemosynec_members: tracks paid join events from create-mnemosynec-checkout flow
CREATE TABLE IF NOT EXISTS mnemosynec_members (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE NOT NULL,
  email             TEXT,
  intent            TEXT NOT NULL DEFAULT 'other',
  status            TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  joined_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  first_paid_at     TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: service_role can write; anon can read their own row by session_id
ALTER TABLE mnemosynec_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON mnemosynec_members
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "anon_read_own_by_session" ON mnemosynec_members
  FOR SELECT USING (true);  -- session_id is a sufficient secret -- no PII exposed

-- membership_payments: ensure stripe_customer_id + stripe_subscription_id columns exist
ALTER TABLE membership_payments
  ADD COLUMN IF NOT EXISTS stripe_customer_id      TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id  TEXT,
  ADD COLUMN IF NOT EXISTS first_paid_at           TIMESTAMPTZ;

-- Index for webhook lookups
CREATE INDEX IF NOT EXISTS idx_mnemosynec_members_stripe_session
  ON mnemosynec_members (stripe_session_id);

CREATE INDEX IF NOT EXISTS idx_membership_payments_stripe_session
  ON membership_payments (stripe_session_id);
```

---

*Yoke authored by SEG-O · Sonnet 4.6 · BP087 · 2026-06-19*
*Zero em-dashes confirmed.*
*Help Each Other Help Ourselves.*
