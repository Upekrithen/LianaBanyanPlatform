# PATH X Diagnostic Summary · BP087

**Session:** BP087  
**Date:** 2026-06-18 (UTC-5) / 2026-06-19T00:01:35Z (broadcast issued)  
**Issued-by:** knight-bp087  
**Sonnet 4.6 SEG**

---

## BLOCKER — STOPPED AT STEP 1 (noop_test)

Per PATH X protocol: "If 0 acks after 120s: STOP and report — do NOT proceed to model pull."

**Steps 2–7 not executed.**

---

## Step 1 — noop_test

| Field | Value |
|---|---|
| Broadcast ID | `47b9a7d6-6e43-4137-b0fa-05de875aff79` |
| Broadcast issued at | `2026-06-19T00:01:35.337985+00:00` |
| Version targeted | `0.5.8` |
| Poll duration | 120s (expired) |
| Acks received | **0 / 5** |
| Peer IDs that acked | none |
| Result | **BLOCKED — do not proceed** |

**Broadcast was fresh** (issued seconds before first poll at `00:01:40Z`). This rules out the 60s lookback window issue (v0.5.8 poll window vs relaunch delay) that H4 identified for the prior 0/5 failures — that issue only applies when a broadcast is >60s old at the moment a peer first polls.

### Candidate causes

1. **All 5 peers are currently offline or restarting.** If any peer restarted within the last 5 minutes AND the mic-broadcast Edge Function filters by version at query time (only delivering to peers that have recently checked in), a peer that restarted after `00:01:35Z` would miss this broadcast if it hasn't yet re-registered in `peer_presence`.
2. **Version filter mismatch.** If the edge function only delivers to peers whose `peer_presence.version` field = `0.5.8` exactly, and any peer has a different recorded version, it gets no broadcast.
3. **All 5 peers hit the 60s lookback on fresh restart at roughly the same time** (coincident restart window). If all 5 peers restarted after `00:01:35Z` (i.e., after broadcast issuance), the broadcast record exists but the peers' first poll would need to look back far enough. v0.5.8's 60s lookback would cover this since the broadcast was just issued.
4. **Supabase Edge Function outage or slow response.** The broadcast issued successfully (HTTP OK, broadcast_id returned), so the INSERT succeeded. But if the Edge Function has a bug in the delivery path to peers, acks may never reach the table.

### Recommended next diagnostic

```powershell
# Check what peers are in peer_presence right now:
# (Query via Supabase dashboard or psql)
# SELECT peer_id, version, last_seen_at FROM peer_presence ORDER BY last_seen_at DESC LIMIT 10;

# Re-issue noop_test WITHOUT --version filter to see if version filter is the cause:
node "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mic-broadcast\issue.mjs" --type=noop_test --issued-by=knight-bp087 --poll-until=3 --timeout-s=60
```

If the no-version broadcast also gets 0 acks → peers are offline.  
If the no-version broadcast gets ≥1 ack → version filter is blocking delivery.

---

## Steps 2–5 — NOT EXECUTED (blocked by Step 1 zero-ack)

| Step | Status |
|---|---|
| Step 2 — config_set / gemma4:12b pull | ⛔ NOT RUN |
| Step 3 — fleet_warmup | ⛔ NOT RUN |
| Step 4 — health_snapshot | ⛔ NOT RUN |
| Step 5 — 70Q diagnostic | ⛔ NOT RUN |

---

## Receipt

No 70Q receipt generated (run blocked before dispatch).

---

## H4 Note

Prior 0/5 ack failures (BP083–BP086 era) were caused by a 60s poll lookback window vs. 304s relaunch delay — peers restarted, then polled for broadcasts, but by the time they polled the broadcast was >60s old and fell outside their lookback window. Fixed in v0.5.9 (1-line change, `lookback_seconds: 300` or similar). This run uses v0.5.8. **However**, this broadcast was issued fresh (peers should have seen it within 10s of restart), so the 60s lookback window does NOT explain this failure. The cause is different.

---

## Receipt Label (for when run eventually completes)

When PATH X successfully completes, use this label:

> "5-peer HOMOGENEOUS gemma4:12b · 4 LAN-adjacent (M0-M3) + 1 cross-WAN Son via relay.lianabanyan.com · dispatched via wan-relay-route · raw-Ollama routing diagnostic · NOT a substrate proof · canonical=false"

---

## Truth-Always

Compare ensemble to BP083 single-node 97.1% (68/70) baseline. This run tests routing only, not the Plow+Substrate pipeline. The validate-relay.mjs receipt hardcodes `model_families: 'gemma4:12b (M0-M3) × qwen2.5:7b (Son) — CROSS-VENDOR HETEROGENEOUS'` — PATH X is HOMOGENEOUS (gemma4:12b on ALL 5 peers including Son, after the config_set pull). The receipt model_families field will need manual override in the PATH X summary when the run eventually completes.

---

**FOR THE KEEP.**
