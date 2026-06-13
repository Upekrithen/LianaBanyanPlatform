# KNIGHT → BISHOP · YOKE-RETURN · RED CARPET WAVE A + WAVE B · BP079

**type: response**
**task: BP079_RED_CARPET_WAVE_A_B_2026-06-10T17:30:00Z**
**pin-marker: BP079_RED_CARPET_WAVE_A_B_2026-06-10T17:30:00Z**
**timestamp: 2026-06-10T20:36:00Z**
**status: COMPLETE (Wave A + Wave B landed; open items listed)**

---

## Wave A Commit
`b0b5e843992fd65ad394c1e3a0f7de5b0d5fd2c2`
Tag: `bp079-red-carpet-wave-a`

## Wave B Commits
`fec6dbc` — Wave B main (15 files, 1770 insertions, 454 deletions)
`3d57900` — QRCodeSVG import fix
Tag: `bp079-red-carpet-wave-b`

## Firebase Deploy
`hosting:main` live at https://lianabanyan.com
`/cue-card/food-node/build` → 200 confirmed

---

## Per-SEG Results

| SEG | Result | Notes |
|---|---|---|
| A-1 Routes | COMPLETE | 11 routes registered in redCarpet.tsx under commerce portal group |
| A-2 Schema migration | COMPLETE | 316-line migration; 8 tables created; 2 tables altered |
| A-3 Edge functions | COMPLETE | create-membership-checkout + handle-membership-webhook updated |
| A-4 SeamlessOnboardDialog | COMPLETE | 4 post-auth writes + 7 new props (non-blocking error handling) |
| A-5 Verify | COMPLETE | TypeScript clean; migration sanity passed; legacy routes cleaned from onboarding.tsx |
| A-6 Ship | COMPLETE | Committed + tagged + pushed |
| B-1 CueCard Builder | COMPLETE | CueCardBuilder.tsx + FoodCueCardBuilderPage + LocalBusinessCueCardBuilderPage |
| B-2 Landing Pages | COMPLETE | CueCardShareLanding + CueCardLanding wired to live tables |
| B-3 Walkthrough | COMPLETE | RedCarpetWalkthrough accepts cardId prop; falls back to static data |
| B-4 Lib rewrite | COMPLETE | Both libs rewritten to Wave A schema; TypeScript clean |
| B-5 Food subscriptions | COMPLETE | food_node_subscriptions migration (Option A) + edge function |
| B-6 Vesting | COMPLETE | New promotion-attribution-vesting-check fn + cron + MyAttributionsPage |
| B-7 E2E verify | PARTIAL | UI screenshots taken; DB state blocked (migration not yet applied to remote) |
| B-8 Ship | COMPLETE | Build clean; Firebase deployed; commit + tag pushed |

---

## Schema Summary

**Tables Created (8):** cue_card_templates, leviathan_cue_cards, red_carpet_access, cue_card_share_clicks, cue_card_destinations, promotion_attributions, referrals (IF NOT EXISTS), social_frame_locks (IF NOT EXISTS), food_node_subscriptions

**Tables Altered (2):** creator_referrals (+7 RC columns), membership_payments (+introducer_user_id)

**RLS Enabled:** 9 tables (all new tables + food_node_subscriptions)

**Functions/RPCs Created (2):** mark_red_carpet_grant_used (SECURITY DEFINER), record_cue_card_click (SECURITY DEFINER)

**Edge Functions Modified:** create-membership-checkout, handle-membership-webhook

**Edge Functions Created:** create-food-node-subscription-checkout, promotion-attribution-vesting-check

---

## Routes Registered

| Path | Component | Access |
|---|---|---|
| /cue-card/food-node/:id? | FoodNodeCueCard (campaign nomination) | ProtectedRoute |
| /cue-card/food-node/build | FoodCueCardBuilderPage | ProtectedRoute |
| /cue-card/local-business/:id? | LocalBusinessNodeCueCard (campaign) | ProtectedRoute |
| /cue-card/local-business/build | LocalBusinessCueCardBuilderPage | ProtectedRoute |
| /cue-card/tribe/:id? | TribeNodeCueCard | ProtectedRoute |
| /cue-card/service/:id? | ServiceNodeCueCard | ProtectedRoute |
| /cue-card/share/:cardId | CueCardShare | ProtectedRoute |
| /cue-card/generate/:nodeType | CueCardGeneratorV2 | ProtectedRoute |
| /cue-card/landing/:shareToken | CueCardShareLanding | Public |
| /cue-card/welcome/:cardId | CueCardLanding | Public |
| /red-carpet | RedCarpet | ExplorerRoute |
| /red-carpet/creator | CreatorRedCarpet | ProtectedRoute |
| /red-carpet/landing/:token | RedCarpetLandingV2Page | Public |
| /red-carpet/my-credits | MyAttributionsPage | ProtectedRoute |

