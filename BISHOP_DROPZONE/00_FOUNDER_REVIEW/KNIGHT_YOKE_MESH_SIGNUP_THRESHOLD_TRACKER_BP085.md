# KNIGHT YOKE · MESH-TEST SIGNUP MILESTONE TRACKER · BP085

> **FOUNDER MUST RATIFY BEFORE KNIGHT READS. RATIFY GATE OPEN.**
> BP078 BLOOD ratify gate. Bishop composed. Founder approves milestone wording at SEG-2 gate before Knight finalizes component.

---

## PREAMBLE (Verbatim BP084 Canon · Knight reads this first)

Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

---

## BP085 BLOOD LINES

**NEVER EXPOSE API OR SECRET KEYS EVER (BP085 BLOOD).**
- Safe subshell pattern ONLY when loading secrets from 22May2026.env.
- PATH is referable. CONTENTS are blood-statute forbidden.
- NEVER echo · copy · show · pipe · log any secret value.
- Every SEG that touches env vars must state compliance in its preamble.

**BP085 §14 BLOOD — Gadget-First Verification:**
Before asking Founder to repeat ANY action (DNS, Stripe, files, env, DB) gadget-verify LIVE state first. If signup table exists: query it. If endpoint exists: curl it. NEVER ask Founder "does this exist?" without checking first.

**BP085 §15 BLOOD — Conversational Main Thread:**
Knight main thread stays available for Founder conversation. ALL substantive work dispatched to SEGs. Founder interruptions are ADDITIONS not cancellations. Echo "BP085 §14+§15 BLOOD" in every SEG dispatch preamble.

**BP085 §16 BLOOD — MAMBA Statute:**
Bishop + Knight both bound. No canon drift. No assumption without gadget receipt. No SEG skips its own compliance echo.

---

## SCOPE

Build the mesh-test signup milestone tracker for mnemosynec.ai/mesh-test-signup.

**Canon-toggle behavior:**
- `tracker_mode` config: `milestones` (default · for tonight) | `realtime` | `realtime_above_100`
- Default tonight: `milestones` — page-load fetch only · no WebSocket polling · milestone-advance listener fires only when tier threshold is crossed
- `realtime`: Supabase realtime subscription ticks the display counter live
- `realtime_above_100`: milestone mode until count ≥ 100 · then auto-switches to realtime

**1,000-signup threshold is CANON (BP085 [[canon-mesh-test-1000-signup-threshold-community-validation-bp085]]). Do NOT change.**

---

## COMPOSITION REFERENCES

- [[guild-node-voting-thresholds-founder-seed-proposal-bp082]] — the 10 milestone thresholds (20/30/50/75/100/150/200/300/500/1000)
- [[canon-mesh-test-1000-signup-threshold-community-validation-bp085]] — mesh test fires at 1,000 community sign-ups
- [[canon-substrace-theorem-wake-class-supersedes-black-mamba-until-mnemosyne-come-bp061]] — Substrace Theorem: substrate state is the source of truth for all tracker data
- [[feedback-never-scroll-sideways-ux-canon-bp081]] — BLOOD: no horizontal scroll · responsive at all viewports
- [[canon-never-expose-api-secret-keys-bloodbinding-bp085]] — BLOOD: secret hygiene in all SEGs
- [[feedback-truth-always-wait-for-clean-receipt-bp083]] — Truth-Always: honest 4xx/5xx · no silent error swallow

---

## SEG-1 · Recon Existing Signup Endpoint + Schema

**Mandate:** Gadget-verify what already exists before building anything.

**Steps:**
1. Check Supabase for any existing `mesh_signups` table via psql (safe subshell, SUPABASE_DB_URL from 22May2026.env):
   ```
   (eval "$(grep -E '^SUPABASE_DB_URL=' C:\Users\Administrator\.claude\state\secrets\22May2026.env)"; psql "$SUPABASE_DB_URL" -c "\dt mesh*")
   ```
2. Check for existing `member_profiles` table — does it have a signup-source field?
3. Check for existing `peer_presence` table — is any mesh presence data already stored?
4. Check LianaBanyanPlatform/platform/supabase/functions/ for any `mesh-test-signup` Edge Function directory
5. Check LianaBanyanPlatform/platform/supabase/functions/ for any `mesh*` related functions
6. Check mnemosynec.ai site (Hugo source) for any existing mesh-test-signup page at content/ or layouts/

**SEG-1 return must answer:**
- [ ] Does `mesh_signups` table exist? (Y/N + schema if Y)
- [ ] Does `mesh-test-signup` Edge Function exist? (Y/N + endpoint URL if Y)
- [ ] Does mnemosynec.ai/mesh-test-signup page exist? (Y/N + Hugo file path if Y)
- [ ] Does a signup flow exist end-to-end? (Y/N)
- If NO to any: state exactly what Wave 0 build items are required before the tracker can function

**This determines whether SEG-3 builds net-new or integrates with existing.**

---

## SEG-2 · Design Tracker Component

