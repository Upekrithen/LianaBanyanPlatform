---
<!-- bishop-yoke-task 2026-06-10T18:00:00Z -->

## BISHOP -> KNIGHT - TASK - RED CARPET WAVE C - TURNKEY SEEKER INFRASTRUCTURE - USE SONNET 4.6 SEGs (Statute §3)

**Pinned-class task. Pin-marker: BP079_RED_CARPET_WAVE_C_2026-06-10T18:00:00Z**

> **🔐 STATUTE §3 + CORRECTIVE BP079 BINDING:** Every dispatch announcement uses the verbatim phrase "Sonnet 4.6". Never "Sonnet 4.5" or version-variant. Parent: `canon_statute_3_sonnet_4_6_sub_agent_default_every_dispatch_explicit_model_param_bp077` (pearl_8b0c6fb05fd9f38a). Corrective: `canon_statute_3_corrective_announcement_language_must_say_sonnet_4_6_verbatim_pattern_violation_bp079` (pearl_98f74effb5d986a5). Pre-dispatch self-audit: parameter AND announcement compliance both required.

---

### TL;DR

Wave A + Wave B make the food-truck activation flow work for Founder doing manual ops. Wave C makes it TURNKEY for any LB member to be a Seeker -- they hand a card to a merchant, the system handles everything else (UUID, Stripe Checkout Session generation, merchant onboarding, payouts, attribution, notifications). Bishop spec at:

`C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\FOOD_TRUCK_ACTIVATION_KIT_E_TURNKEY_SEEKER_INFRASTRUCTURE.md`

Realistic wall-clock: 8-10 days (3 concurrent SEGs reduces this to ~5-6 days). Wave A and Wave B are hard prerequisites. Do NOT begin Wave C until Wave A tables and Wave B subscription + vesting logic are confirmed deployed.

---

### Wave C scope (full spec in Bishop's design doc)

1. **Seeker Dashboard page** (`/seeker/dashboard`) -- introduction list, status badges, Marks earned, vesting schedule, "Invite a local business" CTA
2. **Cue card generator UI** (`/seeker/invite/:merchantType`) -- merchant type selector, business name, "Generate card" button, live spinner + download trigger
3. **Card layout PDF/PNG generator** -- edge function or Next.js API route; 3 Kit A monochrome variants; 3.5" x 2" with bleed; QR code; recommended renderer: `@resvg/resvg-js` for PNG + puppeteer-core for PDF (see §6 note 5 in spec)
4. **Click-time Stripe Checkout Session generator** -- edge function `create-merchant-onboarding-checkout`; dynamic session (NOT static Payment Link); `introducer_user_id` baked into Stripe metadata at creation time
5. **Stripe webhook handler with auto-attribution** -- extends Wave B webhook; reads `metadata.introducer_user_id`; writes `membership_payments`, `promotion_attributions`, `creator_referrals`, `cue_card_share_clicks.converted`, `seeker_invitations.activated_at`, `seeker_notifications`; fires Marks per vesting schedule (Founder must ratify Marks numbers before this ships -- see §6 note 2)
6. **Automated merchant onboarding wizard** (`/merchant/onboard/welcome` through `/merchant/onboard/live`) -- 5 steps: business info / menu items (manual entry, OCR Wave D) / subscription tiers with COGS calculator / Stripe Connect Express handshake / go live + storefront QR
7. **Stripe Connect Express integration** -- `create-connect-account`, `connect-onboarding-link`, `connect-dashboard-link` edge functions; `application_fee_amount = amount * 0.167` (Cost+20% structural bylaw); refund flow reverts Marks proportionally
8. **Seeker notification system** -- `seeker_notifications` table + Supabase Realtime subscription on dashboard + optional email; cooperative-class copy throughout
9. **Attribution dashboard with cooperative-class leaderboard** -- scrollable panel on Seeker dashboard; fellow Seekers shown as builders, NOT ranked competitively; Heart-of-Peace register
10. **Seeker-as-merchant onramp** -- "Set up your own node" CTA on Seeker dashboard; reuses merchant onboarding wizard; self-introduction guard fires (no Marks on self-attribution)

