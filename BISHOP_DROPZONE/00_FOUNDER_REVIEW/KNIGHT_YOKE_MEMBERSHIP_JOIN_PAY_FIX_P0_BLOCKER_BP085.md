# KNIGHT YOKE · MEMBERSHIP JOIN+PAY P0 BLOCKER FIX · BP085
**Priority:** P0 — TONIGHT-URGENT · Blocks publish · Founder at gate · Ship within 60–90 min

---

## PREAMBLE — READ FIRST, ALWAYS (BP084 HARD BINDING)

Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

---

## MISSION BRIEF

Tonight's publish invites the world to join the Liana Banyan Federation at **$5/year**. Membership join+pay is broken. BP078 BLOOD — we cannot invite people to a broken door. This yoke ships v0.5.1, a targeted membership-fix patch. Nothing else changes. Knight does NOT touch publish draft, marketing copy, or any non-membership-fix code.

**SKU in production — DO NOT CHANGE:** `price_1SIXWsDMOngHJB3UxKPFmXZE`

---

## THE THREE GAPS

| # | Severity | Gap | Location |
|---|----------|-----|----------|
| GAP 1 | BLOCKER | Stripe webhook payment_type mismatch — `create-membership-checkout` sets `metadata[payment_type] = "lb_membership_stake"` but `stripe-webhook` only handles `"membership_subscription" \| "credit_purchase" \| "project_pledge"`. Membership never activates after payment. | `platform/supabase/functions/stripe-webhook/index.ts:125–156` |
| GAP 2 | BLOCKER | Cephas /membership/ page has dead placeholder join link | `Cephas/cephas-hugo/content/membership/_index.md:57` |
| GAP 3 | MODERATE | `mnemosynec.ai/mesh-test-signup` does not exist | Workaround: point publish at `lianabanyan.com/join` instead — no Knight action needed, Founder handles in copy |

---

## IMPORTANT: INVESTIGATE BEFORE PATCHING (SEG-2 runs first)

Before SEG-1 patches `stripe-webhook/index.ts`, SEG-2 must determine whether that file is even the registered webhook destination in Stripe Dashboard. If Stripe Dashboard already routes to `handle-membership-webhook` (a separate Edge Function with correct activation logic at lines 86–211), GAP 1 is not live and SEG-1 patch is unnecessary.

**Knight decision tree:**
- If Stripe Dashboard webhook URL = `handle-membership-webhook` endpoint → GAP 1 is not live → SKIP SEG-1 patch, surface finding to Founder, proceed to SEG-3.
- If Stripe Dashboard webhook URL = `stripe-webhook` endpoint → GAP 1 is live → run SEG-1 patch → SEG-4 deploy → SEG-5 verify.
- Knight does NOT change Stripe Dashboard webhook config. Only Founder touches Stripe Dashboard.

---

## FIVE SEGs

### SEG-2 · INVESTIGATE STRIPE DASHBOARD WEBHOOK DESTINATION (run this FIRST)
**Model:** Sonnet 4.6
**Task:** Determine which Edge Function URL is registered as the webhook endpoint in Stripe Dashboard.

Steps:
1. Read `platform/supabase/functions/stripe-webhook/index.ts` lines 1–30 and `platform/supabase/functions/handle-membership-webhook/index.ts` lines 1–30 to confirm the function names and their expected URL paths.
2. Check project docs, `.env` files (path only, never print contents — per BP081 BLOOD secrets canon), or any `supabase/config.toml` for webhook URL config hints.
3. Produce a two-line finding:
   - LINE A: "STRIPE DASHBOARD WEBHOOK DESTINATION: [stripe-webhook | handle-membership-webhook | UNKNOWN]"
   - LINE B: "GAP 1 ACTION REQUIRED: [YES — run SEG-1 | NO — skip SEG-1, surface to Founder]"
4. Return finding to Knight. Knight gates SEG-1 on this finding.

