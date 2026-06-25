---
KNIGHT YOKE: BLACK MAMBA SUBSTRATE MARKET WIRING
BP087 | BRICK WALL PRE-AUTHORIZED | Founder direct: "We ride TONIGHT."
Issued by: Bishop (SEG-N) | Date: 2026-06-19
---

## §0 HEADER

- Yoke name: BLACK MAMBA SUBSTRATE MARKET WIRING
- Session: BP087
- Pre-authorization: BRICK WALL (Founder direct verbatim this turn)
- Parallel yokes: SEG-O / SEG-P / SEG-Q running concurrently
- Model: claude-sonnet-4-6 verbatim (Statute §3)
- Absolute path root: C:\Users\Administrator\Documents\LianaBanyanPlatform

---

## §1 CONTEXT AND DOCTRINE

BP086 ratified the Substrate Market doctrine across 8 canons. BP087 wires it into code.

Key principles locked at BP086:

- Restaurants first application: 5+ items at Cost+20%, geographic service area, zero delivery-app extraction
- Preferences INFERRED not interrogated: NO questionnaires ever; substrate infers from natural interaction (search, click, save, share, declare)
- No paid placement: substrate is the moat, not paywall
- 83.3% to cook/restaurant; 16.7% application_fee_amount via Stripe Connect Express
- Companies Joining In public page: entity_membership WHERE node_type='food' AND status='live', zero auth, zero sponsored ranking
- "Coffee's for Closers. Help Yourself.": every lead self-qualifies before they reach you

**CRITICAL RECON FINDING (Bishop gadget-verified 2026-06-19 psql):**

Tables already in public schema:
```
 entity_memberships        (K427: uses id PK, entity_type col, status IN ('pending','active','suspended','cancelled','pledged_commons'))
 entity_membership_audit   (K427)
 food_node_subscriptions   (BP079: food_business_entity_id REFERENCES entity_memberships(id))
```

MAMBA-SM-alpha is EXTEND, not replace. Knight MUST NOT create a new entity_membership table.
No member_business_profile, member_preference_inferred, substrate-match, or Companies-Joining-In content exists. All four are net-new.

---

## §2 SEG FAN-OUT PROTOCOL

Sonnet 4.6 verbatim. Wave 1 fires 5 SEGs concurrently. Wave 2 gates on all Wave 1 receipts.

Statute §14 (GADGET-FIRST BLOOD): Bishop ran gadget-verify pre-flight (see §9). Knight re-gadgets on any new ambiguity.
Statute §15 (BISHOP-DIRECT-SUPABASE BLOOD): Knight ships .sql to migrations folder; Bishop applies via psql safe subshell. Knight never calls supabase CLI for schema changes.

---

## §3 WAVE 1 TASKS (PARALLEL)

---

### MAMBA-SM-alpha: entity_memberships ALTER + member_business_profile

**File to ship:**
`C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\migrations\20260619000001_bp087_substrate_market_entity_membership_extend.sql`

Schema changes (EXTEND only; do not break food_node_subscriptions FK):

1. ADD COLUMN node_type TEXT CHECK (node_type IN ('food','goods','services','knowledge','gaming','other'))
2. ALTER status CHECK to include 'live': IN ('pending','active','live','suspended','cancelled','pledged_commons')
3. ADD COLUMN service_area_geojson JSONB
4. ADD COLUMN live_since TIMESTAMPTZ
5. CREATE INDEX on (node_type, status) WHERE status = 'live'
6. ADD RLS policy: anon SELECT WHERE status = 'live'

CREATE TABLE member_business_profile:
- entity_id UUID PRIMARY KEY REFERENCES entity_memberships(id) ON DELETE CASCADE
- pitch_md TEXT
- offerings_count INT NOT NULL DEFAULT 0
- cost_plus_20_floor_price NUMERIC(10,2)
- accepts_marks BOOLEAN NOT NULL DEFAULT TRUE
- accepts_credits BOOLEAN NOT NULL DEFAULT TRUE
- service_area_polygon GEOMETRY(POLYGON, 4326)
- stripe_connect_account_id TEXT
- created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
- updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

