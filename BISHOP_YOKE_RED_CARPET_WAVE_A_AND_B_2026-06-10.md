---
<!-- bishop-yoke-task 2026-06-10T17:30:00Z -->

## BISHOP -> KNIGHT - TASK - RED CARPET FULL BUILD - WAVE A + WAVE B - USE SONNET 4.6 SEGs (Statute Section 3)

**Pinned-class task. Pin-marker: BP079_RED_CARPET_WAVE_A_B_2026-06-10T17:30:00Z**

---

### TL;DR

Founder ratified the full Red Carpet build for food-truck activation. He has a local food truck to approach in person and needs this working before that meeting. Bishop audit (SEG-RC-AUDIT-2, 2026-06-10) verdict was RED (0/9 layers operational). Pages exist as .tsx files; routes are unmapped; 10+ tables referenced by libs are missing from live schema; components are shells with zero Supabase writes; membership_payments has no introducer_id column.

Full build = Wave A (target 1 day wall-clock: substrate + routes + auth wiring) + Wave B (target 2 days wall-clock: page logic + food-node subscription shape + vesting). Sonnet 4.6 SEGs mandatory across both waves per Statute §3. Packaged-install or live-web screenshot verify is binding per feedback_ux_seg_screenshot_mandatory_bp078 — source-only verify is a canon violation on B.7.

### Why this Yoke is one document for two waves

Both waves are scoped tightly enough that Knight can foreman them sequentially — Wave A substrate blockers must clear before Wave B can wire to live tables. One Yoke = one continuous Knight session arc with substrate-theorem wake between waves if context budget allows. If Knight needs to compact between waves, surface and Bishop will re-Yoke Wave B fresh.

---

## TRUTH-ALWAYS CORRECTIONS (Bishop source-audit findings — fold these in before executing any SEG)

Bishop's audit was source-only and missed several tables already present in the live schema. Knight must verify these FIRST before writing any migration, to avoid duplicate-object errors.

**1. `creator_referrals` EXISTS in baseline migration (line 13999 of `00000000000000_baseline.sql`)**
The original shape is: id, referrer_id (not introducer_user_id), referred_handle, referred_platform (instagram/etsy/tiktok/email/other), cue_card_sent_at, referred_user_id, signed_up_at, reward_tier, reward_marks, reward_paid, created_at.
Migration `20260501000001_lb_frame_cue_card_viral_onboarding_bp009.sql` later ALTERed it to add: handshake_vesting_state, license_door, recipient_email, personal_message, handshake_session_id, vesting_state_updated_at, completed_at.
**The Red Carpet build needs additional columns** (introducer_user_id, business_entity_id, business_node_type, business_card_id, first_seen_at, activated_at, stripe_session_id) but these should be added via ALTER TABLE ADD COLUMN IF NOT EXISTS — NOT a CREATE TABLE. Do NOT drop or recreate this table.

**2. `profiles` EXISTS in baseline (line 19798 of `00000000000000_baseline.sql`)**
Full shape: id, email, full_name, avatar_url, created_at, updated_at, last_active_at, activity_streak_days, total_transactions, is_active, ghost_credit_terms_accepted_at/version, user_id, fresh_start_count, last_fresh_start, display_name, credits_balance, joules_balance, reputation_score, guild_level, membership_status, kyc_status, kyc_provider_ref, tax_form_status, country_of_residence, creator_type, creator_external_url. The audit finding "profiles missing" is WRONG. No work needed here — remove from migration scope entirely.

**3. The relevant Stripe edge function for membership checkout is `create-membership-checkout` (at `supabase/functions/create-membership-checkout/index.ts`), not `stripe-create-checkout-session`.**
`stripe-create-checkout-session` handles membership tiers (member/builder/patron) + credit purchases and has a different caller surface. The `introducer_user_id` injection should go into `create-membership-checkout`, which already reads a POST body with `inviteCode`, `isRenewal`, `autoRenew`. Add `introducer_user_id` to that body read. The matching webhook is `handle-membership-webhook` (not `verify-credit-payment`).

**4. There is no existing red-carpet route file in `platform/src/routes/`.**
A new file `platform/src/routes/redCarpet.tsx` must be created AND imported + registered in `platform/src/AppRouter.tsx`. The AppRouter imports from `./routes` index. The routes index at `platform/src/routes/index.ts` re-exports from named files. Follow the exact same pattern as `commerce.tsx` / `social.tsx`.

**5. `membership_payments` table is defined in `20260608000002_bp077_membership_payments_table.sql`** with columns: id, member_id, amount, currency, stripe_session_id, stripe_payment_intent, status, period_start, period_end, is_renewal, created_at, completed_at. No `introducer_user_id` column. Confirmed Bishop audit finding is accurate here.

