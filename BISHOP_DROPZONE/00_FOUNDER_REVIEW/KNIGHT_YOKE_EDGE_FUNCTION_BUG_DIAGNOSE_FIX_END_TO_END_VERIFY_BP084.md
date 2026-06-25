# KNIGHT YOKE · wan-relay-publish Edge Function Bug Fix + End-to-End Mesh Verify · BP084

**Session:** BP084
**Date:** 2026-06-16
**Founder ratify:** DIRECT — *"YES to THIS Best leverage: compose Knight yoke for Edge Function bug fix + end-to-end verification. While Knight has bandwidth, this is the empirical mesh-test you've been pointing at all afternoon."*

---

## 🩸 PREAMBLE — Sonnet 4.6 SEGs exclusively

**Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for substantive tasks. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.**

---

## Empirical findings from Bishop's autonomous smoke-test (Bishop ran psql + relay-smoke-test.mjs directly)

**🔴 BUG 1:** `wan-relay-publish` returns HTTP 202 with `{ok:true, sid:...}` but **NO row appears in peer_presence**. Verified via direct psql: `count(*) = 0`.

**🟡 BUG 2:** `relay.lianabanyan.com` custom domain network-errors. Fallback to `ruuxzilgmuwddcofqecc.supabase.co` works. Likely SSL cert provisioning still in window (Founder fixed TXT this morning).

**Live peer_presence schema (Bishop confirmed via `\d`):**
```
peer_id           text PRIMARY KEY
email_hash        text
wan_soccerball_id text
lan_addresses     text[]
relay_session_id  text
capabilities      jsonb
last_seen_at      timestamptz default now()
state             text default 'active' (CHECK active/quarantine/dropped)
```

**Suspected cause:** Edge Function likely tries to insert columns from the OTHER (substrate_awakens.sql) `peer_presence` schema definition (node_id, display_name, domain, current_q, total_q, accuracy, quarantined, eta, heartbeat_at) — those columns DO NOT EXIST in live production. Schema-conflict from two migrations defining peer_presence differently; FIRST migration won.

---

## SEG-1 — Read the Edge Function source (Sonnet 4.6 SEG)

**Path:** `platform/supabase/functions/wan-relay-publish/index.ts`

Catalog:
- What payload structure it expects from POST body
- What columns it tries to INSERT or UPSERT into peer_presence
- Whether it uses service-role key from environment
- Error handling — does it swallow DB errors silently? (Returning 202 even on DB failure would explain the observed behavior)

Return a structured diagnosis: *"Function inserts {col1, col2, col3, ...} — production schema has {col1, col2, ...}. Mismatch: {missing cols}. Silent error handling at line N."*

---

## SEG-2 — Fix the Edge Function (Sonnet 4.6 SEG)

Based on SEG-1's diagnosis, surgical fix:

**Option A — adapt the function to live schema:** rewrite the insert to use peer_id/email_hash/wan_soccerball_id/lan_addresses/relay_session_id/capabilities/last_seen_at columns. Map incoming payload fields to these column names. Preserve the function's purpose (publish peer presence for WAN routing).

**Option B — migrate peer_presence schema to include the missing columns:** add new ALTER TABLE migration that adds node_id/display_name/domain/current_q/total_q/accuracy/quarantined/eta/heartbeat_at columns. Then the function works as-written. This is HEAVIER (requires migration apply + RLS check), but composes with the Substrate Awakens dashboard that wants per-peer progress.

**Knight's call which is cleaner.** Likely Option A is faster; Option B is structurally cleaner if Substrate Awakens dashboard needs the per-peer-progress columns.

After fix:
- Add HONEST ERROR RETURN — function MUST return 500 on DB failure, not 202. The silent-swallow behavior is a Truth-Always anti-pattern.
- Add a `console.error` log on any DB failure for debuggability.

---

## SEG-3 — Deploy + re-run smoke test (Sonnet 4.6 SEG)

```
cd platform
npx supabase functions deploy wan-relay-publish
```

(If SUPABASE_ACCESS_TOKEN not in env: surface to Founder. Founder may need to add to 22May2026.env.)

Then re-run from M0:
```
node scripts/relay-smoke-test.mjs
```