RLS on member_business_profile:
- anon SELECT WHERE entity is live (join to entity_memberships status='live')
- operator SELECT/UPDATE/INSERT WHERE primary_contact_user_id = auth.uid() (join to entity_memberships)
- service_role full

Seed: INSERT INTO entity_memberships (entity_name='Pilot Kitchen #1', entity_type='small_business', node_type='food', status='live', live_since=NOW(), primary_contact_name='Cooperative Pilot', primary_contact_email='pilot@lianabanyan.com', tier_price_usd=0) ON CONFLICT DO NOTHING

Bishop applies via psql safe subshell after Knight ships the .sql.

---

### MAMBA-SM-beta: member_preference_inferred schema

**File to ship:**
`C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\migrations\20260619000002_bp087_substrate_market_preference_inferred.sql`

CREATE TABLE member_preference_inferred:
- member_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- topic_tag TEXT NOT NULL
- weight_decimal NUMERIC(5,4) NOT NULL DEFAULT 0.0 CHECK (>= 0 AND <= 1)
- last_observation_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
- observation_count INT NOT NULL DEFAULT 1
- PRIMARY KEY (member_user_id, topic_tag)

COMMENT: "NEVER populated from questionnaire data. Inferred from natural opt-in interaction only. Per canon_preferences_inferred_not_interrogated_no_questionnaire_substrate_bp086."

Indexes: (member_user_id, weight_decimal DESC); (topic_tag)

Function upsert_member_preference_inferred(p_member_user_id, p_topic_tag, p_weight_delta):
- If row exists: decay existing weight by 0.95^(days_elapsed) then add delta, clamp [0,1]
- If row not exists: INSERT with weight = delta
- Updates last_observation_at and observation_count

HARD CONSTRAINT: NO questionnaire data. Observation events only. Per BP086 canon.

RLS:
- member SELECT/UPDATE/INSERT/DELETE own rows (auth.uid() = member_user_id)
- service_role full

Bishop applies via psql safe subshell after Knight ships the .sql.

---

### MAMBA-SM-gamma: substrate-match Edge Function

**File to ship:**
`C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\functions\substrate-match\index.ts`

POST contract:
- Input: { member_user_id: string, query_text: string, lat_lon: [number, number], radius_km: number }
- Output: { matches: Array<{ entity_id, name, node_type, distance_km, preference_score, combined_score, pitch_md }> }

Algorithm:
- preference_score: dot product of query keyword tokens against member_preference_inferred weights for matching topic_tags
- distance_score: 1 - (distance_km / radius_km) clamped [0,1]
- combined_score: (preference_score * 0.7) + (distance_score * 0.3)
- ORDER BY combined_score DESC
- Filter: entity_memberships WHERE status = 'live'
- Uses pgvector if available; keyword-overlap fallback otherwise
- No paid placement. No sponsored ranking. Substrate is the moat.
- 400 for missing fields; 401 for missing auth; 500 with no internal detail leaked

---

### MAMBA-SM-delta: Stripe Connect Express wiring

**File to ship:**
`C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\stripe\substrate-market-stripe.ts`

Required exports:
- createStripeConnectExpressAccount(entity_id: string, operator_email: string): Promise<string>
  - Called when entity status transitions to 'live'
  - Stores returned stripe_connect_account_id in member_business_profile.stripe_connect_account_id
- computeApplicationFee(totalAmountCents: number): number
  - Returns Math.round(totalAmountCents * 0.167)
  - 16.7% application fee; 83.3% flows to restaurant via destination charge
- createDestinationCharge(params: DestinationChargeParams): Promise<Stripe.PaymentIntent>

Unit test file to ship:
`C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\stripe\substrate-market-stripe.test.ts`
- Assert: computeApplicationFee(10000) === 1670 (16.7% of $100.00)

