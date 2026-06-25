# KNIGHT YOKE — RELAY SUPABASE CUSTOM DOMAIN ACTIVATE (BP085)
**Written:** 2026-06-17 · **Bishop:** BP085 Truth-Always correction
**Status:** FOUNDER_REVIEW — awaiting Founder DNS TXT confirmation before dispatch

---

## PREAMBLE — SONNET 4.6 MANDATE (BP084 HARD BINDING VERBATIM)

Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

---

## SCOPE

Complete Supabase custom-domain provisioning for `relay.lianabanyan.com`.

**Root cause (confirmed):** relay.lianabanyan.com was registered as a Supabase custom domain (state `2_initiated`) but is stuck at SSL `pending_validation` because the ACME TXT challenge record at `_acme-challenge.relay.lianabanyan.com` was never added in Squarespace DNS.

**Founder DNS action required BEFORE this yoke dispatches (see FOUNDER GATE below).**

Once TXT record is present and propagated, this yoke: reverifies SSL via Supabase CLI → activates the custom domain → live-verifies with curl.

**What Knight does NOT touch:**
- Squarespace DNS panel (Founder owns per Statute §4)
- Supabase Dashboard (Founder owns; CLI only in scope)
- No Cloudflare — Founder does not use Cloudflare (Statute §4)

---

## FOUNDER GATE — REQUIRED BEFORE ANY SEG DISPATCHES

**Knight MUST ask Founder explicitly before SEG-1 runs:**

> "Founder — before I dispatch SEG-1, please confirm:
> 1. You have added the TXT record `_acme-challenge.relay.lianabanyan.com` → value `JB1bXDALK1hSHP7SQzNGuO0FCNypjG_8TGnGR7fhSBY` in Squarespace DNS.
> 2. At least 5–30 minutes have elapsed since you saved the record.
>
> Reply YES to proceed. If you haven't added it yet, I will wait."
>
> DO NOT dispatch SEG-1 until Founder replies YES.

---

## SEG-1 · DNS PROPAGATION CHECK

**Model:** Sonnet 4.6
**Goal:** Confirm `_acme-challenge.relay.lianabanyan.com` TXT value is visible from Knight's machine before attempting reverify.

**Steps:**

```powershell
# Option A — PowerShell
Resolve-DnsName _acme-challenge.relay.lianabanyan.com -Type TXT

# Option B — nslookup fallback
nslookup -type=TXT _acme-challenge.relay.lianabanyan.com
```

**Expected TXT value to confirm:**
```
JB1bXDALK1hSHP7SQzNGuO0FCNypjG_8TGnGR7fhSBY
```

**Retry logic:**
- If TXT NOT visible: wait 5 minutes, retry. Repeat up to 6 times (30-minute ceiling).
- After 6 retries with no TXT: surface to Founder — "TXT not resolving after 30 min, please re-check Squarespace DNS panel for typos or propagation delay."
- Do NOT proceed to SEG-2 until TXT is confirmed present.

**Sharp-1:** TXT record `JB1bXDALK1hSHP7SQzNGuO0FCNypjG_8TGnGR7fhSBY` visible at `_acme-challenge.relay.lianabanyan.com`

---

## SEG-2 · REVERIFY + ACTIVATE VIA SUPABASE CLI

**Model:** Sonnet 4.6
**Goal:** Trigger Supabase SSL issuance now that TXT challenge is resolvable, then activate the custom domain.

**BP084 §4 BLOOD — NEVER echo/copy/show/pipe/log credential values. Subshell pattern only.**

### Step 2a — Reverify

```powershell
(Invoke-Expression "$(Select-String -Path 'C:\Users\Administrator\.claude\state\secrets\22May2026.env' -Pattern '^SUPABASE_ACCESS_TOKEN=' | ForEach-Object { $_.Line })"; npx supabase domains reverify --project-ref ruuxzilgmuwddcofqecc)
```

Or via bash subshell if PowerShell env injection proves awkward:

```bash
(eval "$(grep -E '^SUPABASE_ACCESS_TOKEN=' 'C:\Users\Administrator\.claude\state\secrets\22May2026.env')"; npx supabase domains reverify --project-ref ruuxzilgmuwddcofqecc)
```

**Expected:** SSL status returns `active` or `ssl_active` or similar GREEN indicator. If still `pending_validation`, TXT has not propagated from Supabase's resolver vantage — wait 5 min and retry reverify (up to 3 times). If still pending after 15 min additional, surface to Founder.

### Step 2b — Activate

```bash
(eval "$(grep -E '^SUPABASE_ACCESS_TOKEN=' 'C:\Users\Administrator\.claude\state\secrets\22May2026.env')"; npx supabase domains activate --project-ref ruuxzilgmuwddcofqecc)
```