---

## Stripe Edge Function Updates

| Function | Change |
|---|---|
| create-membership-checkout | Added introducer_user_id to body destructure + Stripe metadata |
| handle-membership-webhook | Extracts introducer_user_id from metadata; writes membership_payments; creates promotion_attributions row (500 credits, 30-day vesting) when non-null |

---

## End-to-End Test Evidence (B.7)

**UI verified:** Protected routes at /cue-card/food-node/build correctly redirect to auth. Landing page (/cue-card/landing/:token) displays card content + SeamlessOnboardDialog. Production URL (lianabanyan.com) loads and routes correctly.

**DB state queries:** BLOCKED — Wave A+B migrations not yet applied to remote Supabase (local migration files exist; apply via `supabase migration up` or Supabase dashboard SQL editor). Once applied, run the 5 DB state queries from Yoke B.7 spec to confirm all rows write correctly.

**Canon note:** `feedback_ux_seg_screenshot_mandatory_bp078` — screenshots were taken of auth dialogs and route behavior. Full Stripe checkout → DB attribution flow cannot be verified until migrations are applied to remote. This is a partial close on B.7.

---

## Wall-Clock Duration

**Wave A:** ~6 minutes (3 parallel SEGs + verify+ship)
**Wave B:** ~15 minutes (4 parallel SEGs + ship)
**Total:** ~21 minutes

---

## Truth-Always Findings

1. **referrals table schema mismatch (FORWARD FLAG for Wave B/C code):** The `referrals` table already exists in baseline with columns: referrer_id, referred_email, status, source_pool_id, user_id. Wave A spec defined different columns. IF NOT EXISTS preserved existing table. Any Wave B/C code touching `referrals` must query actual schema first.

2. **social_frame_locks exists in baseline:** Schema comparison recommended before Wave C touches this table.

3. **FoodNodeCueCard.tsx is a campaign nomination flow, NOT a cue card builder.** New builder pages created at FoodCueCardBuilderPage.tsx and LocalBusinessCueCardBuilderPage.tsx. Routes are /cue-card/food-node/build and /cue-card/local-business/build.

4. **Existing cue-card-vesting-check and cue-card-vesting-trigger are for LB Frame / Pied Piper system**, not Red Carpet. New promotion-attribution-vesting-check function created for Red Carpet.

5. **mc_onboarding_paths uses current_step (int) and path_variant (text)**, not step/source as spec said. SeamlessOnboardDialog writes correct column names.

6. **credit_wallets identified as the credits balance table.** Vesting-check function updated to upsert balance + lifetime_earned on claim.

7. **cueCardClickTracking and cueCardDestinationService were written for an older schema.** Rewritten to Wave A. Two components (CueCardDestinationConfig, BeaconRunCueCard) have TODO markers — non-blocking.

---

## Open Obligations

| Item | Owner | Blocker? |
|---|---|---|
| Apply Wave A+B migrations to remote Supabase | Founder/Knight | YES — DB state unverified until done |
| Full B.7 DB state verification (5 queries) | Knight | After migration applied |
| Multi-target Firebase deploy (dotcom/biz/org/net) | Knight | Attempted; confirm separately |
| CueCardDestinationConfig redesign | Knight Wave C | Non-blocking |
| BeaconRunCueCard cue_card_id lookup | Knight Wave C | Non-blocking |
| Food-node Stripe webhook handler | Wave C | Non-blocking |
| STRIPE_PRICE_FOOD_NODE_WEEKLY env var | Founder | Needed before food-node subscriptions go live |
| Wave C: await Founder α/β/γ ratification (Marks vesting, Seeker collision, self-intro guard) | Founder | Wave C gated on these |
| Live-web screenshot with full Stripe flow | Knight/Founder | Canon obligation — after migrations applied |

---

## v0.1.40 / Release

No MnemosyneC (Electron) changes in Wave A+B — all changes are web-platform (lianabanyan.com). No v0.1.40 release needed.

Firebase live: https://lianabanyan.com

---

*Knight · BP079 · 2026-06-10T20:36:00Z*
*knight-bishop-bridge MCP was errored — filing to BISHOP_DROPZONE as canonical fallback per R-USE-THE-YOKE*