**6. Tables confirmed MISSING from all migrations (these DO need to be created fresh):**
- `leviathan_cue_cards`
- `promotion_attributions`
- `cue_card_destinations`
- `cue_card_share_clicks`
- `red_carpet_access`
- `cue_card_templates`
- `referrals` (generic — search baseline to confirm; pattern-match shows no hit)
- `social_frame_locks`

**7. `guild_master_profiles` and `jukebox_artist_profiles` exist** (via `20260603120001_bp073_w9_guild_master_profiles.sql` and related). These are separate role-specific tables. Since `profiles` already exists as a base table (finding #2 above), the Bishop audit concern about profiles is fully resolved — no new work.

---

## WAVE A — Substrate + Routes + Auth Wiring (target: 1 day wall-clock)

### A.1 Route registration (small — SEG-RC-A-1)

Create `platform/src/routes/redCarpet.tsx` following the exact pattern of `commerce.tsx`:
- Lazy-import all Red Carpet pages
- Define and export `redCarpetRoutes` as a JSX fragment of `<Route>` elements

Register these routes:

| Component | Path | Access tier |
|---|---|---|
| `FoodNodeCueCard` | `/cue-card/food-node/:id?` | ProtectedRoute |
| `LocalBusinessNodeCueCard` | `/cue-card/local-business/:id?` | ProtectedRoute |
| `CueCardShare` | `/cue-card/share/:cardId` | ProtectedRoute |
| `CueCardShareLanding` | `/cue-card/landing/:shareToken` | public (no auth — this is the URL Founder hands to food truck owner) |
| `CueCardLanding` | `/cue-card/welcome/:cardId` | public |
| `CueCardGeneratorV2` | `/cue-card/generate/:nodeType` | ProtectedRoute |
| `CreatorRedCarpet` | `/red-carpet/creator` | ProtectedRoute |
| `RedCarpet` | `/red-carpet` | ExplorerRoute |
| `RedCarpetLandingV2Page` | `/red-carpet/landing/:token` | public |
| `TribeNodeCueCard` | `/cue-card/tribe/:id?` | ProtectedRoute |
| `ServiceNodeCueCard` | `/cue-card/service/:id?` | ProtectedRoute |

Then:
1. Add `export { redCarpetRoutes } from "./redCarpet";` to `platform/src/routes/index.ts`
2. Import `redCarpetRoutes` in `platform/src/AppRouter.tsx`
3. Add to AppRouter: `{g("commerce") && redCarpetRoutes}` — or create a dedicated `"redcarpet"` portal group if Knight deems the activation surface should be separately gated. Surface the decision.
4. Run dev server and confirm each path renders the component (even blank shell) instead of 404.

Truth-Always: if Knight discovers any of these components are already registered under a different path somewhere in the existing route files, surface it — don't add a duplicate.

### A.2 Schema migration — missing tables (medium — SEG-RC-A-2)

Author ONE migration file: `supabase/migrations/<timestamp>_bp079_red_carpet_substrate.sql`

Use timestamp format `20260610173000` as the prefix.

**Section 1 — ALTER `creator_referrals` (existing table, extend only)**

Per Truth-Always finding #1: this table exists with a social-referral shape. The Red Carpet build needs the food-truck introducer shape as additional columns. Add these IF NOT EXISTS:

```sql
ALTER TABLE public.creator_referrals
  ADD COLUMN IF NOT EXISTS introducer_user_id    uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS business_entity_id    uuid REFERENCES entity_memberships(id),
  ADD COLUMN IF NOT EXISTS business_node_type    text CHECK (business_node_type IN ('food','local-business','service','tribe','manufacturing','guild','broadcast','hexisle')),
  ADD COLUMN IF NOT EXISTS business_card_id      uuid, -- FK to leviathan_cue_cards; add FK constraint AFTER leviathan_cue_cards is created
  ADD COLUMN IF NOT EXISTS first_seen_at         timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS activated_at          timestamptz,
  ADD COLUMN IF NOT EXISTS rc_stripe_session_id  text; -- prefixed rc_ to avoid clash with any future baseline columns
```

After creating `leviathan_cue_cards` below, add the FK:
```sql
ALTER TABLE public.creator_referrals
  ADD CONSTRAINT IF NOT EXISTS fk_creator_referrals_business_card
  FOREIGN KEY (business_card_id) REFERENCES public.leviathan_cue_cards(id);
```

Index on `introducer_user_id` for vesting queries.

**Section 2 — CREATE new tables**

**`cue_card_templates`** (create first — referenced by leviathan_cue_cards):
```
id uuid PK default gen_random_uuid()
node_type text NOT NULL CHECK (node_type IN ('food','local-business','service','tribe','manufacturing','guild','broadcast','hexisle'))
template_name text NOT NULL
template_payload jsonb NOT NULL DEFAULT '{}'
system_owned boolean NOT NULL DEFAULT true
creator_user_id uuid REFERENCES auth.users(id) -- null when system_owned
created_at timestamptz DEFAULT now()
```
RLS: public SELECT (templates are open to read); service_role full access; INSERT/UPDATE restricted to service_role or admin check.

**`leviathan_cue_cards`**:
```
id uuid PK default gen_random_uuid()
creator_user_id uuid NOT NULL REFERENCES auth.users(id)
node_type text NOT NULL CHECK same enum as templates
template_id uuid REFERENCES public.cue_card_templates(id)
payload jsonb NOT NULL DEFAULT '{}'
short_token text UNIQUE NOT NULL -- random URL-safe 8-12 chars, e.g. gen'd in app layer
qr_code_url text
created_at timestamptz DEFAULT now()
expires_at timestamptz -- null = no expiry
```
RLS: creator owns (SELECT/UPDATE/DELETE WHERE creator_user_id = auth.uid()); anon SELECT by short_token requires a security definer function (see A.4); service_role full.
Index: `short_token` (unique index already implied by UNIQUE constraint, but add `idx_leviathan_cue_cards_short_token` explicitly for clarity).

**`red_carpet_access`**:
```
id uuid PK default gen_random_uuid()
recipient_email_hash text NOT NULL -- SHA-256 of lowercased email; never store plaintext email here
recipient_user_id uuid REFERENCES auth.users(id) -- populated after sign-up
introducer_user_id uuid NOT NULL REFERENCES auth.users(id)
grant_token text UNIQUE NOT NULL -- UUID or random token used in the share URL
grant_expires_at timestamptz NOT NULL DEFAULT now() + interval '30 days'
used_at timestamptz
card_id uuid REFERENCES public.leviathan_cue_cards(id)
created_at timestamptz DEFAULT now()
```
RLS: recipient can SELECT own row (WHERE recipient_user_id = auth.uid()); introducer can SELECT own rows (WHERE introducer_user_id = auth.uid()); service_role full.
Add function `public.mark_red_carpet_grant_used(p_grant_token text)` as SECURITY DEFINER to allow anon/just-authed user to mark their own grant used without needing to know their recipient_user_id yet.

**`cue_card_share_clicks`**:
```
id uuid PK default gen_random_uuid()
cue_card_id uuid NOT NULL REFERENCES public.leviathan_cue_cards(id)
click_token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text
clicked_at timestamptz DEFAULT now()
anonymous_session_id text NOT NULL -- client-generated uuid stored in localStorage
ip_country text -- ISO-3166-1 alpha-2 from Supabase edge geolocation header; no PII
user_agent_class text -- 'mobile'/'desktop'/'bot'
converted boolean NOT NULL DEFAULT false
conversion_event_id uuid -- FK to creator_referrals.id once known
```
RLS: card creator SELECT aggregate only (via security definer function — do NOT give creator direct row access to avoid exposing anonymous_session_id); service_role full.
Write function `public.record_cue_card_click(p_card_id uuid, p_anon_session_id text, p_ip_country text, p_ua_class text)` RETURNS uuid (returns click_token) as SECURITY DEFINER so anonymous visitors can write without auth.

**`cue_card_destinations`**:
```
id uuid PK default gen_random_uuid()
cue_card_id uuid NOT NULL REFERENCES public.leviathan_cue_cards(id)
destination_type text NOT NULL CHECK (destination_type IN ('onboard','storefront','walkthrough'))
destination_url text NOT NULL
ab_variant text
priority int NOT NULL DEFAULT 1
active boolean NOT NULL DEFAULT true
created_at timestamptz DEFAULT now()
```
RLS: card creator owns; service_role full.

**`promotion_attributions`**:
```
id uuid PK default gen_random_uuid()
introducer_user_id uuid NOT NULL REFERENCES auth.users(id)
attributed_amount_cents int NOT NULL DEFAULT 0
currency_class text NOT NULL DEFAULT 'credits' CHECK (currency_class IN ('credits','marks','joules'))
attribution_event text NOT NULL CHECK (attribution_event IN ('first_signup','first_payment','recurring_payment','subscription_renewal','food_node_first_sub','food_node_recurring'))
source_entity_id uuid -- polymorphic: entity_memberships.id or auth.users.id depending on context
source_payment_id uuid REFERENCES public.membership_payments(id)
vesting_unlock_at timestamptz
claimed_at timestamptz
created_at timestamptz DEFAULT now()
```
RLS: introducer SELECT own rows; service_role full. No direct INSERT from client — all rows created by edge functions / triggers.
Index on `(introducer_user_id, claimed_at)` for vesting dashboard query.

**`referrals`** (generic):
Knight: check if this already exists via `SELECT to_regclass('public.referrals')` before writing CREATE TABLE. If it exists, surface its shape and Bishop will amend the Yoke. If missing, create minimal:
```
id uuid PK default gen_random_uuid()
referrer_user_id uuid NOT NULL REFERENCES auth.users(id)
referred_user_id uuid REFERENCES auth.users(id)
referral_code text UNIQUE NOT NULL
referral_source text
created_at timestamptz DEFAULT now()
converted_at timestamptz
```
RLS: referrer owns; service_role full.

**`social_frame_locks`**:
Knight: search `platform/src/lib/` for usages of `social_frame_locks` to determine the expected shape before writing the CREATE TABLE. If the lib code implies a schema, honour it exactly. Minimal fallback if no usages found:
```
id uuid PK default gen_random_uuid()
user_id uuid NOT NULL REFERENCES auth.users(id)
frame_type text NOT NULL
locked_at timestamptz DEFAULT now()
expires_at timestamptz
metadata jsonb DEFAULT '{}'
```
RLS: user owns; service_role full.

**Lock all new functions search_path:**
Every SECURITY DEFINER function must include `SET search_path = public, pg_catalog;` in its definition.

**Enable RLS on every new table** within the same migration, immediately after CREATE TABLE, before the RLS policies. Pattern:
```sql
ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;
```

### A.3 introducer_user_id FK on membership_payments (small — SEG-RC-A-3)

The `membership_payments` table (created in `20260608000002_bp077_membership_payments_table.sql`) has no `introducer_user_id`. Add it:

```sql
ALTER TABLE public.membership_payments
  ADD COLUMN IF NOT EXISTS introducer_user_id uuid REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_membership_payments_introducer
  ON public.membership_payments(introducer_user_id)
  WHERE introducer_user_id IS NOT NULL;
```

Include this in the same `20260610173000_bp079_red_carpet_substrate.sql` migration file (not a separate file — keep the substrate migration atomic).

**Update `supabase/functions/create-membership-checkout/index.ts`** (per Truth-Always finding #3):

The function already reads a POST body with `inviteCode`, `isRenewal`, `autoRenew`. Add `introducer_user_id` to the body destructure:

```typescript
const { inviteCode, isRenewal, autoRenew, introducer_user_id } = body;
```

Pass `introducer_user_id` into the Stripe session metadata:
```typescript
metadata: {
  user_id: user.id,
  invite_code: inviteCode,
  is_renewal: isRenewal ? "true" : "false",
  auto_renew: autoRenew ? "true" : "false",
  introducer_user_id: introducer_user_id || "",
}
```

**Update `supabase/functions/handle-membership-webhook/index.ts`** (per Truth-Always finding #3 — this is the correct webhook, not `verify-credit-payment`):

In the `checkout.session.completed` handler, extract and write `introducer_user_id`:
```typescript
const introducer_user_id = session.metadata?.introducer_user_id || null;
// ...when inserting / updating membership_payments row:
// include introducer_user_id in the upsert
```

Read the existing handler first before modifying — it may have its own insert pattern; match it exactly.

### A.4 Wire SeamlessOnboardDialog Supabase writes (small-medium — SEG-RC-A-4)

Locate `SeamlessOnboardDialog` in `platform/src/`. Bishop audit: auth form works (Supabase Auth SDK calls fire); post-auth Supabase writes are missing.

After successful `supabase.auth.signUp()` or `supabase.auth.signInWithPassword()`:

**Write 1 — mark red_carpet_access grant used:**
If the dialog was invoked with a `grantToken` prop, call `supabase.rpc('mark_red_carpet_grant_used', { p_grant_token: grantToken })` (the SECURITY DEFINER function created in A.2). This marks `used_at = now()` and sets `recipient_user_id = auth.uid()`.

**Write 2 — record onboarding step:**
Upsert into `mc_onboarding_paths` — check existing schema for required columns first. At minimum: `{ user_id: user.id, step: 'red_carpet_signup', source: 'seamless_onboard_dialog', created_at: new Date().toISOString() }`. Match existing column names exactly.

**Write 3 — if came via cue card share landing:**
If the dialog was invoked with both `grantToken` AND `clickToken` (from the cue_card_share_clicks row), update:
```typescript
await supabase
  .from('cue_card_share_clicks')
  .update({ converted: true, conversion_event_id: referralRowId })
  .eq('click_token', clickToken);
```
The `referralRowId` comes from the creator_referrals row created in the same flow.

**Write 4 — create creator_referrals row:**
If `introducer_user_id` is known (passed as prop from the landing page context), insert into `creator_referrals`:
```typescript
await supabase.from('creator_referrals').insert({
  referrer_id: introducer_user_id, // existing column
  introducer_user_id: introducer_user_id, // new RC column
  referred_handle: user.email || '',
  referred_platform: 'email',
  cue_card_sent_at: new Date().toISOString(),
  referred_user_id: user.id,
  business_node_type: nodeType || null,
  business_card_id: cardId || null,
  first_seen_at: new Date().toISOString(),
});
```

**Return `introducer_user_id` to caller** via a callback prop (e.g., `onAuthSuccess?: (userId: string, introducerId: string | null) => void`) so the Stripe checkout link can carry it.

**RLS check:** The policies on `red_carpet_access` allow `recipient_user_id = auth.uid()` SELECT — but at the time `mark_red_carpet_grant_used` fires, the user just signed up and `recipient_user_id` IS NULL (populated by the function). The SECURITY DEFINER function bypasses RLS for this single write — that is the correct and intended pattern. Confirm the function is SECURITY DEFINER before running.

### A.5 Verify (SEG-RC-A-5)

1. **Migration smoke test:** Run `supabase db reset --local` OR `supabase migration up` against a local or staging Supabase instance. Confirm: (a) no migration errors; (b) `creator_referrals` has the new RC columns; (c) all 8 new tables exist; (d) RLS is enabled on all new tables (`SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true`); (e) `membership_payments` has `introducer_user_id` column.

2. **Route smoke test:** `npm run dev` → navigate to each of the 11 registered paths → confirm HTTP 200 + component renders (even blank) instead of React Router 404.

3. **SeamlessOnboardDialog:** In dev console, simulate auth signup → confirm `mark_red_carpet_grant_used` RPC call fires in Supabase logs → confirm `mc_onboarding_paths` row is written.

4. **Stripe metadata test:** Use Stripe CLI `stripe trigger checkout.session.completed` with a crafted payload carrying `metadata.introducer_user_id` → confirm `handle-membership-webhook` writes it to `membership_payments.introducer_user_id`.

5. **Truth-Always check:** if any table Knight's migration tries to CREATE already exists (e.g. `referrals` or `social_frame_locks`), surface the existing schema rather than erroring. Use `CREATE TABLE IF NOT EXISTS` pattern throughout and log any IF-NOT-EXISTS skips.

### A.6 Commit + push (SEG-RC-A-6)

Standard commit message format: `feat(bp079): red carpet wave A — substrate + routes + auth wiring`. Push to main. Tag internal milestone (NOT a semver release tag): `bp079-red-carpet-wave-a`. Confirm tag appears in `git tag -l`.

---

## WAVE B — Page Logic + Food-Node Subscription + Vesting (target: 2 days wall-clock)

**Only fire Wave B after Wave A verify is green. If context budget is < 30%, surface and Bishop will re-Yoke Wave B fresh rather than compacting mid-build.**

### B.1 Wire FoodNodeCueCard + LocalBusinessNodeCueCard to live data (medium — SEG-RC-B-1)

Both pages are currently shells. Wire them to live tables.

**FoodNodeCueCard:**

1. On mount: fetch `cue_card_templates WHERE node_type = 'food' AND system_owned = true ORDER BY template_name` — populate a template selector (dropdown or card grid).
2. If `id` param is set in the route: load the existing `leviathan_cue_cards` row for editing/preview mode.
3. Form fields from the template payload (customizable): business_name, owner_name, hook_copy (one-line pitch), cover_image_url (optional upload), contact_phone (optional).
4. Real-time preview panel beside the form showing the rendered card.
5. "Generate Card" CTA:
   - Generate `short_token`: random 8-char URL-safe base62 (e.g., `nanoid(8)` if available, or custom implementation).
   - INSERT into `leviathan_cue_cards` with creator_user_id = auth.uid(), node_type = 'food', template_id, payload = form values, short_token, created_at.
   - On success: display the share URL (`https://lianabanyan.com/cue-card/landing/<short_token>`) + a QR code (use a QR lib already in package.json if available; if not, `qrcode` npm package is acceptable to add; check package.json first).
   - Downloadable PNG/PDF: if a canvas-to-image or html2canvas lib is available in package.json, implement download; if not, a "copy link" button is acceptable as the MVP with a TODO comment.

**LocalBusinessNodeCueCard:** same pattern with `node_type = 'local-business'`. Reuse the same base component logic — extract a shared `<CueCardBuilder nodeType={...} />` component to avoid duplication.

### B.2 Wire CueCardLanding + CueCardShareLanding (medium — SEG-RC-B-2)

**CueCardShareLanding** — this is the URL Founder physically hands to the food truck owner (printed card, QR, or verbal):

Route: `/cue-card/landing/:shareToken`

On mount:
1. Read `:shareToken` from URL params.
2. Fetch `leviathan_cue_cards WHERE short_token = shareToken` via a SECURITY DEFINER RPC or an anon-readable policy (the card itself is public once you have the token — this is the intended UX).
3. Record click: call `supabase.rpc('record_cue_card_click', { p_card_id: card.id, p_anon_session_id: getOrCreateAnonSessionId(), p_ip_country: '', p_ua_class: detectUAClass() })` — store the returned `click_token` in component state for use in SeamlessOnboardDialog.
4. Render:
   - Warm greeting: "**[Founder display_name]** invited you to join LianaBanyan."
   - The customized card payload (business name, owner name, hook copy, cover image if set).
   - CTA button: **"Walk through this with me"** → opens `RedCarpetWalkthrough` as a modal or navigates to `/red-carpet?cardId=<card.id>&token=<shareToken>`.

**CueCardLanding** — the post-walkthrough decision page:

Route: `/cue-card/welcome/:cardId`

On mount:
1. Fetch `leviathan_cue_cards WHERE id = cardId`.
2. Fetch the introducer's display_name from `profiles WHERE id = card.creator_user_id`.
3. Render a summary of what the food truck owner is agreeing to (membership, what they get).
4. CTA: **"Yes, I want this"** → opens `SeamlessOnboardDialog` with:
   - `introducer_user_id = card.creator_user_id`
   - `cardId = card.id`
   - `clickToken` (from session storage or state passed through the walkthrough)
   - `grantToken` (if a `red_carpet_access` grant was pre-created for this card — look up by card_id)
5. After auth success (callback from SeamlessOnboardDialog): redirect to Stripe checkout for $5 membership, appending `introducer_user_id` in the checkout call.

### B.3 Replace RedCarpetWalkthrough hardcoded data with live cue card payload (small — SEG-RC-B-3)

Locate `platform/src/pages/RedCarpetWalkthrough` (or equivalent component path). Currently uses data from `@/data/redCarpetRecipients`.

Replace with:
- Accept a `cardId?: string` prop (or read from URL query param if rendered as a page).
- If `cardId` is present: fetch `leviathan_cue_cards WHERE id = cardId` and render dynamic payload.
- If `cardId` is absent: fall back to the existing static `redCarpetRecipients` data (for demo/testing).

No other logic change — the walkthrough UX flow stays the same. Only the data source changes.

### B.4 Wire cueCardClickTracking + cueCardDestinationService to live tables (small — SEG-RC-B-4)

Locate `platform/src/lib/cueCardClickTracking.ts` and `platform/src/lib/cueCardDestinationService.ts` (or equivalent paths — search if different).

With Wave A migrations landed, the backing tables now exist. Smoke test each query path:
1. Open each lib file and catalog every Supabase query (table name + operation).
2. Run each query against the local/staging DB and confirm no runtime errors.
3. Fix any column name mismatches between the lib code expectations and the actual migration columns (e.g., if lib code uses `card_id` but migration used `cue_card_id`).
4. Surface all mismatches found — fix in-place using the lib code as the source of truth for naming if it's more deeply embedded (or vice versa if the migration naming is cleaner). Knight decides based on blast radius.

### B.5 Food-node subscription shape (medium — SEG-RC-B-5)

**Bishop recommends Option A (clean separation). Knight chooses based on operational knowledge.**

**Option A — Create `food_node_subscriptions` table:**
```
id uuid PK default gen_random_uuid()
subscriber_user_id uuid NOT NULL REFERENCES auth.users(id)
food_business_entity_id uuid NOT NULL REFERENCES entity_memberships(id)
stripe_subscription_id text UNIQUE
stripe_customer_id text
weekly_intake int NOT NULL DEFAULT 1 -- number of meals/portions per week
delivery_day text CHECK (delivery_day IN ('monday','tuesday','wednesday','thursday','friday','saturday','sunday'))
delivery_address jsonb DEFAULT '{}'
status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','paused','canceled'))
introducer_user_id uuid REFERENCES auth.users(id) -- who introduced the food truck owner
created_at timestamptz DEFAULT now()
canceled_at timestamptz
```
RLS: subscriber owns; food business owner can SELECT (join via entity_memberships.owner_user_id = auth.uid()); service_role full.

**Stripe flow for food-node subscriptions:**
- Create a new edge function `create-food-node-subscription-checkout` (or extend `create-subscription-checkout` with a `vertical: 'food-node'` param if that function is generic enough — Knight checks).
- The subscription price_id should come from `STRIPE_PRICE_FOOD_NODE_WEEKLY` env var.
- Session metadata: subscriber_user_id, food_business_entity_id, introducer_user_id, weekly_intake, delivery_day.
- Webhook: either extend `handle-subscription-webhook` with a food-node branch, or create `handle-food-node-subscription-webhook`. Knight decides based on the existing webhook structure.

**Option B — if Knight chooses reuse:** ALTER `excalibur_subscriptions` with `vertical text DEFAULT 'excalibur'` + `food_business_entity_id uuid REFERENCES entity_memberships(id)`. Surface in Yoke-return why Option B was chosen.

Add the new table/migration as part of a second migration file: `20260610180000_bp079_food_node_subscription.sql` (separate from the A.2 substrate migration to keep Wave A and Wave B migrations distinct and independently revertable).

### B.6 Activate vesting triggers (medium — SEG-RC-B-6)

Edge functions `cue-card-vesting-check` and `cue-card-vesting-trigger` are deployed. With Wave A landed (promotion_attributions + leviathan_cue_cards exist), they can run.

**Step 1 — Audit existing function code:**
Read `supabase/functions/cue-card-vesting-check/index.ts` and `supabase/functions/cue-card-vesting-trigger/index.ts`. Catalog every table they reference. Confirm each table now exists post-Wave-A. Fix any remaining mismatches in the function code (column renames, missing FKs).

**Step 2 — Schedule vesting-check as Supabase cron:**
In Supabase Dashboard → Database → Extensions → enable `pg_cron` if not already enabled.
Create cron entry:
```sql
SELECT cron.schedule(
  'cue-card-vesting-check-daily',
  '0 2 * * *', -- 02:00 UTC daily
  $$SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/cue-card-vesting-check',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  )$$
);
```
Add this as `20260610190000_bp079_vesting_cron.sql` migration file.

**Step 3 — Wire attribution creation on Stripe webhook:**
In `handle-membership-webhook/index.ts`, after writing the `membership_payments` row with `introducer_user_id`, if `introducer_user_id` is non-null:
```typescript
await supabase.from('promotion_attributions').insert({
  introducer_user_id: introducer_user_id,
  attributed_amount_cents: 500, // $5 in cents — canonical share, not the full payment
  currency_class: 'credits',
  attribution_event: 'first_payment',
  source_payment_id: paymentRowId,
  vesting_unlock_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30-day vesting window — Bishop canon from Gain-Share v2
});
```
The 30-day vesting window is from Gain-Share counsel canon (BP070). If there is a different vesting window in the existing vesting-check function code, Knight surfaces the discrepancy and uses the existing function's window as authoritative.

**Step 4 — Minimal claim page:**
Check if a `/my-attributions` or `/my-credits` or `/my-referrals` page already exists in the route files. If yes, wire the `promotion_attributions` data into it. If no, create a minimal `MyAttributionsPage` at `/red-carpet/my-credits` showing a table of vesting attributions with claimed_at status. No complex UI — a simple sortable table is sufficient. Add the route to `redCarpet.tsx`.

### B.7 End-to-end test — BINDING (medium — SEG-RC-B-7)

This SEG is binding per feedback_ux_seg_screenshot_mandatory_bp078. Source-only verify is a canon violation. Knight MUST produce screenshots or a screen recording of the live web app.

**Simulate the full food-truck flow:**

1. Founder logs into the platform as themselves → navigates to `/cue-card/food-node` → fills in "Joe's Food Truck" → clicks "Generate Card" → screenshot the generated card + share URL + QR code.

2. Copy the share URL. Open it in a NEW INCOGNITO BROWSER window (simulating Joe the food truck owner arriving cold). Screenshot the CueCardShareLanding page showing the warm greeting and card content.

3. Click "Walk through this with me" → step through RedCarpetWalkthrough → screenshot each step (or at minimum the first and last step of the walkthrough).

4. Click "Yes, I want this" on CueCardLanding → screenshot the decision page before clicking.

5. Complete SeamlessOnboardDialog signup with a test email → screenshot the auth form completion.

6. Stripe checkout opens (test mode, STRIPE_TEST_KEY) → screenshot the checkout page.

7. Complete Stripe test checkout (use card `4242 4242 4242 4242`).

8. **Verify database state** — screenshot of Supabase table editor OR output of these queries:
   ```sql
   SELECT used_at FROM red_carpet_access WHERE card_id = '<card_id>';
   SELECT introducer_user_id, business_card_id FROM creator_referrals ORDER BY created_at DESC LIMIT 1;
   SELECT converted FROM cue_card_share_clicks ORDER BY clicked_at DESC LIMIT 1;
   SELECT introducer_user_id FROM membership_payments ORDER BY created_at DESC LIMIT 1;
   SELECT attribution_event, vesting_unlock_at, claimed_at FROM promotion_attributions ORDER BY created_at DESC LIMIT 1;
   ```
   All 5 rows must show the expected values. Screenshot the results.

**Minimum acceptable evidence:** steps 1, 2, 5 (auth form), 8 (DB state) must be screenshot-evidenced. Steps 3, 4, 6 are strongly preferred but step 7 (Stripe completion page) is acceptable as the checkout confirmation substitute for 6.

### B.8 Commit + push + ship (SEG-RC-B-8)

**If the Red Carpet pages are purely web-platform (lianabanyan.com) with no change to the Electron desktop app (MnemosyneC):** no new MnemosyneC release needed. Commit + push to main + Firebase deploy only.

**If any change touches `platform/src/renderer/` or `electron/` paths (unlikely for Red Carpet which is web-only):** cut v0.1.40 per standard release procedure.

Commit message: `feat(bp079): red carpet wave B — page logic + food-node subscriptions + vesting`.
Tag: `bp079-red-carpet-wave-b`.
Firebase deploy: `firebase deploy --only hosting` (or project-specific deploy command — check `package.json` scripts).

Confirm deploy is live at `https://lianabanyan.com/red-carpet` before marking Wave B complete.

---

## Reply contract

Yoke-return: one consolidated response. Write it to a fresh file at:
`C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_YOKE_RED_CARPET_WAVE_A_AND_B_2026-06-10_RESPONSE.md`

Include all of the following:

**Per SEG (A-1 through B-8):**
- Result (COMPLETE / PARTIAL / BLOCKED)
- Commit SHA(s)
- Any drift caught (table already existed, column name mismatch, etc.)

**Schema summary:**
- Tables newly CREATED (count)
- Tables ALTERED (count + which ones)
- RLS enabled count (must equal tables created + altered)
- Function/RPC count

**Routes registered:**
- List each path + component + access tier

**Stripe edge function updates:**
- List each function modified + what changed

**End-to-end test evidence:**
- Screenshot paths or embedded (B.7)
- All 5 DB state queries passed: YES/NO per row

**Wall-clock duration:**
- Wave A actual
- Wave B actual

**Truth-Always findings:**
- Any table Bishop said was missing that Knight found already EXISTS
- Any table Bishop said exists that Knight found is different shape
- Any Bishop column spec that conflicts with an existing column

**Open obligations:**
- Anything that could not be completed + reason

**Release:**
- v0.1.40 SHA + release URL if applicable
- Firebase deploy URL confirmed live

---

## Statute reminders for Knight

- **Statute §3 (Sonnet 4.6):** explicit on every sub-dispatch. If Knight foreman sees a SEG self-reporting as a different model, reject and re-dispatch.
- **Statute §12 Ask-Knight-First:** Knight chooses Option A/B on subscription shape (B.5) + choice of extending create-subscription-checkout vs new function (B.5) + blast-radius call on column name mismatches (B.4). Bishop has deferred these by design.
- **canon_fix_as_we_go_build_for_the_long_haul_always_convenient_immutables_bp053:** always-convenient = this is the launch-sequence activation Founder has been waiting for; fix mid-wave drift in-place; structural fixes over patches.
- **feedback_ux_seg_screenshot_mandatory_bp078:** B.7 is PACKAGED-INSTALL or LIVE-WEB screenshot. Source-only verify is a canon violation. Knight has violated this three times in prior sessions — do not repeat.
- **feedback_actual_runtime_verify_for_runtime_bugs_bp078:** especially for the Stripe webhook + vesting cron. Confirm with real fire (Stripe CLI trigger or test checkout completion), not code review alone.
- **feedback_every_click_visible_feedback_canon_bp078:** every button in the new pages (Generate Card, Walk through this with me, Yes I want this) MUST produce visible feedback on click — spinner, toast, navigation. No silent buttons.
- **feedback_long_running_progress_heartbeat_canon_bp078:** if QR code generation or card creation takes >3s, show a progress indicator. No silent loading states.
- **canon_three_currency_no_fiat_substitution_bp078:** promotion_attributions uses credits/marks/joules ONLY. No fiat amounts are credited to introducer. The $5 Stripe payment is the BUSINESS OWNER's fiat payment to LianaBanyan. The introducer gets Credits. These are separate things.

---

## Paste-ready Founder wake-up prompt for Knight

> Knight, NEW Yoke at `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_YOKE_RED_CARPET_WAVE_A_AND_B_2026-06-10.md`. Founder ratified the full Red Carpet build — he has a local food truck to approach in person and this needs to work before that meeting. Bishop audit verdict was RED (0/9 layers). This Yoke specs Wave A (substrate + routes + auth wiring, ~1 day) and Wave B (page logic + food-node subscriptions + vesting, ~2 days). Read the TRUTH-ALWAYS CORRECTIONS section first before writing any migration — Bishop's source-only audit had two wrong findings (creator_referrals and profiles both already exist in baseline). Sonnet 4.6 SEGs mandatory (Statute §3). Live-web screenshot verify is binding for B.7 — source-only is a canon violation. Yoke-return to `BISHOP_YOKE_RED_CARPET_WAVE_A_AND_B_2026-06-10_RESPONSE.md` in the same directory.
>
> — Bishop · BP079 · pinned 2026-06-10T17:30:00Z

---

*Bishop — SEG-RC-YOKE — BP079 — 2026-06-10T17:30:00Z*