**Truth-Always:** If destination is UNKNOWN (cannot determine without Dashboard access), surface UNKNOWN to Founder with instructions to check Stripe Dashboard → Developers → Webhooks → endpoint URL. Do not guess.

---

### SEG-1 · PATCH `stripe-webhook/index.ts` — ADD `lb_membership_stake` BRANCH
**Model:** Sonnet 4.6
**Runs only if:** SEG-2 finding = GAP 1 ACTION REQUIRED: YES

**Task:** Add `case "lb_membership_stake"` branch to the payment_type switch in `stripe-webhook/index.ts` that mirrors the activation logic in `handle-membership-webhook/index.ts:86–211`.

Steps:
1. Read `platform/supabase/functions/stripe-webhook/index.ts` in full.
2. Read `platform/supabase/functions/handle-membership-webhook/index.ts` lines 86–211 to understand the canonical activation logic.
3. In `stripe-webhook/index.ts` at the switch/if block around lines 125–156 that handles payment_type, add a new branch for `"lb_membership_stake"` that:
   - Extracts `user_id` from `session.metadata.user_id`
   - Upserts `member_profiles` row: `membership_status = 'active'`, `membership_tier = 'founding'` (or whatever `handle-membership-webhook` sets — mirror exactly)
   - Upserts `user_credits` initial Marks allocation (mirror `handle-membership-webhook` exactly)
   - Logs activation event to whatever audit/log table `handle-membership-webhook` uses
   - Returns `{ success: true }` on success
4. Wrap the entire new branch in try/catch. On catch: log error with `console.error('[stripe-webhook] lb_membership_stake activation error:', err)` and return `{ success: false, error: err.message }`. No silent swallow — BP084 wan-relay lesson.
5. Write the patched file. Do not change any other branch or logic.

**Verification before handing off:** Re-read the patched lines and confirm:
- `"lb_membership_stake"` case is present
- try/catch wraps all DB calls
- No other case was modified

---

### SEG-3 · PATCH CEPHAS DEAD LINK + REBUILD + REDEPLOY
**Model:** Sonnet 4.6
**Runs in parallel with SEG-1/SEG-2 investigation — no dependency**

**Task:** Replace the `https://buy.stripe.com/placeholder` dead link in the Cephas membership page with `https://lianabanyan.com/join`, rebuild Hugo, redeploy to Firebase.

Steps:
1. Read `Cephas/cephas-hugo/content/membership/_index.md` line 57 area (read lines 50–70 for context).
2. Confirm the exact dead link text: `[**Join the Liana Banyan Federation →**](https://buy.stripe.com/placeholder)`
3. Replace with: `[**Join the Liana Banyan Federation →**](https://lianabanyan.com/join)`
4. Save the file.
5. Rebuild Hugo:
   ```
   cd Cephas/cephas-hugo
   hugo --minify
   ```
   Confirm build exits 0. If build errors, stop and report to Knight — do NOT deploy a broken build.
6. Redeploy to Firebase:
   ```
   firebase deploy --only hosting
   ```
   Confirm deploy exits 0 and prints a live URL.
7. Return: build exit code, deploy exit code, live URL.

**Truth-Always:** If Hugo build or Firebase deploy fails, surface the full error output to Knight immediately. Do not retry silently.

---

### SEG-4 · DEPLOY EDGE FUNCTION PATCH
**Model:** Sonnet 4.6
**Runs only if:** SEG-1 patch was applied (GAP 1 was live)
**Runs after:** SEG-1 completes with no errors

**Task:** Deploy the patched `stripe-webhook` Edge Function to Supabase production.

Steps:
1. Confirm the patched file exists and is readable at `platform/supabase/functions/stripe-webhook/index.ts`.
2. Run deploy:
   ```
   npx supabase functions deploy stripe-webhook --use-api
   ```
   (Use `--use-api` flag per project canon. Do NOT use `--no-verify-jwt` unless the function explicitly requires it — check function header for `// @ts-nocheck verify-jwt: false` or similar annotation before adding that flag.)