### Step 2c — Confirm activation state

```bash
(eval "$(grep -E '^SUPABASE_ACCESS_TOKEN=' 'C:\Users\Administrator\.claude\state\secrets\22May2026.env')"; npx supabase domains get --project-ref ruuxzilgmuwddcofqecc)
```

**Expected output fields:**
- `status`: `active` or `5_active`
- `hostname_status`: `active`
- `ssl.status`: `active`

If any field is not active, record exact CLI output verbatim in yoke-return for Founder review. Truth-Always — honest errors, no partial-success framing.

**Sharp-2:** `supabase domains get` returns `status: active`, `hostname_status: active`, `ssl.status: active` for `relay.lianabanyan.com`

---

## SEG-3 · LIVE VERIFY WITH CURL

**Model:** Sonnet 4.6
**Goal:** Confirm `relay.lianabanyan.com` routes correctly to the Edge Function over HTTPS.

### Step 3a — POST to custom domain

```bash
curl -v -X POST https://relay.lianabanyan.com/functions/v1/wan-relay-publish \
  -H "Content-Type: application/json" \
  -d '{"type":"PeanutRoll","payload":{"test":true,"source":"smoke-test-SEG3"}}'
```

**Expected:** HTTP 400 with PeanutRoll-format error body (same error the fallback URL returns — proves routing reaches the Edge Function and PeanutRoll schema validation is working). A 400 here is GREEN; it means the custom domain is live and the function is executing.

**Not expected:** 502, 521, SSL error, NXDOMAIN, connection refused — any of those = routing not active, surface verbatim.

### Step 3b — Header check

Inspect verbose curl output for:
- `sb-project-ref: ruuxzilgmuwddcofqecc` (not `null`, not absent)
- `Content-Type: application/json`
- Valid TLS cert for `relay.lianabanyan.com`

### Step 3c — Smoke test script (if available)

```bash
node relay-smoke-test.mjs
```

If `relay-smoke-test.mjs` is not present in the working directory, skip this step and note it in yoke-return. Do NOT fabricate a pass.

**Expected if present:** exits 0 with primary relay working.

**Sharp-3:** curl POST to `https://relay.lianabanyan.com/functions/v1/wan-relay-publish` returns 400 PeanutRoll error with `sb-project-ref: ruuxzilgmuwddcofqecc` header present

---

## SHARPS RETURN TABLE

| # | Sharp | Condition | Status |
|---|-------|-----------|--------|
| 1 | TXT record propagated | `_acme-challenge.relay.lianabanyan.com` TXT = `JB1bXDALK1hSHP7SQzNGuO0FCNypjG_8TGnGR7fhSBY` | [ ] |
| 2 | Supabase domain active | `domains get` shows `status: active`, `hostname_status: active`, `ssl.status: active` | [ ] |
| 3 | Live curl verified | POST to custom domain returns 400 PeanutRoll error + `sb-project-ref` header correct | [ ] |

Yoke-return is GREEN only when all 3 Sharps checked. Any unchecked Sharp = partial — report exact failure state, never declare done.

---

## BLOOD STATUTES (apply to ALL SEGs)

- **BP084 §4 BLOOD:** NEVER echo · copy · show · pipe · log credential values from `22May2026.env`. Subshell scoping only. PATH is referable; contents are forbidden.
- **BP081 Sonnet 4.6 BLOOD:** NEVER Composer (any version). Yoke-return MUST report "Sonnet 4.6" verbatim.
- **Truth-Always:** If a step fails, report the exact error. No partial-success framing. No "probably worked."
- **Statute §4 DNS:** Knight does NOT touch Squarespace DNS. Founder owns that panel. Knight only calls CLI.

---

## ESTIMATED KNIGHT RUNTIME

After Founder confirms TXT added and propagation elapsed:
- SEG-1 DNS check: ~2–5 min (or up to 30 min if propagation is slow — polling automatic)
- SEG-2 Reverify + Activate: ~3–5 min
- SEG-3 Live verify: ~2–3 min
- **Total:** ~7–15 min (happy path after propagation complete)

---

## PASTE-READY KNIGHT WAKE

```
Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

Read yoke file in full before proceeding:
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_YOKE_RELAY_SUPABASE_ACTIVATE_BP085.md

FOUNDER GATE: Before dispatching SEG-1, ask Founder explicitly whether the TXT record _acme-challenge.relay.lianabanyan.com has been added in Squarespace and at least 5–30 min have elapsed. Do NOT proceed until Founder replies YES.

Goal: Complete Supabase custom domain activation for relay.lianabanyan.com — DNS check → reverify → activate → live curl verify. 3 Sharps. Return "Sonnet 4.6" verbatim.
```