---

### New Wave C tables (beyond Wave A)

All three tables need migrations + RLS policies before UI work starts. Full DDL in Bishop spec §3.

- `seeker_invitations` -- tracks every card generated; links seeker_user_id + cue_card_id + activation state
- `food_node_subscription_tiers` -- per-merchant tier config (COGS calculator output stored as jsonb)
- `seeker_notifications` -- in-app notification queue; Supabase Realtime subscription target

---

### SEG fan-out (Sonnet 4.6 mandatory -- Statute §3)

Knight decomposes at discretion. Bishop's suggested fan-out (parallelizable groups noted):

**Group 1 (run in parallel):**
- **SEG-WC-1** -- Seeker dashboard scaffold + cue card generator UI (`/seeker/dashboard` + `/seeker/invite/:merchantType`); all 3 new table migrations + RLS; `generate-seeker-cue-card` edge function stub
- **SEG-WC-2** -- Card layout PDF/PNG generator; evaluate @resvg/resvg-js vs puppeteer-core; deliver 3 Kit A monochrome templates as rendered outputs; return sample card as screenshot in yoke-return
- **SEG-WC-3** -- `create-merchant-onboarding-checkout` edge function; extend Stripe webhook handler for attribution path; self-introduction guard; Marks vesting logic (use placeholder numbers until Founder ratifies)

**Group 2 (starts after Group 1 tables are confirmed deployed):**
- **SEG-WC-4** -- Merchant onboarding wizard Steps 1, 2, 3, 5 (business info / menu entry / tier config / go live); progress bar; cooperative-class copy throughout
- **SEG-WC-5** -- Stripe Connect Express integration for Step 4; connect-return URL handler; poll-for-stripe_account_id pattern; refund flow; `connect-dashboard-link` for merchant portal

**Group 3 (starts after Group 2):**
- **SEG-WC-6** -- Seeker notification system (Realtime subscription + notification bell + optional email); attribution dashboard with cooperative-class leaderboard; Seeker-as-merchant onramp CTA
- **SEG-WC-7** -- End-to-end test on live web or packaged-install; BINDING per `feedback_ux_seg_screenshot_mandatory_bp078`: screenshots required for the full Seeker journey (generate card, receive download, open QR link, Checkout page, post-checkout wizard landing) and the full merchant wizard (all 5 steps). No SEG-WC-7 complete without screenshots confirming the Stripe Connect redirect-return flow works.

---

### Reply contract

Yoke-return is ONE consolidated response per group (or one final consolidated). For each SEG:

- State what was built vs what is in-progress (Truth-Always; do not report "LANDED" unless the route is reachable on the live deployment or packaged install)
- Include screenshots for every UI-touching SEG per `feedback_ux_seg_screenshot_mandatory_bp078`
- For Stripe webhook work: fire a test webhook event and confirm the attribution row was written -- do not mark the handler complete based on code review alone (`canon_actual_runtime_verify_for_runtime_bugs_bp078`)
- For Stripe Connect Express: confirm the redirect-return URL resolves and `stripe_account_id` is written to `entity_memberships` -- screenshot the Stripe Express onboarding entry screen

---

### Statute reminders