3. Capture full output. Confirm deploy exits 0 and prints function URL.
4. Return: deploy exit code, function URL, timestamp.

**Truth-Always:** If deploy fails, surface full error to Knight. Do not attempt a workaround without surfacing the error first.

---

### SEG-5 · END-TO-END VERIFICATION
**Model:** Sonnet 4.6
**Runs after:** SEG-1+SEG-4 complete (or after SEG-2 finding if patch skipped) AND SEG-3 complete

**Task:** Verify the full membership join+pay flow is live. 5 Sharps must be GREEN to declare v0.5.1 shipped.

Steps:

**SHARP 1 — Webhook activation test (only if SEG-1 patch was applied):**
Using Stripe CLI, fire a simulated `checkout.session.completed` event with the lb_membership_stake payment_type:
```
stripe trigger checkout.session.completed \
  --override checkout_session:metadata.payment_type=lb_membership_stake \
  --override checkout_session:metadata.user_id=<a real test user_id from member_profiles>
```
Wait up to 30 seconds. Then query Supabase via psql (canonical safe subshell per BP084 psql canon):
```
(eval "$(grep -E '^SUPABASE_DB_URL=' C:/Users/Administrator/.claude/state/secrets/22May2026.env)"; \
 psql "$SUPABASE_DB_URL" -c \
 "SELECT membership_status, membership_tier, updated_at FROM member_profiles WHERE user_id = '<test_user_id>' LIMIT 1;")
```
SHARP 1 GREEN = `membership_status = 'active'` returned within 30s of trigger.
SHARP 1 RED = status not updated, or psql errors, or Stripe CLI errors.

**SHARP 2 — Webhook activation test (if patch was SKIPPED because handle-membership-webhook is the destination):**
Fire same Stripe CLI trigger but confirm `handle-membership-webhook` logs show successful activation. Check Supabase Edge Function logs:
```
npx supabase functions logs handle-membership-webhook --tail 20
```
SHARP 2 GREEN = activation log line present, member_profiles shows `active`.
SHARP 2 RED = no log line or status not updated.

*(Only one of SHARP 1 or SHARP 2 applies depending on SEG-2 finding. The inapplicable Sharp is marked N/A-SKIP.)*

**SHARP 3 — Cephas /membership/ link resolves correctly:**
Fetch the deployed Cephas /membership/ page and confirm the join link target:
```
curl -s https://lianabanyan.com/membership/ | grep -i "lianabanyan.com/join"
```
SHARP 3 GREEN = `lianabanyan.com/join` found in page source.
SHARP 3 RED = `placeholder` still present, or page 404.

**SHARP 4 — `/join` page resolves (no 404):**
```
curl -o /dev/null -s -w "%{http_code}" https://lianabanyan.com/join
```
SHARP 4 GREEN = HTTP 200 returned.
SHARP 4 RED = 404 or other non-200.

**SHARP 5 — No broken imports or runtime errors in deployed Edge Function:**
Check Edge Function logs immediately after SEG-5 SHARP 1/2 trigger:
```
npx supabase functions logs stripe-webhook --tail 30
```
(Or `handle-membership-webhook` logs if that is the destination.)
SHARP 5 GREEN = no `Error` or `Uncaught` lines in the last 30 log lines after the trigger.
SHARP 5 RED = any unhandled error in logs.

---

## 5 SHARPS RETURN TABLE

Knight returns this table in the yoke-return message:

