# PATH X Diagnostic Summary · BP086

**Date:** 2026-06-18  
**Session:** BP086 · Knight (Sonnet 4.6)  
**Topology:** 4 LAN-adjacent (M0–M3) + 1 cross-WAN Son  
**Target model:** gemma4:12b (all peers)  
**Dispatch method:** MIC broadcast → mic_broadcasts Supabase table → peer listeners

---

## BLOCKER: MIC Listener Not Responding (I7 not acking)

**STATUS: STOPPED at Step 1 per instructions — 0 acks after 10 min.**

### Step 1 — noop_test

Two broadcasts were issued:

| Broadcast ID | Issued at (UTC) | Timeout | Result |
|---|---|---|---|
| `6c0d7f64-6974-49a7-82d8-15c1aaab76a3` | 21:31:01 | 60s watch | **0/5 acks** |
| `d0e82162-f720-43e2-a76b-c21a45e6e846` | 21:32:18 | 540s poll-until=5 | **0/5 acks** |

Total polling window: ~10 minutes (21:31:01 → 21:41:19 UTC).  
Both broadcasts received valid `broadcast_id` responses from the Edge Function — the Supabase `mic-broadcast` Edge Function is ALIVE and inserting rows.

**No peer acked at any point.** Not M0, not M1, not M2, not M3, not Son.

### Diagnosis

The Edge Function (`mic-broadcast`) is functioning (rows created, IDs returned). The failure is on the **peer-side listener** — the I7 MIC broadcast listener that polls `mic_broadcasts` and calls the 6 real handlers.

Likely causes:
1. **v0.5.7 auto-updater hasn't completed** — peers may still be on v0.5.6 which lacks the I7 broadcast listener loop entirely
2. **I7 listener polling interval too long** — if the listener polls every 60s, the 10-min window should still catch it; unlikely to be the sole cause
3. **MnemosyneC restart required** — auto-updater may have downloaded v0.5.7 but the process needs a manual restart to activate it (auto-restart may have failed or been skipped on some peers)
4. **Authentication gap** — the listener may not have the service role key and is failing silently before acking

### Steps Not Executed (STOPPED per protocol)

Per instructions: *"If 0 acks after 10 min: something is wrong with the listener — STOP and report the blocker. Do NOT proceed to model pull with a broken channel."*

The following steps were **not executed:**

| Step | Command | Status |
|---|---|---|
| Step 2 | config_set / ollama.model_pull gemma4:12b | NOT RUN |
| Step 3 | fleet_warmup gemma4:12b | NOT RUN |
| Step 4 | health_snapshot | NOT RUN |
| Step 5 | 70Q validate-relay.mjs | NOT RUN |

---

## Recommended Recovery Actions

1. **Verify v0.5.7 is actually running** on each peer: check MnemosyneC process version in system tray or log. If still on v0.5.6, restart MnemosyneC manually.

2. **Check I7 listener boot log** on M0/M1/M2/M3 — look for `[MIC]` or `broadcast-listener` startup messages. If absent, v0.5.7 update didn't activate.

3. **Manual restart** on each peer: close MnemosyneC, reopen — auto-updater should have already downloaded v0.5.7 binary; a manual restart is the fastest fix.

4. **Once 1+ peer is confirmed on v0.5.7**: re-issue noop_test. If that peer acks, proceed with the full PATH X sequence.

5. **Check Supabase `mic_broadcasts` table** directly: confirm rows have `status = 'pending'` and `broadcast_type = 'noop_test'` — this rules out an Edge Function routing issue.

---

## Interpretation

This run tests raw-Ollama ensemble routing via MIC broadcast, **NOT** the Plow+Substrate pipeline. The substrate pipeline produced 97.1% (68/70) on BP083. The PATH X diagnostic is intended to compare ensemble vs best-solo to verify cooperative routing adds signal.

No comparison data was generated because the channel gate (Step 1 noop_test) did not clear.

---

## Truth-Always Note

`canonical=false`. No relay routing data was collected. This summary documents a failed channel-open attempt, not a diagnostic result. Separate ratify gate required for THUNDERCLAP publication. Do not cite any scores from this session — none were generated.

---

*Written by Knight (Sonnet 4.6) · BP086 · 2026-06-18*