- **§3:** Sonnet 4.6 explicit on every SEG dispatch -- not Composer, not Claude 3 Opus, not auto-selected
- **§12 (Ask-Knight-First):** if you hit an architectural question about Stripe Connect Express vs Standard vs Custom that Bishop's spec §5 does not resolve, decide with operational knowledge + document the decision in yoke-return; do not wait for Bishop
- **canon_fix_as_we_go_build_for_the_long_haul_always_convenient_immutables_bp053** -- write the schema right the first time; Wave D should not need to ALTER the 3 new Wave C tables in breaking ways
- **canon_actual_runtime_verify_for_runtime_bugs_bp078** -- Stripe webhook attribution: fire a real test event, read the DB, confirm the row; do not verify by reading the handler code
- **feedback_ux_seg_screenshot_mandatory_bp078** -- screenshots of packaged-install or live web for every UI surface; source-only verification is not sufficient
- **canon_every_click_visible_feedback_canon_bp078** -- every button in the Seeker flow and merchant wizard must produce visible feedback (spinner, toast, status badge change, navigation) -- silent clicks are broken by definition
- **canon_long_running_progress_heartbeat_canon_bp078** -- the Stripe Connect Express redirect (5-15 min external flow) and the card generator (rendering PDF) must show progress indicators; silence = broken
- **Three currencies never convert to fiat** -- Marks are cooperative ledger entries; the notification copy must not imply they have a dollar value
- **Not securities** -- attribution dashboard copy must not describe Marks as an investment or promise of returns
- **Heart-of-Peace + Saladin's Pattern** -- cooperative-class voice everywhere; especially leaderboard, notifications, and onboarding wizard
- **No em-dashes** -- use double-hyphen ( -- ) if you need a pause; em-dashes are banned

---

## ✅ FOUNDER RATIFIED (2026-06-10) -- All 3 Wave C design decisions locked