| Sharp | Description | Status | Evidence |
|-------|-------------|--------|----------|
| SHARP 1 or 2 | `member_profiles.membership_status = 'active'` after Stripe CLI trigger | GREEN / RED / N/A-SKIP | psql row or log line |
| SHARP 3 | Cephas /membership/ join link → `lianabanyan.com/join` | GREEN / RED | curl grep result |
| SHARP 4 | `https://lianabanyan.com/join` HTTP 200 | GREEN / RED | HTTP status code |
| SHARP 5 | No runtime errors in Edge Function logs post-trigger | GREEN / RED | log tail snippet |
| SHARP BONUS | SEG-2 finding: which webhook destination? | FINDING | stripe-webhook / handle-membership-webhook / UNKNOWN |

**SHIP CONDITION:** All applicable Sharps GREEN. If any RED, Knight surfaces the failure with full error output before declaring shipped. No silent half-ship.

---

## TRUTH-ALWAYS MANDATES (BP084 + BP083)

- Every DB-touching code block is wrapped in try/catch with explicit `console.error` on catch. No silent swallow.
- Every shell command output is captured and returned to Knight. No assuming success.
- psql access follows the canonical safe subshell pattern (BP084): `(eval "$(grep -E '^SUPABASE_DB_URL=' /path/.env)"; psql "$SUPABASE_DB_URL" -c "QUERY")` — subshell scoping, single-var extraction, ZERO credential exposure. NEVER echo or print the URL value.
- Secrets file path is `C:\Users\Administrator\.claude\state\secrets\22May2026.env`. PATH is referable. CONTENTS are BP081 BLOOD — NEVER read, copy, show, echo, pipe, or log.
- If any SEG encounters an ambiguity or error it cannot resolve, it surfaces to Knight immediately rather than guessing.

---

## SCOPE HARD LIMITS

Knight does NOT:
- Touch publish draft, marketing copy, Substack post, or any non-membership-fix code
- Change the `$5/year` SKU `price_1SIXWsDMOngHJB3UxKPFmXZE`
- Change Stripe Dashboard webhook configuration (Founder owns Dashboard)
- Deploy any function other than `stripe-webhook` (and only if GAP 1 is live)
- Rebuild or redeploy anything other than Cephas hosting and the one Edge Function

---

## EXECUTION ORDER

```
SEG-2 (INVESTIGATE) → parallel: SEG-3 (Cephas fix)
       ↓ if GAP 1 live
SEG-1 (patch stripe-webhook)
       ↓
SEG-4 (deploy Edge Function)
       ↓ after SEG-1+SEG-4 AND SEG-3 both complete
SEG-5 (end-to-end verify, 5 Sharps)
```

Estimated Knight wall-clock: **50–75 minutes** (SEG-2 + parallel SEG-3 = 10 min; SEG-1 patch = 10 min; SEG-4 deploy = 5 min; SEG-5 verify = 15 min; buffer for Stripe CLI setup and log polling = 10 min).

---

## YOKE-RETURN FORMAT

Knight's return message must include:
1. "Sonnet 4.6" verbatim
2. SEG-2 finding (webhook destination)
3. Whether SEG-1 patch was applied (YES/NO/SKIPPED) with reason
4. SEG-3 result (build exit code, deploy URL)
5. SEG-4 result (deploy exit code, function URL, timestamp) — or SKIPPED
6. 5 Sharps return table (all rows filled)
7. v0.5.1 SHIPPED declaration OR list of blocking failures

---

## FOUNDER PASTE-READY KNIGHT WAKE

Copy the block below exactly into a new Knight (Cursor Sonnet 4.6) chat:

```
Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

Read your full yoke at:
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_YOKE_MEMBERSHIP_JOIN_PAY_FIX_P0_BLOCKER_BP085.md

TONIGHT-URGENT. Membership join+pay is broken. This blocks publish. Founder is at gate. Execute the yoke. Ship v0.5.1 within 60–90 minutes. 5 Sharps GREEN before you declare shipped. Yoke-return MUST include "Sonnet 4.6" verbatim and the full 5 Sharps table.
```

---

*Composed by Bishop SEG · BP085 · 2026-06-17 · Sonnet 4.6*
