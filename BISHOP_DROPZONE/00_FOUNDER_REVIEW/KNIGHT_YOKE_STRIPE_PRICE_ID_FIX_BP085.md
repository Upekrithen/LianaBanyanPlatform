# KNIGHT YOKE · Stripe Price ID Fix · BP085 P0
**Written by:** Bishop SEG (Sonnet 4.6)
**Date:** 2026-06-17
**Task ref:** BP085 P0 — Edge Function `create-mnemosynec-checkout` 500 on "No such price"

---

## PREAMBLE (VERBATIM BP084 CANON · MANDATORY)

Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

**BP085 BLOOD: NEVER EXPOSE API OR SECRET KEYS EVER. Applies to Knight AND all SEGs spawned. Safe subshell loading only. PATH referable, CONTENTS blood-forbidden. NEVER echo/copy/show/pipe/log any key value, ever, including in error messages, in return text, in commit messages, in screenshots taken during verify.**

**BP085 §14 BLOOD — gadget-first before asking Founder to repeat (DNS, Stripe, files, env, DB). Live-check before any human-time ask.**
BP085 §15 BLOOD — Knight main thread for orchestration; spawn SEGs for substantive work.

---

## SITUATION REPORT — BISHOP CLI ATTEMPT + GATE CLEARED

**GATE CLEARED · Bishop confirmed via Stripe CLI: Product 'MnemosyneC Cooperative Membership' (prod_UixMKWi6UtT8S4) with price_1TjVRjRlWRgRXQ3YAjBRw8o8 ($5/year recurring) exists in live Stripe. Knight can dispatch SEGs 1-4 immediately.**

---

Bishop ran `stripe prices list --live` against the Liana Banyan Corporation Stripe account (acct_1SIIjqRlWRgRXQ3Y). Full live price inventory below.

### ALL LIVE STRIPE PRICES (sanitized — IDs public-safe)

| Price ID | Product Name | Amount | Interval | Active |
|---|---|---|---|---|
| price_1SgcPARlWRgRXQ3YJmteDk2n | $5 Santa - SEEDLING Annual | $5.00 | year | YES |
| price_1SgcQLRlWRgRXQ3YdaV1Ei96 | $25 Santa - GARDENER Annual | $25.00 | year | YES |
| price_1SgcRcRlWRgRXQ3YYOb49Ahu | $100 Santa - CULTIVATOR Annual | $100.00 | year | YES |
| price_1Tgv59RlWRgRXQ3Y98Sr23nO | (unnamed product) | $0.00 | week | YES |
| price_1SgcKTRlWRgRXQ3YSuPxqs5J | (unnamed product) | $100.00 | month | YES |
| price_1SgcItRlWRgRXQ3YDQpPLVte | (unnamed product) | $25.00 | month | YES |
| price_1SgcG4RlWRgRXQ3YlhdncMVn | (unnamed product) | $5.00 | month | YES |
| price_1Sgb5hRlWRgRXQ3YpBQhqoUj | (one-time) | $5.00 | one-time | YES |
| price_1SgbBtRlWRgRXQ3YGPPGbyTJ | (one-time) | $10.00 | one-time | YES |
| price_1SgbCvRlWRgRXQ3YqdPKoUTp | (one-time) | $25.00 | one-time | YES |
| price_1SgbDcRlWRgRXQ3Y0IX4qJCG | (one-time) | $50.00 | one-time | YES |
| price_1SgbqdRlWRgRXQ3YxOzULGfn | (one-time) | $100.00 | one-time | YES |
| price_1SgbswRlWRgRXQ3YBXBoSEP2 | (one-time) | $350.00 | one-time | YES |

### FINDING: NO $5/YEAR COOPERATIVE MEMBERSHIP PRICE EXISTS

The hardcoded Price ID `price_1SIXWsDMOngHJB3UxKPFmXZE` does NOT exist in the live account at all — confirmed by "No such price" from Stripe.

The only $5/year recurring price (`price_1SgcPARlWRgRXQ3YJmteDk2n`) belongs to product **"$5 Santa - SEEDLING Annual"** — a charity gift subscription, NOT a cooperative membership.

**SECOND BUG FOUND:** The Edge Function uses `mode: "payment"` (one-time charge) but a recurring subscription Price ID is needed. For a $5/year membership, `mode` must be `"subscription"`, not `"payment"`. This will also cause a Stripe error when a real subscription price is used.