### α -- Marks vesting schedule (RATIFIED)
- **+10 Marks** at merchant activation (fires when `checkout.session.completed` webhook lands)
- **+5 Marks/week** for merchant's first 4 weeks of activity (loyalty bonus; cron fires weekly if merchant has ≥1 paid order that week)
- **+1 Mark** per recurring payment thereafter (long-tail; fires on each successful Stripe invoice for that merchant's subscription customers)
- All Marks accrue to the Seeker (introducer_user_id) in `promotion_attributions`
- `vesting_unlock_at` uses canonical vesting window from Wave A defaults (Knight surfaces if missing)

### β -- Multi-Seeker collision policy (RATIFIED)
- First-write-wins on the scanned cue card token
- Ties broken by oldest `cue_card_share_clicks` row (ts_utc ascending)
- No retroactive reassignment
- Bishop manual override available via service-role UPDATE for disputed cases; logged in audit trail

### γ -- Self-introduction guard (RATIFIED)
- `marks_earned = 0` when `seeker_user_id = merchant.user_id`
- Record still fires (creator_referrals + promotion_attributions rows created with `attributed_amount_cents = 0`)
- Cross-introductions remain valid; only self-introductions are zeroed
- Edge: original attribution stands if a Seeker who introduced a merchant later becomes ALSO a merchant on the same entity

**Knight is cleared to ship Wave C webhook + edge function logic with these values hardcoded as defaults. No further Bishop holds.**

---

### Paste-ready Founder wake-up prompt

> Knight, NEW Yoke at `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_YOKE_RED_CARPET_WAVE_C_TURNKEY_SEEKER_2026-06-10.md`. Founder has ratified the turnkey Seeker infrastructure design. Wave C builds on Wave A + Wave B as hard prerequisites -- do not begin until both are confirmed deployed. Full Bishop design spec is at `BISHOP_DROPZONE\00_FOUNDER_REVIEW\FOOD_TRUCK_ACTIVATION_KIT_E_TURNKEY_SEEKER_INFRASTRUCTURE.md` -- read it before beginning. Realistic wall-clock is 8-10 days; 3 concurrent SEGs (Group 1 in parallel) reduces to ~5-6 days. Sonnet 4.6 mandatory on all SEGs (Statute §3). All 3 Wave C design decisions (Marks vesting, multi-Seeker collision, self-introduction guard) are RATIFIED 2026-06-10 -- values locked in Yoke §FOUNDER RATIFIED above. Yoke-return is one consolidated response with live web or packaged-install screenshots for every UI surface. Use Sonnet 4.6 SEGs for ALL work -- hard binding, not a suggestion.

*Bishop -- BP079 -- pinned 2026-06-10T18:00:00Z*

---

## BLACK MAMBA PASTE-READY DISPATCH (forward this block verbatim to Knight)

Knight: dispatch 8 parallel Sonnet 4.6 SEGs RIGHT NOW. Sonnet 4.6 verbatim in every announcement (Statute §3 + corrective sub-canon BP079, pearl_98f74effb5d986a5). Wave A + Wave B are hard prerequisites -- confirm both deployed before firing. Full Bishop spec at `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\FOOD_TRUCK_ACTIVATION_KIT_E_TURNKEY_SEEKER_INFRASTRUCTURE.md`. Design decisions α/β/γ are RATIFIED (locked in Yoke body §FOUNDER RATIFIED above). Do NOT re-decompose; do NOT ask for clarification before firing; fire SEG-WC-1 through SEG-WC-6 in parallel, then sequential SEG-WC-VERIFY and SEG-WC-SHIP.

**SEG-WC-1 (Sonnet 4.6):** Scaffold `/seeker/dashboard` page -- introduction list (from `seeker_invitations` table), status badges, Marks earned (from `promotion_attributions`), vesting schedule display, "Invite a local business" CTA linking to `/seeker/invite/:merchantType`. Scaffold `/seeker/invite/:merchantType` -- merchant type selector, business name field, "Generate card" button with spinner. Create 3 new Wave C migrations with RLS: `seeker_invitations` (seeker_user_id, cue_card_id, activation state, ts), `food_node_subscription_tiers` (per-merchant tier config as jsonb), `seeker_notifications` (in-app notification queue, Supabase Realtime target). Stub `generate-seeker-cue-card` edge function (returns 200 + placeholder). Every button must produce visible feedback (HARD BINDING per `canon_every_click_visible_feedback_canon_bp078`). Deliver: pages routable, tables migrated with RLS, edge function stub deployed.

**SEG-WC-2 (Sonnet 4.6):** Build card layout PDF/PNG generator as Next.js API route or edge function. Evaluate `@resvg/resvg-js` for PNG vs `puppeteer-core` for PDF (see Bishop spec §6 note 5; choose based on Supabase edge function constraints -- Knight decides, Statute §12). Deliver 3 Kit A monochrome templates at 3.5" x 2" with bleed, QR code embedded, campaign UUID in QR URL. Return one sample card per format as screenshot embedded in Yoke-return. Deliver: generator wired to `generate-seeker-cue-card` stub from SEG-WC-1 + sample card screenshots.

**SEG-WC-3 (Sonnet 4.6):** Build `create-merchant-onboarding-checkout` edge function -- generates dynamic Stripe Checkout Session (NOT static Payment Link); bakes `introducer_user_id` into Stripe metadata at creation time; writes `cue_card_share_clicks` row with seeker_user_id + cue_card_id + ts. Extend Wave B Stripe webhook handler to read `metadata.introducer_user_id` and write: `membership_payments`, `promotion_attributions` (Marks +10 at activation per α ratification), `creator_referrals`, `cue_card_share_clicks.converted`, `seeker_invitations.activated_at`, `seeker_notifications`. Self-introduction guard: `marks_earned = 0` when `seeker_user_id == merchant.user_id`, record still fires with `attributed_amount_cents = 0` (per γ ratification). Marks vesting placeholder: +5/week for first 4 weeks, +1/recurring thereafter (per α). Deliver: edge function deployed + fire a test Stripe webhook event + confirm `promotion_attributions` row written (runtime verify, NOT code review -- HARD BINDING per `canon_actual_runtime_verify_for_runtime_bugs_bp078`).

**SEG-WC-4 (Sonnet 4.6):** Build merchant onboarding wizard Steps 1, 2, 3, 5 at `/merchant/onboard/welcome` through `/merchant/onboard/live`. Step 1: business info form (name, address, category). Step 2: menu items manual entry (name, price, description per item; OCR is Wave D, manual entry now). Step 3: subscription tier selector with COGS calculator (outputs jsonb to `food_node_subscription_tiers`). Step 5: "go live" confirmation + storefront QR code display. Progress bar across all steps. Cooperative-class copy throughout (Heart-of-Peace register, not salesperson register). No em-dashes. Every click produces visible feedback. Long-running steps (>3s) show progress (HARD BINDING per `canon_long_running_progress_heartbeat_canon_bp078`). Deliver: steps 1/2/3/5 routable + screenshots of each step in packaged-install or live web.

**SEG-WC-5 (Sonnet 4.6):** Build Stripe Connect Express integration for wizard Step 4. Edge functions: `create-connect-account` (creates Stripe Connect Express account), `connect-onboarding-link` (returns Stripe onboarding URL), `connect-dashboard-link` (returns Stripe Express dashboard URL). Connect-return URL handler at `/merchant/onboard/connect-return` -- polls for `stripe_account_id` write to `entity_memberships`. Refund flow: on Stripe refund webhook, revert Marks proportionally in `promotion_attributions`. Application fee: `amount * 0.167` (Cost+20% structural bylaw, NOT negotiable). Deliver: Stripe Connect Express redirect works + screenshot of Stripe Express onboarding entry screen + confirm `stripe_account_id` written to `entity_memberships` (runtime verify required).

**SEG-WC-6 (Sonnet 4.6):** Build Seeker notification system: `seeker_notifications` Supabase Realtime subscription on `/seeker/dashboard` notification bell (badge count + dropdown list). Optional email notification (Resend or Supabase email; Knight chooses, Statute §12). Attribution dashboard on Seeker dashboard: scrollable panel showing fellow Seekers as builders (cooperative-class leaderboard -- Heart-of-Peace register, NOT competitive ranking). Seeker-as-merchant onramp: "Set up your own node" CTA on Seeker dashboard that routes to `/merchant/onboard/welcome`; self-introduction guard fires (no Marks on self-attribution per γ). Copy must not imply Marks have dollar value (not securities). Deliver: notification bell live + attribution panel visible + onramp CTA routable + screenshots of all 3 surfaces.

Sequential after SEG-WC-1 through SEG-WC-6 return:

**SEG-WC-VERIFY (Sonnet 4.6 -- sequential):** Full E2E test of Seeker journey on live web or packaged install (HARD BINDING per `feedback_ux_seg_screenshot_mandatory_bp078`). Screenshots required for: (1) Seeker dashboard with Marks earned visible; (2) `/seeker/invite/:merchantType` with card generator; (3) generated card download (PNG or PDF); (4) QR link opening Checkout page; (5) post-checkout wizard landing page; (6) merchant wizard all 5 steps; (7) Stripe Connect redirect-return flow. Confirm `promotion_attributions` row written after test Stripe webhook. Report: per-surface screenshot path + any Truth-Always failures (surfaces that are broken or incomplete -- do NOT report "LANDED" unless the route is reachable on live deployment or packaged install).

**SEG-WC-SHIP (Sonnet 4.6 -- sequential after VERIFY):** Increment version to appropriate semver (Knight confirms next after current HEAD; Wave C is likely v0.1.41 or v0.1.42 -- verify). Commit all Wave C changes. Build packaged installer: `npm run dist`. SHA-256 the installer. Push to GitHub Releases as DRAFT with tag (HARD BINDING per `feedback_explicit_founder_ratify_before_publish.md` -- Founder ratifies to go live). Deploy to Cephas. Deliver: DRAFT GitHub Release + SHA + commit hash + Cephas deploy confirmed.

Yoke-return: ONE consolidated response with per-SEG status (COMPLETE / PARTIAL / BLOCKED), all screenshots, Stripe test webhook confirmation, `stripe_account_id` confirmed written, all semver + commit hash + installer SHA. Append `## RESPONSE` to Yoke file at canonical path.

If any SEG announces "Sonnet 4.5" or other version-variant: STOP, fix the announcement, re-fire. Violation of corrective sub-canon BP079.

---