Wave B HELD: Atlas escrow + disbursement + COGS gate deferred per canon_food_node_pricing_substrate_market_wire_lmd_restaurants_kit_d_atlas_bp086. Requires Trial 02 receipt.

Note: stripe_connect_account_id column is in the member_business_profile spec in MAMBA-SM-alpha. Alpha must land before delta writes to that column.

---

### MAMBA-SM-epsilon: Companies-Joining-In public page

**Files to ship:**
`C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\content\companies-joining-in\_index.md`
`C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\companies-joining-in\list.html`

Knight: glob `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\config*` and confirm baseURL before shipping. Report domain in receipt.

Spec (per canon_companies_joining_in_public_page_cooperative_business_transparency_bp086):
- Auth: zero (public, no login required)
- Data source: entity_memberships WHERE node_type='food' AND status='live'
- Per-card fields: business name, location/service area, initiative badge ("Let's Make Dinner"), offering link
- Sort: alphabetical default
- No sponsored placement. No boosted listings. No ranking-by-spend. Ever.
- Pattern: Kit E browse (reuse merchant card shape from Seeker dashboard)
- Footer strapline verbatim: "Help Each Other Help Ourselves"
- Seed visibility: "Pilot Kitchen #1" (inserted in MAMBA-SM-alpha) must appear after Hugo rebuild

---

## §4 ACCEPTANCE GATES

- [ ] MAMBA-SM-alpha: node_type col present on entity_memberships; status CHECK includes 'live'; member_business_profile table present with RLS; seed entity "Pilot Kitchen #1" in DB; food_node_subscriptions FK intact [Bishop gadget-verifies via psql safe subshell after Knight ships the .sql]
- [ ] MAMBA-SM-beta: member_preference_inferred table present; RLS enabled; upsert function present [Bishop gadget-verifies via psql safe subshell after Knight ships the .sql]
- [ ] MAMBA-SM-gamma: substrate-match Edge Function deployed; smoke POST returns ranked match envelope with >= 1 result against seed entity
- [ ] MAMBA-SM-delta: createStripeConnectExpressAccount compiles; computeApplicationFee(10000) === 1670 passes; TSC clean
- [ ] MAMBA-SM-epsilon: Hugo build clean; page deploys to confirmed domain; "Pilot Kitchen #1" card visible
- [ ] TSC clean across all new .ts files
- [ ] food_node_subscriptions FK to entity_memberships(id) intact after alpha migration [Bishop gadget-verifies]
- [ ] Wave 2 MAMBA-SM-zeta HELD pending Trial 02 receipt (v0.5.13+)
- [ ] Wave 2 MAMBA-SM-eta HELD pending zeta completion

---

## §5 WAVE 2 TASKS (GATED ON WAVE 1 COMPLETE)

### MAMBA-SM-zeta: Restaurant onboarding flow
- Gate: All Wave 1 receipts COMPLETE + Trial 02 receipt (v0.5.13+)
- MnemosyneC tab: "Join the Cooperative as a Member Business" (food node first)
- 5-item menu minimum at Cost+20% enforced at form validation
- Service-area geojson upload (writes to entity_memberships.service_area_geojson)
- Stripe Connect Express onboarding redirect via createStripeConnectExpressAccount
- On completion: redirect to Companies-Joining-In page showing new business card

### MAMBA-SM-eta: Tagline placement
- Gate: MAMBA-SM-zeta complete
- Lightbulb tagline (Option A, Founder-ratified, BP087): substrate market homepage hero + onboarding completion screen + Companies-Joining-In footer
- "Coffee's for Closers. Help Yourself." (canon_coffees_for_closers_help_yourself_substrate_market_tagline_bp086): About page + Substack footer + membership modal
- NOT "Coffee's for Closers" on the substrate market hero (different channel per BP087 split-channel canon)

---

## §6 COMPOSITION REFERENCES

BP086 substrate-market canon slugs (8):