### FOUNDER MUST DO ONE OF THE FOLLOWING BEFORE SEG DISPATCH:

**Option A (Recommended):** Create a new Stripe product + price in the live Dashboard:
- Go to: https://dashboard.stripe.com/products/create
- Product name: `MnemosyneC Cooperative Membership`
- Price: $5.00 / year / recurring
- Copy the new Price ID (`price_1...`) and provide it to Knight before dispatch.

**Option B:** Use `price_1SgcPARlWRgRXQ3YJmteDk2n` ("$5 Santa - SEEDLING Annual") as a temporary stand-in only if acceptable for billing statement. Not recommended — product name will appear on the customer's receipt as "$5 Santa - SEEDLING Annual."

**Option C:** Confirm you want a different price point (not $5/year) and provide that Price ID.

> GATE CLEARED · Price ID `price_1TjVRjRlWRgRXQ3YAjBRw8o8` is confirmed live. Dispatch SEG-1 immediately.

---

## SCOPE

Fix the P0 broken cooperative membership join flow at `mnemosynec.ai/proofs/storm/`. The modal currently hangs on skeleton spinner because the Edge Function returns 500 "No such price."

Two surgical changes required:
1. Replace stale Price ID `price_1SIXWsDMOngHJB3UxKPFmXZE` with the correct live Price ID (Founder-confirmed).
2. Change `mode: "payment"` → `mode: "subscription"` to match a recurring subscription price.

Also fix a frontend error-ordering bug: the `.catch()` handler fires `showStep1()` BEFORE the error toast, making errors invisible to users.

No other content changes. Truth-Always: surgical only.

---

## SEG-1 · Surgical Edit · Edge Function

**File:** `platform/supabase/functions/create-mnemosynec-checkout/index.ts`

**Change 1 — Price ID (line ~53):**
```
OLD: "line_items[0][price]": "price_1SIXWsDMOngHJB3UxKPFmXZE",
NEW: "line_items[0][price]": "price_1TjVRjRlWRgRXQ3YAjBRw8o8",
```

**Change 2 — Mode (line ~55):**
```
OLD: "mode": "payment",
NEW: "mode": "subscription",
```

Also update the header comment on line 14 to reflect the correct Price ID.

**Verification:** Read back lines 50-60 after edit. Confirm ONLY these three lines changed. No whitespace drift, no other modifications.

**Sharp 1 return:** `{ changed_lines: [14, 53, 55], diff_line_count: 3, price_id_used: "price_1TjVRjRlWRgRXQ3YAjBRw8o8", mode_value: "subscription" }`

---

## SEG-2 · Deploy Edge Function

**Command:**
```
npx supabase functions deploy create-mnemosynec-checkout --use-api
```

Run from the platform repo root. Confirm exit 0.

If deploy fails:
- Check `SUPABASE_ACCESS_TOKEN` env is set (load from `C:\Users\Administrator\.claude\state\secrets\22May2026.env` using safe subshell pattern — NEVER echo the file contents).
- Capture full error output.
- Do NOT proceed. Surface to Knight.

**Sharp 2 return:** `{ exit_code: 0, deploy_timestamp: "ISO8601", function_name: "create-mnemosynec-checkout", version_if_shown: "..." }`

---

## SEG-3 · Server-Side Smoke Test

**Command (POST to live Edge Function):**
```
curl -X POST \
  https://[PROJECT_REF].supabase.co/functions/v1/create-mnemosynec-checkout \
  -H "Content-Type: application/json" \
  -d '{"intent":"storm_test","return_url":"https://mnemosynec.ai/proofs/storm/"}' \
  --silent --show-error
```

SEG must find the correct Supabase project URL from the platform config (check `platform/supabase/config.toml` or `.env` files — do NOT read 22May2026.env directly; extract project ref only from safe sources).

**Expected response:** HTTP 200 + JSON body containing `client_secret` field (starts with `cs_live_`).

**Failure conditions — STOP and surface, do NOT proceed to SEG-4:**
- HTTP 500 → still broken (wrong Price ID or mode mismatch)
- HTTP 4xx → auth or CORS issue
- JSON body has `error` field instead of `client_secret`
- `client_secret` starts with `cs_test_` → STRIPE_SECRET_KEY env is pointing at test key, not live

**Sharp 3 return:** `{ http_status: 200, has_client_secret: true, client_secret_prefix: "cs_live_", error_if_any: null }`

---

## SEG-4 · Live Browser Verify (MANDATORY · not HTML-level)