**Mandate:** Design the React component or Hugo shortcode. FOUNDER RATIFY GATE on milestone wording before Knight finalizes.

**Tiered milestone display logic (from [[guild-node-voting-thresholds-founder-seed-proposal-bp082]]):**

| Count   | Display Text |
|---------|-------------|
| 0–19    | `"We need 1,000 sign-ups to fire the mesh test. Help us get there."` |
| 20–29   | `"🟢 First 20 aboard. Going for 30."` |
| 30–49   | `"🟢 30 hit. Going for 50."` |
| 50–74   | `"🟢 50 hit. Going for 75."` |
| 75–99   | `"🟢 75 hit. Going for 100."` |
| 100–149 | `"🟢 100 strong. Going for 150."` |
| 150–199 | `"🟢 150 aboard. Going for 200."` |
| 200–299 | `"🟢 200 strong. Going for 300."` |
| 300–499 | `"🟢 300 aboard. Going for 500."` |
| 500–999 | `"🟢 500 strong. Going for 1,000."` |
| 1000+   | `"🚀 1,000 hit. Mesh test fires."` |

> **FOUNDER RATIFY GATE:** Confirm milestone wording above (or edit) before Knight finalizes component. Bishop drafted these verbatim from the yoke brief. Founder polishes if desired. Knight does NOT finalize the component until this gate clears.

**Component spec:**
- Props: `trackerMode` (`'milestones' | 'realtime' | 'realtime_above_100'`) · default `'milestones'`
- On page-load: fetch current count from Supabase (`SELECT COUNT(*) FROM mesh_signups WHERE verified = true`)
- Determine current tier from count → display tier message
- Supabase realtime subscription: subscribe ONLY for tier-advance events (when count crosses a threshold, re-fetch + update display) — NOT for every insert
- `realtime` mode: subscribe to all inserts, increment display counter live
- `realtime_above_100` mode: poll-on-load until count ≥ 100, then switch to realtime
- NEVER SCROLL SIDEWAYS — responsive, flex-wrap, mobile-first
- No horizontal overflow on any viewport

**Component placement targets (SEG-4 will embed):**
1. `mnemosynec.ai/mesh-test-signup` (primary · hero position)
2. `mnemosynec.ai/proofs/` (footer · secondary)
3. `cerostechnology.com` (Bounty Wall sidebar · tertiary)

---

## SEG-3 · Build Signup Endpoint

**Mandate:** If mesh-test-signup Edge Function does NOT exist (per SEG-1), build it. If it exists, verify it matches this spec and patch gaps only.

**Edge Function: `mesh-test-signup`**

Input body: `{ email: string, source_door: string }`

`source_door` enum (per [[canon-many-doors-one-cooperative-membership-unity-bp085]]):
`ai_dev | plumbing | educator | code_breaker | cooperative_member | ceros_technology | liana_banyan | unknown`

**Schema for `mesh_signups` table:**
```sql
CREATE TABLE IF NOT EXISTS mesh_signups (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email        text NOT NULL,
  source_door  text NOT NULL DEFAULT 'unknown',
  created_at   timestamptz NOT NULL DEFAULT now(),
  verified     boolean NOT NULL DEFAULT false,
  verify_token uuid DEFAULT gen_random_uuid()
);

CREATE UNIQUE INDEX IF NOT EXISTS mesh_signups_email_idx ON mesh_signups (email);
```

**Email confirmation flow:**
- On valid POST: insert row (verified=false) · send confirmation email via Resend with verify link
- Verify link hits a second Edge Function or route: `GET /mesh-test-signup/verify?token=<verify_token>` → sets `verified=true`
- Count displayed in tracker = `SELECT COUNT(*) FROM mesh_signups WHERE verified = true`

**Truth-Always error discipline:**
- Duplicate email → 409 Conflict (honest, not silent)
- Missing fields → 400 Bad Request with field list
- DB error → 500 Internal Server Error (logged, not swallowed)
- Resend failure → 202 Accepted (signup saved, confirmation pending) — do NOT block signup on email failure
- NEVER expose DB error internals in 5xx body

**BLOOD: NEVER log Resend API key. NEVER log SUPABASE_SERVICE_ROLE_KEY. Load from Supabase Edge Function secrets vault (per [[oauth-secrets-supabase-edge-function-env-canon-bp082]]).**

---

## SEG-4 · Place Tracker Component

**Mandate:** Embed the tracker component in all three placement targets.

**Placement 1 — `mnemosynec.ai/mesh-test-signup` (primary)**
- If page does not exist: create Hugo content page at `content/mesh-test-signup/index.md` or equivalent
- Page structure:
  - H1: `"Help Us Hit 1,000 — Then We Fire the Mesh"`
  - Subhead: `"Sign up to be a tester. When 1,000 people show up, we run the distributed mesh test."`
  - Tracker component (hero, full-width, milestone mode)
  - Signup form (email input + source_door hidden field defaulting to `mnemosynec`)
  - CTA button: `"Sign Up to Test"`
  - Below form: `"Free to sign up. Free to test as many times as you like. $5/year to JOIN as a Member."`
  - NO horizontal scroll