1. canon_cooperative_substrate_business_launch_built_in_customer_base_preferences_bp086
2. canon_restaurants_first_substrate_market_application_menus_5_cost_plus_20_items_bp086
3. canon_food_node_pricing_substrate_market_wire_lmd_restaurants_kit_d_atlas_bp086
4. canon_companies_joining_in_public_page_cooperative_business_transparency_bp086
5. canon_existing_gaming_communities_discord_reddit_substrate_bridge_12_cities_bp086
6. canon_preferences_inferred_not_interrogated_no_questionnaire_substrate_bp086
7. canon_coffees_for_closers_help_yourself_substrate_market_tagline_bp086
8. canon_substrate_connection_general_purpose_p2p_gaming_cost_plus_20_bp086

Additional compositions:
- canon_three_gear_currency_differential_credits_marks_joules_mechanism_bp086 (Credits/Marks/Joules; accepts_marks + accepts_credits cols on member_business_profile)
- canon_substitution_rail_fiat_marks_credits_barter_payment_taxonomy_bp086 (payment rails; Stripe = fiat rail at 16.7% margin)
- canon_marks_clearing_mechanisms_activity_rate_table_bp086 (5 Marks LMD meal; activity rates for preference inference triggers)
- canon_captains_ship_wheel_dr_mnemosynec_maritime_bp085 (Mnemo orchestrator; substrate-match is a core Mnemo routing call)
- canon_closing_liturgy_four_line_block_verbatim_bp085 (session floor)

Existing migrations composing with this yoke (do not break):
- 20260422100001_k427_entity_membership.sql
- 20260610180000_bp079_food_node_subscription.sql

---

## §7 KNIGHT RETURN TEMPLATE (per BP053 §4)

Knight returns empirical receipt only. No speculation. Format:

```
MAMBA-SM-[letter] RECEIPT
Date: YYYY-MM-DD
Status: COMPLETE | BLOCKED | PARTIAL
Files shipped:
  - [absolute path]
Gadget-verify command run: [psql command or deno deploy command]
Gadget-verify result: [output verbatim]
TSC result: [pass | fail + error count]
Blocker (if any): [verbatim error]
```

Return receipts to:
`C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\`
File naming: `RECEIPT_MAMBA_SM_[LETTER]_BP087.md`

---

## §8 STATUTES BINDING

- §2 IMMUTABLES: No schema or canon changes without Founder ratify. K427 table shape: ALTER ADD COLUMN only (no DROP, no RENAME).
- §3 Sonnet 4.6 verbatim: All SEGs use claude-sonnet-4-6 only.
- §4 Absolute paths: All file references use absolute paths.
- §14 GADGET-FIRST BLOOD: Bishop ran gadget-verify pre-flight (see §9). Knight re-gadgets on any new ambiguity mid-task.
- §15 BISHOP-DIRECT-SUPABASE BLOOD: Knight ships .sql; Bishop applies via psql safe subshell. Knight does NOT tell Founder to apply migrations.

---

## §9 RECON RECEIPT (Bishop pre-flight 2026-06-19)

DB gadget-verify result:
```
        tablename
-------------------------
 entity_memberships
 entity_membership_audit
 food_node_subscriptions
(3 rows)
```

Codebase file recon:
- FOUND: platform/supabase/migrations/20260422100001_k427_entity_membership.sql
- FOUND: platform/supabase/migrations/20260610180000_bp079_food_node_subscription.sql
- NOT FOUND: any substrate_market migration
- NOT FOUND: any member_business_profile migration
- NOT FOUND: any preference_inferred migration
- NOT FOUND: src/main/stripe/substrate-market-stripe.ts
- NOT FOUND: src/renderer/components/SubstrateMarket*
- NOT FOUND: Cephas/cephas-hugo/content/companies-joining-in/

All five MAMBA-SM Wave 1 tasks are net-new work except alpha which is EXTEND.

---

Help Each Other Help Ourselves.
FounderDenken / Crewman#6