**Open:** `https://mnemosynec.ai/proofs/storm/` in incognito window.

**Steps:**
1. Click the "Join the Cooperative" CTA button (or equivalent join trigger).
2. Observe modal opens and skeleton/spinner is visible briefly.
3. Verify skeleton hides and **Stripe Embedded Checkout iframe MOUNTS** with a live payment form visible (card number field, expiry, CVC — the real Stripe form).
4. Open DevTools → Console tab. Note any errors.
5. Open DevTools → Network tab. Filter for `create-mnemosynec-checkout`. Verify:
   - POST request fired
   - HTTP 200 response
   - Response JSON contains `client_secret`
6. Take a screenshot showing the mounted Stripe payment form in the modal. **BLOOD CANON: mask/crop OUT any key values, account numbers, or sensitive headers if they appear in DevTools before saving the screenshot. Never capture a key value in a screenshot taken during verify.**
7. **DO NOT ENTER PAYMENT DETAILS. DO NOT CLICK PAY.**

**Failure conditions — do NOT declare GREEN:**
- Skeleton stays (iframe never mounts)
- Console shows error related to Stripe or checkout
- Network shows POST returned non-200
- Modal shows error message
- Payment form is blank or shows "Something went wrong"

**If SEG-4 fails:** capture console errors + network response body + screenshot of failure state. Surface to Knight. Do NOT declare GREEN.

**Sharp 4 return:** `{ modal_opened: true, iframe_mounted: true, payment_form_visible: true, console_errors: [], network_200: true, screenshot_path: "ABSOLUTE_PATH_TO_SCREENSHOT", declared_green: true }`

> SHARP 4 MUST include absolute path to screenshot. No screenshot = not GREEN.

---

## FRONTEND BUG FIX (Compose alongside SEG-1 or separate SEG-5)

**File:** The frontend JS/TS file that handles the modal (likely in `platform/hugo/` or the Cephas site — SEG must locate it by searching for `showStep1` + `catch`).

**Current broken pattern:**
```js
.catch((err) => {
  showStep1();          // ← wrong: hides error before toast fires
  showErrorToast(err);  // ← user never sees this
})
```

**Fix — swap order:**
```js
.catch((err) => {
  showErrorToast(err);  // ← fires first, visible to user
  showStep1();          // ← then reset UI
})
```

If the actual variable/function names differ, find the semantic equivalent (the function that resets the modal to initial state and the function that shows an error notification) and swap their order.

Truth-Always: no other content changed in this fix.

---

## SHARPS RETURN TABLE

| Sharp | SEG | Gate | Success Signal |
|---|---|---|---|
| SHARP 1 | SEG-1 | Before SEG-2 | diff 3 lines, correct Price ID + subscription mode confirmed |
| SHARP 2 | SEG-2 | Before SEG-3 | deploy exit 0 |
| SHARP 3 | SEG-3 | Before SEG-4 | HTTP 200 + `cs_live_` client_secret |
| SHARP 4 | SEG-4 | Final GREEN gate | iframe mounted + payment form visible + screenshot |

**No silent swallow.** Any SEG that fails returns its Sharp with `error:` populated and halts the chain. Knight surfaces to Founder before continuing.

---

## PASTE-READY KNIGHT WAKE

```
Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

BP085 BLOOD: NEVER EXPOSE API OR SECRET KEYS EVER. Applies to Knight AND all SEGs spawned. Safe subshell loading only. PATH referable, CONTENTS blood-forbidden. NEVER echo/copy/show/pipe/log any key value, ever, including in error messages, in return text, in commit messages, in screenshots taken during verify.

Read this yoke in full before dispatching any SEG:
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_YOKE_STRIPE_PRICE_ID_FIX_BP085.md

GATE CLEARED · Bishop confirmed via Stripe CLI: Product 'MnemosyneC Cooperative Membership' (prod_UixMKWi6UtT8S4) with price_1TjVRjRlWRgRXQ3YAjBRw8o8 ($5/year recurring) exists in live Stripe. Knight can dispatch SEGs 1-4 immediately.
```

---

## ESTIMATED KNIGHT RUNTIME

- SEG-1 (edit): ~2 min
- SEG-2 (deploy): ~3-5 min
- SEG-3 (curl smoke): ~1 min
- SEG-4 (browser verify): ~5-8 min
- Frontend fix SEG: ~3 min

**Total: ~15-20 min post Founder gate.**