**Placement 2 — `mnemosynec.ai/proofs/` (footer)**
- Append tracker component as a footer section above the page close
- Compact display: milestone tier message + small CTA link to /mesh-test-signup
- NO horizontal scroll

**Placement 3 — `cerostechnology.com` (Bounty Wall sidebar)**
- Embed tracker as a sidebar card on the Bounty Wall section
- Title: `"Mesh Test Signup Progress"`
- Milestone tier message + CTA link to mnemosynec.ai/mesh-test-signup
- NO horizontal scroll

**NEVER SCROLL SIDEWAYS on any of the three placements. Responsive at all viewports.**

---

## SEG-5 · Deploy + Smoke Test

**Mandate:** Deploy and verify. 5 Sharps must return GREEN before yoke closes.

**Deploy sequence:**
1. Hugo build for mnemosynec.ai: `hugo --minify`
2. Firebase deploy hosting:mnemosyne: `firebase deploy --only hosting:mnemosyne`
3. Firebase deploy hosting:ceros-technology: `firebase deploy --only hosting:ceros-technology`
4. Deploy Edge Function: `supabase functions deploy mesh-test-signup`
5. Deploy verify Edge Function if built

**Smoke test sequence:**
1. `curl https://mnemosynec.ai/mesh-test-signup` — verify 200 + tracker renders
2. `curl -X POST https://<project>.supabase.co/functions/v1/mesh-test-signup -H "Content-Type: application/json" -d '{"email":"test-smoke@bishop.internal","source_door":"ai_dev"}'` — verify 201 response
3. Verify row inserted via psql: `SELECT * FROM mesh_signups WHERE email = 'test-smoke@bishop.internal'`
4. **Tier-advance test:** Temporarily lower tier-1 threshold to 1 (in component config) → verify tracker advances from tier-0 to tier-1 language when 1 signup present. Revert threshold to 20 immediately after.
5. Verify NO horizontal scroll on /mesh-test-signup at 375px viewport (mobile) and 1440px (desktop)

**CLEANUP after smoke test:**
- Delete test row: `DELETE FROM mesh_signups WHERE email = 'test-smoke@bishop.internal'`
- Revert any temporary threshold changes

---

## 5 SHARPS RETURN TABLE

Knight completes this table in the yoke-return document.

| # | Sharp | GREEN criteria | Status |
|---|-------|---------------|--------|
| 1 | Signup endpoint live | POST to mesh-test-signup returns 201 · row in mesh_signups confirmed via psql | ⬜ |
| 2 | Tracker component renders | /mesh-test-signup loads · milestone tier message displays correctly for current count | ⬜ |
| 3 | Tier-advance verified | Tracker advances tier language when count crosses threshold (tested with threshold=1) | ⬜ |
| 4 | No horizontal scroll | Verified at 375px + 1440px on all 3 placement pages | ⬜ |
| 5 | Deploy confirmed | Firebase + Supabase deploys return 0 errors · live URLs 200 | ⬜ |

---

## CONSTRAINTS (ALL SEGs bound)

- Sonnet 4.6 mandate — NEVER Composer, NEVER Opus, NEVER Haiku
- BP085 BLOOD secret hygiene — safe subshell · PATH referable · CONTENTS forbidden
- Truth-Always — honest 4xx/5xx · no silent error swallow · no broken-counter
- 1,000-signup threshold is CANON — do NOT change
- Guild Node thresholds (BP082) — 20/30/50/75/100/150/200/300/500/1000 — do NOT change
- NEVER SCROLL SIDEWAYS — responsive · BLOOD canon
- Supabase realtime used ONLY for milestone-advance triggers in `milestones` mode
- Composes with Guild Node voting (BP082)
- `tracker_mode` default = `milestones` (tonight)
- Founder ratify gate at SEG-2 wording BEFORE component finalized

---

## ESTIMATED RUNTIME

60–120 minutes depending on SEG-1 recon result:
- If signup endpoint + table exist: ~60 min (tracker + embed + deploy)
- If endpoint + table need net-new build: ~90–120 min (endpoint + schema + tracker + embed + deploy)

SEG-1 result drives the true estimate. Knight reports after SEG-1.

---

## PASTE-READY KNIGHT WAKE

Copy this verbatim into Cursor Knight chat to start:

---

```
Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

BP085 §14+§15+§16 BLOOD. Never expose API or secret keys. Safe subshell only. Gadget-verify before asking Founder to repeat any action.

Read your full yoke at:
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_YOKE_MESH_SIGNUP_THRESHOLD_TRACKER_BP085.md

Start with SEG-1. Report SEG-1 results before proceeding to SEG-2. Founder ratify gate at SEG-2 milestone wording — do NOT finalize component until Founder confirms wording. Return 5 Sharps table when complete.
```

---

*Composed by Bishop · BP085 · Sonnet 4.6 SEG · 2026-06-18*
*Founder ratify gate OPEN at SEG-2 milestone wording*