**Acceptance:** EXIT 0 GREEN. Peer_presence row appears within 1.2s. Row contains expected fields. Test cleanup deletes the row.

**Bishop ran this empirically; Knight can rerun via direct exec OR via Bishop's autonomous psql.**

---

## SEG-4 — Verify relay.lianabanyan.com SSL (Sonnet 4.6 SEG)

Curl the custom domain:
```
curl -sI --max-time 10 https://relay.lianabanyan.com/functions/v1/wan-relay-publish
```

If still SSL-error: **NOT A BUG TO FIX.** Document as "awaiting Supabase SSL provisioning (24h window from TXT fix at ~07:30 PT today). Re-check in 12h. Until then, app uses fallback URL."

If SSL works now: confirm the custom domain returns the same response as fallback. Update any hardcoded URLs that should prefer custom domain.

---

## SEG-5 — Run the 3q M0 test with RENAMED 12-blade code (Sonnet 4.6 SEG)

Re-execute Knight's prior 3-question validation on M0 after the Psionic/Auditor/Sentinel rename pass (commit 0e352e1):
```
cd tools/plow-cli
node plow-cli-12blade.js validation_test_3q.json --model gemma4:12b --out validation_test_results_renamed.jsonl --telemetry validation_test_telemetry_renamed.json
```

**Acceptance:**
- All 12 blades fire (verify telemetry shows `Psionic`, `Auditor`, `Sentinel` for blades 10/11/12, not the old all-caps names)
- q1 CORRECT (Sentinel fires downstream)
- q2 QUARANTINED + Psionic spawns 3 consequence probes
- q3 CORRECT (Auditor finds FTL contradiction)
- Runtime ≤ 5 min on gemma4:12b
- Output eblets carry renamed blade names in `verified_by` fields

If rename broke any blade behavior, HONEST RED → diagnose → fix → re-run.

---

## SEG-6 — End-to-end install on M0 (Sonnet 4.6 SEG, contingent on SEG-3 GREEN)

Founder downloads + installs MnemosyneC v0.5.0 fresh on M0 (clean profile if possible: rename `%APPDATA%/mnemosynec/` to `mnemosynec_test/` first). Launches → Settings → Substrate Awakens panel → enters email + name → clicks "Send me my token."

Knight monitors via:
- substrate_awakens_registrations table for the new row (autonomous psql)
- Email delivery (Founder verifies)
- peer_presence row after Founder pastes token

**Acceptance:** Founder sees "Connected to live mesh as [display_name] · peer_id [xxx]" within 30s of token paste. Bishop verifies the peer_presence row.

(If Knight can't get Founder cooperation mid-yoke, mark SEG-6 as "pending Founder install" and yoke-return with the rest done.)

---

## SEG-7 — Truth-Always Sharps (Sonnet 4.6 SEG)

- Sharp 1: wan-relay-publish bug diagnosed
- Sharp 2: Fix applied; honest error handling in place
- Sharp 3: Deploy succeeded
- Sharp 4: relay-smoke-test.mjs exits 0 GREEN; peer_presence row appears + cleans up
- Sharp 5: relay.lianabanyan.com SSL status documented
- Sharp 6: 3q M0 test passes with all 12 blades + renamed telemetry tags
- Sharp 7: NO change to 68/70 canonical receipt
- Sharp 8: NO publish (BP078 BLOOD)
- Sharp 9: All output eblets at canonical Vault path (NOT the wrong BISHOP_DROPZONE path the earlier 12-blade run used)

---

## SEG-8 — Yoke-return + bedside read (Sonnet 4.6 SEG)

Standard return. Sharps with literal results. Bedside read: 1-paragraph for Founder summarizing what was wrong + what was fixed + what end-to-end now works. Send pearl.

---

## Bishop coordination note

Bishop can run psql autonomously and may parallel-verify SEG-3 + SEG-5 from the M0 side. If Founder pastes Knight's yoke-return showing GREEN, Bishop independently confirms by re-querying peer_presence post-fix.

**FOR THE KEEP.** Truth-Always empirical loop closed: smoke test → bug found → fix → re-run → GREEN.
